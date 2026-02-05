# =============================================================================
# Nemesis PreToolUse Hook - PowerShell Version
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
#             command: "powershell -File $PROJECT_DIR/.nemesis/hooks/nemesis-pretool-check.ps1"
#
# =============================================================================

# Configurar strict mode
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Detectar diretorio do projeto (subir 2 niveis de .nemesis/hooks/)
$ScriptDir = Split-Path -Parent $PSCommandPath
$ProjectDir = Split-Path -Parent (Split-Path -Parent $ScriptDir)

# Verificar se estamos em ambiente de desenvolvimento
$HookScriptTs = Join-Path $ProjectDir "src/workflow-enforcement/cli/pretool-hook.ts"
$HookScriptJs = Join-Path $ProjectDir "dist/workflow-enforcement/cli/pretool-hook.js"
$HookScriptNemesis = Join-Path $ProjectDir ".nemesis/workflow-enforcement/cli/pretool-hook.ts"

if (Test-Path $HookScriptTs) {
    $HookScript = $HookScriptTs
    $Runner = "npx ts-node"
} elseif (Test-Path $HookScriptJs) {
    # Versao compilada (producao)
    $HookScript = $HookScriptJs
    $Runner = "node"
} elseif (Test-Path $HookScriptNemesis) {
    # Versao instalada via npx install-genesis
    $HookScript = $HookScriptNemesis
    $Runner = "npx ts-node"
} else {
    Write-Error "NEMESIS ERROR: Hook script nao encontrado"
    Write-Error "Procurado em:"
    Write-Error "  - $HookScriptTs"
    Write-Error "  - $HookScriptJs"
    Write-Error "  - $HookScriptNemesis"
    exit 1
}

# Ler input do stdin (JSON do Windsurf)
$InputData = $input | Out-String

# Verificar se input esta vazio
if ([string]::IsNullOrWhiteSpace($InputData)) {
    Write-Warning "NEMESIS WARNING: Input vazio recebido"
    # Permite continuar - o hook.ts vai tratar o erro
}

# Executar pretool-hook.ts passando JSON via stdin
try {
    Push-Location $ProjectDir
    
    $Process = Start-Process -FilePath "npx" -ArgumentList "ts-node", "`"$HookScript`"" -RedirectStandardInput -RedirectStandardOutput -RedirectStandardError -PassThru -NoNewWindow -Wait
    
    # Passar input para o processo
    $Process.StandardInput.WriteLine($InputData)
    $Process.StandardInput.Close()
    
    # Capturar saida
    $StdOut = $Process.StandardOutput.ReadToEnd()
    $StdErr = $Process.StandardError.ReadToEnd()
    $ExitCode = $Process.ExitCode
    
    Pop-Location
    
    # Se exit code 2, bloquear com mensagem no stderr (formato para IA)
    if ($ExitCode -eq 2) {
        Write-Error $StdErr
        exit 2
    }
    
    # Se exit code 1, erro tecnico (nao bloqueia, mas reporta)
    if ($ExitCode -eq 1) {
        Write-Error "NEMESIS ERROR: Erro tecnico no hook"
        Write-Error $StdErr
        # Permite continuar para nao travar o workflow, mas loga o erro
        exit 0
    }
    
    # Exit code 0 = permissao concedida
    exit 0
    
} catch {
    Write-Error "NEMESIS ERROR: Erro ao executar hook: $_"
    # Em caso de erro, permite continuar para nao travar o IDE
    exit 0
}
