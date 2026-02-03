## PEDIDO
Integrar execucao CLI do Nemesis Enforcement Engine em todos os workflows existentes. Modificar cada arquivo de workflow em `.windsurf/workflows/` para incluir Etapa 0 obrigatoria que execute `yarn nemesis:enforce <caminho-do-workflow>` antes de qualquer outra instrucao. Se exit code 1, bloqueie imediatamente e reporte violacoes. Se exit code 0, prossiga com execucao normal do workflow.

## PROBLEMA
Atualmente o Nemesis possui codigo TypeScript completo de enforcement (`WorkflowRunner`, `WorkflowEnforcer`, `PermissionGate`, `ViolationLogger`) e CLI funcional (`yarn nemesis:enforce`), mas a execucao depende de acionamento manual. Os workflows possuem instrucoes textuais de enforcement que funcionam como camada de prevencao, mas nao executam o codigo real de validacao. Falta integracao automatica que invoque o CLI do Nemesis ao iniciar qualquer workflow via slash command.

## DETALHES DA SOLICITACAO
- Codigo fonte do Nemesis localizado em: `.nemesis/workflow-enforcement/`
- CLI disponivel via: `yarn nemesis:enforce <caminho-do-workflow>`
- Workflows alvo para modificacao:
  - `.windsurf/workflows/generate-prompt-rag.md`
  - `.windsurf/workflows/audit-create-pr.md`
  - `.windsurf/workflows/auditoria-de-conformidade.md`
  - `.windsurf/workflows/review.md`
  - `.windsurf/workflows/workflow-main.md`
- Cada workflow ja possui `nemesis_enforcement: true` na frontmatter e secao "Nemesis Pre-Execution Check" textual
- Estrutura da Etapa 0 a adicionar:
  - Comando bash: `yarn nemesis:enforce "$(pwd)/.windsurf/workflows/<nome-do-workflow>.md"`
  - Condicao: Se exit code 1, bloquear e reportar violacoes; Se exit code 0, prosseguir
  - Posicionamento: Antes de qualquer outra etapa do workflow
- O comando requer aprovacao do usuario para execucao (comportamento padrao do Cascade)
- Dupla camada de protecao: instrucoes textuais (prevenao) + execucao CLI (barreira final)

## REGRA A SER SEGUIDA
@[.windsurf/rules/rule-main-rules.md]
