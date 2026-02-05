import { WorkflowDefinition, ValidationResult, Violation, EnforcementConfig, PreToolValidationResult, PreToolValidationInput } from './types';
import { WorkflowValidators } from './workflow-validators';
import { PermissionGate } from './permission-gate';
import { ViolationLogger } from './violation-logger';
import * as fs from 'fs';
import * as path from 'path';

export class WorkflowEnforcer {
  private config: EnforcementConfig;

  constructor(config: Partial<EnforcementConfig> = {}) {
    this.config = {
      blockUnauthorizedCommands: true,
      logViolations: true,
      requirePermissionForFileEdits: true,
      allowedLanguages: ['bash', 'javascript', 'typescript', 'python', 'markdown'],
      mandatoryRules: ['.windsurf/rules/rule-main-rules.md'],
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
          rule: `.windsurf/rules`,
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
          rule: `.windsurf/rules`,
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
          rule: `.windsurf/rules`,
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
        rule: `.windsurf/rule-main-rules.md`,
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
            rule: `.windsurf/rules`,
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

  // =========================================================================
  // PreToolUse Hooks Support (Modo Headless)
  // =========================================================================

  /**
   * Validar acao PreToolUse (modo headless - sem interacao com IA)
   * Chamado pelo pretool-hook.ts antes de executar qualquer ferramenta
   */
  async validatePreToolUse(input: PreToolValidationInput): Promise<PreToolValidationResult> {
    const { toolName, toolInput } = input;

    // Validar baseado no tipo de ferramenta
    switch (toolName) {
      case 'Edit':
      case 'Write':
        return this.validateFileOperationHeadless(toolInput.file_path, toolName);

      case 'Bash':
        return this.validateCommandHeadless(toolInput.command);

      case 'Read':
      case 'Grep':
        // Operacoes de leitura sao geralmente seguras
        return { valid: true };

      default:
        // Ferramentas desconhecidas - permite com warning
        if (this.config.mode !== 'headless' && this.config.logViolations) {
          console.warn(`[NEMESIS WARNING] Ferramenta nao reconhecida: ${toolName}`);
        }
        return { valid: true };
    }
  }

  /**
   * Validar operacao de arquivo (modo headless)
   */
  private validateFileOperationHeadless(
    filePath: string | undefined,
    operation: string
  ): PreToolValidationResult {
    if (!filePath) {
      return {
        valid: false,
        reason: 'Caminho do arquivo nao fornecido',
        rule: '.windsurf/rules/rule-main-rules.md',
        suggestion: 'Especifique o arquivo a ser modificado'
      };
    }

    // Verificar se arquivo existe (para Edits)
    if (operation === 'Edit') {
      try {
        if (!fs.existsSync(filePath)) {
          return {
            valid: false,
            reason: `Arquivo nao existe: ${filePath}`,
            rule: '.windsurf/rules/rule-main-rules.md',
            suggestion: 'Verifique o caminho do arquivo'
          };
        }
      } catch (error) {
        // Erro ao verificar existencia, permite continuar
      }
    }

    // Verificar escopo permitido (arquivos dentro do projeto)
    const absolutePath = path.resolve(filePath);
    const cwd = process.cwd();

    // Bloquear arquivos fora do diretorio do projeto
    const allowedExternalPaths = [
      '/tmp/',
      '/var/tmp/',
      process.env.TEMP,
      process.env.TMP
    ].filter(Boolean);

    const isInProject = absolutePath.startsWith(cwd);
    const isAllowedExternal = allowedExternalPaths.some(p =>
      p && absolutePath.startsWith(p)
    );

    if (!isInProject && !isAllowedExternal) {
      return {
        valid: false,
        reason: `Arquivo fora do escopo do projeto: ${filePath}`,
        rule: '.windsurf/rules/rule-main-rules.md - Secao 5 (Proibicoes)',
        suggestion: 'NUNCA editar arquivos fora do escopo do projeto sem permissao explicita'
      };
    }

    // Verificar se arquivo e critico (git, config, etc)
    const criticalPatterns: RegExp[] = [
      /\.git\//,
      /\.gitignore$/,
      /package\.json$/,
      /yarn\.lock$/,
      /\.env$/,
      /\.env\.local$/,
      /\.env\..*$/,
      /tsconfig\.json$/,
      /tailwind\.config/,
      /next\.config/
    ];

    const isCriticalFile = criticalPatterns.some(pattern =>
      pattern.test(absolutePath)
    );

    if (isCriticalFile && this.config.mode !== 'headless') {
      console.warn(`[NEMESIS WARNING] Modificacao de arquivo critico detectada: ${filePath}`);
    }

    return { valid: true };
  }

  /**
   * Validar comando Bash (modo headless)
   */
  private validateCommandHeadless(command: string | undefined): PreToolValidationResult {
    if (!command) {
      return {
        valid: false,
        reason: 'Comando nao fornecido',
        rule: '.windsurf/rules/rule-main-rules.md',
        suggestion: 'Especifique o comando a ser executado'
      };
    }

    // Verificar seguranca do comando via PermissionGate
    const safetyCheck = PermissionGate.checkCommandSafety(command);

    if (safetyCheck.riskLevel === 'high') {
      return {
        valid: false,
        reason: `Comando de alto risco detectado: ${safetyCheck.reasons.join(', ')}`,
        rule: '.windsurf/rules/Conformidade.md - Secao 3 (Seguranca OWASP)',
        suggestion: 'Comandos de sistema precisam de permissao explicita do usuario'
      };
    }

    // Verificar comandos permitidos para bugfix (tsc --noEmit)
    const allowedBugfixCommands = [
      /^yarn\s+tsc\s+--noEmit$/,
      /^npx\s+tsc\s+--noEmit$/,
      /^tsc\s+--noEmit$/
    ];

    const isBugfixCommand = allowedBugfixCommands.some(pattern =>
      pattern.test(command.trim())
    );

    if (isBugfixCommand) {
      return { valid: true }; // Sempre permitir validacao TypeScript
    }

    // Verificar comandos proibidos absolutos
    const forbiddenPatterns = [
      /rm\s+-rf\s+\//,           // rm -rf /
      /sudo\s+rm/,               // sudo rm
      /format\s+c:/,             // format c:
      /dd\s+if=/,                // dd if=
      />\s*\/dev\/null.*important/, // Redirecting important data
      /shutdown/,                // shutdown
      /reboot/,                 // reboot
      /passwd/,                 // password changes
      /chmod\s+777/              // dangerous permissions
    ];

    for (const pattern of forbiddenPatterns) {
      if (pattern.test(command)) {
        return {
          valid: false,
          reason: `Comando proibido detectado: ${command}`,
          rule: '.windsurf/rules/rule-main-rules.md - Secao 5 (Proibicoes Absolutas)',
          suggestion: 'Este comando e proibido por questoes de seguranca'
        };
      }
    }

    // Para comandos de medio risco, loga warning mas permite
    if (safetyCheck.riskLevel === 'medium' && this.config.mode !== 'headless') {
      console.warn(`[NEMESIS WARNING] Comando de medio risco: ${command}`);
    }

    return { valid: true };
  }

  /**
   * Verificar se esta em modo headless
   */
  isHeadlessMode(): boolean {
    return this.config.mode === 'headless';
  }
}
