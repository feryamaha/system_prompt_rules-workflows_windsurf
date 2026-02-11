#!/usr/bin/env node
/**
 * Nemesis CLI - Scope Manager
 * 
 * Gerencia o escopo de arquivos autorizados para edicao.
 * O escopo e definido pelo HUMANO e validado pelo PreToolUse hook automaticamente.
 * 
 * Comandos:
 *   yarn nemesis:scope set <file1> [file2] ...   Define escopo com arquivos especificos
 *   yarn nemesis:scope add <file>                 Adiciona arquivo ao escopo existente
 *   yarn nemesis:scope add-pattern <glob>         Adiciona pattern glob ao escopo
 *   yarn nemesis:scope from-rag <rag-file>        Extrai arquivos do prompt RAG
 *   yarn nemesis:scope show                       Mostra escopo atual
 *   yarn nemesis:scope clear                      Remove escopo (modo aberto)
 */

import * as fs from 'fs';
import * as path from 'path';

interface ScopeConfig {
  task?: string;
  rag_reference?: string;
  allowed_files?: string[];
  allowed_patterns?: string[];
  blocked_files?: string[];
  created_at?: string;
}

const SCOPE_DIR = path.join(process.cwd(), '.nemesis');
const SCOPE_FILE = path.join(SCOPE_DIR, 'scope.json');

function ensureDir(): void {
  if (!fs.existsSync(SCOPE_DIR)) {
    fs.mkdirSync(SCOPE_DIR, { recursive: true });
  }
}

function readScope(): ScopeConfig {
  if (!fs.existsSync(SCOPE_FILE)) {
    return {
      allowed_files: [],
      allowed_patterns: [],
      blocked_files: [],
      created_at: new Date().toISOString()
    };
  }
  try {
    return JSON.parse(fs.readFileSync(SCOPE_FILE, 'utf-8'));
  } catch {
    return {
      allowed_files: [],
      allowed_patterns: [],
      blocked_files: [],
      created_at: new Date().toISOString()
    };
  }
}

function writeScope(scope: ScopeConfig): void {
  ensureDir();
  fs.writeFileSync(SCOPE_FILE, JSON.stringify(scope, null, 2), 'utf-8');
}

