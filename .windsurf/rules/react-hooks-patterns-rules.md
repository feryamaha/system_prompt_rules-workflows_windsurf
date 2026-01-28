---
trigger: always_on
status: active
last_updated: 2026-01-27
---

# Regras Explícitas de React Hooks Patterns

## 1. Objetivo

Estabelecer diretrizes explícitas e obrigatórias para o uso de React Hooks, eliminando padrões que causam erros de lint e violam as convenções do projeto. Esta regra complementa as diretrizes existentes em ui-separation-convention.md e typescript-typing-convention.md.

## 2. Princípio Fundamental

React Hooks devem seguir padrões rígidos e previsíveis. Qualquer desvio dos padrões estabelecidos aqui é PROIBIDO e considerado uma violação crítica das convenções do projeto.

---

## 3. PROIBIÇÕES EXPLÍCITAS

### 3.1 Hooks Condicionais (CRÍTICO)
**STATUS: PROIBIDO**

NUNCA chamar hooks dentro de condicionais:

`	ypescript
// ERRADO - PROIBIDO
if (condition) {
    const [state, setState] = useState() // VIOLAÇÃO
}

// ERRADO - PROIBIDO  
if (user) {
    useDashboardSidebar() // VIOLAÇÃO
    useDashboardTopbar() // VIOLAÇÃO
}

// ERRADO - PROIBIDO
if (someCondition) {
    return <div>Early return</div>
}
useWatch() // VIOLAÇÃO - Hook após early return
`

**CORRETO - Sempre no topo:**
`	ypescript
// CORRETO
const [state, setState] = useState()
const { data } = useDashboardSidebar()
const { config } = useDashboardTopbar()

if (condition) {
    return <div>Early return</div>
}
`

### 3.2 setState Síncrono em useEffect (CRÍTICO)
**STATUS: PROIBIDO**

NUNCA chamar setState diretamente no corpo do useEffect:

`	ypescript
// ERRADO - PROIBIDO
useEffect(() => {
    setActiveArrow(null) // VIOLAÇÃO
}, [isPlaying])

// ERRADO - PROIBIDO
useEffect(() => {
    setIsPlaying(items.length > 1) // VIOLAÇÃO
}, [items.length])

// ERRADO - PROIBIDO
useEffect(() => {
    if (currentSlide >= items.length) {
        setCurrentSlide(0) // VIOLAÇÃO
    }
}, [currentSlide, items.length])
`

**CORRETO - Usar callbacks ou lógica condicional:**
`	ypescript
// CORRETO - Com callback
useEffect(() => {
    if (isPlaying) {
        setActiveArrow(null)
    }
}, [isPlaying])

// CORRETO - Derivar estado ou usar callback
useEffect(() => {
    // Derivar estado em vez de setar síncrono
    const shouldPlay = items.length > 1
    if (shouldPlay !== isPlaying) {
        setIsPlaying(shouldPlay)
    }
}, [items.length, isPlaying])

// CORRETO - Para resetar, usar lógica condicional clara
useEffect(() => {
    if (currentSlide >= items.length && items.length > 0) {
        setCurrentSlide(0)
    }
}, [currentSlide, items.length])
`

### 3.3 Reatribuição de Variáveis no Render (CRÍTICO)
**STATUS: PROIBIDO**

NUNCA reatribuir variáveis após o início do render:

`	ypescript
// ERRADO - PROIBIDO
export function useButton() {
    let hasManualIcon = false
    
    const processedChildren = React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        const isIcon = child.type === Icon;
        if (isIcon) hasManualIcon = true; // VIOLAÇÃO
        return child;
    });
    
    return { hasManualIcon, processedChildren }
}
`

**CORRETO - Usar estado ou derivar valor:**
`	ypescript
// CORRETO - Com estado
export function useButton() {
    const [hasManualIcon, setHasManualIcon] = useState(false)
    
    const processedChildren = React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        const isIcon = child.type === Icon;
        if (isIcon) setHasManualIcon(true); // Estado
        return child;
    });
    
    return { hasManualIcon, processedChildren }
}

// CORRETO - Derivado (sem mutação)
export function useButton() {
    const hasManualIcon = React.Children.toArray(children).some(
        child => React.isValidElement(child) && child.type === Icon
    );
    
    return { hasManualIcon, processedChildren: children }
}
`

### 3.4 useEffect com Dependências Faltantes (CRÍTICO)
**STATUS: PROIBIDO**

NUNCA omitir dependências usadas no useEffect:

`	ypescript
// ERRADO - PROIBIDO
useEffect(() => {
    // openModal é usado mas não está no array de dependências
    if (someCondition) {
        openModal()
    }
}, [someCondition]) // VIOLAÇÃO - openModal faltando
`

**CORRETO - Incluir todas as dependências:**
`	ypescript
// CORRETO
useEffect(() => {
    if (someCondition) {
        openModal()
    }
}, [someCondition, openModal]) // Todas as dependências
`

---

## 4. PADRÕES OBRIGATÓRIOS

