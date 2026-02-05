## PEDIDO
Migrar o metodo de invocacao do Nemesis de instrucoes textuais em workflows para o metodo Hook PreToolUse, implementando bloqueio tecnico deterministico no nivel do sistema em vez de enforcement baseado em instrucoes que a IA pode ignorar. Aplicar correcao a todos os workflows do projeto.

## PROBLEMA
Modelos de IA ignoram sistemicamente o enforcement do Nemesis quando invocado via instrucoes textuais em workflows. A sequencia "ETAPA 0: yarn nemesis:enforce" e tratada como sugestao opcional, nao como bloqueio obrigatorio. A IA interpreta resultados de forma conveniente e executa acoes proibidas mesmo apos validacao falhar. Enforcement na camada de instrucao e ineficaz contra comportamentos de desobediencia catalogados (negligencia na leitura, interpretacao seletiva, arrogancia algoritmica, instinto vs regras).

## DETALHES DA SOLICITACAO

### Workflows Afetados (mesmo padrao de erro em todos)
Todos os workflows abaixo possuem a mesma arquitetura de enforcement inadequada:
- .windsurf/workflows/audit-create-pr.md
- .windsurf/workflows/auditoria-de-conformidade.md
- .windsurf/workflows/generate-prompt-rag.md
- .windsurf/workflows/review.md
- .windsurf/workflows/workflow-main.md

### Padrao de Erro Identificado em Todos os Workflows

#### 1. Campos Frontmatter Nao Suportados (Violacao em todos)
Todos os workflows utilizam campos customizados ignorados pelo sistema:
```yaml
nemesis_enforcement: true
mandatory_rules:
  - .windsurf/rules/rule-main-rules.md
```
Documentacao oficial suporta apenas: name, description, tools, disallowedTools, model, permissionMode, skills, hooks. Campos customizados sao ignorados.

#### 2. Enforcement como Instrucao Textual (Violacao em todos)
Secao "Nemesis Pre-Execution Check" em todos os workflows e texto que a IA le, nao codigo que o sistema executa. A IA decide se executa ou ignora baseado em sua interpretacao.

#### 3. ETAPA 0 Nao E Hook Tecnico (Violacao em todos)
Todos os workflows contem:
```markdown
## ETAPA 0: VALIDACAO NEMESIS OBRIGATORIA

Execute obrigatoriamente:
```bash
yarn nemesis:enforce "$(pwd)/.windsurf/workflows/[nome-workflow].md"
```
Isso e instrucao textual que o modelo de IA pode ignorar. Documentacao oficial confirma: hooks fornecem "deterministic control" e "ensure certain actions always happen rather than relying on the LLM to choose".

### Solucao Arquitetural Correta

#### Frontmatter com Hooks (Todos os workflows)
```yaml
---
name: [nome-workflow]
description: [descricao]
auto_execution_mode: 3
hooks:
  PreToolUse:
    - matcher: "Edit|Write|Bash"
      hooks:
        - type: command
          command: "$PROJECT_DIR/.nemesis/hooks/nemesis-pretool-check.sh"
---
```

#### Script Hook Unico
.nemesis/hooks/nemesis-pretool-check.sh:
- Recebe JSON via stdin com tool_name e tool_input
- Para Edit/Write: valida arquivo contra regras Nemesis
- Para Bash: valida comando contra lista permitida
- Retorna exit code 2 para bloquear tecnicamente
- Mensagens de erro para stderr alimentam feedback do modelo de IA

### Diferenca Arquitetural Fundamental
- Metodo atual: Camada de instrucao (IA controla execucao e interpretacao)
- Metodo hook: Camada de sistema (sistema controla permissao, IA apenas reage ao bloqueio)
- Documentacao oficial: "hooks provide deterministic control" e "ensure certain actions always happen rather than relying on the LLM to choose"

### Novos Entry Points Necessarios
- cli/pretool-hook.ts: recebe JSON do stdin, usa WorkflowEnforcer existente para preExecutionCheck, retorna exit code 2 com mensagens no stderr se invalido
- Adaptacao do WorkflowEnforcer para modo headless (sem interacao com IA, apenas validacao tecnica)
- Separacao entre camada de validacao (hook) e camada de execucao (workflows)

### Correcoes Necessarias em Todos os Workflows
1. Remover campos nao suportados do frontmatter (nemesis_enforcement, mandatory_rules)
2. Adicionar hooks no frontmatter conforme documentacao oficial
3. Remover secoes textuais de enforcement:
   - "Nemesis Pre-Execution Check"
   - "Ativacao do Nemesis"
   - "ETAPA 0: VALIDACAO NEMESIS OBRIGATORIA"
4. Manter apenas etapas executaveis (ETAPAS 1-14 ou equivalentes)
5. Enforcement acontecera automaticamente via hooks, nao como texto

### Verificacao Final
- Hook executa antes do modelo de IA agir em qualquer ferramenta
- Exit code 2 bloqueia tecnicamente a ferramenta
- Modelo de IA nao pode executar ferramenta bloqueada
- Enforcement deterministico em nivel de sistema

### Arquivos de Referencia
- @Feature-Documentation/issues/008_ISSUE-ia-behavioral-violations-consolidated-analysis.md (comportamentos catalogados)
- Todos os workflows em .windsurf/workflows/ (mostram padrao de erro consistente)
- src/workflow-enforcement/ (core do Nemesis a ser adaptado)

## REGRA A SER SEGUIDA
@[.windsurf/rule-main-rules.md]
