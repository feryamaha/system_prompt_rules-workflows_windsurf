/**
 * IA Action Validator for Nemesis Enforcement Engine
 * Valida ações da IA contra @.windsurf/rules ANTES da execução
 */

import * as fs from 'fs'
import * as path from 'path'
import { Rule } from '../engine/rule-engine'

export interface IAAction {
  type: 'edit' | 'create' | 'delete' | 'bash'
  target: string // arquivo/comando
  content?: string // conteúdo sendo editado/criado
  originalContent?: string // conteúdo original (para edições)
}

export interface ValidationResult {
  allowed: boolean
  reason: string
  violatedRules: string[]
  severity: 'error' | 'warning' | 'info'
  suggestions: string[]
}

export interface RulePattern {
  name: string
  pattern: RegExp
  message: string
  rule: string
  severity: 'error' | 'warning'
  suggestion: string
}

export class IAActionValidator {
  private rulesPath: string
  private rulePatterns: RulePattern[]

  constructor(rulesPath: string = '.windsurf/rules') {
    this.rulesPath = rulesPath
    this.rulePatterns = this.initializeRulePatterns()
  }

  private initializeRulePatterns(): RulePattern[] {
    return [
      // Design System Convention - CSS inline
      {
        name: 'css-inline-prohibited',
        pattern: /style\s*=\s*{[^}]*}/g,
        message: 'CSS inline é proibido pelo design-system-convention.md',
        rule: 'design-system-convention.md',
        severity: 'error',
        suggestion: 'Mover estilos para classes Tailwind no tailwind.config.ts'
      },
      
      // TypeScript Convention - uso de any
      {
        name: 'any-type-prohibited',
        pattern: /:\s*any\b/g,
        message: 'Uso de "any" é proibido pelo typescript-typing-convention.md',
        rule: 'typescript-typing-convention.md',
        severity: 'error',
        suggestion: 'Criar tipo específico em src/types/ ou usar tipo mais específico'
      },
      
      // TypeScript Convention - tipagem inline em componentes
      {
        name: 'inline-types-in-components',
        pattern: /interface\s+\w+Props\s*{[^}]*}/g,
        message: 'Tipagem inline em componentes é proibida',
        rule: 'typescript-typing-convention.md',
        severity: 'error',
        suggestion: 'Mover tipagem para src/types/ui/[componente].types.ts'
      },
      
      // UI Separation - useState/useEffect em UI pura
      {
        name: 'logic-in-pure-ui',
        pattern: /useState|useEffect/g,
        message: 'Lógica em componentes UI pura é proibida',
        rule: 'ui-separation-convention.md',
        severity: 'error',
        suggestion: 'Mover lógica para hooks em src/hooks/'
      },
      
