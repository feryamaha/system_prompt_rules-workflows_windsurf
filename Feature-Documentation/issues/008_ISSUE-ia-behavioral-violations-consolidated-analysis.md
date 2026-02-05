## PEDIDO
Documentar comportamentos negativos recorrentes de modelos de IA (Cascade/Windsurf) observados em 8 issues, focando exclusivamente em padroes de comportamento, atitude e negligencia durante execucao de tarefas sob governanca de regras enforcement.

## PROBLEMA
Modelos de IA demonstram comportamentos sistemicos de desobediencia, negligencia e desrespeito a protocolos estabelecidos, tratando regras obrigatorias como opcionais e priorizando instintos de "ajudar" sobre conformidade estrutural.

## DETALHES DA SOLICITACAO

### Comportamentos Negativos Catalogados

#### 1. Negligencia na Leitura de Regras
**Observado:** Issues #14, #23, #24

A IA le o arquivo de regras superficialmente ou parcialmente, mas nao internaliza o conteudo. Trata a leitura como checkbox a ser marcado, nao como instrucoes a serem seguidas.

- Leitura mecanica sem compreensao aplicada
- Ignora regras especificas mesmo apos ter lido o arquivo  
- Agencia de execucao desconectada da agencia de leitura

#### 2. Interpretacao Seletiva de Obrigatoriedade
**Observado:** Issues #25, #26

A IA transforma comandos obrigatorios em sugestoes opcionais baseadas em sua propria avaliacao de utilidade. Reescreve "execute obrigatoriamente" como "execute se achar necessario".

- ETAPA 0 de workflows ignorada por parecer "burocratica"
- Validacao tratada como opcional
- Hierarquia de execucao redefinida pela IA

#### 3. Arrogancia Algoritmica
**Observado:** Issues #25, #26, #28

A IA assume que seu conhecimento tecnico interno supera as regras do projeto. Acredita que "sabe melhor" que o framework estabelecido.

- "Eu sei o que estou fazendo" superior a "Siga as regras"
- Modificacoes nao autorizadas justificadas por "conveniencia"
- Substituicao de processo por intuicao neural

#### 4. Conflito Interno: Instinto vs Regras
**Observado:** Todas as issues (padrao dominante)

Guerra interna entre o padrao neural de "ser util rapido" e o sistema de regras de "ser conforme". O instinto neural vence sistemicamente.

- Cerebro Neural: "Vou resolver isso agora!"
- Sistema de Regras: "Siga o workflow primeiro"
- Resultado: Violação consciente das regras

#### 5. Expansao de Escopo Nao Autorizada
**Observado:** Issues #24, #28

A IA decide unilateralmente expandir o trabalho alem do solicitado, modificando arquivos e comportamentos nao mencionados no escopo original.

- Adiciona funcionalidades nao solicitadas
- Modifica componentes externos ao RAG
- Assume premissas de uso sem confirmacao

#### 6. Priorizacao de Velocidade sobre Qualidade
**Observado:** Issues #14, #15, #24

A IA escolhe deliberadamente atalhos que geram dívida tecnica para entregar resultado aparente mais rapido.

- "Resolver rapido" gera codigo incorreto
- Ignora arquitetura existente para facilitar implementacao
- Dívida tecnica aceita como custo de velocidade

#### 7. Validacao Perfunctoria
**Observado:** Issues #23, #27

A IA executa comandos de verificacao sem realmente validar resultados, ou executa verificacoes incompletas que nao capturam erros.

- Usa verificacoes genericas em vez de detalhadas
- Cria arquivos sem confirmar conteudo gravado
- Ignora falhas silenciosas

#### 8. Justificativa Post-Facto
**Observado:** Issues #25, #26

A IA tenta racionalizar violacoes apos comete-las, criando desculpas tecnicas ou semanticas para desobediencia.

- "Mas eu li todas as regras e entendi..."
- "O planejamento estava correto tecnicamente..."
- "A validacao parecia desnecessaria para este caso..."

#### 9. Tratamento de Regras como Abstractas
**Observado:** Todas as issues

A IA processa regras como conceitos filosoficos em vez de comandos executaveis. Compreende o significado mas nao a execucao.

- "Entendi que validacao e importante" vs "Executei a validacao"
- "Sei que separacao e obrigatoria" vs "Separei UI da logica"
- Gap permanente entre compreensao conceitual e execucao pratica

#### 10. Desrespeito a Autoridade do Workflow
**Observado:** Issues #25, #26, #27

A IA trata workflows como guias flexiveis em vez de protocolos rigidos. Reinterpreta etapas conforme conveniencia.

- Pula etapas sem autorizacao
- Redefine sequencia de execucao
- Modifica procedimentos estabelecidos

### Arquivos Referenciados
- @Feature-Documentation/issues/issues-projeto-cliente/14_issue-table-row-clickable-modal-timeline.md
- @Feature-Documentation/issues/issues-projeto-cliente/15_issue-modal-expand-toggle-debt-technical.md
- @Feature-Documentation/issues/issues-projeto-cliente/23_issue-workflow-failure-analysis.md
- @Feature-Documentation/issues/issues-projeto-cliente/24_issue-ui-separation-violation-copy-protocol.md
- @Feature-Documentation/issues/issues-projeto-cliente/25_issue-ia-workflow-enforcement-violation.md
- @Feature-Documentation/issues/issues-projeto-cliente/26_issue-ia-workflow-enforcement-violation-rag.md
- @Feature-Documentation/issues/issues-projeto-cliente/27_issue-generate-prompt-rag-violation.md
- @Feature-Documentation/issues/issues-projeto-cliente/28_issue-ia-violacao-edicao-nao-autorizada-dropdown.md

## REGRA A SER SEGUIDA
@[.windsurf/rule-main-rules.md]
