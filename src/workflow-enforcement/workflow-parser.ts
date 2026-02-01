import { readFile } from 'fs/promises';
import { join } from 'path';
import { WorkflowDefinition, CodeBlock } from './types';

export class WorkflowParser {
  private static readonly CODE_BLOCK_REGEX = /```(\w+)?\n([\s\S]*?)```/g;
  private static readonly METADATA_REGEX = /^---\n([\s\S]*?)\n---/m;

  static async parseWorkflow(filePath: string): Promise<WorkflowDefinition> {
    const content = await readFile(filePath, 'utf-8');
    const name = this.extractWorkflowName(filePath);
    const codeBlocks = this.extractCodeBlocks(content);
    const metadata = this.extractMetadata(content);

    return {
      name,
      path: filePath,
      content,
      codeBlocks,
      metadata
    };
  }

  private static extractWorkflowName(filePath: string): string {
    const basename = filePath.split(/[/\\]/).pop() || '';
    return basename.replace(/\.(md|markdown)$/i, '');
  }

  private static extractCodeBlocks(content: string): CodeBlock[] {
    const blocks: CodeBlock[] = [];
    let match;
    let lineNumber = 1;

    while ((match = this.CODE_BLOCK_REGEX.exec(content)) !== null) {
      const language = match[1] || 'text';
      const blockContent = match[2];
      const startIndex = match.index;
      
      // Calculate line number
      const beforeBlock = content.substring(0, startIndex);
      lineNumber = beforeBlock.split('\n').length + 1;

      blocks.push({
        language,
        content: blockContent,
        lineNumber,
        isExecutable: this.isExecutableLanguage(language)
      });
    }

    return blocks;
  }

  private static extractMetadata(content: string): Record<string, string> {
    const metadataMatch = content.match(this.METADATA_REGEX);
    if (!metadataMatch) {
      return {};
    }

    const metadataSection = metadataMatch[1];
    const metadata: Record<string, string> = {};

    metadataSection.split('\n').forEach(line => {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        const value = line.substring(colonIndex + 1).trim();
        metadata[key] = value;
      }
    });

    return metadata;
  }

  private static isExecutableLanguage(language: string): boolean {
    const executableLanguages = [
      'bash', 'sh', 'shell', 'powershell', 'ps1',
      'javascript', 'js', 'typescript', 'ts',
      'python', 'py', 'node', 'npm', 'yarn'
    ];
    
    return executableLanguages.includes(language.toLowerCase());
  }

  static async parseMultipleWorkflows(filePaths: string[]): Promise<WorkflowDefinition[]> {
    const workflows: WorkflowDefinition[] = [];
    
    for (const filePath of filePaths) {
      try {
        const workflow = await this.parseWorkflow(filePath);
        workflows.push(workflow);
      } catch (error) {
        console.error(`Failed to parse workflow ${filePath}:`, error);
      }
    }
    
    return workflows;
  }
}
