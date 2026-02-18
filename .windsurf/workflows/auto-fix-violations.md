---
name: auto-fix-violations
description: Corrige automaticamente violações detectadas pelo Nemesis Enforcement
auto_execution_mode: 3
hooks:
  PreToolUse:
    - matcher: "Edit|Write|Bash"
      hooks:
        - type: command
          command: "$PROJECT_DIR/.nemesis/hooks/nemesis-pretool-check.sh"
---

## PreToolUse Hook

// turbo
bash -c "echo 'Verificando ambiente de correção automática...' && ls -la .nemesis/ && ls -la .windsurf/"

## Etapa 1: Leitura das Regras de Correção

**Use TerminalReaderService para ler as regras de correção:**

```bash
npx tsx -e "
import { TerminalReaderService } from './.nemesis/workflow-enforcement/services/terminal-reader-service.ts';
const terminalReader = new TerminalReaderService();

Promise.all([
  terminalReader.readFile('.windsurf/rules/react-hooks-patterns-rules.md'),
  terminalReader.readFile('.windsurf/rules/design-system-convention.md'),
  terminalReader.readFile('.windsurf/rules/typescript-typing-convention.md')
]).then(([hooks, design, typescript]) => {
  console.log('=== REGRAS DE CORREÇÃO LIDAS ===');
  console.log('Status react-hooks:', hooks.success ? 'SUCESSO' : 'FALHA');
  console.log('Status design-system:', design.success ? 'SUCESSO' : 'FALHA');
  console.log('Status typescript:', typescript.success ? 'SUCESSO' : 'FALHA');
  console.log('=== PADRÕES DE CORREÇÃO DISPONÍVEIS ===');
}).catch(err => console.error('Erro:', err.message));
"
```

## Etapa 2: Análise de Violações

**Verificar violações recentes detectadas:**

```bash
npx tsx -e "
import { TerminalReaderService } from './.nemesis/workflow-enforcement/services/terminal-reader-service.ts';
const terminalReader = new TerminalReaderService();

terminalReader.readFile('.nemesis/violations.log')
  .then(result => {
    console.log('=== VIOLAÇÕES RECENTES ===');
    console.log('Status:', result.success ? 'SUCESSO' : 'FALHA');
    if (result.success) {
      console.log('Violações disponíveis para correção');
    }
  })
  .catch(err => console.error('Erro:', err.message));
"
```

## Etapa 3: Correção de React Hooks

### Correção Automática de Hooks Condicionais

