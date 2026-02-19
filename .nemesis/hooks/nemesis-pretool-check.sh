#!/bin/bash
# =============================================================================
# Nemesis PreToolUse Hook - Bash Version
# =============================================================================

set -e

# Detectar diretorio do projeto
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"

# Verificar se estamos em ambiente de desenvolvimento
if [ -f "${PROJECT_DIR}/src/workflow-enforcement/cli/pretool-hook.ts" ]; then
    HOOK_SCRIPT="${PROJECT_DIR}/src/workflow-enforcement/cli/pretool-hook.ts"
    RUNNER="npx ts-node"
elif [ -f "${PROJECT_DIR}/dist/workflow-enforcement/cli/pretool-hook.js" ]; then
    HOOK_SCRIPT="${PROJECT_DIR}/dist/workflow-enforcement/cli/pretool-hook.js"
    RUNNER="node"
elif [ -f "${PROJECT_DIR}/.nemesis/workflow-enforcement/cli/pretool-hook.ts" ]; then
    HOOK_SCRIPT="${PROJECT_DIR}/.nemesis/workflow-enforcement/cli/pretool-hook.ts"
    RUNNER="npx tsx"
else
    echo "NEMESIS ERROR: Hook script nao encontrado" >&2
    echo "Procurado em:" >&2
    echo "  - ${PROJECT_DIR}/src/workflow-enforcement/cli/pretool-hook.ts" >&2
    echo "  - ${PROJECT_DIR}/dist/workflow-enforcement/cli/pretool-hook.js" >&2
    echo "  - ${PROJECT_DIR}/.nemesis/workflow-enforcement/cli/pretool-hook.ts" >&2
    exit 1
fi

# Ler input do stdin com método não-bloqueante
INPUT=""
if [ -t 0 ]; then
    # stdin é um terminal (modo interativo) - não ler
    INPUT=""
else
    # stdin é um pipe - ler com timeout
    INPUT=$(head -c 65536 <&0 2>/dev/null || echo "")
fi

# Verificar se input esta vazio
if [ -z "$INPUT" ]; then
    echo "NEMESIS WARNING: Input vazio recebido" >&2
fi

# Executar pretool-hook.ts passando JSON via stdin
RESULT=$(echo "$INPUT" | (cd "$PROJECT_DIR" && $RUNNER "$HOOK_SCRIPT") 2>&1)
EXIT_CODE=$?

# Se exit code 2, bloquear com mensagem no stderr
if [ $EXIT_CODE -eq 2 ]; then
    echo "$RESULT" >&2
    exit 2
fi

# Se exit code 1, erro tecnico (nao bloqueia, mas reporta)
if [ $EXIT_CODE -eq 1 ]; then
    echo "NEMESIS ERROR: Erro tecnico no hook" >&2
    echo "$RESULT" >&2
    exit 0
fi

# Exit code 0 = permissao concedida
exit 0
