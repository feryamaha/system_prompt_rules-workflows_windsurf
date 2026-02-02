## PEDIDO
Reestruturar instalador GenesisIA para mover pasta src/workflow-enforcement para dentro do container .genesis/, isolando todos os arquivos de governança do Genesis em seu próprio diretório sem poluir a estrutura src/ do projeto hospedeiro

## PROBLEMA  
Pasta src/workflow-enforcement está sendo criada automaticamente dentro da pasta src/ do projeto real durante instalação, misturando arquivos de configuração do Genesis com código do projeto hospedeiro e violando o princípio de isolamento do container Genesis

## DETALHES DA SOLICITAÇÃO
- Arquivo de instalação: @index.js
- Pasta problemática: src/workflow-enforcement/ (atualmente instalada em src/ do projeto)
- Local desejado: .genesis/workflow-enforcement/ (dentro do container Genesis)
- Comportamento observado: Instalador cria src/workflow-enforcement/ na raiz do projeto
- Comportamento esperado: Todos os arquivos Genesis devem ficar dentro de .genesis/
- Princípio: Container Genesis deve ser self-contained e não poluir estrutura do projeto
- Arquivos core que devem mudar de local:
  - src/workflow-enforcement/ → .genesis/workflow-enforcement/
  - Atualizar todas as referências no instalador
  - Atualizar caminhos em config.toml se necessário
- Teste realizado: Instalação em Auclan-UI-KIT criou src/workflow-enforcement/ ao invés de .genesis/workflow-enforcement/
- .gitignore comportamento: Correto (adiciona regras sem sobrescrever)

## REBRANDING: GENESISIA → NEMESIS
O projeto passa a se chamar Nemesis para comunicar imediatamente ao time: "Este sistema vai me auditar e me impedir de cometer erros." Enquanto outros frameworks focam no Genesis (apenas iniciar), o Nemesis foca em garantir que o que foi iniciado siga a lei ou seja bloqueado.

### Arquivos a atualizar com novo conceito:
- @README.md - Atualizar identidade e descrição do projeto
- @.windsurf/rules/origin-rules.md - Atualizar filosofia e propósito
- @.windsurf/rules/README.md - Atualizar documentação técnica

### Mudanças necessárias:
- Todas as referências a "GenesisIA" ou "Genesis" devem ser atualizadas para "Nemesis"
- Comando de instalação: de install-genesis para install-nemesis
- Pasta de configuração: de .genesis/ para .nemesis/ (ou manter .genesis/ por compatibilidade?)
- Manter retrocompatibilidade ou fazer migration completa?
@[.windsurf/rule-main-rules.md]
