#!/usr/bin/env node
/**
 * Nemesis CLI - Enforce Workflow
 * 
 * Executa workflow com enforcement ativo
 * Bloqueia se violacoes forem encontradas
 * Reporta violacoes no formato estrito
 * 
 * Uso: npx ts-node src/workflow-enforcement/cli/enforce.ts <caminho-do-workflow>
 */

import { WorkflowRunner } from '../workflow-runner';
import { ViolationLogger } from '../violation-logger';
import * as path from 'path';
import * as fs from 'fs';

function printUsage(): void {
  console.log(`
Nemesis Workflow Enforcer

Uso:
  npx ts-node src/workflow-enforcement/cli/enforce.ts <caminho-do-workflow>
  yarn nemesis:enforce <caminho-do-workflow>

Opcoes:
  --dry-run    Apenas valida, nao executa comandos
  --verbose    Mostra logs detalhados
  --help       Mostra esta ajuda

Exemplos:
  npx ts-node src/workflow-enforcement/cli/enforce.ts .windsurf/workflows/generate-prompt-rag.md
  yarn nemesis:enforce .windsurf/workflows/audit-create-pr.md --verbose

Retorna:
  Exit code 0 - Execucao bem-sucedida
  Exit code 1 - Bloqueado por violacao ou erro
`);
}

function formatViolations(violations: any[]): string {
  if (violations.length === 0) return '';
  
  let output = '\n🛑 VIOLACOES DETECTADAS:\n\n';
  
  violations.forEach((violation, index) => {
    output += `${index + 1}. [Tipo]: ${violation.type}\n`;
    
    if (violation.rule) {
      output += `   [Regra]: ${violation.rule}\n`;
    }
    
    if (violation.command) {
      output += `   [Comando]: ${violation.command}\n`;
    }
    
    output += `   [Mensagem]: ${violation.message}\n`;
    
    if (violation.suggestion) {
      output += `   [Sugestao]: ${violation.suggestion}\n`;
    }
    
    output += '\n';
  });
  
  output += 'CORRECAO OBRIGATORIA:\n';
  output += '- Corrija as violacoes antes de reexecutar\n';
  output += '- Consulte as regras obrigatorias do workflow\n\n';
  
  return output;
}

function formatResults(results: any[]): string {
  if (results.length === 0) return '';
  
  let output = '\n📊 RESULTADOS DA EXECUCAO:\n\n';
  
  results.forEach((result, index) => {
    const status = result.exitCode === 0 ? '✅' : '❌';
    output += `${index + 1}. ${status} ${result.command}\n`;
    output += `   Exit code: ${result.exitCode}\n`;
    
    if (result.stdout && result.stdout.trim()) {
      const stdout = result.stdout.trim().split('\n').slice(0, 3).join('\n   ');
      output += `   Output: ${stdout}${result.stdout.includes('\n') ? '...' : ''}\n`;
    }
    
    if (result.stderr && result.stderr.trim()) {
      const stderr = result.stderr.trim().split('\n').slice(0, 2).join('\n   ');
      output += `   Stderr: ${stderr}${result.stderr.includes('\n') ? '...' : ''}\n`;
    }
    
    output += '\n';
  });
  
  return output;
}

async function main(): Promise<number> {
  const args = process.argv.slice(2);
  
  // Verifica flags
  const dryRun = args.includes('--dry-run');
  const verbose = args.includes('--verbose');
  const help = args.includes('--help') || args.includes('-h');
  
  // Remove flags do array de argumentos
  const filteredArgs = args.filter(arg => !arg.startsWith('--'));
  
  if (help || filteredArgs.length === 0) {
    printUsage();
    return filteredArgs.length === 0 && !help ? 1 : 0;
  }
  
  const workflowPath = filteredArgs[0];
  
  // Verifica se arquivo existe
  if (!fs.existsSync(workflowPath)) {
    console.error(`\n❌ ERRO: Arquivo nao encontrado: ${workflowPath}\n`);
    return 1;
  }
  
  // Resolve caminho absoluto
  const absolutePath = path.resolve(workflowPath);
  
  console.log(`\n🛡️  Nemesis Workflow Enforcer`);
  console.log(`   Executando: ${workflowPath}\n`);
  
  if (dryRun) {
    console.log('   [MODO DRY-RUN: Comandos nao serao executados]\n');
  }
  
  const runner = new WorkflowRunner({});
  
  try {
    // Primeiro valida
    console.log('🔍 Fase 1: Validacao...\n');
    const validation = await runner.validateWorkflow(absolutePath);
    
    if (!validation.isValid) {
      console.log('🛑 VALIDACAO FALHOU\n');
      
      if (validation.errors.length > 0) {
        console.log('\n❌ ERROS:');
        validation.errors.forEach((error, index) => {
          console.log(`   ${index + 1}. ${error}`);
        });
      }
      
      if (validation.warnings.length > 0) {
        console.log('\n⚠️  AVISOS:');
        validation.warnings.forEach((warning, index) => {
          console.log(`   ${index + 1}. ${warning}`);
        });
      }
      
      console.log('\n❌ Execucao bloqueada: Workflow invalido\n');
      return 1;
    }
    
    console.log('✅ Validacao passou\n');
    
    if (dryRun) {
      console.log('🛑 Execucao interrompida (dry-run mode)\n');
      return 0;
    }
    
    // Executa com enforcement
    console.log('🚀 Fase 2: Execucao com Enforcement...\n');
    const result = await runner.runWorkflow(absolutePath, {});
    
    console.log(formatResults(result.results));
    
    if (result.violations.length > 0) {
      console.log(formatViolations(result.violations));
    }
    
    console.log('\n' + '='.repeat(50));
    
    if (result.success) {
      console.log('✅ EXECUCAO BEM-SUCEDIDA');
      console.log(`   Tempo: ${result.executionTime}ms`);
      console.log(`   Comandos executados: ${result.results.length}`);
      console.log(`   Violacoes: ${result.violations.length}`);
      console.log('\n🎉 Workflow concluido sem violacoes\n');
      return 0;
    } else {
      console.log('🛑 EXECUCAO BLOQUEADA');
      console.log(`   Tempo: ${result.executionTime}ms`);
      console.log(`   Violacoes: ${result.violations.length}`);
      console.log('\n❌ Corrija as violacoes antes de reexecutar\n');
      return 1;
    }
    
  } catch (error) {
    console.error('\n❌ ERRO FATAL:\n');
    console.error(`   ${error instanceof Error ? error.message : 'Erro desconhecido'}\n`);
    return 1;
  }
}

// Executa main
main()
  .then(exitCode => {
    process.exit(exitCode);
  })
  .catch(error => {
    console.error('Erro nao tratado:', error);
    process.exit(1);
  });
