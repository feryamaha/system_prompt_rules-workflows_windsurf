---
name: review
description: Revisar mudanças de código para bugs, problemas de segurança e melhorias
auto_execution_mode: 3
hooks:
  PreToolUse:
    - matcher: "Edit|Write|Bash"
      hooks:
        - type: command
          command: "node $PROJECT_DIR/.nemesis/hooks/nemesis-pretool-check.js"
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
5. **LEITURA DE ARQUIVOS**: NUNCA usar leitura nativa (Read/Access file) para pastas .windsurf/, .nemesis/ e Feature-Documentation/ - SEMPRE usar `cat` no terminal porque esses arquivos estao protegidos pelo .gitignore. Exemplo:
   ```powershell
   cat ".windsurf/rules/rule-main-rules.md"
   cat "Feature-Documentation/PR/PR_001_exemplo.md"
   ```

---

## REGRAS A SEREM SEGUIDAS
Regras obrigatórias: .windsurf/rules/rule-main-rules.md e .windsurf/rules/origin-rules.md

@[.windsurf/rules/rule-main-rules.md]
@[.windsurf/rules/origin-rules.md]

## Enforcement Automatico

O Nemesis Enforcement Engine valida automaticamente cada operacao Edit/Write/Bash via PreToolUse hook. Nenhuma etapa voluntaria e necessaria - o hook roda antes de cada acao da IA.

Validacoes automaticas:
- Uso de `any` em TypeScript (bloqueado)
- `useState`/`useEffect` em componentes UI puros (bloqueado)
- Tipos inline em componentes reutilizaveis (bloqueado)
- CSS inline (bloqueado)
- Arquivos fora do escopo RAG (bloqueado se scope.json ativo)
- Comandos destrutivos (bloqueado)
- Arquivos criticos sem autorizacao (bloqueado)