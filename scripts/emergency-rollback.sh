#!/bin/bash

# Emergency Rollback Script for Nemesis Enforcement Engine
# Reverte para sistema anterior se algo falhar na migração v2

set -euo pipefail

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções de logging
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se estamos no diretório correto
if [[ ! -f ".windsurf/rules/rule-main-rules.md" ]]; then
    log_error "Este script deve ser executado na raiz do projeto"
    exit 1
fi

# Criar timestamp para backup
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
ROLLBACK_DIR=".nemesis/rollback_${TIMESTAMP}"

log_info "Iniciando rollback de emergência do Nemesis v2..."
log_info "Backup será salvo em: ${ROLLBACK_DIR}"

# Criar diretório de rollback
mkdir -p "${ROLLBACK_DIR}"

# Função para fazer backup antes de reverter
backup_before_rollback() {
    log_info "Fazendo backup do estado atual..."
    
    # Backup dos hooks atuais
    if [[ -d ".nemesis/hooks" ]]; then
        cp -r .nemesis/hooks "${ROLLBACK_DIR}/hooks_current"
        log_success "Hooks atuais backupados"
    fi
    
    # Backup do workflow-enforcement se existir
    if [[ -d ".nemesis/workflow-enforcement" ]]; then
        cp -r .nemesis/workflow-enforcement "${ROLLBACK_DIR}/workflow-enforcement_current"
        log_success "Workflow enforcement atual backupado"
    fi
    
    # Backup de configurações
    if [[ -f ".nemesis/config.toml" ]]; then
        cp .nemesis/config.toml "${ROLLBACK_DIR}/config_current.toml"
        log_success "Configuração atual backupada"
    fi
    
    # Backup do src/workflow-enforcement se existir
    if [[ -d "src/workflow-enforcement" ]]; then
        cp -r src/workflow-enforcement "${ROLLBACK_DIR}/src-workflow-enforcement_current"
        log_success "Src workflow enforcement atual backupado"
    fi
}

# Função para verificar se existe backup v1
check_v1_backup() {
    if [[ -d ".nemesis/backup/v1" ]]; then
        return 0
    elif [[ -d ".nemesis/backup" ]] && [[ -f ".nemesis/backup/nemesis-pretool-check.js.bak" ]]; then
        return 0
    else
        return 1
    fi
}

# Função para restaurar da v1
restore_from_v1() {
    log_info "Restaurando do backup v1..."
    
    if [[ -d ".nemesis/backup/v1/hooks" ]]; then
        cp -r .nemesis/backup/v1/hooks/* .nemesis/hooks/
        log_success "Hooks v1 restaurados"
    elif [[ -f ".nemesis/backup/nemesis-pretool-check.js.bak" ]]; then
        cp .nemesis/backup/nemesis-pretool-check.js.bak .nemesis/hooks/nemesis-pretool-check.js
        log_success "PreToolUse hook v1 restaurado"
    fi
    
    # Remover hooks v2 que não existiam na v1
    if [[ -f ".nemesis/hooks/pre-edit-hook.js" ]]; then
        rm .nemesis/hooks/pre-edit-hook.js
        log_info "Pre-edit hook (v2) removido"
    fi
    
    # Remover workflow-enforcement v2
    if [[ -d ".nemesis/workflow-enforcement" ]]; then
        rm -rf .nemesis/workflow-enforcement
        log_info "Workflow enforcement v2 removido"
    fi
    
    # Restaurar configuração v1 se existir
    if [[ -f ".nemesis/backup/v1/config-backup.toml" ]]; then
        cp .nemesis/backup/v1/config-backup.toml .nemesis/config.toml
        log_success "Configuração v1 restaurada"
    fi
}

# Função para criar hooks v1 mínimos
create_minimal_v1_hooks() {
    log_warning "Criando hooks v1 mínimos (backup não encontrado)..."
    
    mkdir -p .nemesis/hooks
    
    # Criar pretool-check.js básico v1
    cat > .nemesis/hooks/nemesis-pretool-check.js << 'EOF'
#!/usr/bin/env node
/**
 * Nemesis v1 PreToolUse Hook - Minimal Rollback Version
 */

const { execSync } = require('child_process');
const fs = require('fs');

// Ler stdin
let input = '';
try {
    input = fs.readFileSync(0, 'utf-8');
} catch (err) {
    console.error('[NEMESIS v1] Erro ao ler stdin');
    process.exit(2);
}

if (!input || !input.trim()) {
    console.error('[NEMESIS v1] Nenhum input recebido');
    process.exit(2);
}

try {
    // Validação básica v1 - apenas bloquear comandos muito perigosos
    const data = JSON.parse(input);
    
    if (data.tool === 'bash' && data.command) {
        const dangerousCommands = ['rm -rf', 'sudo', 'curl | bash', 'wget | bash'];
        const isDangerous = dangerousCommands.some(cmd => data.command.includes(cmd));
        
        if (isDangerous) {
            console.error('[NEMESIS v1] Comando perigoso bloqueado');
            process.exit(2);
        }
    }
    
    process.exit(0);
} catch (error) {
    console.error('[NEMESIS v1] Erro na validação');
    process.exit(2);
}
EOF

    chmod +x .nemesis/hooks/nemesis-pretool-check.js
    log_success "Hook v1 mínimo criado"
}

