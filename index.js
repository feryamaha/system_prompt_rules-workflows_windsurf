#!/usr/bin/env node
const path = require("path");
const fs = require("fs-extra");
const { execSync } = require("child_process");
const readline = require("readline");

const ROOT_DIR = process.cwd();
const PACKAGE_ROOT = path.resolve(__dirname);
const CONFIG_FILE = path.join(ROOT_DIR, ".nemesis", "config.toml");
const SOURCE_DIRS = [
  ".windsurf",
  "Feature-Documentation"
];

function logInfo(message) {
  process.stdout.write(`${message}\n`);
}

function logError(message) {
  process.stderr.write(`${message}\n`);
}

function checkDependencyInstalled(dependencyName) {
  try {
    execSync(`node -e "require.resolve('${dependencyName}')"`, {
      cwd: ROOT_DIR,
      stdio: "ignore"
    });
    return true;
  } catch (error) {
    return false;
  }
}

function ensureDependencies() {
  const dependencies = [
    { name: "typescript", type: "dev" },
    { name: "tsx", type: "dev" },
    { name: "@types/node", type: "dev" }
  ];

  logInfo("\nVerificando dependencias necessarias...");

  for (const dep of dependencies) {
    const isInstalled = checkDependencyInstalled(dep.name);

    if (isInstalled) {
      logInfo(`  ✓ ${dep.name} ja instalado`);
    } else {
      logInfo(`  ⏳ Instalando ${dep.name}...`);
      try {
        execSync(`yarn add -D ${dep.name}`, {
          cwd: ROOT_DIR,
          stdio: "inherit"
        });
        logInfo(`  ✓ ${dep.name} instalado com sucesso`);
      } catch (error) {
        try {
          execSync(`npm install -D ${dep.name}`, {
            cwd: ROOT_DIR,
            stdio: "inherit"
          });
          logInfo(`  ✓ ${dep.name} instalado com sucesso`);
        } catch (npmError) {
          logError(`  ❌ Falha ao instalar ${dep.name}`);
          process.exit(1);
        }
      }
    }
  }
}

function validateNemesisStructure() {
  const requiredFiles = [
    ".nemesis/workflow-enforcement/cli/enforce.ts",
    ".nemesis/workflow-enforcement/cli/validate.ts",
    ".nemesis/workflow-enforcement/cli/test-all-workflows.ts"
  ];

  logInfo("\nValidando estrutura do Nemesis...");

  for (const file of requiredFiles) {
    const filePath = path.join(ROOT_DIR, file);
    if (!fs.existsSync(filePath)) {
      logError(`❌ Arquivo obrigatorio nao encontrado: ${file}`);
      logError("   Reinstale o Nemesis ou verifique a instalacao");
      process.exit(1);
    }
  }

  logInfo("  ✓ Todos os arquivos CLI estao presentes");
}

function updatePackageJsonScripts() {
  const packageJsonPath = path.join(ROOT_DIR, "package.json");

  if (!fs.existsSync(packageJsonPath)) {
    logError("❌ package.json nao encontrado no diretorio atual");
    logError("   Execute o comando na raiz do projeto");
    process.exit(1);
  }

  const packageContent = fs.readFileSync(packageJsonPath, "utf8");
  const packageJson = JSON.parse(packageContent);

  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }

  const nemesisScripts = Object.keys(packageJson.scripts).filter(
    key => key.startsWith("nemesis:")
  );
  nemesisScripts.forEach(key => {
    delete packageJson.scripts[key];
  });

  packageJson.scripts["nemesis:validate"] = "yarn tsx .nemesis/workflow-enforcement/cli/validate.ts";
  packageJson.scripts["nemesis:enforce"] = "yarn tsx .nemesis/workflow-enforcement/cli/enforce.ts";
  packageJson.scripts["nemesis:test"] = "yarn tsx .nemesis/workflow-enforcement/cli/test-all-workflows.ts";
  packageJson.scripts["nemesis:pretool"] = "yarn tsx .nemesis/workflow-enforcement/cli/pretool-hook.ts";
  packageJson.scripts["nemesis:install-hooks"] = "node .nemesis/workflow-enforcement/cli/install-hooks.js";

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + "\n");

  logInfo(`✓ Scripts nemesis atualizados no package.json`);
  logInfo(`  - nemesis:validate`);
  logInfo(`  - nemesis:enforce`);
  logInfo(`  - nemesis:test`);
  logInfo(`  - nemesis:pretool`);
  logInfo(`  - nemesis:install-hooks`);
}

