/**
 * Types para o Terminal Reader Service
 * Define interfaces para leitura de arquivos via terminal com fallbacks multiplataforma
 */

export interface ReadOptions {
  start?: number;
  end?: number;
  encoding?: BufferEncoding;
}

export interface ReadResult {
  content: string;
  method: string;
  fallbacks: string[];
  duration: number;
  success: boolean;
  os: 'mac' | 'windows' | 'linux';
}

export interface SearchResult {
  lines: string[];
  method: string;
  fallbacks: string[];
  success: boolean;
  os: 'mac' | 'windows' | 'linux';
  duration: number;
}

export interface PathValidation {
  isProjectRoot: boolean;
  isWithinProject: boolean;
  isGitIgnored: boolean;
  normalizedPath: string;
  securityLevel: 'safe' | 'warning' | 'danger';
}

export interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  operation: string;
  filePath: string;
  method: string;
  success: boolean;
  duration?: number;
  error?: string;
  fallbacks: string[];
  os: 'mac' | 'windows' | 'linux';
}

export interface TerminalCommand {
  command: string;
  description: string;
  alternatives: string[];
  available: boolean;
}
