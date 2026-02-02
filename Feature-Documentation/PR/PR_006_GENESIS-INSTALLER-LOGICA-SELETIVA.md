# Implementação de Lógica Seletiva no Instalador GenesisIA

## Objetivo
Implementar lógica de instalação diferenciada no GenesisIA Installer para diferenciar entre arquivos core (sempre sobrescrevem) e templates (copiados seletivamente), além de adicionar fluxo de confirmação do usuário para reinstalações existentes.

## Arquivos Afetados
- `index.js` [modificado]
- `README.md` [modificado]

## Implementações Realizadas

### 1. index.js
Adicionadas novas funções para implementar cópia seletiva:

#### Funções Auxiliares (linhas 153-226)
- **isTemplateFile(relativePath)**: Identifica arquivos template em Feature-Documentation/ verificando se o nome contém "template" ou "exemplo-template"
- **shouldCopyFile()**: Decide se arquivo deve ser copiado (core sempre sobrescreve, template só se não existir)
- **copyFileSelective()**: Executa cópia com lógica de sobrescrita condicional
- **copyDirectorySelective()**: Itera recursivamente aplicando regras de cópia seletiva com contadores de arquivos copiados/ignorados

#### Fluxo de Confirmação (linhas 228-277)
- **checkExistingInstallation()**: Verifica se Genesis já está instalado checando .windsurf/, Feature-Documentation/, src/workflow-enforcement/, .genesis/
- **askUserConfirmation()**: Interface readline para perguntar ao usuário se deseja sobrescrever instalação existente

#### Atualização de runInstallation() (linhas 320-348)
- **.windsurf/**: Copiado como core (isCoreDirectory = true) - sempre sobrescreve
- **Feature-Documentation/**: Copiado como templates (isCoreDirectory = false) - só copia se não existir
- **src/workflow-enforcement/**: Copiado como core (isCoreDirectory = true) - sempre sobrescreve

#### Logging Aprimorado
- Contagem de arquivos copiados por categoria
- Indicação de arquivos ignorados (já existem ou não são templates)

### 2. README.md
Seção "Fluxo de Instalação Seletiva" (linhas 87-121) já existia com documentação completa do fluxo de decisão e comportamento esperado.

## Benefícios Arquiteturais e Prontidão para Escala

### Governança de Instalação
- **Separação clara** entre arquivos core (atualizáveis) e templates (preserváveis)
- **Proteção automática** contra sobrescrita acidental de documentação do usuário
- **Fluxo de decisão** explícito com confirmação do usuário para reinstalações

### Escalabilidade do Framework
- **Instalação incremental**: Templates não são sobrescritos, permitindo personalização do usuário
- **Manutenção simplificada**: Arquivos core sempre atualizados sem afetar customizações
- **Experiência do usuário**: Fluxo claro de decisão com logging informativo

### Redução de Retrabalho
- **Zero surpresas**: Usuário sabe exatamente o que será sobrescrito
- **Preservação de trabalho**: Documentação personalizada não é perdida em atualizações
- **Instalação segura**: Confirmação explícita antes de qualquer sobrescrita

| Comando             | Resultado (OK/FALHA) | Observações            |
|---------------------|----------------------|------------------------|
| yarn lint           | N/A                  | Script não configurado |
| yarn tsc --noEmit   | OK                   | TypeScript valido      |
| yarn build          | N/A                  | Script não configurado |
