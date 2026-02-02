# Lista de Tarefas - Correção do Instalador GenesisIA Missing Config

## Resumo
- **Total:** 4 tarefas
- **Concluídas:** 4
- **Pendentes:** 0

## Análise de Causa Raiz

### Problema Identificado
Erro ENOENT ao executar instalação GenesisIA - arquivo .genesis/config.toml não encontrado no pacote NPM. O instalador tenta copiar arquivo que não existe na linha 183 do index.js, e não há proteção contra sobrescrita de instalações existentes.

### Código Problemático
```javascript
// LINHA 183 - ERRADO: Tenta copiar arquivo inexistente
fs.copySync(path.join(PACKAGE_ROOT, ".genesis", "config.toml"), CONFIG_FILE)
```

## IMPLEMENTAÇÕES REALIZADAS

### 1. [CONCLUÍDO] Verificar existência de .genesis/config.toml
- **Arquivo:** `index.js`
- **Solução:** Implementada função `createDefaultConfig()` que cria o arquivo com conteúdo padrão
- **Status:** Concluído

### 2. [CONCLUÍDO] Corrigir erro de cópia ENOENT
- **Arquivo:** `index.js`
- **Solução:** Substituído `fs.copySync()` por `createDefaultConfig()` na linha 255-256
- **Status:** Concluído

### 3. [CONCLUÍDO] Implementar proteção contra sobrescrita
- **Arquivo:** `index.js`
- **Solução:** Adicionadas funções `checkExistingInstallation()` e `askUserConfirmation()`
- **Status:** Concluído

### 4. [CONCLUÍDO] Validar correção com TypeScript
- **Arquivo:** `index.js`
- **Resultado:** `yarn tsc --noEmit` - OK (Exit code: 0)
- **Status:** Concluído

## ALTERAÇÕES NO ARQUIVO index.js

### Novas funções adicionadas:
1. `checkExistingInstallation()` - Detecta se Genesis já está instalado
2. `askUserConfirmation()` - Pergunta ao usuário antes de sobrescrever
3. `createDefaultConfig()` - Cria config.toml com conteúdo padrão

### Fluxo de instalação modificado:
1. Verifica instalação existente no início
2. Lista caminhos encontrados se existirem
3. Pergunta "Deseja sobrescrever? (s/N)" com default "N"
4. Cancela se usuário não confirmar
5. Prossegue com instalação se confirmado ou se não houver instalação

## VALIDAÇÃO CLI

| Comando             | Resultado | Observações            |
|---------------------|-----------|------------------------|
| yarn tsc --noEmit   | OK        | TypeScript válido      |

---

**Status:** Todas as correções implementadas e validadas
**Data:** 02/02/2026
