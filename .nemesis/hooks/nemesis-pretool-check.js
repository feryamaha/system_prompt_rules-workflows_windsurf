#!/usr/bin/env node
/**
 * Nemesis PreToolUse Hook - Entry Point Universal (Cross-Platform)
 * 
 * Funciona em Windows (PowerShell), MacOS (zsh/bash) e Linux (bash).
 * Recebe JSON via stdin do Windsurf, delega para pretool-hook.ts via tsx.
 * Retorna exit code 0 (permitir) ou 2 (bloquear).
 * 
 * FAIL-CLOSED: Erros internos resultam em exit 2 (bloquear).
 * Isso garante que falhas no hook NAO permitam violacoes silenciosas.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// ============================================================
// RESOLUCAO AUTOMATICA DE PATH - COM SUPORTE MULTI-AMBIENTE
// Procura pretool-hook.ts em multiplas localizacoes possiveis
// para funcionar tanto no repo original (src/) quanto em
// projetos que instalam o Nemesis via pacote (.nemesis/)
// AGORA COM DETECCAO DE AMBIENTE E ADAPTACAO DE GERENCIADOR
// ============================================================
const projectRoot = path.join(__dirname, '..', '..');

// Detectar ambiente antes de procurar o hook
function detectEnvironment() {
  const os = process.platform;
  const hasYarnLock = fs.existsSync(path.join(projectRoot, 'yarn.lock'));
  const hasBunLock = fs.existsSync(path.join(projectRoot, 'bun.lockb'));
  const hasNpmLock = fs.existsSync(path.join(projectRoot, 'package-lock.json'));
  
  let packageManager = 'unknown';
  if (hasYarnLock) packageManager = 'yarn';
  else if (hasBunLock) packageManager = 'bun';
  else if (hasNpmLock) packageManager = 'npm';
  
  return { os, packageManager };
}

const { os, packageManager } = detectEnvironment();

console.log(`🔍 Nemesis v2 - Ambiente detectado: ${os} / ${packageManager}`);

const possiblePaths = [
  // Localizacao 1: Repo original (src/workflow-enforcement/)
  path.join(projectRoot, 'src', 'workflow-enforcement', 'cli', 'pretool-hook.ts'),
  // Localizacao 2: Instalacao via pacote (.nemesis/workflow-enforcement/)
  path.join(projectRoot, '.nemesis', 'workflow-enforcement', 'cli', 'pretool-hook.ts'),
  // Localizacao 3: Relativo ao proprio .nemesis/hooks/
  path.join(__dirname, '..', 'workflow-enforcement', 'cli', 'pretool-hook.ts'),
  // NOVO: Localizacao 4: Modulo compilado em dist/
  path.join(projectRoot, 'dist', 'workflow-enforcement', 'cli', 'pretool-hook.js'),
];

let hookPath = null;
for (const candidate of possiblePaths) {
  if (fs.existsSync(candidate)) {
    hookPath = candidate;
    break;
  }
}

if (!hookPath) {
  process.stderr.write('\n========================================\n');
  process.stderr.write('NEMESIS BLOCKED: Hook nao encontrado\n');
  process.stderr.write('========================================\n');
  process.stderr.write('[FAIL-CLOSED] pretool-hook.ts nao encontrado em nenhuma localizacao:\n');
  possiblePaths.forEach(p => process.stderr.write('  - ' + p + '\n'));
  process.stderr.write('\nVerifique a instalacao do Nemesis Enforcement Engine.\n');
  process.exit(2);
}

// Ler stdin (JSON do Windsurf)
let input = '';
try {
  input = fs.readFileSync(0, 'utf-8');
} catch (err) {
  // stdin vazio ou erro de leitura
  // FAIL-CLOSED: sem input = bloquear (hook nao pode validar sem dados)
  process.stderr.write('[NEMESIS BLOCKED] Erro ao ler stdin: ' + (err.message || 'desconhecido') + '\n');
  process.exit(2);
}

if (!input || !input.trim()) {
  process.stderr.write('[NEMESIS BLOCKED] Nenhum input recebido via stdin\n');
  process.exit(2);
}

try {
  // Executar o hook TypeScript via npx tsx
  execSync(`npx tsx "${hookPath}"`, {
    input: input,
    cwd: process.cwd(),
    stdio: ['pipe', 'pipe', 'pipe'],
    timeout: 10000,
    env: { ...process.env, FORCE_COLOR: '0' }
  });

  // Hook retornou exit code 0 - permitir
  process.exit(0);

} catch (error) {
  const exitCode = error.status || 0;
  const stderrOutput = error.stderr ? error.stderr.toString() : '';

  // Detectar bloqueio via exit code OU conteudo do stderr
  // (npx tsx pode alterar o exit code em algumas plataformas)
  const isBlocked = exitCode === 2 || stderrOutput.includes('NEMESIS BLOCKED');

  if (isBlocked) {
    // Propagar stderr do hook (mensagem de bloqueio)
    if (stderrOutput) {
      process.stderr.write(stderrOutput);
    }
    process.exit(2);
  }

  // FAIL-CLOSED: Erros internos do hook BLOQUEIAM a operacao
  // Isso impede que bugs no hook permitam violacoes silenciosas
  // (correcao do bug que permitiu 6 operacoes com violacoes no teste SuperCard)
  process.stderr.write('\n========================================\n');
  process.stderr.write('NEMESIS BLOCKED: Erro interno no hook\n');
  process.stderr.write('========================================\n');
  if (stderrOutput) {
    process.stderr.write('[Detalhes]: ' + stderrOutput.substring(0, 500) + '\n');
  }
  process.stderr.write('[FAIL-CLOSED] Operacao bloqueada por seguranca.\n');
  process.stderr.write('Corrija o erro no Nemesis antes de prosseguir.\n');
  process.exit(2);
}
