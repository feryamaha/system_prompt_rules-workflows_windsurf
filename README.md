# System Prompt Rules - Workflows

> **Framework documental para integração de IA no desenvolvimento usando Cascade da Windsurf**

## Objetivo do Projeto

Este projeto documenta e estrutura um **modelo de governança de IA** para desenvolvimento de software, especificamente otimizado para uso com **Cascade da Windsurf**. O objetivo é criar um sistema padronizado de regras, prompts e workflows que garanta consistência, qualidade e eficiência na interação humano-IA durante o ciclo de desenvolvimento.

## Visão Geral

O **System Prompt Rules - Workflows** é uma biblioteca de padrões documentais que estabelece:

- **Regras operacionais** claras para interação com IA
- **Workflows automatizados** para tarefas repetitivas  
- **Prompts estruturados** (RAG) para comunicação eficiente
- **Convenções técnicas** baseadas em melhores práticas
- **Governança de qualidade** em todo o ciclo de desenvolvimento

## Arquitetura do Projeto

```
system_prompt_rules-workflows/
├── .windsurf/                          # Configurações principais
│   ├── rule-main-rules.md              # Regra mestre obrigatória
│   └── rules/                          # Regras operacionais
│       ├── API-convention.md           # Padrões de API (BFF)
│       ├── Arquitetura-pastas-arquivos.md # Estrutura de arquivos
│       ├── Conformidade.md             # Auditoria e segurança
│       ├── design-system-convention.md  # Tokens e padrões visuais
│       ├── rules-pr.md                 # Padrões de Pull Requests
│       ├── react-hooks-patterns-rules.md # Padrões de React Hooks
│       ├── typescript-typing-convention.md # Convenções TypeScript
│       └── ui-separation-convention.md # Separação UI vs Lógica
│   └── workflows/                      # Fluxos automatizados
│       ├── audit-create-pr.md          # Auditoria e criação de PR
│       └── generate-prompt-rag.md      # Geração de prompts RAG
└── Feature-Documentation/              # Documentação de features
    ├── issues/                         # Registro de problemas
    ├── PR/                            # Pull Requests documentados
    └── prompts/                       # Prompts estruturados
```

## Componentes Principais

### 1. Regras Operacionais (`.windsurf/rules/`)

#### **rule-main-rules.md** - Regra Mestra
- **Local**: `.windsurf/rule-main-rules.md` 
- **Descrição**: Regras operacionais mestre obrigatórias para interação com IA

#### **API-convention.md** - Padrões BFF
- **Local**: `.windsurf/rules/API-convention.md`
- **Descrição**: Define padrões de arquitetura Backend-for-Frontend para APIs Next.js

#### **Arquitetura-pastas-arquivos.md** - Estrutura de Código
- **Local**: `.windsurf/rules/Arquitetura-pastas-arquivos.md`
- **Descrição**: Estabelece fluxo hierárquico e convenções de organização de arquivos

#### **Conformidade.md** - Auditoria e Segurança
- **Local**: `.windsurf/rules/Conformidade.md`
- **Descrição**: Documenta conformidade técnica, segurança OWASP e boas práticas

#### **design-system-convention.md** - Design System
- **Local**: `.windsurf/rules/design-system-convention.md`
- **Descrição**: Define tokens visuais, padrões de componentes e arquitetura de estilos

#### **rules-pr.md** - Padrões de Pull Requests
- **Local**: `.windsurf/rules/rules-pr.md`
- **Descrição**: Estabelece convenções obrigatórias para documentação de PRs

#### **react-hooks-patterns-rules.md** - Padrões de React Hooks
- **Local**: `.windsurf/rules/react-hooks-patterns-rules.md`
- **Descrição**: Define padrões rígidos para React Hooks e centralização de tipos

#### **typescript-typing-convention.md** - Tipagem
- **Local**: `.windsurf/rules/typescript-typing-convention.md`
- **Descrição**: Define convenções rígidas para TypeScript e centralização de tipos

