## PEDIDO
Corrigir instalador do NemesisIA Skills SPRW que esta falhando ao instalar estrutura completa em projetos alvo via comando npx github:feryamaha/system_prompt_rules-workflows_windsurf, incluindo pastas padrao (.windsurf/rules, Feature-Documentation), nova camada de prevenção e contenção (Workflow Enforcement Engine + just-bash Sandbox), e Vercel Agent Skills automaticamente

## PROBLEMA  
Comando npx github:feryamaha/system_prompt_rules-workflows_windsurf executa mas nao instala diretorios .windsurf e Feature-Documentation, retornando erro "Diretorio nao encontrado: .windsurf". Vercel Agent Skills tambem nao esta sendo instalado automaticamente conforme comportamento anterior.

## DETALHES DA SOLICITACAO
- Contexto: Instalador NemesisIA modificado durante implementacao do Workflow Enforcement Engine + just-bash (PR_004)
- Arquivos envolvidos: 
  - @Feature-Documentation/PR/PR_004_WORKFLOW-ENFORCEMENT-JUST-BASH.md
  - @Feature-Documentation/prompts/002_workflow-enforcement-just-bash.md
  - @Feature-Documentation/issues/002_workflow-enforcement-encoding-failure.md
  - @README.md
  - @.windsurf/rules/README.md
  - @.windsurf/rules/origin-rules.md
  - @.windsurf/rules/rule-main-rules.md
  - @index.js
- Sintomas observados: 
  - Mensagem "Vercel Agent Skills ja instalado" mesmo em projeto limpo
  - Falha "Diretorio nao encontrado: .windsurf" ao tentar copiar estruturas
  - Nenhum arquivo e copiado para projeto alvo
- Comportamento esperado: 
  - Copiar estruturas do pacote Nemesis para projeto alvo (.windsurf/rules, Feature-Documentation)
  - Instalar nova camada Workflow Enforcement Engine + just-bash Sandbox (src/workflow-enforcement/)
  - Instalar Vercel Agent Skills automaticamente (npx add-skill vercel-labs/agent-skills)
- Historico: Anteriormente instalacao funcionava corretamente antes da implementacao do Workflow Enforcement Engine

## REGRA A SER SEGUIDA
@[.windsurf/rule-main-rules.md]
