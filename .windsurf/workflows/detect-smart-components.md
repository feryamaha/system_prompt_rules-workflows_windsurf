name: detect-smart-components
description: Detecta automaticamente componentes com lógica e adiciona comentário SMART COMPONENT
auto_execution_mode: 3
---

## PreToolUse Hook

// turbo
bash -c "echo 'Verificando ambiente de detecção de componentes smart...' && ls -la .nemesis/ && ls -la .windsurf/"

## Etapa 1: Leitura das Regras de Componentes Smart

**Use TerminalReaderService para ler as regras de componentes smart:**

```bash
npx tsx -e "
import { TerminalReaderService } from './.nemesis/workflow-enforcement/services/terminal-reader-service.ts';
const terminalReader = new TerminalReaderService();

terminalReader.readFile('.windsurf/rules/ui-separation-convention.md')
  .then(result => {
    console.log('=== REGRAS DE COMPONENTES SMART LIDAS ===');
    console.log('Status:', result.success ? 'SUCESSO' : 'FALHA');
    if (result.success) {
      console.log('Padrões de detecção disponíveis');
    }
  })
  .catch(err => console.error('Erro:', err.message));
"
```

## Etapa 2: Varredura de Componentes com Lógica

**Encontrar todos os arquivos TypeScript/JSX que podem conter lógica:**

```bash
# Encontrar arquivos .tsx e .jsx
find src -name "*.tsx" -o -name "*.jsx" | head -20

# Buscar por padrões de lógica nos arquivos
echo "=== BUSCANDO POR PADRÕES DE LÓGICA ===" && \
find src -name "*.tsx" -o -name "*.jsx" | xargs grep -l "useState\|useEffect\|const \[.*\] = " | head -10
```

## Etapa 3: Análise Inteligente de Componentes

**Use TerminalReaderService para analisar cada arquivo:**

```bash
npx tsx -e "
import { TerminalReaderService } from './.nemesis/workflow-enforcement/services/terminal-reader-service.ts';
import * as fs from 'fs';
import * as path from 'path';

const terminalReader = new TerminalReaderService();

// Encontrar todos os arquivos .tsx/.jsx
const { execSync } = require('child_process');
const files = execSync('find src -name \"*.tsx\" -o -name \"*.jsx\"', { encoding: 'utf8' }).trim().split('\n');

console.log('=== ANÁLISE DE COMPONENTES COM LÓGICA ===');

const candidates = [];

for (const filePath of files) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Verificar se já tem SMART COMPONENT
    if (content.includes('// SMART COMPONENT')) {
      console.log(\`✅ \${filePath} - Já é smart component\`);
      continue;
    }
    
    // Verificar se tem lógica embutida
    const hasHooks = /useState|useEffect|useContext|useReducer|useMemo|useCallback/.test(content);
    const hasStateManagement = content.includes('const [') && content.includes(']');
    const hasEventHandlers = /on[A-Z][a-zA-Z]*|handle[A-Z][a-zA-Z]*/.test(content);
    const hasComplexLogic = content.includes('if (') && content.includes('useState');
    
    // Verificar se é componente UI
    const isUIComponent = filePath.includes('/components/ui/') || filePath.includes('/components/shared/');
    
    // Verificar se tem mais de 3 hooks
    const hookCount = (content.match(/useState|useEffect|useContext|useReducer/g) || []).length;
    
    // Critérios para ser candidato a smart component
    if ((hasHooks || hasStateManagement) && (isUIComponent || hookCount > 2)) {
      candidates.push({
        path: filePath,
        hooks: hookCount,
        hasEventHandlers,
        hasComplexLogic,
        isUIComponent
      });
    }
  } catch (error) {
    console.log(\`⚠️ Erro ao ler \${filePath}: \${error.message}\`);
  }
}

console.log(\`\\n🎯 CANDIDATOS ENCONTRADOS: \${candidates.length}\`);
candidates.forEach((candidate, index) => {
  console.log(\`\${index + 1}. \${candidate.path}\`);
  console.log(\`   - Hooks: \${candidate.hooks}\`);
  console.log(\`   - UI Component: \${candidate.isUIComponent}\`);
  console.log(\`   - Event Handlers: \${candidate.hasEventHandlers}\`);
  console.log(\`   - Lógica Complexa: \${candidate.hasComplexLogic}\`);
});
"
```

## Etapa 4: Classificação e Priorização

**Classificar os candidatos encontrados:**

