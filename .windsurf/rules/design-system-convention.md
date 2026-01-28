---
trigger: always_on
---
# Convenção de Design System (tokens e padrões visuais)

## 1. Objetivo
Este documento consolida os **tokens oficiais** do design system e as regras obrigatórias de criação e alteração de estilos.  

**Regra central inegociável:**  
Qualquer customização visual **deve nascer exclusivamente do `tailwind.config.ts`**. CSS manual, estilos inline, classes arbitrárias ou métodos fora do Tailwind são proibidos.

## 2. Tokens globais (fonte única de verdade)
Todos os tokens vivem em `tailwind.config.ts` e são consumidos via classes Tailwind.

### 2.1 Paleta de cores
- Categorias semânticas: `primary`, `secondary`, `neutral`, `accent`, `auxiliary`, `complementary`, `stroke`.
- Estados de feedback (alerta, erro, sucesso, info): usar sempre `auxiliary`.
- Proibido: cores hexadecimais diretas (`#FFF`, `#222`, etc.) em qualquer lugar, exceto reset em `globals.css`.

### 2.2 Tipografia
- Fontes oficiais: `Inter`, `Lato`, `Open Sans`.
- Definições em `globals.css`: `font-inter` no `body`, `font-lato` nos headings principais.
- Tamanhos: usar escala nativa do Tailwind (`text-xs` até `text-6xl`).

### 2.3 Espaçamento, grid e container
- Seguir rigorosamente a escala de spacing do config.
- Conteúdo centrado: reutilizar componente `Container` padrão.
- Grids: evitar criações ad hoc; priorizar padrões já consolidados.

### 2.4 Radius e sombras
- Preferência: `rounded-md`, `rounded-lg`, `rounded-2xl`.
- Sombras: `shadow-10`, `shadow-60`, `shadow-custom` (definidos no config).

### 2.5 Breakpoints
- Customizados: `@mobile`, `@tablet`, `@laptop`, `@Desktop`, `@Desktop1440`, `@LargeDesktop`, `@UltraWide`.

## 3. Regras para criação e alteração de tokens
1. Se o token já existe no Tailwind ou no config → **reutilizar**.
2. Se for recorrente e não existir → adicionar no `tailwind.config.ts` com nome semântico claro.
3. Jamais criar tokens isolados em `globals.css`, classes locais ou CSS modules.
4. Variações pontuais → usar `className` no componente (sem duplicar lógica).
5. **Proibição absoluta:** CSS inline, `<style>` tags ou qualquer método que fuja do Tailwind.

## 4. Anatomia e composição de componentes

### 4.1 Padrões de interação
- Hover, focus e disabled: alinhados aos tokens oficiais.
- Focus visível obrigatório: `focus-visible:outline-primary-500` (ou outline-2 + offset-2 quando necessário).

### 4.2 Botões
- Todo CTA **deve** usar o componente `Button`.
- Variações permitidas: primário, secundário, terciário, link, danger (e combinações com ícones).

### 4.3 Navegação
- Navegação global: componentes estruturais do layout.
- Breadcrumbs, tabs, modais: reutilizar componentes UI existentes.

### 4.4 Componentes compostos
- Tabelas: sistema de tabela oficial do DS.
- Modais: header, body e footer com subcomponentes dedicados.
- Elementos recorrentes (ícone + texto, badges, tags): sempre componente UI dedicado.

## 5. Guia de adoção por tipologia de componente

### 5.1 Componente UI básico
- Apenas markup + classes Tailwind puras.
- Sem `clsx`, sem `twMerge`, sem hooks.
- Exemplo: ícone isolado, divider, texto simples.

### 5.2 Componente UI mediano (com variantes)
- Permitido `clsx` + `twMerge` **exclusivamente** quando houver variantes visuais (cores, tamanhos, estados).
- Sem lógica de domínio ou negócios.
- Exemplo: Button, Badge, Tag, Alert, Card com variants.

### 5.3 Componente UI smart/híbrido
- Permitido apenas com justificativa formal documentada.
- Lógica de UI/UX isolada em hooks dedicados (`hooks-UI-UX/`), com tipagem explícita.
- Props sempre tipadas em `src/types/ui`.

