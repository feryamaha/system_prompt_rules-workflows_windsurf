# Nemesis Framework – Migração para PreToolUse Hooks com Enforcement Deterministico

## Objetivo

Migrar o metodo de invocacao do Nemesis de instrucoes textuais em workflows para o metodo Hook PreToolUse, implementando bloqueio tecnico deterministico no nivel do sistema em vez de enforcement baseado em instrucoes que a IA pode ignorar. Esta melhoria garante que modelos LLM nao pulem etapas obrigatorias de validacao.

## Arquivos afetados

- src/workflow-enforcement/cli/pretool-hook.ts [novo]
- src/workflow-enforcement/cli/install-hooks.js [novo]
- .nemesis/hooks/nemesis-pretool-check.sh [novo]
- .nemesis/hooks/nemesis-pretool-check.ps1 [novo]
- src/workflow-enforcement/types.ts [modificado]
- src/workflow-enforcement/workflow-enforcer.ts [modificado]
- src/workflow-enforcement/workflow-catalog.ts [modificado]
- src/workflow-enforcement/index.ts [modificado]
- package.json [modificado]
- index.js [modificado]
- README.md [modificado]
- .windsurf/rules/README.md [modificado]
- .windsurf/rules/origin-rules.md [modificado]
- .windsurf/workflows/generate-prompt-rag.md [modificado]
- .windsurf/workflows/audit-create-pr.md [modificado]
- .windsurf/workflows/auditoria-de-conformidade.md [modificado]
- .windsurf/workflows/review.md [modificado]
- .windsurf/workflows/workflow-main.md [modificado]

## Implementacoes realizadas

### 1. pretool-hook.ts
Entry point para PreToolUse hooks que recebe JSON via stdin no formato oficial Windsurf, valida acoes Edit/Write/Bash e retorna exit code 2 para bloqueio tecnico ou 0 para permissao. Implementa validacao headless sem interacao com IA.

### 2. install-hooks.js
Script de instalacao que verifica se os hooks estao corretamente configurados no diretorio .nemesis/hooks/ e valida a integridade da instalacao.

### 3. nemesis-pretool-check.sh
Script shell Bash que recebe input do Windsurf via stdin, chama pretool-hook.ts passando o JSON e retorna exit code para bloquear ou permitir a ferramenta. Garante cross-platform support para Unix/Linux.

### 4. nemesis-pretool-check.ps1
Script PowerShell equivalente para ambientes Windows, mantendo a mesma funcionalidade de validacao e bloqueio deterministico.

### 5. types.ts
Adicionados novos tipos PreToolValidationResult e PreToolValidationInput para suportar validacao em modo headless, alem do campo mode em EnforcementConfig para distinguir entre interactive e headless.

### 6. workflow-enforcer.ts
Adaptado para modo headless com novos metodos validatePreToolUse(), validateFileOperationHeadless() e validateCommandHeadless(). Mantem compatibilidade com enforcement existente enquanto adiciona suporte a hooks.

### 7. workflow-catalog.ts
Correcao de duplicacao de path ao listar workflows, garantindo que o diretorio .windsurf/workflows nao seja concatenado duas vezes.

### 8. index.ts
Exportados novos tipos PreToolValidationResult e PreToolValidationInput para uso externo.

### 9. package.json
Adicionados scripts nemesis:pretool e nemesis:install-hooks para facilitar o uso dos hooks.

### 10. generate-prompt-rag.md, audit-create-pr.md, auditoria-de-conformidade.md, review.md, workflow-main.md
Atualizacao do frontmatter para formato valido com hooks PreToolUse conforme documentacao oficial Windsurf, remocao de campos nao suportados (nemesis_enforcement, mandatory_rules) e adicao de referencias obrigatorias as regras no conteudo.

### 11. index.js - Adicao de Scripts Nemesis e Copia de Hooks
Inclusao dos scripts `nemesis:pretool` e `nemesis:install-hooks` na funcao `updatePackageJsonScripts()`. Adicionada logica para copiar o diretorio `.nemesis/hooks/` contendo os scripts `nemesis-pretool-check.sh` e `nemesis-pretool-check.ps1` para o projeto alvo, garantindo que os hooks de validacao deterministicos estejam disponiveis no ambiente de destino.

### 12. README.md - Atualizacao Concisa
Reescrita completa do README principal para refletir a nova arquitetura com enfase em PreToolUse hooks, enforcement deterministico, arquitetura de 3 camadas e comandos CLI disponiveis.

### 13. .windsurf/rules/README.md - Indice de Regras
Transformacao do README de regras em um indice conciso conectando regras, workflows, enforcement e hooks. Adicionada hierarquia de consulta (Regras Locais → Skills Vercel → Documentacao Oficial).

### 14. .windsurf/rules/origin-rules.md - Comportamento IA
Adicionada secao sobre comportamento da IA e limitacoes tecnicas, documentando o gap entre compreensao e execucao das regras.

## Beneficios arquiteturais e prontidao para escala

- Enforcement deterministico via exit code 2 que bloqueia tecnicamente a ferramenta antes da execucao, eliminando a possibilidade de IA ignorar validacoes
- Separacao clara entre camada de validacao (hook) e camada de execucao (workflows), seguindo principios de responsabilidade unica
- Governanca proativa com PreToolUse hooks que executam automaticamente antes de cada ferramenta Edit/Write/Bash
- Compatibilidade mantida com enforcement CLI existente, permitindo uso hibrido dos dois modelos
- Reducao de retrabalho causado por violacoes de workflow, previnindo problemas antes que cheguem ao repositorio
- Performance otimizada com validacao headless sem overhead de interacao com IA

| Comando             | Resultado (OK/FALHA) | Observacoes                          |
|---------------------|----------------------|--------------------------------------|
| yarn lint           | N/A                  | Projeto de documentacao/framework    |
| yarn tsc --noEmit   | OK                   | TypeScript valido                    |
| yarn build          | N/A                  | Projeto de documentacao/framework    |
| yarn npm audit      | OK                   | Sem vulnerabilidades                 |
