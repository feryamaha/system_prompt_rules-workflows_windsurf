# Análise Genealógica de Componentes - Portal Dentista

## Visão Geral

Este documento apresenta a análise genealógica completa dos componentes que compõem os frames DENTISTA/HOME e DENTISTA/GRC do Portal Dentista, incluindo hierarquia de dependências, sub-componentes, hooks, types e arquitetura de dados.

---

## FRAME DENTISTA/HOME

### Estrutura Principal

#### **Entrada de Rota**
```
src/app/(dashboard)/portal-dentista/page.tsx
└── export default function Page()
    └── return <PortalDentistaDynamicPage />
```
#### **Rota Dinâmica**
```
src/app/(dashboard)/portal-dentista/[slug]/page.tsx
├── import { usePortalContentLogic } from '@/hooks/hooks-dash/usePortalContentLogic.hook'
├── import { HomeDentista } from '@/components/main-content/dentista/HomeDentista'
└── export default function PortalDentistaDynamicPage()
    ├── const { currentContent } = usePortalContentLogic()
    └── {currentContent === 'home' && <HomeDentista />}
```
### Arvore Genealógica Completa - DENTISTA/HOME

```
HomeDentista (main-content)
├── UI Components (Átomos)
│   ├── Button
│   ├── Icon
│   └── [Components via Shared]
├── Shared Components
│   ├── SliderBanner
│   │   ├── SliderControl (UI)
│   │   ├── useSliderBanner (Hook)
│   │   └── slider-banner.types.ts
│   ├── ShortcutsSection
│   │   ├── ShortcutCard (UI)
│   │   ├── useShortcutsSection (Hook)
│   │   └── shortcuts-section.types.ts
│   ├── NewsHighlightSection
│   │   ├── NewsFeatureCard (UI)
│   │   ├── NewsListEntry (UI)
│   │   ├── NewsSectionHeader (UI)
│   │   └── news-highlight-section.types.ts
│   ├── CardMeusProtocolos
│   │   ├── SubCardMeusProtocolos (UI)
│   │   ├── NewsSectionHeader (UI)
│   │   ├── sortProtocolsByPriority (Util)
│   │   └── card-meus-protocolos.types.ts
│   ├── CardCronograma
│   │   ├── SegmentedControl (UI)
│   │   ├── Widgets (UI)
│   │   ├── NewsSectionHeader (UI)
│   │   └── card-cronograma.types.ts
│   ├── ModalVerMaisProtocolos
│   │   ├── HeaderModalProtocolos (UI)
│   │   ├── SectionInfoMeusProtocolos (UI)
│   │   ├── FooterInfoModalProtocolos (UI)
│   │   ├── useModalVerMaisProtocolosUI (Hook)
│   │   └── modal-ver-mais-protocolos.types.ts
│   └── ModalVerMaisProtocolosConsentimento
│       ├── HeaderModalProtocolos (UI)
│       ├── FooterConsentimentoModalProtocolos (UI)
│       └── modal-ver-mais-protocolos.types.ts
├── Hooks (Lógica de Negócio)
│   ├── useSliderBannerData (hook-fetch-API)
│   ├── useNewsHighlightData (hook-fetch-API)
│   ├── useCronogramaData (hook-fetch-API)
│   ├── useModalVerMaisProtocolosLogic (hook-fetch-API)
│   └── usePortalContentLogic (hooks-dash)
├── Types (Contratos)
│   ├── slider-banner.types.ts
│   ├── shortcuts-section.types.ts
│   ├── news-highlight-section.types.ts
│   ├── card-meus-protocolos.types.ts
│   ├── card-cronograma.types.ts
│   ├── modal-ver-mais-protocolos.types.ts
│   ├── sub-card-meus-protocolos.types.ts
│   └── section-info-meus-protocolos.types.ts
├── Utils (Funções Puras)
│   └── protocol-priority.utils.ts
└── Dados (Mock/Config)
    └── dentista-meus-protocolos-content.data.ts
```

---

## FRAME DENTISTA/GRC
**Entrada de Rota**
```
src/app/(dashboard)/portal-dentista/[slug]/page.tsx
├── import { DentistaProtocolosContent } from '@/components/main-content/dentista/DentistaProtocolosContent'
├── import DentistaAbrirProtocolo from '@/components/main-content/dentista/DentistaAbrirProtocolo'
└── {currentContent === 'protocolos' && <DentistaProtocolosContent />}
```
### Componentes Principais

**1. DentistaProtocolosContent**

**Localização:** `src/components/main-content/dentista/DentistaProtocolosContent.tsx`

### Arvore Genealógica Completa - DENTISTA/GRC