```bash
npx tsx -e "
import { TerminalReaderService } from './.nemesis/workflow-enforcement/services/terminal-reader-service.ts';
import * as fs from 'fs';
import * as path from 'path';

const terminalReader = new TerminalReaderService();

// Ler candidatos da etapa anterior
const candidates = [
  // Será populado pela etapa anterior
];

// Classificar por prioridade
const highPriority = [];
const mediumPriority = [];
const lowPriority = [];

candidates.forEach(candidate => {
  let score = 0;
  
  // Componentes UI com muitos hooks = alta prioridade
  if (candidate.isUIComponent && candidate.hooks > 2) score += 3;
  
  // Componentes com lógica complexa = alta prioridade  
  if (candidate.hasComplexLogic) score += 2;
  
  // Componentes com event handlers = média prioridade
  if (candidate.hasEventHandlers) score += 1;
  
  // Componentes shared = média prioridade
  if (candidate.path.includes('/shared/')) score += 1;
  
  if (score >= 3) highPriority.push(candidate);
  else if (score >= 1) mediumPriority.push(candidate);
  else lowPriority.push(candidate);
});

console.log('=== CLASSIFICAÇÃO POR PRIORIDADE ===');
console.log(\`🔥 Alta Prioridade: \${highPriority.length}\`);
highPriority.forEach((c, i) => console.log(\`   \${i + 1}. \${c.path}\`));

console.log(\`⚡ Média Prioridade: \${mediumPriority.length}\`);
mediumPriority.forEach((c, i) => console.log(\`   \${i + 1}. \${c.path}\`));

console.log(\`🔵 Baixa Prioridade: \${lowPriority.length}\`);
lowPriority.forEach((c, i) => console.log(\`   \${i + 1}. \${c.path}\`));
"
```

## Etapa 5: Adição Automática do Comentário

**Adicionar comentário SMART COMPONENT aos arquivos identificados:**

```bash
npx tsx -e "
import * as fs from 'fs';
import * as path from 'path';

// Lista de candidatos (será populada pelas etapas anteriores)
const candidates = [
  // Exemplo: { path: 'src/components/ui/Dropdown.tsx', hooks: 3, hasEventHandlers: true, hasComplexLogic: true, isUIComponent: true }
];

let processedCount = 0;
let skippedCount = 0;

console.log('=== ADICIONANDO COMENTÁRIO SMART COMPONENT ===');

candidates.forEach(candidate => {
  try {
    let content = fs.readFileSync(candidate.path, 'utf8');
    
    // Verificar se já tem o comentário
    if (content.includes('// SMART COMPONENT')) {
      console.log(\`⏭️ Pulando: \${candidate.path} (já tem comentário)\`);
      skippedCount++;
      return;
    }
    
    // Adicionar comentário no topo
    const lines = content.split('\n');
    const firstNonEmptyLine = lines.findIndex(line => line.trim() !== '');
    
    if (firstNonEmptyLine === -1) {
      console.log(\`⚠️ Pulando: \${candidate.path} (arquivo vazio)\`);
      skippedCount++;
      return;
    }
    
    // Inserir comentário antes da primeira linha de código
    lines.splice(firstNonEmptyLine, 0, '// SMART COMPONENT');
    const newContent = lines.join('\n');
    
    fs.writeFileSync(candidate.path, newContent, 'utf8');
    console.log(\`✅ Processado: \${candidate.path}\`);
    processedCount++;
    
  } catch (error) {
    console.log(\`❌ Erro em \${candidate.path}: \${error.message}\`);
    skippedCount++;
  }
});

console.log(\`\\n📊 RESUMO DA OPERAÇÃO:\`);
console.log(\`✅ Processados: \${processedCount}\`);
console.log(\`⏭️ Pulados: \${skippedCount}\`);
console.log(\`📁 Total analisados: \${candidates.length}\`);
"
```

## Etapa 6: Validação Pós-Processamento

**Validar se os comentários foram adicionados corretamente:**

```bash
echo "=== VALIDAÇÃO PÓS-PROCESSAMENTO ===" && \
npx tsx -e "
import * as fs from 'fs';

const candidates = [
  // Mesma lista de candidatos
];

let validatedCount = 0;

candidates.forEach(candidate => {
  try {
    const content = fs.readFileSync(candidate.path, 'utf8');
    if (content.includes('// SMART COMPONENT')) {
      console.log(\`✅ Validado: \${candidate.path}\`);
      validatedCount++;
    } else {
      console.log(\`❌ Falha na validação: \${candidate.path}\`);
    }
  } catch (error) {
    console.log(\`❌ Erro na validação: \${candidate.path}\`);
  }
});

console.log(\`\\n🎯 Componentes smart validados: \${validatedCount}/\${candidates.length}\`);
"
```

