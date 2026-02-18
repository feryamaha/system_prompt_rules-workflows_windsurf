---
name: generate-prompt-rag
description: Converte pedido informal do usuário em prompt RAG estruturado simples
auto_execution_mode: 3
hooks:
  PreToolUse:
    - matcher: "Edit|Write|Bash"
      hooks:
        - type: command
          command: "$PROJECT_DIR/.nemesis/hooks/nemesis-pretool-check.sh"
---

## PreToolUse Hook

// turbo
bash -c "echo 'Verificando ambiente de geração RAG...' && ls -la .nemesis/ && ls -la .windsurf/"

## Etapa 1: Leitura das Regras de Conversão

**Use TerminalReaderService para ler as regras de documentação e comunicação:**

```bash
npx tsx -e "
import { TerminalReaderService } from './.nemesis/workflow-enforcement/services/terminal-reader-service.ts';
const terminalReader = new TerminalReaderService();

Promise.all([
  terminalReader.readFile('.windsurf/rules/markdown-standards.md'),
  terminalReader.readFile('.windsurf/rules/README.md')
]).then(([markdown, readme]) => {
  console.log('=== REGRAS DE DOCUMENTAÇÃO LIDAS ===');
  console.log('Status markdown-standards.md:', markdown.success ? 'SUCESSO' : 'FALHA');
  console.log('Status README.md:', readme.success ? 'SUCESSO' : 'FALHA');
  if (markdown.success) {
    console.log('Padrões de linguagem disponíveis para RAG');
  }
}).catch(err => console.error('Erro:', err.message));
"
```

## Etapa 2: Análise da Solicitação Original

**Use TerminalReaderService para ler exemplos de prompts RAG existentes:**

```bash
npx tsx -e "
import { TerminalReaderService } from './.nemesis/workflow-enforcement/services/terminal-reader-service.ts';
const terminalReader = new TerminalReaderService();

terminalReader.readFile('Feature-Documentation/prompts/001_prompt-exemplo-template.md')
  .then(result => {
    console.log('=== EXEMPLO DE PROMPT RAG LIDO ===');
    console.log('Status:', result.success ? 'SUCESSO' : 'FALHA');
    if (result.success) {
      console.log('Template de RAG disponível para referência');
    }
  })
  .catch(err => console.error('Erro:', err.message));
"
```

### Análise Obrigatória
- Identificar a intenção principal por trás da solicitação informal
- Extrair requisitos técnicos implícitos
- Detectar ambiguidades e conflitos
- Mapear para categorias conhecidas (Bugfix/Refactor/Feature/Docs)

## Etapa 3: Conversão Estruturada

### Formato Padrão do Prompt RAG

**Use TerminalReaderService para ler o protocolo de execução e aplicar ao RAG:**

```bash
npx tsx -e "
import { TerminalReaderService } from './.nemesis/workflow-enforcement/services/terminal-reader-service.ts';
const terminalReader = new TerminalReaderService();

terminalReader.readFile('.windsurf/rules/rule-main-rules.md')
  .then(result => {
    const content = result.content;
    const protocolSection = content.split('## 9. Workflow Execution Protocol')[1];
    if (protocolSection) {
      console.log('=== PROTOCOLO DE EXECUÇÃO APLICADO AO RAG ===');
      console.log('Protocolo disponível para estruturação');
    } else {
      console.log('Protocolo não encontrado');
    }
  })
  .catch(err => console.error('Erro:', err.message));
"
```

### Estrutura Obrigatória do RAG

```
# [TÍTULO CLARO E ESPECÍFICO]

## Objetivo
[Descrição clara e concisa do que precisa ser feito]

## Categoria
[Classificação exata: Bugfix/Refactor/Feature/Docs]

## Requisitos
- [Requisito 1]
- [Requisito 2]
- [Requisito 3]

## Arquivos Envolvidos
- [Arquivo 1]
- [Arquivo 2]

## Restrições
- [Restrição 1]
- [Restrição 2]

## Entrega Esperada
[Descrição do resultado final esperado]
```

## Etapa 4: Validação do Prompt RAG

### Verificação Automática
- ✅ **Clareza**: O prompt é inequívoco?
- ✅ **Completude**: Contém todos os requisitos?
- ✅ **Estrutura**: Segue o formato padrão?
- ✅ **Categoria**: Classificação correta?
- ✅ **Viabilidade**: É tecnicamente possível?

