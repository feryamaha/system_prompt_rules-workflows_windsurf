/**
 * Testes unitários para o Terminal Reader Service
 */

import { TerminalReaderService } from '../../src/workflow-enforcement/services/terminal-reader-service';
import { TerminalReaderLogger } from '../../src/workflow-enforcement/services/terminal-reader-logger';
import * as fs from 'fs';
import * as path from 'path';

// Mock do módulo fs para testes
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn()
}));

jest.mock('child_process', () => ({
  exec: jest.fn()
}));

const mockExec = require('child_process').exec;
const mockFs = fs as jest.Mocked<typeof fs>;

describe('TerminalReaderService', () => {
  let service: TerminalReaderService;
  let mockProjectRoot: string;

  beforeEach(() => {
    mockProjectRoot = '/test/project';
    service = new TerminalReaderService(mockProjectRoot);
    jest.clearAllMocks();
  });

  describe('Construtor e inicialização', () => {
    it('deve inicializar com project root padrão', () => {
      const defaultService = new TerminalReaderService();
      expect(defaultService).toBeDefined();
    });

    it('deve inicializar com project root customizado', () => {
      expect(service).toBeDefined();
    });
  });

  describe('Detecção de Sistema Operacional', () => {
    const originalPlatform = process.platform;

    afterEach(() => {
      Object.defineProperty(process, 'platform', {
        value: originalPlatform
      });
    });

    it('deve detectar Mac corretamente', () => {
      Object.defineProperty(process, 'platform', {
        value: 'darwin'
      });
      
      // Acessar método privado via reflection para teste
      const detectOS = (service as any).detectOS.call(service);
      expect(detectOS).toBe('mac');
    });

    it('deve detectar Windows corretamente', () => {
      Object.defineProperty(process, 'platform', {
        value: 'win32'
      });
      
      const detectOS = (service as any).detectOS.call(service);
      expect(detectOS).toBe('windows');
    });

    it('deve detectar Linux corretamente', () => {
      Object.defineProperty(process, 'platform', {
        value: 'linux'
      });
      
      const detectOS = (service as any).detectOS.call(service);
      expect(detectOS).toBe('linux');
    });
  });

  describe('Validação de Caminhos', () => {
    it('deve validar caminho seguro dentro do projeto', () => {
      const validation = (service as any).validatePath.call(service, 'src/file.ts');
      
      expect(validation.isWithinProject).toBe(true);
      expect(validation.isProjectRoot).toBe(false);
      expect(validation.securityLevel).toBe('safe');
    });

    it('deve rejeitar caminho fora do projeto', () => {
      const validation = (service as any).validatePath.call(service, '../../../etc/passwd');
      
      expect(validation.isWithinProject).toBe(false);
      expect(validation.securityLevel).toBe('danger');
    });

    it('deve identificar caminho raiz do projeto', () => {
      const validation = (service as any).validatePath.call(service, '.');
      
      expect(validation.isProjectRoot).toBe(true);
      expect(validation.isWithinProject).toBe(true);
    });

    it('deve detectar arquivo no .gitignore', () => {
      // Mock do .gitignore
      mockFs.existsSync.mockImplementation((filePath: fs.PathLike) => {
        return filePath.toString().includes('.gitignore');
      });
      
      mockFs.readFileSync.mockImplementation((filePath: fs.PathOrFileDescriptor) => {
        if (filePath.toString().includes('.gitignore')) {
          return 'node_modules/\n.env\n*.log\n';
        }
        return '';
      });

      const validation = (service as any).validatePath.call(service, 'node_modules/package.json');
      
      expect(validation.isGitIgnored).toBe(true);
      expect(validation.securityLevel).toBe('warning');
    });
  });

  describe('Leitura de Arquivos', () => {
    it('deve ler arquivo com sucesso usando cat', async () => {
      const mockContent = 'console.log("Hello World");';
      
      mockExec.mockImplementation((command: string, callback: any) => {
        callback(null, { stdout: mockContent });
      });

      const result = await service.readFile('src/test.js');

      expect(result.success).toBe(true);
      expect(result.content).toBe(mockContent);
      expect(result.method).toContain('cat');
      expect(result.os).toBeDefined();
    });

    it('deve tentar fallbacks quando comando principal falha', async () => {
      let callCount = 0;
      
      mockExec.mockImplementation((command: string, callback: any) => {
        callCount++;
        if (callCount <= 3) {
          callback(new Error('Command failed'), { stdout: '' });
        } else {
          callback(null, { stdout: 'fallback content' });
        }
      });

      const result = await service.readFile('src/test.js');

      expect(result.success).toBe(true);
      expect(result.fallbacks.length).toBeGreaterThan(1);
      expect(callCount).toBe(4);
    });

    it('deve falhar quando todos os fallbacks falham', async () => {
      mockExec.mockImplementation((command: string, callback: any) => {
        callback(new Error('All commands failed'), { stdout: '' });
      });

      await expect(service.readFile('src/test.js')).rejects.toThrow();
    });

    it('deve rejeitar leitura de arquivo fora do projeto', async () => {
      await expect(service.readFile('../../../etc/passwd')).rejects.toThrow('fora do projeto');
    });
  });

  describe('Leitura de Linhas', () => {
    it('deve ler linhas específicas com sucesso', async () => {
      const mockLines = 'line1\nline2\nline3\nline4\nline5';
      
      mockExec.mockImplementation((command: string, callback: any) => {
        callback(null, { stdout: mockLines });
      });

      const lines = await service.readLines('src/test.js', { start: 1, end: 3 });

      expect(lines).toHaveLength(5);
      expect(lines[0]).toBe('line1');
    });

    it('deve usar fallback de leitura completa quando falha', async () => {
      // Primeiro falha, depois sucesso no fallback
      let callCount = 0;
      
      mockExec.mockImplementation((command: string, callback: any) => {
        callCount++;
        if (callCount === 1) {
          callback(new Error('Line command failed'), { stdout: '' });
        } else {
          callback(null, { stdout: 'full\nfile\ncontent' });
        }
      });

      const lines = await service.readLines('src/test.js', { start: 0, end: 2 });

      expect(lines).toEqual(['full', 'file', 'content']);
    });
  });

  describe('Busca em Arquivos', () => {
    it('deve buscar padrão com sucesso', async () => {
      const mockSearchResult = '1: console.log("Hello");\n3: // Hello comment';
      
      mockExec.mockImplementation((command: string, callback: any) => {
        callback(null, { stdout: mockSearchResult });
      });

      const result = await service.searchInFile('src/test.js', 'Hello');

      expect(result.success).toBe(true);
      expect(result.lines).toHaveLength(2);
      expect(result.lines[0]).toContain('console.log');
    });

    it('deve usar fallback manual quando comandos falham', async () => {
      let callCount = 0;
      
      mockExec.mockImplementation((command: string, callback: any) => {
        callCount++;
        if (callCount <= 2) {
          callback(new Error('Search command failed'), { stdout: '' });
        } else {
          callback(null, { stdout: 'line with Hello\nanother line' });
        }
      });

      const result = await service.searchInFile('src/test.js', 'Hello');

      expect(result.success).toBe(true);
      expect(result.method).toBe('manual_search_fallback');
      expect(result.lines).toContain('line with Hello');
    });
  });

  describe('Verificação de Existência', () => {
    it('deve verificar que arquivo existe', async () => {
      mockExec.mockImplementation((command: string, callback: any) => {
        callback(null, { stdout: 'exists' });
      });

      const exists = await service.fileExists('src/test.js');

      expect(exists).toBe(true);
    });

    it('deve verificar que arquivo não existe', async () => {
      mockExec.mockImplementation((command: string, callback: any) => {
        callback(null, { stdout: 'not_exists' });
      });

      const exists = await service.fileExists('src/nonexistent.js');

      expect(exists).toBe(false);
    });

    it('deve usar fallback fs quando comandos falham', async () => {
      mockExec.mockImplementation((command: string, callback: any) => {
        callback(new Error('Command failed'), { stdout: '' });
      });

      mockFs.existsSync.mockReturnValue(true);

      const exists = await service.fileExists('src/test.js');

      expect(exists).toBe(true);
    });
  });

  describe('Verificação GitIgnore', () => {
    it('deve verificar se arquivo está no gitignore', async () => {
      // Mock do .gitignore
      mockFs.existsSync.mockImplementation((filePath: fs.PathLike) => {
        return filePath.toString().includes('.gitignore');
      });
      
      mockFs.readFileSync.mockImplementation((filePath: fs.PathOrFileDescriptor) => {
        if (filePath.toString().includes('.gitignore')) {
          return '*.log\nnode_modules/\n.env';
        }
        return '';
      });

      const isIgnored = await service.isGitIgnored('app.log');

      expect(isIgnored).toBe(true);
    });

    it('deve retornar false para arquivo não ignorado', async () => {
      const isIgnored = await service.isGitIgnored('src/app.ts');

      expect(isIgnored).toBe(false);
    });
  });

  describe('Logging', () => {
    it('deve registrar logs de operações', async () => {
      mockExec.mockImplementation((command: string, callback: any) => {
        callback(null, { stdout: 'test content' });
      });

      await service.readFile('src/test.js');

      const logs = service.getLogs();
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].operation).toBe('readFile');
      expect(logs[0].success).toBe(true);
    });

    it('deve filtrar logs por nível', async () => {
      mockExec.mockImplementation((command: string, callback: any) => {
        callback(new Error('Test error'), { stdout: '' });
      });

      try {
        await service.readFile('src/test.js');
      } catch {
        // Ignorar erro
      }

      const errorLogs = service.getLogs('error');
      expect(errorLogs.length).toBeGreaterThan(0);
      expect(errorLogs[0].level).toBe('error');
    });

    it('deve limpar logs', async () => {
      mockExec.mockImplementation((command: string, callback: any) => {
        callback(null, { stdout: 'test content' });
      });

      await service.readFile('src/test.js');
      service.clearLogs();

      const logs = service.getLogs();
      expect(logs).toHaveLength(0);
    });
  });

  describe('Configuração', () => {
    it('deve permitir alterar project root', () => {
      const newRoot = '/new/project';
      service.setProjectRoot(newRoot);

      // Verificar se foi alterado (acessando propriedade privada)
      expect((service as any).projectRoot).toBe(newRoot);
    });
  });
});

