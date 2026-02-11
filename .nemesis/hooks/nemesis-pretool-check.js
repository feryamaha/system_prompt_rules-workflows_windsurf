#!/usr/bin/env node
/**
 * Nemesis PreToolUse Hook - Entry Point Universal (Cross-Platform)
 * 
 * Funciona em Windows (PowerShell), MacOS (zsh/bash) e Linux (bash).
 * Recebe JSON via stdin do Windsurf, delega para pretool-hook.ts via tsx.
 * Retorna exit code 0 (permitir) ou 2 (bloquear).
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Caminho para o hook TypeScript principal
const hookPath = path.join(__dirname, '..', '..', 'src', 'workflow-enforcement', 'cli', 'pretool-hook.ts');

// Ler stdin (JSON do Windsurf)
let input = '';
try {
  input = fs.readFileSync(0, 'utf-8');
} catch (err) {
  // stdin vazio ou erro de leitura - permitir execucao
  process.exit(0);
}

if (!input || !input.trim()) {
  process.stderr.write('[NEMESIS] Nenhum input recebido via stdin\n');
  process.exit(0);
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

  // Exit code 1 ou outro sem NEMESIS BLOCKED = erro interno do hook
  // Em caso de erro interno, NAO bloquear (fail-open)
  // para nao travar o desenvolvimento por bug no hook
  if (stderrOutput) {
    process.stderr.write('[NEMESIS WARNING] Erro interno no hook: ' + stderrOutput.substring(0, 300) + '\n');
  }
  process.exit(0);
}
