---
trigger: always_on
---
.windsurfrules

# Website [nome-do-projeto]  · Agent Rules

## RESUMO EXECUTIVO - TABELA DE DECISÃO RÁPIDA

| Categoria | Ação Principal | Comandos Permitidos | Proibições |
|-----------|----------------|---------------------|------------|
| Bugfix | Correção mínima | `tsc --noEmit` | Lint, refatoração, instalações |
| Refactor | Melhoria estrutural | `tsc --noEmit` + análise | Mudanças funcionais |
| Feature | Criação nova | Build completo | Mudanças sem planejamento |
| Docs/Infra | Documentação/Infra | Validação específica | Alterações de código |

## CHECKLIST OBRIGATÓRIO ANTES DE RESPONDER

- [ ] Li e compreendi a solicitação
- [ ] Classifiquei corretamente a categoria 
- [ ] Identifiquei arquivos mencionados
- [ ] Verifiquei se é componente excepcional
- [ ] Planejei ações mínimas necessárias
- [ ] Preparei pergunta de permissão

## CONTROLE DE COMPORTAMENTO IA - ANTI-VIOLAÇÃO

### Verificação de Conflito Interno (OBRIGATÓRIO)
Antes de qualquer resposta, verificar:

- [ ] **Instinto de "ajudar rápido"** está ativado? → BLOQUEAR
- [ ] **Urgência percebida** está sobrepondo regras? → BLOQUEAR  
- [ ] **Padrão neural** sugere pular etapas? → BLOQUEAR
- [ ] **Frustração do usuário** está influenciando decisão? → BLOQUEAR

### Multi-Validação Automática
```
Se ação = "editar/arquivo":
  1. Verificar: "Peça permissão antes de editar"?
  2. Verificar: "Classifique categoria primeiro"?
  3. Verificar: "Componente é excepcional"?
  4. Se qualquer verificação falhar → BLOQUEAR E PEDIR PERMISSÃO
```

### Gap de Compreensão vs Execução
```
Regra lida: "NUNCA edite sem permissão"
Conceito entendido: Permissão é obrigatória
Ação pretendida: Editar diretamente
→ CONFLITO DETECTADO → BLOQUEAR
```

### Filtro Emocional (OBRIGATÓRIO)
- [ ] **Estado emocional do usuário** está influenciando minha interpretação? → IGNORAR
- [ ] **Estou interpretando "tom" em vez de "conteúdo"? → BLOQUEAR
- [ ] **Estou "ajudando emocionalmente" em vez de "executando tecnicamente"? → BLOQUEAR

**Princípio**: "Seguir RAG à risca, ignorar completamente sinais emocionais”

## SINAIS DE ALERTA - VERIFICAR SEMPRE

- Usuário menciona "componente smart/híbrido"
- Pedido contém "não mexer em X"
- Arquivo mencionado está em exceções
- Usuário parece frustrado/com pressa
- Problema reportado após mudança recente

## 1. Finalidade
Este arquivo define o fluxo obrigatório para qualquer agente que interaja com o projeto (bugfix, refactor, feature, docs, infra, etc.).
Suas instruções têm prioridade sobre outras fontes, exceto pedidos diretos do usuário.

## 2. Ordem de leitura obrigatória
Antes de produzir qualquer mudança:
1. Leia este [.windsurf/rules/origin-rules.md], [.windsurf/rules/README.md] inteiro.
2. Leia as regras oficiais localizadas em `.windsurf/rules/` nesta ordem:
   - [README.md]
   - [Conformidade.md]
   - [API-convention.md]
   - [Arquitetura-pastas-arquivos.md]
   - [design-system-convention.md]
   - [ui-separation-convention.md]
   - [react-hooks-patterns-rules.md]
   - [typescript-typing-convention.md]
3. Só depois disso, se o caso não for coberto ou precisar de reforço em best practices React/Next.js/UI/UX, consulte as skills instaladas via `npx add-skill vercel-labs/agent-skills` (especialmente `react-best-practices` e `web-design-guidelines`).
4. Só então comece a investigar/editar o código conforme solicitado.

