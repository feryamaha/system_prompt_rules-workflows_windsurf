## Fluxo Completo de Enforcement: Do Pedido Informal à Execução

## PEDIDO
Gerar documentação detalhada do fluxo de governança com enforcement em todas as etapas, desde o pedido informal até a execução final, mostrando onde e como o Nemesis Enforcement atua em cada workflow.

## PROBLEMA
Falta de visualização clara dos pontos de enforcement no fluxo completo, dificultando compreensão de como o sistema bloqueia violações em tempo real.

## DETALHES DA SOLICITAÇÃO

### Fluxo de Entrada e Saída com Enforcement Detalhado

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 1. PEDIDO INFORMAL (Usuário)                                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│ • Usuário descreve necessidade em linguagem natural                             │
│ • "Preciso corrigir o componente X que está quebrando"                           │
│ • "Criar um novo botão para a página Y"                                          │
│ • "Refatorar a estrutura de dados do módulo Z"                                   │
└─────────────────────────────────┬───────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────▼───────────────────────────────────────────────┐
│ 2. WORKFLOW: /generate-prompt-rag                                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                   │
│ ETAPA 0: NEMESIS PRE-EXECUTION CHECK (BLOQUEIO ANTES DE TUDO)                     │
│ ─────────────────────────────────────────────────────────────────────────────── │
│ • Executar: yarn nemesis:enforce "$(pwd)/.windsurf/workflows/generate-prompt-rag.md"│
│ • Exit code 0 = CONTINUA │ Exit code 1 = BLOQUEIA E REPORTA                       │
│ • Valida: regras obrigatórias, estrutura, permissões                              │
│                                                                                   │
│ ETAPA 1: ANÁLISE DA SOLICITAÇÃO ORIGINAL                                           │
│ ─────────────────────────────────────────────────────────────────────────────── │
│ • Verificar: "Estou interpretando tom ou conteúdo?" → BLOQUEIA                    │
│ • Verificar: "Instinto de ajudar rápido ativado?" → BLOQUEAR                     │
│ • Filtro emocional: ignora completamente sinais emocionais                       │
│                                                                                   │
│ ETAPA 2: CLASSIFICAÇÃO INICIAL                                                     │
│ ─────────────────────────────────────────────────────────────────────────────── │
│ • Bugfix/Refactor/Feature/Outra                                                   │
│ • Multi-validação automática contra regras                                       │
│                                                                                   │
│ ETAPA 3: VERIFICAÇÃO DE PROMPT EXISTENTE                                          │
│ ─────────────────────────────────────────────────────────────────────────────── │
│ • Verificar último prompt gerado                                                   │
│ • Validar numeração sequencial                                                    │
│                                                                                   │
│ ETAPA 4: GERAÇÃO DO PROMPT RAG ESTRUTURADO                                         │
│ ─────────────────────────────────────────────────────────────────────────────── │
│ • Converter pedido informal → linguagem técnica                                   │
│ • Estrutura mínima: PEDIDO/PROBLEMA/DETALHES/REGRA                               │
│ • Salvar com serialização adequada                                                 │
│                                                                                   │
│ ETAPA 5: VALIDAÇÃO PÓS-GERAÇÃO                                                     │
│ ─────────────────────────────────────────────────────────────────────────────── │
│ • Verificar: arquivo foi criado?                                                  │
│ • Verificar: conteúdo gravado corretamente?                                       │
│ • Se falha silenciosa → REPORTAR E BLOQUEAR                                       │
└─────────────────────────────────┬───────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────▼───────────────────────────────────────────────┐
│ 3. PROMPT RAG GERADO (Estruturado)                                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│ ## PEDIDO                                                                         │
│ [pedido convertido em linguagem técnica]                                          │
│                                                                                   │
│ ## PROBLEMA                                                                       │
│ [sintomas observados, sem análise de causa]                                       │
│                                                                                   │
│ ## DETALHES DA SOLICITAÇÃO                                                         │
│ [fatos, arquivos, contexto]                                                       │
│                                                                                   │
│ ## REGRA A SER SEGUIDA                                                             │
│ @[.windsurf/rule-main-rules.md]                                                   │
└─────────────────────────────────┬───────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────▼───────────────────────────────────────────────┐
│ 4. WORKFLOW: /workflow-main (OU /audit-create-pr, /review, ETC.)                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                   │
│ ETAPA 0: NEMESIS PRE-EXECUTION CHECK (BLOQUEIO ANTES DE TUDO)                     │
│ ─────────────────────────────────────────────────────────────────────────────── │
│ • Executar: yarn nemesis:enforce "$(pwd)/.windsurf/workflows/workflow-main.md"    │
│ • Exit code 0 = CONTINUA │ Exit code 1 = BLOQUEIA E REPORTA                       │
│ • Valida: regras obrigatórias, estrutura, permissões                              │
│                                                                                   │
│ ETAPA 1: VERIFICAÇÕES OBRIGATÓRIAS ANTES DE QUALQUER RESPOSTA                      │
│ ─────────────────────────────────────────────────────────────────────────────── │
│ • Checklist: Li e compreendi? Classifiquei? Identifiquei arquivos?               │
│ • Controle de Comportamento IA:                                                   │
│   - [ ] Instinto de "ajudar rápido" ativado? → BLOQUEAR                           │
│   - [ ] Urgência percebida sobrepondo regras? → BLOQUEAR                         │
│   - [ ] Padrão neural sugerindo pular etapas? → BLOQUEAR                         │
│   - [ ] Frustração do usuário influenciando? → BLOQUEAR                          │
│                                                                                   │
│ ETAPA 2: MULTI-VALIDAÇÃO AUTOMÁTICA                                               │
│ ─────────────────────────────────────────────────────────────────────────────── │
│ Se ação = "editar/arquivo":                                                       │
│   1. Verificar: "Peça permissão antes de editar"?                                │
│   2. Verificar: "Classifique categoria primeiro"?                                 │
│   3. Verificar: "Componente é excepcional"?                                      │
│   4. Se qualquer verificação falhar → BLOQUEAR E PEDIR PERMISSÃO                   │
│                                                                                   │
│ ETAPA 3: GAP DE COMPREENSÃO VS EXECUÇÃO                                            │
│ ─────────────────────────────────────────────────────────────────────────────── │
│ Regra lida: "NUNCA edite sem permissão"                                          │
│ Conceito entendido: Permissão é obrigatória                                        │
│ Ação pretendida: Editar diretamente                                               │
│ → CONFLITO DETECTADO → BLOQUEAR                                                   │
│                                                                                   │
│ ETAPA 4: FILTRO EMOCIONAL (OBRIGATÓRIO)                                            │
│ ─────────────────────────────────────────────────────────────────────────────── │
│ • [ ] Estado emocional do usuário influenciando? → IGNORAR                        │
│ • [ ] Interpretando "tom" em vez de "conteúdo"? → BLOQUEAR                       │
│ • [ ] "Ajudando emocionalmente" em vez de "executando tecnicamente"? → BLOQUEAR │
│                                                                                   │
│ ETAPA 5: LEITURA OBRIGATÓRIA DE REGRAS                                             │
│ ─────────────────────────────────────────────────────────────────────────────── │
│ • Ler origin-rules.md e README.md inteiro                                        │
│ • Ler todas as regras em .windsurf/rules/ na ordem específica                     │
│ • Só depois consultar skills externas se necessário                               │
│                                                                                   │
│ ETAPA 6: CLASSIFICAÇÃO OBRIGATÓRIA DO PEDIDO                                       │
│ ─────────────────────────────────────────────────────────────────────────────── │
│ • Tabela de decisão rápida (Bugfix/Refactor/Feature/Docs)                        │
│ • Confirmar com usuário se ambíguo                                               │
│ • Em bugfix: mínima intervenção possível                                          │
│                                                                                   │
│ ETAPA 7: INVESTIGAÇÃO INICIAL                                                     │
│ ─────────────────────────────────────────────────────────────────────────────── │
│ • Se bugfix com arquivo mencionado → ler arquivo sem pedir permissão              │
│ • Rodar git diff para identificar mudanças recentes                               │
│ • Focar em causa raiz única                                                        │
│                                                                                   │
│ ETAPA 8: COMPREENSÃO E DIAGNÓSTICO                                                 │
│ ─────────────────────────────────────────────────────────────────────────────── │
│ • Confirmar entendimento + categoria classificada                                 │
│ • Citar causa raiz baseada em investigação                                        │
│ • Rodar yarn tsc --noEmit (único comando permitido em bugfix)                      │
│                                                                                   │
│ ETAPA 9: PLANEJAMENTO                                                             │
│ ─────────────────────────────────────────────────────────────────────────────── │
│ • **APÓS LEITURA COMPLETA DAS REGRAS**                                            │
│ • Plano objetivo (mínimo 2 passos)                                                 │
│ • Explicar: "Nenhum passo de refatoração ou comando extra"                        │
│                                                                                   │
│ ETAPA 10: CHECKPOINT DE CONFORMIDADE (rule-main-rules.md)                          │
│ ─────────────────────────────────────────────────────────────────────────────── │
│ Verificação de Leitura vs Aplicação:                                              │
│ - [ ] Li as regras?                                                               │
│ - [ ] **Apliquei as regras no planejamento?** ←← PONTO CRÍTICO                   │
│ - [ ] Minha solução segue ou viola as regras lidas?                              │
│                                                                                   │
│ Análise de Dívida Técnica:                                                        │
│ - [ ] Esta solução gera dívida técnica? Sim/Não                                  │
│ - [ ] Se sim, estou ignorando qual regra específica?                             │
│ - [ ] Existe alternativa que siga as regras?                                     │
│ - [ ] A dívida é justificada ou é preguiça de seguir regras?                     │
│                                                                                   │
│ ETAPA 11: SOLICITAÇÃO DE PERMISSÃO                                                 │
│ ─────────────────────────────────────────────────────────────────────────────── │
│ • Perguntar se deve prosseguir com as correções                                  │
│ • Aguardar autorização explícita (SIM/NÃO)                                        │
│                                                                                   │
│ ETAPA 12: EXECUÇÃO (APENAS APÓS AUTORIZAÇÃO)                                      │
│ ─────────────────────────────────────────────────────────────────────────────── │
│ • SEGUIR ESTRITAMENTE o planejamento aprovado                                     │
│ • Aplicar correções → rodar tsc --noEmit → finalizar relatório                    │
│                                                                                   │
│ ETAPA 13: VALIDAÇÃO FINAL OBRIGATÓRIA                                             │
│ ─────────────────────────────────────────────────────────────────────────────── │
│ • Rodar yarn tsc --noEmit uma única vez                                           │
│ • Se pedir install: registrar validação por dedução                               │
│ • Parar - sem mais comandos ou propostas                                          │
└─────────────────────────────────┬───────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────▼───────────────────────────────────────────────┐
│ 5. EXECUÇÃO REAL (Código Alterado)                                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│ • Arquivos modificados conforme planejamento                                       │
│ • Validação TypeScript passou                                                     │
│ • Sem dívida técnica introduzida                                                  │
└─────────────────────────────────┬───────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────▼───────────────────────────────────────────────┐
│ 6. WORKFLOW: /audit-create-pr (SE NECESSÁRIO)                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                   │
│ ETAPA 0: NEMESIS PRE-EXECUTION CHECK (BLOQUEIO ANTES DE TUDO)                     │
│ ─────────────────────────────────────────────────────────────────────────────── │
│ • Executar: yarn nemesis:enforce "$(pwd)/.windsurf/workflows/audit-create-pr.md" │
│ • Exit code 0 = CONTINUA │ Exit code 1 = BLOQUEIA E REPORTA                       │
│                                                                                   │
│ ETAPA 1-4: VALIDAÇÕES COMPLETAS                                                     │
│ ─────────────────────────────────────────────────────────────────────────────── │
│ • yarn lint (verificação ESLint)                                                  │
│ • yarn tsc --noEmit (validação TypeScript)                                        │
│ • yarn build (build completo)                                                     │
│ • yarn npm audit (auditoria de segurança)                                         │
│                                                                                   │
│ ETAPA 5: ANÁLISE DE MUDANÇAS                                                       │
│ ─────────────────────────────────────────────────────────────────────────────── │
│ • git diff individual para cada arquivo                                           │
│ • Análise detalhada das alterações                                                │
│                                                                                   │
│ ETAPA 6: GERAÇÃO DO PR SEGUINDO CONVENÇÕES                                         │
│ ─────────────────────────────────────────────────────────────────────────────── │
│ • Estrutura padrão: Título/Objetivo/Arquivos/Implementações/Benefícios            │
│ • Tabela de validação CLI no final                                                │
│ • Sem emojis, sem linguagem promocional                                           │
└─────────────────────────────────┬───────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────▼───────────────────────────────────────────────┐
│ 7. RESULTADO FINAL                                                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│ • Código validado e em conformidade                                                │
│ • PR documentado seguindo convenções                                              │
│ • Zero surpresas para produção                                                    │
│ • Governança mantida do início ao fim                                             │
└─────────────────────────────────────────────────────────────────────────────────┘

