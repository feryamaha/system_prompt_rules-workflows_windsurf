/**
 * Nemesis Code Validator
 * 
 * Validacao semantica de codigo via regex rapido.
 * Roda dentro do PreToolUse hook para bloquear violacoes ANTES da edicao.
 * 
 * Regras cobertas:
 * - typescript-typing-convention.md (any, tipos inline)
 * - ui-separation-convention.md (useState/useEffect em UI pura)
 * - design-system-convention.md (CSS inline)
 * - react-hooks-patterns-rules.md (hooks condicionais)
 */

import * as path from 'path';

interface CodeValidationResult {
  valid: boolean;
  reason?: string;
  rule?: string;
  suggestion?: string;
}

/**
 * Lista de arquivos UI com concessao (smart/hibrido autorizado)
 * Ref: ui-separation-convention.md - Secao 9
 */
const UI_EXCEPTIONS = [
  'Button.tsx',
  'Container.tsx',
  'InputPesquisaAjuda.tsx'
];

/**
 * Valida o conteudo de codigo proposto em uma operacao Edit/Write
 */
export function validateCodeContent(
  filePath: string,
  newString: string | undefined
): CodeValidationResult {
  if (!newString || !filePath) return { valid: true };

  const ext = path.extname(filePath);
  if (!['.ts', '.tsx'].includes(ext)) return { valid: true };

  const fileName = path.basename(filePath);
  const normalizedPath = filePath.replace(/\\/g, '/');

  // REGRA 1: Proibir "any" (typescript-typing-convention.md secao 7)
  const anyResult = checkAnyUsage(newString);
  if (!anyResult.valid) return anyResult;

  // REGRA 2: useState/useEffect em componentes UI puros (ui-separation-convention.md)
  const uiHooksResult = checkUIHooks(normalizedPath, fileName, newString);
  if (!uiHooksResult.valid) return uiHooksResult;

  // REGRA 3: type/interface inline em componentes reutilizaveis (typescript-typing-convention.md)
  const inlineTypeResult = checkInlineTypes(normalizedPath, fileName, newString);
  if (!inlineTypeResult.valid) return inlineTypeResult;

  // REGRA 4: CSS inline / style tags (design-system-convention.md)
  const cssInlineResult = checkCSSInline(newString);
  if (!cssInlineResult.valid) return cssInlineResult;

  return { valid: true };
}

/**
 * REGRA 1: Detecta uso de "any" em TypeScript
 * Ref: typescript-typing-convention.md - Secao 7
 * 
 * Patterns detectados:
 *   : any       (tipo explicito any)
 *   as any      (type assertion para any)
 *   <any>       (generic any)
 *   any[]       (array de any)
 *   any,        (any em lista de generics)
 *   any>        (any fechando generic)
 */
function checkAnyUsage(newString: string): CodeValidationResult {
  // Regex que captura usos reais de "any" como tipo
  // Exclui: company, many, anyway, etc. (palavras que contem "any")
  const anyPatterns = [
    /:\s*any\s*[;,)\]}>|&]/,     // : any; ou : any, ou : any) etc
    /:\s*any\s*$/m,               // : any no final da linha
    /\bas\s+any\b/,               // as any
    /<any\s*>/,                   // <any>
    /:\s*any\s*\[/,               // : any[
    /\bany\s*\|/,                 // any | (union com any)
    /\|\s*any\b/,                 // | any (union com any)
    /Record<[^,]*,\s*any\s*>/,   // Record<string, any>
    /:\s*any\b(?!\w)/,            // : any (nao seguido de letra)
  ];

  for (const pattern of anyPatterns) {
    if (pattern.test(newString)) {
      // Extrair a linha que contem o match para contexto
      const lines = newString.split('\n');
      const matchingLine = lines.find(line => pattern.test(line));
      const context = matchingLine ? matchingLine.trim().substring(0, 80) : '';

      return {
        valid: false,
        reason: `Uso de "any" detectado. Linha: "${context}"`,
        rule: '.windsurf/rules/typescript-typing-convention.md - Secao 7',
        suggestion: 'Use tipos explicitos, unknown, generics ou tipos existentes em src/types/'
      };
    }
  }

  return { valid: true };
}

