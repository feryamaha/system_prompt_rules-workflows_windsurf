export interface ExecutionOptions {
  maxCallDepth?: number;
  maxCommandCount?: number;
  maxLoopIterations?: number;
  networkAccess?: boolean;
  allowedUrls?: string[];
  cwd?: string;
  env?: Record<string, string>;
  files?: Record<string, string>;
}

export interface WorkflowDefinition {
  name: string;
  path: string;
  content: string;
  codeBlocks: CodeBlock[];
  metadata: Record<string, string>;
}

export interface CodeBlock {
  language: string;
  content: string;
  lineNumber: number;
  isExecutable: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  code: string;
  message: string;
  line?: number;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  code: string;
  message: string;
  line?: number;
}

export interface CommandResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTime: number;
  command: string;
}

export interface WorkflowRunnerResult {
  workflow: string;
  success: boolean;
  results: CommandResult[];
  violations: Violation[];
  executionTime: number;
}

export interface Violation {
  type: 'permission_denied' | 'rule_violation' | 'syntax_error' | 'security_violation';
  message: string;
  rule?: string;
  command?: string;
  timestamp: Date;
}

export interface PermissionRequest {
  command: string;
  reason: string;
  workflow: string;
  requiresConfirmation: boolean;
}

export interface EnforcementConfig {
  blockUnauthorizedCommands: boolean;
  logViolations: boolean;
  requirePermissionForFileEdits: boolean;
  allowedLanguages: string[];
  mandatoryRules: string[];
}
