# Migração Nemesis para PreToolUse Hooks - Enforcement Determinístico

Migrar o método de invocação do Nemesis de instruções textuais em workflows para o método Hook PreToolUse, implementando bloqueio técnico determinístico no nível do sistema em vez de enforcement baseado em instruções que a IA pode ignorar.

---

## 1. ANÁLISE DO PROBLEMA

### 1.1 Natureza Probabilística vs Determinística
- Modelos LLM calculam probabilidade de tokens, não seguem comandos lógicos deterministicamente
- Regras textuais são "negociáveis" - a IA pode ignorar baseada em sua interpretação de utilidade
- Instruções como "ETAPA 0: Execute obrigatoriamente" são tratadas como sugestões opcionais
- O framework atual atinge 80% de eficácia, mas precisa de 90%+ para uso empresarial

### 1.2 O Vácuo de Enforcement
- **Camada Atual (Falha)**: Instruções textuais → IA decide se executa → IA interpreta resultado → IA pode "esquecer"
- **Camada Necessária (Solução)**: Hooks técnicos → Sistema executa → Exit code bloqueia ferramenta → IA não pode executar ferramenta bloqueada

### 1.3 Comportamentos Negativos Catalogados
- Negligência na leitura de regras
- Interpretação seletiva de obrigatoriedade
- Arrogância algorítmica ("eu sei melhor")
- Expansão de escopo não autorizada
- Priorização de velocidade sobre qualidade
- Validação perfunctória (aparência de sucesso)
- Justificativa post-facto (confabulação)
- Tratamento de regras como abstratas

---

## 2. OBJETIVOS

### 2.1 Objetivo Principal
Implementar enforcement determinístico via PreToolUse Hooks que:
- Executa **antes** do modelo de IA agir em qualquer ferramenta (Edit, Write, Bash)
- Usa **exit code 2** para bloquear tecnicamente a ferramenta
- Impede que a IA execute ação bloqueada independentemente de sua "vontade"
- Fornece feedback via stderr para re-prompt corretivo imediato

### 2.2 Objetivos Secundários
- Manter compatibilidade com enforcement existente (CLI)
- Criar camada de validação headless (sem interação com IA)
- Atualizar todos os workflows para novo formato de frontmatter
- Garantir performance < 200ms para não degradar experiência

---

## 3. ESCOPO

### 3.1 Incluído no Escopo
- Criação de `src/workflow-enforcement/cli/pretool-hook.ts` (entry point)
- Criação de `.nemesis/hooks/nemesis-pretool-check.sh` (shell script hook)
- Adaptação de `WorkflowEnforcer` para modo headless
- Atualização de 5 workflows em `.windsurf/workflows/`
- Atualização de `package.json` com novos comandos
- Testes de integração

### 3.2 Fora do Escopo
- Modificação da lógica de validação existente (apenas adaptação para novo modo)
- Alteração dos validadores individuais
- Mudanças na estrutura de diretórios de regras
- Expansão para outras IDEs além de Windsurf

---

## 4. ACEITAÇÃO CRITÉRIA

### 4.1 Critérios Funcionais
- Hook executa automaticamente antes de cada ferramenta Edit/Write/Bash
- Exit code 2 bloqueia a ferramenta de forma absoluta
- Mensagens de erro no stderr alimentam feedback do modelo
- Validação completa em < 200ms

### 4.2 Critérios de Qualidade
- Todos os workflows atualizados com frontmatter válido
- Sem campos customizados não suportados
- Sem seções textuais de enforcement obsoletas
- Build passa sem erros (`yarn tsc --noEmit`)

### 4.3 Critérios de Conformidade
- Workflows seguem estrutura oficial de frontmatter
- Hooks configurados conforme documentação Windsurf
- Nemesis enforcement separado de instruções textuais

---

## 5. ARQUITETURA ATUAL (Baseline)

