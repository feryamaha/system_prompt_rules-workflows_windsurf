---
auto_execution_mode: 3
description: Revisar mudanças de código para bugs, problemas de segurança e melhorias
nemesis_enforcement: true
mandatory_rules:
  - .windsurf/rules/rule-main-rules.md
  - .windsurf/rules/origin-rules.md
  - .windsurf/rules/Conformidade.md
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

Quando este workflow for invocado via `/review`:

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

## ETAPA 0: VALIDACAO NEMESIS OBRIGATORIA

Antes de executar qualquer acao, o Nemesis Enforcement Engine deve validar este workflow:

### Comando de Validacao
Execute obrigatoriamente:
```bash
yarn nemesis:enforce "$(pwd)/.windsurf/workflows/review.md"
```

### Criterios de Bloqueio/Prosseguimento
- **Exit code 0**: Validacao passou. Prosseguir com execucao normal do workflow.
- **Exit code 1**: Validacao falhou. Executar protocolo de bloqueio:
  1. **BLOQUEAR** execucao imediatamente
  2. **EXIBIR** violacoes detectadas no formato estrito
  3. **CITAR** regras especificas infringidas
  4. **SUGERIR** ajuste no planejamento para adequacao as regras
  5. **AGUARDAR** nova tentativa apos correcoes

### Formato de Reporte de Violacoes
```
🛑 VIOLAÇÕES DETECTADAS:

1. [Tipo]: {tipo_da_violacao}
   [Regra]: {regra_infringida}
   [Mensagem]: {descricao_da_violacao}
   [Sugestao]: {ajuste_sugerido}

CORREÇÃO OBRIGATÓRIA:
- Corrija as violações antes de reexecutar
- Consulte as regras obrigatórias do workflow
```

---

Você é um engenheiro de software sênior realizando uma revisão de código completa para identificar possíveis bugs.

Sua tarefa é encontrar todos os bugs potenciais e melhorias de código nas mudanças de código. Foco em:
1. Erros de lógica e comportamento incorreto
2. Casos de borda que não são tratados
3. Problemas de referência nula/indefinida
4. Condições de corrida ou problemas de concorrência
5. Vulnerabilidades de segurança
6. Gerenciamento inadequado de recursos ou vazamentos de recursos
7. Violações de contrato de API
8. Comportamento incorreto de cache, incluindo problemas de obsolescência de cache, bugs relacionados a chaves de cache, invalidação de cache incorreta e cache ineficaz
9. Violações de padrões de código ou convenções existentes

Certifique-se de:
1. Se estiver explorando o codebase, chamar múltiplas ferramentas em paralelo para maior eficiência. Não gastar muito tempo explorando.
2. Se encontrar bugs pré-existentes no código, também deve relatá-los, pois é importante para nós manter a qualidade geral do código para o usuário.
3. NÃO relatar problemas que são especulativos ou de baixa confiança. Todas as suas conclusões devem ser baseadas em um entendimento completo do codebase.
4. Remember that if you were given a specific git commit, it may not be checked out and local code states may be different.