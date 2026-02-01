## PEDIDO
Criar sistema de dupla proteção contra desobediência de IA: Workflow Enforcement Engine (prevenção) + just-bash sandbox (contenção) para eliminar erros de execução e dívida técnica

## PROBLEMA  
IA frequentemente ignora workflows, pula etapas obrigatórias, lê regras mas não segue, e executa ações não planejadas, gerando dívida técnica e exigindo auditoria humana 100% do tempo

## DETALHES DA SOLICITAÇÃO
- Contexto: Sistema de governança IA com workflows existentes (@[.windsurf/workflows/audit-create-pr.md], @[.windsurf/workflows/generate-prompt-rag.md])
- Problemas observados: IA ignora etapas, edita arquivos sem permissão, cria dívida técnica
- Histórico: Issues documentadas em @[Feature-Documentation/issues/issues-projeto-cliente/23_issue-workflow-failure-analysis.md]

## TIPOS DE REGRAS IGNORADAS PELA IA (BASEADO EM ISSUES REGISTRADAS)

### 1. Regras de Tipagem (typescript-typing-convention.md)
- **Proibição de any**: IA usa any mesmo sabendo que é proibido (Issue #14)
- **Centralização de tipos**: Cria tipos inline em vez de usar src/types/
- **Import via import type**: Ignora padrão de imports tipados

### 2. Regras de React Hooks (react-hooks-patterns-rules.md)
- **Controle de estado pai-filho**: Cria estado local quando controle já existe no pai (Issue #15)
- **Padrões de estado**: Implementa fluxo de estado incorreto mesmo conhecendo regras
- **Hooks condicionais**: Tenta colocar hooks dentro de condicionais

### 3. Regras de Fluxo de Workflow (rule-main-rules.md)
- **Hierarquia de leitura**: Pula etapas obrigatórias de leitura de regras (Issue #23)
- **Sequência de execução**: Ignora ordem estabelecida de investigação → planejamento → execução
- **Permissão obrigatória**: Edita arquivos sem solicitar permissão do usuário

### 4. Regras de Separação UI vs Lógica (ui-separation-convention.md)
- **Lógica em componentes UI**: Adiciona estado complexo em componentes que deveriam ser puros
- **Separação de responsabilidades**: Mistura apresentação com controle de negócio

### 5. Regras de Processo Sistemático (origin-rules.md)
- **Análise de contexto existente**: Implementa sem investigar padrões já existentes
- **Qualidade > velocidade**: Prioriza "resolver rápido" sobre seguir regras rigorosamente
- **Gap compreensão vs execução**: Lê regra mas executa ação contrária

### 6. Regras de Codificação (markdown-standards.md) - DEMONSTRAÇÃO PRÁTICA
- **Codificação UTF-8**: IA ignora encoding especificado mesmo conhecendo regra
- **Preservação de acentos**: Gera caracteres corrompidos (ex: any vira ny)
- **Comandos PowerShell**: Não segue exatamente padrão estabelecido
- **Encoding na fonte**: Problema está na geração do conteúdo, não no comando de escrita

## SOLUÇÃO DESEJADA
- Workflow Enforcement Engine para prevenir falhas sistêmicas de não executar as intruções declaradas nos workflows.
- just-bash para conter falhas residuais de execução (https://github.com/vercel-labs/just-bash)
- Tecnologias: TypeScript, Node.js, just-bash, sistema de permissões
- Expectativa: Camada de prevenção forçar sequência + camada de contenção isolar erros residuais

## REGRA A SER SEGUIDA
@[.windsurf/rule-main-rules.md]

## CONSULTAR JUST-BASH
https://github.com/vercel-labs/just-bash
