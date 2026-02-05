#!/bin/bash
# =============================================================================
# Nemesis PreToolUse Hook - Bash Version
# =============================================================================
# 
# Este script e chamado automaticamente pelo Windsurf IDE via PreToolUse hook
# antes de executar qualquer ferramenta (Edit, Write, Bash, etc.)
#
# Recebe JSON via stdin no formato oficial Windsurf e passa para pretool-hook.ts
# Retorna exit code 2 para bloquear tecnicamente a ferramenta se violacao detectada
#
# Uso: Configurado no frontmatter dos workflows em .windsurf/workflows/
#
# Exemplo de configuracao no workflow:
#   hooks:
#     PreToolUse:
#       - matcher: "Edit|Write|Bash"
#         hooks:
#           - type: command
#             command: "$PROJECT_DIR/.nemesis/hooks/nemesis-pretool-check.sh"
#
# =============================================================================

set -e

# Detectar diretorio do projeto (subir 2 niveis de .nemesis/hooks/)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"

# Verificar se estamos em ambiente de desenvolvimento
if [ -f "${PROJECT_DIR}/src/workflow-enforcement/cli/pretool-hook.ts" ]; then
    HOOK_SCRIPT="${PROJECT_DIR}/src/workflow-enforcement/cli/pretool-hook.ts"
    RUNNER="npx ts-node"
elif [ -f "${PROJECT_DIR}/dist/workflow-enforcement/cli/pretool-hook.js" ]; then
    # Versao compilada (producao)
    HOOK_SCRIPT="${PROJECT_DIR}/dist/workflow-enforcement/cli/pretool-hook.js"
    RUNNER="node"
elif [ -f "${PROJECT_DIR}/.nemesis/workflow-enforcement/cli/pretool-hook.ts" ]; then
    # Versao instalada via npx install-genesis
    HOOK_SCRIPT="${PROJECT_DIR}/.nemesis/workflow-enforcement/cli/pretool-hook.ts"
    RUNNER="npx ts-node"
else
    echo "NEMESIS ERROR: Hook script nao encontrado" >&2
    echo "Procurado em:" >&2
    echo "  - ${PROJECT_DIR}/src/workflow-enforcement/cli/pretool-hook.ts" >&2
    echo "  - ${PROJECT_DIR}/dist/workflow-enforcement/cli/pretool-hook.js" >&2
    echo "  - ${PROJECT_DIR}/.nemesis/workflow-enforcement/cli/pretool-hook.ts" >&2
    exit 1
fi

# Ler input do stdin (JSON do Windsurf)
INPUT=$(cat)

# Verificar se input esta vazio
if [ -z "$INPUT" ]; then
    echo "NEMESIS WARNING: Input vazio recebido" >&2
    # Permite continuar - o hook.ts vai tratar o erro
fi

# Executar pretool-hook.ts passando JSON via stdin
RESULT=$(echo "$INPUT" | (cd "$PROJECT_DIR" && $RUNNER "$HOOK_SCRIPT") 2>&1)
EXIT_CODE=$?

# Se exit code 2, bloquear com mensagem no stderr (formato para IA)
if [ $EXIT_CODE -eq 2 ]; then
    echo "$RESULT" >&2
    exit 2
fi

# Se exit code 1, erro tecnico (nao bloqueia, mas reporta)
if [ $EXIT_CODE -eq 1 ]; then
    echo "NEMESIS ERROR: Erro tecnico no hook" >&2
    echo "$RESULT" >&2
    # Permite continuar para nao travar o workflow, mas loga o erro
    exit 0
fi

# Exit code 0 = permissao concedida
exit 0