# Função para limpar arquivos v2
cleanup_v2_files() {
    log_info "Limpando arquivos v2..."
    
    # Remover hooks v2
    if [[ -f ".nemesis/hooks/pre-edit-hook.js" ]]; then
        rm .nemesis/hooks/pre-edit-hook.js
        log_info "Pre-edit hook removido"
    fi
    
    # Remover workflow-enforcement v2
    if [[ -d ".nemesis/workflow-enforcement" ]]; then
        rm -rf .nemesis/workflow-enforcement
        log_info "Workflow enforcement v2 removido"
    fi
    
    # Remover src/workflow-enforcement v2
    if [[ -d "src/workflow-enforcement" ]]; then
        rm -rf src/workflow-enforcement
        log_info "Src workflow enforcement v2 removido"
    fi
    
    # Remover testes v2
    if [[ -d "tests/workflow-enforcement" ]]; then
        rm -rf tests/workflow-enforcement
        log_info "Testes v2 removidos"
    fi
}

# Função para testar rollback
test_rollback() {
    log_info "Testando rollback..."
    
    # Teste básico do hook
    echo '{"tool":"bash","command":"echo test"}' | node .nemesis/hooks/nemesis-pretool-check.js
    
    if [[ $? -eq 0 ]]; then
        log_success "Hook v1 está funcionando"
        return 0
    else
        log_error "Hook v1 não está funcionando"
        return 1
    fi
}

