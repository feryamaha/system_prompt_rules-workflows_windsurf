---
trigger: always_on
---

# Índice de Regras Nemesis

> **Conexão entre Rules, Workflows, Enforcement e PreToolUse Hooks**

## Hierarquia de Consulta

Quando uma regra não cobrir o caso específico, siga esta ordem:

```
1. Regras Locais (.windsurf/rules/)
        ↓ não encontrou
2. Skills Vercel (react-best-practices, web-design-guidelines)
        ↓ não encontrou
3. Documentação Oficial (react.dev, nextjs.org, etc.)
```

## Regras Operacionais

| Regra | Propósito | Origem |
|-------|-----------|--------|
| **rule-main-rules.md** | Tabela de decisão (Bugfix/Refactor/Feature/Docs) | Dor real em produção |
| **origin-rules.md** | Filosofia e propósito das regras | Extração de falhas recorrentes |
| **API-convention.md** | Padrão Backend-for-Frontend | Arquitetura de projetos reais |
| **Arquitetura-pastas-arquivos.md** | Estrutura de arquivos | Pipeline modular validado |
| **Conformidade.md** | Auditoria e segurança OWASP | Conformidade técnica |
| **design-system-convention.md** | Tokens e padrões visuais | Design system implementado |
| **typescript-typing-convention.md** | Centralização de tipos | Bugs de tipagem em produção |
| **react-hooks-patterns-rules.md** | Anti-patterns proibidos | Erros de hooks recorrentes |
| **ui-separation-convention.md** | Separação UI vs Lógica | Acoplamento problemático |
| **rules-pr.md** | Padrões de Pull Requests | Convenção de documentação |
| **markdown-standards.md** | Padrões de linguagem | Consistência documental |

## Workflows

| Workflow | Função | Trigger |
|----------|--------|---------|
| **workflow-main.md** | Protocolo principal de execução | `/workflow-main` |
| **generate-prompt-rag.md** | Converter informal → técnico | `/generate-prompt-rag` |
| **audit-create-pr.md** | Validação + criação de PR | `/audit-create-pr` |
| **auditoria-de-conformidade.md** | Análise arquitetural completa | `/auditoria-de-conformidade` |
| **review.md** | Revisão de código | `/review` |

## Enforcement + Hooks

### Arquitetura de Validação

```
Workflow Invocado
        ↓
PreToolUse Hook (nemesis-pretool-check.sh)
        ↓
Validação Headless (workflow-enforcer.ts)
        ↓
Exit Code: 0 = Permitir | 2 = Bloquear
```

### Componentes

| Componente | Função |
|------------|--------|
| **workflow-enforcer.ts** | Validador em modo headless |
| **workflow-validators.ts** | Regras de validação específicas |
| **permission-gate.ts** | Controle de permissões de comandos |
| **violation-logger.ts** | Registro de violações |
| **pretool-hook.ts** | Entry point para hooks |
| **install-hooks.js** | Instalador de hooks |

## Skills de Referência

Instaladas via `npx add-skill vercel-labs/agent-skills`:

| Skill | Conteúdo | Uso |
|-------|----------|-----|
| **react-best-practices** | 40+ padrões de performance React | Quando regras locais não cobrem |
| **web-design-guidelines** | Acessibilidade e UX | Validação de UI/UX |
| **frontend-design** | Melhores práticas gerais | Fallback geral |

## Documentação Oficial

| Tecnologia | Fonte | Uso |
|------------|-------|-----|
| **React** | [react.dev](https://react.dev) | Hooks, patterns, concorrência |
| **Next.js** | [nextjs.org](https://nextjs.org) | App Router, Server Components |
| **TypeScript** | [typescriptlang.org](https://typescriptlang.org) | Tipagem avançada |
| **Tailwind** | [tailwindcss.com](https://tailwindcss.com) | Utilities e configuração |
| **Windsurf** | [docs.windsurf.com](https://docs.windsurf.com) | Workflows e regras |

## Filosofia das Regras

> **"Qualidade é inegociável. Regras rígidas tornam velocidade sustentável."**

As regras existem porque a alternativa (regras fracas, dependência de bom senso) gera entropia e dívida técnica. Cada regra nasceu de **dor real em produção** - erros que se repetem quando faltam salvaguardas inegociáveis.

## Fluxo de Governança

```
Pedido informal
        ↓
Generate Prompt RAG → Prompt técnico congelado
        ↓
Leitura obrigatória de regras (este índice)
        ↓
Consulta hierárquica: Rules → Skills → Docs
        ↓
Planejamento → Aprovação → Execução
        ↓
PreToolUse Hook intercepta e valida
        ↓
Audit Create PR → Validação final
```

---

*Índice de conexão: Rules + Workflows + Enforcement + Hooks*

____