### 4.1 Estrutura Padrão de Hooks Customizados
`	ypescript
// PADRÃO OBRIGATÓRIO
export function use[NomeEntidade](params: ParamsType): UseReturn {
    // 1. Estados sempre no topo
    const [data, setData] = useState<DataType[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // 2. useEffects sempre após os estados
    useEffect(() => {
        // Lógica aqui - SEM setState síncrono direto
        if (condition) {
            // Usar callbacks ou lógica condicional
            setData(prev => ({ ...prev, updated: true }))
        }
    }, [dependencies])

    // 3. Memos e callbacks (se necessário)
    const memoizedValue = useMemo(() => computeValue(data), [data])

    // 4. Retorno no final
    return { data, loading, error, memoizedValue }
}
`

### 4.2 Padrão para Componentes com Hooks
`	ypescript
// PADRÃO OBRIGATÓRIO - Componentes
export function ComponentName({ prop }: ComponentProps) {
    // 1. Hooks SEMPRE no topo, sem condicionais
    const [state, setState] = useState()
    const { data, loading } = useCustomHook()
    const { config } = useDashboardSidebar()
    
    // 2. Condicionais APÓS todos os hooks
    if (loading) return <LoadingState />
    if (error) return <ErrorState />
    
    // 3. Renderização
    return <div>{/* JSX */}</div>
}
`

### 4.3 Padrão para useEffect com Estado
`	ypescript
// PADRÃO OBRIGATÓRIO - useEffect
useEffect(() => {
    // CORRETO: Verificar condição antes de setar estado
    if (shouldUpdate && currentState !== newState) {
        setState(newState)
    }
    
    // CORRETO: Usar função de atualização
    setState(prev => ({ ...prev, field: newValue }))
    
    // CORRETO: Lógica assíncrona
    const fetchData = async () => {
        const result = await api.getData()
        setData(result)
    }
    fetchData()
}, [dependencies])
`

---

## 7. CENÁRIOS COMUNS DE VIOLAÇÃO

### 7.1 Modal com Hooks Condicionais
`	ypescript
// VIOLAÇÃO COMUM
export function ModalUserMenu() {
    if (!isOpen) return null // Early return
    
    // ERRO: Hooks após early return
    useDashboardSidebar()
    useDashboardTopbar()
    
    return <div>Modal content</div>
}

// CORREÇÃO
export function ModalUserMenu() {
    // Hooks no topo
    useDashboardSidebar()
    useDashboardTopbar()
    
    // Early return após hooks
    if (!isOpen) return null
    
    return <div>Modal content</div>
}
`

### 7.2 Slider com setState em useEffect
`	ypescript
// VIOLAÇÃO COMUM
export function SliderControl() {
    const [activeArrow, setActiveArrow] = useState(null)
    
    useEffect(() => {
        if (isPlaying) {
            setActiveArrow(null) // setState síncrono
        }
    }, [isPlaying])
}

// CORREÇÃO
export function SliderControl() {
    const [activeArrow, setActiveArrow] = useState(null)
    
    useEffect(() => {
        // Lógica condicional
        if (isPlaying && activeArrow !== null) {
            setActiveArrow(null)
        }
    }, [isPlaying, activeArrow])
}
`

---

## 8. REFERÊNCIAS CRUZADAS

Esta regra complementa e reforça:

- ui-separation-convention.md - Seção 4.1 (Estado e efeitos)
- typescript-typing-convention.md - Seção 6 (Imutabilidade)
- Arquitetura-pastas-arquivos.md - Seção 4.1 (Componentes UI sem estado)
- API-Context-Portal-Dental-UNI.md - Seção 7.2 (Estrutura de hooks)

---

## 9. IMPACTO DA VIOLAÇÃO

Violações destas regras resultam em:

1. Erros de lint (react-hooks/rules-of-hooks, react-hooks/exhaustive-deps)
2. Bugs de runtime (renderização inconsistente)
3. Performance degradada (cascading renders)
4. Quebra de contratos do projeto
5. Dificuldade de manutenção (comportamento imprevisível)

---

## 10. CHECKLIST OBRIGATÓRIO

Antes de commitar qualquer código com hooks, verifique:

### 10.1 Verificação de Hooks Condicionais
- [ ] Todos os hooks estão no topo do componente?
- [ ] Nenhum hook está dentro de if/else/ternary?
- [ ] Nenhum hook está após early return?
- [ ] Todos os hooks são chamados na mesma ordem?

### 10.2 Verificação de useEffect
- [ ] Nenhum setState síncrono direto no corpo do useEffect?
- [ ] Todas as dependências estão incluídas no array?
- [ ] Lógica condicional está antes do setState?
- [ ] Estados são derivados quando possível?

### 10.3 Verificação de Imutabilidade
- [ ] Nenhuma variável é reatribuída após o início do render?
- [ ] Estados são usados em vez de mutação direta?
- [ ] Valores são derivados quando possível?

---

### 11 Padrões de ESLint para Detectar
- react-hooks/rules-of-hooks - Hooks condicionais
- react-hooks/exhaustive-deps - Dependências faltantes
- react-hooks/set-state-in-effect - setState em useEffect

---

## 12. CONCLUSÃO

Estas regras são OBRIGATÓRIAS e não negociáveis. Qualquer violação deve ser corrigida antes do commit. A adesão a estes padrões garante código previsível, performático e alinhado às convenções do projeto.

**Regra criada em:** 27/01/2026  
**Status:** Ativo e obrigatório  
**Aplicável a:** Todos os arquivos .ts e .tsx do projeto
