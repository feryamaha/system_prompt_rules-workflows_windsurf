#!/usr/bin/env node
const path = require("path");
const fs = require("fs-extra");
const { execSync } = require("child_process");

const ROOT_DIR = process.cwd();
const PACKAGE_ROOT = path.resolve(__dirname);
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

function ensureAgentSkillsInstalled() {
  try {
    execSync("npx add-skill vercel-labs/agent-skills --list", {
      stdio: "ignore"
    });
    return true;
  } catch (error) {
    return false;
  }
}

function installAgentSkills() {
  logInfo("Instalando Vercel Agent Skills...\n");
  execSync("npx add-skill vercel-labs/agent-skills", {
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

  logInfo("\nInstalacao concluida com sucesso.");
}

try {
  runInstallation();
} catch (error) {
  logError("Falha durante a instalacao.");
  logError(error instanceof Error ? error.message : "Erro desconhecido.");
  process.exit(1);
}
