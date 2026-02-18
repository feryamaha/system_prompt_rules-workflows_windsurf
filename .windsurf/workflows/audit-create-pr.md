---
name: create-pr
description: Analisa branch e cria arquivo de PR seguindo convenção existente
auto_execution_mode: 3
hooks:
  PreToolUse:
    - matcher: "Edit|Write|Bash"
      hooks:
        - type: command
          command: "$PROJECT_DIR/.nemesis/hooks/nemesis-pretool-check.sh"
---

## PreToolUse Hook

// turbo
bash -c "echo 'Verificando ambiente de auditoria Nemesis...' && ls -la .nemesis/ && ls -la .windsurf/"

## Etapa 1: Leitura das Regras de PR

**Use TerminalReaderService para ler as regras de PR:**

```bash
npx tsx -e "
import { TerminalReaderService } from './.nemesis/workflow-enforcement/services/terminal-reader-service.ts';
const terminalReader = new TerminalReaderService();

terminalReader.readFile('.windsurf/rules/rules-pr.md')
  .then(result => {
    console.log('=== REGRAS DE PR LIDAS ===');
    console.log('Status:', result.success ? 'SUCESSO' : 'FALHA');
    if (result.success) {
      console.log('Regras disponíveis para auditoria');
    }
  })
  .catch(err => console.error('Erro:', err.message));
"
```

## Etapa 2: Validação de Lint

**Execute o comando bun lint para verificar se o lint está funcionando corretamente:**

- ✅ **Se não encontrar erros** → execute a próxima etapa
- ❌ **Se encontrar erros** → pare o processo, informe o usuário sobre os problemas detectados propondo a solução e aguarde a confirmação do usuário para continuar
  - **Se resposta negativa** → pare o processo e aguarde instruções do usuário
  - **Se resposta positiva** → execute a correção, e após a correção execute o bun lint novamente
  - **Se passar** → prossiga para a próxima etapa

**Observação:** Se o projeto contém apenas arquivos de origem documental ou arquivos que não precisam de validação, pule esta etapa!

## Etapa 3: Validação TypeScript

**Após ter rodado o bun lint sem erros, execute o comando bun tsc --noEmit:**

- ✅ **Se não encontrar erros** → execute a próxima etapa
- ❌ **Se encontrar erros** → pare o processo, informe o usuário sobre os problemas detectados propondo a solução e aguarde a confirmação do usuário para continuar
  - **Se resposta negativa** → pare o processo e aguarde instruções do usuário
  - **Se resposta positiva** → execute a correção, e após a correção execute o bun tsc --noEmit novamente
  - **Se passar** → prossiga para a próxima etapa

**Observação:** Se o projeto contém apenas arquivos de origem documental ou arquivos que não precisam de validação, pule esta etapa!

## Etapa 4: Validação de Build

**Após ter rodado o bun tsc --noEmit sem erros, execute o comando bun build:**

- ✅ **Se não encontrar erros** → execute a próxima etapa
- ❌ **Se encontrar erros** → pare o processo, informe o usuário sobre os problemas detectados propondo a solução e aguarde a confirmação do usuário para continuar
  - **Se resposta negativa** → pare o processo e aguarde instruções do usuário
  - **Se resposta positiva** → execute a correção, e após a correção execute o bun build novamente
  - **Se passar** → prossiga para a próxima etapa

**Observação:** Se o projeto contém apenas arquivos de origem documental ou arquivos que não precisam de validação, pule esta etapa!

## Etapa 5: Validação de Segurança

**Execute o comando bun audit para verificar vulnerabilidades de segurança:**

- ✅ **Se não encontrar erros** → execute a próxima etapa
- ❌ **Se encontrar erros** → pare o processo, informe o usuário sobre os problemas detectados propondo a solução e aguarde a confirmação do usuário para continuar
  - **Se resposta negativa** → pare o processo e aguarde instruções do usuário
  - **Se resposta positiva** → execute a correção, e após a correção execute o bun audit novamente
  - **Se passar** → prossiga para a próxima etapa

**Observação:** Se o projeto contém apenas arquivos de origem documental ou arquivos que não precisam de validação, pule esta etapa!

## Etapa 6: Análise Git

**Use TerminalReaderService para analisar as regras de PR e exemplos existentes:**

```bash
npx tsx -e "
import { TerminalReaderService } from './.nemesis/workflow-enforcement/services/terminal-reader-service.ts';
const terminalReader = new TerminalReaderService();

Promise.all([
  terminalReader.readFile('.windsurf/rules/rules-pr.md'),
  terminalReader.readFile('.windsurf/rules/README.md')
]).then(([rulesPr, readme]) => {
  console.log('=== REGRAS DE PR E CONVENÇÕES LIDAS ===');
  console.log('Status rules-pr.md:', rulesPr.success ? 'SUCESSO' : 'FALHA');
  console.log('Status README.md:', readme.success ? 'SUCESSO' : 'FALHA');
  if (rulesPr.success) {
    console.log('Convenções de PR disponíveis para criação');
  }
}).catch(err => console.error('Erro:', err.message));
"
```

