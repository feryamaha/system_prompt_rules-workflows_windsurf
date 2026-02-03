import { WorkflowDefinition, ValidationResult, ValidationError, ValidationWarning } from './types';

export class WorkflowValidators {
  private static readonly MANDATORY_RULES = [
    '.windsurf/rules/rule-main-rules.md',
    '.windsurf/rules/origin-rules.md'
  ];

  private static readonly ALLOWED_LANGUAGES = [
    'bash', 'sh', 'shell', 'powershell', 'ps1',
    'javascript', 'js', 'typescript', 'ts',
    'python', 'py', 'markdown', 'md',
    'text', 'json', 'yaml', 'yml', 'xml',
    'sql', 'dockerfile', 'docker-compose'
  ];

  static validateMandatoryRules(workflow: WorkflowDefinition): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Check if mandatory rules are referenced in the content
    for (const rule of this.MANDATORY_RULES) {
      if (!workflow.content.includes(rule)) {
        errors.push({
          code: 'MISSING_MANDATORY_RULE',
          message: `Mandatory rule reference missing: ${rule}`,
          severity: 'error'
        });
      }
    }

    // Check if workflow has proper structure
    if (!workflow.content.includes('##')) {
      warnings.push({
        code: 'MISSING_STRUCTURE',
        message: 'Workflow appears to lack proper markdown structure with ## headers'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static validateAllowedLanguages(workflow: WorkflowDefinition): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    for (const block of workflow.codeBlocks) {
      const language = block.language.toLowerCase();
      
      if (!this.ALLOWED_LANGUAGES.includes(language) && language !== 'text') {
        errors.push({
          code: 'UNSUPPORTED_LANGUAGE',
          message: `Unsupported language '${block.language}' at line ${block.lineNumber}`,
          line: block.lineNumber,
          severity: 'error'
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static validateExecutionSequence(workflow: WorkflowDefinition): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    const content = workflow.content.toLowerCase();
    
    // Check for proper sequence indicators
    const sequenceIndicators = [
      '1.', '2.', '3.', '4.', '5.',
      'primeiro', 'segundo', 'terceiro', 'quarto', 'quinto',
      'first', 'second', 'third', 'fourth', 'fifth',
      'passo', 'step', 'etapa'
    ];

    const hasSequence = sequenceIndicators.some(indicator => content.includes(indicator));

    if (!hasSequence && workflow.codeBlocks.length > 1) {
      warnings.push({
        code: 'UNCLEAR_SEQUENCE',
        message: 'Multiple code blocks found but execution sequence is unclear'
      });
    }

    // Check for dangerous patterns
    const dangerousPatterns = [
      /rm\s+-rf\s+\//,  // rm -rf /
      /sudo\s+rm/,      // sudo rm
      /format\s+c:/,   // format c:
      /dd\s+if=/,      // dd if=
      />\s*\/dev\/null/, // > /dev/null with important data
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(workflow.content)) {
        errors.push({
          code: 'DANGEROUS_COMMAND',
          message: 'Potentially dangerous command pattern detected',
          severity: 'error'
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static validateWorkflowCompleteness(workflow: WorkflowDefinition): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Check if workflow has a title
    if (!workflow.content.match(/^#\s+/m)) {
      warnings.push({
        code: 'MISSING_TITLE',
        message: 'Workflow should have a title (starting with #)'
      });
    }

    // Check if workflow has sections
    const sections = workflow.content.match(/^##\s+/gm);
    if (!sections || sections.length < 2) {
      warnings.push({
        code: 'INSUFFICIENT_SECTIONS',
        message: 'Workflow should have multiple sections (starting with ##)'
      });
    }

    // Check if workflow has executable content
    const executableBlocks = workflow.codeBlocks.filter(block => block.isExecutable);
    if (executableBlocks.length === 0) {
      warnings.push({
        code: 'NO_EXECUTABLE_CONTENT',
        message: 'Workflow has no executable code blocks'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static validateAll(workflow: WorkflowDefinition): ValidationResult {
    const allErrors: ValidationError[] = [];
    const allWarnings: ValidationWarning[] = [];

    // Run all validations
    const validations = [
      this.validateMandatoryRules(workflow),
      this.validateAllowedLanguages(workflow),
      this.validateExecutionSequence(workflow),
      this.validateWorkflowCompleteness(workflow)
    ];

    for (const validation of validations) {
      allErrors.push(...validation.errors);
      allWarnings.push(...validation.warnings);
    }

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings
    };
  }
}
