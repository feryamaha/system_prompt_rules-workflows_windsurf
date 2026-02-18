# Nemesis Framework – Workflow Orchestration com Enforcement Deterministico

> **Workflow Orchestration Framework com PreToolUse Hooks para Governança de IA-Assisted Development**

## Visão Geral

O **Nemesis Framework** é um sistema de governança ativa que estabelece regras inegociáveis e enforcement deterministico para integração de IA no ciclo de desenvolvimento.

**Diferencial:** Enforcement via **PreToolUse Hooks** que bloqueiam tecnicamente ações não autorizadas antes da execução, eliminando a possibilidade de modelos LLM ignorarem validações.

## Workflow Execution Protocol

### Fluxo Obrigatório de Execução

Quando um workflow é solicitado, a seguinte sequência deve ser seguida:

```
Solicitação: "Execute o workflow @[/nome]"
        ↓
1. LEITURA COMPLETA OBRIGATÓRIA
   - Ler workflow inteiro antes de qualquer ação
   - Identificar PreToolUse hooks no topo
   - Entender dependências e pré-requisitos
        ↓
2. EXECUÇÃO DO PRETOOLUSE (se existir)
   - Rodar hooks de validação
   - Respeitar resultado (bloquear se falhar)
   - NUNCA pular validações
        ↓
3. EXECUÇÃO SEQUENCIAL DAS INSTRUÇÕES
   - Seguir ordem exata das etapas
   - Pedir permissão para modificações
   - NUNCA criar atalhos ou pular etapas
```

### Proibições Absolutas

- **NUNCA executar workflow sem ler completamente**
- **NUNCA modificar arquivos sem permissão explícita**
- **NUNCA pular etapas de validação**
- **NUNCA assumir permissão implícita**
- **NUNCA criar scripts/comandos não solicitados**

### Padrão de Comunicação

**Antes de executar:**
- "Li o workflow @[/nome] completamente"
- "Identifiquei X etapas e Y dependências"
- "Posso prosseguir com a execução?"

**Durante execução:**
- "Etapa X: [resultado]"
- "Encontrei problema: [descrição]"
- "Preciso de permissão para: [ação]"

**Após execução:**
- "Workflow concluído: [status]"
- "Resumo das ações realizadas"

**Princípio final**: "Disciplina no processo = qualidade no resultado"

## Arquitetura

### Sistema de 4 Camadas

| Camada | Componente | Função |
|--------|-----------|--------|
| 1 | `.windsurf/rules/` | Contratos de governança (Markdown) |
| 2 | `.windsurf/workflows/` | Workflows estruturados com hooks |
| 3 | `src/workflow-enforcement/` | Enforcement Engine TypeScript |
| 4 | `Feature-Documentation/` | Memória organizacional |

### Enforcement Deterministico (PreToolUse Hooks)

Ao contrário de enforcement textual que a IA pode ignorar, os **PreToolUse Hooks** executam no nível do sistema:

```
IA solicita ferramenta (Edit/Write/Bash)
           ↓
Hook nemesis-pretool-check.sh intercepta
           ↓
Validação headless (sem interação com IA)
           ↓
Exit code 2 = Bloqueio técnico | 0 = Permissão
```

**Resultado:** Impossível pular etapas de validação.

## Estrutura

```
system_prompt_rules-workflows/
├── .windsurf/
│   ├── rules/              # 11 regras operacionais
│   │   ├── rule-main-rules.md      # Regra mestre
│   │   ├── origin-rules.md         # Filosofia do projeto
│   │   ├── API-convention.md       # Padrões BFF
│   │   ├── typescript-typing-convention.md
│   │   ├── react-hooks-patterns-rules.md
│   │   └── ui-separation-convention.md
│   └── workflows/          # Workflows com PreToolUse hooks
│       ├── workflow-main.md
│       ├── audit-create-pr.md
│       ├── generate-prompt-rag.md
│       └── auditoria-de-conformidade.md
├── src/workflow-enforcement/
│   ├── cli/
│   │   ├── pretool-hook.ts      # Entry point hooks
│   │   ├── install-hooks.js     # Instalador
│   │   └── test-all-workflows.ts
│   ├── workflow-enforcer.ts     # Validador headless
│   └── workflow-validators.ts
└── Feature-Documentation/
    ├── PR/                 # Pull Requests documentados
    ├── issues/             # Registro de problemas
    └── prompts/            # Prompts estruturados
```

## Instalação

### Via NPM (Recomendado)

```bash
npx install-nemesis
```

O instalador configura automaticamente:
- Estrutura `.windsurf/` com regras e workflows
- Hooks PreToolUse em `.nemesis/hooks/`
- Vercel Agent Skills (pré-requisito)

### Manual

1. Copie `.windsurf/` para seu projeto
2. Instale Agent Skills:
   ```bash
   npx add-skill vercel-labs/agent-skills
   ```
3. Verifique instalação:
   ```bash
   bun run nemesis:install-hooks
   ```

## Comandos

```bash
# Testar workflows
bun run nemesis:test

# Validar workflow específico
bun run nemesis:validate <caminho>

# Verificar hooks
bun run nemesis:install-hooks

# Executar com enforcement
bun run nemesis:enforce <workflow>
```

## Fluxo de Trabalho

```
Pedido informal
      ↓
/generate-prompt-rag  →  Prompt técnico congelado
      ↓
Leitura obrigatória de @.windsurf/rules/rule-main-rules.md
      ↓
Planejamento → Aprovação humana → Execução
      ↓
/audit-create-pr  →  Validação + PR
```

## Workflows Principais

| Workflow | Propósito |
|----------|-----------|
| `workflow-main` | Protocolo principal de execução |
| `generate-prompt-rag` | Converter informal → técnico |
| `audit-create-pr` | Validação completa + criação de PR |
| `auditoria-de-conformidade` | Análise arquitetural |

## Regras Operacionais

- **rule-main-rules.md**: Tabela de decisão (Bugfix/Refactor/Feature/Docs)
- **origin-rules.md**: Filosofia da governança explícita
- **API-convention.md**: Padrão Backend-for-Frontend
- **typescript-typing-convention.md**: Centralização de tipos
- **react-hooks-patterns-rules.md**: Anti-patterns proibidos

## Filosofia

> **"Qualidade é inegociável. Regras rígidas são mecanismos que tornam velocidade sustentável."**

As regras existem porque a alternativa (regras fracas, dependência de bom senso) gera entropia e dívida técnica.

## Benefícios

- **80% acerto** (meta 90%) - excepcional para IA
- **Zero alucinações** em produção
- **Previsibilidade total** - mesmo comportamento sempre
- **Governança shift-left** - problemas bloqueados antes

## Paradigma

**Constraint-Based Orchestration:** Engenharia de prompt defensiva com:
- Negative Prompting: "NUNCA faça X"
- Constraint-Based Generation: Restrições rígidas
- Template Enforcement: Estrutura fixa
- Validation Layers: Verificação múltipla

## Primeiros Passos

1. Explore `@.windsurf/rules/origin-rules.md`
2. Execute `/generate-prompt-rag`
3. Submeta com `@.windsurf/rules/rule-main-rules.md`
4. Valide com `/audit-create-pr`

---

*Workflow Orchestration Framework para governança determinística de IA em desenvolvimento de software*