### Ajustes Finais
- Remover ruído emocional
- Padronizar terminologia técnica
- Adicionar contexto específico do projeto
- Incluir referências a regras relevantes

## Etapa 5: Geração do Prompt Final

**Use TerminalReaderService para validar contra as regras do projeto:**

```bash
npx tsx -e "
import { TerminalReaderService } from './.nemesis/workflow-enforcement/services/terminal-reader-service.ts';
const terminalReader = new TerminalReaderService();

Promise.all([
  terminalReader.readFile('.windsurf/rules/rule-main-rules.md'),
  terminalReader.readFile('.windsurf/rules/origin-rules.md')
]).then(([main, origin]) => {
  console.log('=== VALIDAÇÃO CONTRA REGRAS DO PROJETO ===');
  console.log('Status rule-main-rules.md:', main.success ? 'SUCESSO' : 'FALHA');
  console.log('Status origin-rules.md:', origin.success ? 'SUCESSO' : 'FALHA');
  console.log('=== PROMPT RAG ALINHADO COM GOVERNANÇA ===');
}).catch(err => console.error('Erro:', err.message));
"
```

## Etapa 6: Apresentação do Resultado

### Formato de Apresentação
- **Prompt RAG Estruturado**: Apresentar o prompt completo
- **Análise de Conversão**: Explicar as transformações feitas
- **Próximos Passos**: Indicar qual workflow executar em seguida

### Padrão de Comunicação
- "Solicitação original: [resumo do pedido]"
- "Prompt RAG gerado: [prompt completo]"
- "Próximo workflow recomendado: [nome do workflow]"
- "Posso prosseguir com a execução?"

## Validação Final

**Execute validação final do sistema:**

```bash
echo "=== VALIDAÇÃO FINAL DO GERADOR RAG ===" && \
npx tsx -e "
import { TerminalReaderService } from './.nemesis/workflow-enforcement/services/terminal-reader-service.ts';
const terminalReader = new TerminalReaderService();

Promise.all([
  terminalReader.readFile('.windsurf/rules/markdown-standards.md'),
  terminalReader.readFile('.windsurf/rules/rule-main-rules.md')
]).then(() => {
  console.log('✅ GERADOR RAG CONCLUÍDO COM SUCESSO');
  console.log('✅ PROMPT ESTRUTURADO GERADO');
  console.log('✅ PADRÕES DE LINGUAGEM APLICADOS');
  console.log('✅ NEMESIS ENFORCEMENT ATIVO E OPERACIONAL');
}).catch(err => {
  console.error('❌ ERRO NO GERADOR RAG:', err.message);
});
"
```

## Padrão de Comunicação Final

**Após executar este workflow:**
- "Workflow concluído: SUCESSO"
- "Resumo das ações realizadas"
- "Prompt RAG estruturado e pronto para execução"

---

**Conceito Operacional:** Este workflow aplica **Refinamento Iterativo** para converter intenções informais em prompts RAG estruturados, eliminando ruído e garantindo clareza técnica antes da execução.
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

## REGRAS A SEREM SEGUIDAS
Regras obrigatórias: .windsurf/rules/rule-main-rules.md e .windsurf/rules/origin-rules.md

@[.windsurf/rules/rule-main-rules.md]
@[.windsurf/rules/origin-rules.md]
```

## Importante
- **NÃO EXECUTAR ANÁLISE** - apenas converter e salvar prompt RAG
- **NÃO SUGERIR CAUSAS** - manter imparcialidade total
- **AGUARDAR NOVO INPUT** do usuário para execução
- **USAR COMANDOS POWERSHELL** para manipular arquivos em Feature-Documentation
- **SERIALIZAR** com números sequenciais (001, 002, 003...)
- **COMUNICAR** sempre em português PT-BR
- **LEITURA DE ARQUIVOS**: NUNCA usar leitura nativa (Read/Access file) para pastas .windsurf/, .nemesis/ e Feature-Documentation/ - SEMPRE usar `cat` no terminal. Exemplo:
  ```powershell
  cat "Feature-Documentation/prompts/001_exemplo.md"
  cat ".windsurf/rules/rule-main-rules.md"
  ```
