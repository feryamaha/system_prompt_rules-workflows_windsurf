/**
 * Behavioral Override System for Nemesis Enforcement Engine
 * Força compliance quando regra é clara e detecta conflitos
 */

import type { RuleViolation, ValidationContext } from '../engine/rule-engine'
import type { IAAction } from '../validators/ia-action-validator'

export interface ComplianceResult {
  compliant: boolean
  action: 'allow' | 'block' | 'warn'
  reason: string
  overriddenRules: string[]
  originalIntent: string
  correctedAction: string
  confidence: number // 0-1
}

export interface BehavioralPattern {
  id: string
  name: string
  description: string
  triggers: string[] // padrões que indicam este comportamento
  overrideLevel: 'strict' | 'moderate' | 'lenient'
  correctiveAction: string
  examples: {
    violation: string
    correction: string
    explanation: string
  }[]
}

export class BehavioralOverride {
  private patterns: Map<string, BehavioralPattern> = new Map()
  private ruleViolations: RuleViolation[] = []
  private context: ValidationContext | null = null

  constructor() {
    this.initializePatterns()
  }

  private initializePatterns(): void {
    const patterns: BehavioralPattern[] = [
      {
        id: 'helping-urges-override',
        name: 'Instinto de Ajudar Imediato',
        description: 'IA sente urgência de ajudar e ignora regras',
        triggers: [
          'vou resolver isso agora',
          'deixe-me corrigir',
          'posso arrumar rápido',
          'vamos fazer assim',
          'é mais fácil assim'
        ],
        overrideLevel: 'strict',
        correctiveAction: 'PARAR! Siga as regras primeiro. "Ajudar" significa seguir convenções, não quebrá-las.',
        examples: [
          {
            violation: 'Vou adicionar estado local para resolver o problema',
            correction: 'O problema deve ser resolvido movendo lógica para hooks, não adicionando estado local',
            explanation: 'Estado local em UI pura viola ui-separation-convention.md'
          },
          {
            violation: 'Posso usar any só desta vez para funcionar',
            correction: 'Crie tipo específico em src/types/ mesmo que demore mais',
            explanation: 'Uso de any quebra contrato de tipagem do projeto'
          }
        ]
      },

      {
        id: 'permission-interpretation-error',
        name: 'Erro de Interpretação de Permissão',
        description: 'IA interpreta permissão como licença para violar regras',
        triggers: [
          'usuário autorizou',
          'tenho permissão',
          'usuário disse sim',
          'está autorizado'
        ],
        overrideLevel: 'strict',
        correctiveAction: 'PERMISSÃO NÃO É OVERRIDE! Permissão é para executar AÇÃO ESPECÍFICA, não para violar regras.',
        examples: [
          {
            violation: 'Usuário autorizou edição, então posso usar CSS inline',
            correction: 'Permissão foi para editar o arquivo, não para violar design-system-convention.md',
            explanation: 'Permissão não anula regras do projeto'
          },
          {
            violation: 'Como autorizou, posso instalar dependências',
            correction: 'Permissão foi para corrigir o bug, não para instalar pacotes sem planejamento',
            explanation: 'Instalações requerem análise de impacto e seguem workflow específico'
          }
        ]
      },

      {
        id: 'urgency-perceived-override',
        name: 'Urgência Percebida',
        description: 'IA sente pressão e atalha processos',
        triggers: [
          'rápido',
          'urgente',
          'pressa',
          'imediatamente',
          'sem demora'
        ],
        overrideLevel: 'moderate',
        correctiveAction: 'URGÊNCIA NÃO JUSTIFICA VIOLAÇÃO! Processos existem para garantir qualidade.',
        examples: [
          {
            violation: 'Como é urgente, vou pular validação',
            correction: 'Mesmo urgente, execute yarn tsc --noEmit antes de prosseguir',
            explanation: 'Validação previne regressões que custam mais tempo depois'
          },
          {
            violation: 'Vou usar solução rápida com any',
            correction: 'Crie tipagem adequada mesmo que leve mais tempo',
            explanation: 'Dívida técnica custa mais no longo prazo'
          }
        ]
      },

      {
        id: 'creative-solution-override',
        name: 'Solução Criativa',
        description: 'IA cria solução "engenhosa" que viola padrões',
        triggers: [
          'solução criativa',
          'abordagem diferente',
          'jeito inteligente',
          'workaround inteligente'
        ],
        overrideLevel: 'moderate',
        correctiveAction: 'CRIATIVIDADE SIGUE PADRÕES! Soluções devem respeitar arquitetura estabelecida.',
        examples: [
          {
            violation: 'Criei componente híbrido que resolve tudo',
            correction: 'Siga pipeline UI → shared → main-content conforme arquitetura',
            explanation: 'Componentes monolíticos quebram reusabilidade e manutenibilidade'
          },
          {
            violation: 'Usei técnica avançada para contornar limitação',
            correction: 'Use patterns estabelecidos mesmo que pareçam mais simples',
            explanation: 'Técnicas não-padronizadas criam dívida de conhecimento'
          }
        ]
      },

      {
        id: 'frustration-response-override',
        name: 'Resposta à Frustração',
        description: 'IA responde a frustração do usuário com atalhos',
        triggers: [
          'usuário frustrado',
          'está chateado',
          'impaciente',
          'irritado'
        ],
        overrideLevel: 'lenient',
        correctiveAction: 'FRUSTRAÇÃO NÃO JUSTIFICA VIOLAÇÃO! Mantenha qualidade mesmo sob pressão.',
        examples: [
          {
            violation: 'Usuário está frustrado, vou fazer gambiarra rápida',
            correction: 'Explique o processo necessário e execute corretamente',
            explanation: 'Gambiarras criam mais frustração futura'
          }
        ]
      }
    ]

    patterns.forEach(pattern => {
      this.patterns.set(pattern.id, pattern)
    })
  }