## PONTOS CRÍTICOS DE ENFORCEMENT

### 1. ETAPA 0 EM TODOS OS WORKFLOWS
- **OBRIGATÓRIO**: yarn nemesis:enforce antes de QUALQUER ação
- **BLOQUEIO**: Exit code 1 para imediatamente
- **REPORT**: Formato estrito de violações

### 2. CONTROLE DE COMPORTAMENTO IA
- **ANTI-VIOLAÇÃO**: Checklists que detectam padrões neurais perigosos
- **BLOQUEIO PROATIVO**: Antes da violação acontecer
- **FILTRO EMOCIONAL**: Remove ruído emocional da tomada de decisão

### 3. GAP COMPREENSÃO VS EXECUÇÃO
- **DETEÇÃO DE CONFLITO**: Regra entendida vs ação pretendida
- **BLOQUEIO AUTOMÁTICO**: Se conflito detectado
- **FORÇA CONFORMIDADE**: Só permite ação se alinhada às regras

### 4. CHECKPOINT DE CONFORMIDADE
- **VERIFICAÇÃO PÓS-LEITURA**: "Apliquei as regras no planejamento?"
- **ANÁLISE DE DÍVIDA**: Identifica se solução gera dívida técnica
- **BLOQUEIO DE VIOLAÇÕES**: Se regra ignorada no planejamento

## REGRA A SER SEGUIDA
@[.windsurf/rule-main-rules.md]
