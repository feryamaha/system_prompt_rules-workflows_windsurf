#!/usr/bin/env node
/**
 * Nemesis CLI - Validate Workflow
 * 
 * Valida estrutura de workflow antes da execucao
 * Retorna exit code 0 (valido) ou 1 (invalido)
 * 
 * Uso: npx ts-node src/workflow-enforcement/cli/validate.ts <caminho-do-workflow>
 */

import { WorkflowRunner } from '../workflow-runner';
import * as path from 'path';
import * as fs from 'fs';

function printUsage(): void {
  console.log(`
Nemesis Workflow Validator

Uso:
  npx ts-node src/workflow-enforcement/cli/validate.ts <caminho-do-workflow>
  yarn nemesis:validate <caminho-do-workflow>

Exemplos:
  npx ts-node src/workflow-enforcement/cli/validate.ts .windsurf/workflows/generate-prompt-rag.md
  yarn nemesis:validate .windsurf/workflows/audit-create-pr.md

Retorna:
  Exit code 0 - Workflow valido
  Exit code 1 - Workflow invalido ou erro
`);
}

function formatViolations(errors: string[], warnings: string[]): string {
  let output = '';
  
  if (errors.length > 0) {
    output += '\n❌ ERROS:\n';
    errors.forEach((error, index) => {
      output += `  ${index + 1}. ${error}\n`;
    });
  }
  
  if (warnings.length > 0) {
    output += '\n⚠️  AVISOS:\n';
    warnings.forEach((warning, index) => {
      output += `  ${index + 1}. ${warning}\n`;
    });
  }
  
  return output;
}

async function main(): Promise<number> {
  const args = process.argv.slice(2);
  
  // Sem argumentos ou help
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    printUsage();
    return args.length === 0 ? 1 : 0;
  }
  
  const workflowPath = args[0];
  
  // Verifica se arquivo existe
  if (!fs.existsSync(workflowPath)) {
    console.error(`\n❌ ERRO: Arquivo nao encontrado: ${workflowPath}\n`);
    return 1;
  }
  
  // Resolve caminho absoluto
  const absolutePath = path.resolve(workflowPath);
  
  console.log(`\n🔍 Nemesis Workflow Validator`);
  console.log(`   Validando: ${workflowPath}\n`);
  
  const runner = new WorkflowRunner({});
  
  try {
    const validation = await runner.validateWorkflow(absolutePath);
    
    if (validation.isValid) {
      console.log('✅ WORKFLOW VALIDO\n');
      
      if (validation.warnings.length > 0) {
        console.log(formatViolations([], validation.warnings));
      }
      
      console.log(`   Erros: ${validation.errors.length}`);
      console.log(`   Avisos: ${validation.warnings.length}`);
      console.log('\n🚀 Workflow pronto para execucao\n');
      return 0;
    } else {
      console.log('🛑 WORKFLOW INVALIDO\n');
      console.log(formatViolations(validation.errors, validation.warnings));
      console.log(`\n   Total de erros: ${validation.errors.length}`);
      console.log(`   Total de avisos: ${validation.warnings.length}\n`);
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