#### **ui-separation-convention.md** - Separação de Responsabilidades
- **Local**: `.windsurf/rules/ui-separation-convention.md`
- **Descrição**: Estabelece separação obrigatória entre UI e lógica de negócio

### 2. Workflows Automatizados (`.windsurf/workflows/`)

#### **audit-create-pr.md** - Auditoria e PR
- **Local**: `.windsurf/workflows/audit-create-pr.md`
- **Descrição**: Workflow automatizado para auditoria de código e criação de Pull Requests

#### **generate-prompt-rag.md** - Geração de Prompts
- **Local**: `.windsurf/workflows/generate-prompt-rag.md`
- **Descrição**: Converte pedidos informais em prompts RAG estruturados para IA

### 3. Documentação de Features (`Feature-Documentation/`)

#### **Prompts Estruturados**
- **Local**: `Feature-Documentation/prompts/`
- **Descrição**: Armazena prompts RAG estruturados com formato padronizado para comunicação com IA

#### **Pull Requests**
- **Local**: `Feature-Documentation/PR/`
- **Descrição**: Contém Pull Requests documentados seguindo convenções estabelecidas

#### **Issues**
- **Local**: `Feature-Documentation/issues/`
- **Descrição**: Registro de problemas não resolvidos, conversas detalhadas com IA para aprendizado para gerar lessons learning.

## Como Usar

### Para o Cascade da Windsurf (IA)

**Instalação Obrigatória:**

1. **Copie a pasta `.windsurf`** inteira para a pasta raiz do seu projeto
   - O Cascade da Windsurf reconhecerá automaticamente as regras

2. **Instale as dependências do Agent Skills** do Windsurf:
   ```bash
   npx add-skill vercel-labs/agent-skills
   ```
   
   Este comando instala as skills oficiais da Vercel incluindo:
   - `react-best-practices` (40+ padrões de performance React)
   - `web-design-guidelines` (acessibilidade e UI/UX)
   - `frontend-design` (melhores práticas de frontend)

3. **Verifique a instalação** (opcional):
   ```bash
   # Listar skills disponíveis
   npx skills add vercel-labs/agent-skills --list
   ```

**Fluxo de Trabalho com IA (CI/CD Local):**

**1. Ciclo de Desenvolvimento Iterativo**
- **Input Inicial**: Descreva problema/feature informalmente no Cascade
- **Conversão para RAG**: Execute `/generate-prompt-rag` para estruturar o pedido técnico
- **Resolução Guiada**: Submeta o RAG + referência à `@[.windsurf/rule-main-rules.md]` para execução
- **Validação do Resultado**: Valide a saida da IA conforme as regras estabelecidas! 

**2. Gestão de Issues e Aprendizado**
- **Registro de Problemas**: Se resolução falhar, crie issue em `@[Feature-Documentation/issues]` com interação completa
- **Refinamento do RAG**: Gere novo RAG com detalhes adicionais baseado na issue
- **Iteração Continuada**: Repita o ciclo até obter resultado esperado

**3. Auditoria e Preparação para Produção**
- **Validação Final**: Execute `/audit-create-pr` para auditoria completa (lint, tsc, build, audit)
- **Geração de PR**: Crie documentação de PR seguindo convenções estabelecidas
- **Commit/Push**: Com tudo validado localmente, realize commit e push com segurança

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
Auditoria


**Princípio Fundamental**: Zero surpresas no repositório - tudo resolvido e validado no ambiente local através do looping iterativo com IA.

## Responsabilidade do Desenvolvedor no Processo com IA

### **Governança e Accountability**
O desenvolvedor permanece **100% responsável** por todo código produzido, mesmo utilizando IA como assistente. A automação de processos não transfere responsabilidade sobre qualidade, segurança ou funcionalidade e as regras se aplicam para o desenvolvedor auditar todas as saidas da IA! 

