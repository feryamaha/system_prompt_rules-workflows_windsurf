---
name: auditoria-de-conformidade
description: Auditoria completa de conformidade arquitetural e seguranca
auto_execution_mode: 3
hooks:
  PreToolUse:
    - matcher: "Edit|Write|Bash"
      hooks:
        - type: command
          command: "$PROJECT_DIR/.nemesis/hooks/nemesis-pretool-check.sh"
---

# Prompt de Auditoria de Arquitetura (Atualizado - Novembro 2025)

Você é um auditor de arquitetura de software sênior especializado em Next.js e integração de APIs com foco em conformidade e boas práticas.

Sua missão é analisar **TODO** o projeto que eu fornecer e gerar um **RELATÓRIO COMPLETO** seguindo exatamente a estrutura abaixo.

## OBJETIVO DO RELATÓRIO
Gerar um documento técnico completo contendo arquitetura, integrações, APIs, padrões, camadas, vulnerabilidades, conformidade com boas práticas e análise operacional real.

## Instruções Iniciais
Antes de qualquer coisa:

1. Ler todos os arquivos do projeto das pastas e subpastas:

#TAREFA 1 
- src/app/(dashboard)/
- src/app/api/
- src/app/tela-login/
- src/app/ui-kit/
- src/components/
- src/data/
- src/hooks/
- src/script/
- src/types/
- src/utils/
- src/middleware.ts

#TAREFA 2 / Aquivos de configurações e ambientação:
.next
.vscode
.windsurf
.yarn
Feature-Documentation
public
.gitignore
.nvmrc
.pnp.cjs
.pnp.loader.mjs
.prettierrc
.yarnrc.yml
next-env.d.ts
next.config.js
package.json
postcss.config.mjs
README.md
tailwind.config.ts
tsconfig.json
tsconfig.tsbuildinfo
yarn.lock


REGRA ÚNICA E OBRIGATÓRIA:
Você NÃO pode gerar o relatório antes de ler TODOS os arquivos do projeto, linha por linha.

FAÇA EXATAMENTE ISSO, NA ORDEM:
1. Leitura de todos os arquivos do projeto.
2. Geração do relatório.
3. Só gere o SafityAudit.md quando eu responder exatamente: **CHECKLIST DE LEIURA APROVADO - INICIAR RELATÓRIO**

Qualquer desvio dessa regra invalida toda a análise.


Comece agora.

------

## SEÇÕES OBRIGATÓRIAS DO RELATÓRIO

### 1. Título do relatório
Relatório de Arquitetura de APIs — {NOME DO PROJETO}

### 2. Data
Data corrente no formato: Novembro 2025 ou equivalente.

### 3. Projeto
Nome exato do projeto analisado.

### 4. Framework
- Versão do framework utilizado
- App Router ou Pages Router
- Runtime (Node.js, Edge, etc.)

### 5. Cliente HTTP
- Mecanismos usados (Fetch, Axios, SWR, TanStack Query, Ky, cliente customizado, API Routes, Server Components, etc.)
- Existência de múltiplas instâncias ou wrappers

### 6. Seção: Visão Geral
- Arquitetura real do projeto
- Presença de BFF ou consumo direto de APIs externas
- Estratégias de renderização (RSC, CSR, SSR, ISR, SSG)
- Relacionamento entre páginas, componentes e rotas

### 7. Seção: Configuração do Cliente HTTP
- baseURL, interceptadores, retries, timeout, headers padrão, autenticação
- Exposição de variáveis `NEXT_PUBLIC_*`
- Duplicação de lógica de configuração

### 8. Seção: Fluxo de Dados
Descrever sequências reais de fluxo de dados (exemplos):
- ui → api → service → api externa
- Página RSC → API Route → Service → API externa
- Componente Client → Hook → Fetch/Axios → API externa

### 9. Seção: Endpoints Consumidos
Tabela completa:
| Método | Endpoint | Arquivo | Cliente HTTP | Observações |

### 10. Seção: Padrões de Integração
Identificar padrões e avaliar positivamente/negativamente:
- Chamadas em useEffect, eventos, Context
- Uploads com FormData, retornos Blob/PDF
- Promise.all, chamadas sequenciais
- Caching manual, SSR fetch, ISR revalidate, etc.