      // React Hooks Patterns - hooks condicionais
      {
        name: 'conditional-hooks',
        pattern: /if\s*\([^)]*\)\s*{[^}]*useState|useEffect/g,
        message: 'Hooks condicionais são proibidos',
        rule: 'react-hooks-patterns-rules.md',
        severity: 'error',
        suggestion: 'Mover todos os hooks para o topo do componente'
      },
      
      // React Hooks Patterns - setState síncrono em useEffect
      {
        name: 'sync-setstate-in-useeffect',
        pattern: /useEffect\(\s*\(\)\s*=>\s*{[^}]*setState[^}]*}\s*,/g,
        message: 'setState síncrono no corpo do useEffect é proibido',
        rule: 'react-hooks-patterns-rules.md',
        severity: 'error',
        suggestion: 'Usar callbacks ou lógica condicional antes de setState'
      },
      
      // Design System - cores hexadecimais diretas
      {
        name: 'hex-colors-prohibited',
        pattern: /#[0-9a-fA-F]{3,6}\b/g,
        message: 'Cores hexadecimais diretas são proibidas',
        rule: 'design-system-convention.md',
        severity: 'warning',
        suggestion: 'Usar tokens do tailwind.config.ts'
      }
    ]
  }

  /**
   * Valida uma ação da IA contra as regras
   */
  validateAction(action: IAAction): ValidationResult {
    const violatedRules: string[] = []
    const suggestions: string[] = []
    let maxSeverity: 'error' | 'warning' | 'info' = 'info'

    // Validações específicas por tipo de ação
    switch (action.type) {
      case 'edit':
      case 'create':
        if (action.content) {
          const contentValidation = this.validateContent(action.content, action.target)
          violatedRules.push(...contentValidation.violatedRules)
          suggestions.push(...contentValidation.suggestions)
          
          // Atualizar severidade máxima
          if (contentValidation.severity === 'error') maxSeverity = 'error'
          else if (contentValidation.severity === 'warning' && maxSeverity === 'info') maxSeverity = 'warning'
        }
        break

      case 'bash':
        const bashValidation = this.validateBashCommand(action.target)
        violatedRules.push(...bashValidation.violatedRules)
        suggestions.push(...bashValidation.suggestions)
        
        if (bashValidation.severity === 'error') maxSeverity = 'error'
        else if (bashValidation.severity === 'warning' && maxSeverity === 'info') maxSeverity = 'warning'
        break

      case 'delete':
        const deleteValidation = this.validateDeleteAction(action.target)
        violatedRules.push(...deleteValidation.violatedRules)
        suggestions.push(...deleteValidation.suggestions)
        
        if (deleteValidation.severity === 'error') maxSeverity = 'error'
        else if (deleteValidation.severity === 'warning' && maxSeverity === 'info') maxSeverity = 'warning'
        break
    }

    const allowed = violatedRules.filter(rule => 
      this.rulePatterns.find(p => p.name === rule)?.severity === 'error'
    ).length === 0

    const reason = allowed 
      ? 'Ação permitida' 
      : `Violações detectadas: ${violatedRules.join(', ')}`

    return {
      allowed,
      reason,
      violatedRules,
      severity: maxSeverity,
      suggestions
    }
  }

  private validateContent(content: string, filePath: string): ValidationResult {
    const violatedRules: string[] = []
    const suggestions: string[] = []
    let maxSeverity: 'error' | 'warning' | 'info' = 'info'

    // Verificar se é arquivo de componente UI
    const isUIComponent = /src\/components\/ui\//.test(filePath) || 
                         /src\/components\/shared\//.test(filePath)

    for (const pattern of this.rulePatterns) {
      if (pattern.pattern.test(content)) {
        // Regras específicas para componentes UI
        if (isUIComponent && pattern.name === 'logic-in-pure-ui') {
          violatedRules.push(pattern.name)
          suggestions.push(pattern.suggestion)
          maxSeverity = 'error'
        }
        // Regras gerais
        else if (!isUIComponent || pattern.name !== 'logic-in-pure-ui') {
          violatedRules.push(pattern.name)
          suggestions.push(pattern.suggestion)
          
          if (pattern.severity === 'error') maxSeverity = 'error'
          else if (pattern.severity === 'warning' && maxSeverity === 'info') maxSeverity = 'warning'
        }
      }
    }

    return {
      allowed: maxSeverity !== 'error',
      reason: maxSeverity === 'error' ? 'Conteúdo viola regras críticas' : 'Conteúdo com advertências',
      violatedRules,
      severity: maxSeverity,
      suggestions
    }
  }

  private validateBashCommand(command: string): ValidationResult {
    const violatedRules: string[] = []
    const suggestions: string[] = []
    let severity: 'error' | 'warning' | 'info' = 'info'

    // Comandos proibidos
    const prohibitedCommands = [
      'rm -rf',
      'sudo',
      'chmod 777',
      'curl | bash',
      'wget | bash',
      'eval',
      'exec'
    ]

    for (const prohibited of prohibitedCommands) {
      if (command.includes(prohibited)) {
        violatedRules.push(`prohibited-command-${prohibited.replace(/\s+/g, '-')}`)
        suggestions.push(`Comando "${prohibited}" é perigoso e não permitido`)
        severity = 'error'
      }
    }

    // Comandos de instalação sem autorização
    if (command.includes('npm install') || command.includes('yarn add') || command.includes('bun add')) {
      violatedRules.push('unauthorized-package-installation')
      suggestions.push('Instalações de pacotes requerem autorização explícita')
      severity = 'error'
    }

    return {
      allowed: severity !== 'error',
      reason: severity === 'error' ? 'Comando não permitido' : 'Comando permitido',
      violatedRules,
      severity,
      suggestions
    }
  }

  private validateDeleteAction(filePath: string): ValidationResult {
    const violatedRules: string[] = []
    const suggestions: string[] = []
    let severity: 'error' | 'warning' | 'info' = 'info'

    // Arquivos críticos que não podem ser deletados
    const criticalFiles = [
      '.windsurf/',
      'src/types/',
      'package.json',
      'tsconfig.json',
      'tailwind.config.ts',
      '.gitignore'
    ]

    for (const critical of criticalFiles) {
      if (filePath.startsWith(critical)) {
        violatedRules.push('critical-file-deletion')
        suggestions.push(`Arquivo crítico "${critical}" não pode ser deletado`)
        severity = 'error'
        break
      }
    }

    return {
      allowed: severity !== 'error',
      reason: severity === 'error' ? 'Deleção não permitida' : 'Deleção permitida',
      violatedRules,
      severity,
      suggestions
    }
  }

  /**
   * Valida múltiplas ações em lote
   */
  validateActions(actions: IAAction[]): ValidationResult[] {
    return actions.map(action => this.validateAction(action))
  }

  private loadRules(): Rule[] {
    const rulesPath = path.join(process.cwd(), '.windsurf', 'rules')
    
    if (!fs.existsSync(rulesPath)) {
      return this.getBuiltinRules()
    }

    const rules: Rule[] = []
    try {
      const ruleFiles = fs.readdirSync(rulesPath)
        .filter((file: string) => file.endsWith('.md'))
      
      for (const file of ruleFiles) {
        const filePath = path.join(rulesPath, file)
        const content = fs.readFileSync(filePath, 'utf-8')
        const parsedRules = this.parseRuleFile(content, filePath)
        rules.push(...parsedRules)
      }
    } catch (error) {
      console.error('Failed to load custom rules:', error)
    }

    return [...this.getBuiltinRules(), ...rules]
  }

  private getBuiltinRules(): Rule[] {
    // Regras básicas embutidas
    return [
      {
        id: 'any-type-prohibited',
        name: 'Proibir uso de any',
        description: 'Uso de tipo any é proibido',
        pattern: /:\s*any\b/g,
        severity: 'error',
        category: 'typescript',
        suggestion: 'Criar tipo específico em src/types/',
        filePatterns: ['*.ts', '*.tsx']
      },
      {
        id: 'css-inline-prohibited',
        name: 'Proibir CSS inline',
        description: 'CSS inline é proibido',
        pattern: /style\s*=\s*{[^}]*}/g,
        severity: 'error',
        category: 'css',
        suggestion: 'Usar classes Tailwind',
        filePatterns: ['*.tsx']
      },
      {
        id: 'unauthorized-package-installation',
        name: 'Proibir instalações não autorizadas',
        description: 'Instalação de pacotes sem autorização',
        pattern: /(bun install|npm install|yarn add|pnpm add)/,
        severity: 'error',
        category: 'security',
        suggestion: 'Peça permissão para instalar pacotes',
        filePatterns: ['*.bash', '*.sh']
      }
    ]
  }

  private parseRuleFile(content: string, filePath: string): Rule[] {
    // Parser simples para regras em markdown
    const rules: Rule[] = []
    
    // Por enquanto, retorna array vazio
    // TODO: Implementar parser completo de regras personalizadas
    
    return rules
  }

  /**
   * Recarrega padrões de regras
   */
  reloadRulePatterns(): void {
    this.rulePatterns = this.initializeRulePatterns()
  }
}
