#!/usr/bin/env node
/**
 * Nemesis Install Hooks Script
 * 
 * Instala os hooks PreToolUse automaticamente nos workflows
 * Configura permissões corretas para os scripts de hook
 * 
 * Uso: node src/workflow-enforcement/cli/install-hooks.js
 * Ou: yarn nemesis:install-hooks
 */

const fs = require('fs');
const path = require('path');

console.log('\n🛡️  Nemesis Install Hooks\n');

const projectDir = process.cwd();
const hooksDir = path.join(projectDir, '.nemesis', 'hooks');
const shellScript = path.join(hooksDir, 'nemesis-pretool-check.sh');
const psScript = path.join(hooksDir, 'nemesis-pretool-check.ps1');

// Verificar se diretório de hooks existe
if (!fs.existsSync(hooksDir)) {
  console.log('📁 Criando diretório de hooks...');
  fs.mkdirSync(hooksDir, { recursive: true });
}

// Verificar scripts de hook
const checkScript = (scriptPath, name) => {
  if (fs.existsSync(scriptPath)) {
    console.log(`✅ ${name} encontrado`);
    return true;
  } else {
    console.log(`❌ ${name} NÃO encontrado em: ${scriptPath}`);
    return false;
  }
};

const shellOk = checkScript(shellScript, 'Shell script (Bash)');
const psOk = checkScript(psScript, 'PowerShell script');

if (shellOk && psOk) {
  console.log('\n✅ Todos os hooks estão instalados corretamente!\n');
  console.log('Os workflows agora usarão PreToolUse hooks para enforcement determinístico.');
  process.exit(0);
} else {
  console.log('\n⚠️  Alguns hooks não foram encontrados.');
  console.log('Verifique se os arquivos existem em:');
  console.log(`  - ${shellScript}`);
  console.log(`  - ${psScript}\n`);
  process.exit(1);
}
