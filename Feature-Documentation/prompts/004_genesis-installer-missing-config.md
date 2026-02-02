## PEDIDO
Corrigir erro de instalacao GenesisIA onde o arquivo .genesis/config.toml nao e encontrado durante a instalacao em projeto alvo, e adicionar protecao contra sobrescricao automatica de instalacoes existentes

## PROBLEMA  
Erro ENOENT ao executar npx github:feryamaha/system_prompt_rules-workflows_windsurf - arquivo .genesis/config.toml nao existe no pacote instalado

## DETALHES DA SOLICITACAO
- Arquivo do instalador: index.js
- Erro ocorre na linha 183 (apos as correcoes anteriores nas linhas 171, 174, 177)
- Stack trace indica falha em copySync ao tentar copiar .genesis/config.toml
- Caminho do erro: C:\Users\...\npm-cache\_npx\...\node_modules\genesisia-skills-sprw\.genesis\config.toml
- As pastas principais (.windsurf, Feature-Documentation, src/workflow-enforcement) foram copiadas corretamente
- Erro especifico: arquivo .genesis/config.toml nao existe no pacote Genesis
- Comportamento esperado: Instalacao completa sem erros de arquivo ausente

**NOVO REQUISITO - Protecao contra sobrescricao:**
- O instalador deve detectar se o Genesis ja esta instalado no projeto alvo
- Verificar existencia das pastas: .windsurf/, Feature-Documentation/, src/workflow-enforcement/, .genesis/
- Se qualquer pasta/arquivo do Genesis ja existir no projeto:
  - EXIGIR confirmacao explicita do usuario antes de sobrescrever
  - Perguntar: "Genesis ja instalado. Deseja sobrescrever? (s/N)"
  - Default: N (nao sobrescrever)
- Se nao existir nenhuma pasta/arquivo do Genesis:
  - Instalar automaticamente sem pedir confirmacao
- Evitar perda acidental de customizacoes ou configuracoes existentes

## REGRA A SER SEGUIDA
@[.windsurf/rule-main-rules.md]