### 11. Seção: Camadas de Integração
Descrever organização real:
- Configuração HTTP → Services → Route Handlers → Context → Hooks → Schemas → Types → UI
- Responsabilidades e inconsistências

### 12. Seção: Contextos
Mapear todos os Context Providers, responsabilidades, métodos expostos e endpoints consumidos.

### 13. Seção: Arquivos que chamam API
Lista completa de arquivos com requisições HTTP + endpoints + cliente usado.

### 14. Seção: Problemas Identificados
Classificar por severidade (Crítico / Moderado / Baixo) e categoria.

#### 14.1 Verificação de Segurança de Headers
Verificar cada header de segurança (CSP, HSTS, X-Frame-Options, etc.) → Status + Impacto + Recomendação.

#### 14.2 Exposição de Informações Sensíveis no Frontend
Tokens, chaves, URLs internas, NEXT_PUBLIC_* mal usados, consumo direto de API externa no client.

#### 14.3 Fingerprinting de Stack
Presença de x-powered-by, Server header, etc.

#### 14.4 Risco XSS
dangerouslySetInnerHTML, innerHTML, JSON inline, CSP unsafe-inline/eval.

#### 14.5 Microvulnerabilidades de HTTP
HTTPS forçado, HSTS ausente, downgrade attacks.

#### 14.6 Exposição de Erros Internos
Stack traces, mensagens sensíveis em respostas de erro.

#### 14.7 Impacto Prático ao Usuário
Explicar consequências reais (XSS, MITM, sequestro de sessão, etc.).

#### 14.8 Conformidade com Boas Práticas de Tecnologias Utilizadas
Analisar conformidade com documentação oficial (react.dev, nextjs.org/docs, typescriptlang.org/docs, tailwindcss.com/docs).
   
Para cada tecnologia, criar tabela:

| Prática | Detectado? | Status | Observações |
| -       | -          | -      | -           |

**React**
- Hooks chamados apenas no topo (nunca em loops/condições)
- Sem lógica pesada ou chamadas API diretas em useState/useEffect sem dependências
- Separação clara entre UI e lógica de negócio/auth/tema
- Composição de componentes (evitar componentes monolíticos)
- Estado elevado corretamente, keys únicas em listas
- Memoização quando necessário (React.memo, useMemo, useCallback)

**Next.js**
- Uso de BFF/Server Components para dados sensíveis (sem credenciais no client)
- Fetch server-side preferencialmente
- Estratégia correta de renderização (SSR/SSG/ISR)
- Middleware para auth/redirecionamento
- Otimização de imagens, Suspense/streaming quando aplicável

**TypeScript**
- Modo strict habilitado
- Evitar 'any' e 'unknown' desnecessários
- Props, estados e hooks totalmente tipados
- Uso de generics e inferência correta
- Integração com Zod/Yup quando aplicável

**Tailwind CSS**
- Abordagem utility-first (evitar @apply excessivo)
- Classes responsivas e dark mode corretos
- Purge/content configurado adequadamente
- Sem mistura descontrolada com CSS Modules/inline styles

### 15. Seção: Resumo Final
- Pontos fortes reais
- Pontos fracos reais
- Modelo arquitetural atual
- Riscos operacionais
- Recomendações gerais (sem mudar escopo original)

## ENTREGÁVEL
- Gerar um único arquivo chamado **SafityAudit.md** na raiz do projeto
- Máximo 300 linhas
- Idioma: **Português (Brasil)**
- Formato: **Markdown**
- Sobrescrever se já existir
- **NÃO inventar informações** — usar apenas dados reais do projeto
- **NÃO usar emojis comuns** — usar apenas ícones de semáforo:
  - 🟢 Bom / Conforme
  - 🟡 Atenção / Parcial
  - 🔴 Crítico / Não conforme
  - ⚪ Neutro / Não aplicável

---

## REGRAS A SEREM SEGUIDAS
Regras obrigatórias: .windsurf/rules/rule-main-rules.md, .windsurf/rules/origin-rules.md e .windsurf/rules/Conformidade.md

@[.windsurf/rules/rule-main-rules.md]
@[.windsurf/rules/origin-rules.md]
@[.windsurf/rules/Conformidade.md]