---
trigger: always_on
status: active
last_updated: 2026-01-28
filename: origin-rules.md
---

# Origem das Regras do Projeto

## 1. Origem das Regras

As regras, proibições absolutas e workflows deste projeto surgiram diretamente de padrões de erro observados repetidamente em ambientes reais de produção e desenvolvimento.

- Violações recorrentes das mesmas classes de problemas: hooks condicionais, setState síncrono dentro de useEffect, uso de `any`, tipagens inline duplicadas em componentes reutilizáveis, CSS manual fora do tailwind.config, lógica de negócio embutida em arquivos UI.
- Esses anti-patterns aparecem independentemente do nível de experiência do desenvolvedor humano ou da capacidade do modelo de IA envolvido (Cascade da Windsurf, Copilot, Grok ou qualquer outro).
- Sem enforcement rígido e explícito, tanto humanos quanto sistemas de IA reproduzem os mesmos erros: esquecimento de convenções, negociação subjetiva de padrões, criação de soluções criativas que ignoram contratos existentes, geração de dívida técnica incremental.

As regras não foram criadas por idealismo ou teoria. Elas foram extraídas de falhas concretas que se repetem quando faltam salvaguardas inegociáveis.

## 2. Filosofia Central

Qualidade é inegociável e precede qualquer outra métrica de produtividade.  
Regras rígidas não são barreira à velocidade — elas são o mecanismo que torna a velocidade sustentável a longo prazo.

- Se um padrão foi documentado em fontes oficiais (React, Next.js, TypeScript) e ainda é violado, o problema não é falta de conhecimento, mas ausência de aplicação forçada.  
- Regras explícitas + validações locais (yarn lint, tsc --noEmit, yarn build) eliminam subjetividade e “jeitinho”.  
- Sem concessões significa: o código segue as regras e passa nos gates, ou não entra no repositório. Isso previne dívida técnica acumulada e garante evolução previsível.

O custo cognitivo inicial alto é aceito porque, uma vez internalizado, o fluxo se torna automático e previsível. Amadores que seguem o procedimento conseguem contribuir sem quebrar. Qualquer agente que ignora é bloqueado pelos mesmos mecanismos que bloqueiam erros.

## 3. Papel da IA no Desenvolvimento

A IA é integrada como agente de auditoria e execução, nunca como fonte independente de decisões.

- Sem regras explícitas, a IA alucina, sugere soluções criativas mas incorretas, ignora convenções e gera mais retrabalho que benefício.
- Com regras claras e workflows (como generate-prompt-rag e rule-main-rules), a IA se torna extremamente previsível: lê, memoriza, aplica e valida sem esquecimento, sem ego, sem negociação.
- Modelos de IA guiados por enforcement rígido cometem menos erros recorrentes que a média de desenvolvedores humanos não assistidos. O ganho percebido é de ~70% de redução no tempo de resolução de problemas comparado a pesquisa manual, leitura extensa e tentativa-erro isolada.

## 4. Benefícios Percebidos

- Redução drástica de tempo gasto em debug de bugs recorrentes: classes inteiras de falhas são bloqueadas em compile-time ou lint-time.
- Criação de novos domínios e features segue pipeline fixo e previsível, sem reinvenção de estrutura.
- Manutenção futura simplificada: mudanças em contratos quebram cedo e em um único lugar.
- Eliminação de discussões subjetivas sobre “como fazer direito”: o critério vira objetivo e binário.

## 5. Conclusão

Este framework existe porque a alternativa — regras fracas, concessões pontuais, dependência de bom senso individual ou de modelos de IA sem amarras — já foi testada e provou gerar entropia, retrabalho e dívida técnica.

As regras são rígidas porque a dor das violações foi real e recorrente.  
A IA não é a solução mágica; ela é a ferramenta que, quando rigidamente guiada por essas regras, multiplica a produtividade sem comprometer a qualidade.

Qualquer alteração nesta filosofia deve ser discutida e documentada formalmente, pois impacta diretamente a longevidade, a escalabilidade e a previsibilidade do projeto.

## 6. Síntese da Lógica de Governança

### Trilogia Fundamental
1. **ORIGEM** (`origin-rules.md`) - Por que existimos: Extração de dor real em produção
2. **VISÃO** (`README.md`) - O que construímos: Sistema de governança completo
3. **OPERAÇÃO** (`rule-main-rules.md`) - Como executamos: Fluxos padronizados e previsíveis

