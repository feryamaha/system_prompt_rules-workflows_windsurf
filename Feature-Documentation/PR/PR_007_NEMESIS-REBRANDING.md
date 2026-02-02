# Renomeacao GenesisIA para Nemesis Framework e Reestruturacao de Caminhos

## Objetivo

Renomeacao completa do projeto de GenesisIA Skills SPRW para Nemesis Framework, atualizando todas as referencias, nomes de pacotes, comandos de instalacao e corrigindo a estrutura de diretorios para consolidar os scripts de workflow enforcement dentro da pasta `.genesis/`.

## Arquivos afetados

- `.genesis/config.toml` [modificado]
- `README.md` [modificado]
- `index.js` [modificado]
- `package.json` [modificado]
- `Feature-Documentation/prompts/006_genesis-container-isolation.md` [novo]

## Implementacoes realizadas

### 1. .genesis/config.toml
Atualizacao do cabecalho e secao de configuracao, alterando `Genesis Framework` para `Nemesis Framework` e `[genesis]` para `[nemesis]`. Mantidas todas as configuracoes de comportamento do instalador.

### 2. README.md
Substituicao de todas as ocorrencias de GenesisIA/Gênesis por Nemesis, incluindo:
- Titulo da secao de instalacao via NPM
- Comando de instalacao de `npx install-genesis` para `npx install-nemesis`
- Fluxo de instalacao seletiva com novo nome
- Diagrama de fluxo atualizado
- Correcao do caminho de `src/workflow-enforcement/` para `.genesis/workflow-enforcement/` na lista de arquivos core

### 3. index.js
Atualizacao completa do script de instalacao:
- Renomeacao de constantes (`genesisSection` para `nemesisSection`)
- Atualizacao de marcadores no `.gitignore` (`START/END Genesis` para `START/END Nemesis`)
- Mensagens de log atualizadas (`Genesis ja instalado` para `Nemesis ja instalado`)
- Correcao do caminho de instalacao de `src/workflow-enforcement` para `.genesis/workflow-enforcement`
- Atualizacao de comentarios explicativos
- Funcao `checkExistingInstallation` atualizada para verificar novo caminho

### 4. package.json
Alteracoes estruturais no manifesto do pacote:
- Nome do pacote: `genesisia-skills-sprw` → `nemesis-framework`
- Descricao atualizada com mencao a Nemesis
- Binario alterado: `install-genesis` → `install-nemesis`

### 5. Feature-Documentation/prompts/006_genesis-container-isolation.md
Arquivo de prompt RAG novo contendo especificacao tecnica para isolamento do container Genesis/Nemesis com definicoes de restricoes de acesso a arquivos.

## Beneficios arquiteturais e prontidao para escala

- Consistencia de marca com nova identidade Nemesis Framework
- Estrutura de diretorios consolidada com scripts de enforcement dentro de `.genesis/`
- Comando de instalacao alinhado ao novo nome do pacote NPM
- Preparacao para distribuicao comercial com identidade unificada
- Separacao clara entre codigo do instalador e scripts de enforcement
- Governanca de instalacao preservada com comportamentos identicos

| Comando             | Resultado (OK/FALHA) | Observacoes            |
|---------------------|----------------------|------------------------|
| yarn lint           | N/A                  | Projeto de documentacao/scripts |
| yarn tsc --noEmit   | N/A                  | Projeto de documentacao/scripts |
| yarn build          | N/A                  | Projeto de documentacao/scripts |
