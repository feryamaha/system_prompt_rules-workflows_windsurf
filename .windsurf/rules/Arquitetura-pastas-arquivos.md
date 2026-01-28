---
trigger: always_on
---
# Arquitetura de Pastas, Arquivos e Componentes

> Documento mestre para criação e manutenção de arquivos. Leia também:
> - @Feature-Documentation/typescript-typing-convention.md
> - @Feature-Documentation/ui-separation-convention.md

---

## 1. Objetivo

Garantir que todo novo arquivo siga o fluxo oficial:

```
UI base (src/components/ui)
        ↓
Blocos compartilhados (src/components/shared e src/components/shared-tela-login)
        ↓
Montagem por domínio (src/components/main-content e src/components/dashboard-layout)
        ↓
Rotas e hidratação (src/app/**)
        ↓
Experiência final no navegador
```

Cada nível conhece somente o nível imediatamente abaixo e usa contratos definidos em `src/types`. Lógica (estado, efeitos, normalização) fica em hooks/utils/data/context.

---

## 2. Visão macro das pastas

```
src/
├── app/                 # Rotas, layouts e hydration
├── components/
│   ├── ui/              # Componentes básicos, sem lógica
│   ├── shared/          # Blocos compartilhados entre telas/domínios
│   └── main-content/    # Montagem visual dos domínios
├── data/                # Mocks, configs, copy
├── hooks/               # Lógica reutilizável (estado, efeitos)
├── types/               # Tipagens (contratos)
├── utils/ e libs/       # Helpers puros
└── Feature-Documentation/ # Este documento e demais guias
```

---
## 3. {aguardando novo conteudo}

---

## 4. Regras por pasta

### 4.1 `src/components/ui`
- **Sem** hooks ou chamadas a `useState`.
- Recebem somente props tipadas (`import type { … } from '@/types/ui/...`).
- Nome do arquivo = nome do componente (`Badge.tsx`, `NotificationBadge.tsx`).
- Exportação sempre nomeada (`export function Badge()`).

### 4.2 `src/components/shared`
- Utilizam UI + hooks + dados.
- Podem conter pequena lógica de apresentação (ex.: ordenação visual).
- Devem expor props em `src/types/shared/*.types.ts`.
- São responsáveis por manter o contrato visual do Figma (classes, spacing).

### 4.3 `src/components/shared-tela-login`
- Mesmas regras de `shared`, porém focadas no fluxo público.
- Não podem importar nada de `main-content` ou rotas autenticadas.

### 4.4 `src/components/dashboard-layout`
- Estruturas fixas (Sidebar, Topbar, etc.).
- Consomem configs vindas de `src/data`.
- Não devem instanciar conteúdo de domínio; apenas navegação/ações.
- Quando houver badges/indicadores, componentizar em `ui`.

### 4.5 `src/components/main-content`
- Estrutura:
  ```
  src/components/main-content/
  ├── [dominio]/
  │   ├── Pagina-inicial[Dominio].tsx
  │   ├── [Dominio][Recurso]Content.tsx
  │   └── ...
  ```
- Cada domínio segue o padrão `[Dominio][Recurso]Content`.
- `Pagina-inicial[Dominio]` orquestra blocos compartilhados.
- Conteúdos individuais servem à rota dinâmica (e devem ser apenas JSX).
- Não importar `next/navigation` nem manipular rota diretamente.

### 4.6 `src/app`
- `layout.tsx`: setup global (fonts, metadata, `<body>`).
- `page.tsx`: redireciona para rota de entrada do projeto.
- `globals.css`: tokens de cor, reset, utilitários.
- `not-found.tsx`: fallback genérico.
- `App-[dominio]/page.tsx` reexporta `[slug]/page`.
- `[slug]/page.tsx`: rota dinâmica. Deve:
  ```tsx
  'use client'
  import { useDominioContentLogic } from '@/hooks/...'

  export default function DominioDynamicPage() {
      const { currentContent } = useDominioContentLogic()
      return (
          <>{/* conteúdo */}</>
      )
  }
  ```
- Rotas públicas possuem layout próprio, conforme necessidade do projeto.

### 4.7 `src/data`
- Subpastas:
  - `mocks/`: dados fake para recursos.
  - `config/`: configurações e copy do projeto.
  - `auth/` (se houver): credenciais e redirecionamentos mock.
- Chaves devem usar os slugs oficiais definidos pelo projeto.