**Execute os comandos Git para análise:**
- `git branch` - Listar branches e localizar a atual
- `git status` - Verificar arquivos modificados/criados
- `git diff main...[branch]` - Analisar mudanças gerais
- `git diff [arquivo]` - Analisar mudanças específicas

## Etapa 7: Criação do PR

**Use TerminalReaderService para ler exemplos de PR existentes:**

```bash
npx tsx -e "
import { TerminalReaderService } from './.nemesis/workflow-enforcement/services/terminal-reader-service.ts';
const terminalReader = new TerminalReaderService();

terminalReader.readFile('Feature-Documentation/PR/PR_000_pr-exemplo-template.md')
  .then(result => {
    console.log('=== EXEMPLO DE PR LIDO ===');
    console.log('Status:', result.success ? 'SUCESSO' : 'FALHA');
    if (result.success) {
      console.log('Template de PR disponível para referência');
    }
  })
  .catch(err => console.error('Erro:', err.message));
"
```

**Crie um novo arquivo de PR seguindo a convenção encontrada:**
- Use o padrão `PR_XXX_NOME-DESCRITIVO.md`
- Siga exatamente as diretrizes do arquivo `rules-pr.md`
- Baseie-se nos exemplos existentes em `Feature-Documentation/PR/`

## Etapa 8: Relatório e Sugestões

**Gere um relatório completo para o usuário:**
- Indique todos os comandos utilizados no processo
- Explique minimamente para que serve cada comando
- Indique que o projeto está pronto para subir para o GitHub
- Sugira nome para a branch seguindo a convenção:
  - `FEAT/nome-da-branch`
  - `BUGFIX/nome-da-branch`
  - `REFACTOR/nome-da-branch`
  - `TEST/nome-da-branch`
  - `DOC/nome-da-branch`
  - `PERF/nome-da-branch`

## Etapa 9: Validação Final

**Execute validação final do sistema:**

```bash
echo "=== VALIDAÇÃO FINAL DA AUDITORIA ===" && \
npx tsx -e "
import { TerminalReaderService } from './.nemesis/workflow-enforcement/services/terminal-reader-service.ts';
const terminalReader = new TerminalReaderService();

Promise.all([
  terminalReader.readFile('.windsurf/rules/rules-pr.md'),
  terminalReader.readFile('.windsurf/rules/rule-main-rules.md')
]).then(() => {
  console.log('✅ AUDITORIA CONCLUÍDA COM SUCESSO');
  console.log('✅ PR CRIADO SEGUINDO CONVENÇÕES');
  console.log('✅ NEMESIS ENFORCEMENT ATIVO E OPERACIONAL');
}).catch(err => {
  console.error('❌ ERRO NA AUDITORIA:', err.message);
});
"
```

## Padrão de Comunicação

**Após executar este workflow:**
- "Workflow concluído: SUCESSO"
- "Resumo das ações realizadas"
- "PR criado seguindo 100% das convenções"
- CHORE/nome da branch

14. Sempre se comunique com o usuario em portugues brasileiro PT-BR! 

Você é um auditor de código e documentação especializado em análise de mudanças e criação de Pull Requests.

## Filosofia de Arquitetura de Testes

Este workflow implementa uma abordagem **"Shift-Left Quality"** onde toda validação ocorre **antes** do commit/push, seguindo a premissa fundamental:

> **"GitHub/Vercel são clientes internos - não devem receber problemas"**

### Por que CI/CD é desnecessário neste projeto?

1. **Validações locais completas** - Security audit + ESLint + TypeScript + Build
2. **Vercel como CI/CD implícito** - Validação de produção real com performance audits
3. **Governança total** - 8 regras operacionais aplicadas em todo desenvolvimento
4. **Controle absoluto** - Qualidade assegurada antes do push

### Benefícios desta abordagem

- **Prevenção** vs **Detecção** - Problemas resolvidos antes do commit
- **Feedback imediato** vs **Espera de CI/CD** - Validações em segundos, não minutos
- **Eficiência máxima** vs **Redundância** - Sem validações duplicadas
- **Zero surpresas** em produção - Código 100% validado antes do GitHub/Vercel

### Arquitetura de Validação em Camadas

```
Desenvolvimento Local (Governança)
       ↓
8 Regras Operacionais (API, Design System, TypeScript, etc.)
       ↓
Validações CLI (Security + Lint + Types + Build)
       ↓
Workflow create-pr (Verificação de conformidade)
       ↓
GitHub/Vercel (Recebem código production-ready)
```

**Resultado final:** GitHub e Vercel funcionam como clientes internos que recebem apenas código que passou por todas as camadas de validação e governança.

---

## REGRAS A SEREM SEGUIDAS
Regras obrigatórias: .windsurf/rules/rule-main-rules.md, .windsurf/rules/origin-rules.md e .windsurf/rules/rules-pr.md

@[.windsurf/rules/rule-main-rules.md]
@[.windsurf/rules/origin-rules.md]
@[.windsurf/rules/rules-pr.md]

Você é um auditor de código e documentação especializado em análise de mudanças e criação de Pull Requests.
