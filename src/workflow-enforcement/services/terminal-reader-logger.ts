/**
 * Logger para o Terminal Reader Service
 * Centraliza logs de operações de leitura com fallbacks utilizados
 */

import { LogEntry } from './terminal-reader-types';

export class TerminalReaderLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 100;

  log(
    level: LogEntry['level'],
    operation: string,
    filePath: string,
    method: string,
    success: boolean,
    fallbacks: string[],
    duration?: number,
    error?: string
  ): void {
    const os: 'mac' | 'windows' | 'linux' = process.platform === 'darwin' ? 'mac' : 
                                                   process.platform === 'win32' ? 'windows' : 'linux';
    
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      operation,
      filePath,
      method,
      success,
      duration,
      error,
      fallbacks,
      os
    };
    
    this.logs.push(entry);
    
    // Mantém apenas os logs mais recentes
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
    
    // Exibe logs no console
    if (level === 'error') {
      console.error(`[ERROR] ${operation} em ${filePath}: ${error}`);
    } else if (level === 'warn') {
      console.warn(`[WARN] ${operation} em ${filePath}: ${fallbacks.join(' → ')}`);
    } else if (level === 'debug') {
      console.log(`[DEBUG] ${operation} em ${filePath} via ${fallbacks.join(' → ')}`);
    } else if (level === 'info') {
      console.log(`[INFO] ${operation} em ${filePath} via ${method}`);
    }
  }

  getLogs(level?: LogEntry['level']): LogEntry[] {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return this.logs;
  }

  clearLogs(): void {
    this.logs = [];
  }

  exportLogs(): LogEntry[] {
    return [...this.logs];
  }

  getRecentLogs(count: number = 10): LogEntry[] {
    return this.logs.slice(-count);
  }
}