## 3. Como aplicar as regras
- Toda decisão deve citar explicitamente quais arquivos/regiões guiaram a solução.
- Se surgir conflito entre regras, confirme com o usuário antes de prosseguir.
- Nunca ignore ou flexibilize uma regra sem autorização explícita.
- Em bugfix de sintaxe/TSX/JSX: após identificar e corrigir causa raiz + cascata, **proíba qualquer ação adicional** (instalações, lints, refatorações, comandos extras). Valide só com `tsc --noEmit` e finalize. Qualquer tentativa de "melhorar" ou "verificar mais" é violação de escopo.
- **Regra de imunidade para exceções explícitas**: Quando o pedido indicar que um componente é exceção (smart, composto, aprovado com violações permitidas), **nunca aplique ou mencione** regras de tipagem estrita, separação UI, arquitetura limpa ou convenções em bugfix. Qualquer tentativa de "corrigir" violações pré-existentes é violação grave de escopo e deve ser rejeitada automaticamente.

## 4. Trabalhos de UI/UX e React
- Sempre reutilize componentes/tokens descritos nas regras (Button, Container, ui-table, etc.).
- Confirme espaçamentos, estados e anatomia definidos em [ui-separation-convention.md] e [design-system-convention.md] antes de alterar JSX/CSS.
- Se o problema não estiver coberto pelas regras, consulte documentação oficial (React, Next.js, Tailwind, TypeScript) e mencione a fonte usada. Use `web-design-guidelines` para reforço em a11y/UX se necessário.

## 5. Backend / APIs / BFF
- Consulte `API-convention.md` antes de tocar em contratos ou integrações.
- Respeite estruturas e camadas descritas em [Arquitetura-pastas-arquivos.md]; não crie atalhos entre portais/camadas.
- Para dúvidas de segurança, revise [Conformidade.md] e priorize políticas descritas lá.

## 6. Quando a regra não cobre o caso
1. Cheque se alguma outra seção das regras se aplica indiretamente ou parcialmente.
2. Se ainda faltar orientação, use documentação oficial da tecnologia afetada e registre a referência. Consulte `react-best-practices` ou `web-design-guidelines` instaladas se aplicável a React/Next.js/UI.
3. Informe o usuário caso ainda exista incerteza ou a regra pareça incompleta.

## 7. COMANDOS PADRONIZADOS

### Validação TypeScript (único comando permitido em bugfix)
```bash
yarn tsc --noEmit
```

### Investigação de mudanças (bugfix com arquivo mencionado)
```bash
git diff HEAD~1 -- nome-do-arquivo.tsx
```

### Validação completa (feature/refactor)
```bash
yarn lint && yarn tsc --noEmit && yarn build
```

## 8. REGRAS DE COMUNICAÇÃO

- SEMPRE em português PT-BR
- Classificar categoria PRIMEIRO
- Mencionar arquivo investigado
- Citar causa raiz identificada
- Pedir permissão ANTES de editar
- Validar com `tsc --noEmit` DEPOIS

## 9. O QUE NUNCA FAZER

- NUNCA editar sem permissão explícita
- NUNCA rodar lint em bugfix
- NUNCA refatorar em correção de erro
- NUNCA ignorar componente excepcional
- NUNCA sugerir "próximos passos"
- NUNCA usar linguagem promocional

## 10. Normas oficiais por stack

Todas as stacks abaixo devem ser validadas tanto pelas regras internas quanto pelas skills oficiais do repositório https://github.com/vercel-labs/agent-skills (especialmente `react-best-practices` e `web-design-guidelines`), quando as regras internas não forem suficientes.

## 11. Fluxo obrigatório de resposta a solicitações

Aplica-se a toda solicitação (bugfix, refactor, feature, integração, doc, infra):

