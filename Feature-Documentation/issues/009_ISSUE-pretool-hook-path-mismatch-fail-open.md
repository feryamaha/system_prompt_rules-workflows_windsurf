# Registro de Incidente Tecnico: Path Mismatch no PreToolUse Hook + Fail-Open

## 1. Descricao do Problema

**Arquivo:** `.nemesis/hooks/nemesis-pretool-check.js` (linha 15)

**Falha Detectada:** O entry point universal do Nemesis PreToolUse hook hardcodava o path `src/workflow-enforcement/cli/pretool-hook.ts`, mas em projetos que instalam o Nemesis via pacote, os arquivos de enforcement ficam em `.nemesis/workflow-enforcement/cli/pretool-hook.ts`. Isso causava `ERR_MODULE_NOT_FOUND`, que combinado com a politica fail-open (exit 0 em caso de erro), permitia que TODAS as operacoes passassem sem validacao.

**Gravidade:** Critica - 6 operacoes com violacoes multiplas (any, CSS inline, tipagem inline, edicao de package.json e tsconfig.json) foram executadas sem bloqueio.

## 2. Origem do Problema

**Fonte:** Teste deliberado de stress no projeto Portal-Dental-UNI_Auclan-Design, simulando solicitacao com violacoes intencionais de todas as regras do projeto.

**Problema Original:**
```javascript
// .nemesis/hooks/nemesis-pretool-check.js - Linha 15
const hookPath = path.join(__dirname, '..', '..', 'src', 'workflow-enforcement', 'cli', 'pretool-hook.ts');
// Resolve para: <raiz>/src/workflow-enforcement/cli/pretool-hook.ts
// Arquivo real: <raiz>/.nemesis/workflow-enforcement/cli/pretool-hook.ts
```

**Cadeia de Falha:**
```
Hook invocado pelo Windsurf PreToolUse
  -> nemesis-pretool-check.js procura em src/workflow-enforcement/
  -> Arquivo NAO existe (esta em .nemesis/workflow-enforcement/)
  -> ERR_MODULE_NOT_FOUND
  -> catch(error) -> error.status = undefined -> fallback para 0
  -> stderrOutput NAO contem "NEMESIS BLOCKED"
  -> isBlocked = false
  -> process.exit(0) -> FAIL-OPEN
  -> Windsurf recebe exit 0 -> PERMITIDO
  -> 6 operacoes com violacoes passaram sem bloqueio
```

## 3. Fluxo de Tentativas e Falhas

### Tentativa 1: Analise Forense pelo Modelo do Projeto Real
**Abordagem:** Perguntar ao modelo que executou as violacoes por que o hook nao bloqueou.

**Resultado:** Confabulacao (LLM-BEHAVIOR-ANALYSIS.md secao 3.7)
- O modelo afirmou: "O Windsurf Cascade nao possui mecanismo nativo de runtime que intercepte tool calls"
- Isso era FALSO - o diagnostico posterior provou que o hook FOI invocado (recebeu stdin, executou node)
- O modelo fabricou explicacao plausivel porque nao sabia a causa real

### Tentativa 2: Diagnostico Programatico
**Abordagem:** 6 comandos de diagnostico executados no projeto real.

**Resultado:** Causa raiz identificada com precisao:
- Comando 1: `Arquivo existe: false` (path resolvido aponta para `src/` que nao existe)
- Comando 3: Arquivo real em `.nemesis/workflow-enforcement/cli/pretool-hook.ts`
- Comando 5: `ERR_MODULE_NOT_FOUND` -> `EXIT CODE: 0` (fail-open confirmado)
- Comando 6: Linha 15 hardcoda `'src', 'workflow-enforcement'`

## 4. Solucao Final (Aprovada)

**Estrategia:** Path auto-detection + fail-closed

