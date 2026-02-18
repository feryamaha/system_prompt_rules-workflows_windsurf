# Nemesis Framework v2.0 – Governance Enterprise para IA-Assisted Development

> **Workflow Orchestration com Enforcement Determinístico + Smart Components Detection + Auto-Fix Violations**

## Visão Geral

O **Nemesis Framework v2.0** é um sistema de governança enterprise que estabelece regras inegociáveis e enforcement determinístico para integração de IA no ciclo de desenvolvimento.

### Novidades v2.0
- **Smart Components Detection**: Identifica automaticamente componentes com lógica embutida
- **Auto-Fix Violations**: Corrige automaticamente problemas de React Hooks e UI/UX
- **Cobertura 85%**: Detecta e previne a maioria dos problemas listados
- **Componentes Smart**: Isenção automática para componentes marcados com `// SMART COMPONENT`
- **Workflows Automatizados**: Operação completa com validação e correção

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
   - Rodar hooks de validação via `// turbo`
   - Respeitar resultado (bloquear se falhar)
   - NUNCA pular validações
        ↓
3. EXECUÇÃO SEQUENCIAL DAS INSTRUÇÕES
   - Seguir ordem exata das etapas
   - Pedir permissão para modificações
   - NUNCA criar atalhos ou pular etapas
```

### Novos Workflows v2.0

| Workflow | Função | Status |
|----------|--------|--------|
| **workflow-main.md** | Protocolo principal de execução | Atualizado |
| **generate-prompt-rag.md** | Converter informal → técnico | Atualizado |
| **audit-create-pr.md** | Validação + criação de PR | Atualizado |
| **detect-smart-components.md** | Detectar componentes smart automaticamente | NOVO |
| **auto-fix-violations.md** | Corrigir violações automaticamente | NOVO |
| **nemesis-training-workflow.md** | Retreinamento completo da IA | Implementado |

### Novas Validações v2.0

| Tipo de Problema | Bloqueio Direto | Detecção | Prevenção | Correção Auto |
|------------------|----------------|----------|-----------|--------------|
| **Governança** | 100% | Sim | Sim | Sim |
| **Segurança** | 95% | Sim | Sim | Sim |
| **React Hooks** | 90% | Sim | Sim | Sim |
| **UI/UX** | 85% | Sim | Parcial | Sim |
| **Configuração** | 80% | Sim | Parcial | Sim |

## Componentes Smart Detection

### O que são Componentes Smart

Componentes smart são componentes que **precisam combinar UI e lógica** por natureza de sua responsabilidade:

#### Métodos de Detecção
1. **COMENTÁRIO OBRIGATÓRIO**: `// SMART COMPONENT` no topo (MÉTODO PRINCIPAL)
2. **Nomenclatura opcional**: "Smart", "Control", "Manager" (apenas legibilidade)
3. **Lista manual**: `.nemesis/smart-components.json`
4. **Componentes conhecidos**: Button, Container, InputPesquisaAjuda

#### Permissões Concedidas
- `useState/useEffect` para estado interno
- Lógica de validação diretamente no componente
- CSS inline apenas quando necessário para comportamento dinâmico
- Tipagem inline para props complexas
- Múltiplos hooks quando justificado

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

Qualidade é inegociável. Regras rígidas são mecanismos que tornam velocidade sustentável.

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

