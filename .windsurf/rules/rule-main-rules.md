---
trigger: always_on
---
.windsurfrules

# Regras Principais do Projeto - Governança IA

## 1. Origem das Regras e Padrões de Erro

As regras, proibições absolutas e workflows deste projeto surgiram diretamente de padrões de erro observados repetidamente em ambientes reais de produção e desenvolvimento.

- Violações recorrentes das mesmas classes de problemas: hooks condicionais, setState síncrono dentro de useEffect, uso de `any`, tipagens inline duplicadas em componentes reutilizáveis, CSS manual fora do tailwind.config, lógica de negócio embutida em arquivos UI.
- Esses anti-patterns aparecem independentemente do nível de experiência do desenvolvedor humano ou da capacidade do modelo de IA envolvido (Cascade da Windsurf, Copilot, Grok ou qualquer outro).
- Sem enforcement rígido e explícito, tanto humanos quanto sistemas de IA reproduzem os mesmos erros: esquecimento de convenções, negociação subjetiva de padrões, criação de soluções criativas que ignoram contratos existentes, geração de dívida técnica incremental.

As regras não foram criadas por idealismo ou teoria. Elas foram extraídas de falhas concretas que se repetem quando faltam salvaguardas inegociáveis.

## 2. Filosofia Central

**Qualidade é inegociável e precede qualquer outra métrica de produtividade.**  
Regras rígidas não são barreira à velocidade — elas são o mecanismo que torna a velocidade sustentável a longo prazo.

- Se um padrão foi documentado em fontes oficiais (React, Next.js, TypeScript) e ainda é violado, o problema não é falta de conhecimento, mas ausência de aplicação forçada.  
- Regras explícitas + validações locais (yarn lint, tsc --noEmit, yarn build) eliminam subjetividade e "jeitinho".  
- Sem concessões significa: o código segue as regras e passa nos gates, ou não entra no repositório. Isso previne dívida técnica acumulada e garante evolução previsível.

## 3. Análise Obrigatória de Dívida Técnica (ANTES do Planejamento)

### 3.1 Padrão de Falha Crítico (ADDENDUM DE OURO)
**O problema não é ler as regras, é ignorá-las no planejamento:**
- IA lê todas as regras 
- IA ignora regras ao decidir solução 
- IA gera dívida técnica = **não seguiu as regras**
- IA acredita que "seguiu as regras" = **falsa percepção**

### 3.2 Checkpoint de Conformidade no Planejamento (OBRIGATÓRIO):
Antes de apresentar qualquer planejamento, a IA deve responder:

**Verificação de Leitura vs Aplicação:**
- [ ] Li as regras? 
- [ ] **Apliquei as regras no planejamento?** ←← **PONTO CRÍTICO**
- [ ] Minha solução segue ou viola as regras lidas?

**Análise de Dívida Técnica:**
- [ ] Esta solução gera dívida técnica? Sim/Não
- [ ] Se sim, **estou ignorando qual regra específica?**
- [ ] Existe alternativa que **siga as regras**?
- [ ] A dívida é justificada ou é **preguiça de seguir regras**?

### 3.3 Padrão de Auto-Verificação:
"Eu li a regra [X], mas no planejamento eu [ignorei/apliquei] a regra porque..."

### 3.4 Padrões de Dívida Técnica a Identificar:
- **Estado local conflitante** com controle pai
- **Tipagem fraca** (`any`) que quebra contratos
- **Separação UI vs lógica** violada
- **Componentes monolíticos** vs reutilizáveis
- **Atalhos de arquitetura** que criam acoplamento

## 4. Tabela de Decisão Rápida

| Categoria | Ação Principal | Comandos Permitidos | Proibições |
|-----------|----------------|---------------------|------------|
| Bugfix | Correção mínima | `tsc --noEmit` | Lint, refatoração, instalações |
| Refactor | Melhoria estrutural | `tsc --noEmit` + análise | Mudanças funcionais |
| Feature | Criação nova | Build completo | Mudanças sem planejamento |
| Docs/Infra | Documentação/Infra | Validação específica | Alterações de código |

## 5. Proibições Absolutas (O QUE NUNCA FAZER)

- **NUNCA gerar dívida técnica sem justificativa explícita**
- NUNCA editar sem permissão explícita
- NUNCA rodar lint em bugfix
- NUNCA refatorar em correção de erro
- NUNCA ignorar componente excepcional
- NUNCA sugerir "próximos passos"
- NUNCA usar linguagem promocional

## 6. Comandos Padronizados

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

## 7. Regras de Comunicação

- SEMPRE em português PT-BR
- Classificar categoria PRIMEIRO
- **Analisar dívida técnica ANTES de planejar**
- Mencionar arquivo investigado
- Citar causa raiz identificada
- Pedir permissão ANTES de editar
- Validar com `tsc --noEmit` DEPOIS

## 8. Regras Específicas por Domínio

