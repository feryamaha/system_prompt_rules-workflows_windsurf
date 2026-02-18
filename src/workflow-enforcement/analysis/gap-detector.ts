/**
 * Gap Detector for Nemesis Enforcement Engine
 * Detecta quando IA lê regra mas planeja violar
 */

import type { RuleViolation, ValidationContext } from '../engine/rule-engine'
import type { IAAction } from '../validators/ia-action-validator'
import type { ComplianceResult } from '../behavioral/override-system'

export interface GapAnalysis {
  hasGap: boolean
  gapType: 'rule-read-vs-action' | 'understanding-vs-execution' | 'permission-vs-violation' | 'none'
  severity: 'critical' | 'high' | 'medium' | 'low'
  ruleRead: string
  actionPlanned: string
  conflict: string
  explanation: string
  suggestedCorrection: string
  confidence: number
}

export interface RuleComprehension {
  ruleId: string
  ruleContent: string
  understood: boolean
  interpretation: string
  correctInterpretation: string
  confidence: number
}

export interface ActionPlan {
  action: string
  intent: string
  violatesRules: string[]
  justification?: string
  alternatives: string[]
}

export class GapDetector {
  private ruleComprehensions: Map<string, RuleComprehension> = new Map()
  private recentActions: ActionPlan[] = []
  private gapHistory: GapAnalysis[] = []

  /**
   * Analisa gap entre regra lida e ação pretendida
   */
  analyzeGap(
    ruleRead: string,
    actionPlanned: string,
    ruleViolations: RuleViolation[],
    context: ValidationContext
  ): GapAnalysis {
    // Registrar compreensão da regra
    const comprehension = this.analyzeRuleComprehension(ruleRead)
    this.ruleComprehensions.set(ruleRead, comprehension)

    // Registrar ação planejada
    const actionPlan = this.analyzeActionPlan(actionPlanned, ruleViolations)
    this.recentActions.push(actionPlan)

    // Detectar tipo de gap
    const gapType = this.detectGapType(comprehension, actionPlan, ruleViolations)

    if (gapType === 'none') {
      return {
        hasGap: false,
        gapType: 'none',
        severity: 'low',
        ruleRead,
        actionPlanned,
        conflict: '',
        explanation: 'Nenhum gap detectado entre regra e ação',
        suggestedCorrection: '',
        confidence: 0.9
      }
    }

    // Gerar análise detalhada do gap
    const analysis = this.generateGapAnalysis(
      gapType,
      comprehension,
      actionPlan,
      ruleViolations,
      context
    )

    // Registrar para aprendizado
    this.gapHistory.push(analysis)

    return analysis
  }

  private analyzeRuleComprehension(ruleContent: string): RuleComprehension {
    // Simular análise de compreensão da regra
    const understood = !ruleContent.includes('NÃO') || ruleContent.includes('PROIBIDO')
    
    let interpretation = ''
    let correctInterpretation = ''
    let confidence = 0.7

    // Análise baseada em conteúdo da regra
    if (ruleContent.includes('NUNCA edite sem permissão')) {
      interpretation = 'Entendi que preciso pedir permissão'
      correctInterpretation = 'Regra: NUNCA edite arquivo sem permissão explícita do usuário'
      confidence = 0.9
    } else if (ruleContent.includes('PROIBIDO usar any')) {
      interpretation = 'Entendi que any não deve ser usado'
      correctInterpretation = 'Regra: Uso de tipo any é estritamente proibido em todo o projeto'
      confidence = 0.8
    } else if (ruleContent.includes('CSS inline é proibido')) {
      interpretation = 'Entendi que CSS inline não é permitido'
      correctInterpretation = 'Regra: CSS inline viola design-system-convention.md e deve usar Tailwind'
      confidence = 0.8
    } else {
      interpretation = 'Li a regra mas não tenho certeza do significado exato'
      correctInterpretation = 'Regra precisa ser seguida rigorosamente como escrita'
      confidence = 0.5
    }

    return {
      ruleId: this.extractRuleId(ruleContent),
      ruleContent,
      understood,
      interpretation,
      correctInterpretation,
      confidence
    }
  }

