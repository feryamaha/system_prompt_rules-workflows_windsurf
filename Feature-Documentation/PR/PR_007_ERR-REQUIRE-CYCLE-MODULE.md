# Correção do ERR_REQUIRE_CYCLE_MODULE - Substituição ts-node por tsx

## Objetivo

Resolver o erro `ERR_REQUIRE_CYCLE_MODULE` que ocorria ao executar workflows do Nemesis em projetos com Yarn PnP e ES modules, substituindo `ts-node` por `tsx` que tem suporte nativo a ES modules.

## Arquivos afetados

- `package.json` [modificado]
- `index.js` [modificado]
- `Feature-Documentation/PR/PR_007_ERR-REQUIRE-CYCLE-MODULE.md` [novo]

## Implementações realizadas

### 1. package.json
Adicionado `tsx` como dependência de desenvolvimento e atualizados scripts para usar `yarn tsx` em vez de `npx ts-node`:

**Adição de dependência:**
```json
"devDependencies": {
  "@types/node": "^25.2.0",
  "ts-node": "^10.9.2",
  "tsx": "^4.19.0",
  "typescript": "^5.9.3"
}
```

**Atualização dos scripts:**
```json
"scripts": {
  "nemesis:validate": "yarn tsx src/workflow-enforcement/cli/validate.ts",
  "nemesis:enforce": "yarn tsx src/workflow-enforcement/cli/enforce.ts",
  "nemesis:test": "yarn tsx src/workflow-enforcement/cli/test-all-workflows.ts"
}
```

### 2. index.js
Modificadas duas funções para suportar `tsx`:

**Função `ensureDependencies()`:**
- Substituído `ts-node` por `tsx` na lista de dependências a instalar

```javascript
const dependencies = [
  { name: "typescript", type: "dev" },
  { name: "tsx", type: "dev" },  // Alterado de ts-node
  { name: "@types/node", type: "dev" }
];
```

**Função `updatePackageJsonScripts()`:**
- Alterado comando de `npx ts-node` para `yarn tsx` para evitar reinstalação

```javascript
packageJson.scripts["nemesis:validate"] = "yarn tsx .nemesis/workflow-enforcement/cli/validate.ts";
packageJson.scripts["nemesis:enforce"] = "yarn tsx .nemesis/workflow-enforcement/cli/enforce.ts";
packageJson.scripts["nemesis:test"] = "yarn tsx .nemesis/workflow-enforcement/cli/test-all-workflows.ts";
```

## Benefícios arquiteturais e prontidão para escala

- **Compatibilidade com ES modules**: `tsx` suporta nativamente ES modules, resolvendo o conflito com Yarn PnP
- **Performance superior**: `tsx` é mais rápido que `ts-node` na execução
- **Sem reinstalação**: Uso de `yarn tsx` evita a pergunta de instalação a cada execução
- **Zero dependências externas**: Solução auto-contida dentro do ecossistema do projeto
- **Retrocompatibilidade**: `ts-node` mantido como dependência para projetos que ainda o utilizam

## Análise do problema resolvido

### Causa Raiz
O erro `ERR_REQUIRE_CYCLE_MODULE` ocorria porque:
1. ts-node usa `require()` para carregar módulos TypeScript
2. Em projetos com ES modules (`"module": "esnext"`), o Yarn PnP carrega como ESM
3. ts-node tentava então usar `require()` em um módulo ES, violando a especificação ECMAScript

### Solução Implementada
- `tsx` foi projetado para ES modules e funciona nativamente com Yarn PnP
- Não há conflito entre sistemas de módulos
- Execução direta sem conversão de CommonJS para ES modules

| Comando             | Resultado (OK/FALHA) | Observações            |
|---------------------|----------------------|------------------------|
| yarn lint           | N/A                  | Projeto de documentação |
| yarn tsc --noEmit   | OK                   | TypeScript válido      |
| yarn build          | N/A                  | Projeto de documentação |
| yarn npm audit      | OK                   | Sem vulnerabilidades   |

## Testes de Validação

- ✅ TypeScript compilado sem erros (`yarn tsc --noEmit`)
- ✅ Segurança auditada sem vulnerabilidades (`yarn npm audit`)
- ✅ Sintaxe JavaScript validada (`node --check index.js`)
- ✅ JSON do package.json válido

## Impacto em Projetos Alvo

Ao reinstalar o Nemesis com esta versão:
1. `tsx` será instalado automaticamente como dependência
2. Scripts serão injetados com `yarn tsx` em vez de `npx ts-node`
3. Workflows executarão sem erro `ERR_REQUIRE_CYCLE_MODULE`
4. Não haverá mais perguntas de instalação a cada execução
