import { Violation } from './types';
import { writeFileSync, appendFileSync, existsSync } from 'fs';
import { join } from 'path';

export class ViolationLogger {
  private static readonly LOG_FILE = 'violations.log';
  private static violations: Violation[] = [];

  static logViolation(violation: Violation): void {
    // Add to in-memory log
    this.violations.push(violation);

    // Write to file
    this.writeToFile(violation);

    // Console output for immediate visibility
    console.error(`[VIOLATION] ${violation.type.toUpperCase()}: ${violation.message}`);
    if (violation.rule) {
      console.error(`  Rule: ${violation.rule}`);
    }
    if (violation.command) {
      console.error(`  Command: ${violation.command}`);
    }
    console.error(`  Timestamp: ${violation.timestamp.toISOString()}`);
    console.error('');
  }

  private static writeToFile(violation: Violation): void {
    const logEntry = this.formatLogEntry(violation);
    
    try {
      appendFileSync(this.LOG_FILE, logEntry + '\n');
    } catch (error) {
      console.error('Failed to write violation to log file:', error);
    }
  }

  private static formatLogEntry(violation: Violation): string {
    const entry = {
      timestamp: violation.timestamp.toISOString(),
      type: violation.type,
      message: violation.message,
      rule: violation.rule || '',
      command: violation.command || ''
    };

    return JSON.stringify(entry);
  }

  static getViolations(): Violation[] {
    return [...this.violations];
  }

  static getViolationsByType(type: Violation['type']): Violation[] {
    return this.violations.filter(v => v.type === type);
  }

  static getViolationsByWorkflow(workflowName: string): Violation[] {
    return this.violations.filter(v => 
      v.rule && v.rule.includes(workflowName)
    );
  }

  static clearViolations(): void {
    this.violations = [];
  }

  static generateReport(): string {
    const totalViolations = this.violations.length;
    const violationsByType = this.groupViolationsByType();
    const violationsByWorkflow = this.groupViolationsByWorkflow();

    let report = '# Violation Report\n\n';
    report += `**Total Violations:** ${totalViolations}\n\n`;

    report += '## Violations by Type\n\n';
    for (const [type, violations] of Object.entries(violationsByType)) {
      report += `### ${type.toUpperCase()}\n`;
      report += `- Count: ${violations.length}\n`;
      report += `- Latest: ${violations[violations.length - 1]?.timestamp.toISOString() || 'N/A'}\n\n`;
    }

    report += '## Violations by Workflow\n\n';
    for (const [workflow, violations] of Object.entries(violationsByWorkflow)) {
      report += `### ${workflow}\n`;
      report += `- Count: ${violations.length}\n`;
      report += `- Latest: ${violations[violations.length - 1]?.timestamp.toISOString() || 'N/A'}\n\n`;
    }

    if (totalViolations > 0) {
      report += '## Recent Violations\n\n';
      const recentViolations = this.violations
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 10);

      for (const violation of recentViolations) {
        report += `### ${violation.type.toUpperCase()} - ${violation.timestamp.toISOString()}\n`;
        report += `- **Message:** ${violation.message}\n`;
        if (violation.rule) report += `- **Rule:** ${violation.rule}\n`;
        if (violation.command) report += `- **Command:** ${violation.command}\n`;
        report += '\n';
      }
    }

    return report;
  }

  private static groupViolationsByType(): Record<Violation['type'], Violation[]> {
    const grouped: Record<string, Violation[]> = {};
    
    for (const violation of this.violations) {
      if (!grouped[violation.type]) {
        grouped[violation.type] = [];
      }
      grouped[violation.type].push(violation);
    }

    return grouped as Record<Violation['type'], Violation[]>;
  }

  private static groupViolationsByWorkflow(): Record<string, Violation[]> {
    const grouped: Record<string, Violation[]> = {};
    
    for (const violation of this.violations) {
      const workflow = violation.rule?.match(/@([^]]+)/)?.[1] || 'Unknown';
      
      if (!grouped[workflow]) {
        grouped[workflow] = [];
      }
      grouped[workflow].push(violation);
    }

    return grouped;
  }

  static exportToFile(filePath?: string): void {
    const report = this.generateReport();
    const outputPath = filePath || 'violation-report.md';
    
    try {
      writeFileSync(outputPath, report);
      console.log(`Violation report exported to: ${outputPath}`);
    } catch (error) {
      console.error('Failed to export violation report:', error);
    }
  }

  static getStatistics(): {
    total: number;
    byType: Record<Violation['type'], number>;
    byWorkflow: Record<string, number>;
    recentTrend: number; // Violations in the last hour
  } {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    const recentViolations = this.violations.filter(v => v.timestamp >= oneHourAgo);
    
    return {
      total: this.violations.length,
      byType: this.getCountsByType(),
      byWorkflow: this.getCountsByWorkflow(),
      recentTrend: recentViolations.length
    };
  }

  private static getCountsByType(): Record<Violation['type'], number> {
    const counts = {} as Record<Violation['type'], number>;
    
    for (const violation of this.violations) {
      counts[violation.type] = (counts[violation.type] || 0) + 1;
    }
    
    return counts;
  }

  private static getCountsByWorkflow(): Record<string, number> {
    const counts: Record<string, number> = {};
    
    for (const violation of this.violations) {
      const workflow = violation.rule?.match(/@([^]]+)/)?.[1] || 'Unknown';
      counts[workflow] = (counts[workflow] || 0) + 1;
    }
    
    return counts;
  }
}
