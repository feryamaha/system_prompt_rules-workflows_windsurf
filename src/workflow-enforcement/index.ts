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
