## PEDIDO
Reestruturar instalador NemesisIA para mover pasta src/workflow-enforcement para dentro do container .nemesis/, isolando todos os arquivos de governança do Nemesis em seu próprio diretório sem poluir a estrutura src/ do projeto hospedeiro

## PROBLEMA  
Pasta src/workflow-enforcement está sendo criada automaticamente dentro da pasta src/ do projeto real durante instalação, misturando arquivos de configuração do Nemesis com código do projeto hospedeiro e violando o princípio de isolamento do container Nemesis

## DETALHES DA SOLICITAÇÃO
- Arquivo de instalação: @index.js
- Pasta problemática: src/workflow-enforcement/ (atualmente instalada em src/ do projeto)
- Local desejado: .nemesis/workflow-enforcement/ (dentro do container Nemesis)
- Comportamento observado: Instalador cria src/workflow-enforcement/ na raiz do projeto
- Comportamento esperado: Todos os arquivos Nemesis devem ficar dentro de .nemesis/
- Princípio: Container Nemesis deve ser self-contained e não poluir estrutura do projeto
- Arquivos core que devem mudar de local:
  - src/workflow-enforcement/ → .nemesis/workflow-enforcement/
  - Atualizar todas as referências no instalador
  - Atualizar caminhos em config.toml se necessário
- Teste realizado: Instalação em Auclan-UI-KIT criou src/workflow-enforcement/ ao invés de .nemesis/workflow-enforcement/
- .gitignore comportamento: Correto (adiciona regras sem sobrescrever)

## REBRANDING: GENESISIA → NEMESIS
O projeto passa a se chamar Nemesis para comunicar imediatamente ao time: "Este sistema vai me auditar e me impedir de cometer erros." Enquanto outros frameworks focam no Nemesis (apenas iniciar), o Nemesis foca em garantir que o que foi iniciado siga a lei ou seja bloqueado.

### Arquivos a atualizar com novo conceito:
- @README.md - Atualizar identidade e descrição do projeto
- @.windsurf/rules/origin-rules.md - Atualizar filosofia e propósito
- @.windsurf/rules/README.md - Atualizar documentação técnica

### Mudanças necessárias:
- Todas as referências a "NemesisIA" ou "Nemesis" devem ser atualizadas para "Nemesis"
- Comando de instalação: de install-nemesis para install-nemesis
- Pasta de configuração: de .nemesis/ para .nemesis/ (ou manter .nemesis/ por compatibilidade?)
- Manter retrocompatibilidade ou fazer migration completa?
@[.windsurf/rule-main-rules.md]