### 4.8 `src/hooks`
- Organização em pastas por domínio/feature.
- Hooks de roteamento devem centralizar a decisão de conteúdo a partir do `pathname`.

### 4.9 `src/types`
- Todos os contratos vivem aqui.
- Nome do arquivo: `kebab-case` + `.types.ts`.
- Nome de interface: `ComponentNameProps`, etc.
- Lembre de reexportar tipos quando facilitar consumo.

---

## 5. Rotas, hidratação e navegação

1. `src/app/layout.tsx` configura HTML e fontes.
2. `src/app/page.tsx` redireciona para a rota de entrada.
3. Rotas públicas usam componentes de `shared` + `ui`.
5. `App-[dominio]/page.tsx` reexporta `[slug]/page`.
6. `[slug]/page.tsx` consulta o hook de conteúdo e renderiza o conteúdo correto.
7. Componentes de conteúdo consultam dados em `src/data` e usam blocos de `shared`/`ui`.

### Naming das rotas
- Diretórios: `App-[dominio]` conforme o padrão do projeto.
- Rota dinâmica: `[slug]/page.tsx` (singular). Não criar `[...slug]`.
- Segmentos esperados devem existir como `id` em config de navegação.

---

## 6. Convenções de nomes e exports

| Contexto                         | Formato obrigatório                                     | Exemplo                           |
|---------------------------------|----------------------------------------------------------|-----------------------------------|
| Arquivos UI                     | `PascalCase.tsx`                                         | `NotificationBadge.tsx`           |
| Componentes shared              | `PascalCase.tsx`                                         | `ShortcutsSection.tsx`            |
| Conteúdo de domínio              | `{Dominio}{Funcao}Content.tsx`                            | `ClienteBoletosContent.tsx`       |
| Hooks                           | `useNomeFuncao.hook.ts`                                  | `useDominioContentLogic.hook.ts`   |
| Helpers                         | `*.helpers.ts`                                           | `dashboard-path.helpers.ts`       |
| Tipagens                        | `kebab-case.types.ts`                                    | `sidebar-config.types.ts`         |
| Exports                         | Nomeados, alinhados ao nome do arquivo                   | `export function Pagina-inicialDominio()`   |
| Diretórios de domínio            | `App-{slug}` no `src/app/(dashboard)`; `{slug}` em `main-content` | `App-cliente`, `cliente/` |

---

## 7. Fluxo para criar um novo bloco/domínio

1. **Definir UI base** em `src/components/ui` (criar somente se não existir).
2. **Montar bloco shared** reutilizando a UI.
3. **Adicionar variação específica**:
   - Para login: `src/components/shared-tela-login` (se existir).
   - Para dashboard: `src/components/dashboard-layout` ou `src/components/main-content/[dominio]`.
4. **Atualizar dados** em `src/data` (configs, mocks, copy).
5. **Atualizar hooks/config** se necessário (hooks de conteúdo, helpers de path).
6. **Garantir rota**:
   - `src/app/(dashboard)/App-{slug}/page.tsx` reexporta `[slug]/page`.
   - `[slug]/page.tsx` conhece todos os `currentContent`.
7. **Testar** `yarn build` (typecheck + lint) antes do commit.

---

## 8. Fluxos de dados e lógica

```
src/data/** (mocks, configs, copy)
      ↓
src/components/shared e shared (blocos visuais)
      ↓
src/components/main-content/[dominio] (montagem da página)
      ↓
src/app/(dashboard)/App-*/[slug]/page.tsx (hidratação condicional)
      ↓
Layout principal 
      ↓
Experiência final no navegador
```

Lógica (estado, side-effects, roteamento) reside em `src/hooks`:
- `useDominioDetector` → identifica domínio na Sidebar.
- `useDominioContentLogic` → entende o slug e escolhe o conteúdo.
Nenhum componente em `main-content` deve recriar essas regras.

---

## 9. Checklist antes de abrir PR

- [ ] Seguiu o fluxo UI → shared → montagem → rota.
- [ ] Tipagens adicionadas em `src/types` e importadas com `import type`.
- [ ] Nenhum `any`, `useState` ou `useEffect` dentro de UI básica.
- [ ] Configs de navegação e conteúdo atualizadas quando necessário.
- [ ] Hooks de conteúdo conhecem todos os slugs usados na navegação.
- [ ] `yarn build` ok antes do push.

---

**Última atualização:** 7 de janeiro de 2026
