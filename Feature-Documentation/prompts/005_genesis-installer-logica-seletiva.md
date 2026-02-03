## PEDIDO
Atualizar instalador NemesisIA (index.js) para implementar lógica de instalação diferenciada: arquivos core sempre sobrescrevem, templates são seletivos, e proteção contra sobrescrita solicita confirmação do usuário quando o Nemesis já está instalado

## PROBLEMA  
Instalador atual não diferencia entre arquivos elementares (que devem sempre ser atualizados) e arquivos de template (que devem ser seletivos), além de não implementar corretamente o fluxo de confirmação para projetos com instalação existente

## DETALHES DA SOLICITAÇÃO
- Arquivo principal: @index.js
- Arquivos core (sempre sobrescrevem, mesmo em reinstalação):
  - .windsurf/rules/ e subpastas
  - .windsurf/workflows/ e subpastas
  - src/workflow-enforcement/ e subpastas
- Arquivos templates (copiados apenas se não existirem):
  - Feature-Documentation/*.md (apenas arquivos com "template" ou "exemplo-template" no nome)
  - Feature-Documentation/issues/*.md (apenas templates)
  - Feature-Documentation/PR/*.md (apenas templates)
  - Feature-Documentation/prompts/*.md (apenas templates)
  - Feature-Documentation/to-do-list/*.md (apenas templates)
- Arquivos a serem ignorados (nunca copiados):
  - Qualquer arquivo em Feature-Documentation/ que não contenha "template" no nome
- Fluxo de decisão:
  1. Verificar se Nemesis está instalado (checar existência de .windsurf/, Feature-Documentation/, src/workflow-enforcement/, .nemesis/)
  2. Se não instalado: instalar tudo sem perguntar
  3. Se instalado: listar o que existe → perguntar "Deseja sobrescrever? (s/N)" → default "N" → cancelar se não confirmado
- README.md: adicionar seção documentando esse fluxo de instalação

## REGRA A SER SEGUIDA
@[.windsurf/rule-main-rules.md]
