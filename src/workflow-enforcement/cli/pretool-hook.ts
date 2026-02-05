#!/usr/bin/env node
/**
 * Nemesis CLI - PreToolUse Hook
 * 
 * Entry point para PreToolUse hooks do Windsurf
 * Recebe JSON via stdin e valida ações antes de permitir execucao
 * 
 * Uso: Chamado automaticamente pelo Windsurf via PreToolUse hook
 * Input: JSON via stdin no formato oficial Windsurf
 * Output: Exit code 0 (permitir) ou 2 (bloquear) + mensagens no stderr
 */

import { WorkflowEnforcer } from '../workflow-enforcer';
import { PermissionGate } from '../permission-gate';
import { ViolationLogger } from '../violation-logger';

/**
 * Formato de entrada oficial Windsurf PreToolUse
 */
interface PreToolInput {
  tool_name: 'Edit' | 'Write' | 'Bash' | 'Read' | 'Grep' | 'LSP';
  tool_input: {
    file_path?: string;
    command?: string;
    old_string?: string;
    new_string?: string;
    search_path?: string;
    query?: string;
    includes?: string[];
    [key: string]: any;
  };
}

/**
 * Resultado da validacao
 */
interface ValidationResult {
  valid: boolean;
  reason?: string;
  rule?: string;
  suggestion?: string;
}

/**
 * Ler JSON do stdin
 */
function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    let input = '';
    
    process.stdin.setEncoding('utf-8');
    
    process.stdin.on('data', (chunk) => {
      input += chunk;
    });
    
    process.stdin.on('end', () => {
      resolve(input.trim());
    });
    
    process.stdin.on('error', (err) => {
      reject(err);
    });
    
    // Se stdin ja esta fechado/vazio
    if (process.stdin.isTTY) {
      resolve('');
    }
  });
}

/**
 * Validar operacao de arquivo (Edit/Write)
 */
async function validateFileOperation(
  filePath: string | undefined,
  operation: string
): Promise<ValidationResult> {
  if (!filePath) {
    return {
      valid: false,
      reason: 'Caminho do arquivo nao fornecido',
      rule: '.windsurf/rules/rule-main-rules.md',
      suggestion: 'Especifique o arquivo a ser modificado'
    };
  }

  // Verificar se arquivo existe (para Edits)
  const fs = require('fs');
  const path = require('path');
  
  if (operation === 'Edit') {
    try {
      if (!fs.existsSync(filePath)) {
        return {
          valid: false,
          reason: `Arquivo nao existe: ${filePath}`,
          rule: '.windsurf/rules/rule-main-rules.md',
          suggestion: 'Verifique o caminho do arquivo'
        };
      }
    } catch (error) {
      // Erro ao verificar existencia, permite continuar
    }
  }

  // Verificar escopo permitido (arquivos dentro do projeto)
  const absolutePath = path.resolve(filePath);
  const cwd = process.cwd();
  
  // Bloquear arquivos fora do diretorio do projeto
  // Permitir excecoes como arquivos de sistema necessarios
  const allowedExternalPaths = [
    '/tmp/',
    '/var/tmp/',
    process.env.TEMP,
    process.env.TMP
  ].filter(Boolean);
  
  const isInProject = absolutePath.startsWith(cwd);
  const isAllowedExternal = allowedExternalPaths.some(p => 
    p && absolutePath.startsWith(p)
  );
  
  if (!isInProject && !isAllowedExternal) {
    return {
      valid: false,
      reason: `Arquivo fora do escopo do projeto: ${filePath}`,
      rule: '.windsurf/rules/rule-main-rules.md - Secao 5 (Proibicoes)',
      suggestion: 'NUNCA editar arquivos fora do escopo do projeto sem permissao explicita'
    };
  }

  // Verificar se arquivo e critico (git, config, etc)
  const criticalPatterns = [
    /\.git\//,
    /\.gitignore$/,
    /package\.json$/,
    /yarn\.lock$/,
    /\.env$/,
    /\.env\.local$/,
    /\.env\..*$/,
    /tsconfig\.json$/,
    /tailwind\.config/,
    /next\.config/
  ];
  
  const isCriticalFile = criticalPatterns.some(pattern => 
    pattern.test(absolutePath)
  );
  
  if (isCriticalFile) {
    // Log como warning mas permite - o PermissionGate ja trata isso
    console.warn(`[NEMESIS WARNING] Modificacao de arquivo critico detectada: ${filePath}`);
  }

  return { valid: true };
}

/**
 * Validar comando Bash
 */
