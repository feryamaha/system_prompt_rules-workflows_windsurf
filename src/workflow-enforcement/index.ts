// Core types and interfaces
export type {
  ExecutionOptions,
  WorkflowDefinition,
  CodeBlock,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  CommandResult,
  WorkflowRunnerResult,
  Violation,
  PermissionRequest,
  EnforcementConfig,
  PreToolValidationResult,
  PreToolValidationInput
} from './types';

// Main classes and functions
export { WorkflowParser } from './workflow-parser';
export { WorkflowCatalog } from './workflow-catalog';
export { CommandExtractor } from './command-extractor';
export { WorkflowValidators } from './workflow-validators';
export { WorkflowEnforcer } from './workflow-enforcer';
export { BashToolAdapter } from './bash-tool-adapter';
export { PermissionGate } from './permission-gate';
export { ViolationLogger } from './violation-logger';
export { WorkflowRunner } from './workflow-runner';

// Nemesis v2 - Hook modules (automatic enforcement)
export { validateCodeContent } from './hook/code-validator';
export { validateFileScope, hasScopeActive, readScope } from './hook/scope-validator';

// Environment Detection and Package Manager Adaptation
export { detectEnvironment, validateEnvironmentCompatibility, type EnvironmentInfo } from './detectors/environment-detector';

// Re-exportar módulos que serão criados nas próximas fases
export { IAActionValidator, type IAAction, type ValidationResult as IAValidationResult } from './validators/ia-action-validator';
export { RuleEngine, type Rule, type ValidationContext, type RuleViolation, type ValidationResult as EngineValidationResult } from './engine/rule-engine';
export { BehavioralOverride, type ComplianceResult, type BehavioralPattern } from './behavioral/override-system';
export { GapDetector, type GapAnalysis, type RuleComprehension, type ActionPlan } from './analysis/gap-detector';

// Terminal Reader Service - Leitura via terminal com fallbacks
export { TerminalReaderService } from './services/terminal-reader-service';
export { TerminalReaderLogger } from './services/terminal-reader-logger';
export type {
  ReadOptions,
  ReadResult,
  SearchResult,
  PathValidation,
  LogEntry,
  TerminalCommand
} from './services/terminal-reader-types';

// Convenience exports for common usage patterns
import { WorkflowRunner } from './workflow-runner';
import type { ExecutionOptions, EnforcementConfig } from './types';

export async function runWorkflowWithEnforcement(
  workflowPath: string,
  options: ExecutionOptions = {}
) {
  const runner = new WorkflowRunner(options);
  return runner.runWorkflow(workflowPath, options);
}

export async function validateAndRunWorkflow(
  workflowPath: string,
  options: ExecutionOptions = {}
) {
  const runner = new WorkflowRunner(options);
  
  // First validate
  const validation = await runner.validateWorkflow(workflowPath);
  if (!validation.isValid) {
    throw new Error(`Workflow validation failed: ${validation.errors.join(', ')}`);
  }

  // Then run
  return runner.runWorkflow(workflowPath, options);
}

export function createEnforcementConfig(overrides: Partial<EnforcementConfig> = {}): EnforcementConfig {
  return {
    blockUnauthorizedCommands: true,
    logViolations: true,
    requirePermissionForFileEdits: true,
    allowedLanguages: ['bash', 'javascript', 'typescript', 'python', 'markdown'],
    mandatoryRules: ['.windsurf/rules/rule-main-rules.md'],
    ...overrides
  };
}

/**
 * Função principal para setup do enforcement engine
 */
export async function setupEnforcementEngine(): Promise<{
  environment: any // EnvironmentInfo
  isCompatible: boolean
  issues: string[]
  recommendations: string[]
}> {
  const { detectEnvironment, validateEnvironmentCompatibility } = await import('./detectors/environment-detector')
  
  // Detectar ambiente
  const environment = detectEnvironment();
  
  // Validar compatibilidade
  const { compatible, issues, recommendations } = validateEnvironmentCompatibility(environment);
  
  return {
    environment,
    isCompatible: compatible,
    issues,
    recommendations
  };
}