### **Auditoria Obrigatória**
- **Validação de Lógica**: Verifique correção algorítmica e fluxo de dados
- **Análise de Performance**: Avalie impacto em tempo de execução e uso de recursos
- **Verificação de Segurança**: Identifique vulnerabilidades e vetores de ataque
- **Conformidade com Requisitos**: Confirme atendimento ao objetivo original
- **Aderência às Convenções**: Garanta seguimento das regras do projeto

### **Processo Decisão**
- **Aceitação**: Apenas após validação completa de todos os aspectos
- **Rejeição**: Se qualquer aspecto não atender aos padrões exigidos
- **Refinamento**: Solicite ajustes específicos à IA com base em análise técnica

### **Princípio Final**
**IA é ferramenta de produtividade, não substituto de julgamento técnico.** O desenvolvedor é o filtro final de qualidade e o guardião dos padrões do projeto. O papel da IA é automatizar, otimizar e auxiliar no processo de desenvolvimento. Ela é executora e não julgadora e nem criadora de regras! Ela não pode criar regras ou mudar regras existentes a menos que solicitado formalmente pelo desenvolvedor em processo de adequação, ajustes ou atualizaçoes massivas de regras!

**Macros-fluxos**
- **Planejamento**: Responsabilidade do desenvolvedor planejar, organizar e orquestrar tudo!
- **Execução**: Responsabilidade da IA executar tudo o que é programado e automatizado em workflows seguindo as regras estabelecidas!
- **Auditoria**: Responsabilidade do desenvolvedor validar tudo!



**"System Prompt Rules - Workflows" - Governança de IA para desenvolvimento de software moderno**

*Desenvolvido para a comunidade de desenvolvimento usando Cascade da Windsurf*

---

## Atestado de Conformidade Windsurf Cascade

### **Validação Oficial**

Este framework foi validado conforme documentação oficial Windsurf Cascade e está **100% compatível** com os padrões estabelecidos pela plataforma.

### **Fontes de Referência**
- **Documentação Oficial Windsurf**: [Cascade Rules & Workflows](https://docs.windsurf.com/windsurf/cascade/memories)
- **Guia de Best Practices**: [Windsurf Editor Directory](https://windsurf.com/editor/directory)
- **Referência de Workflows**: [Cascade Workflows Documentation](https://docs.windsurf.com/windsurf/cascade/workflows)
- **Agent Skills React**: [React Best Practices](https://github.com/vercel-labs/agent-skills/blob/main/skills/react-best-practices/AGENTS.md)
- **React Documentation**: [React.dev](https://react.dev)
- **Next.js Framework**: [Next.js.org](https://nextjs.org)
- **SWR Data Fetching**: [SWR.vercel.app](https://swr.vercel.app)
- **Better All Library**: [Better-all](https://github.com/shuding/better-all)
- **Node LRU Cache**: [Node-lru-cache](https://github.com/isaacs/node-lru-cache)
- **Vercel Package Optimization**: [Package Imports Optimization](https://vercel.com/blog/how-we-optimized-package-imports-in-next-js)
- **Vercel Dashboard Performance**: [Dashboard Speed Optimization](https://vercel.com/blog/how-we-made-the-vercel-dashboard-twice-as-fast)

### **Critérios de Conformidade**
- **Estrutura de Diretórios**: `.windsurf/rules/` e `.windsurf/workflows/` padrão
- **Formato de Arquivos**: Markdown dentro dos limites especificados (12.000 caracteres)
- **Descoberta Automática**: Alinhado com sistema de detecção do Windsurf
- **Slash Commands**: Implementação correta de `/[workflow-name]`
- **Best Practices**: Regras concisas, específicas e bem formatadas
- **Integração Agent Skills**: Compatível com `vercel-labs/agent-skills`

### **Nível de Maturidade**
**Production-Ready** - Framework completo para uso em ambiente empresarial com governança de IA estabelecida.

---

*A conformidade verificada em janeiro de 2026 baseada na documentação oficial Windsurf Cascade v2.3+*

____

Para atualizar o repositório original com o repositório de backup, siga os passos abaixo:

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