async function validateCommand(
  command: string | undefined
): Promise<ValidationResult> {
  if (!command) {
    return {
      valid: false,
      reason: 'Comando nao fornecido',
      rule: '.windsurf/rules/rule-main-rules.md',
      suggestion: 'Especifique o comando a ser executado'
    };
  }

  // Verificar seguranca do comando via PermissionGate
  const safetyCheck = PermissionGate.checkCommandSafety(command);
  
  if (safetyCheck.riskLevel === 'high') {
    return {
      valid: false,
      reason: `Comando de alto risco detectado: ${safetyCheck.reasons.join(', ')}`,
      rule: '.windsurf/rules/Conformidade.md - Secao 3 (Seguranca OWASP)',
      suggestion: 'Comandos de sistema precisam de permissao explicita do usuario'
    };
  }

  // Verificar comandos permitidos para bugfix (tsc --noEmit)
  const allowedBugfixCommands = [
    /^yarn\s+tsc\s+--noEmit$/,
    /^npx\s+tsc\s+--noEmit$/,
    /^tsc\s+--noEmit$/
  ];
  
  const isBugfixCommand = allowedBugfixCommands.some(pattern =>
    pattern.test(command.trim())
  );
  
  if (isBugfixCommand) {
    return { valid: true }; // Sempre permitir validacao TypeScript
  }

  // Verificar comandos proibidos absolutos
  const forbiddenPatterns = [
    /rm\s+-rf\s+\//,           // rm -rf /
    /sudo\s+rm/,               // sudo rm
    /format\s+c:/,             // format c:
    /dd\s+if=/,                // dd if=
    />\s*\/dev\/null.*important/, // Redirecting important data
    /shutdown/,                // shutdown
    /reboot/,                 // reboot
    /passwd/,                 // password changes
    /chmod\s+777/              // dangerous permissions
  ];
  
  for (const pattern of forbiddenPatterns) {
    if (pattern.test(command)) {
      return {
        valid: false,
        reason: `Comando proibido detectado: ${command}`,
        rule: '.windsurf/rules/rule-main-rules.md - Secao 5 (Proibicoes Absolutas)',
        suggestion: 'Este comando e proibido por questoes de seguranca'
      };
    }
  }

  // Para comandos de medio risco, requer confirmacao
  if (safetyCheck.riskLevel === 'medium') {
    console.warn(`[NEMESIS WARNING] Comando de medio risco: ${command}`);
    console.warn(`[NEMESIS WARNING] Razoes: ${safetyCheck.reasons.join(', ')}`);
    // Permite mas loga warning - o enforcement principal acontece no workflow
  }

  return { valid: true };
}

/**
 * Funcao principal
 */
async function main(): Promise<number> {
  try {
    // Ler input do stdin
    const input = await readStdin();
    
    if (!input) {
      console.error('NEMESIS ERROR: Nenhum input recebido via stdin');
      console.error('Este hook deve ser chamado pelo Windsurf PreToolUse com JSON via stdin');
      return 1;
    }
    
    // Parse JSON
    let data: PreToolInput;
    try {
      data = JSON.parse(input);
    } catch (error) {
      console.error('NEMESIS ERROR: JSON invalido recebido');
      console.error(`Input recebido: ${input.substring(0, 200)}`);
      return 1;
    }
    
    // Validar estrutura do input
    if (!data.tool_name || !data.tool_input) {
      console.error('NEMESIS ERROR: Estrutura de input invalida');
      console.error('Esperado: { tool_name: string, tool_input: object }');
      return 1;
    }
    
    let result: ValidationResult;
    
    // Validar baseado no tipo de ferramenta
    switch (data.tool_name) {
      case 'Edit':
      case 'Write':
        result = await validateFileOperation(
          data.tool_input.file_path,
          data.tool_name
        );
        break;
        
      case 'Bash':
        result = await validateCommand(data.tool_input.command);
        break;
        
      case 'Read':
      case 'Grep':
        // Operacoes de leitura sao geralmente seguras
        result = { valid: true };
        break;
        
      default:
        // Ferramentas desconhecidas - permite com warning
        console.warn(`[NEMESIS WARNING] Ferramenta nao reconhecida: ${data.tool_name}`);
        result = { valid: true };
    }
    
    // Se invalido, bloquear com exit code 2
    if (!result.valid) {
      console.error('');
      console.error('========================================');
      console.error('NEMESIS BLOCKED: Violação detectada');
      console.error('========================================');
      console.error('');
      console.error(`[Regra]: ${result.rule || '.windsurf/rules/rule-main-rules.md'}`);
      console.error(`[Mensagem]: ${result.reason}`);
      
      if (result.suggestion) {
        console.error(`[Sugestao]: ${result.suggestion}`);
      }
      
      console.error('');
      console.error('A execucao foi bloqueada pelo Nemesis Enforcement Engine.');
      console.error('Corrija a violacao antes de prosseguir.');
      console.error('');
      
      // Log da violacao
      ViolationLogger.logViolation({
        type: 'rule_violation',
        message: result.reason || 'Violação detectada pelo PreToolUse hook',
        rule: result.rule,
        command: data.tool_input.command || data.tool_input.file_path,
        timestamp: new Date()
      });
      
      return 2; // Exit code 2 = BLOQUEIO TECNICO
    }
    
    // Permissao concedida
    return 0;
    
  } catch (error) {
    console.error('NEMESIS ERROR: Erro inesperado no hook');
    console.error(error instanceof Error ? error.message : 'Erro desconhecido');
    return 1; // Exit code 1 = ERRO (nao bloqueia, mas reporta)
  }
}

// Executar main
main()
  .then(exitCode => {
    process.exit(exitCode);
  })
  .catch(error => {
    console.error('Erro nao tratado:', error);
    process.exit(1);
  });