describe('TerminalReaderLogger', () => {
  let logger: TerminalReaderLogger;

  beforeEach(() => {
    logger = new TerminalReaderLogger();
    // Mock console methods
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deve registrar log de info', () => {
    logger.log('info', 'testOp', 'test.ts', 'method1', true, ['fallback1'], undefined);

    const logs = logger.getLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0].level).toBe('info');
    expect(logs[0].operation).toBe('testOp');
    expect(console.log).toHaveBeenCalled();
  });

  it('deve registrar log de erro', () => {
    logger.log('error', 'testOp', 'test.ts', 'method1', false, ['fallback1'], undefined, 'Test error');

    const logs = logger.getLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0].level).toBe('error');
    expect(console.error).toHaveBeenCalled();
  });

  it('deve registrar log de warning', () => {
    logger.log('warn', 'testOp', 'test.ts', 'method1', false, ['fallback1', 'fallback2']);

    const logs = logger.getLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0].level).toBe('warn');
    expect(console.warn).toHaveBeenCalled();
  });

  it('deve limitar número de logs', () => {
    // Preencher além do limite
    for (let i = 0; i < 105; i++) {
      logger.log('info', `op${i}`, 'test.ts', 'method1', true, [`op${i}`]);
    }

    const logs = logger.getLogs();
    expect(logs).toHaveLength(100); // Máximo configurado
  });

  it('deve exportar logs', () => {
    logger.log('info', 'testOp', 'test.ts', 'method1', true, ['fallback1']);
    
    const exported = logger.exportLogs();
    expect(exported).toHaveLength(1);
    expect(exported[0]).toEqual(logger.getLogs()[0]);
  });

  it('deve obter logs recentes', () => {
    for (let i = 0; i < 15; i++) {
      logger.log('info', `op${i}`, 'test.ts', 'method1', true, [`op${i}`]);
    }

    const recent = logger.getRecentLogs(5);
    expect(recent).toHaveLength(5);
    expect(recent[0].operation).toBe('op10'); // Últimos 5
  });
});