```
DentistaProtocolosContent (main-content)
├── UI Components (Átomos)
│   ├── Alerts
│   ├── Button
│   ├── Icon
│   ├── ProtocolPriorityTag
│   ├── Pagination
│   ├── Badge
│   ├── BannerInfo
│   ├── DescriptionInformation
│   └── Table System
│       ├── Table
│       ├── TableHeader
│       ├── TableBody
│       ├── TableRow
│       ├── TableHead
│       ├── TableCell
│       └── TableContainer
├── Shared Components
│   ├── RecordsFilterHeader
│   │   ├── Button (UI)
│   │   ├── Tabs/Tab (UI)
│   │   ├── CardCalendar (UI)
│   │   ├── InputPesquisaAjuda (UI)
│   │   ├── DropdownMenu (UI)
│   │   ├── NotificationBadge (UI)
│   │   ├── useRecordsFilterHeader (Hook)
│   │   └── records-filter-header.types.ts
│   ├── ProtocolosMinhasOrientacoes
│   │   ├── Button (UI)
│   │   └── protocolos-minhas-orientacoes.types.ts
│   ├── ModalTimelineProtocolos
│   │   ├── [Vários componentes de timeline]
│   │   └── [Hooks e types específicos]
│   └── ProtocolActionsDropdown
│       ├── Button (UI)
│       └── Icon (script/Icon)
├── Hooks (Lógica de Negócio)
│   ├── useDentistaProtocolosList (hooks-dash)
│   ├── useAbrirProtocoloNavigation (hooks-dash)
│   └── usePortalContentLogic (hooks-dash)
├── Types (Contratos)
│   ├── sub-card-meus-protocolos.types.ts
│   ├── records-filter-header.types.ts
│   ├── protocolos-minhas-orientacoes.types.ts
│   └── [Types da table system]
└── Dados (Mock/Config)
    └── dentista-meus-protocolos-content.data.ts

DentistaAbrirProtocolo (main-content)
├── UI Components (Átomos)
│   ├── Button
│   ├── FloatingLabelInput
│   ├── DropInput
│   ├── Alerts
│   └── Icon
├── Shared Components
│   └── UploadDropzone
│       ├── Button (UI)
│       ├── RingProgress (UI)
│       ├── Alerts (UI)
│       └── upload-dropzone.types.ts
├── Hooks (Lógica de Negócio)
│   ├── useAbrirProtocoloForm (hooks-dash)
│   └── useAbrirProtocoloNavigation (hooks-dash)
└── Types (Contratos)
    ├── floating-label-input.types.ts
    ├── drop-input.types.ts
    └── upload-dropzone.types.ts
```

---

## Arquitetura Compartilhada

### **Hooks de Navegação e Conteúdo**
```
usePortalContentLogic (hooks-dash)
├── Define qual conteúdo renderizar baseado no slug
├── Gerencia estado de navegação
└── Integra com sistema de rotas

useAbrirProtocoloNavigation (hooks-dash)
├── Controla abertura/fechamento do modal
├── Gerencia estado de navegação
└── Fornece callbacks para UI
```

### **Sistema de Dados**
```
hook-fetch-API/
├── useSliderBannerData
├── useNewsHighlightData
├── useCronogramaData
├── useModalVerMaisProtocolosLogic
└── [Outros hooks de API]

data/mocks/
├── dentista-meus-protocolos-content.data.ts
└── [Outros dados mock]
```

### **Types Centralizados**
```
types/
├── ui/ (Componentes UI)
├── shared/ (Componentes shared)
├── dashboard/ (Layout e navegação)
└── [Outros domínios]
```

---

## Resumo de Dependências

### **Frame DENTISTA/HOME**
- **Componentes Shared:** 7 componentes
- **Componentes UI:** 15+ componentes (via shared)
- **Hooks:** 4 hooks principais
- **Types:** 8 arquivos de tipagem
- **Utils:** 2 utilitários
- **Dados:** 1 arquivo mock

### **Frame DENTISTA/GRC**
- **Componentes Shared:** 4 componentes
- **Componentes UI:** 20+ componentes (incluindo table system)
- **Hooks:** 3 hooks principais
- **Types:** 10+ arquivos de tipagem
- **Dados:** 1 arquivo mock

---

## Fluxo de Dados

### **Frame HOME**
```
Dados Mock → Hooks de API → Shared Components → Main Content → Page
```

### **Frame GRC**
```
Dados Mock → Hooks de Lista → UI Table → Main Content → Page
         ↘ Hooks Form → Shared Form → Modal → Page
```

---

## Conclusão

A arquitetura segue rigorosamente o pipeline modular do projeto:

1. **UI Components** (átomos reutilizáveis)
2. **Shared Components** (Compostos reutilizáveis)
3. **Main Content** (montagem por domínio)
4. **Pages** (rotas e hidratação)

Cada frame mantém sua independência enquanto compartilha infraestrutura comum (hooks, types, utils), garantindo consistência e escalabilidade.

---

**Data:** 4 de fevereiro de 2026  
**Análise:** Completa e estruturada  
**Escopo:** Frames DENTISTA/HOME e DENTISTA/GRC