## 6. Relação com `globals.css`
- Apenas reset + regras globais de base (font-family, etc.).
- Qualquer necessidade visual nova → Tailwind config.

## 7. Referências práticas
- Exemplos práticos devem apontar para componentes equivalentes no projeto atual.
- Manter documentação visual (Storybook, READMEs ou pasta /docs) atualizada.

## 8. Padrão oficial para componentes com variantes de estilo  
**Arquitetura de Estilização Inline com clsx + twMerge**

**Objetivo:**  
Documentar o padrão recomendado para componentes que precisam de múltiplas variantes visuais de forma eficiente, legível, performática e fácil de manter/extender.

**Essência da arquitetura:**  
Uma única chamada combina `clsx` (condicionais limpas) + `twMerge` (resolução inteligente de conflitos — última classe vence).

**Estrutura típica dentro do componente:**

```tsx
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const classes = twMerge(
  clsx(
    // Camada 0 – Base (sempre aplicado)
    "inline-flex items-center justify-center font-medium rounded-md transition-colors duration-200 cursor-pointer",

    // Camada 1 – Variante principal (intenção semântica)
    variant === "primary" && (
      disabled
        ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
        : "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
    ),
    variant === "secondary" && (
      disabled
        ? "border border-neutral-300 bg-white text-neutral-400 cursor-not-allowed"
        : "border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 active:bg-gray-100"
    ),
    variant === "ghost" && (
      disabled
        ? "text-neutral-400 cursor-not-allowed"
        : "text-gray-700 hover:bg-gray-100 active:bg-gray-200"
    ),

    // Camada 2 – Tamanho / Density
    size === "sm" && "px-3 py-1.5 text-sm gap-1.5",
    size === "md" && "px-4 py-2 text-base gap-2",
    size === "lg" && "px-6 py-3 text-lg gap-3",

    // Camada 3 – Modificadores independentes
    appearance === "destructive" && (
      disabled
        ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
        : "bg-red-600 text-white hover:bg-red-700 active:bg-red-800"
    ),
    appearance === "success" && (
      disabled
        ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
        : "bg-green-600 text-white hover:bg-green-700 active:bg-green-800"
    ),

    // Camada final – Maior precedência
    className
  )
); ````

## 8. Padrão oficial para componentes com variantes de estilo  
**Arquitetura de Estilização Inline com clsx + twMerge**

Ordem obrigatória das camadas (não alterar esta sequência):

1. Base
2. Variant
3. State modifiers (disabled, loading…)
4. Size / Density
5. Appearance / ColorScheme / Background overrides
6. className do usuário

Vantagens desse padrão para o Design System:

- Toda lógica de estilo fica dentro de clsx e twerge.
- Cada variante é auto-contida e fácil de entender isoladamente.
- Precedência previsível graças ao twMerge.
- Adicionar nova variante = copiar bloco + ajustar (menos de 2 minutos).
- Custo em runtime insignificante.
- Fácil auditoria: buscar por variant === localiza todas as intenções.
- Seguro contra duplicatas e conflitos.

Recomendações finais de uso:

Tratar disabled dentro de cada variant/modificador para estados visuais específicos.
Evitar lógica complexa dentro do clsx; isolar em variáveis quando necessário.
Criar helper cn em /lib/utils (export const cn = twMerge(clsx)) para padronizar em todo o projeto.
Esse padrão é o mesmo adotado por bibliotecas modernas como Shadcn/UI, Park UI e Tremor.

TODA VEZ QUE O USUARIO SOLICITAR A CRIAÇÃO DE UM COMPONENTE E CITAR QUE ELE DEVE SER CRIADO SEGUINDO A MESMA CONVENÇÃO DO COMPONENTE MODELO @Button.tsx é exatamente essa arquitetura que deve ser seguida.

## 9. Proibições absolutas – O que NUNCA fazer ao criar componentes com variantes

Estas práticas estão **expressamente proibidas** no Design System. 

1. **NUNCA** criar múltiplas constantes separadas (wrapperClasses, iconClasses, textClasses, etc.) que repitam a mesma condição `variant === "..."` várias vezes no mesmo arquivo.  
   → Isso quebra a consistência, multiplica erros humanos e torna manutenção 5× mais lenta.

2. **NUNCA** repetir a mesma cor, borda ou estado (ex: `text-white`, `bg-primary-700`) em mais de um lugar para o mesmo variant.  
   → Toda propriedade de um variant deve estar agrupada em **um único bloco**.

3. **NUNCA** espalhar a lógica de um variant por mais de um `clsx` ou constante.  
   → Todo o comportamento visual de um variant (bg, text, hover, border, icon color, placeholder, disabled…) deve ficar **dentro do mesmo ternário**.

4. **NUNCA** criar blocos condicionais separados para cada parte do componente (ex. ícone, input, wrapper, placeholder) quando eles dependem do mesmo `variant`.  
   → Isso viola DRY de forma grave e quase sempre gera inconsistências visuais.

5. **NUNCA** usar `clsx` sem `twMerge` em componentes com variantes (exceto casos muito simples sem conflito possível).  
   → Sem twMerge, conflitos de classes não são resolvidos automaticamente e o resultado fica imprevisível.

6. **NUNCA** adicionar uma nova variante tocando em mais de um lugar do arquivo.  
   → Se adicionar um variant exige alterar 3+ constantes diferentes, o componente está estruturado errado.
 
   → O @Button.tsx é o modelo oficial. Qualquer desvio deve ser justificado e aprovado previamente.

8. **NUNCA** justificar “separar por legibilidade” quando o resultado é repetição de condições.  
   → Legibilidade verdadeira vem de concentração da lógica, não de fragmentação. Um bloco grande bem comentado é muito mais legível do que cinco blocos pequenos repetitivos.

**Consequência:**  
A criação de componentes que precisa de variantes de estilos como o @Button.tsx que forem criados ou modificados que viole essas proibições será considerado hostil ao projeto e a refatoração, criação será rejeitada imediatamente.

## 10. Geração Automática de Componentes

### 10.1 Script de Geração Padrão

O projeto possui um script automatizado para criar componentes seguindo o modelo oficial do Design System.

**Comando de uso:**
```bash
yarn generate:component
```

**O que o script faz:**
- Cria um novo componente na pasta `src/components/ui/`
- Utiliza o template padrão com a arquitetura `clsx + twMerge`
- Gera o arquivo `NewComponent.tsx` como ponto de partida
- Fornece instruções para renomear e customizar

### 10.2 Template Oficial para Componentes

Todos os componentes gerados devem seguir este template base:

```tsx
import clsx from "clsx";
import { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

interface {{pascalCase name}}Props extends ComponentProps<"div"> {
  variant: "default" | "success";
}

export function {{pascalCase name}}({ variant, ...props }: {{pascalCase name}}Props) {
  const classes = twMerge(
    clsx(
      "flex",
      variant !== "default" && "flex",
      variant === "success" && "flex"
    )
  );

  return <div className={classes} {...props}></div>;
}
```

### 10.3 Fluxo de Trabalho Recomendado

1. **Executar o script:** `yarn generate:component`
2. **Renomear o arquivo:** Alterar `NewComponent.tsx` para o nome desejado
3. **Substituir placeholders:** Trocar `{{pascalCase name}}` pelo nome real do componente
4. **Ajustar as props:** Modificar as variantes e propriedades conforme necessidade
5. **Implementar estilos:** Seguir o padrão `clsx + twMerge` documentado na seção 8

### 10.4 Regras para Componentes Gerados

- **OBRIGATÓRIO:** Manter a estrutura `clsx + twMerge`
- **OBRIGATÓRIO:** Seguir a ordem das camadas definida na seção 8
- **OBRIGATÓRIO:** Usar apenas classes Tailwind definidas no config
- **PROIBIDO:** Adicionar CSS inline ou estilos manuais
- **PROIBIDO:** Quebrar o padrão de agrupamento por variantes

### 10.5 Localização dos Arquivos

- **Script:** `src/script/generate-component.mjs`
- **Template:** Incorporado diretamente no script
- **Saída:** `src/components/ui/[ComponentName].tsx`

Este método garante consistência em todos os novos componentes e acelera o desenvolvimento mantendo as convenções do Design System.