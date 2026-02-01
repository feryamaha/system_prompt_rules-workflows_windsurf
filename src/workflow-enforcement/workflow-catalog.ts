import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import { WorkflowDefinition } from './types';

export class WorkflowCatalog {
  private static readonly WORKFLOWS_DIR = '.windsurf/workflows';

  static async listWorkflows(basePath: string = process.cwd()): Promise<string[]> {
    const workflowsDir = join(basePath, this.WORKFLOWS_DIR);
    
    try {
      const entries = await readdir(workflowsDir);
      const workflowFiles = entries
        .filter(entry => entry.endsWith('.md') || entry.endsWith('.markdown'))
        .map(entry => join(workflowsDir, entry));
      
      return workflowFiles;
    } catch (error) {
      console.error(`Failed to read workflows directory: ${workflowsDir}`, error);
      return [];
    }
  }

  static async listAllWorkflowFiles(basePath: string = process.cwd()): Promise<WorkflowDefinition[]> {
    const workflowFiles = await this.listWorkflows(basePath);
    const workflows: WorkflowDefinition[] = [];

    for (const filePath of workflowFiles) {
      try {
        const fileStat = await stat(filePath);
        if (fileStat.isFile()) {
          workflows.push({
            name: this.extractWorkflowName(filePath),
            path: filePath,
            content: '', // Will be populated by parser
            codeBlocks: [],
            metadata: {}
          });
        }
      } catch (error) {
        console.error(`Failed to stat file ${filePath}:`, error);
      }
    }

    return workflows;
  }

  static async getWorkflowByName(name: string, basePath: string = process.cwd()): Promise<string | null> {
    const workflows = await this.listWorkflows(basePath);
    
    for (const workflowPath of workflows) {
      const workflowName = this.extractWorkflowName(workflowPath);
      if (workflowName === name || workflowName === `${name}.md`) {
        return workflowPath;
      }
    }
    
    return null;
  }

  private static extractWorkflowName(filePath: string): string {
    const basename = filePath.split(/[/\\]/).pop() || '';
    return basename.replace(/\.(md|markdown)$/i, '');
  }

  static async validateWorkflowsDirectory(basePath: string = process.cwd()): Promise<boolean> {
    const workflowsDir = join(basePath, this.WORKFLOWS_DIR);
    
    try {
      const dirStat = await stat(workflowsDir);
      return dirStat.isDirectory();
    } catch {
      return false;
    }
  }
}
