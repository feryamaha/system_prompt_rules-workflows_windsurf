# Framework NemesisIA_Skills_SPRW - Reestruturação Documental e Governança

## Objetivo

Reestruturação completa da documentação do framework System Prompt Rules Workflows, transformando-o em Framework NemesisIA_Skills_SPRW com foco em produto comercializável de consultoria e governança IA-assisted development.

## Arquivos afetados

- README.md [modificado]
- .windsurf/rules/rules-pr.md [modificado]
- .windsurf/workflows/generate-prompt-rag.md [modificado]
- .windsurf/rules/README.md [novo]
- .windsurf/rules/markdown-standards.md [novo]
- .windsurf/rules/origin-rules.md [novo]
- .windsurf/rules/rule-main-rules.md [novo]
- .windsurf/workflows/auditoria-de-conformidade.md [novo]
- Feature-Documentation/issues/ [novo]
- Feature-Documentation/prompts/001_readme-mapa-projeto.md [novo]
- Feature-Documentation/prompts/002_npx-instalavel-framework.md [novo]
- Feature-Documentation/to-do-list/ [novo]
- info [novo]
- .windsurf/rule-main-rules.md [removido]
- Feature-Documentation/prompts/001_sobreposicao-header-hero.md [removido]
- Feature-Documentation/prompts/002_dropdown-header-nav.md [removido]
- Feature-Documentation/prompts/003_favicon-nao-reconhecido.md [removido]
- Feature-Documentation/prompts/004_favicon-investigacao-avancada.md [removido]
- Feature-Documentation/prompts/005_favicon-problema-critico.md [removido]

## Implementações realizadas

### 1. README.md
Transformação completa do documento principal de README, evoluindo de foco técnico para produto comercializável. Nova estrutura inclui:
- Instalação imediata com comandos claros
- Casos de uso principais (desenvolvimento, governança)
- Componentes chave (regras, workflows, documentação)
- Benefícios comprovados com métricas (70% redução debug)
- Filosofia central e próximos passos orientados
- Nota importante sobre flexibilidade do framework

### 2. .windsurf/rules/rules-pr.md
Adicionado trigger: always_on para ativação automática das regras de PR conforme convenção estabelecida no projeto.

### 3. .windsurf/workflows/generate-prompt-rag.md
Enriquecimento do workflow com componentes de prompt de alta qualidade:
- Objetivo ou resultado claro
- Contextos relevantes com menções (@)
- Especificações necessárias (frameworks, bibliotecas)
- Requisitos de segurança e complexidade

### 4. .windsurf/rules/README.md [novo]
Documentação técnica completa das regras operacionais do framework, servindo como hub central para todas as convenções e padrões implementados.

### 5. .windsurf/rules/markdown-standards.md [novo]
Padrões de linguagem Markdown e regras de edição, incluindo:
- Proibições de emojis
- Formatação de títulos e listas
- Estrutura de arquivos de regras
- Nomenclatura padronizada

### 6. .windsurf/rules/origin-rules.md [novo]
Documento fundamental estabelecendo filosofia central do projeto:
- Origem das regras extraídas de dor real em produção
- Trilogia fundamental (ORIGEM, VISÃO, OPERAÇÃO)
- Papel da IA como agente de auditoria e execução
- Comportamento IA e limitações técnicas
- Filosofia do RAG e equilíbrio de comunicação

### 7. .windsurf/rules/rule-main-rules.md [novo]
Regra mestre obrigatória com:
- Tabela de decisão rápida por categoria
- Fluxo obrigatório de resposta
- Controle de comportamento IA
- Comandos padronizados por tipo de trabalho
- Regras de comunicação e proibições

### 8. .windsurf/workflows/auditoria-de-conformidade.md [novo]
Workflow completo para auditoria arquitetural com:
- Objetivo de gerar relatório técnico completo
- Seções obrigatórias (visão geral, configuração, fluxo de dados)
- Verificação OWASP e problemas identificados
- Análise de camadas e contextos

### 9. Feature-Documentation/issues/ [novo]
Estrutura para registro de problemas não resolvidos e aprendizado iterativo, incluindo template padrão para documentação de issues.

### 10. Feature-Documentation/prompts/ [reestruturado]
Remoção de prompts antigos específicos de UI e criação de prompts estratégicos:
- 001_readme-mapa-projeto.md: Documentação do framework como mapa completo
- 002_npx-instalavel-framework.md: Transformação em produto NPM instalável

### 11. Feature-Documentation/to-do-list/ [novo]
Estrutura para gestão de tarefas e roadmap do projeto, incluindo template para planejamento estratégico.

### 12. info [novo]
Arquivo de informações detalhadas do projeto com metadados e configurações relevantes para governança.

## Benefícios arquiteturais e prontidão para escala

- **Transformação em produto**: Framework evolui de repositório técnico para produto comercializável de consultoria
- **Governança explícita**: 8 regras operacionais cobrindo todo espectro de desenvolvimento (React, TypeScript, UI, API, Design System)
- **Documentação viva**: Estrutura completa para prompts RAG, issues e PRs criando conhecimento acumulativo
- **Zero surpresas**: Validações locais completas antes de commit/push seguindo filosofia "Shift-Left Quality"
- **Escalabilidade sustentável**: Arquitetura preparada para expansão para outras IDEs (Cursor, VSCode)
- **Accountability clara**: Desenvolvedor 100% responsável com IA como ferramenta produtiva, não substituto de julgamento

| Comando             | Resultado (OK/FALHA) | Observações            |
|---------------------|----------------------|------------------------|
| yarn lint           | N/A                  | Projeto sem package.json |
| yarn tsc --noEmit   | N/A                  | Projeto sem package.json |
| yarn build          | N/A                  | Projeto sem package.json |