/**
 * REGRA 2: Detecta useState/useEffect em componentes UI puros
 * Ref: ui-separation-convention.md - Secao 4.1
 * 
 * Componentes em src/components/ui/ devem ser puros (sem estado/efeitos)
 * Excecoes: Button.tsx, Container.tsx, InputPesquisaAjuda.tsx
 */
function checkUIHooks(
  normalizedPath: string,
  fileName: string,
  newString: string
): CodeValidationResult {
  const isUIComponent = /\/components\/ui\//.test(normalizedPath);
  const isException = UI_EXCEPTIONS.includes(fileName);

  if (!isUIComponent || isException) return { valid: true };

  // Detectar hooks de estado/efeito
  const hookPatterns = [
    { pattern: /\buseState\b/, name: 'useState' },
    { pattern: /\buseEffect\b/, name: 'useEffect' },
    { pattern: /\buseReducer\b/, name: 'useReducer' },
    { pattern: /\buseContext\b/, name: 'useContext' },
  ];

  for (const { pattern, name } of hookPatterns) {
    if (pattern.test(newString)) {
      return {
        valid: false,
        reason: `Hook "${name}" detectado em componente UI puro: ${fileName}`,
        rule: '.windsurf/rules/ui-separation-convention.md - Secao 4.1',
        suggestion: `Mova logica de estado para src/hooks/. Componentes em src/components/ui/ devem ser puros. Excecoes: ${UI_EXCEPTIONS.join(', ')}`
      };
    }
  }

  return { valid: true };
}

/**
 * REGRA 3: Detecta type/interface inline em componentes reutilizaveis
 * Ref: typescript-typing-convention.md - Secao 4
 * 
 * Componentes em src/components/ui/ e src/components/shared/ devem importar tipos
 * de src/types/, nao definir inline.
 * Excecoes: layout.tsx, page.tsx, componentes com concessao
 */
function checkInlineTypes(
  normalizedPath: string,
  fileName: string,
  newString: string
): CodeValidationResult {
  const isReusable = /\/components\/(ui|shared)\//.test(normalizedPath);
  const isEntrypoint = /^(layout|page)\.tsx$/.test(fileName);
  const isException = UI_EXCEPTIONS.includes(fileName);

  if (!isReusable || isEntrypoint || isException) return { valid: true };

  // Detectar definicao de type/interface (nao import type)
  // Deve capturar: export interface XProps, type X = ..., interface X
  // Deve ignorar: import type { X }, // interface comment
  const typeDefPatterns = [
    /^export\s+(interface|type)\s+\w+/m,
    /^(interface|type)\s+\w+/m,
  ];

  for (const pattern of typeDefPatterns) {
    if (pattern.test(newString)) {
      // Verificar se nao e um import type (falso positivo)
      const lines = newString.split('\n');
      const matchingLine = lines.find(line => pattern.test(line));
      if (matchingLine && /^\s*import\s/.test(matchingLine)) continue;

      return {
        valid: false,
        reason: `Definicao de tipo inline em componente reutilizavel: ${fileName}`,
        rule: '.windsurf/rules/typescript-typing-convention.md - Secao 4',
        suggestion: 'Mova tipos para src/types/. Use import type { ... } no componente.'
      };
    }
  }

  return { valid: true };
}

/**
 * REGRA 4: Detecta CSS inline e style tags
 * Ref: design-system-convention.md - Secao 5
 * 
 * Toda estilizacao deve usar classes Tailwind via tailwind.config.ts.
 * CSS inline, style tags e estilos manuais sao proibidos.
 */
function checkCSSInline(newString: string): CodeValidationResult {
  const cssPatterns = [
    { pattern: /\bstyle\s*=\s*\{\{/, name: 'CSS inline (style={{...}})' },
    { pattern: /<style[\s>]/, name: 'Tag <style>' },
    { pattern: /<style\s+jsx/, name: 'styled-jsx' },
  ];

  for (const { pattern, name } of cssPatterns) {
    if (pattern.test(newString)) {
      return {
        valid: false,
        reason: `${name} detectado. Proibido por design-system-convention.md`,
        rule: '.windsurf/rules/design-system-convention.md - Secao 5',
        suggestion: 'Use classes Tailwind definidas no tailwind.config.ts. CSS manual e proibido.'
      };
    }
  }

  return { valid: true };
}
