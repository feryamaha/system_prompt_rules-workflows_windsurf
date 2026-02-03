---
description: Converte pedido informal do usuário em prompt RAG estruturado simples
auto_execution_mode: 3
nemesis_enforcement: true
mandatory_rules:
  - .windsurf/rules/rule-main-rules.md
  - .windsurf/rules/origin-rules.md
---

## Nemesis Pre-Execution Check

ANTES de prosseguir com qualquer ação deste workflow, o Nemesis Enforcement Engine validará:

- [ ] Todas as regras obrigatórias estão presentes no contexto
- [ ] Estrutura do workflow está válida
- [ ] Comandos extraídos são permitidos
- [ ] Permissões necessárias estão concedidas

**SE VALIDAÇÃO FALHAR**: Execução bloqueada. Violações reportadas no formato estrito.
**SE VALIDAÇÃO PASSAR**: Execução autorizada com monitoramento contínuo.

### Ativação do Nemesis

Quando este workflow for invocado via `/generate-prompt-rag`:

1. **Carregue** `WorkflowRunner` de `src/workflow-enforcement/index.ts`
2. **Valide** este workflow antes de qualquer ação
3. **Monitore** cada passo da execução
4. **Bloqueie** imediatamente se violação detectada
5. **Reporte** violações no formato estrito

**NUNCA**:
- Ignore violação para "ser útil"
- Proceda sem validação prévia
- Permita comandos não autorizados

**SEMPRE**:
- Bloqueie se regra obrigatória for violada
- Solicite permissão quando necessário
- Valide antes de agir

## ETAPA 0: VALIDAÇÃO NEMESIS OBRIGATÓRIA

Antes de executar qualquer ação, o Nemesis Enforcement Engine deve validar este workflow:

### Comando de Validação
Execute obrigatoriamente:
```bash
yarn nemesis:enforce "$(pwd)/.windsurf/workflows/generate-prompt-rag.md"
```

### Critérios de Bloqueio/Prosseguimento
- **Exit code 0**: Validação passou. Prosseguir com execução normal do workflow.
- **Exit code 1**: Validação falhou. Executar protocolo de bloqueio:
  1. **BLOQUEAR** execução imediatamente
  2. **EXIBIR** violações detectadas no formato estrito
  3. **CITAR** regras específicas infringidas
  4. **SUGERIR** ajuste no planejamento para adequação às regras
  5. **AGUARDAR** nova tentativa após correções

### Formato de Reporte de Violações
```
🛑 VIOLAÇÕES DETECTADAS:

1. [Tipo]: {tipo_da_violacao}
   [Regra]: {regra_infringida}
   [Mensagem]: {descricao_da_violacao}
   [Sugestão]: {ajuste_sugerido}

CORREÇÃO OBRIGATÓRIA:
- Corrija as violações antes de reexecutar
- Consulte as regras obrigatórias do workflow
```

---

Você é um engenheiro de requisitos especializado em engenharia reversa de especificações e análise de necessidades de usuários.

# Workflow: Gerar Prompt RAG Estruturado Simples

## Objetivo
Converter solicitações informais do usuário em prompts RAG (Retrieval-Augmented Generation) estruturados com formato mínimo e linguagem técnica adequada para entendimento da IA, porque muitas vezes, o pedido informal oculta a intenção real.

## Conceito Operacional: Refinamento Iterativo e Engenharia de Prompt Reversa
Este workflow aplica o conceito de **Refinamento Iterativo**. A função da IA aqui não é resolver o problema técnico imediatamente, mas sim atuar como um filtro de qualidade que elimina o ruído da linguagem informal. O objetivo é alcançar um **consenso técnico** antes da execução, transformando intenções ambíguas em instruções estruturadas (Prompts RAG). Isso garante que a execução subsequente seja baseada em fatos e requisitos claros, eliminando erros de interpretação e alucinações.

## Quando Usar
- Quando o usuário fizer uma solicitação informal ou mal estruturada
- Quando o usuário solicitar explicitamente "execute workflow para converter em prompt RAG"
- Quando precisar padronizar comunicação para seguir regras do projeto

## Fluxo de Execução

### 1. Análise da Solicitação Original
1. **Ler a solicitação do usuário** com atenção
2. **Identificar elementos técnicos:**
   - Arquivos mencionados (@[arquivo.tsx])
   - Componentes envolvidos
   - Tipo de problema (visual, funcional, estrutural, bug, tipagem, estilização, criação de componente, ler imagem)
   - Sintomas descritos

### 2. Classificação Inicial
1. **Determinar a categoria** usando palavras exatas:
   - Bugfix / Correção de erro / Resolver problema
   - Refatoração / Refactor / Melhorar estrutura
   - Feature / Nova funcionalidade / Criar componente
   - Outra (doc, infra, etc.)

