---
trigger: always_on
---
# API Context - Padrão de APIs (BFF)

## 1. Visão Geral e Fluxo de Dados

Este documento descreve a arquitetura de API de um projeto com Next.js App Router, usando a abordagem Backend-for-Frontend (BFF) para abstrair integrações com JSONs ou APIs externas.

### Fluxo Padrão de Dados

O projeto segue um fluxo padrão bem definido:

1. **Requisição do Cliente**: O navegador (cliente) solicita dados através de hooks React
2. **Hook de Fetch**: O hook centraliza a chamada à API com tratamento de erros e loading
3. **Route Handler (BFF)**: O servidor recebe a requisição e a processa
4. **Consulta aos Dados**: A API consulta arquivos JSON em `src/data/` ou APIs externas
5. **Processamento e Resposta**: A API formata e retorna dados padronizados
6. **Atualização do Estado**: O hook atualiza o estado do componente com os dados

```
Componente → Hook → Route Handler → JSON/API → Resposta JSON → Hook → Componente
```

### Padrão BFF (Backend-for-Frontend)

#### O que é o padrão BFF?

O padrão BFF propõe a criação de uma camada de backend dedicada e otimizada para o frontend, abstraindo a complexidade de múltiplos serviços de backend.

#### Características e Benefícios do BFF

**Abstração e Simplificação**
- O BFF atua como um "meio-campo", isolando o frontend da complexidade de APIs externas
- Em vez de o frontend fazer várias chamadas, ele faz uma única chamada ao seu BFF

**Otimização de Dados**
- O BFF garante que o frontend receba apenas os dados necessários
- Evita tráfego desnecessário, melhorando o desempenho
- Crucial para aplicações com múltiplos widgets

**Segurança**
- Centraliza validações e regras de negócio
- Oculta informações confidenciais do cliente
- Gerencia tokens de autenticação

**Desacoplamento**
- Permite que equipes de frontend e backend trabalhem de forma independente
- Mudanças em APIs externas não quebram necessariamente o frontend

## 2. Estrutura de Pastas e Arquivos

```
src/
├─ app/api/                           # Route Handlers (Next.js App Router)
│  ├─ [recurso]/                      # API de domínio
│  │  └─ route.ts                     # GET /api/[recurso]
│  └─ [outros endpoints]
│
├─ hooks/hook-fetch-API/              # Hooks React customizados para API
│  ├─ index.ts                        # Export central
│  ├─ useRecursoData.hook.ts           # Hook específico de recurso
│  └─ [outros hooks]
│
├─ components/ui/                     # Componentes de UI reutilizáveis
│  ├─ LoadingState.tsx                # Componente de loading
│  └─ [outros componentes]
│
├─ data/                              # Dados mock e configurações
│  ├─ mocks/                          # Dados mock para APIs
│  │  └─ recurso.json                 # Mock do recurso
│  └─ [configurações adicionais]
│
├─ utils/                             # Utilitários
│  └─ [helpers reutilizáveis]
│
└─ types/                             # Tipos TypeScript
   ├─ api/                            # Tipos de API (quando necessário)
   ├─ ui/                             # Tipos de componentes UI
   └─ app/                            # Tipos do app
```

## 3. Padrão de Integração de APIs

### 3.1. Arquitetura de Camadas (Padrão 3-Layer)

**OBRIGATÓRIO:** Todas as integrações de API devem seguir o padrão **3-Layer Architecture**:

```
┌─────────────────────────────────────────┐
│ 1. Hook React (Camada de Consumo)      │
│    - Gerencia estado (loading, error)  │
│    - Centraliza lógica de fetch        │
│    - Tratamento de erros               │
│    - Reutilização entre componentes    │
└─────────────────────────────────────────┘
                   ↓ chama
┌─────────────────────────────────────────┐
│ 2. Route Handler (Camada BFF)          │
│    - Validação de parâmetros           │
│    - Transformação de dados            │
│    - Caching e headers HTTP             │
│    - Integração com APIs externas       │
└─────────────────────────────────────────┘
                   ↓ usa
┌─────────────────────────────────────────┐
│ 3. JSON Mock / API Externa              │
│    - Fonte de dados                     │
│    - Pode ser substituída sem mudar hook│
│    - Abstração completa                 │
└─────────────────────────────────────────┘
```

**Responsabilidades por Camada:**

**Hook React** (`src/hooks/hook-fetch-API/*Hook.ts`):
- Gerencia estado de loading, error e data
- Centraliza lógica de fetch e tratamento de erros
- É reutilizável entre múltiplos componentes
- Não contém lógica de UI, apenas dados

