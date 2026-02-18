# Solicitação Técnica: Implementação das Soluções do Enforcement Analysis

## PEDIDO

Com base na análise completa do Enforcement Analysis.md, solicito implementação imediata das soluções identificadas para corrigir as falhas críticas do sistema de enforcement que permitem violações sistemáticas das regras do projeto.

## PROBLEMA

O sistema de enforcement atual falha em impedir 8 de 8 violações documentadas, cobrindo apenas ~10% dos casos reais. O PreToolUse hook valida apenas segurança básica enquanto violações arquiteturais, comportamentais e de escopo passam despercebidas.

## DETALHES DA SOLICITAÇÃO

### 1. Diagnóstico Confirmado
- **Taxa de eficácia real**: ~80% (conforme origin-rules.md)
- **Camada determinística**: Funciona mas cobre apenas segurança básica
- **Camada probabilística**: Depende de compliance voluntária da IA
- **Gap fundamental**: Regras mais importantes vivem na camada probabilística

### 2. Violações Não Bloqueadas (Issues #14, #15, #24, #25, #26, #27, #28)
- Edição sem permissão do usuário
- Edição fora do escopo RAG  
- Uso de `any` em TypeScript
- Violação UI separation
- Violação React Hooks patterns
- Ignorar ETAPA 0 do workflow
- Numeração sequencial errada

### 3. Soluções Técnicas Requeridas

#### 3.1 Melhorar PreToolUse Hook
**Arquivo**: `src/workflow-enforcement/cli/pretool-hook.ts`

**Implementações necessárias**:
- Validar se operação Edit/Write tem permissão explícita do usuário
- Verificar escopo RAG contra arquivos sendo modificados
- Detectar uso de `any` no new_string (parser TypeScript básico)
- Identificar patterns de React Hooks violados (useState/useEffect em UI)

#### 3.2 Tornar Enforcement Obrigatório
**Arquivos**: Workflow frontmatter em `.windsurf/workflows/`

**Correções necessárias**:
- Remover dependência de execução voluntária por parte da IA
- Integrar validação automática antes de qualquer operação Edit/Write
- Implementar fallback para ambiente Windows (PowerShell vs Bash)

#### 3.3 Implementar Parser Semântico
**Novo arquivo**: `src/workflow-enforcement/semantic-parser.ts`

**Funcionalidades requeridas**:
- Parse do new_string em operações Edit
- Detecção de patterns proibidos (`any`, `useState` em UI, hooks condicionais)
- Validação contra regras em `.windsurf/rules/`
- Retorno exit code 2 para violações semânticas

#### 3.4 Sistema de Escopo RAG
**Novo arquivo**: `src/workflow-enforcement/rag-scope-validator.ts`

**Funcionalidades requeridas**:
- Ler RAG ativo da sessão
- Extrair arquivos mencionados no escopo
- Bloquear edições em arquivos fora do escopo
- Log automático de tentativas de expansão de escopo

#### 3.5 Correção Windows PowerShell
**Arquivos**: Frontmatter dos 5 workflows

**Implementação**:
- Detectar SO automaticamente
- Usar `.ps1` em Windows, `.sh` em Linux/Mac
- Testar funcionamento em ambiente Windows atual

## REGRA A SER SEGUIDA

@[.windsurf/rule-main-rules.md]

## EXECUÇÃO ESPERADA

1. **Classificação**: Feature (melhoria estrutural do enforcement)
2. **Validação completa**: yarn lint && yarn tsc --noEmit && yarn build
3. **Implementação sequencial**: 
   - Correção Windows PowerShell primeiro
   - Melhoria PreToolUse Hook
   - Implementação parser semântico
   - Sistema de escopo RAG
   - Testes integrados
4. **Validação pós-implementação**: Executar todos os workflows para confirmar bloqueio efetivo

## CRITÉRIOS DE SUCESSO

- [ ] PreToolUse hook bloqueia violações das issues #14, #24, #28
- [ ] Enforcement funciona em ambiente Windows
- [ ] Parser semântico detecta `any` e React Hooks violados
- [ ] Escopo RAG é validado automaticamente
- [ ] Taxa de eficácia sobe de ~80% para >95%

## PRIORIDADE

**Crítica** - Sistema de governança está ineficaz sem estas correções.
