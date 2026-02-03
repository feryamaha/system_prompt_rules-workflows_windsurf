import { exec, execSync } from 'child_process';
import { promisify } from 'util';
import { ExecutionOptions, CommandResult } from './types';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

export class BashToolAdapter {
  private executionOptions: ExecutionOptions;

  constructor(options: ExecutionOptions = {}) {
    this.executionOptions = options;
  }

  async executeCommand(command: string): Promise<CommandResult> {
    const startTime = Date.now();

    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd: this.executionOptions.cwd || process.cwd(),
        env: { ...process.env, ...this.executionOptions.env },
        timeout: 60000, // 60 second timeout
        maxBuffer: 1024 * 1024 // 1MB buffer
      });

      const executionTime = Date.now() - startTime;

      return {
        stdout: stdout || '',
        stderr: stderr || '',
        exitCode: 0,
        executionTime,
        command
      };
    } catch (error: any) {
      const executionTime = Date.now() - startTime;

      return {
        stdout: error.stdout || '',
        stderr: error.stderr || error.message || 'Unknown error',
        exitCode: error.code || 1,
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

  async readFile(filePath: string): Promise<string> {
    try {
      const fullPath = path.resolve(this.executionOptions.cwd || process.cwd(), filePath);
      return fs.readFileSync(fullPath, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to read file ${filePath}: ${error}`);
    }
  }

  async writeFile(filePath: string, content: string): Promise<boolean> {
    try {
      const fullPath = path.resolve(this.executionOptions.cwd || process.cwd(), filePath);
      const dir = path.dirname(fullPath);
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(fullPath, content, 'utf-8');
      return true;
    } catch (error) {
      console.error(`Failed to write file ${filePath}:`, error);
      return false;
    }
  }

  getExecutionStatistics(): {
    totalCommands: number;
    averageExecutionTime: number;
    successRate: number;
    totalExecutionTime: number;
  } {
    // Simplified statistics - in a full implementation, track history
    return {
      totalCommands: 0,
      averageExecutionTime: 0,
      successRate: 0,
      totalExecutionTime: 0
    };
  }

  clearExecutionHistory(): void {
    // No-op for native implementation
  }
}
