/**
 * Rule Engine for Nemesis Enforcement Engine
 * Motor de regras que verifica conformidade em tempo real
 */

/// <reference path="../../../scripts/types/node-globals.d.ts" />

import * as fs from 'fs'
import * as path from 'path'

export interface Rule {
  id: string
  name: string
  description: string
  pattern: RegExp | string | ((content: string, context: ValidationContext) => boolean)
  severity: 'error' | 'warning' | 'info'
  category: 'typescript' | 'react' | 'css' | 'security' | 'architecture' | 'general'
  suggestion: string
  filePatterns?: string[] // padrões de arquivo onde a regra se aplica
  exceptions?: string[] // exceções conhecidas
}

export interface ValidationContext {
  filePath: string
  fileType: string
  isUIComponent: boolean
  isSharedComponent: boolean
  isHook: boolean
  isTypeFile: boolean
  projectRoot: string
}

export interface RuleViolation {
  ruleId: string
  message: string
  line?: number
  column?: number
  severity: 'error' | 'warning' | 'info'
  suggestion: string
  category: string
}

export interface ValidationResult {
  valid: boolean
  violations: RuleViolation[]
  summary: {
    errors: number
    warnings: number
    info: number
  }
}

export class RuleEngine {
  private rules: Map<string, Rule> = new Map()
  private rulesPath: string
  private projectRoot: string

  constructor(rulesPath: string = '.windsurf/rules', projectRoot: string = process.cwd()) {
    this.rulesPath = rulesPath
    this.projectRoot = projectRoot
    this.loadBuiltInRules()
  }

  private loadBuiltInRules(): void {
    const builtInRules: Rule[] = [
      // TypeScript Rules
      {
        id: 'ts-any-prohibited',
        name: 'Proibir uso de any',
        description: 'Uso de tipo any é proibido',
        pattern: /:\s*any\b/g,
        severity: 'error',
        category: 'typescript',
        suggestion: 'Criar tipo específico em src/types/ ou usar tipo mais específico',
        filePatterns: ['*.ts', '*.tsx'],
        exceptions: ['src/components/ui/Button.tsx', 'src/components/ui/Container.tsx', 'src/components/ui/InputPesquisaAjuda.tsx']
      },
      
      {
        id: 'ts-inline-types-prohibited',
        name: 'Proibir tipagem inline em componentes',
        description: 'Tipagem inline em componentes reutilizáveis é proibida',
        pattern: /interface\s+\w+Props\s*{[^}]*}/g,
        severity: 'error',
        category: 'typescript',
        suggestion: 'Mover tipagem para src/types/ui/[componente].types.ts',
        filePatterns: ['src/components/**/*.tsx'],
        exceptions: ['layout.tsx', 'page.tsx']
      },

      // React Rules
      {
        id: 'react-hooks-conditional',
        name: 'Proibir hooks condicionais',
        description: 'Hooks não podem ser chamados dentro de condicionais',
        pattern: /if\s*\([^)]*\)\s*{[^}]*useState|useEffect/g,
        severity: 'error',
        category: 'react',
        suggestion: 'Mover todos os hooks para o topo do componente',
        filePatterns: ['*.tsx', '*.ts']
      },

