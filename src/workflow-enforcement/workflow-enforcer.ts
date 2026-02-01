import { WorkflowDefinition, ValidationResult, Violation, EnforcementConfig } from './types';
import { WorkflowValidators } from './workflow-validators';
import { PermissionGate } from './permission-gate';
import { ViolationLogger } from './violation-logger';

export class WorkflowEnforcer {
  private config: EnforcementConfig;

  constructor(config: Partial<EnforcementConfig> = {}) {
    this.config = {
      blockUnauthorizedCommands: true,
      logViolations: true,
      requirePermissionForFileEdits: true,
      allowedLanguages: ['bash', 'javascript', 'typescript', 'python', 'markdown'],
      mandatoryRules: ['@[.windsurf/rule-main-rules.md]'],
      ...config
    };
  }

  async validateWorkflow(workflow: WorkflowDefinition): Promise<ValidationResult> {
    // Run all validations
    const result = WorkflowValidators.validateAll(workflow);

    // Log validation errors as violations
    if (this.config.logViolations) {
      for (const error of result.errors) {
        ViolationLogger.logViolation({
          type: 'rule_violation',
          message: error.message,
          rule: `@[.windsurf/rules]`,
          timestamp: new Date()
        });
      }
    }

    return result;
  }

  async checkExecutionPermission(
    workflow: WorkflowDefinition,
    command: string
  ): Promise<boolean> {
    // Check if command is in allowed language
    const commandLanguage = this.detectCommandLanguage(command);
    if (!this.config.allowedLanguages.includes(commandLanguage)) {
      if (this.config.logViolations) {
        ViolationLogger.logViolation({
          type: 'rule_violation',
          message: `Command uses unsupported language: ${commandLanguage}`,
          command,
          rule: `@[.windsurf/rules]`,
          timestamp: new Date()
        });
      }
      return false;
    }

    // Check for mandatory rules in workflow
    const hasMandatoryRules = this.config.mandatoryRules.every(rule =>
      workflow.content.includes(rule)
    );

    if (!hasMandatoryRules) {
      if (this.config.logViolations) {
        ViolationLogger.logViolation({
          type: 'rule_violation',
          message: 'Workflow does not reference mandatory rules',
          rule: `@[.windsurf/rules]`,
          timestamp: new Date()
        });
      }
      return false;
    }

    // Check permission for specific command
    const safetyCheck = PermissionGate.checkCommandSafety(command);
    const requiresConfirmation = !safetyCheck.isSafe || this.config.requirePermissionForFileEdits;

    const permissionRequest = PermissionGate.createPermissionRequest(
      command,
      safetyCheck.reasons.join(', ') || 'Command execution requested',
      workflow.name,
      requiresConfirmation
    );

    const hasPermission = await PermissionGate.requestPermission(permissionRequest);

    if (!hasPermission && this.config.logViolations) {
      ViolationLogger.logViolation({
        type: 'permission_denied',
        message: `Permission denied for command: ${command}`,
        command,
        rule: `@[.windsurf/rule-main-rules.md]`,
        timestamp: new Date()
      });
    }

    return hasPermission;
  }

  private detectCommandLanguage(command: string): string {
    const trimmedCommand = command.trim().toLowerCase();

    if (trimmedCommand.startsWith('npm ') || trimmedCommand.startsWith('npx ')) {
      return 'javascript';
    }
    if (trimmedCommand.startsWith('yarn ')) {
      return 'javascript';
    }
    if (trimmedCommand.startsWith('python ') || trimmedCommand.startsWith('pip ')) {
      return 'python';
    }
    if (trimmedCommand.includes('.js') || trimmedCommand.includes('.ts')) {
      return 'javascript';
    }
    if (trimmedCommand.includes('.py')) {
      return 'python';
    }

    // Default to bash for shell commands
    return 'bash';
  }

  async enforceWorkflowExecution(
    workflow: WorkflowDefinition,
    commands: string[]
  ): Promise<{
    allowedCommands: string[];
    blockedCommands: string[];
    violations: Violation[];
  }> {
    const allowedCommands: string[] = [];
    const blockedCommands: string[] = [];
    const violations: Violation[] = [];

    // First validate the workflow
    const validation = await this.validateWorkflow(workflow);
    if (!validation.isValid) {
      // Block all commands if workflow validation fails
      for (const command of commands) {
        blockedCommands.push(command);
        
        if (this.config.logViolations) {
          const violation: Violation = {
            type: 'rule_violation',
            message: 'Command blocked due to workflow validation failures',
            command,
            rule: `@[.windsurf/rules]`,
            timestamp: new Date()
          };
          violations.push(violation);
          ViolationLogger.logViolation(violation);
        }
      }

      return {
        allowedCommands,
        blockedCommands,
        violations
      };
    }

    // Check each command individually
    for (const command of commands) {
      const hasPermission = await this.checkExecutionPermission(workflow, command);

      if (hasPermission) {
        allowedCommands.push(command);
      } else {
        blockedCommands.push(command);
      }
    }

    return {
      allowedCommands,
      blockedCommands,
      violations
    };
  }

  async preExecutionCheck(workflow: WorkflowDefinition): Promise<{
    canProceed: boolean;
    reasons: string[];
  }> {
    const reasons: string[] = [];
    let canProceed = true;

    // Check mandatory rules
    const missingRules = this.config.mandatoryRules.filter(rule =>
      !workflow.content.includes(rule)
    );

    if (missingRules.length > 0) {
      reasons.push(`Missing mandatory rules: ${missingRules.join(', ')}`);
      canProceed = false;
    }

    // Validate workflow structure
    const validation = await this.validateWorkflow(workflow);
    if (!validation.isValid) {
      reasons.push(`Workflow validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
      canProceed = false;
    }

    // Check for dangerous patterns
    const dangerousPatterns = [
      /rm\s+-rf\s+\//,
      /sudo\s+rm/,
      /format\s+c:/,
      /dd\s+if=/
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(workflow.content)) {
        reasons.push('Dangerous command pattern detected in workflow');
        canProceed = false;
        break;
      }
    }

    return {
      canProceed,
      reasons
    };
  }

  getConfig(): EnforcementConfig {
    return { ...this.config };
  }

  updateConfig(newConfig: Partial<EnforcementConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  reset(): void {
    PermissionGate.reset();
    ViolationLogger.clearViolations();
  }
}
