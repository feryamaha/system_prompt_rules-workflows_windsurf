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
  mode?: 'interactive' | 'headless';  // Modo de operacao
}

/**
 * Resultado da validacao PreToolUse (modo headless)
 */
export interface PreToolValidationResult {
  valid: boolean;
  reason?: string;
  rule?: string;
  suggestion?: string;
}

/**
 * Schema oficial Windsurf Cascade Hooks
 */
export interface WindsurfHookInput {
  agent_action_name: WindsurfHookEvent;
  trajectory_id: string;
  execution_id: string;
  timestamp: string;
  tool_info: WindsurfToolInfo;
}

export type WindsurfHookEvent =
  | 'pre_write_code'
  | 'pre_read_code'
  | 'pre_run_command'
  | 'pre_user_prompt'
  | 'pre_mcp_tool_use'
  | 'post_write_code'
  | 'post_read_code'
  | 'post_run_command'
  | 'post_cascade_response'
  | 'post_mcp_tool_use'
  | 'post_setup_worktree';

export interface WindsurfToolInfo {
  // pre_write_code / post_write_code
  file_path?: string;
  edits?: Array<{ old_string: string; new_string: string }>;
  // pre_run_command / post_run_command
  command_line?: string;
  cwd?: string;
  // pre_read_code / post_read_code
  // (usa file_path acima)
  // pre_user_prompt
  user_prompt?: string;
  // pre_mcp_tool_use / post_mcp_tool_use
  mcp_server_name?: string;
  mcp_tool_name?: string;
  mcp_tool_arguments?: Record<string, unknown>;
  mcp_result?: string;
  // post_cascade_response
  response?: string;
  // post_setup_worktree
  worktree_path?: string;
  root_workspace_path?: string;
}

/**
 * Input para validacao PreToolUse (LEGADO - manter para compatibilidade)
 */
export interface PreToolValidationInput {
  toolName: 'Edit' | 'Write' | 'Bash' | 'Read' | 'Grep' | string;
  toolInput: {
    file_path?: string;
    command?: string;
    old_string?: string;
    new_string?: string;
    [key: string]: any;
  };
}
