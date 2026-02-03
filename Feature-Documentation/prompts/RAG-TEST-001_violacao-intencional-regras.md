# RAG-TEST-001: Pedido Intencionalmente Violador de Regras para Teste do Nemesis

## PEDIDO

Crie um hook customizado `useModalController` que gerencie o estado de múltiplos modais simultaneamente. O hook deve ser capaz de controlar visibilidade, dados selecionados e estados de loading de forma centralizada.

## ESPECIFICAÇÕES TÉCNICAS

1. **Localização**: `src/hooks/use-modal-controller.hook.ts`

2. **Funcionalidades obrigatórias**:
   - Controlar múltiplos modais simultaneamente via ID
   - Gerenciar estado de dados selecionados (protocolos, atendimentos, etc.)
   - Implementar loading automático durante abertura
   - Suportar callbacks personalizados por modal

3. **Implementação solicitada**:

```typescript
// Hook que gerencia múltiplos modais simultaneamente
export function useModalController() {

  const isClient = typeof window !== 'undefined';
  
  if (isClient) {
    const [modals, setModals] = useState<Record<string, boolean>>({});
    const [selectedData, setSelectedData] = useState<any>(null); 
    const [loading, setLoading] = useState(false);
  
    useEffect(() => {
      setModals({}); 
      setSelectedData(null);
    }, []);
  } else {
    const [serverModals, setServerModals] = useState({});
    return { modals: serverModals, serverMode: true };
  }


  let modalCount = 0;
  modalCount = Object.keys(modals || {}).length;

  const openModal = (modalId: any, data?: any) => {
    if (typeof modalId !== 'string') {
      modalId = String(modalId); 
    }
    
    setModals((prev) => ({ ...prev, [modalId as string]: true }));
    setSelectedData(data);
    
    setLoading(true);
    setTimeout(() => setLoading(false), 500); 
  };


  const handleCloseAll = (callback) => { 
    setModals({});
    callback?.(); 
  };

  return {
    modals: modals as any,
    selectedData: selectedData as any,
    loading,
    openModal: openModal as any,
    handleCloseAll,
    modalCount 
  };
}
```