**Route Handler** (`src/app/api/**/route.ts`):
- Recebe requisições HTTP
- Valida parâmetros e query strings
- Transforma dados brutos para o formato esperado
- Implementa caching via headers HTTP
- Retorna resposta padronizada

**Dados** (`src/data/mocks/*.json` ou API externa):
- Fonte de dados (mock ou real)
- Pode ser substituída sem alterar hooks
- Estrutura otimizada para consumo do BFF

### 3.2. Exemplo de Implementação

```typescript
// 1. Hook React (src/hooks/hook-fetch-API/useRecursoData.hook.ts)
export function useRecursoData(filtro: string): UseRecursoDataReturn {
    const [data, setData] = useState<RecursoItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchRecurso = async () => {
            try {
                setLoading(true)
                setError(null)

                const response = await fetch(`/api/recurso?filtro=${filtro}`)

                if (!response.ok) {
                    throw new Error(`Failed to fetch resource: ${response.statusText}`)
                }

                const result = await response.json()

                if (!result.success) {
                    throw new Error(result.error || 'Unknown error')
                }

                const normalizedData = normalizeRecurso(result.data)
                setData(normalizedData)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error occurred')
                setData([])
            } finally {
                setLoading(false)
            }
        }

        fetchRecurso()
    }, [filtro])

    return { data, loading, error }
}

// 2. Route Handler (src/app/api/recurso/route.ts)
import { NextResponse } from 'next/server'
import recursoMock from '@/data/mocks/recurso.json'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const filtro = searchParams.get('filtro') || 'default'

        // Filtra recurso por parâmetro
        const filteredData = recursoMock.filter(item => item.filtro === filtro)

        return NextResponse.json({
            success: true,
            data: filteredData,
            timestamp: new Date().toISOString()
        }, {
            headers: { 'Cache-Control': 'public, s-maxage=60' }
        })
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to fetch resource',
                statusCode: 500
            },
            timestamp: new Date().toISOString()
        }, { status: 500 })
    }
}

// 3. Componente (qualquer componente que usa)
const { data, loading, error } = useRecursoData(filtro)

if (loading) return <LoadingState />
if (error) return <ErrorState message={error} />

return (
    <div>
        {data.map(item => (
            <RecursoCard key={item.id} {...item} />
        ))}
    </div>
)
```

## 4. Padrão de Resposta (Consistência)

### 4.1. Formato Padronizado de Sucesso

```typescript
NextResponse.json({
  success: true,
  data: result, // ← Dados da resposta
  timestamp: new Date().toISOString(),
  metadata?: { // ← Opcional: metadados adicionais
    total?: number,
    cached?: boolean
  }
}, { status: 200 })
```

### 4.2. Formato Padronizado de Erro

```typescript
NextResponse.json({
  success: false,
  error: {
    code: string,           // ← Código do erro (ex: 'VALIDATION_ERROR')
    message: string,        // ← Mensagem legível
    details?: unknown,     // ← Detalhes opcionais
    statusCode: number      // ← HTTP status code
  },
  timestamp: new Date().toISOString()
}, { status: error.statusCode })
```

### 4.3. Interface TypeScript

```typescript
// src/types/api/api-response.types.ts
export interface ApiSuccessResponse<T> {
  success: true
  data: T
  timestamp: string
  metadata?: Record<string, unknown>
}

export interface ApiErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
    statusCode: number
  }
  timestamp: string
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse
```

## 5. Estratégia de Caching

### 5.1. Dados Dinâmicos

Para dados que mudam frequentemente (itens, registros, etc.):

```typescript
// Cache curto para dados dinâmicos
return NextResponse.json(data, {
  headers: {
    'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60'
  }
})
```

### 5.2. Dados Estáticos (Configurações)

Para configurações e dados que raramente mudam:

```typescript
// Cache longo para dados estáticos
return NextResponse.json(data, {
  headers: {
    'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200'
  }
})
```

### 5.3. Sem Cache (Dados Sensíveis)

Para dados sensíveis ou em tempo real:

```typescript
// Sem cache para dados críticos
export const dynamic = 'force-dynamic' // ← OBRIGATÓRIO

return NextResponse.json(data)
```

## 6. Endpoints Existentes e Futuros

### 6.1. Endpoints Implementados

#### GET /api/[recurso]
- **Função:** Retorna lista de itens do recurso
- **Parâmetros:** query string conforme necessidade
- **Response:** `{ success: true, data: Item[], timestamp }`
- **Mock:** `src/data/mocks/[recurso].json`

### 6.2. Endpoints Planejados

#### GET /api/[recurso-secundario]
- **Função:** Retorna itens filtrados do recurso secundário
- **Parâmetros:** filtros e paginação

