import { WorkflowDefinition, WorkflowRunnerResult, ExecutionOptions } from './types';
import { WorkflowParser } from './workflow-parser';
import { WorkflowCatalog } from './workflow-catalog';
import { CommandExtractor } from './command-extractor';
import { WorkflowEnforcer } from './workflow-enforcer';
import { BashToolAdapter } from './bash-tool-adapter';
import { ViolationLogger } from './violation-logger';

export class WorkflowRunner {
  private enforcer: WorkflowEnforcer;
  private bashToolAdapter: BashToolAdapter;
  private executionOptions: ExecutionOptions;

  constructor(options: ExecutionOptions = {}) {
    this.executionOptions = options;
    this.enforcer = new WorkflowEnforcer({
      blockUnauthorizedCommands: true,
      logViolations: true,
      requirePermissionForFileEdits: true,
      allowedLanguages: ['bash', 'javascript', 'typescript', 'python', 'markdown'],
      mandatoryRules: ['.windsurf/rules/rule-main-rules.md']
    });

    this.bashToolAdapter = new BashToolAdapter(options);
  }

  async runWorkflow(workflowPath: string, options: ExecutionOptions = {}): Promise<WorkflowRunnerResult> {
    const startTime = Date.now();
    
    try {
      // Parse workflow
      const workflow = await WorkflowParser.parseWorkflow(workflowPath);
      
      // Pre-execution checks
      const preCheck = await this.enforcer.preExecutionCheck(workflow);
      if (!preCheck.canProceed) {
        const violation = {
          type: 'rule_violation' as const,
          message: `Pre-execution check failed: ${preCheck.reasons.join(', ')}`,
          rule: `.windsurf/rule-main-rules.md`,
          timestamp: new Date()
        };
        
        ViolationLogger.logViolation(violation);

        return {
          workflow: workflow.name,
          success: false,
          results: [],
          violations: [violation],
          executionTime: Date.now() - startTime
        };
      }

      // Extract commands
      const commands = CommandExtractor.extractExecutableCommands(workflow.codeBlocks);
      
      if (commands.length === 0) {
        return {
          workflow: workflow.name,
          success: true,
          results: [],
          violations: [],
          executionTime: Date.now() - startTime
        };
      }

      // Enforce permissions
      const enforcement = await this.enforcer.enforceWorkflowExecution(workflow, commands);
      
      // Execute allowed commands
      const results = await this.executeWithBashTool(enforcement.allowedCommands, options);

      // Log blocked commands as violations
      for (const blockedCommand of enforcement.blockedCommands) {
        const violation = {
          type: 'permission_denied' as const,
          message: `Command blocked by enforcement engine`,
          command: blockedCommand,
          rule: `.windsurf/rule-main-rules.md`,
          timestamp: new Date()
        };
        
        ViolationLogger.logViolation(violation);
        enforcement.violations.push(violation);
      }

      const success = enforcement.blockedCommands.length === 0 && 
                      results.every(r => r.exitCode === 0);

      return {
        workflow: workflow.name,
        success,
        results,
        violations: enforcement.violations,
        executionTime: Date.now() - startTime
      };

    } catch (error) {
      const violation = {
        type: 'syntax_error' as const,
        message: error instanceof Error ? error.message : 'Unknown error',
        rule: `.windsurf/rule-main-rules.md`,
        timestamp: new Date()
      };

      ViolationLogger.logViolation(violation);

      return {
        workflow: workflowPath,
        success: false,
        results: [],
        violations: [violation],
        executionTime: Date.now() - startTime
      };
    }
  }

  private async executeWithBashTool(commands: string[], options: ExecutionOptions): Promise<any[]> {
    const results = [];

    for (const command of commands) {
      try {
        const result = await this.bashToolAdapter.executeCommand(command);
        results.push(result);

        if (result.exitCode !== 0) {
          console.warn(`Command failed with exit code ${result.exitCode}: ${command}`);
          break;
        }
      } catch (error) {
        results.push({
          stdout: '',
          stderr: error instanceof Error ? error.message : 'Unknown error',
          exitCode: 1,
          executionTime: 0,
          command
        });
        break;
      }
    }

    return results;
  }

  async runAllWorkflows(basePath: string = process.cwd(), options: ExecutionOptions = {}): Promise<WorkflowRunnerResult[]> {
    const workflowFiles = await WorkflowCatalog.listWorkflows(basePath);
    const results: WorkflowRunnerResult[] = [];

    for (const workflowFile of workflowFiles) {
      try {
        const result = await this.runWorkflow(workflowFile, options);
        results.push(result);
      } catch (error) {
        console.error(`Failed to run workflow ${workflowFile}:`, error);
      }
    }

    return results;
  }

  async runWorkflowByName(name: string, basePath: string = process.cwd(), options: ExecutionOptions = {}): Promise<WorkflowRunnerResult | null> {
    const workflowPath = await WorkflowCatalog.getWorkflowByName(name, basePath);
    
    if (!workflowPath) {
      console.error(`Workflow not found: ${name}`);
      return null;
    }

    return this.runWorkflow(workflowPath, options);
  }

  async validateWorkflow(workflowPath: string): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    try {
      const workflow = await WorkflowParser.parseWorkflow(workflowPath);
      const validation = await this.enforcer.validateWorkflow(workflow);

      return {
        isValid: validation.isValid,
        errors: validation.errors.map(e => e.message),
        warnings: validation.warnings.map(w => w.message)
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: []
      };
    }
  }

  async validateAllWorkflows(basePath: string = process.cwd()): Promise<{
    valid: number;
    invalid: number;
    total: number;
    results: Array<{
      workflow: string;
      isValid: boolean;
      errors: string[];
      warnings: string[];
    }>;
  }> {
    const workflowFiles = await WorkflowCatalog.listWorkflows(basePath);
    const results = [];
    let valid = 0;
    let invalid = 0;

    for (const workflowFile of workflowFiles) {
      const validation = await this.validateWorkflow(workflowFile);
      results.push({
        workflow: workflowFile,
        isValid: validation.isValid,
        errors: validation.errors,
        warnings: validation.warnings
      });

      if (validation.isValid) {
        valid++;
      } else {
        invalid++;
      }
    }

    return {
      valid,
      invalid,
      total: workflowFiles.length,
      results
    };
  }

  getExecutionStatistics(): {
    violations: any;
  } {
    return {
      violations: ViolationLogger.getStatistics()
    };
  }

  generateReport(): string {
    const stats = this.getExecutionStatistics();
    const violations = ViolationLogger.generateReport();

    let report = '# Workflow Runner Report\n\n';
    report += `## Execution Statistics\n\n`;
    report += `- Total Violations: ${stats.violations.total}\n\n`;

    report += violations;

    return report;
  }

  reset(): void {
    this.enforcer.reset();
    ViolationLogger.clearViolations();
  }

  updateExecutionOptions(options: Partial<ExecutionOptions>): void {
    this.executionOptions = { ...this.executionOptions, ...options };
    this.bashToolAdapter = new BashToolAdapter(this.executionOptions);
  }
}
