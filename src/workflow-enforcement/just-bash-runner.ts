import { Bash } from 'just-bash';
import { ExecutionOptions, CommandResult } from './types';

export class JustBashRunner {
  private bash: Bash;
  private executionHistory: CommandResult[] = [];
  private currentEnv: Record<string, string>;

  constructor(options: ExecutionOptions = {}) {
    this.currentEnv = {
      PATH: '/usr/local/bin:/usr/bin:/bin',
      HOME: '/home/user',
      USER: 'user',
      ...options.env
    };

    this.bash = new Bash({
      executionLimits: {
        maxCallDepth: options.maxCallDepth || 50,
        maxCommandCount: options.maxCommandCount || 1000,
        maxLoopIterations: options.maxLoopIterations || 1000,
        maxAwkIterations: 1000,
        maxSedIterations: 1000
      },
      cwd: options.cwd || '/home/user',
      env: this.currentEnv
    });
  }

  async executeCommand(command: string, options: ExecutionOptions = {}): Promise<CommandResult> {
    const startTime = Date.now();
    
    try {
      const result = await this.bash.exec(command, {
        cwd: options.cwd,
        env: options.env
      });

      const executionTime = Date.now() - startTime;
      const commandResult: CommandResult = {
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: result.exitCode,
        executionTime,
        command
      };

      this.executionHistory.push(commandResult);
      return commandResult;

    } catch (error) {
      const executionTime = Date.now() - startTime;
      const commandResult: CommandResult = {
        stdout: '',
        stderr: error instanceof Error ? error.message : 'Unknown error',
        exitCode: 1,
        executionTime,
        command
      };

      this.executionHistory.push(commandResult);
      return commandResult;
    }
  }

  async executeCommands(commands: string[], options: ExecutionOptions = {}): Promise<CommandResult[]> {
    const results: CommandResult[] = [];

    for (const command of commands) {
      const result = await this.executeCommand(command, options);
      results.push(result);

      // Stop execution if a command fails
      if (result.exitCode !== 0) {
        console.warn(`Command failed with exit code ${result.exitCode}: ${command}`);
        break;
      }
    }

    return results;
  }

  async executeWithNetworkAccess(command: string, allowedUrls: string[] = []): Promise<CommandResult> {
    // Create a new bash instance with network access enabled
    const networkBash = new Bash({
      executionLimits: {
        maxCallDepth: 50,
        maxCommandCount: 1000,
        maxLoopIterations: 1000
      },
      cwd: '/home/user',
      env: {
        PATH: '/usr/local/bin:/usr/bin:/bin',
        HOME: '/home/user',
        USER: 'user',
        // Configure network access
        CURL_ALLOWLIST: allowedUrls.join(',')
      }
    });

    const startTime = Date.now();
    
    try {
      const result = await networkBash.exec(command);
      const executionTime = Date.now() - startTime;
      
      return {
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: result.exitCode,
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

  getExecutionHistory(): CommandResult[] {
    return [...this.executionHistory];
  }

  clearExecutionHistory(): void {
    this.executionHistory = [];
  }

  async getFileContent(filePath: string): Promise<string> {
    try {
      const result = await this.bash.exec(`cat ${filePath}`);
      return result.stdout;
    } catch (error) {
      throw new Error(`Failed to read file ${filePath}: ${error}`);
    }
  }

  async writeFileContent(filePath: string, content: string): Promise<boolean> {
    try {
      // Escape content for shell
      const escapedContent = content.replace(/'/g, "'\"'\"'");
      const result = await this.bash.exec(`echo '${escapedContent}' > ${filePath}`);
      return result.exitCode === 0;
    } catch (error) {
      throw new Error(`Failed to write file ${filePath}: ${error}`);
    }
  }

  async listFiles(directory: string = '.'): Promise<string[]> {
    try {
      const result = await this.bash.exec(`ls -la ${directory}`);
      const lines = result.stdout.split('\n').filter(line => line.trim());
      
      // Parse ls output to get just filenames
      return lines.slice(1).map(line => {
        const parts = line.trim().split(/\s+/);
        return parts[parts.length - 1];
      }).filter(name => name !== '.' && name !== '..');
    } catch (error) {
      throw new Error(`Failed to list directory ${directory}: ${error}`);
    }
  }

  async fileExists(filePath: string): Promise<boolean> {
    try {
      const result = await this.bash.exec(`test -f ${filePath} && echo "exists"`);
      return result.stdout.trim() === 'exists';
    } catch {
      return false;
    }
  }

  async directoryExists(directory: string): Promise<boolean> {
    try {
      const result = await this.bash.exec(`test -d ${directory} && echo "exists"`);
      return result.stdout.trim() === 'exists';
    } catch {
      return false;
    }
  }

  async createDirectory(directory: string): Promise<boolean> {
    try {
      const result = await this.bash.exec(`mkdir -p ${directory}`);
      return result.exitCode === 0;
    } catch (error) {
      throw new Error(`Failed to create directory ${directory}: ${error}`);
    }
  }

  async getCurrentWorkingDirectory(): Promise<string> {
    try {
      const result = await this.bash.exec('pwd');
      return result.stdout.trim();
    } catch (error) {
      throw new Error(`Failed to get current directory: ${error}`);
    }
  }

  async changeDirectory(directory: string): Promise<boolean> {
    try {
      const result = await this.bash.exec(`cd ${directory}`);
      return result.exitCode === 0;
    } catch (error) {
      throw new Error(`Failed to change directory to ${directory}: ${error}`);
    }
  }

  getEnvironmentVariables(): Record<string, string> {
    return { ...this.currentEnv };
  }

  setEnvironmentVariable(key: string, value: string): void {
    this.currentEnv[key] = value;
  }

  async getExecutionStatistics(): Promise<{
    totalCommands: number;
    averageExecutionTime: number;
    successRate: number;
    totalExecutionTime: number;
  }> {
    const totalCommands = this.executionHistory.length;
    
    if (totalCommands === 0) {
      return {
        totalCommands: 0,
        averageExecutionTime: 0,
        successRate: 0,
        totalExecutionTime: 0
      };
    }

    const successfulCommands = this.executionHistory.filter(r => r.exitCode === 0);
    const totalExecutionTime = this.executionHistory.reduce((sum, r) => sum + r.executionTime, 0);
    const averageExecutionTime = totalExecutionTime / totalCommands;
    const successRate = (successfulCommands.length / totalCommands) * 100;

    return {
      totalCommands,
      averageExecutionTime,
      successRate,
      totalExecutionTime
    };
  }
}
