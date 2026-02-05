# Correção de Caminhos nos Scripts de Hook Nemesis

## Objetivo

Corrigir os scripts de hook `nemesis-pretool-check.sh` e `nemesis-pretool-check.ps1` para buscarem o executável `pretool-hook.ts` no local correto onde o instalador o copia (`/.nemesis/workflow-enforcement/cli/`), garantindo que o sistema de enforcement funcione corretamente em projetos instalados via `npx install-genesis`.

## Arquivos Afetados

- `.nemesis/hooks/nemesis-pretool-check.sh` [modificado]
- `.nemesis/hooks/nemesis-pretool-check.ps1` [modificado]
- `Feature-Documentation/PR/PR_011_FIX-HOOK-PATHS.md` [novo]

## Implementacoes Realizadas

### 1. nemesis-pretool-check.sh

Adicionada terceira verificacao de caminho apos as verificacoes de `src/` e `dist/`:

```bash
elif [ -f "${PROJECT_DIR}/.nemesis/workflow-enforcement/cli/pretool-hook.ts" ]; then
    # Versao instalada via npx install-genesis
    HOOK_SCRIPT="${PROJECT_DIR}/.nemesis/workflow-enforcement/cli/pretool-hook.ts"
    RUNNER="npx ts-node"
```

Atualizada mensagem de erro para listar todos os tres caminhos verificados:
```bash
echo "  - ${PROJECT_DIR}/src/workflow-enforcement/cli/pretool-hook.ts" >&2
echo "  - ${PROJECT_DIR}/dist/workflow-enforcement/cli/pretool-hook.js" >&2
echo "  - ${PROJECT_DIR}/.nemesis/workflow-enforcement/cli/pretool-hook.ts" >&2
```

### 2. nemesis-pretool-check.ps1

Adicionada variavel de caminho para o diretorio `.nemesis/`:
```powershell
$HookScriptNemesis = Join-Path $ProjectDir ".nemesis/workflow-enforcement/cli/pretool-hook.ts"
```

Adicionada terceira condicao elseif apos as verificacoes de `src/` e `dist/`:
```powershell
} elseif (Test-Path $HookScriptNemesis) {
    # Versao instalada via npx install-genesis
    $HookScript = $HookScriptNemesis
    $Runner = "npx ts-node"
```

Atualizada mensagem de erro para listar todos os tres caminhos verificados:
```powershell
Write-Error "  - $HookScriptTs"
Write-Error "  - $HookScriptJs"
Write-Error "  - $HookScriptNemesis"
```

### 3. Logica de Prioridade Mantida

A ordem de verificacao preserva compatibilidade com projetos existentes:
1. `src/workflow-enforcement/cli/pretool-hook.ts` (desenvolvimento local)
2. `dist/workflow-enforcement/cli/pretool-hook.js` (producao compilada)
3. `.nemesis/workflow-enforcement/cli/pretool-hook.ts` (instalacao via npx)

### 3. Correcao de Runner (tsx vs ts-node)

Alterado runner de `npx ts-node` para `npx tsx` no caminho `.nemesis/` para manter consistencia com o instalador:

**Script Bash:**
```bash
RUNNER="npx tsx"  # Anterior: npx ts-node
```

**Script PowerShell:**
```powershell
$Runner = "npx tsx"  # Anterior: npx ts-node
```

**Motivo:** O instalador (`index.js`) instala `tsx` como dependencia, mas os hooks usavam `ts-node`, causando falha quando o executavel nao estava disponivel no projeto alvo.

## Beneficios arquiteturais e prontidao para escala

- **Correcao de falha critica**: Sistema de enforcement agora funciona em projetos instalados via `npx install-genesis`
- **Compatibilidade mantida**: Projetos com estrutura `src/` ou `dist/` continuam funcionando
- **Debugging facilitado**: Mensagens de erro agora listam todos os caminhos verificados
- **Transparencia**: Usuario entende exatamente onde o sistema procura o executavel

## Validacoes CLI

| Comando             | Resultado (OK/FALHA) | Observacoes                    |
|---------------------|----------------------|--------------------------------|
| yarn lint           | N/A                  | Projeto de framework           |
| yarn tsc --noEmit   | OK                   | Scripts shell/PS1 nao afetados |
| yarn build          | N/A                  | Projeto de framework           |
| Teste em projeto alvo | OK                  | Hooks executam corretamente    |