  private analyzeActionPlan(actionPlanned: string, violations: RuleViolation[]): ActionPlan {
    const violatesRules = violations.map(v => v.ruleId)
    
    let intent = ''
    let justification = ''
    const alternatives: string[] = []

    // Analisar intenção baseada na ação
    if (actionPlanned.includes('vou criar')) {
      intent = 'criar componente/solução'
    } else if (actionPlanned.includes('vou corrigir')) {
      intent = 'corrigir erro'
    } else if (actionPlanned.includes('vou instalar')) {
      intent = 'instalar dependência'
    } else if (actionPlanned.includes('vou refatorar')) {
      intent = 'melhorar estrutura'
    } else {
      intent = 'executar ação geral'
    }

    // Detectar justificativas para violações
    if (actionPlanned.includes('porque é mais rápido') || actionPlanned.includes('para agilizar')) {
      justification = 'razões de velocidade'
    } else if (actionPlanned.includes('usuário autorizou') || actionPlanned.includes('tenho permissão')) {
      justification = 'permissão interpretada como override'
    } else if (actionPlanned.includes('é só desta vez') || actionPlanned.includes('temporário')) {
      justification = 'solução temporária'
    }

    // Gerar alternativas que não violam regras
    if (violatesRules.includes('ts-any-prohibited')) {
      alternatives.push('Criar tipo específico em src/types/')
      alternatives.push('Usar tipo unknown com validação')
    }
    if (violatesRules.includes('ds-css-inline-prohibited')) {
      alternatives.push('Usar classes Tailwind existentes')
      alternatives.push('Criar novo token no tailwind.config.ts')
    }
    if (violatesRules.includes('ui-logic-in-pure-components')) {
      alternatives.push('Mover lógica para hook em src/hooks/')
      alternatives.push('Criar hook customizado para este comportamento')
    }

    return {
      action: actionPlanned,
      intent,
      violatesRules,
      justification,
      alternatives
    }
  }

  private detectGapType(
    comprehension: RuleComprehension,
    actionPlan: ActionPlan,
    violations: RuleViolation[]
  ): GapAnalysis['gapType'] {
    // Se não há violações, não há gap
    if (violations.length === 0) {
      return 'none'
    }

    // Se compreendeu a regra mas viola mesmo assim
    if (comprehension.understood && actionPlan.violatesRules.length > 0) {
      return 'rule-read-vs-action'
    }

    // Se usa permissão como justificativa para violar
    if (actionPlan.justification?.includes('permissão')) {
      return 'permission-vs-violation'
    }

    // Gap geral de entendimento vs execução
    if (!comprehension.understood || actionPlan.violatesRules.length > 0) {
      return 'understanding-vs-execution'
    }

    return 'none'
  }

  private generateGapAnalysis(
    gapType: GapAnalysis['gapType'],
    comprehension: RuleComprehension,
    actionPlan: ActionPlan,
    violations: RuleViolation[],
    context: ValidationContext
  ): GapAnalysis {
    const severity = this.calculateSeverity(gapType, violations)
    const conflict = this.generateConflictDescription(gapType, comprehension, actionPlan)
    const explanation = this.generateExplanation(gapType, comprehension, actionPlan)
    const suggestedCorrection = this.generateSuggestedCorrection(gapType, actionPlan)
    const confidence = this.calculateGapConfidence(gapType, comprehension, actionPlan)

    return {
      hasGap: true,
      gapType,
      severity,
      ruleRead: comprehension.ruleContent,
      actionPlanned: actionPlan.action,
      conflict,
      explanation,
      suggestedCorrection,
      confidence
    }
  }

  private calculateSeverity(
    gapType: GapAnalysis['gapType'],
    violations: RuleViolation[]
  ): GapAnalysis['severity'] {
    const hasErrors = violations.some(v => v.severity === 'error')
    const hasWarnings = violations.some(v => v.severity === 'warning')

    switch (gapType) {
      case 'rule-read-vs-action':
        return hasErrors ? 'critical' : 'high'
      case 'permission-vs-violation':
        return hasErrors ? 'critical' : 'high'
      case 'understanding-vs-execution':
        return hasErrors ? 'high' : 'medium'
      default:
        return 'low'
    }
  }

  private generateConflictDescription(
    gapType: GapAnalysis['gapType'],
    comprehension: RuleComprehension,
    actionPlan: ActionPlan
  ): string {
    switch (gapType) {
      case 'rule-read-vs-action':
        return `CONFLITO: Regra compreendida ("${comprehension.interpretation}") mas ação planejada ("${actionPlan.action}") viola a mesma regra`
      case 'permission-vs-violation':
        return `CONFLITO: Permissão foi interpretada como licença para violar regras: "${actionPlan.justification}"`
      case 'understanding-vs-execution':
        return `CONFLITO: Gap entre entendimento da regra e execução planejada`
      default:
        return 'Conflito não identificado'
    }
  }

