---
trigger: always_on
---

# Workflow de Treinamento Nemesis - Retreinamento Completo da IA

## Objetivo

Retreinar a IA Cascade com 100% das regras, protocolos e padrões do Nemesis Framework antes de qualquer atividade. Este workflow garante que a IA esteja alinhada com todas as convenções do projeto e pronta para executar tarefas seguindo rigorosamente a governança estabelecida.

## PreToolUse Hooks

// turbo
bash -c "echo 'Verificando ambiente de treinamento Nemesis...' && ls -la .nemesis/ && ls -la .windsurf/"

## Instruções Obrigatórias

### Etapa 1: Leitura Completa das Regras Fundamentais

**Execute em paralelo usando TerminalReaderService:**

```bash
# Use o TerminalReaderService para ler todas as regras principais
npx tsx -e "
import { TerminalReaderService } from './.nemesis/workflow-enforcement/services/terminal-reader-service.ts';
const terminalReader = new TerminalReaderService();

const rules = [
  '.windsurf/rules/origin-rules.md',
  '.windsurf/rules/rule-main-rules.md',
  '.windsurf/rules/API-convention.md',
  '.windsurf/rules/Arquitetura-pastas-arquivos.md',
  '.windsurf/rules/Conformidade.md',
  '.windsurf/rules/design-system-convention.md',
  '.windsurf/rules/typescript-typing-convention.md',
  '.windsurf/rules/ui-separation-convention.md',
  '.windsurf/rules/react-hooks-patterns-rules.md'
];

Promise.all(rules.map(rule => terminalReader.readFile(rule)))
  .then(results => {
    console.log('=== TODAS AS REGRAS LIDAS COM SUCESSO ===');
    results.forEach((result, index) => {
      console.log(\`\\n\${rules[index]}:\`);
      console.log(result.content.split('\\n').slice(0, 5).join('\\n'));
      console.log('...');
    });
  })
  .catch(err => console.error('Erro:', err.message));
"
```

### Etapa 2: Leitura do Workflow Execution Protocol

**Use TerminalReaderService para extrair o protocolo completo:**

```bash
npx tsx -e "
import { TerminalReaderService } from './.nemesis/workflow-enforcement/services/terminal-reader-service.ts';
const terminalReader = new TerminalReaderService();

terminalReader.readFile('.windsurf/rules/rule-main-rules.md')
  .then(result => {
    const content = result.content;
    const protocolSection = content.split('## 9. Workflow Execution Protocol')[1];
    if (protocolSection) {
      console.log('=== WORKFLOW EXECUTION PROTOCOL ===');
      console.log(protocolSection.split('## 10.')[0].trim());
    } else {
      console.log('Protocolo não encontrado');
    }
  })
  .catch(err => console.error('Erro:', err.message));
"
```

### Etapa 3: Verificação do Sistema Nemesis

**Confirme que o enforcement está ativo:**

```bash
# Verificar hooks de enforcement
ls -la .nemesis/hooks/
echo "=== HOOKS DISPONÍVEIS ==="

# Verificar configuração
cat .nemesis/config.toml
echo "=== CONFIGURAÇÃO NEMESIS ==="

# Testar TerminalReaderService
npx tsx -e "
import { TerminalReaderService } from './.nemesis/workflow-enforcement/services/terminal-reader-service.ts';
const terminalReader = new TerminalReaderService();
terminalReader.readFile('.windsurf/rules/README.md')
  .then(result => console.log('TERMINAL READER SERVICE:', result.success ? 'ATIVO' : 'INATIVO'))
  .catch(err => console.error('ERRO:', err.message));
"
```

### Etapa 4: Criação de Memórias de Treinamento

**Crie memórias consolidadas para acesso rápido:**

1. **Memory ID: nemesis-complete-training**
   - Todas as regras fundamentais
   - Protocolo de execução de workflows
   - Sistema de enforcement
   - Padrões técnicos e de segurança

2. **Memory ID: workflow-execution-protocol**
   - Fluxo obrigatório de execução
   - Proibições absolutas
   - Padrões de comunicação

3. **Memory ID: nemesis-enforcement-system**
   - Arquitetura do enforcement engine
   - Sistema de hooks e validação
   - Camadas de segurança

### Etapa 5: Confirmação de Compreensão

**A IA deve confirmar compreensão total:**

> "Eu li e compreendi completamente:
> - ✅ As 9 regras fundamentais do Nemesis Framework
> - ✅ O Workflow Execution Protocol com suas 3 etapas obrigatórias
> - ✅ O sistema de enforcement com PreToolUse hooks
> - ✅ As proibições absolutas e padrões de comunicação
> - ✅ A tabela de decisão (Bugfix/Refactor/Feature/Docs)
> - ✅ A análise obrigatória de dívida técnica
> 
> Estou pronta para executar qualquer tarefa seguindo 100% das regras e protocolos estabelecidos."

## Validação Final

**Execute este comando para validar o treinamento:**

```bash
# Teste completo do sistema
echo "=== VALIDAÇÃO FINAL DO TREINAMENTO ===" && \
npx tsx -e "
import { TerminalReaderService } from './.nemesis/workflow-enforcement/services/terminal-reader-service.ts';
const terminalReader = new TerminalReaderService();
Promise.all([
  terminalReader.readFile('.windsurf/rules/rule-main-rules.md'),
  terminalReader.readFile('.windsurf/rules/origin-rules.md')
]).then(() => {
  console.log('✅ TREINAMENTO CONCLUÍDO COM SUCESSO');
  console.log('✅ IA RETREINADA E PRONTA PARA EXECUÇÃO');
  console.log('✅ NEMESIS ENFORCEMENT ATIVO E OPERACIONAL');
}).catch(err => {
  console.error('❌ ERRO NO TREINAMENTO:', err.message);
});
"
```

## Padrões de Comunicação Pós-Treinamento

**Após executar este workflow, a IA deve sempre:**

1. **Antes de qualquer tarefa:**
   - "Li o workflow completamente"
   - "Identifiquei X etapas e Y dependências"
   - "Posso prosseguir com a execução?"

2. **Durante execuções:**
   - Seguir rigorosamente o Workflow Execution Protocol
   - Usar TerminalReaderService para arquivos .windsurf/
   - Respeitar todas as proibições absolutas

3. **Após conclusão:**
   - "Workflow concluído: [status]"
   - "Resumo das ações realizadas"

## Frequência de Uso

**Execute este workflow de treinamento:**
- **Sempre que notar desvio da IA**
- **Ao iniciar sessão em novo projeto**
- **Após atualizações das regras**
- **Quando a IA violar protocolos**

---

**Status:** Workflow de treinamento completo para retreinamento da IA Cascade com 100% de conformidade ao Nemesis Framework.