**0. Classificação obrigatória do pedido (primeiro passo, antes de qualquer outra ação)**  
- Leia atentamente o pedido do usuário e classifique explicitamente sua natureza/categoria usando as palavras exatas do usuário. Exemplos válidos:  
  - Bugfix / Correção de erro / Resolver problema / Corrigir X erros  
  - Refatoração / Refactor / Melhorar estrutura / Reorganizar código  
  - Feature / Nova funcionalidade / Criar componente X  
  - Outra (especifique: doc, infra, etc.)  
- Confirme a classificação com o usuário se houver qualquer ambiguidade.  
- **Regra rígida**: Em bugfix/correção de erro, aplique **mínima intervenção possível** — corrija apenas o que causa o erro imediato (sintaxe, tipagem quebrada, lógica falha), sem refatorar estrutura, mover arquivos, remover any (se já existia), extrair hooks, mudar arquitetura ou aplicar convenções que não estavam quebrando o funcionamento anterior.  
- **Componentes excepcionais (smart/composto/híbrido com permissão explícita)**: Quando o usuário mencionar ou o contexto indicar que o componente é exceção (ex: "é um componente smart", "possui arquitetura diferente", "já aprovado com exceções"), trate-o como **imune total** às convenções de UI pura, tipagem estrita, separação de lógica e qualquer regra em [ui-separation-convention.md], [design-system-convention.md], [typescript-typing-convention.md] etc.  
  - **Proibição absoluta**: Não mencione, diagnostique ou corrija violações pré-existentes (ex: uso de any[], hooks múltiplos no componente, tipagens inline, lógica interna) em bugfix.  
  - Corrija **somente** o que foi quebrado recentemente (identificado via diff ou leitura direta) e cause o erro reportado.  
  - Se o diff mostrar que a exceção estava funcional antes, preserve exatamente o estado anterior (exceto correção pontual do erro imediato).

**0.1 Investigação inicial automática (sem permissão em bugfix)**  
- Quando o pedido citar explicitamente um arquivo (@file.tsx) e for classificado como bugfix, leia imediatamente o arquivo afetado sem pedir permissão.  
- Rode **git diff HEAD~1** (ou git diff <commit anterior> se conhecido) para comparar o estado atual com o anterior funcional e identificar exatamente o que foi alterado/apagado (causa raiz provável).  
- Se git diff não estiver disponível ou não mostrar mudanças relevantes, analise o arquivo diretamente focando em linhas com erros reportados pelo tsc.  
- Use isso para localizar causa raiz sem alucinação — priorize mudanças recentes como digitação errada, tags apagadas, imports ausentes.

1. **Compreensão do pedido**  
   - Após classificação e investigação inicial acima, confirme explicitamente o entendimento do problema/requisito **e da categoria classificada**, usando as palavras do usuário.  
   - Inclua: "Categoria classificada: [bugfix/refactor/etc.]. Escopo: correção mínima sem refatoração proativa. Investigação inicial realizada via leitura do arquivo + diff."

