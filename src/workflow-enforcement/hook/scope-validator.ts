/**
 * Nemesis Scope Validator
 * 
 * Valida se um arquivo esta dentro do escopo autorizado pelo RAG.
 * O escopo e definido pelo HUMANO via CLI (yarn nemesis:scope).
 * O hook valida automaticamente cada Edit/Write contra o escopo.
 * 
 * Se nao existir scope.json, o modo e "aberto" (permite tudo).
 * Se existir scope.json, apenas arquivos listados sao permitidos.
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

interface ScopeValidationResult {
  valid: boolean;
  reason?: string;
  rule?: string;
  suggestion?: string;
}

/**
 * Caminho padrao do arquivo de escopo
 */
function getScopePath(): string {
  return path.join(process.cwd(), '.nemesis', 'scope.json');
}

/**
 * Verifica se existe um escopo ativo
 */
export function hasScopeActive(): boolean {
  return fs.existsSync(getScopePath());
}

/**
 * Le o escopo atual
 */
export function readScope(): ScopeConfig | null {
  const scopePath = getScopePath();
  if (!fs.existsSync(scopePath)) return null;

  try {
    const content = fs.readFileSync(scopePath, 'utf-8');
    return JSON.parse(content) as ScopeConfig;
  } catch {
    return null;
  }
}

/**
 * Valida se um arquivo esta dentro do escopo autorizado
 */
export function validateFileScope(filePath: string): ScopeValidationResult {
  const scope = readScope();

  // Sem scope = modo aberto (permite tudo)
  if (!scope) return { valid: true };

  // Normalizar o path para comparacao
  const absolutePath = path.resolve(filePath);
  const cwd = process.cwd();
  const relativePath = path.relative(cwd, absolutePath).replace(/\\/g, '/');

  // Verificar blocked_files primeiro (prioridade maxima)
  if (scope.blocked_files && scope.blocked_files.length > 0) {
    for (const blocked of scope.blocked_files) {
      const normalizedBlocked = blocked.replace(/\\/g, '/');
      if (relativePath === normalizedBlocked || relativePath.endsWith(normalizedBlocked)) {
        return {
          valid: false,
          reason: `Arquivo explicitamente bloqueado pelo escopo: ${relativePath}`,
          rule: '.nemesis/scope.json - blocked_files',
          suggestion: 'Este arquivo foi bloqueado pelo usuario. Use yarn nemesis:scope para modificar.'
        };
      }
    }
  }

  // Se nao ha allowed_files nem allowed_patterns, modo aberto
  const hasAllowedFiles = scope.allowed_files && scope.allowed_files.length > 0;
  const hasAllowedPatterns = scope.allowed_patterns && scope.allowed_patterns.length > 0;

  if (!hasAllowedFiles && !hasAllowedPatterns) return { valid: true };

  // Verificar allowed_files (match exato ou por sufixo)
  if (hasAllowedFiles) {
    for (const allowed of scope.allowed_files!) {
      const normalizedAllowed = allowed.replace(/\\/g, '/');
      if (relativePath === normalizedAllowed || relativePath.endsWith(normalizedAllowed)) {
        return { valid: true };
      }
    }
  }

  // Verificar allowed_patterns (glob simples)
  if (hasAllowedPatterns) {
    for (const pattern of scope.allowed_patterns!) {
      if (matchGlob(relativePath, pattern)) {
        return { valid: true };
      }
    }
  }

  // Arquivo nao esta no escopo
  const allowedList = scope.allowed_files?.join(', ') || 'nenhum especificado';
  return {
    valid: false,
    reason: `Arquivo fora do escopo autorizado: ${relativePath}`,
    rule: '.nemesis/scope.json - Escopo definido pelo RAG',
    suggestion: `Arquivos permitidos: ${allowedList}. Use yarn nemesis:scope add "${relativePath}" para autorizar.`
  };
}

/**
 * Glob matching simples (sem dependencia externa)
 * Suporta: *, **, ?
 * 
 * Exemplos:
 *   src/types/*.types.ts  ->  match src/types/ui.types.ts
 *   src/hooks/**\/*.hook.ts  ->  match src/hooks/deep/nested/use.hook.ts
 *   src/components/ui/*.tsx  ->  match src/components/ui/Button.tsx
 */
function matchGlob(filePath: string, pattern: string): boolean {
  // Normalizar
  const normalizedPattern = pattern.replace(/\\/g, '/');
  const normalizedPath = filePath.replace(/\\/g, '/');

  // Converter glob para regex
  let regexStr = normalizedPattern
    // Escapar caracteres especiais de regex (exceto * e ?)
    .replace(/[.+^${}()|[\]]/g, '\\$&')
    // ** = qualquer coisa incluindo /
    .replace(/\\\*\\\*/g, '___DOUBLESTAR___')
    // * = qualquer coisa exceto /
    .replace(/\\\*/g, '[^/]*')
    // ? = qualquer caractere exceto /
    .replace(/\\\?/g, '[^/]')
    // Restaurar **
    .replace(/___DOUBLESTAR___/g, '.*');

  // Adicionar anchors
  regexStr = `^${regexStr}$`;

  try {
    const regex = new RegExp(regexStr);
    return regex.test(normalizedPath);
  } catch {
    return false;
  }
}
