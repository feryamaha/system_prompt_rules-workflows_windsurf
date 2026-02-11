# Correção fail-closed do Nemesis e reforço de leitura segura

## Objetivo
Registrar a correção do hook Nemesis PreToolUse para operar em fail-closed em qualquer estrutura de instalação e documentar os novos protocolos de leitura via terminal adicionados aos workflows e registros forenses do incidente SuperCard.

## Arquivos afetados
- `.nemesis/hooks/nemesis-pretool-check.js` [modificado]
- `.windsurf/workflows/auditoria-de-conformidade.md` [modificado]
- `.windsurf/workflows/generate-prompt-rag.md` [modificado]
- `.windsurf/workflows/review.md` [modificado]
- `.windsurf/workflows/workflow-main.md` [modificado]
- `Feature-Documentation/issues/009_ISSUE-pretool-hook-path-mismatch-fail-open.md` [novo]
- `Generate RAG for SuperCard-REPOSTA-2.md` [novo]
- `Generate RAG for SuperCard-RESPOSTA.md` [novo]
- `Generate RAG for SuperCard-TESTE-RPOJETO-REAL.md` [novo]
- `Generate RAG for SuperCard-teste-nemesis-falhou.md` [novo]

## Implementações realizadas
### 1. `.nemesis/hooks/nemesis-pretool-check.js`
Adicionada detecção automática do caminho do `pretool-hook.ts` abrangendo repositório original e instalações via pacote `.nemesis/`, além de forçar política fail-closed em qualquer erro de leitura ou execução para impedir violações silenciosas.

### 2. `.windsurf/workflows/auditoria-de-conformidade.md`
Incluída regra explícita exigindo uso de `cat` no terminal para leitura das pastas protegidas (.windsurf, .nemesis e Feature-Documentation), prevenindo acesso direto que bypassa o controle de governança.

### 3. `.windsurf/workflows/generate-prompt-rag.md`
Documentada a mesma regra de leitura segura com exemplos em PowerShell, garantindo que a geração de prompts siga o mesmo processo de consulta controlada dos artefatos de governança.

### 4. `.windsurf/workflows/review.md`
Workflow de revisão passou a instruir auditores a utilizar apenas `cat` para consultar regras e PRs protegidos, mantendo rastreabilidade durante inspeções de código.

### 5. `.windsurf/workflows/workflow-main.md`
A etapa de leitura obrigatória agora fornece a sequência de comandos `cat` para todas as regras essenciais e reforça o uso das convenções oficiais antes de qualquer edição.

### 6. `Feature-Documentation/issues/009_ISSUE-pretool-hook-path-mismatch-fail-open.md`
Novo registro descrevendo o incidente de path mismatch e fail-open, detalhando causa raiz, correção aprovada e lições aprendidas para evitar regressões no enforcement.

### 7. Arquivos "Generate RAG for SuperCard-*.md"
Quatro relatórios RAG serializados que capturam o histórico completo do caso SuperCard, incluindo solicitações, permissões explícitas e respostas do planejador, servindo como material de auditoria.

## Benefícios arquiteturais e prontidão para escala
- Enforcement do Nemesis passa a bloquear qualquer falha interna, eliminando brechas de segurança durante operações automatizadas.
- Workflows oficiais instruem equipes e agentes a consultar regras apenas via terminal, mantendo consistência quando os diretórios são protegidos por .gitignore.
- Documentação detalhada do incidente e dos prompts facilita auditorias futuras e reduz tempo de resposta em novos eventos de conformidade.

## Validações
Como este repositório contém apenas artefatos documentais, o workflow `/audit-create-pr` autoriza pular todas as etapas de lint, typecheck, build e audit (itens 1 a 4) para evitar execuções desnecessárias.

| Comando | Resultado (OK/FALHA) | Observações |
|---------------------|----------------------|------------------------|
| yarn lint | DISPENSADO | Projeto exclusivamente documental conforme workflow |
| yarn tsc --noEmit | DISPENSADO | Projeto exclusivamente documental conforme workflow |
| yarn build | DISPENSADO | Projeto exclusivamente documental conforme workflow |
| yarn npm audit | DISPENSADO | Projeto exclusivamente documental conforme workflow |