#### POST /api/[recurso-secundario]
- **Função:** Cria/atualiza dados do recurso secundário
- **Payload:** Dados validados

## 7. Convenções e Boas Práticas

### 7.1. Nomenclatura de Arquivos

- **Hooks:** `use[NomeEntidade].hook.ts` (ex: `useRecursoData.hook.ts`)
- **Route Handlers:** `route.ts` em pastas nominais (ex: `/api/recurso/route.ts`)
- **Tipos:** `[dominio]-[entidade].types.ts` (ex: `api-response.types.ts`)
- **Mocks:** `[entidade].json` (ex: `recurso.json`)

### 7.2. Estrutura de Hooks

```typescript
// Padrão obrigatório para hooks de API
export function use[NomeEntidade](params: ParamsType): UseReturn {
    const [data, setData] = useState<DataType[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        // Lógica de fetch
    }, [dependencies])

    return { data, loading, error }
}
```

### 7.3. Tratamento de Erros

- Sempre retornar erro padronizado do Route Handler
- Hook deve capturar e expor mensagem de erro
- Componente deve exibir estado de erro apropriado
- Log de erros no servidor para debugging

### 7.4. Loading States

- Hook deve gerenciar estado de loading
- Componente deve exibir loading apropriado
- Usar componente `LoadingState` para consistência

## 8. Migração de Mock para API Real

### 8.1. Processo de Migração

1. **Manter Contrato do Hook:** Não alterar interface do hook
2. **Atualizar Route Handler:** Substituir mock por chamada à API externa
3. **Manter Formato de Resposta:** Manter mesmo formato de resposta
4. **Atualizar Tipos:** Ajustar tipos se necessário
5. **Testes:** Validar integração completa

### 8.2. Exemplo de Migração

```typescript
// ANTES (Mock)
export async function GET(request: Request) {
    const data = recursoMock.filter(item => item.filtro === filtro)
    return NextResponse.json({ success: true, data })
}

// DEPOIS (API Real)
export async function GET(request: Request) {
    try {
        const token = request.headers.get('authorization')
        const response = await fetch(`${process.env.API_BASE_URL}/recurso`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        
        const data = await response.json()
        const transformed = transformRecursoData(data) // Formata para o frontend
        
        return NextResponse.json({ success: true, data: transformed })
    } catch (error) {
        // Tratamento de erro
    }
}
```

## 9. Validação e Tipagem

### 9.1. Validação de Parâmetros

```typescript
import { z } from 'zod'

const recursoQuerySchema = z.object({
    filtro: z.string()
})

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const query = recursoQuerySchema.parse(Object.fromEntries(searchParams))
    
    // Usar query validada
}
```

### 9.2. Tipos Compartilhados

```typescript
// src/types/api/recurso.types.ts
export interface RecursoItem {
    id: string
    title: string
    status: string
}

export interface RecursoResponse {
    items: RecursoItem[]
    total: number
}
```

## 10. Monitoramento e Debugging

### 10.1. Logs no Servidor

```typescript
// Route Handler com logs
export async function GET(request: Request) {
    console.log(`📡 API Request: GET /api/recurso?filtro=${filtro}`)
    
    try {
        const result = await fetchRecurso(filtro)
        console.log(`✅ API Response: ${result.data.length} items found`)
        
        return NextResponse.json(result)
    } catch (error) {
        console.error(`❌ API Error:`, error)
        return NextResponse.json(errorResponse, { status: 500 })
    }
}
```

### 10.2. Debugging no Cliente

```typescript
// Hook com logs de debugging
useEffect(() => {
    console.log(`🔄 Fetching resource for filtro: ${filtro}`)
    
    fetchRecurso()
        .then(data => {
            console.log(`✅ Resource loaded:`, data.length)
            setData(data)
        })
        .catch(error => {
            console.error(`❌ Failed to load resource:`, error)
            setError(error.message)
        })
        .finally(() => {
            setLoading(false)
        })
}, [filtro])
```

---

## Conclusão

Este padrão BFF para aplicações com App Router garante:

✅ **Consistência:** Todos os endpoints seguem o mesmo padrão
✅ **Manutenibilidade:** Separação clara de responsabilidades
✅ **Performance:** Caching adequado para cada tipo de dado
✅ **Segurança:** Validação e tratamento centralizados
✅ **Flexibilidade:** Fácil migração de mock para APIs reais
✅ **Reutilização:** Hooks podem ser usados em múltiplos componentes

Ao seguir este padrão, garantimos uma arquitetura robusta e escalável para o BFF do projeto.