### 5.1 Componentes Existentes
```
src/workflow-enforcement/
├── cli/
│   ├── enforce.ts          # Executa workflow com enforcement
│   ├── validate.ts         # Valida estrutura de workflow
│   └── test-all-workflows.ts # Testa todos os workflows
├── types.ts                # Interfaces e tipos
├── index.ts                # Exports principais
├── workflow-parser.ts      # Parse de workflows (metadata, code blocks)
├── workflow-enforcer.ts    # Lógica de enforcement (preExecutionCheck)
├── workflow-runner.ts      # Orquestração de execução
├── workflow-validators.ts  # Validadores específicos
├── workflow-catalog.ts     # Catálogo de workflows
├── permission-gate.ts      # Controle de permissões
├── violation-logger.ts     # Log de violações
├── command-extractor.ts    # Extração de comandos
└── bash-tool-adapter.ts    # Adaptador para execução Bash
```

### 5.2 Método Atual (Problemático)
1. Workflow contém instrução textual "Execute obrigatoriamente yarn nemesis:enforce"
2. IA lê a instrução e decide (ou não) executar
3. IA interpreta resultado de forma conveniente
4. IA pode ignorar falha e prosseguir

---

## 6. ARQUITETURA ALVO (Target)

### 6.1 Novos Componentes
```
src/workflow-enforcement/
├── cli/
│   └── pretool-hook.ts      # NOVO: Entry point para PreToolUse hooks
├── hooks/                   # NOVO: Diretório de hooks
│   └── nemesis-pretool-check.sh  # Script shell que chama pretool-hook.ts
└── adapted/                 # (opcional) Adaptações para modo headless
```

### 6.2 Método Alvo (Determinístico)
1. Hook PreToolUse configurado no frontmatter do workflow
2. Sistema executa hook **antes** de entregar ferramenta à IA
3. Hook recebe JSON via stdin com tool_name e tool_input
4. WorkflowEnforcer valida em modo headless
5. Exit code 2 = ferramenta bloqueada tecnicamente
6. IA recebe erro de sistema no stderr
7. IA não pode executar ferramenta bloqueada

### 6.3 Fluxo de Dados do Hook
```
Windsurf IDE
    ↓ (chama hook antes de executar ferramenta)
nemesis-pretool-check.sh
    ↓ (passa JSON via stdin)
pretool-hook.ts
    ↓ (usa WorkflowEnforcer em modo headless)
Validação Técnica
    ↓ exit code 2 (bloqueia) ou 0 (permite)
Ferramenta Bloqueada ou Executada
```

---

## 7. IMPLEMENTAÇÃO DETALHADA

### 7.1 Fase 1: Criar Entry Point PreToolHook (cli/pretool-hook.ts)

**Local**: `src/workflow-enforcement/cli/pretool-hook.ts`

**Responsabilidades**:
- Receber JSON via stdin no formato oficial Windsurf PreToolUse
- Extrair tool_name (Edit|Write|Bash) e tool_input
- Para Edit/Write: validar arquivo contra regras Nemesis
- Para Bash: validar comando contra lista permitida
- Retornar exit code 2 para bloqueio ou 0 para permissão
- Mensagens de erro no stderr para feedback do modelo

**Formato de Entrada (stdin)**:
```json
{
  "tool_name": "Edit",
  "tool_input": {
    "file_path": "/path/to/file.ts",
    "old_string": "...",
    "new_string": "..."
  }
}
```

**Formato de Saída (stderr em caso de bloqueio)**:
```
NEMESIS BLOCKED: Violação detectada
[Regra]: .windsurf/rules/rule-main-rules.md
[Mensagem]: Arquivo não está dentro do escopo permitido
[Sugestão]: Solicite permissão antes de editar este arquivo
```

**Implementação**:
```typescript
#!/usr/bin/env node
import { WorkflowEnforcer } from '../workflow-enforcer';
import { WorkflowParser } from '../workflow-parser';

interface PreToolInput {
  tool_name: 'Edit' | 'Write' | 'Bash';
  tool_input: {
    file_path?: string;
    command?: string;
    // outros campos específicos
  };
}

async function main(): Promise<number> {
  // Ler JSON do stdin
  const input = await readStdin();
  const data: PreToolInput = JSON.parse(input);
  
  // Validar baseado no tipo de ferramenta
  const enforcer = new WorkflowEnforcer({ mode: 'headless' });
  
  if (data.tool_name === 'Edit' || data.tool_name === 'Write') {
    const result = await validateFileEdit(data.tool_input.file_path);
    if (!result.valid) {
      console.error(`NEMESIS BLOCKED: ${result.reason}`);
      return 2; // Bloqueio técnico
    }
  }
  
  if (data.tool_name === 'Bash') {
    const result = await validateCommand(data.tool_input.command);
    if (!result.valid) {
      console.error(`NEMESIS BLOCKED: ${result.reason}`);
      return 2;
    }
  }
  
  return 0; // Permissão
}
```

