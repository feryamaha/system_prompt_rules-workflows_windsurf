#!/usr/bin/env node
/**
 * Nemesis CLI - Test All Workflows
 * 
 * Testa todos os workflows em .windsurf/workflows/
 * Valida estrutura de cada um
 * Gera relatorio de conformidade
 * 
 * Uso: npx ts-node src/workflow-enforcement/cli/test-all-workflows.ts
 */

import { WorkflowRunner } from '../workflow-runner';
import { WorkflowCatalog } from '../workflow-catalog';
import * as path from 'path';

function printUsage(): void {
  console.log(`
Nemesis Test All Workflows

Uso:
  npx ts-node src/workflow-enforcement/cli/test-all-workflows.ts
  yarn nemesis:test

Opcoes:
  --verbose    Mostra logs detalhados
  --help       Mostra esta ajuda

Retorna:
  Exit code 0 - Todos os workflows validos
  Exit code 1 - Um ou mais workflows invalidos
`);
}

async function main(): Promise<number> {
  const args = process.argv.slice(2);
  
  // Verifica flags
  const verbose = args.includes('--verbose');
  const help = args.includes('--help') || args.includes('-h');
  
  if (help) {
    printUsage();
    return 0;
  }
  
  const workflowsPath = path.join(process.cwd(), '.windsurf', 'workflows');
  
  console.log(`\n𓍝 Nemesis Test All Workflows`);
  console.log(`   Diretorio: ${workflowsPath}\n`);
  
  const runner = new WorkflowRunner({});
  
  try {
    // Lista todos os workflows
    const workflowFiles = await WorkflowCatalog.listWorkflows(workflowsPath);
    
    if (workflowFiles.length === 0) {
      console.log('⚠️  Nenhum workflow encontrado\n');
      return 0;
    }
    
    console.log(`   Encontrados: ${workflowFiles.length} workflows\n`);
    console.log('='.repeat(60));
    
    // Valida todos
    const validationResult = await runner.validateAllWorkflows(workflowsPath);
    
    // Exibe resultados
    console.log('\n📋 RESULTADOS:\n');
    
    let hasErrors = false;
    
    for (const result of validationResult.results) {
      const icon = result.isValid ? '🟢' : '🔴';
      const workflowName = path.basename(result.workflow);
      
      console.log(`${icon} ${workflowName}`);
      
      if (verbose || !result.isValid) {
        if (result.errors.length > 0) {
          console.log('   Erros:');
          result.errors.forEach((error, idx) => {
            console.log(`      ${idx + 1}. ${error}`);
          });
        }
        
        if (result.warnings.length > 0) {
          console.log('   Avisos:');
          result.warnings.forEach((warning, idx) => {
            console.log(`      ${idx + 1}. ${warning}`);
          });
        }
      }
      
      if (!result.isValid) {
        hasErrors = true;
      }
      
      if (verbose || !result.isValid || result.warnings.length > 0) {
        console.log('');
      }
    }
    
    console.log('='.repeat(60));
    
    // Resumo
    console.log('\n RESUMO:\n');
    console.log(`   Total:    ${validationResult.total}`);
    console.log(`   🟢 CONF:   ${validationResult.valid}`);
    console.log(`   🔴 NCONF: ${validationResult.invalid}`);
    console.log(`   ‰ Conformidade:      ${((validationResult.valid / validationResult.total) * 100).toFixed(1)}%`);
    
    if (hasErrors) {
      console.log('\n🔴 FALHA: Um ou mais workflows possuem erros\n');
      return 1;
    } else {
      console.log('\n🟢 SUCESSO: Todos os workflows estao Conformes\n');
      return 0;
    }
    
  } catch (error) {
    console.error('\n🔴 ERRO FATAL:\n');
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