function loadConfig() {
  const defaultConfig = {
    nemesis: {
      auto_gitignore: true,
      backup_existing: true,
      verbose_output: false,
      create_config: true
    },
    workflows: {
      generate_prompt_rag: true,
      audit_create_pr: true,
      auditoria_conformidade: true
    },
    skills: {
      vercel_agent_skills: true,
      react_best_practices: true,
      web_design_guidelines: true
    },
    ide_detection: {
      auto_detect: true,
      fallback_to_prompt: true,
      supported_ides: ["windsurf", "cursor", "copilot", "claude", "aider"]
    },
    feature_documentation: {
      create_issues_folder: true,
      create_pr_folder: true,
      create_prompts_folder: true
    }
  };

  // Se config existe, usar ele (por enquanto usa defaults)
  // Futuro: implementar parsing TOML
  return defaultConfig;
}

function updateGitignore() {
  const gitignorePath = path.join(ROOT_DIR, ".gitignore");
  
  const nemesisSection = `
# START Nemesis Generated Files
# Arquivos gerados pela instalação do Nemesis (bloquear para nao versionar)
.windsurf/mcp_config.json
.vscode/mcp.json
CLAUDE.md
.cursor/mcp.json
.clinerules
.aider.conf.yml
.amazonq/mcp.json
.amazonq/rules/
.augment/rules/
.codex/config.toml
.crush.json
.goosehints
.idx/airules.md
.junie/guidelines.md
.kiro/steering/
.openhands/microagents/
.roo/mcp.json
.trae/rules/
.vibe/config.toml
.firebender.json
.opencode.json
.gemini/settings.json
.qwen/settings.json
# END Nemesis Generated Files`;

  let gitignoreContent = '';
  if (fs.existsSync(gitignorePath)) {
    gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  }

  // Remover seção antiga do Nemesis (se existir)
  const startMarker = '# START Nemesis Generated Files';
  const endMarker = '# END Nemesis Generated Files';
  const startIndex = gitignoreContent.indexOf(startMarker);
  const endIndex = gitignoreContent.indexOf(endMarker);
  
  if (startIndex !== -1 && endIndex !== -1) {
    gitignoreContent = 
      gitignoreContent.substring(0, startIndex) + 
      gitignoreContent.substring(endIndex + endMarker.length);
  }

  // Adicionar nova seção
  gitignoreContent += nemesisSection;

  // Escrever .gitignore atualizado
  fs.writeFileSync(gitignorePath, gitignoreContent.trim() + '\n');
  logInfo("✓ .gitignore atualizado com regras do Nemesis");
}

function ensureAgentSkillsInstalled() {
  try {
    execSync("npx skills list", {
      stdio: "ignore"
    });
    return true;
  } catch (error) {
    return false;
  }
}

function installAgentSkills() {
  logInfo("Instalando Vercel Agent Skills...\n");
  execSync("npx skills add vercel-labs/agent-skills", {
    stdio: "inherit"
  });
}

function copyDirectory(sourceDir, targetDir) {
  if (!fs.existsSync(sourceDir)) {
    logError(`Diretorio nao encontrado: ${sourceDir}`);
    process.exit(1);
  }

  // Verificar se source e target sao o mesmo
  const sourcePath = path.resolve(sourceDir);
  const targetPath = path.resolve(targetDir);
  
  if (sourcePath === targetPath) {
    logError(`Source e destination nao podem ser o mesmo: ${sourceDir}`);
    return;
  }

  fs.copySync(sourceDir, targetDir, {
    overwrite: true,
    errorOnExist: false
  });
}

