name: workflow-main
description: Protocolo de Execução Obrigatório para Resposta a Solicitações
trigger: always_on
auto_execution_mode: 3
---

## PreToolUse Hook

// turbo
bash -c "echo 'Verificando ambiente de workflow principal...' && ls -la .nemesis/ && ls -la .windsurf/"

## Etapa 1: Leitura Completa das Regras Fundamentais

**Use TerminalReaderService para ler as regras obrigatórias:**

```bash
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
    console.log('=== TODAS AS REGRAS FUNDAMENTAIS LIDAS ===');
    results.forEach((result, index) => {
      console.log(\`\${rules[index]}: \${result.success ? 'SUCESSO' : 'FALHA'}\`);
    });
    console.log('=== PROTOCOLO DE EXECUÇÃO CARREGADO ===');
  })
  .catch(err => console.error('Erro:', err.message));
"
```

## Etapa 2: Leitura do Workflow Execution Protocol

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
      console.log('=== PROTOCOLO INTERNALIZADO ===');
    } else {
      console.log('Protocolo não encontrado');
    }
  })
  .catch(err => console.error('Erro:', err.message));
"
```

## Etapa 3: Classificação Obrigatória do Pedido

### Tabela de Decisão Rápida (REFERÊNCIA OBRIGATÓRIA)

| Categoria | Ação Principal | Comandos Permitidos | Proibições |
|-----------|----------------|---------------------|------------|
| Bugfix | Correção mínima | `tsc --noEmit` | Lint, refatoração, instalações |
| Refactor | Melhoria estrutural | `tsc --noEmit` + análise | Mudanças funcionais |
| Feature | Criação nova | Build completo | Mudanças sem planejamento |
| Docs/Infra | Documentação/Infra | Validação específica | Alterações de código |

### Ações de Classificação (EXECUTAR OBRIGATORIAMENTE)
- Ler atentamente o pedido do usuário e classificar explicitamente sua natureza/categoria
- Confirmar a classificação se houver ambiguidade
- **Regra rígida**: Em bugfix/correção de erro, aplicar **mínima intervenção possível**
- **Componentes excepcionais**: Tratar como **imune total** às convenções quando explicitamente mencionado

## Etapa 4: Investigação Inicial

### Investigação Automática (SEM PERMISSÃO EM BUGFIX)
- Quando o pedido citar explicitamente um arquivo e for classificado como bugfix, ler imediatamente o arquivo afetado
- Rodar `git diff HEAD~1 -- nome-do-arquivo.tsx` para identificar causa raiz
- Usar isso para localizar causa raiz sem alucinação

### Comandos Padronizados para Investigação
```bash
# Investigação de mudanças (bugfix com arquivo mencionado)
git diff HEAD~1 -- nome-do-arquivo.tsx

# Validação TypeScript (único comando permitido em bugfix)
bun tsc --noEmit

# Validação completa (feature/refactor)
bun lint && bun tsc --noEmit && bun build
```

## Etapa 5: Compreensão e Diagnóstico

### Compreensão do Pedido (OBRIGATÓRIO)
- Confirmar explicitamente o entendimento do problema/requisito
- Incluir: "Categoria classificada: [bugfix/refactor/etc.]"

### Diagnóstico Inicial (OBRIGATÓRIO)
- Basear-se na investigação da Etapa 4 (diff + leitura)
- Citar onde o problema reside e quais regras embasam
- **Em componentes excepcionais**: Ignorar violações pré-existentes permitidas

## Etapa 6: Planejamento

### Planejamento Obrigatório
- Descrever plano objetivo (**mínimo 2 passos**)
- Não incluir "investigar" como passo (já foi feito na Etapa 4)
- **Em bugfix de componente excepcional**: Plano ultra-mínimo

## Etapa 7: Solicitação de Permissão

### Solicitação Obrigatória
- Perguntar se deve prosseguir com **aplicação das correções**
- Aguardar autorização explícita do usuário (SIM/NÃO)
- Não codificar nada sem aprovação

## Etapa 8: Execução e Relatório

### Execução Obrigatória (APENAS APÓS AUTORIZAÇÃO)
- SEGUIR ESTRITAMENTE o planejamento feito
- Aplicar correções → rodar `bun tsc --noEmit` uma vez → finalizar relatório

### Validação Final Obrigatória
- Após correções, rodar `bun tsc --noEmit` **uma única vez**
- Se pedir install: registrar "Validação por dedução"
- Parar — sem mais comandos ou propostas

## Padrão de Comunicação

**Durante todo o workflow:**
- SEMPRE em português PT-BR
- Classificar categoria PRIMEIRO
- Mencionar arquivo investigado
- Citar causa raiz identificada
- Pedir permissão ANTES de editar
- Validar com `tsc --noEmit` DEPOIS

## Proibições Absolutas

- NUNCA editar sem permissão explícita
- NUNCA rodar lint em bugfix
- NUNCA refatorar em correção de erro
- NUNCA ignorar componente excepcional
- NUNCA sugerir "próximos passos"
- NUNCA usar linguagem promocional

## Regras Específicas por Domínio

### Trabalhos de UI/UX e React
- Sempre reutilizar componentes/tokens descritos nas regras
- Confirmar espaçamentos, estados e anatomia definidos

### Backend / APIs / BFF
- Consultar regras de API antes de tocar em contratos
- Respeitar estruturas e camadas descritas nas regras de arquitetura

## Validação Final

**Execute validação final do sistema:**

```bash
echo "=== VALIDAÇÃO FINAL DO WORKFLOW PRINCIPAL ===" && \
npx tsx -e "
import { TerminalReaderService } from './.nemesis/workflow-enforcement/services/terminal-reader-service.ts';
const terminalReader = new TerminalReaderService();

Promise.all([
  terminalReader.readFile('.windsurf/rules/rule-main-rules.md'),
  terminalReader.readFile('.windsurf/rules/origin-rules.md')
]).then(() => {
  console.log('✅ WORKFLOW PRINCIPAL CONCLUÍDO');
  console.log('✅ REGRAS FUNDAMENTAIS LIDAS');
  console.log('✅ PROTOCOLO DE EXECUÇÃO ATIVO');
  console.log('✅ NEMESIS ENFORCEMENT OPERACIONAL');
}).catch(err => {
  console.error('❌ ERRO NO WORKFLOW:', err.message);
});
"
```

## Padrão de Comunicação Final

**Após executar este workflow:**
- "Workflow concluído: [status]"
- "Resumo das ações realizadas"
- "Protocolo de execução seguido rigorosamente"