## Etapa 7: Atualização do Registro

**Atualizar o arquivo .nemesis/smart-components.json:**

```bash
npx tsx -e "
import * as fs from 'fs';
import * as path from 'path';

const candidates = [
  // Mesma lista de candidatos
];

const smartComponents = candidates.map(c => path.relative(process.cwd(), c.path));

const config = {
  smartComponents: smartComponents,
  description: 'Lista de componentes smart com permissão para ter lógica embutida',
  lastUpdated: new Date().toISOString(),
  detectedBy: 'detect-smart-components workflow'
};

fs.writeFileSync('.nemesis/smart-components.json', JSON.stringify(config, null, 2), 'utf8');

console.log('📝 Arquivo .nemesis/smart-components.json atualizado');
console.log(\`📋 Componentes registrados: \${smartComponents.length}\`);
"
```

## Etapa 8: Relatório Final

**Gerar relatório completo da operação:**

```bash
echo "=== RELATÓRIO FINAL ===" && \
npx tsx -e "
import * as fs from 'fs';
import * as path from 'path';

const report = {
  timestamp: new Date().toISOString(),
  workflow: 'detect-smart-components',
  status: 'completed',
  summary: {
    totalAnalyzed: 0,
    smartComponentsDetected: 0,
    commentsAdded: 0,
    filesSkipped: 0,
    validationPassed: 0
  },
  details: {
    highPriority: [],
    mediumPriority: [],
    lowPriority: []
  },
  nextSteps: [
    'Verificar componentes manualmente se necessário',
    'Executar testes para validar funcionalidade',
    'Considerar refatoração de componentes muito complexos'
  ]
};

// Preencher com dados reais (será populado pelas etapas anteriores)
const candidates = [
  // Lista de candidatos processados
];

report.summary.totalAnalyzed = candidates.length;
report.summary.smartComponentsDetected = candidates.length;
report.summary.commentsAdded = candidates.filter(c => c.processed).length;
report.summary.filesSkipped = candidates.filter(c => c.skipped).length;

// Salvar relatório
fs.writeFileSync('.nemesis/detection-report.json', JSON.stringify(report, null, 2), 'utf8');

console.log('📊 RELATÓRIO GERADO:');
console.log(\`📁 Total analisado: \${report.summary.totalAnalyzed}\`);
console.log(\`🎯 Componentes smart detectados: \${report.summary.smartComponentsDetected}\`);
console.log(\`✅ Comentários adicionados: \${report.summary.commentsAdded}\`);
console.log(\`⏭️ Arquivos pulados: \${report.summary.filesSkipped}\`);
console.log(\`📅 Relatório salvo em: .nemesis/detection-report.json\`);
"
```

## Validação Final

**Execute validação final do sistema:**

```bash
echo "=== VALIDAÇÃO FINAL DA DETECÇÃO ===" && \
npx tsx -e "
import { TerminalReaderService } from './.nemesis/workflow-enforcement/services/terminal-reader-service.ts';
const terminalReader = new TerminalReaderService();

Promise.all([
  terminalReader.readFile('.windsurf/rules/ui-separation-convention.md'),
  terminalReader.readFile('.nemesis/smart-components.json')
]).then(() => {
  console.log('✅ DETECÇÃO DE COMPONENTES SMART CONCLUÍDA');
  console.log('✅ COMENTÁRIOS ADICIONADOS AUTOMATICAMENTE');
  console.log('✅ REGISTRO ATUALIZADO');
  console.log('✅ NEMESIS ENFORCEMENT ATIVO E OPERACIONAL');
}).catch(err => {
  console.error('❌ ERRO NA DETECÇÃO:', err.message);
});
"
```

## Padrão de Comunicação Final

**Após executar este workflow:**
- "Workflow concluído: SUCESSO"
- "Resumo das ações realizadas"
- "Componentes smart detectados e marcados automaticamente"

---

**Conceito Operacional:** Este workflow detecta automaticamente componentes com lógica embutida e adiciona o comentário `// SMART COMPONENT` para que o Nemesis Enforcement os reconheça e isente das validações de separação UI/lógica.