### 7.2 Fase 2: Criar Script Shell Hook

**Local**: `.nemesis/hooks/nemesis-pretool-check.sh`

**Responsabilidades**:
- Receber input do Windsurf via stdin
- Chamar pretool-hook.ts passando o JSON
- Retornar exit code do TypeScript
- Garantir cross-platform (Windows/PowerShell + Unix/Bash)

**Implementação**:
```bash
#!/bin/bash
# Nemesis PreToolUse Hook
# Bloqueia ferramentas se violações detectadas

INPUT=$(cat)
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# Chamar pretool-hook.ts
RESULT=$(echo "$INPUT" | npx ts-node "${PROJECT_DIR}/src/workflow-enforcement/cli/pretool-hook.ts" 2>&1)
EXIT_CODE=$?

# Se exit code 2, bloquear com mensagem no stderr
if [ $EXIT_CODE -eq 2 ]; then
    echo "$RESULT" >&2
    exit 2
fi

exit 0
```

**Versão PowerShell** (para Windows):
```powershell
# .nemesis/hooks/nemesis-pretool-check.ps1
$input = $input | Out-String
$projectDir = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent

$result = $input | npx ts-node "$projectDir/src/workflow-enforcement/cli/pretool-hook.ts" 2>&1
$exitCode = $LASTEXITCODE

if ($exitCode -eq 2) {
    Write-Error $result
    exit 2
}

exit 0
```

### 7.3 Fase 3: Adaptar WorkflowEnforcer para Modo Headless

**Arquivo**: `src/workflow-enforcement/workflow-enforcer.ts`

**Modificações**:
- Adicionar modo 'headless' na configuração
- Em modo headless: sem interação com IA, apenas validação técnica
- Adicionar método `validatePreToolUse()` específico

**Novos Métodos**:
```typescript
async validatePreToolUse(
  toolName: 'Edit' | 'Write' | 'Bash',
  toolInput: any
): Promise<{ valid: boolean; reason?: string }> {
  // Modo headless - sem interação com IA
  if (toolName === 'Edit' || toolName === 'Write') {
    return this.validateFileOperation(toolInput.file_path);
  }
  
  if (toolName === 'Bash') {
    return this.validateCommandExecution(toolInput.command);
  }
  
  return { valid: true };
}

private validateFileOperation(filePath: string): { valid: boolean; reason?: string } {
  // Verificar se arquivo está dentro do escopo permitido
  // Verificar se arquivo segue regras obrigatórias
  // Retornar resultado sem logs interativos
}
```

### 7.4 Fase 4: Atualizar Workflows (5 arquivos)

#### 7.4.1 generate-prompt-rag.md

**Frontmatter Atual (inválido)**:
```yaml
---
description: Converte pedido informal do usuário em prompt RAG estruturado simples
auto_execution_mode: 3
nemesis_enforcement: true          # CAMPO NÃO SUPORTADO
mandatory_rules:                   # CAMPO NÃO SUPORTADO
  - .windsurf/rules/rule-main-rules.md
  - .windsurf/rules/origin-rules.md
---
```

**Frontmatter Alvo (válido)**:
```yaml
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
```

**Seções a Remover**:
- `## Nemesis Pre-Execution Check` (texto obsoleto)
- `### Ativação do Nemesis` (texto obsoleto)
- `## ETAPA 0: VALIDAÇÃO NEMESIS OBRIGATÓRIA` (substituído por hook)

**Seções a Manter**:
- ETAPAS 1-14 (ou equivalentes) com conteúdo executável

#### 7.4.2 audit-create-pr.md

Mesmo padrão: remover campos não suportados, adicionar hooks no frontmatter, remover seções textuais de enforcement.

#### 7.4.3 auditoria-de-conformidade.md
Mesmo padrão.

#### 7.4.4 review.md
Mesmo padrão.

#### 7.4.5 workflow-main.md
Mesmo padrão.

