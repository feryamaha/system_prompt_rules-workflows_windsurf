## PEDIDO
Refatorar o Nemesis para usar Bun como gerenciador de pacotes principal em vez de Yarn, garantindo que o sistema detecte automaticamente o gerenciador de pacotes do projeto hospedeiro durante a instalação e não modifique o gerenciador existente.

## PROBLEMA  
O Nemesis está modificando scripts de projetos que usam Bun, substituindo comandos Bun por Yarn durante a instalação, o que é hostil e perigoso para o projeto hospedeiro.

## DETALHES DA SOLICITAÇÃO
- Sistema atual: Nemesis configurado para Yarn
- Problema: Instalação em projetos com Bun modifica scripts Bun → Yarn
- Requisito: Detecção automática do gerenciador de pacotes do projeto
- Requisito: Adaptação ao contexto do projeto sem modificar gerenciador existente
- Ação principal: Migrar 100% do Nemesis para usar Bun ao invés de Yarn
- Impacto: Todos os arquivos do Nemesis que mencionam Yarn devem ser atualizados para Bun: workflow-enforcement, rules, src, .nemesis/hooks/nemesis-pretool-check.js 100% do Nemesis

## REGRAS A SEREM SEGUIDAS
@[.windsurf/rules/rule-main-rules.md]