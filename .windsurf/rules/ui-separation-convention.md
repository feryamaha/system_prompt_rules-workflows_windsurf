---
trigger: always_on
---
# Convenção Oficial de UI (Separação de Responsabilidades)

## 1. Visão Geral

Este repositório utiliza **Next.js + React + TypeScript**.

Neste projeto, arquivos de UI (principalmente `.tsx`) seguem um princípio arquitetural rígido:

- **UI é apenas UI (renderização)**
- Lógica (estado, efeitos, regras e helpers) vive fora do componente, em camadas próprias.

O objetivo desta convenção é garantir:

- Componentes mais previsíveis e fáceis de ler.
- Reutilização de lógica (sem duplicação).
- Separação clara de responsabilidades entre UI, hooks, utils e context.

---

## 2. Princípio Arquitetural (Obrigatório)

- **UI (`.tsx`)**
  - Responsável por JSX, classes/estilos e renderização.
  - Pode conter condicionais puramente visuais.
  - Pode conter handlers simples que apenas delegam.

- **Hooks (`src/hooks/**`)**
  - Estado e side-effects (`useState`, `useEffect`, `useMemo` quando for regra de composição de dados).
  - Integração com context.
  - Orquestração de eventos e fluxos.

- **Utils / Libs (`src/utils/**` e `src/libs/**`)**
  - Helpers puros (normalização, cálculos, parsing, formatação).
  - Funções reutilizáveis sem dependência de UI.

- **Tipagens (`src/types/**`)**
  - Contratos de entrada/saída (design-time).
  - **Proibido mover tipagens para dentro da UI**.

---

## 3. Regra Geral (Obrigatória)

- Arquivos `.tsx` de UI devem **consumir**:
  - hooks (`src/hooks/**`)
  - utils/libs (`src/utils/**`, `src/libs/**`)
  - data (`src/data/**`)
  - context (`src/context/**`)
  - types (`src/types/**`)

E devem evitar implementar lógica de negócio dentro do próprio componente.

---

## 4. O que é considerado “NÃO UI” (deve sair do `.tsx`)

### 4.1 Estado e efeitos
- `useState` / `useEffect` que controlam fluxos.
- timers, listeners globais, click-outside, escape key.
- composição/normalização de dados de domínio.

### 4.2 Regras e helpers
- parsing de erros (ex.: estruturas do React Hook Form).
- máscaras, validações de entrada, normalização.
- regras condicionais de domínio.

---

## 5. O que pode permanecer no `.tsx`

- JSX.
- classes e composição visual (ex.: `clsx`, `twMerge`, Tailwind).
- imports de hooks/utils/data/context/types.
- handlers simples (delegando para hooks).

---

## 6. Processo obrigatório ao criar/alterar UI

Antes de criar qualquer arquivo novo:

1. Verificar se a responsabilidade já existe em:
   - `src/hooks/**`
   - `src/utils/**`
   - `src/libs/**`
   - `src/data/**`
   - `src/context/**`
2. Reutilizar o que existir.
3. Só criar arquivo novo se realmente não existir nada equivalente.
4. Exportar mantendo contratos públicos (sem renomear contratos existentes).

---

## 7. Proibições

- **PROIBIDO usar `any`.**
- **PROIBIDO duplicar lógica.**
- **PROIBIDO mover tipagens para fora de `src/types`.**
- **PROIBIDO alterar contratos públicos sem alinhamento (tipos, props, exports).**

---

## 8. Convenções de nomes (padrão do repositório)

- Hooks:
  - `use-<feature>.hook.ts`
- Helpers:
  - `*.helpers.ts`
- Logic:
  - `*.logic.ts`

## 9. Concessões