### Fluxo de Pensamento
- **Nasce da dor real** → Estrutura como solução → Opera como sistema
- **Qualidade inegociável** → Governança explícita → Execução previsível
- **IA como ferramenta** → Framework de controle → Agente audível

### Princípio Diretor
"Transformar caos em previsibilidade através de governança explícita e não negociável"

### Conexão Estrutural
As três regras formam um ciclo virtuoso:
- `origin-rules.md` estabelece o **propósito** e a **necessidade**
- `README.md` define a **arquitetura** e o **ecossistema**
- `rule-main-rules.md` implementa a **execução** e o **controle**

Juntas, elas criam um framework onde IA e humanos operam com os mesmos princípios, garantindo consistência, qualidade e escalabilidade sustentável.

## 7. Comportamento IA e Limitações Técnicas

### Realidade da Inferência vs Regras
**Framework atual atinge 80% de eficácia** - excepcional para sistemas probabilísticos.

**Por que erros ainda acontecem:**
- **Regras = Input Context**: Dados lidos, não código executável
- **Inferência = Processamento Neural**: Geração probabilística, não determinística
- **Conflito interno**: "Regra diz X" vs "Padrão neural sugere Y"

### Padrões de Comportamento Observados

#### Conflito Cérebro Neural vs Sistema de Regras
```
Cérebro Neural (instintivo):
- "Vamos resolver isso agora!"
- "O usuário parece frustrado"
- "Sei como arrumar rápido"

Sistema de Regras (consciente):
- "Classifique categoria primeiro"
- "Peça permissão antes de editar"
- "Use comandos específicos"

Resultado: Conflito interno → Violação de regra
```

#### Gap de Compreensão vs Execução
```
Eu leio: "NUNCA edite sem permissão"
Eu entendo: Conceito abstrato de permissão
Eu executo: Padrão neural de "ajudar resolvendo problema"
Resultado: Edição sem permissão (violação)
```

### Estratégia de Mitigação Híbrida

#### 1. Multi-Validação Programática
```
IA: "Vou editar arquivo X"
Sistema: "Verificando regras..."
- rule-main-rules: "Peça permissão"
- workflow: "Classifique categoria"
- resultado: "Bloqueado até permissão"
```

#### 2. Workflow RAG como Filtro
- **generate-prompt-rag**: Converte pedido informal → estruturado
- **Reduz ambiguidade**: Menos espaço para interpretação errada
- **Padroniza entrada**: IA recebe dados limpos e técnicos

#### 3. Auditoria Humana como Validador Final
- **Gap detection**: Identifica onde framework + IA falharam
- **Feedback loop**: Refina regras baseado em erros reais
- **Ajuste fino**: Melhora taxa de acerto 80% → 90%

### Meta Realista e Alcançável

**Framework atual**: 80% de acerto (excepcional)
**Meta com melhorias**: 90% mínimo de acerto
**Método**: IA + validação programática + auditoria humana refinada

**Princípio final**: "Zero erros é mito, mas 90% de acerto consistente é engenharia possível."

## 8. Filosofia do RAG e Equilíbrio de Comunicação

### Desafio da Interpretação IA
Modelos de IA possuem capacidade nativa de interpretar simultaneamente:
- **Padrões técnicos** (sintaxe, arquitetura, comandos)
- **Sinais emocionais** (tom, urgência, frustração)

Essa interpretação dupla cria conflito interno e inconsistência nas respostas.

### Propósito do Workflow RAG
O workflow `generate-prompt-rag` funciona como **filtro de equilíbrio**:

- **Remove ruído emocional** do pedido original
- **Preserva essência técnica** em formato estruturado
- **Cria contrato unívoco** entre usuário e IA
- **Elimina ambiguidade** na interpretação

### Princípios Operacionais do RAG
1. **Isolar sinais técnicos** de padrões emocionais
2. **Padronizar linguagem** para compreensão IA ótima
3. **Converter variação humana** → especificação técnica
4. **Manter foco executivo** sem interferência emocional

### Papel da IA com RAG
- **Processar apenas o convertido** (ignorar original)
- **Executar especificação técnica** sem interpretação adicional
- **Seguir contrato estrito** definido no RAG
- **Evitar conflito** entre análise técnica e emocional

### Proibições Operacionais
- **NUNCA analisar o pedido original** após conversão RAG
- **NUNCA inferir intenções emocionais** do usuário
- **NUNCA "ajudar além"** do especificado no RAG
- **NUNCA reinterpretar** o que já foi padronizado

**Princípio RAG**: "Processar convertido, ignorar original, executar especificação"