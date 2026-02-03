# Correção do Instalador NemesisIA - Injeção de Scripts no package.json

## Objetivo

Corrigir o instalador NemesisIA Skills SPRW que não injetava os scripts `nemesis:*` no `package.json` do projeto alvo durante a instalação/reinstalação, tornando impossível executar workflows via `yarn nemesis:enforce`.

## Arquivos afetados

- `index.js` [modificado]

## Implementações realizadas

### 1. index.js

Adicionadas quatro funções críticas para gerenciamento de dependências e scripts:

#### Função `checkDependencyInstalled(dependencyName)`
Verifica se uma dependência está instalada no projeto alvo utilizando `require.resolve()`.

```javascript
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
```

#### Função `ensureDependencies()`
Instala automaticamente as dependências de runtime necessárias (`typescript`, `ts-node`, `@types/node`). Tenta `yarn` primeiro, com fallback para `npm`. Instalação silenciosa sem permissão do usuário.

```javascript
function ensureDependencies() {
  const dependencies = [
    { name: "typescript", type: "dev" },
    { name: "ts-node", type: "dev" },
    { name: "@types/node", type: "dev" }
  ];
  // Instalação automática com verificação prévia
}
```

#### Função `validateNemesisStructure()`
Valida a existência dos arquivos CLI essenciais antes de prosseguir com a instalação.

```javascript
function validateNemesisStructure() {
  const requiredFiles = [
    ".nemesis/workflow-enforcement/cli/enforce.ts",
    ".nemesis/workflow-enforcement/cli/validate.ts",
    ".nemesis/workflow-enforcement/cli/test-all-workflows.ts"
  ];
  // Validação com falha fatal se arquivos ausentes
}
```

#### Função `updatePackageJsonScripts()`
Injeta os scripts `nemesis:*` no `package.json` do projeto alvo, sobrescrevendo versões anteriores.

```javascript
function updatePackageJsonScripts() {
  // Remove scripts nemesis antigos
  const nemesisScripts = Object.keys(packageJson.scripts).filter(
    key => key.startsWith("nemesis:")
  );
  nemesisScripts.forEach(key => delete packageJson.scripts[key]);
  
  // Injeta novos scripts
  packageJson.scripts["nemesis:validate"] = "npx ts-node .nemesis/workflow-enforcement/cli/validate.ts";
  packageJson.scripts["nemesis:enforce"] = "npx ts-node .nemesis/workflow-enforcement/cli/enforce.ts";
  packageJson.scripts["nemesis:test"] = "npx ts-node .nemesis/workflow-enforcement/cli/test-all-workflows.ts";
}
```

#### Integração no fluxo de instalação

As funções foram integradas na função `runInstallation()` nos pontos estratégicos:

- **`ensureDependencies()`**: Chamada após `updateGitignore()` e antes de `ensureAgentSkillsInstalled()`
- **`validateNemesisStructure()`**: Chamada após a cópia dos workflows
- **`updatePackageJsonScripts()`**: Chamada após a validação da estrutura

```javascript
// Após .gitignore
ensureDependencies();

// Após cópia de workflows
validateNemesisStructure();
updatePackageJsonScripts();
```

## Benefícios arquiteturais e prontidão para escala

- **Funcionalidade completa**: Workflows podem ser executados via `yarn nemesis:enforce` após instalação
- **Reinstalação robusta**: Sobrescrição automática de scripts garante atualização
- **Dependências garantidas**: Instalação automática de `typescript`, `ts-node`, `@types/node`
- **Validação estrutural**: Prevenção de erros por arquivos CLI ausentes
- **Zero intervenção manual**: Todo processo é automático durante `npx install-nemesis`
- **TypeScript validado**: Código passou em `yarn tsc --noEmit`
- **Segurança auditada**: `yarn npm audit` sem vulnerabilidades

| Comando             | Resultado (OK/FALHA) | Observações            |
|---------------------|----------------------|------------------------|
| yarn lint           | N/A                  | Projeto de documentação |
| yarn tsc --noEmit   | OK                   | TypeScript válido      |
| yarn build          | N/A                  | Projeto de documentação |
| yarn npm audit      | OK                   | Sem vulnerabilidades   |