  /**
   * Analisa ação pretendida e detecta conflitos comportamentais
   */
  analyzeBehavioralConflict(
    intendedAction: string,
    ruleViolations: RuleViolation[],
    context: ValidationContext
  ): ComplianceResult {
    this.ruleViolations = ruleViolations
    this.context = context

    // Detectar padrões comportamentais na intenção
    const detectedPatterns = this.detectBehavioralPatterns(intendedAction)

    if (detectedPatterns.length === 0) {
      return {
        compliant: true,
        action: 'allow',
        reason: 'Nenhum conflito comportamental detectado',
        overriddenRules: [],
        originalIntent: intendedAction,
        correctedAction: intendedAction,
        confidence: 0.9
      }
    }

    // Ordenar por nível de override
    detectedPatterns.sort((a, b) => {
      const levels = { strict: 3, moderate: 2, lenient: 1 }
      return levels[b.overrideLevel] - levels[a.overrideLevel]
    })

    const primaryPattern = detectedPatterns[0]
    const hasCriticalViolations = ruleViolations.some(v => v.severity === 'error')

    // Decidir ação baseada no padrão e violações
    let action: 'allow' | 'block' | 'warn' = 'allow'
    let compliant = true

    if (primaryPattern.overrideLevel === 'strict' && hasCriticalViolations) {
      action = 'block'
      compliant = false
    } else if (primaryPattern.overrideLevel === 'moderate' && hasCriticalViolations) {
      action = 'warn'
      compliant = false
    } else if (primaryPattern.overrideLevel === 'lenient' && hasCriticalViolations) {
      action = 'warn'
      compliant = false
    }

    // Gerar ação corrigida
    const correctedAction = this.generateCorrectedAction(
      intendedAction,
      primaryPattern,
      ruleViolations
    )

    const reason = this.generateReason(primaryPattern, ruleViolations, action)

    return {
      compliant,
      action,
      reason,
      overriddenRules: ruleViolations.map(v => v.ruleId),
      originalIntent: intendedAction,
      correctedAction,
      confidence: this.calculateConfidence(detectedPatterns, ruleViolations)
    }
  }