function isTemplateFile(relativePath) {
  // Templates estao apenas em Feature-Documentation/
  if (!relativePath.startsWith('Feature-Documentation')) {
    return false;
  }
  
  // Arquivos com "template" ou "exemplo-template" no nome sao templates
  const fileName = path.basename(relativePath).toLowerCase();
  return fileName.includes('template') || fileName.includes('exemplo-template');
}

function shouldCopyFile(sourcePath, targetPath, relativePath, isCoreDirectory) {
  // Arquivos core sempre sobrescrevem
  if (isCoreDirectory) {
    return true;
  }
  
  // Em Feature-Documentation, verificar se eh template
  if (isTemplateFile(relativePath)) {
    // Template so copia se nao existir
    return !fs.existsSync(targetPath);
  }
  
  // Arquivos nao-template em Feature-Documentation sao ignorados
  return false;
}

function copyFileSelective(sourceFile, targetFile, relativePath, isCoreDirectory) {
  if (!shouldCopyFile(sourceFile, targetFile, relativePath, isCoreDirectory)) {
    return false; // Arquivo ignorado ou ja existe (template)
  }
  
  fs.ensureDirSync(path.dirname(targetFile));
  fs.copySync(sourceFile, targetFile, { overwrite: true });
  return true;
}

function copyDirectorySelective(sourceDir, targetDir, isCoreDirectory) {
  if (!fs.existsSync(sourceDir)) {
    logError(`Diretorio nao encontrado: ${sourceDir}`);
    process.exit(1);
  }

  const sourcePath = path.resolve(sourceDir);
  const targetPath = path.resolve(targetDir);
  
  if (sourcePath === targetPath) {
    logError(`Source e destination nao podem ser o mesmo: ${sourceDir}`);
    return;
  }

  const files = fs.readdirSync(sourceDir, { recursive: true });
  let copiedCount = 0;
  let skippedCount = 0;
  
  for (const file of files) {
    const fullSourcePath = path.join(sourceDir, file);
    const fullTargetPath = path.join(targetDir, file);
    const relativePath = path.join(path.basename(sourceDir), file);
    
    if (fs.statSync(fullSourcePath).isDirectory()) {
      continue; // Diretorios sao criados sob demanda
    }
    
    const copied = copyFileSelective(fullSourcePath, fullTargetPath, relativePath, isCoreDirectory);
    if (copied) {
      copiedCount++;
    } else {
      skippedCount++;
    }
  }
  
  return { copied: copiedCount, skipped: skippedCount };
}

function checkExistingInstallation() {
  const nemesisPaths = [
    path.join(ROOT_DIR, '.windsurf'),
    path.join(ROOT_DIR, 'Feature-Documentation'),
    path.join(ROOT_DIR, '.nemesis', 'workflow-enforcement'),
    path.join(ROOT_DIR, '.nemesis')
  ];
  
  const existingPaths = nemesisPaths.filter(p => fs.existsSync(p));
  return existingPaths.length > 0 ? existingPaths : null;
}

function askUserConfirmation(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === 's');
    });
  });
}

function createDefaultConfig(configPath) {
  const configDir = path.dirname(configPath);
  fs.ensureDirSync(configDir);
  
  const defaultConfigContent = `[nemesis]
auto_gitignore = true
backup_existing = true
verbose_output = false
create_config = true

[workflows]
generate_prompt_rag = true
audit_create_pr = true
auditoria_conformidade = true

[skills]
vercel_agent_skills = true
react_best_practices = true
web_design_guidelines = true

[ide_detection]
auto_detect = true
fallback_to_prompt = true
supported_ides = ["windsurf", "cursor", "copilot", "claude", "aider"]

[feature_documentation]
create_issues_folder = true
create_pr_folder = true
create_prompts_folder = true
`;
  
  fs.writeFileSync(configPath, defaultConfigContent, 'utf8');
}