- **Button (`src/components/ui/Button.tsx`)** – componente smart autorizado a manter arquitetura híbrida (tipagem explícita + lógica interna necessária) por ser responsável por múltiplas variantes e estados de interação.
- **Container (`src/components/ui/Container.tsx`)** – componente estrutural responsivo que também possui concessão para combinar tipagem inline e lógica utilitária (ex.: variantes de padding e presets de largura). Ele atua como wrapper global alinhado ao preset do Tailwind (`container max-w-containerLarge`) e, portanto, pode expor props e cálculos diretamente no arquivo UI quando necessário.
- **InputPesquisaAjuda.tsx** este arquivo possui imunidade e concessão para absorver codigo logica e tipagem dentro do proprio arquivo por ser tratar de um arquivo SMART/Hibrido responsavel pelo seu autocontrole.

### 9.1 Padrão para Componentes Smart

Componentes smart são componentes que **precisam combinar UI e lógica** por natureza de sua responsabilidade:

#### **Características de Componentes Smart:**
- **Auto-controle**: Gerenciam seu próprio estado interno
- **Interações complexas**: Múltiplos estados e transições
- **Lógica de negócio embutida**: Validações, transformações, regras
- **Comportamento autônomo**: Funcionam independentemente de controle externo

#### **Identificação de Componentes Smart:**
- **COMENTÁRIO OBRIGATÓRIO**: Presença de `// SMART COMPONENT` no topo do arquivo (MÉTODO PRINCIPAL)
- Nomenclatura opcional: "Smart", "Control", "Manager", "Handler" (apenas para legibilidade)
- Componentes com múltiplas variantes e estados
- Componentes que precisam de estado interno complexo
- Componentes com validações embutidas

#### **Exemplos de Componentes Smart:**
- `SmartForm.tsx` - Formulário com validação interna
- `DropdownControl.tsx` - Dropdown com gerenciamento de estado
- `ModalManager.tsx` - Modal com lógica de abertura/fechamento
- `DatePickerSmart.tsx` - Date picker com validação de datas
- `TableInteractive.tsx` - Tabela com ordenação e filtros

#### **Regras para Componentes Smart:**
1. **COMENTÁRIO OBRIGATÓRIO**: Adicionar `// SMART COMPONENT` no topo do arquivo
2. **Documentar lógica**: Explicar por que a lógica está embutida
3. **Manter coesão**: Lógica deve ser diretamente relacionada à UI
4. **Evitar excesso**: Se a lógica for muito complexa, mover para hooks

#### **Permissões Concedidas:**
- ✅ **useState/useEffect** para estado interno
- ✅ **Lógica de validação** diretamente no componente
- ✅ **CSS inline** apenas quando necessário para comportamento dinâmico
- ✅ **Tipagem inline** para props complexas
- ✅ **Múltiplos hooks** quando justificado

#### **Exemplo de Componente Smart:**
```typescript
// SMART COMPONENT - Dropdown com gerenciamento de estado interno
export function DropdownControl({ options, onSelect }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState('');

  // Lógica de validação embutida
  const handleSelect = (value: string) => {
    if (options.includes(value)) {
      setSelectedValue(value);
      onSelect(value);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      {/* UI com lógica integrada */}
    </div>
  );
}
```

### 9.2 Detecção Automática pelo Nemesis Enforcement

O sistema Nemesis identifica componentes smart através de:

1. **COMENTÁRIO OBRIGATÓRIO**: Presença de `// SMART COMPONENT` no topo do arquivo (MÉTODO PRINCIPAL)
2. **Nomenclatura opcional**: Arquivos com "Smart", "Control", "Manager" (apenas legibilidade)
3. **Localização**: Componentes em `/components/ui/` com lógica justificada
4. **Contexto**: Componentes com interações complexas

#### **Validação Automática:**
- Componentes smart são **isentos** de validações de separação UI/lógica
- Ainda passam por validações de **acessibilidade** e **padrões**
- Devem **documentar** por que são smart

#### **Exceções Manuais:**
Para componentes smart não detectados automaticamente, adicionar ao arquivo `.nemesis/smart-components.json`:

```json
{
  "smartComponents": [
    "src/components/ui/CustomSmartComponent.tsx",
    "src/components/ui/AnotherSmart.tsx"
  ]
}
``` 