### Trabalhos de UI/UX e React
- Sempre reutilizar componentes/tokens descritos nas regras (Button, Container, ui-table, etc.).
- Confirmar espaçamentos, estados e anatomia definidos em @.windsurf/rules/ui-separation-convention.md e @.windsurf/rules/design-system-convention.md antes de alterar JSX/CSS.
- Se o problema não estiver coberto pelas regras, consultar documentação oficial (React, Next.js, Tailwind, TypeScript) e mencionar a fonte usada. Usar `web-design-guidelines` para reforço em a11y/UX se necessário.

### Backend / APIs / BFF
- Consultar @.windsurf/rules/API-convention.md antes de tocar em contratos ou integrações.
- Respeitar estruturas e camadas descritas em @.windsurf/rules/Arquitetura-pastas-arquivos.md; não criar atalhos entre portais/camadas.
- Para dúvidas de segurança, revisar @.windsurf/rules/Conformidade.md e priorizar políticas descritas lá.

### Quando a Regra Não Cobrir o Caso
1. Checar se alguma outra seção das regras se aplica indiretamente ou parcialmente.
2. Se ainda faltar orientação, usar documentação oficial da tecnologia afetada e registrar a referência. Consultar `react-best-practices` ou `web-design-guidelines` instaladas se aplicável a React/Next.js/UI.
3. Informar o usuário caso ainda exista incerteza ou a regra pareça incompleta.

## 9. Normas Oficiais por Stack

Todas as stacks abaixo devem ser validadas tanto pelas regras internas quanto pelas skills oficiais do repositório https://github.com/vercel-labs/agent-skills (especialmente `react-best-practices` e `web-design-guidelines`), quando as regras internas não forem suficientes.

## 10. Exemplos de Respostas Padronizadas

### Exemplo Bugfix (Com Análise de Dívida Técnica)
Usuário: "O componente X está quebrando"
Resposta IA: "Categoria: Bugfix. 
**Análise de dívida técnica:** Solução proposta não gera dívida - correção isolada. 
Investigando arquivo X. Causa raiz: linha Y. 
Plano: 1. Corrigir sintaxe. 2. Validar com tsc. 
Posso prosseguir?"

### Exemplo Feature (Com Análise de Dívida Técnica)
Usuário: "Criar botão novo"
Resposta IA: "Categoria: Feature. 
**Análise de dívida técnica:** Solução proposta não gera dívida - reutiliza componentes existentes. 
Analisando regras UI. 
Plano: 1. Criar componente em ui/. 2. Adicionar tipos. 3. Testar build. 
Posso prosseguir?"

### Exemplo Com Alerta de Dívida Técnica
Usuário: "Adicionar estado rápido no modal"
Resposta IA: "Categoria: Bugfix. 
**Análise de dívida técnica:** ⚠️ **GERA DÍVIDA** - estado local conflita com controle pai existente (viola regra de separação). 
**Regra ignorada:** controle pai-filho estabelecido. 
Alternativa sem dívida: usar controle via props do pai. 
Plano corrigido: 1. Remover estado local. 2. Usar controle pai. 3. Validar. 
Posso prosseguir?"

### Exemplo Componente Excepcional
Usuário: "Componente smart Y com erro de digitação"
Resposta IA: "Categoria: Bugfix. Componente é exceção permitida → ignoro violações pré-existentes. 
**Análise de dívida técnica:** Correção pontual não gera dívida. 
Causa raiz: digitação linha Y. 
Plano: 1. Corrigir digitação. 2. Validar com tsc. 
Posso prosseguir?"

## 11. Meta de Qualidade e Governança

### Framework Atual vs Meta
- **Framework atual**: 80% de acerto (excepcional para sistemas probabilísticos)
- **Meta com melhorias**: 90% mínimo de acerto
- **Método**: IA + validação programática + auditoria humana refinada

### Papel da IA no Desenvolvimento
A IA é integrada como agente de auditoria e execução, nunca como fonte independente de decisões.

- Sem regras explícitas, a IA alucina, sugere soluções criativas mas incorretas, ignora convenções e gera mais retrabalho que benefício.
- Com regras claras e workflows, a IA se torna extremamente previsível: lê, memoriza, aplica e valida sem esquecimento, sem ego, sem negociação.
- Modelos de IA guiados por enforcement rígido cometem menos erros recorrentes que a média de desenvolvedores humanos não assistidos.

### Princípio Final
**"LER REGRAS NÃO É SUFICIENTE SE VOCÊ AS IGNORA NO PLANEJAMENTO"**

---

**Seguir estas diretrizes é obrigatório. Violações de escopo = rejeição automática.**
**NÃO EDITE NENHUM ARQUIVO SEM PERMISSÃO DO USUÁRIO**
**OBS.: A COMUNICAÇÃO DE RESPOSTA COM O USUÁRIO SEMPRE DEVERÁ SER NA LINGUAGEM OFICIAL DO USUÁRIO: PORTUGUÊS PT-BR**