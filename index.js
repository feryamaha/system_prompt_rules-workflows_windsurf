#!/usr/bin/env node
const path = require("path");
const fs = require("fs-extra");
const { execSync } = require("child_process");

const ROOT_DIR = process.cwd();
const PACKAGE_ROOT = path.resolve(__dirname);
const CONFIG_FILE = path.join(ROOT_DIR, ".genesis", "config.toml");
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

function loadConfig() {
  const defaultConfig = {
    genesis: {
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
  
  const genesisSection = `
# START Genesis Generated Files
# Arquivos gerados pela instalação do Genesis (bloquear para não versionar)
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
# END Genesis Generated Files`;

  let gitignoreContent = '';
  if (fs.existsSync(gitignorePath)) {
    gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  }

  // Remover seção antiga do Genesis (se existir)
  const startMarker = '# START Genesis Generated Files';
  const endMarker = '# END Genesis Generated Files';
  const startIndex = gitignoreContent.indexOf(startMarker);
  const endIndex = gitignoreContent.indexOf(endMarker);
  
  if (startIndex !== -1 && endIndex !== -1) {
    gitignoreContent = 
      gitignoreContent.substring(0, startIndex) + 
      gitignoreContent.substring(endIndex + endMarker.length);
  }

  // Adicionar nova seção
  gitignoreContent += genesisSection;

  // Escrever .gitignore atualizado
  fs.writeFileSync(gitignorePath, gitignoreContent.trim() + '\n');
  logInfo("✓ .gitignore atualizado com regras do Genesis");
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

  fs.copySync(sourceDir, targetDir, {
    overwrite: true,
    errorOnExist: false
  });
}

function runInstallation() {
  logInfo("Iniciando instalacao do GenesisIA Skills SPRW...\n");

  // Carregar configuração
  const config = loadConfig();

  // Atualizar .gitignore se configurado
  if (config.genesis.auto_gitignore) {
    updateGitignore();
  }

  const skillsInstalled = ensureAgentSkillsInstalled();
  if (!skillsInstalled) {
    installAgentSkills();
  } else {
    logInfo("Vercel Agent Skills ja instalado.\n");
  }

  SOURCE_DIRS.forEach((dirName) => {
    const sourceDir = path.join(PACKAGE_ROOT, dirName);
    const targetDir = path.join(ROOT_DIR, dirName);
    logInfo(`Copiando ${dirName}...`);
    copyDirectory(sourceDir, targetDir);
  });

  // Criar arquivo de configuração se não existir
  const configDir = path.dirname(CONFIG_FILE);
  if (!fs.existsSync(CONFIG_FILE)) {
    fs.ensureDirSync(configDir);
    fs.copySync(path.join(PACKAGE_ROOT, ".genesis", "config.toml"), CONFIG_FILE);
    logInfo("✓ Arquivo de configuracao criado: .genesis/config.toml");
  }

  logInfo("\nInstalacao concluida com sucesso.");
  logInfo("\nPara personalizar: edite .genesis/config.toml");
}

try {
  runInstallation();
} catch (error) {
  logError("Falha durante a instalacao.");
  logError(error instanceof Error ? error.message : "Erro desconhecido.");
  process.exit(1);
}