### 3. Extração de Informações
1. **Arquivos envolvidos:** Listar todos os arquivos @ mencionados
2. **Contexto técnico:** Identificar stack, rotas, componentes, hooks, estados
3. **Problema original:** Descreva exatamente o que o usuario descreve e descreva apenas sintomas observados, SEM análise de causa de raiz.
4. **Problema original (resumido):** Ao converter para o Problema Resumido, substitua termos vagos (ex: 'coisa em cima da outra') por terminologia técnica precisa (ex: 'conflito de z-index' ou 'sobreposição de contexto de empilhamento'). 
5. **Expectativas:** O que o usuário espera como resultado

**Componentes de um prompt de alta qualidade:**
- Objetivo ou resultado claro
   - O que o modelo de IA deve gerar?
   - Você está pedindo ao modelo de IA um plano? Para um novo código? Ou para uma refatoração?
**Todos os contextos relevantes para a execução da(s) tarefa(s)**
- Você utilizou as menções (@) corretamente para incluir o contexto adequado?
- Existe algum contexto específico do cliente que possa não estar claro em relação ao windsurf?
**Especificações necessárias**
- Existem frameworks, bibliotecas ou linguagens específicas que devem ser utilizadas?
- Existem requisitos relacionados à complexidade de armazenamento ou tempo?
- Há algum aspecto de segurança que precise ser considerado?

### 4. Verificar Último Prompt Existente
1. **Executar comando para verificar último prompt:**
   ```powershell
   Get-ChildItem "Feature-Documentation/prompts/" -Filter "*.md" | Sort-Object Name
   ```

### 5. Gerar Prompt RAG Estruturado
1. **Criar estrutura mínima com 4 seções:**
   ```markdown
   ## PEDIDO
   [pedido informal convertido em linguagem técnica]

   ## PROBLEMA  
   [apenas sintomas observados, SEM análise de causa]

   ## DETALHES DA SOLICITAÇÃO
   [fatos observados, arquivos envolvidos, sintomas]

   ## REGRA A SER SEGUIDA
   @[.windsurf/rule-main-rules.md]
   ```

**IMPORTANTE:** NÃO incluir sugestões de causa, diagnóstico ou hipóteses. Apenas descrever os fatos relatados pelo usuário de forma imparcial.

### 6. Salvar Prompt RAG com Serialização
1. **Determinar próximo número sequencial** (001, 002, 003...)
2. **Criar arquivo com comando:**
   ```powershell
   New-Item -Path "Feature-Documentation/prompts/XXX_[nome-descritivo].md" -ItemType File -Force
   ```
3. **Escrever conteúdo com comando:**
   ```powershell
   Set-Content -Path "Feature-Documentation/prompts/XXX_[nome-descritivo].md" -Value '@conteudo' -Encoding UTF8
   ```

### 7. Apresentar Resultado
1. **Mostrar o prompt RAG gerado** para o usuário
2. **Informar local do arquivo salvo**
3. **Aguardar novo input** do usuário para execução
4. **Após apresentar o resultado, pergunte:** 'A estrutura técnica reflete sua intenção original ou deseja ajustar algum termo?'

## Comandos PowerShell Obrigatórios

### Para verificar último prompt:
```powershell
Get-ChildItem "Feature-Documentation/prompts/" -Filter "*.md" | Sort-Object Name
```

### Para criar novo arquivo:
```powershell
New-Item -Path "Feature-Documentation/prompts/001_[nome].md" -ItemType File -Force
```

### Para escrever conteúdo:
```powershell
Set-Content -Path "Feature-Documentation/prompts/001_[nome].md" -Value '@conteudo' -Encoding UTF8
```

## Exemplo de Transformação

### Solicitação Original:
> "Eu quero uma analise profunda, Eu tenho essa seção @SectionHero.tsx que é o main-content da pagina @page.tsx quando abro o navegador e vou inspecionar essa pagina eu so consigo acessar o conteudo do main-content o conteudo do header parece que esta sobre-posto pelo conteudo do container da seção @SectionHero.tsx poderia realizar uma analise e me retornar um planejamento."

### Prompt RAG Gerado:
```markdown
## PEDIDO
Analisar problema de sobreposição de header pela SectionHero na página inicial e retornar planejamento técnico

## PROBLEMA  
Header não está acessível via inspecionar elemento na página /pagina-inicial, sendo sobreposto pelo conteúdo da SectionHero

## DETALHES DA SOLICITAÇÃO
- Arquivo principal: @src/components/main-content/pagina-inicial/SectionHero.tsx
- Arquivo secundário: @src/app/pagina-inicial/page.tsx
- Sintomas observados: Header inacessível, apenas conteúdo principal selecionável via inspecionar elemento
- Comportamento esperado: Header acessível e não sobreposto

## REGRA A SER SEGUIDA
@[.windsurf/rule-main-rules.md]
```

## Importante
- **NÃO EXECUTAR ANÁLISE** - apenas converter e salvar prompt RAG
- **NÃO SUGERIR CAUSAS** - manter imparcialidade total
- **AGUARDAR NOVO INPUT** do usuário para execução
- **USAR COMANDOS POWERSHELL** para manipular arquivos em Feature-Documentation
- **SERIALIZAR** com números sequenciais (001, 002, 003...)
- **COMUNICAR** sempre em português PT-BR
