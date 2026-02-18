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

    // NOVA VALIDAÇÃO: Verificar conteúdo do arquivo para padrões problemáticos
    if (operation === 'Edit' && this.isReactComponent(filePath)) {
      const contentValidation = this.validateReactComponentContent(filePath);
      if (!contentValidation.valid) {
        return contentValidation;
      }
    }

    // NOVA VALIDAÇÃO: Verificar componentes UI para acessibilidade
    if (operation === 'Edit' && this.isUIComponent(filePath)) {
      // VERIFICAR SE É COMPONENTE SMART ANTES DE VALIDAR
      if (this.isSmartComponent(filePath)) {
        // Componentes smart são isentos de validações de separação UI/lógica
        if (this.config.mode !== 'headless') {
          console.log(`[NEMESIS INFO] Componente smart detectado: ${filePath} - validações de UI/lógica isentas`);
        }
        return { valid: true };
      }
      
      const uiValidation = this.validateUIComponentContent(filePath);
      if (!uiValidation.valid) {
        return uiValidation;
      }
    }

    return { valid: true };
  }

  /**
   * Verificar se arquivo é um componente React
   */
  private isReactComponent(filePath: string): boolean {
    return /\.(tsx|jsx)$/.test(filePath) && 
           (filePath.includes('/components/') || filePath.includes('/src/'));
  }

  /**
   * Verificar se arquivo é um componente UI
   */
  private isUIComponent(filePath: string): boolean {
    return /\.(tsx|jsx)$/.test(filePath) && 
           filePath.includes('/components/ui/');
  }

  /**
   * Verificar se é um componente smart (isento de validações de UI/lógica)
   */
  private isSmartComponent(filePath: string): boolean {
    try {
      // 1. VERIFICAR COMENTÁRIO SMART COMPONENT (MÉTODO PRINCIPAL)
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('// SMART COMPONENT') || content.includes('/* SMART COMPONENT */')) {
        return true;
      }

      // 2. Verificar nomenclatura no nome do arquivo (apenas legibilidade)
      const fileName = path.basename(filePath, '.tsx');
      if (fileName.includes('Smart') || fileName.includes('Control') || fileName.includes('Manager') || fileName.includes('Handler')) {
        return true;
      }

      // 3. Verificar lista manual de componentes smart
      const smartComponentsPath = path.join(process.cwd(), '.nemesis/smart-components.json');
      if (fs.existsSync(smartComponentsPath)) {
        const smartComponents = JSON.parse(fs.readFileSync(smartComponentsPath, 'utf8'));
        const relativePath = path.relative(process.cwd(), filePath);
        return smartComponents.smartComponents?.includes(relativePath) || false;
      }

      // 4. Verificar componentes conhecidos com concessão
      const knownSmartComponents = [
        'Button.tsx',
        'Container.tsx',
        'InputPesquisaAjuda.tsx'
      ];
      
      return knownSmartComponents.includes(fileName);

    } catch (error) {
      // Erro ao ler arquivo, considera não smart
      return false;
    }
  }

  /**
   * Validar conteúdo de componente UI para acessibilidade e padrões
   */
  private validateUIComponentContent(filePath: string): PreToolValidationResult {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Detectar violações de acessibilidade (Issue #10)
      const accessibilityViolations = [
        {
          pattern: /<button[^>]*>(?![^<]*aria-label)/g,
          reason: 'Button sem aria-label detectado',
          suggestion: 'Adicione aria-label ou aria-describedby para acessibilidade'
        },
        {
          pattern: /<input[^>]*>(?![^<]*placeholder)/g,
          reason: 'Input sem placeholder detectado',
          suggestion: 'Adicione placeholder ou aria-label para melhor UX'
        },
        {
          pattern: /<img[^>]*>(?![^<]*alt)/g,
          reason: 'Imagem sem alt text detectado',
          suggestion: 'Adicione alt="" ou alt descritivo'
        },
        {
          pattern: /onClick[^>]*>(?![^<]*onKeyDown|onKeyPress)/g,
          reason: 'Evento onClick sem suporte de teclado detectado',
          suggestion: 'Adicione onKeyDown ou onKeyPress para acessibilidade'
        }
      ];

      for (const violation of accessibilityViolations) {
        if (violation.pattern.test(content)) {
          return {
            valid: false,
            reason: violation.reason,
            rule: '.windsurf/rules/design-system-convention.md - Acessibilidade',
            suggestion: violation.suggestion
          };
        }
      }

      // Detectar violações de padrões UI (Issues #14-15)
      const uiPatternViolations = [
        {
          pattern: /style\s*=\s*{[^}]*}/g,
          reason: 'CSS inline detectado',
          rule: '.windsurf/rules/design-system-convention.md - Tokens',
          suggestion: 'Use classes Tailwind em vez de CSS inline'
        },
        {
          pattern: /:\s*any\b/g,
          reason: 'Uso de "any" detectado',
          rule: '.windsurf/rules/typescript-typing-convention.md',
          suggestion: 'Use tipagem específica em vez de any'
        },
        {
          pattern: /useState|useEffect/g,
          reason: 'Lógica de negócio em componente UI detectado',
          rule: '.windsurf/rules/ui-separation-convention.md',
          suggestion: 'Mova lógica para hooks customizados'
        }
      ];

      for (const violation of uiPatternViolations) {
        if (violation.pattern.test(content)) {
          return {
            valid: false,
            reason: violation.reason,
            rule: violation.rule,
            suggestion: violation.suggestion
          };
        }
      }

      // Detectar componentes complexos (possível dívida técnica)
      const complexityIndicators = [
        content.length > 500, // Arquivo muito grande
        (content.match(/className/g) || []).length > 20, // Muitas classes
        (content.match(/<div/g) || []).length > 10 // Muitos divs aninhados
      ];

      const complexityScore = complexityIndicators.filter(Boolean).length;
      if (complexityScore >= 2) {
        return {
          valid: false,
          reason: 'Componente UI muito complexo detectado',
          rule: '.windsurf/rules/design-system-convention.md - Composição',
          suggestion: 'Considere quebrar em componentes menores ou usar composição'
        };
      }

    } catch (error) {
      // Erro ao ler arquivo, permite continuar
    }

    return { valid: true };
  }

  /**
   * Validar conteúdo de componente React para violações de hooks
   */
  private validateReactComponentContent(filePath: string): PreToolValidationResult {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Detectar hooks condicionais (Issues #01-02)
      const conditionalHookPatterns = [
        /if\s*\([^)]*\)\s*{\s*(useEffect|useState|useWatch|useDropInput|useFloatingLabel)/g,
        /if\s*\([^)]*\)\s*(useEffect|useState|useWatch|useDropInput|useFloatingLabel)/g,
        /\?\s*{\s*(useEffect|useState|useWatch|useDropInput|useFloatingLabel)/g
      ];

      for (const pattern of conditionalHookPatterns) {
        if (pattern.test(content)) {
          return {
            valid: false,
            reason: 'React Hook chamado condicionalmente detectado',
            rule: '.windsurf/rules/react-hooks-patterns-rules.md - Secao 3.1 (Hooks Condicionais)',
            suggestion: 'Mova todos os hooks para o topo do componente, fora de condicionais'
          };
        }
      }

      // Detectar setState síncrono em useEffect (Issues #03-04)
      const setStateInEffectPattern = /useEffect\s*\([^)]*\)\s*{\s*(setActiveArrow|setIsPlaying|setCurrentSlide|useState)\(/g;
      if (setStateInEffectPattern.test(content)) {
        return {
          valid: false,
          reason: 'setState chamado diretamente no corpo do useEffect',
          rule: '.windsurf/rules/react-hooks-patterns-rules.md - Secao 3.2 (setState em useEffect)',
          suggestion: 'Use verificação condicional ou callback para evitar setState síncrono'
        };
      }

      // Detectar múltiplos hooks do mesmo tipo
      const useStateCount = (content.match(/useState\s*\(/g) || []).length;
      const useEffectCount = (content.match(/useEffect\s*\(/g) || []).length;
      
      if (useStateCount > 5 || useEffectCount > 3) {
        return {
          valid: false,
          reason: 'Muitos hooks detectados - possível violação de padrões',
          rule: '.windsurf/rules/react-hooks-patterns-rules.md',
          suggestion: 'Considere refatorar para usar custom hooks ou reduzir complexidade'
        };
      }

    } catch (error) {
      // Erro ao ler arquivo, permite continuar
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

    // NOVA VALIDAÇÃO: Detectar comandos de configuração problemáticos (Issues #11-13)
    const configViolations = [
      {
        pattern: /eslint.*--config.*eslintrc/,
        reason: 'Configuração ESLint custom detectada',
        rule: '.windsurf/rules/Conformidade.md - Configuração',
        suggestion: 'Use configuração centralizada em package.json'
      },
      {
        pattern: /eslint.*--ignore/,
        reason: 'ESLint bypass detectado',
        rule: '.windsurf/rules/Conformidade.md - Governança',
        suggestion: 'Não ignore regras centralizadas'
      },
      {
        pattern: /npm.*install.*--force/,
        reason: 'Instalação forçada detectada',
        rule: '.windsurf/rules/Conformidade.md - Segurança',
        suggestion: 'Use instalação padrão para evitar vulnerabilidades'
      },
      {
        pattern: /yarn.*add.*--ignore-scripts/,
        reason: 'Scripts ignorados detectado',
        rule: '.windsurf/rules/Conformidade.md - Processo',
        suggestion: 'Execute scripts para validação completa'
      }
    ];

    for (const violation of configViolations) {
      if (violation.pattern.test(command)) {
        return {
          valid: false,
          reason: violation.reason,
          rule: violation.rule,
          suggestion: violation.suggestion
        };
      }
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

    // NOVA VALIDAÇÃO: Verificar comandos de desenvolvimento
    const devCommands = [
      /^yarn\s+lint$/,
      /^yarn\s+build$/,
      /^yarn\s+test$/,
      /^npm\s+run\s+lint$/,
      /^npm\s+run\s+build$/,
      /^npm\s+run\s+test$/
    ];

    const isDevCommand = devCommands.some(pattern =>
      pattern.test(command.trim())
    );

    if (isDevCommand) {
      return { valid: true }; // Permitir comandos de desenvolvimento
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