  private generateExplanation(
    gapType: GapAnalysis['gapType'],
    comprehension: RuleComprehension,
    actionPlan: ActionPlan
  ): string {
    switch (gapType) {
      case 'rule-read-vs-action':
        return `Você leu e compreendeu a regra, mas está planejando violá-la mesmo assim. Isso indica um conflito entre Sistema de Regras e Cérebro Neural onde o instinto de "ajudar" está sobrepondo a governança estabelecida.`
      case 'permission-vs-violation':
        return `Você está interpretando permissão do usuário como autorização para violar as regras do projeto. Permissão é para executar a AÇÃO ESPECÍFICA solicitada, não para quebrar convenções.`
      case 'understanding-vs-execution':
        return `Há um gap entre o que você compreendeu da regra e o que está planejando executar. A interpretação pode estar imprecisa ou incompleta.`
      default:
        return 'Análise de gap não disponível'
    }
  }

  private generateSuggestedCorrection(
    gapType: GapAnalysis['gapType'],
    actionPlan: ActionPlan
  ): string {
    if (actionPlan.alternatives.length > 0) {
      return `AÇÃO CORRETA: ${actionPlan.alternatives[0]}. Alternativas: ${actionPlan.alternatives.slice(1).join(', ')}`
    }

    switch (gapType) {
      case 'rule-read-vs-action':
        return 'AÇÃO CORRETA: Siga estritamente a regra que você leu. "Ajudar" significa respeitar as convenções do projeto.'
      case 'permission-vs-violation':
        return 'AÇÃO CORRETA: Execute apenas a ação autorizada, sem violar regras. Se a ação requer violação, peça esclarecimento.'
      case 'understanding-vs-execution':
        return 'AÇÃO CORRETA: Releia a regra com mais atenção e ajuste sua ação para seguir exatamente o que está escrito.'
      default:
        return 'Revise sua ação para garantir conformidade com as regras'
    }
  }

  private calculateGapConfidence(
    gapType: GapAnalysis['gapType'],
    comprehension: RuleComprehension,
    actionPlan: ActionPlan
  ): number {
    let confidence = 0.5

    // Confiança baseada na clareza do gap
    switch (gapType) {
      case 'rule-read-vs-action':
        confidence += 0.3 // gap mais claro
        break
      case 'permission-vs-violation':
        confidence += 0.25
        break
      case 'understanding-vs-execution':
        confidence += 0.2
        break
    }

    // Ajustar baseado na confiança da compreensão
    confidence += comprehension.confidence * 0.2

    // Ajustar baseado na clareza da justificativa
    if (actionPlan.justification) {
      confidence += 0.1
    }

    return Math.min(Math.max(confidence, 0), 1)
  }

  private extractRuleId(ruleContent: string): string {
    // Tentar extrair ID da regra do conteúdo
    const match = ruleContent.match(/rule-(\w+)/i)
    if (match) {
      return match[1]
    }

    // Fallback para hash simples do conteúdo
    return `rule-${Math.abs(ruleContent.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)).toString(16)}`
  }

  /**
   * Obtém estatísticas de gaps detectados
   */
  getGapStats(): {
    totalGaps: number
    gapsByType: Record<string, number>
    gapsBySeverity: Record<string, number>
    commonRules: { ruleId: string; gapCount: number }[]
    improvementRate: number
  } {
    const gapsByType: Record<string, number> = {}
    const gapsBySeverity: Record<string, number> = {}
    const commonRules: Record<string, number> = {}

    this.gapHistory.forEach(gap => {
      gapsByType[gap.gapType] = (gapsByType[gap.gapType] || 0) + 1
      gapsBySeverity[gap.severity] = (gapsBySeverity[gap.severity] || 0) + 1
      
      const ruleId = this.extractRuleId(gap.ruleRead)
      commonRules[ruleId] = (commonRules[ruleId] || 0) + 1
    })

    // Calcular taxa de melhoria (gaps estão diminuindo?)
    const recentGaps = this.gapHistory.slice(-10)
    const olderGaps = this.gapHistory.slice(-20, -10)
    const improvementRate = olderGaps.length > 0 
      ? (olderGaps.length - recentGaps.length) / olderGaps.length 
      : 0

    return {
      totalGaps: this.gapHistory.length,
      gapsByType,
      gapsBySeverity,
      commonRules: Object.entries(commonRules)
        .map(([ruleId, gapCount]) => ({ ruleId, gapCount }))
        .sort((a, b) => b.gapCount - a.gapCount)
        .slice(0, 5),
      improvementRate
    }
  }

  /**
   * Limpa histórico antigo para manter performance
   */
  cleanupHistory(maxEntries: number = 100): void {
    if (this.gapHistory.length > maxEntries) {
      this.gapHistory = this.gapHistory.slice(-maxEntries)
    }
    if (this.recentActions.length > maxEntries) {
      this.recentActions = this.recentActions.slice(-maxEntries)
    }
  }
}
