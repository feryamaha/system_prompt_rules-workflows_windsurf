import { CodeBlock } from './types';

export class CommandExtractor {
  private static readonly COMMENT_PATTERNS = [
    /^\s*#/,           // Bash/Shell comments
    /^\s*\/\//,        // JavaScript/TypeScript comments
    /^\s*\/\*/,        // Multi-line comment start
    /^\s*\*/,         // Multi-line comment middle/end
    /^\s*<!--/,        // HTML/XML comments
    /^\s*;/,          // Some config files
    /^\s*--/,         // Command line comments
  ];

  static extractCommands(codeBlocks: CodeBlock[]): string[] {
    const commands: string[] = [];

    for (const block of codeBlocks) {
      if (!block.isExecutable) continue;

      const blockCommands = this.extractFromBlock(block);
      commands.push(...blockCommands);
    }

    return commands;
  }

  private static extractFromBlock(block: CodeBlock): string[] {
    const lines = block.content.split('\n');
    const commands: string[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip empty lines and comments
      if (!trimmedLine || this.isComment(trimmedLine)) {
        continue;
      }

      // Skip variable assignments and exports
      if (this.isVariableAssignment(trimmedLine)) {
        continue;
      }

      // Skip function definitions
      if (this.isFunctionDefinition(trimmedLine)) {
        continue;
      }

      commands.push(trimmedLine);
    }

    return commands;
  }

  private static isComment(line: string): boolean {
    return this.COMMENT_PATTERNS.some(pattern => pattern.test(line));
  }

  private static isVariableAssignment(line: string): boolean {
    // Match patterns like: VAR=value, export VAR=value, const VAR=value, let VAR=value
    const assignmentPattern = /^(export\s+)?[a-zA-Z_][a-zA-Z0-9_]*\s*=/;
    return assignmentPattern.test(line);
  }

  private static isFunctionDefinition(line: string): boolean {
    // Match patterns like: function name(), name() {, export function name()
    const functionPatterns = [
      /^(export\s+)?(async\s+)?function\s+\w+\s*\(/,
      /^(export\s+)?(const|let|var)\s+\w+\s*=\s*(async\s+)?\(/,
      /^\w+\s*\(\s*\)\s*\{/,
      /^class\s+\w+/,
    ];
    return functionPatterns.some(pattern => pattern.test(line));
  }

  static extractExecutableCommands(codeBlocks: CodeBlock[]): string[] {
    const allCommands = this.extractCommands(codeBlocks);
    
    // Filter for commands that actually execute something
    return allCommands.filter(command => {
      // Skip echo/print statements that don't modify state
      if (/^(echo|print|console\.log|console\.info|console\.warn|console\.error)\s/.test(command)) {
        return false;
      }

      // Skip read-only commands
      if (/^(ls|cat|grep|find|which|where|type|pwd|whoami|date|uptime|free|df|du)\s/.test(command)) {
        return false;
      }

      return true;
    });
  }

  static categorizeCommands(commands: string[]): {
    fileOperations: string[];
    networkOperations: string[];
    systemOperations: string[];
    packageOperations: string[];
    other: string[];
  } {
    const categories = {
      fileOperations: [] as string[],
      networkOperations: [] as string[],
      systemOperations: [] as string[],
      packageOperations: [] as string[],
      other: [] as string[]
    };

    for (const command of commands) {
      const firstWord = command.split(/\s+/)[0];

      if (['cp', 'mv', 'rm', 'mkdir', 'rmdir', 'touch', 'chmod', 'chown', 'ln'].includes(firstWord)) {
        categories.fileOperations.push(command);
      } else if (['curl', 'wget', 'nc', 'netcat', 'ssh', 'scp', 'rsync'].includes(firstWord)) {
        categories.networkOperations.push(command);
      } else if (['systemctl', 'service', 'kill', 'killall', 'ps', 'top', 'htop', 'reboot', 'shutdown'].includes(firstWord)) {
        categories.systemOperations.push(command);
      } else if (['npm', 'yarn', 'pnpm', 'pip', 'conda', 'brew', 'apt', 'yum', 'dnf'].includes(firstWord)) {
        categories.packageOperations.push(command);
      } else {
        categories.other.push(command);
      }
    }

    return categories;
  }
}
