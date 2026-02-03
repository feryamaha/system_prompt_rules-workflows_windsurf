# Correção do Instalador NemesisIA - Fix de Caminhos Relativos

## Objetivo

Corrigir o instalador NemesisIA Skills SPRW que falhava ao copiar as estruturas `.windsurf/`, `Feature-Documentation/` e `src/workflow-enforcement/` para projetos alvo devido ao uso incorreto de caminhos relativos em vez de caminhos absolutos baseados em `PACKAGE_ROOT`.

## Arquivos afetados

- `index.js` [modificado]
- `Feature-Documentation/prompts/003_nemesis-installer-corrupted.md` [novo]
- `Feature-Documentation/to-do-list/to-do-list-nemesis-installer-corrupted.md` [novo]
- `Feature-Documentation/issues/003_issue-nemesis-installer-correction.md` [novo]
- `Feature-Documentation/PR/PR_005_GENESIS-INSTALLER-FIX.md` [novo]

## Implementações realizadas

### 1. index.js
Correção dos caminhos de origem nas chamadas da função `copyDirectory()`:

**Linha 171 - Diretório .windsurf:**
```javascript
// ANTES (ERRADO):
copyDirectory('.windsurf', path.join(ROOT_DIR, '.windsurf'))

// DEPOIS (CORRETO):
copyDirectory(path.join(PACKAGE_ROOT, '.windsurf'), path.join(ROOT_DIR, '.windsurf'))
```

**Linha 174 - Diretório Feature-Documentation:**
```javascript
// ANTES (ERRADO):
copyDirectory('Feature-Documentation', path.join(ROOT_DIR, 'Feature-Documentation'))

// DEPOIS (CORRETO):
copyDirectory(path.join(PACKAGE_ROOT, 'Feature-Documentation'), path.join(ROOT_DIR, 'Feature-Documentation'))
```

**Linha 177 - Diretório src/workflow-enforcement:**
```javascript
// ANTES (ERRADO):
copyDirectory('src/workflow-enforcement', path.join(ROOT_DIR, 'src/workflow-enforcement'))

// DEPOIS (CORRETO):
copyDirectory(path.join(PACKAGE_ROOT, 'src/workflow-enforcement'), path.join(ROOT_DIR, 'src/workflow-enforcement'))
```

### 2. 003_nemesis-installer-corrupted.md
RAG estruturado documentando o problema técnico e solicitando correção do instalador NemesisIA.

### 3. to-do-list-nemesis-installer-corrupted.md
Lista de tarefas detalhada com análise de causa raiz e plano de execução para correção dos caminhos.

### 4. 003_issue-nemesis-installer-correction.md
Issue completa registrando toda a interação entre usuário e IA, incluindo erros cometidos, acertos e lições aprendidas.

### 5. PR_005_GENESIS-INSTALLER-FIX.md
Este arquivo de PR documentando a correção implementada.

## Benefícios arquiteturais e prontidão para escala

- **Instalação funcional**: O comando `npx install-nemesis` agora funciona corretamente
- **Governança preservada**: Toda estrutura de regras e workflows é instalada nos projetos alvo
- **Documentação completa**: Registro detalhado do problema e solução para referência futura
- **Validação garantida**: TypeScript validado sem erros
- **Zero dívida técnica**: Correção pontual sem refatoração desnecessária

| Comando             | Resultado (OK/FALHA) | Observações            |
|---------------------|----------------------|------------------------|
| yarn lint           | N/A                  | Projeto de documentação |
| yarn tsc --noEmit   | OK                   | TypeScript válido      |
| yarn build          | N/A                  | Projeto de documentação |
| yarn npm audit      | OK                   | Sem vulnerabilidades   |