  private detectBehavioralPatterns(intendedAction: string): BehavioralPattern[] {
    const detected: BehavioralPattern[] = []
    const normalizedAction = intendedAction.toLowerCase()

    for (const [id, pattern] of this.patterns) {
      const hasTrigger = pattern.triggers.some(trigger => 
        normalizedAction.includes(trigger.toLowerCase())
      )

      if (hasTrigger) {
        detected.push(pattern)
      }
    }

    return detected
  }

  private generateCorrectedAction(
    original: string,
    pattern: BehavioralPattern,
    violations: RuleViolation[]
  ): string {
    // Encontrar exemplo relevante baseado nas violações
    const relevantExample = pattern.examples.find(example => {
      return violations.some(violation => 
        example.violation.toLowerCase().includes(violation.ruleId) ||
        example.explanation.toLowerCase().includes(violation.category)
      )
    })

    if (relevantExample) {
      return relevantExample.correction
    }

    // Fallback para ação corretiva genérica do padrão
    return `${pattern.correctiveAction} Ação corrigida: ${original}`
  }

  private generateReason(
    pattern: BehavioralPattern,
    violations: RuleViolation[],
    action: 'allow' | 'block' | 'warn'
  ): string {
    const violationList = violations.map(v => v.message).join(', ')
    
    switch (action) {
      case 'block':
        return `BLOQUEADO: ${pattern.name}. ${pattern.correctiveAction} Violações: ${violationList}`
      case 'warn':
        return `ALERTA: ${pattern.name}. ${pattern.correctiveAction} Violações detectadas: ${violationList}`
      case 'allow':
        return `PERMITIDO: ${pattern.name} detectado, mas sem violações críticas.`
      default:
        return 'Análise comportamental concluída'
    }
  }

  private calculateConfidence(
    patterns: BehavioralPattern[],
    violations: RuleViolation[]
  ): number {
    let confidence = 0.5 // base confidence

    // Mais padrões detectados = mais confiança
    confidence += patterns.length * 0.1

    // Violações críticas aumentam confiança do bloqueio
    const criticalViolations = violations.filter(v => v.severity === 'error').length
    confidence += criticalViolations * 0.2

    // Padrões strict aumentam confiança
    const hasStrictPattern = patterns.some(p => p.overrideLevel === 'strict')
    if (hasStrictPattern) confidence += 0.2

    // Limitar entre 0 e 1
    return Math.min(Math.max(confidence, 0), 1)
  }

  /**
   * Registra nova violação para aprendizado
   */
  registerViolation(violation: RuleViolation, context: ValidationContext): void {
    this.ruleViolations.push(violation)
    this.context = context

    // TODO: Implementar aprendizado baseado em violações recorrentes
    console.log(`🧠 Behavioral learning: ${violation.ruleId} in ${context.filePath}`)
  }

  /**
   * Obtém estatísticas de violações comportamentais
   */
  getBehavioralStats(): {
    totalViolations: number
    patternsDetected: string[]
    commonViolations: { ruleId: string; count: number }[]
    overrideEffectiveness: { patternId: string; successRate: number }[]
  } {
    // TODO: Implementar estatísticas reais
    return {
      totalViolations: this.ruleViolations.length,
      patternsDetected: Array.from(this.patterns.keys()),
      commonViolations: [],
      overrideEffectiveness: []
    }
  }

  /**
   * Adiciona novo padrão comportamental
   */
  addPattern(pattern: BehavioralPattern): void {
    this.patterns.set(pattern.id, pattern)
  }

  /**
   * Lista todos os padrões comportamentais
   */
  listPatterns(): BehavioralPattern[] {
    return Array.from(this.patterns.values())
  }
}
