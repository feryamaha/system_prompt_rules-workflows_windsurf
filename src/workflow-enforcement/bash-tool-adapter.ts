import { createBashTool } from 'bash-tool';
import { ExecutionOptions, CommandResult } from './types';

export class BashToolAdapter {
  private bashTool: any;
  private tools: any;

  constructor(options: ExecutionOptions = {}) {
    this.initialize(options);
  }

  private async initialize(options: ExecutionOptions): Promise<void> {
    try {
      const { tools } = await createBashTool({
        files: options.files || {}
      });

      this.tools = tools;
      this.bashTool = tools.bash;
    } catch (error) {
      console.error('Failed to initialize bash-tool:', error);
      throw error;
    }
  }

  async executeCommand(command: string): Promise<CommandResult> {
    const startTime = Date.now();

    try {
      const result = await this.bashTool({
        command
      });

      const executionTime = Date.now() - startTime;

      return {
        stdout: result.stdout || '',
        stderr: result.stderr || '',
        exitCode: result.exitCode || 0,
        executionTime,
        command
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;

      return {
        stdout: '',
        stderr: error instanceof Error ? error.message : 'Unknown error',
        exitCode: 1,
        executionTime,
        command
      };
    }
  }

  async executeCommands(commands: string[]): Promise<CommandResult[]> {
    const results: CommandResult[] = [];

    for (const command of commands) {
      const result = await this.executeCommand(command);
      results.push(result);

      // Stop execution if a command fails
      if (result.exitCode !== 0) {
        console.warn(`Command failed with exit code ${result.exitCode}: ${command}`);
        break;
      }
    }

    return results;
  }

  async readFile(path: string): Promise<string> {
    try {
      const result = await this.tools.readFile({
        path
      });

      return result.content || '';
    } catch (error) {
      throw new Error(`Failed to read file ${path}: ${error}`);
    }
  }

  async writeFile(path: string, content: string): Promise<boolean> {
    try {
      const result = await this.tools.writeFile({
        path,
        content
      });

      return result.success || false;
    } catch (error) {
      throw new Error(`Failed to write file ${path}: ${error}`);
    }
  }

  getTools(): any {
    return this.tools;
  }

  async createAISDKTool(options: ExecutionOptions = {}): Promise<any> {
    const { tools } = await createBashTool({
      files: options.files || {},
      onBeforeBashCall: ({ command }: { command: string }) => {
        console.log(`[BASH-TOOL] Executing: ${command}`);
        return { command };
      },
      onAfterBashCall: ({ command, result }: { command: string; result: any }) => {
        console.log(`[BASH-TOOL] Command completed: ${command} (exit: ${result.exitCode})`);
        return { result };
      }
    });

    return tools;
  }

  static async createForAIAgent(options: ExecutionOptions = {}): Promise<BashToolAdapter> {
    const adapter = new BashToolAdapter(options);
    return adapter;
  }

  async withNetworkAccess(allowedUrls: string[] = []): Promise<BashToolAdapter> {
    const networkOptions: ExecutionOptions = {
      ...this.getOptions(),
      networkAccess: true,
      allowedUrls
    };

    return new BashToolAdapter(networkOptions);
  }

  private getOptions(): ExecutionOptions {
    // Return current options (simplified implementation)
    return {
      cwd: '/home/user',
      env: {
        PATH: '/usr/local/bin:/usr/bin:/bin',
        HOME: '/home/user',
        USER: 'user'
      }
    };
  }

  async validateEnvironment(): Promise<{
    isValid: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    try {
      // Test basic command execution
      const testResult = await this.executeCommand('echo "test"');
      if (testResult.exitCode !== 0) {
        issues.push('Basic command execution failed');
      }

      // Test file operations
      await this.writeFile('/tmp/test.txt', 'test content');
      const content = await this.readFile('/tmp/test.txt');
      if (content !== 'test content') {
        issues.push('File read/write operations failed');
      }

      // Clean up test file
      await this.executeCommand('rm /tmp/test.txt');

    } catch (error) {
      issues.push(`Environment validation failed: ${error}`);
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  async getSystemInfo(): Promise<{
    platform: string;
    shell: string;
    tools: string[];
  }> {
    try {
      const platformResult = await this.executeCommand('uname -s');
      const shellResult = await this.executeCommand('echo $SHELL');

      return {
        platform: platformResult.stdout.trim() || 'unknown',
        shell: shellResult.stdout.trim() || '/bin/bash',
        tools: ['bash', 'readFile', 'writeFile']
      };
    } catch (error) {
      return {
        platform: 'unknown',
        shell: '/bin/bash',
        tools: ['bash', 'readFile', 'writeFile']
      };
    }
  }
}
