/**
 * Terminal Reader Service
 * Implementa leitura de arquivos via terminal com fallbacks multiplataforma
 * Permite acesso a arquivos protegidos por .gitignore para o Nemesis
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';
import { ReadOptions, ReadResult, SearchResult, PathValidation, TerminalCommand } from './terminal-reader-types';
import { TerminalReaderLogger } from './terminal-reader-logger';

const execAsync = promisify(exec);

export class TerminalReaderService {
  private logger: TerminalReaderLogger;
  private projectRoot: string;
  
  // Comandos por sistema operacional
  private readonly MAC_COMMANDS = {
    cat: 'cat',
    head: 'head -n',
    tail: 'tail -n',
    grep: 'grep',
    sed: 'sed',
    wc: 'wc -l',
    find: 'find'
  };

  private readonly WINDOWS_COMMANDS = {
    cat: 'type',
    head: 'type | findstr /V ""',
    tail: 'type | findstr /V ""',
    grep: 'findstr',
    sed: 'powershell -Command "Get-Content -Path \\"{file}\\" | Select-String -Pattern \\"{pattern}\\" -Raw"',
    wc: 'find /V /C \\"*\"',
    find: 'dir /b /s'
  };

  private readonly LINUX_COMMANDS = {
    cat: 'cat',
    head: 'head -n',
    tail: 'tail -n',
    grep: 'grep',
    sed: 'sed',
    wc: 'wc -l',
    find: 'find'
  };

  constructor(projectRoot?: string) {
    this.logger = new TerminalReaderLogger();
    this.projectRoot = projectRoot || process.cwd();
  }

  /**
   * Detecta o sistema operacional atual
   */
  private detectOS(): 'mac' | 'windows' | 'linux' {
    const platform = process.platform;
    if (platform === 'darwin') return 'mac';
    if (platform === 'win32') return 'windows';
    return 'linux';
  }

  /**
   * Obtém os comandos para o sistema operacional atual
   */
  private getCommands() {
    const os = this.detectOS();
    switch (os) {
      case 'mac':
        return this.MAC_COMMANDS;
      case 'windows':
        return this.WINDOWS_COMMANDS;
      case 'linux':
        return this.LINUX_COMMANDS;
      default:
        return this.LINUX_COMMANDS;
    }
  }

  /**
   * Verifica se um comando está disponível
   */
  private async checkCommandAvailability(command: string): Promise<boolean> {
    try {
      await execAsync(command, { timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Valida e normaliza um caminho de arquivo
   */
  private validatePath(filePath: string): PathValidation {
    const normalizedPath = path.resolve(this.projectRoot, filePath);
    const relativePath = path.relative(this.projectRoot, normalizedPath);
    
    // Verifica se o caminho tenta escapar do projeto
    const isWithinProject = !relativePath.startsWith('..') && !path.isAbsolute(relativePath);
    const isProjectRoot = normalizedPath === this.projectRoot;
    
    // Verifica se está no .gitignore
    const isGitIgnored = this.checkGitIgnoreSync(relativePath);
    
    // Nível de segurança
    let securityLevel: 'safe' | 'warning' | 'danger' = 'safe';
    if (!isWithinProject) {
      securityLevel = 'danger';
    } else if (isGitIgnored) {
      securityLevel = 'warning';
    }

    return {
      isProjectRoot,
      isWithinProject,
      isGitIgnored,
      normalizedPath,
      securityLevel
    };
  }

  /**
   * Verificação síncrona se arquivo está no .gitignore
   */
  private checkGitIgnoreSync(relativePath: string): boolean {
    try {
      const gitIgnorePath = path.join(this.projectRoot, '.gitignore');
      if (!fs.existsSync(gitIgnorePath)) {
        return false;
      }
      
      const gitIgnore = fs.readFileSync(gitIgnorePath, 'utf8');
      const lines = gitIgnore.split('\n').filter(line => line.trim() && !line.startsWith('#'));
      
      return lines.some(pattern => {
        // Converte padrão .gitignore para regex
        const regexPattern = pattern
          .replace(/\./g, '\\.')
          .replace(/\*/g, '.*')
          .replace(/\?/g, '[^/]')
          .replace(/^\/+/, '^')
          .replace(/\/+$/, '');
        
        const regex = new RegExp(regexPattern);
        return regex.test(relativePath) || regex.test(path.basename(relativePath));
      });
    } catch {
      return false;
    }
  }

  /**
   * Lê um arquivo com múltiplos fallbacks
   */
  async readFile(filePath: string): Promise<ReadResult> {
    const startTime = Date.now();
    const validation = this.validatePath(filePath);
    const commands = this.getCommands();
    const os = this.detectOS();
    
    if (!validation.isWithinProject) {
      throw new Error(`Caminho fora do projeto: ${filePath}`);
    }

    const fallbackChain = [
      commands.cat,
      commands.head + ' 1000', // Limitar a 1000 linhas
      'node -e "console.log(require(\'fs\').readFileSync(\'' + validation.normalizedPath + '\', \'utf8\'))"',
      'python -c "with open(\'' + validation.normalizedPath + '\', \'r\') as f: print(f.read())"',
      'echo "ERROR: Não foi possível ler o arquivo: ' + validation.normalizedPath + '"'
    ];

    const usedFallbacks: string[] = [];
    let lastError: Error | null = null;

    for (const command of fallbackChain) {
      try {
        usedFallbacks.push(command);
        
        // Para comandos que precisam do arquivo como parâmetro
        const fullCommand = command.includes('{file}') || command.includes('{pattern}')
          ? command.replace('{file}', validation.normalizedPath)
          : `${command} "${validation.normalizedPath}"`;

        const result = await execAsync(fullCommand, { 
          timeout: 5000,
          maxBuffer: 1024 * 1024 // 1MB
        });

        const duration = Date.now() - startTime;
        const content = result.stdout.toString();
        
        this.logger.log('info', 'readFile', filePath, usedFallbacks[usedFallbacks.length - 1], true, usedFallbacks, duration);

        return {
          content: content.trim(),
          method: usedFallbacks[usedFallbacks.length - 1],
          fallbacks: usedFallbacks,
          duration,
          success: true,
          os
        };

      } catch (error) {
        lastError = error as Error;
        this.logger.log('warn', 'readFile', filePath, command, false, [command], undefined, (error as Error).message);
        continue;
      }
    }

    // Todos os fallbacks falharam
    const duration = Date.now() - startTime;
    this.logger.log('error', 'readFile', filePath, 'all_fallbacks', false, fallbackChain, duration, lastError?.message);
    
    throw new Error(`Não foi possível ler o arquivo: ${filePath}. Último erro: ${lastError?.message}`);
  }

  /**
   * Lê linhas específicas de um arquivo
   */
  async readLines(filePath: string, options: ReadOptions = {}): Promise<string[]> {
    const startTime = Date.now();
    const validation = this.validatePath(filePath);
    const commands = this.getCommands();
    const os = this.detectOS();
    
    if (!validation.isWithinProject) {
      throw new Error(`Caminho fora do projeto: ${filePath}`);
    }

    const { start = 0, end = start + 50 } = options;
    const count = end - start;

    // Tentar ler linhas específicas
    const lineCommands = os === 'windows' 
      ? [
          `powershell -Command "Get-Content -Path \\"${validation.normalizedPath}\\" | Select-Object -Index ${start} -Last ${count}"`,
          `powershell -Command "Get-Content -Path \\"${validation.normalizedPath}\\" | Select-Object -Skip ${start} -First ${count}"`
        ]
      : [
          `sed -n ${start + 1},${end}p "${validation.normalizedPath}"`,
          `awk 'NR>=${start + 1} && NR<=${end}' "${validation.normalizedPath}"`
        ];

    const usedFallbacks: string[] = [];
    let lastError: Error | null = null;

    for (const command of lineCommands) {
      try {
        usedFallbacks.push(command);
        
        const result = await execAsync(command, { 
          timeout: 5000,
          maxBuffer: 1024 * 1024 
        });

        const duration = Date.now() - startTime;
        const lines = result.stdout.toString()
          .split('\n')
          .filter(line => line.length > 0)
          .slice(0, count);

        this.logger.log('info', 'readLines', filePath, usedFallbacks[usedFallbacks.length - 1], true, usedFallbacks, duration);

        return lines;

      } catch (error) {
        lastError = error as Error;
        this.logger.log('warn', 'readLines', filePath, command, false, [command], undefined, (error as Error).message);
        continue;
      }
    }

    // Fallback: ler arquivo inteiro e extrair linhas
    try {
      const fileResult = await this.readFile(filePath);
      const lines = fileResult.content.split('\n');
      const duration = Date.now() - startTime;
      
      this.logger.log('info', 'readLines', filePath, 'full_file_fallback', true, [...usedFallbacks, 'full_file_read'], duration);

      return lines.slice(start, end);

    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.log('error', 'readLines', filePath, 'all_fallbacks', false, lineCommands, duration, lastError?.message);
      
      throw new Error(`Não foi possível ler linhas do arquivo: ${filePath}. Último erro: ${lastError?.message}`);
    }
  }

  /**
   * Busca um padrão em um arquivo
   */
  async searchInFile(filePath: string, pattern: string): Promise<SearchResult> {
    const startTime = Date.now();
    const validation = this.validatePath(filePath);
    const commands = this.getCommands();
    const os = this.detectOS();
    
    if (!validation.isWithinProject) {
      throw new Error(`Caminho fora do projeto: ${filePath}`);
    }

    const searchCommands = os === 'windows'
      ? [
          `findstr /R /N "${pattern}" "${validation.normalizedPath}"`,
          `powershell -Command "Select-String -Pattern \\"${pattern}\\" -Path \\"${validation.normalizedPath}\\" | Select-Object LineNumber, Line"`
        ]
      : [
          `grep -n "${pattern}" "${validation.normalizedPath}"`,
          `awk '/${pattern}/ {print NR \":\" $0}' "${validation.normalizedPath}"`
        ];

    const usedFallbacks: string[] = [];
    let lastError: Error | null = null;

    for (const command of searchCommands) {
      try {
        usedFallbacks.push(command);
        
        const result = await execAsync(command, { 
          timeout: 5000,
          maxBuffer: 1024 * 1024 
        });

        const duration = Date.now() - startTime;
        const lines = result.stdout.toString()
          .split('\n')
          .filter(line => line.trim().length > 0);

        this.logger.log('info', 'searchInFile', filePath, usedFallbacks[usedFallbacks.length - 1], true, usedFallbacks, duration);

        return {
          lines,
          method: usedFallbacks[usedFallbacks.length - 1],
          fallbacks: usedFallbacks,
          success: true,
          os,
          duration
        };

      } catch (error) {
        lastError = error as Error;
        this.logger.log('warn', 'searchInFile', filePath, command, false, [command], undefined, (error as Error).message);
        continue;
      }
    }

    // Fallback: ler arquivo e buscar manualmente
    try {
      const fileResult = await this.readFile(filePath);
      const lines = fileResult.content.split('\n');
      const matchingLines = lines
        .map((line, index) => ({ line: line.trim(), index: index + 1 }))
        .filter(item => item.line.includes(pattern))
        .map(item => `${item.index}:${item.line}`);

      const duration = Date.now() - startTime;
      
      this.logger.log('info', 'searchInFile', filePath, 'manual_search_fallback', true, [...usedFallbacks, 'manual_search'], duration);

      return {
        lines: matchingLines,
        method: 'manual_search_fallback',
        fallbacks: [...usedFallbacks, 'manual_search'],
        success: true,
        os,
        duration
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.log('error', 'searchInFile', filePath, 'all_fallbacks', false, searchCommands, duration, lastError?.message);
      
      throw new Error(`Não foi possível buscar no arquivo: ${filePath}. Último erro: ${lastError?.message}`);
    }
  }

  /**
   * Verifica se um arquivo existe
   */
  async fileExists(filePath: string): Promise<boolean> {
    const validation = this.validatePath(filePath);
    
    if (!validation.isWithinProject) {
      return false;
    }

    const commands = this.getCommands();
    const os = this.detectOS();

    const existenceCommands = os === 'windows'
      ? [
          `if exist "${validation.normalizedPath}" (echo exists) else (echo not_exists)`,
          `powershell -Command "Test-Path \\"${validation.normalizedPath}\\" && echo exists || echo not_exists"`
        ]
      : [
          `test -f "${validation.normalizedPath}" && echo exists || echo not_exists`,
          `ls "${validation.normalizedPath}" 2>/dev/null && echo exists || echo not_exists`
        ];

    for (const command of existenceCommands) {
      try {
        const result = await execAsync(command, { timeout: 3000 });
        const output = result.stdout.toString().trim();
        
        if (output.includes('exists')) {
          this.logger.log('info', 'fileExists', filePath, command, true, [command]);
          return true;
        }
      } catch {
        continue;
      }
    }

    // Fallback: usar fs
    try {
      const exists = fs.existsSync(validation.normalizedPath);
      this.logger.log('info', 'fileExists', filePath, 'fs_fallback', true, ['fs_existsSync']);
      return exists;
    } catch (error) {
      this.logger.log('error', 'fileExists', filePath, 'all_fallbacks', false, existenceCommands, undefined, (error as Error).message);
      return false;
    }
  }

  /**
   * Verifica se um arquivo está no .gitignore
   */
  async isGitIgnored(filePath: string): Promise<boolean> {
    const validation = this.validatePath(filePath);
    return validation.isGitIgnored;
  }

  /**
   * Obtém logs do logger
   */
  getLogs(level?: 'debug' | 'info' | 'warn' | 'error') {
    return this.logger.getLogs(level);
  }

  /**
   * Limpa os logs
   */
  clearLogs() {
    this.logger.clearLogs();
  }

  /**
   * Define o diretório raiz do projeto
   */
  setProjectRoot(root: string) {
    this.projectRoot = root;
  }
}
