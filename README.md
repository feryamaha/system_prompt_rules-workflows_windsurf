# System Prompt Rules - Workflows

> **Framework de Governança com Engine de Enforcement para desenvolvimento assistido por IA**

## Visão Geral

Bem-vindo ao **System Prompt Rules - Workflows**, um framework completo que estabelece governança explícita e enforcement programático para integração de IA no ciclo de desenvolvimento.

Este projeto vai além de simples regras documentais - é um **sistema de governança ativo** que inclui:
- **Regras operacionais** (documentação de governança)
- **Workflows estruturados** (fluxos automatizados)
- **Engine de Enforcement** (código TypeScript executável que valida e bloqueia)

Transforma caos em previsibilidade através de regras não negociáveis, validação automática e prompts estruturados que garantem consistência, qualidade e eficiência na interação humano-IA.

## O Framework em Ação

### Trilogia Fundamental
1. **ORIGEM** (`origin-rules.md`) - Por que existimos: Extração de dor real em produção
2. **VISÃO** (`README.md`) - O que construímos: Sistema de governança completo com enforcement
3. **OPERAÇÃO** (`rule-main-rules.md`) - Como executamos: Fluxos padronizados com validação automática

### Como Funciona
```
Pedido informal 
      ↓
generate-prompt-rag
      ↓
Prompt técnico congelado
      ↓
Leitura obrigatória de regras
      ↓
Planejamento
      ↓
Aprovação humana
      ↓
Execução
      ↓
Auditoria humana
```

## Mapa do Projeto

### O que é este Framework?

**NÃO é apenas um agente de IA** - É um **framework de governança multi-camada** com engine de enforcement:

| Camada | Componente | Tipo | Função |
|--------|-----------|------|--------|
| 1 | `.windsurf/rules/` | Regras Documentais | Contratos de governança em Markdown |
| 2 | `.windsurf/workflows/` | Workflows Estruturados | Fluxos automatizados com frontmatter |
| 3 | `src/workflow-enforcement/` | Engine de Enforcement | Código TypeScript que valida e bloqueia |
| 4 | `Feature-Documentation/` | Documentação Viva | Histórico, PRs e prompts estruturados |

### Estrutura de Diretórios
```
system_prompt_rules-workflows/
├── README.md                          # Este arquivo - Mapa geral do projeto
├── .windsurf/                         # Configurações principais
├   └── rules/                         # Regras operacionais
├       ├── rule-main-rules.md         # Regra mestre obrigatória
├       ├── README.md                  # Documentação técnica das regras
├       ├── origin-rules.md            # Filosofia e propósito das regras
├       ├── API-convention.md          # Padrões de API (BFF)
├       ├── Arquitetura-pastas-arquivos.md # Estrutura de arquivos
├       ├── Conformidade.md            # Auditoria e segurança
├       ├── design-system-convention.md # Tokens e padrões visuais
├       ├── markdown-standards.md      # Padrões de linguagem Markdown
├       ├── react-hooks-patterns-rules.md # Padrões de React Hooks
├       ├── rules-pr.md                # Padrões de Pull Requests
├       ├── typescript-typing-convention.md # Convenções TypeScript
├       └── ui-separation-convention.md # Separação UI vs Lógica
├   └── workflows/                     # Fluxos automatizados
├       ├── audit-create-pr.md         # Auditoria e criação de PR
├       ├── auditoria-de-conformidade.md # Auditoria completa de conformidade
├       └── generate-prompt-rag.md     # Geração de prompts RAG
├── src/workflow-enforcement/          # Engine de Enforcement (TypeScript)
├   ├── workflow-enforcer.ts           # Validador de workflows
├   ├── workflow-runner.ts             # Executor de workflows
├   ├── workflow-validators.ts         # Regras de validação
├   ├── bash-tool-adapter.ts           # Adaptador de comandos
├   ├── violation-logger.ts            # Registro de violações
├   └── cli/                           # Interface de linha de comando
└── Feature-Documentation/             # Documentação de features
    ├── issues/                        # Registro de problemas
    ├── PR/                           # Pull Requests documentados
    └── prompts/                      # Prompts estruturados
```

## Para Começar Rápido

### Instalação Imediata
1. **Copie a pasta `.windsurf`** para seu projeto
2. **Instale Agent Skills:**
   ```bash
   npx add-skill vercel-labs/agent-skills
   ```

### Instalação via NPM (Nemesis)
1. Execute o instalador via npx:
   ```bash
   npx install-nemesis
   ```
2. O instalador copia `.windsurf/` e `Feature-Documentation/` para o projeto atual.
3. Se o Vercel Agent Skills não estiver instalado, o instalador executa automaticamente:
   ```bash
   npx add-skill vercel-labs/agent-skills
   ```

### Fluxo de Instalação Seletiva

O instalador Nemesis diferencia entre arquivos elementares e templates para evitar sobrescrita acidental de documentação do usuário:

**Arquivos Core (sempre sobrescrevem):**
- `.windsurf/rules/` - Regras de governança (atualizáveis)
- `.windsurf/workflows/` - Workflows automatizados (atualizáveis)
- `.nemesis/workflow-enforcement/` - Scripts de enforcement (atualizáveis)