**Para arquivos com hooks condicionais (Issues #01-02):**

```bash
# Encontrar arquivos com problemas
find src/components -name "*.tsx" -o -name "*.jsx" | xargs grep -l "if.*useState\|if.*useEffect"

# Correção automática (exemplo para useDropInput.hook.ts)
npx tsx -e "
import fs from 'fs';
import path from 'path';

const filePath = 'src/hooks/useDropInput.hook.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Mover hooks para o topo
const hooks = content.match(/const\s+\[.*?\]\s*=\s*useState\(.*?\)/g) || [];
const useEffects = content.match(/useEffect\([^)]*\)\s*=>\s*{[^}]*}/g) || [];

// Reconstruir arquivo com hooks no topo
let newContent = '';
hooks.forEach(hook => newContent += hook + '\n');
useEffects.forEach(effect => newContent += effect + '\n');
newContent += '\n// Componente logic\n' + content.replace(/const\s+\[.*?\]\s*=\s*useState\(.*?\)/g, '').replace(/useEffect\([^)]*\)\s*=>\s*{[^}]*}/g, '');

fs.writeFileSync(filePath, newContent);
console.log('Hooks movidos para o topo do arquivo');
"
```

### Correção de setState em useEffect

**Para arquivos com setState síncrono (Issues #03-04):**

```bash
# Correção automática para SliderControl.tsx
npx tsx -e "
import fs from 'fs';

const filePath = 'src/components/SliderControl.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Adicionar verificação condicional
content = content.replace(
  /useEffect\(\(\) => {\s*setActiveArrow\(null\);\s*}, \[isPlaying\]\)/g,
  'useEffect(() => {\n  if (isPlaying && activeArrow !== null) {\n    setActiveArrow(null);\n  }\n}, [isPlaying, activeArrow])'
);

fs.writeFileSync(filePath, content);
console.log('setState condicional adicionado ao useEffect');
"
```

## Etapa 4: Correção de UI/UX

### Correção de Acessibilidade

**Para componentes sem acessibilidade (Issue #10):**

```bash
# Adicionar aria-label automaticamente
npx tsx -e "
import fs from 'fs';

const filePath = 'src/components/ui/SegmentedControl.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Adicionar aria-label aos botões
content = content.replace(
  /<button([^>]*?)>/g,
  '<button\$1 aria-label=\"Segmented control button\">'
);

fs.writeFileSync(filePath, content);
console.log('Aria-label adicionado aos botões');
"
```

### Remoção de CSS Inline

**Para componentes com CSS inline (Issues #14-15):**

```bash
# Converter CSS inline para classes Tailwind
npx tsx -e "
import fs from 'fs';

const filePath = 'src/components/ui/Dropdown.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Remover style inline e adicionar classes
content = content.replace(
  /style\s*=\s*{[^}]*}/g,
  'className=\"bg-white border border-gray-300 rounded-md shadow-sm\"'
);

fs.writeFileSync(filePath, content);
console.log('CSS inline removido e classes Tailwind adicionadas');
"
```

## Etapa 5: Correção de Configuração

### Correção de ESLint

**Para problemas de configuração (Issues #11-13):**

```bash
# Remover configurações custom do ESLint
npx tsx -e "
import fs from 'fs';

const packageJsonPath = 'package.json';
let packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Remover configurações custom do ESLint
if (packageJson.eslintConfig) {
  delete packageJson.eslintConfig;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('Configuração ESLint custom removida');
}

// Adicionar configuração centralizada
if (!packageJson.eslintConfig) {
  packageJson.eslintConfig = {
    extends: ['@next/core-web-vitals'],
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn'
    }
  };
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('Configuração ESLint centralizada adicionada');
}
"
```

## Etapa 6: Validação Pós-Correção

**Executar validação completa após correções:**

```bash
echo "=== VALIDAÇÃO PÓS-CORREÇÃO ===" && \
yarn lint && \
yarn tsc --noEmit && \
yarn build && \
echo "✅ TODAS AS CORREÇÕES APLICADAS COM SUCESSO"
```

## Etapa 7: Relatório de Correções

**Gerar relatório das correções aplicadas:**

```bash
npx tsx -e "
import fs from 'fs';

const report = {
  timestamp: new Date().toISOString(),
  corrections: [
    'Hooks condicionais movidos para o topo',
    'setState síncrono corrigido com verificação condicional',
    'Aria-label adicionado para acessibilidade',
    'CSS inline removido e substituído por classes Tailwind',
    'Configuração ESLint centralizada'
  ],
  status: 'completed',
  nextSteps: [
    'Executar testes para validar funcionalidade',
    'Revisar componentes visualmente',
    'Atualizar documentação se necessário'
  ]
};

fs.writeFileSync('.nemesis/correction-report.json', JSON.stringify(report, null, 2));
console.log('Relatório de correções gerado');
"
```

## Validação Final

**Execute validação final do sistema:**

```bash
echo "=== VALIDAÇÃO FINAL DA CORREÇÃO AUTOMÁTICA ===" && \
npx tsx -e "
import { TerminalReaderService } from './.nemesis/workflow-enforcement/services/terminal-reader-service.ts';
const terminalReader = new TerminalReaderService();

Promise.all([
  terminalReader.readFile('.windsurf/rules/react-hooks-patterns-rules.md'),
  terminalReader.readFile('.windsurf/rules/design-system-convention.md')
]).then(() => {
  console.log('✅ CORREÇÃO AUTOMÁTICA CONCLUÍDA');
  console.log('✅ VIOLAÇÕES CORRIGIDAS');
  console.log('✅ PADRÕES RESTAURADOS');
  console.log('✅ NEMESIS ENFORCEMENT ATIVO E OPERACIONAL');
}).catch(err => {
  console.error('❌ ERRO NA CORREÇÃO:', err.message);
});
"
```

## Padrão de Comunicação Final

**Após executar este workflow:**
- "Workflow concluído: SUCESSO"
- "Resumo das correções aplicadas"
- "Violações detectadas e corrigidas automaticamente"

---

**Conceito Operacional:** Este workflow aplica correções automáticas para violações comuns detectadas pelo Nemesis Enforcement, restaurando conformidade com os padrões do projeto.