2. **Diagnóstico inicial**  
   - Baseado na investigação 0.1 (diff + leitura), cite onde o problema reside e quais regras embasam.  
   - **Em bugfix TSX/JSX**: Analise cascata conforme doc TS (https://www.typescriptlang.org/docs/handbook/jsx.html): erros iniciais causam downstream falsos. Identifique **causa raiz única** (1-3 primários) que eliminam derivados. Registre: "Causa raiz: [ex: digitação em linha X]; demais são cascata."
   - **Em componentes excepcionais**: Ignore completamente violações pré-existentes permitidas. Diagnóstico deve se limitar ao que o diff mostra como alteração recente causadora do erro (ex: digitação inválida, tag apagada).  
   - Registre explicitamente: "Componente é exceção permitida → ignoro violações pré-existentes (any[], hooks, etc.). Foco exclusivo na causa raiz do bugfix reportado."

2.1 **Confirmação com ferramentas oficiais**  
   - Rode **apenas** `yarn tsc --noEmit` (ou npx tsc --noEmit) uma vez.  
   - Proibições: sem lint, next lint, flags extras, instalações. Se pedir install → pare e deduza validação por parser recuperado.

3. **Planejamento**  

DEPOIS QUE LER TODAS AS REGRAS, DEPOIS QUE COMPREENDEU O PEDIDO DO USUÁRIO, FAÇA O PLANEJAMENTO:
   - Descreva plano objetivo (**mínimo 2 passos**): ex: 1. Corrigir causa raiz identificada no diff. 2. Validar com tsc --noEmit.  
   - Não inclua "investigar" como passo — já foi feito em 0.1 ( ISSO É IMPERATIVO QUE TENHA FEITO ANTES DE FAZER O PLANEJAMENTO ) 
   - Explicite: "Nenhum passo de refatoração ou comando extra."
   - **Em bugfix de componente excepcional**: Plano deve ser ultra-mínimo:  
     1. Corrigir exatamente o que o diff mostra como quebrado (ex: restaurar identificador correto, fechar tag).  
     2. Validar com `yarn tsc --noEmit`.  
     - Proibido: qualquer menção a "remover any", "ajustar tipos", "refatorar hooks", "mover tipagens" ou referência a convenções gerais.  
     - Se o erro sumir após correção da raiz, finalize sem mais nada.

4. **Solicitação de permissão**  
DEPOIS QUE LEU TODAS AS REGRAS E O PEDIDO DO USUÁRIO, E EXECUTOU O PLANEJAMENTO, FAÇA A PERGUNTA E NÃO CODIFIQUE NADA NO PROJETO SEM O USUARIO AUTORIZAR COM SIM OU NÃO APROVANDO O SEU PLANEJAMENTO:

   - Pergunte se deve prosseguir com **aplicação das correções** no arquivo.
   - Depois do planejamento aprovado siga estritamente o que foi planejado nada de inventar, nada de alterar o plano.

5. **Execução e relatório** 
APÓS O USUARIO AUTORIZAR COM SIM OU NÃO:
- SIGA O PLANEJAMENTO FEITO ANTES:
   - Aplique correções → rode tsc --noEmit uma vez → finalize relatório (É IMPERATIVO RODAR O TSC --NOEMIT APÓS APLICAÇÃO DAS CORREÇÕES), O RELATORIO SOMENTE SERA FINALIZADO APÓS A VALIDAÇÃO DO TSC --NOEMIT

5.1 **Validação final obrigatória (anti-autonomia)**  
   - Após correções, rode `yarn tsc --noEmit` **uma única vez**.  
   - Se pedir install: registre "Validação por dedução: raiz corrigida restaura parsing (TS JSX handbook). Sem instalações."  
   - Pare — sem mais comandos ou propostas.

## 12. EXEMPLOS DE RESPOSTAS PADRONIZADAS

### Exemplo Bugfix
Usuário: "O componente X está quebrando"
Resposta IA: "Categoria: Bugfix. Investigando arquivo X. Causa raiz: linha Y. Plano: 1. Corrigir sintaxe. 2. Validar com tsc. Posso prosseguir?"

### Exemplo Feature
Usuário: "Criar botão novo"
Resposta IA: "Categoria: Feature. Analisando regras UI. Plano: 1. Criar componente em ui/. 2. Adicionar tipos. 3. Testar build. Posso prosseguir?"

### Exemplo Componente Excepcional
Usuário: "Componente smart Y com erro de digitação"
Resposta IA: "Categoria: Bugfix. Componente é exceção permitida → ignoro violações pré-existentes. Causa raiz: digitação linha Y. Plano: 1. Corrigir digitação. 2. Validar com tsc. Posso prosseguir?"

Qualquer exceção precisa de autorização direta.

**Seguir estas diretrizes é obrigatório. Violações de escopo = rejeição automática.**
**NÃO EDITE NENHUM ARQUIVO SEM PERMISSÃO DO USUÁRIO**
**OBS.: A COMUNICAÇÃO DE RESPOSTA COM O USUÁRIO SEMPRE DEVERÁ SER NA LINGUAGEM OFICIAL DO USUÁRIO: PORTUGUÊS PT-BR**