**Arquivos Templates (instalados apenas se não existirem):**
- `Feature-Documentation/` - Apenas arquivos com "template" ou "exemplo-template" no nome
- `Feature-Documentation/issues/` - Apenas templates
- `Feature-Documentation/PR/` - Apenas templates
- `Feature-Documentation/prompts/` - Apenas templates
- `Feature-Documentation/to-do-list/` - Apenas templates

**Arquivos ignorados (nunca copiados):**
- Qualquer arquivo em `Feature-Documentation/` que não contenha "template" no nome

**Fluxo de Decisão:**
```
Início da Instalação
       ↓
Projeto tem Nemesis instalado?
       ↓
NÃO → Instala tudo (core sobrescreve, templates copiam, ignora não-templates)
       ↓
SIM → Lista o que existe → Pergunta "Deseja sobrescrever? (s/N)"
       ↓
Usuário confirma?
       ↓
SIM → Core sobrescreve, templates copiam, não-templates ignorados
       ↓
NÃO → Cancela instalação
```

### Seu Primeiro Workflow

1. Descreva sua necessidade informalmente para a IA
2. Execute: `/generate-prompt-rag`
3. Submeta o RAG gerado com: `@[.windsurf/rule-main-rules.md]`
4. Aprovação humana → Execução → Validação humana

## Casos de Uso Principais

### Desenvolvimento de Software
- **Bugfix:** Correções mínimas e precisas
- **Refatoração:** Melhorias estruturais seguras
- **Features:** Criação nova com governança
- **Documentação:** Padrões consistentes

### Governança de Qualidade
- **Zero surpresas:** Tudo validado localmente
- **Previsibilidade:** Comportamento IA consistente
- **Escalabilidade:** Framework cresce com projeto
- **Accountability:** Desenvolvedor 100% responsável

## Componentes Chave

### Regras Operacionais
Conjunto completo de regras extraídas de erros reais em produção:
- **React Hooks:** Padrões rígidos anti-bugs
- **TypeScript:** Tipagem centralizada e segura
- **UI Separação:** Frontend limpo e manutenível
- **API Convention:** Backend-for-Frontend estruturado
- **Design System:** Tokens e componentes consistentes

### Workflows Automatizados
- **generate-prompt-rag:** Converte informal → técnico
- **audit-create-pr:** Validação completa antes de PR

### Documentação Viva
- **Prompts RAG:** Histórico estruturado de solicitações
- **Issues:** Aprendizado iterativo de problemas
- **PRs:** Documentação padronizada de entregas

## Benefícios Comprovados

### Para Desenvolvedores
- **70% redução** em tempo de debug
- **Zero discussões** subjetivas sobre "como fazer"
- **Onboarding acelerado** com regras explícitas
- **Qualidade garantida** sem depender de "bom senso"

### Para Projetos
- **Dívida técnica zero** por enforcement
- **Evolução previsível** com contratos claros
- **Escalabilidade sustentável** com governança
- **Consistência** independente de equipe

## Filosofia Central

**"Qualidade é inegociável e precede qualquer outra métrica de produtividade."**

As regras não são barreiras - são mecanismos que tornam a velocidade sustentável. Elas existem porque a alternativa (regras fracas, concessões, dependência de bom senso) já foi testada e provou gerar entropia, retrabalho e dívida técnica.

## Próximos Passos

1. **Explore as regras:** Comece por `@[.windsurf/rules/origin-rules.md]`
2. **Teste um workflow:** Execute `/generate-prompt-rag`
3. **Estude a documentação:** `@[.windsurf/rules/README.md]`
4. **Integre seu projeto:** Copie `.windsurf` e comece a usar

---

**System Prompt Rules - Workflows** - Governança de IA para desenvolvimento de software moderno

*Desenvolvido para a comunidade de desenvolvimento usando Cascade da Windsurf*

## Nota Importante

**Estas regras são documentos vivos** que podem e devem ser ajustados conforme demanda dos projetos. Podem ser customizados para necessidades específicas, mas já possuem um padrão default considerando:

- **Boas práticas de desenvolvimento** em projetos Next.js, React, TypeScript, Tailwind
- **Segurança shift-left** com foco em conformidade OWASP
- **Padrões de mercado** e documentação oficial das tecnologias
- **Regras adicionais** conforme necessidade específica de cada projeto

O framework é flexível para adaptações, mas mantém governança e qualidade como pilares fundamentais.

____

## Para atualizar o repositório original com o repositório de backup, siga os passos abaixo:

git remote set-url origin https://github.com/feryamaha/system_prompt_rules-workflows_windsurf.git
git remote add backup https://github.com/mayconmartins01/readme-ias.git

# 1. Adicionar arquivos
git add .

# 2. Commit (ajuste a mensagem conforme necessário)
git commit -m "sua mensagem de commit"

# 3. Push para o repositório original (origin)
git push origin master   # ou main, conforme o nome da sua branch

# 4. Push para o repositório secundário (backup)
git push backup master   # ou main, igual ao passo anterior