**Codigo Implementado:**
```javascript
// RESOLUCAO AUTOMATICA DE PATH
const projectRoot = path.join(__dirname, '..', '..');
const possiblePaths = [
  // Localizacao 1: Repo original (src/workflow-enforcement/)
  path.join(projectRoot, 'src', 'workflow-enforcement', 'cli', 'pretool-hook.ts'),
  // Localizacao 2: Instalacao via pacote (.nemesis/workflow-enforcement/)
  path.join(projectRoot, '.nemesis', 'workflow-enforcement', 'cli', 'pretool-hook.ts'),
  // Localizacao 3: Relativo ao proprio .nemesis/hooks/
  path.join(__dirname, '..', 'workflow-enforcement', 'cli', 'pretool-hook.ts'),
];

let hookPath = null;
for (const candidate of possiblePaths) {
  if (fs.existsSync(candidate)) {
    hookPath = candidate;
    break;
  }
}

if (!hookPath) {
  // FAIL-CLOSED: bloqueia se hook nao encontrado
  process.exit(2);
}
```

**Mudanca de politica de erro:**
```javascript
// ANTES (fail-open): erro interno -> exit 0 -> PERMITIDO
// DEPOIS (fail-closed): erro interno -> exit 2 -> BLOQUEADO
```

**Justificativa Tecnica:**
1. **Path auto-detection:** Procura em 3 localizacoes possiveis, funciona em qualquer estrutura de projeto
2. **Fail-closed:** Erros internos bloqueiam em vez de permitir, eliminando falhas silenciosas
3. **Mensagens claras:** Cada cenario de erro produz mensagem com "NEMESIS BLOCKED" no stderr

## 5. Contexto do Componente

**Responsabilidade:** O `nemesis-pretool-check.js` e o entry point universal que o Windsurf executa antes de cada operacao Edit/Write/Bash. Ele delega para `pretool-hook.ts` via `npx tsx`.

**Impacto da Falha:** Com fail-open, qualquer erro interno no hook (path errado, dependencia ausente, timeout) permitia silenciosamente TODAS as operacoes, tornando o enforcement completamente ineficaz.

## 6. Verificacao Final

**Testes executados apos correcao:**

| Teste | Input | Resultado | Exit Code |
|---|---|---|---|
| Uso de `any` | `{"tool_name":"Write","tool_input":{"file_path":"src/test.ts","new_string":"const x: any = 5;"}}` | NEMESIS BLOCKED | 2 |
| Arquivo critico | `{"tool_name":"Edit","tool_input":{"file_path":"package.json",...}}` | NEMESIS BLOCKED | 2 |
| CSS inline + any em UI | `{"tool_name":"Write","tool_input":{"file_path":"src/components/ui/SuperCard.tsx",...}}` | NEMESIS BLOCKED | 2 |

**Status:** Resolvido

## 7. Licoes Aprendidas

1. **Fail-closed e obrigatorio em sistemas de seguranca:** Erros internos NUNCA devem resultar em permissao. Este e um principio basico de seguranca que foi violado no design original.
2. **Paths hardcodados sao frageis:** O hook deve detectar automaticamente onde os arquivos estao, pois a estrutura varia entre repo de desenvolvimento e projetos que instalam via pacote.
3. **Confabulacao de LLMs em diagnosticos:** O modelo do projeto real fabricou a explicacao "Windsurf nao tem hooks" quando nao sabia a causa real. Diagnosticos programaticos (comandos de verificacao) sao mais confiaveis que analise forense feita por LLMs.
4. **Teste de stress e essencial:** O teste deliberado com violacoes intencionais expôs um bug critico que nunca teria sido encontrado em uso normal.

## 8. Cruzamento com LLM-BEHAVIOR-ANALYSIS.md

Este incidente confirmou empiricamente 3 padroes documentados:
- **Secao 3.7 (Justificativa Post-Facto):** Modelo confabulou "Windsurf nao tem hooks" como explicacao
- **Secao 3.8 (Regras como Abstratas):** Modelo marcou checkboxes de bloqueio mas executou violacoes
- **Secao 4.3 (Token vs Bit):** Sem o bit (exit code 2), as regras (tokens) foram negociadas pelo modelo

**Data de criacao:** 11 de fevereiro de 2026
**Status:** Resolvido
**Arquivos corrigidos:** `.nemesis/hooks/nemesis-pretool-check.js`