async function runInstallation() {
  logInfo("Iniciando instalacao do Nemesis Framework...\n");

  // Verificar instalacao existente
  const existingPaths = checkExistingInstallation();
  if (existingPaths) {
    logInfo("Nemesis ja instalado. Caminhos encontrados:");
    existingPaths.forEach(p => logInfo(`  - ${p}`));
    
    const shouldOverwrite = await askUserConfirmation("\nDeseja sobrescrever? (s/N): ");
    if (!shouldOverwrite) {
      logInfo("\nInstalacao cancelada pelo usuario.");
      process.exit(0);
    }
    logInfo("\nProsseguindo com sobrescricao...\n");
  }

  // Carregar configuracao
  const config = loadConfig();

  // Atualizar .gitignore se configurado
  if (config.nemesis.auto_gitignore) {
    updateGitignore();
  }

  // Garantir dependencias de runtime
  ensureDependencies();

  const skillsInstalled = ensureAgentSkillsInstalled();
  if (!skillsInstalled) {
    installAgentSkills();
  } else {
    logInfo("Vercel Agent Skills ja instalado.\n");
  }

  // Copiar estrutura .windsurf/ (core - sempre sobrescreve)
  logInfo("\nInstalando arquivos core (.windsurf/rules, .windsurf/workflows)...");
  const windsurfResult = copyDirectorySelective(
    path.join(PACKAGE_ROOT, '.windsurf'), 
    path.join(ROOT_DIR, '.windsurf'),
    true // isCoreDirectory = true
  );
  logInfo(`  ✓ ${windsurfResult.copied} arquivos core instalados`);
  
  // Copiar Feature-Documentation/ (templates - seletivo)
  logInfo("\nInstalando templates (Feature-Documentation)...");
  const featureResult = copyDirectorySelective(
    path.join(PACKAGE_ROOT, 'Feature-Documentation'), 
    path.join(ROOT_DIR, 'Feature-Documentation'),
    false // isCoreDirectory = false (templates)
  );
  logInfo(`  ✓ ${featureResult.copied} templates novos instalados`);
  if (featureResult.skipped > 0) {
    logInfo(`  ℹ ${featureResult.skipped} arquivos ignorados (ja existem ou nao sao templates)`);
  }
  
  // Copiar .nemesis/workflow-enforcement/ (core - sempre sobrescreve)
  logInfo("\nInstalando workflow enforcement...");
  const workflowResult = copyDirectorySelective(
    path.join(PACKAGE_ROOT, 'src/workflow-enforcement'), 
    path.join(ROOT_DIR, '.nemesis', 'workflow-enforcement'),
    true // isCoreDirectory = true
  );
  logInfo(`  ✓ ${workflowResult.copied} arquivos de workflow instalados`);

  // Copiar .nemesis/hooks/ (core - sempre sobrescreve)
  logInfo("\nInstalando hooks PreToolUse...");
  const hooksSourceDir = path.join(PACKAGE_ROOT, '.nemesis', 'hooks');
  const hooksTargetDir = path.join(ROOT_DIR, '.nemesis', 'hooks');
  
  if (fs.existsSync(hooksSourceDir)) {
    const hooksResult = copyDirectorySelective(
      hooksSourceDir, 
      hooksTargetDir,
      true // isCoreDirectory = true
    );
    logInfo(`  ✓ ${hooksResult.copied} hooks instalados`);
  } else {
    logInfo(`  ℹ Diretorio de hooks nao encontrado no pacote fonte`);
  }

  // Validar estrutura antes de injetar scripts
  validateNemesisStructure();

  // Atualizar package.json com scripts nemesis
  updatePackageJsonScripts();

  // Criar arquivo de configuracao se nao existir
  if (!fs.existsSync(CONFIG_FILE)) {
    createDefaultConfig(CONFIG_FILE);
    logInfo("✓ Arquivo de configuracao criado: .nemesis/config.toml");
  }

  logInfo("\nInstalacao concluida com sucesso.");
  logInfo("\nPara personalizar: edite .nemesis/config.toml");
}

try {
  runInstallation().catch(error => {
    logError("Falha durante a instalacao.");
    logError(error instanceof Error ? error.message : "Erro desconhecido.");
    process.exit(1);
  });
} catch (error) {
  logError("Falha durante a inicializacao.");
  logError(error instanceof Error ? error.message : "Erro desconhecido.");
  process.exit(1);
}