# Função para gerar relatório de rollback
generate_rollback_report() {
    log_info "Gerando relatório de rollback..."
    
    cat > "${ROLLBACK_DIR}/rollback_report.md" << EOF
# Nemesis v2 Emergency Rollback Report

**Data:** $(date)
**Timestamp:** ${TIMESTAMP}
**Status:** ${ROLLBACK_STATUS}

## Ações Executadas

1. **Backup do Estado Atual**
   - Hooks: $([ -d "${ROLLBACK_DIR}/hooks_current" ] && echo "✅" || echo "❌")
   - Workflow Enforcement: $([ -d "${ROLLBACK_DIR}/workflow-enforcement_current" ] && echo "✅" || echo "❌")
   - Configuração: $([ -f "${ROLLBACK_DIR}/config_current.toml" ] && echo "✅" || echo "❌")

2. **Restauração v1**
   - Backup v1 encontrado: $([ -d ".nemesis/backup/v1" ] && echo "✅" || echo "❌")
   - Hooks restaurados: $([ -f ".nemesis/hooks/nemesis-pretool-check.js" ] && echo "✅" || echo "❌")
   - Arquivos v2 removidos: ✅

3. **Testes**
   - Hook funcionando: $([ "$TEST_RESULT" = "0" ] && echo "✅" || echo "❌")

## Arquivos Mantidos para Análise

- Estado atual em: ${ROLLBACK_DIR}/
- Logs do rollback em: ${ROLLBACK_DIR}/rollback.log

## Próximos Passos

1. Investigar causa da falha do v2
2. Corrigir problemas identificados
3. Tentar migração novamente quando estiver pronto

## Comandos Úteis

\`\`\`bash
# Verificar status atual
node -e "console.log('Nemesis v1 restaurado')"

# Testar validação
echo '{"tool":"bash","command":"echo test"}' | node .nemesis/hooks/nemesis-pretool-check.js

# Reinstalar v2 quando pronto
npm run migration:v2
\`\`\`
EOF

    log_success "Relatório gerado: ${ROLLBACK_DIR}/rollback_report.md"
}

# Fluxo principal
main() {
    # Iniciar log
    exec 1> >(tee -a "${ROLLBACK_DIR}/rollback.log")
    exec 2> >(tee -a "${ROLLBACK_DIR}/rollback.log" >&2)
    
    log_info "=== Nemesis v2 Emergency Rollback ==="
    log_info "Timestamp: ${TIMESTAMP}"
    
    # 1. Backup do estado atual
    backup_before_rollback
    
    # 2. Verificar se existe backup v1
    if check_v1_backup; then
        log_info "Backup v1 encontrado, restaurando..."
        restore_from_v1
    else
        log_warning "Backup v1 não encontrado, criando hooks mínimos..."
        create_minimal_v1_hooks
    fi
    
    # 3. Limpar arquivos v2
    cleanup_v2_files
    
    # 4. Testar rollback
    if test_rollback; then
        ROLLBACK_STATUS="SUCCESS"
        TEST_RESULT="0"
        log_success "✅ Rollback concluído com sucesso!"
    else
        ROLLBACK_STATUS="PARTIAL"
        TEST_RESULT="1"
        log_error "❌ Rollback concluído com warnings"
    fi
    
    # 5. Gerar relatório
    generate_rollback_report
    
    # 6. Informações finais
    echo
    log_info "=== Resumo do Rollback ==="
    log_info "Status: ${ROLLBACK_STATUS}"
    log_info "Backup salvo em: ${ROLLBACK_DIR}"
    log_info "Relatório: ${ROLLBACK_DIR}/rollback_report.md"
    
    if [[ "$ROLLBACK_STATUS" = "SUCCESS" ]]; then
        log_success "Sistema está operacional com Nemesis v1"
        echo
        log_info "Para investigar a falha do v2:"
        log_info "1. Analise os logs em: ${ROLLBACK_DIR}/"
        log_info "2. Verifique o relatório: ${ROLLBACK_DIR}/rollback_report.md"
        log_info "3. Teste correções antes de nova migração"
    else
        log_warning "Sistema pode não estar totalmente funcional"
        log_info "Verifique os logs e execute testes manuais"
    fi
    
    echo
    log_info "=== Comandos Pós-Rollback ==="
    echo "# Verificar funcionamento:"
    echo "echo '{\"tool\":\"bash\",\"command\":\"echo test\"}' | node .nemesis/hooks/nemesis-pretool-check.js"
    echo
    echo "# Verificar arquivos:"
    echo "ls -la .nemesis/hooks/"
    echo
    echo "# Analisar logs:"
    echo "cat ${ROLLBACK_DIR}/rollback.log"
    echo
}

# Trap para capturar sinais e fazer cleanup
trap 'log_error "Rollback interrompido"; exit 1' INT TERM

# Executar fluxo principal
main "$@"
