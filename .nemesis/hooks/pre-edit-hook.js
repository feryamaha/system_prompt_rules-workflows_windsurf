#!/usr/bin/env node

/**
 * Pre-Edit Hook for Nemesis Enforcement Engine
 * Intercepts EDIÇÕES de código (não só bash) e valida contra @.windsurf/rules
 */

const { existsSync, readFileSync } = require('fs')
const { join } = require('path')

// Importar módulos do enforcement engine
const projectRoot = process.cwd()
const enforcementModulePath = join(projectRoot, 'src', 'workflow-enforcement')

let IAActionValidator
try {
  // Tentar carregar módulo TypeScript compilado
  const enforcementModule = require(join(enforcementModulePath, 'index.js'))
  IAActionValidator = enforcementModule.IAActionValidator
} catch (error) {
  // Fallback para validação básica se módulo não estiver disponível
  console.log('🔧 Nemesis Enforcement Engine não encontrado, usando validação básica')
}

/**
 * Analisa uma ação de edição da IA
 */
function analyzeEditAction(action) {
  const { type, target, content, originalContent } = action
  
  // Se o validador avançado estiver disponível, usar ele
  if (IAActionValidator) {
    try {
      const validator = new IAActionValidator()
      return validator.validateAction(action)
    } catch (error) {
      console.error('❌ Erro no validador avançado:', error)
    }
  }
  
  // Validação básica de fallback
  return basicValidation(action)
}

/**
 * Validação básica quando módulo avançado não está disponível
 */
function basicValidation(action) {
  const { type, target, content } = action
  const violations = []
  const suggestions = []
  
  if (type === 'edit' || type === 'create') {
    if (!content) {
      return {
        allowed: true,
        reason: 'Sem conteúdo para validar',
        violatedRules: [],
        severity: 'info',
        suggestions: []
      }
    }
    
    // Verificar padrões básicos proibidos
    const prohibitedPatterns = [
      {
        pattern: /style\s*=\s*{[^}]*}/g,
        message: 'CSS inline detectado',
        suggestion: 'Usar classes Tailwind'
      },
      {
        pattern: /:\s*any\b/g,
        message: 'Uso de "any" detectado',
        suggestion: 'Usar tipagem específica'
      },
      {
        pattern: /useState|useEffect/g,
        message: 'Possível lógica em componente UI',
        suggestion: 'Mover lógica para hooks'
      }
    ]
    
    let hasError = false
    for (const { pattern, message, suggestion } of prohibitedPatterns) {
      if (pattern.test(content)) {
        violations.push(message)
        suggestions.push(suggestion)
        hasError = true
      }
    }
    
    return {
      allowed: !hasError,
      reason: hasError ? `Violações: ${violations.join(', ')}` : 'Ação permitida',
      violatedRules: violations,
      severity: hasError ? 'error' : 'info',
      suggestions
    }
  }
  
  if (type === 'bash') {
    // Verificar comandos perigosos
    const dangerousCommands = ['rm -rf', 'sudo', 'curl | bash', 'eval']
    const hasDangerous = dangerousCommands.some(cmd => target.includes(cmd))
    
    if (hasDangerous) {
      return {
        allowed: false,
        reason: 'Comando perigoso detectado',
        violatedRules: ['dangerous-command'],
        severity: 'error',
        suggestions: ['Evitar comandos perigosos sem autorização explícita']
      }
    }
  }
  
  return {
    allowed: true,
    reason: 'Ação permitida',
    violatedRules: [],
    severity: 'info',
    suggestions: []
  }
}

/**
 * Verifica se o arquivo está em lista de permissões
 */
function isFileAllowed(filePath) {
  // Arquivos críticos que não podem ser modificados sem autorização
  const criticalFiles = [
    '.windsurf/rules/',
    'src/types/',
    'package.json',
    'tsconfig.json',
    'tailwind.config.ts'
  ]
  
  return !criticalFiles.some(critical => filePath.startsWith(critical))
}

/**
 * Função principal do hook
 */
function main() {
  // Obter ação dos argumentos de linha de comando
  const args = process.argv.slice(2)
  
  if (args.length < 2) {
    console.error('❌ Uso: node pre-edit-hook.js <type> <target> [content_file]')
    process.exit(2) // Bloquear execução
  }
  
  const [type, target, contentFile] = args
  
  // Ler conteúdo do arquivo se fornecido
  let content = null
  if (contentFile && existsSync(contentFile)) {
    try {
      content = readFileSync(contentFile, 'utf-8')
    } catch (error) {
      console.error('❌ Erro ao ler arquivo de conteúdo:', error)
      process.exit(2)
    }
  }
  
  // Criar objeto de ação
  const action = {
    type: type.toLowerCase(), // 'edit', 'create', 'delete', 'bash'
    target,
    content
  }
  
  console.log(`🔍 Analisando ação: ${action.type} em ${action.target}`)
  
  // Verificar permissões de arquivo
  if (!isFileAllowed(action.target)) {
    console.log('🚫 Arquivo crítico detectado - requer autorização explícita')
    console.log('💡 Sugestão: Peça permissão ao usuário antes de modificar arquivos críticos')
    process.exit(2) // Bloquear execução
  }
  
  // Analisar ação
  const result = analyzeEditAction(action)
  
  if (result.allowed) {
    console.log('✅ Ação permitida')
    if (result.suggestions.length > 0) {
      console.log('💡 Sugestões:', result.suggestions.join('; '))
    }
    process.exit(0) // Permitir execução
  } else {
    console.log('🚫 AÇÃO BLOQUEADA')
    console.log('❌ Motivo:', result.reason)
    console.log('📋 Regras violadas:', result.violatedRules.join(', '))
    console.log('💡 Sugestões:', result.suggestions.join('; '))
    
    // Log para auditoria
    logViolation(action, result)
    
    process.exit(2) // Bloquear execução
  }
}

/**
 * Regista violações para auditoria
 */
function logViolation(action, result) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    action,
    validationResult: result,
    process: {
      pid: process.pid,
      ppid: process.ppid,
      cwd: process.cwd()
    }
  }
  
  // TODO: Implementar logging persistente
  console.log('📝 VIOLAÇÃO REGISTRADA:', JSON.stringify(logEntry, null, 2))
}

// Executar se chamado diretamente
if (require.main === module) {
  main()
}

module.exports = {
  analyzeEditAction,
  isFileAllowed,
  main
}