function normalizeFilePath(filePath: string): string {
  return filePath.replace(/\\/g, '/').replace(/^\.\//, '');
}

/**
 * Extrai referencias de arquivo (@file.tsx) de um prompt RAG
 */
function extractFilesFromRAG(ragContent: string): string[] {
  const files: Set<string> = new Set();

  // Pattern 1: @src/path/to/file.tsx ou @[src/path/to/file.tsx]
  const atMentions = ragContent.matchAll(/@\[?([^\s\]]+\.(tsx?|jsx?|css|json|md))\]?/g);
  for (const match of atMentions) {
    files.add(normalizeFilePath(match[1]));
  }

  // Pattern 2: Arquivo mencionado em bullets: - src/path/to/file.tsx
  const bulletFiles = ragContent.matchAll(/[-*]\s+(src\/[^\s]+\.(tsx?|jsx?|css|json))/g);
  for (const match of bulletFiles) {
    files.add(normalizeFilePath(match[1]));
  }

  // Pattern 3: Arquivo entre backticks: `src/path/to/file.tsx`
  const backtickFiles = ragContent.matchAll(/`(src\/[^`]+\.(tsx?|jsx?|css|json))`/g);
  for (const match of backtickFiles) {
    files.add(normalizeFilePath(match[1]));
  }

  // Filtrar arquivos de regras e workflows (nao sao editaveis)
  return Array.from(files).filter(f => 
    !f.startsWith('.windsurf/') && 
    !f.startsWith('Feature-Documentation/') &&
    !f.startsWith('.nemesis/')
  );
}

// --- Comandos ---

function cmdSet(files: string[]): void {
  if (files.length === 0) {
    console.error('Erro: Forneca pelo menos um arquivo.');
    console.error('Uso: yarn nemesis:scope set <file1> [file2] ...');
    process.exit(1);
  }

  const scope: ScopeConfig = {
    allowed_files: files.map(normalizeFilePath),
    allowed_patterns: [],
    blocked_files: [],
    created_at: new Date().toISOString()
  };

  writeScope(scope);
  console.log(`Escopo definido com ${files.length} arquivo(s):`);
  scope.allowed_files!.forEach(f => console.log(`  + ${f}`));
}

function cmdAdd(file: string): void {
  const scope = readScope();
  if (!scope.allowed_files) scope.allowed_files = [];

  const normalized = normalizeFilePath(file);
  if (!scope.allowed_files.includes(normalized)) {
    scope.allowed_files.push(normalized);
  }

  writeScope(scope);
  console.log(`Arquivo adicionado ao escopo: ${normalized}`);
  console.log(`Total de arquivos no escopo: ${scope.allowed_files.length}`);
}

function cmdAddPattern(pattern: string): void {
  const scope = readScope();
  if (!scope.allowed_patterns) scope.allowed_patterns = [];

  const normalized = normalizeFilePath(pattern);
  if (!scope.allowed_patterns.includes(normalized)) {
    scope.allowed_patterns.push(normalized);
  }

  writeScope(scope);
  console.log(`Pattern adicionado ao escopo: ${normalized}`);
}

function cmdFromRag(ragFile: string): void {
  if (!fs.existsSync(ragFile)) {
    console.error(`Erro: Arquivo RAG nao encontrado: ${ragFile}`);
    process.exit(1);
  }

  const ragContent = fs.readFileSync(ragFile, 'utf-8');
  const files = extractFilesFromRAG(ragContent);

  if (files.length === 0) {
    console.warn('Nenhum arquivo de codigo encontrado no RAG.');
    console.warn('O escopo sera criado vazio (modo aberto).');
  }

  const scope: ScopeConfig = {
    task: 'Extraido do RAG',
    rag_reference: normalizeFilePath(ragFile),
    allowed_files: files,
    allowed_patterns: [
      'src/types/**/*.types.ts',
      'src/hooks/**/*.hook.ts'
    ],
    blocked_files: [],
    created_at: new Date().toISOString()
  };

  writeScope(scope);
  console.log(`Escopo extraido do RAG: ${ragFile}`);
  console.log(`Arquivos encontrados (${files.length}):`);
  files.forEach(f => console.log(`  + ${f}`));
  console.log(`\nPatterns padrao adicionados:`);
  scope.allowed_patterns!.forEach(p => console.log(`  + ${p}`));
  console.log(`\nEscopo salvo em: .nemesis/scope.json`);
}

function cmdShow(): void {
  if (!fs.existsSync(SCOPE_FILE)) {
    console.log('Nenhum escopo ativo (modo aberto - todos os arquivos permitidos).');
    return;
  }

  const scope = readScope();
  console.log('=== Escopo Nemesis Ativo ===\n');

  if (scope.task) console.log(`Tarefa: ${scope.task}`);
  if (scope.rag_reference) console.log(`RAG: ${scope.rag_reference}`);
  if (scope.created_at) console.log(`Criado em: ${scope.created_at}`);

  console.log('\nArquivos permitidos:');
  if (scope.allowed_files && scope.allowed_files.length > 0) {
    scope.allowed_files.forEach(f => console.log(`  + ${f}`));
  } else {
    console.log('  (nenhum - modo aberto)');
  }

  if (scope.allowed_patterns && scope.allowed_patterns.length > 0) {
    console.log('\nPatterns permitidos:');
    scope.allowed_patterns.forEach(p => console.log(`  + ${p}`));
  }

  if (scope.blocked_files && scope.blocked_files.length > 0) {
    console.log('\nArquivos bloqueados:');
    scope.blocked_files.forEach(f => console.log(`  - ${f}`));
  }
}

function cmdClear(): void {
  if (fs.existsSync(SCOPE_FILE)) {
    fs.unlinkSync(SCOPE_FILE);
    console.log('Escopo removido. Modo aberto (todos os arquivos permitidos).');
  } else {
    console.log('Nenhum escopo ativo para remover.');
  }
}

function showHelp(): void {
  console.log(`
Nemesis Scope Manager - Controle de escopo de edicao

Comandos:
  yarn nemesis:scope set <file1> [file2] ...   Define escopo com arquivos especificos
  yarn nemesis:scope add <file>                 Adiciona arquivo ao escopo existente
  yarn nemesis:scope add-pattern <glob>         Adiciona pattern glob ao escopo
  yarn nemesis:scope from-rag <rag-file>        Extrai arquivos do prompt RAG automaticamente
  yarn nemesis:scope show                       Mostra escopo atual
  yarn nemesis:scope clear                      Remove escopo (modo aberto)

Exemplos:
  yarn nemesis:scope set "src/components/ui/Button.tsx"
  yarn nemesis:scope add "src/types/ui/button.types.ts"
  yarn nemesis:scope add-pattern "src/hooks/**/*.hook.ts"
  yarn nemesis:scope from-rag "Feature-Documentation/prompts/032_descricao.md"
  yarn nemesis:scope show
  yarn nemesis:scope clear

Funcionamento:
  - O escopo define quais arquivos a IA pode editar
  - O PreToolUse hook valida automaticamente cada Edit/Write
  - Sem escopo ativo = modo aberto (permite tudo)
  - Com escopo ativo = apenas arquivos listados sao permitidos
`);
}

// --- Main ---

const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'set':
    cmdSet(args.slice(1));
    break;
  case 'add':
    if (!args[1]) {
      console.error('Erro: Forneca o arquivo para adicionar.');
      process.exit(1);
    }
    cmdAdd(args[1]);
    break;
  case 'add-pattern':
    if (!args[1]) {
      console.error('Erro: Forneca o pattern para adicionar.');
      process.exit(1);
    }
    cmdAddPattern(args[1]);
    break;
  case 'from-rag':
    if (!args[1]) {
      console.error('Erro: Forneca o caminho do arquivo RAG.');
      process.exit(1);
    }
    cmdFromRag(args[1]);
    break;
  case 'show':
    cmdShow();
    break;
  case 'clear':
    cmdClear();
    break;
  default:
    showHelp();
    process.exit(command ? 1 : 0);
}