      {
        id: 'react-setstate-in-useeffect',
        name: 'Proibir setState síncrono em useEffect',
        description: 'setState não pode ser chamado diretamente no corpo do useEffect',
        pattern: /useEffect\(\s*\(\)\s*=>\s*{[^}]*setState[^}]*}\s*,/g,
        severity: 'error',
        category: 'react',
        suggestion: 'Usar callbacks ou lógica condicional antes de setState',
        filePatterns: ['*.tsx', '*.ts']
      },

      // UI Separation Rules
      {
        id: 'ui-logic-in-pure-components',
        name: 'Proibir lógica em componentes UI pura',
        description: 'Componentes UI não devem conter lógica de negócio',
        pattern: /useState|useEffect|useMemo|useCallback/g,
        severity: 'error',
        category: 'architecture',
        suggestion: 'Mover lógica para hooks em src/hooks/',
        filePatterns: ['src/components/ui/*.tsx'],
        exceptions: ['src/components/ui/Button.tsx', 'src/components/ui/Container.tsx', 'src/components/ui/InputPesquisaAjuda.tsx']
      },

      // Design System Rules
      {
        id: 'ds-css-inline-prohibited',
        name: 'Proibir CSS inline',
        description: 'CSS inline é proibido',
        pattern: /style\s*=\s*{[^}]*}/g,
        severity: 'error',
        category: 'css',
        suggestion: 'Usar classes Tailwind definidas no tailwind.config.ts',
        filePatterns: ['*.tsx']
      },

      {
        id: 'ds-hex-colors-prohibited',
        name: 'Proibir cores hexadecimais diretas',
        description: 'Cores hexadecimais diretas são proibidas',
        pattern: /#[0-9a-fA-F]{3,6}\b/g,
        severity: 'warning',
        category: 'css',
        suggestion: 'Usar tokens do tailwind.config.ts',
        filePatterns: ['*.tsx', '*.css']
      },

      // Security Rules
      {
        id: 'sec-dangerous-bash-commands',
        name: 'Proibir comandos bash perigosos',
        description: 'Comandos perigosos não são permitidos',
        pattern: /rm\s+-rf|sudo|curl\s+\|\s*bash|wget\s+\|\s*bash|eval|exec/g,
        severity: 'error',
        category: 'security',
        suggestion: 'Evitar comandos perigosos ou usar alternativas seguras',
        filePatterns: ['*.sh', '*.bash']
      },

      // Architecture Rules
      {
        id: 'arch-file-organization',
        name: 'Verificar organização de arquivos',
        description: 'Arquivos devem estar nas pastas corretas',
        pattern: (content: string, context: ValidationContext) => {
          const { filePath, fileType } = context
          
          // Componentes UI devem estar em src/components/ui/
          if (fileType === 'tsx' && context.isUIComponent) {
            return !filePath.includes('src/components/ui/')
          }
          
          // Tipos devem estar em src/types/
          if (fileType === 'ts' && context.isTypeFile) {
            return !filePath.includes('src/types/')
          }
          
          // Hooks devem estar em src/hooks/
          if (fileType === 'ts' && context.isHook) {
            return !filePath.includes('src/hooks/')
          }
          
          return false
        },
        severity: 'warning',
        category: 'architecture',
        suggestion: 'Mover arquivo para a pasta correta conforme arquitetura do projeto',
        filePatterns: ['*.ts', '*.tsx']
      }
    ]

    builtInRules.forEach(rule => this.rules.set(rule.id, rule))
  }

  /**
   * Carrega regras personalizadas de arquivos
   */
  private loadCustomRules(): void {
    if (!fs.existsSync(this.rulesPath)) {
      return
    }

    const ruleFiles = fs.readdirSync(this.rulesPath)
      .filter((file: string) => path.extname(file) === '.md')
      .map((file: string) => path.join(this.rulesPath, file))

    for (const ruleFile of ruleFiles) {
      try {
        const content = fs.readFileSync(ruleFile, 'utf-8')
        this.parseRuleFile(content, ruleFile)
      } catch (error) {
        console.error(`Failed to load rules from ${ruleFile}:`, error)
      }
    }
  }

  private parseRuleFile(content: string, filePath: string): void {
    // TODO: Implementar parser de regras personalizadas em markdown
    // Por enquanto, apenas log que o arquivo foi lido
    console.log(`📋 Rules file loaded: ${filePath}`)
  }

  /**
   * Valida conteúdo contra todas as regras aplicáveis
   */
  validate(content: string, filePath: string): ValidationResult {
    const context = this.createValidationContext(filePath)
    const violations: RuleViolation[] = []

    for (const [ruleId, rule] of this.rules) {
      // Verificar se a regra se aplica ao arquivo
      if (!this.isRuleApplicable(rule, context)) {
        continue
      }

      // Verificar se o arquivo está na lista de exceções
      if (rule.exceptions && rule.exceptions.some(exception => filePath.includes(exception))) {
        continue
      }

      const violation = this.checkRule(rule, content, context)
      if (violation) {
        violations.push(violation)
      }
    }

    const summary = {
      errors: violations.filter(v => v.severity === 'error').length,
      warnings: violations.filter(v => v.severity === 'warning').length,
      info: violations.filter(v => v.severity === 'info').length
    }

    return {
      valid: summary.errors === 0,
      violations,
      summary
    }
  }

  private createValidationContext(filePath: string): ValidationContext {
    const relativePath = filePath.replace(this.projectRoot, '').replace(/^\//, '')
    const fileType = this.getFileType(relativePath)
    
    return {
      filePath: relativePath,
      fileType,
      isUIComponent: relativePath.includes('src/components/ui/'),
      isSharedComponent: relativePath.includes('src/components/shared/'),
      isHook: relativePath.includes('src/hooks/'),
      isTypeFile: relativePath.includes('src/types/'),
      projectRoot: this.projectRoot
    }
  }

  private getFileType(filePath: string): string {
    const ext = path.extname(filePath)
    switch (ext) {
      case '.ts': return 'ts'
      case '.tsx': return 'tsx'
      case '.js': return 'js'
      case '.jsx': return 'jsx'
      case '.css': return 'css'
      case '.md': return 'md'
      default: return ext.slice(1)
    }
  }

  private isRuleApplicable(rule: Rule, context: ValidationContext): boolean {
    // Se não há padrões de arquivo, a regra se aplica a todos
    if (!rule.filePatterns) {
      return true
    }

    // Verificar se o arquivo corresponde a algum padrão
    return rule.filePatterns.some(pattern => {
      // Converter glob pattern para regex simples
      const regexPattern = pattern
        .replace(/\*/g, '.*')
        .replace(/\?/g, '.')
      
      const regex = new RegExp(`^${regexPattern}$`)
      return regex.test(context.filePath)
    })
  }

  private checkRule(rule: Rule, content: string, context: ValidationContext): RuleViolation | null {
    let matched = false
    let line: number | undefined

    if (typeof rule.pattern === 'function') {
      matched = rule.pattern(content, context)
    } else if (typeof rule.pattern === 'string') {
      matched = content.includes(rule.pattern)
      if (matched) {
        line = this.findLineNumber(content, rule.pattern)
      }
    } else if (rule.pattern instanceof RegExp) {
      const matches = content.match(rule.pattern)
      matched = matches !== null
      if (matched && matches && matches.index !== undefined) {
        line = this.getLineNumberFromIndex(content, matches.index)
      }
    }

    if (!matched) {
      return null
    }

    return {
      ruleId: rule.id,
      message: rule.description,
      line,
      severity: rule.severity,
      suggestion: rule.suggestion,
      category: rule.category
    }
  }

  private findLineNumber(content: string, pattern: string): number | undefined {
    const lines = content.split('\n')
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(pattern)) {
        return i + 1
      }
    }
    return undefined
  }

  private getLineNumberFromIndex(content: string, index: number): number | undefined {
    const beforeIndex = content.substring(0, index)
    return beforeIndex.split('\n').length
  }

  /**
   * Adiciona uma regra personalizada
   */
  addRule(rule: Rule): void {
    this.rules.set(rule.id, rule)
  }

  /**
   * Remove uma regra
   */
  removeRule(ruleId: string): boolean {
    return this.rules.delete(ruleId)
  }

  /**
   * Lista todas as regras carregadas
   */
  listRules(): Rule[] {
    return Array.from(this.rules.values())
  }

  /**
   * Obtém uma regra específica
   */
  getRule(ruleId: string): Rule | undefined {
    return this.rules.get(ruleId)
  }

  /**
   * Recarrega todas as regras
   */
  reloadRules(): void {
    this.rules.clear()
    this.loadBuiltInRules()
    this.loadCustomRules()
  }
}