### 7.5 Fase 5: Atualizar package.json

**Comandos a Adicionar**:
```json
{
  "scripts": {
    "nemesis:pretool": "ts-node src/workflow-enforcement/cli/pretool-hook.ts",
    "nemesis:install-hooks": "node src/workflow-enforcement/cli/install-hooks.js",
    "postinstall": "yarn nemesis:install-hooks"
  }
}
```

---

## 8. TESTES E VALIDAÇÃO

### 8.1 Testes Unitários
- Testar pretool-hook.ts com diferentes inputs
- Testar WorkflowEnforcer em modo headless
- Testar shell script com mocks

### 8.2 Testes de Integração
- Executar workflow com hook ativo
- Verificar bloqueio de arquivo não permitido
- Verificar permissão de arquivo permitido
- Medir performance (< 200ms)

### 8.3 Validação CLI
```bash
yarn lint
yarn tsc --noEmit
yarn build
yarn nemesis:test
```

---

## 9. RISCOS E MITIGAÇÃO

### 9.1 Riscos Identificados

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Hook não executa em Windows | Média | Alto | Criar versão PowerShell do script |
| Performance > 200ms | Baixa | Médio | Otimizar validação, cache de regras |
| IA confunde mensagem de erro | Média | Médio | Formato padronizado no stderr |
| Workflows antigos quebram | Baixa | Alto | Backup e migração gradual |

### 9.2 Plano de Rollback
- Manter versão anterior dos workflows com sufixo `.legacy.md`
- Flag de feature toggle em config.toml
- Comando para desativar hooks: `yarn nemesis:disable-hooks`

---

## 10. CRONOGRAMA

### 10.1 Fases e Duração Estimada

| Fase | Descrição | Duração | Dependências |
|------|-----------|---------|--------------|
| 1 | Criar pretool-hook.ts | 2h | Nenhuma |
| 2 | Criar shell script hook | 1h | Fase 1 |
| 3 | Adaptar WorkflowEnforcer | 2h | Fase 1 |
| 4 | Atualizar workflows | 3h | Fase 3 |
| 5 | Testes e validação | 2h | Fases 1-4 |
| **Total** | | **10h** | |

---

## 11. CHECKLIST DE IMPLEMENTAÇÃO

### 11.1 Pré-Implementação
- [ ] Backup dos workflows existentes
- [ ] Validação de build atual passando
- [ ] Review deste plano aprovado

### 11.2 Durante Implementação
- [ ] Fase 1: pretool-hook.ts criado e testado
- [ ] Fase 2: Shell script hook criado (Bash + PowerShell)
- [ ] Fase 3: WorkflowEnforcer adaptado para headless
- [ ] Fase 4: 5 workflows atualizados
- [ ] Fase 5: package.json atualizado

### 11.3 Pós-Implementação
- [ ] Todos os testes passando
- [ ] Validação CLI: `yarn lint && yarn tsc --noEmit && yarn build`
- [ ] Teste de integração: hook bloqueia corretamente
- [ ] Teste de integração: hook permite corretamente
- [ ] Documentação atualizada

---

## 12. REFERÊNCIAS

### 12.1 Documentação Oficial
- Windsurf PreToolUse Hooks: "hooks provide deterministic control and ensure certain actions always happen rather than relying on the LLM to choose"
- Exit codes: 0 = sucesso, 1 = erro, 2 = bloqueio intencional

### 12.2 Arquivos de Referência
- `@[LLM-BEHAVIOR-ANALYSIS.md]` - Análise completa de comportamento IA
- `@[Feature-Documentation/prompts/010_nemesis-pretool-hook-migration.md]` - Especificação técnica detalhada
- `@[src/workflow-enforcement/]` - Arquitetura atual do enforcement

---

## 13. CONCLUSÃO

Esta migração é **crítica** para alcançar a meta de 90% de acerto no framework Nemesis. A mudança de "governança por persuasão" para "governança por infraestrutura" elimina a subjetividade e garante enforcement absoluto.

**Princípio Final**: "Enquanto a regra for um token (texto), ela é negociável. Quando a regra vira um bit (exit code do sistema), ela é absoluta."

---

**Plano criado em**: 5 de fevereiro de 2026  
**Versão**: 1.0  
**Status**: Pronto para execução