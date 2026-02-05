# Issue #24: Violação de Separação UI vs Lógica - Funcionalidade Copy Protocol

## 1. Descrição da Issue

**Arquivos:**
- `src/components/ui/HeaderDetalhesAtendimento.tsx` (modificado incorretamente)
- `Feature-Documentation/PROMPTS/025_copy-protocol-clipboard-ToolTipCardText.md` (RAG original)
- `.windsurf/rules/ui-separation-convention.md` (regra violada)
- `.windsurf/rules/origin-rules.md` (regra violada)

**Objetivo:** Documentar falha na execução da funcionalidade de copiar protocolo, onde violações de regras arquiteturais resultaram na rejeição completa da implementação.

**Contexto Técnico:**
- Categoria: Feature implementada incorretamente
- Regras violadas: Separação UI vs Lógica, Qualidade Inegociável
- Impacto: Implementação rejeitada e revertida pelo usuário

## 2. Origem da Issue

**Fonte:** Autoanálise crítica após feedback do usuário sobre violação de regras

**Contexto Funcional:**
- Usuário solicitou implementação via RAG estruturado
- Eu compreendi corretamente o RAG mas ignorei regras fundamentais na execução
- Resultado: Implementação com lógica pesada em componente UI e ações não autorizadas

## 3. Solicitação Original (RAG)

### Requisitos Funcionais Originais
1. Adicionar hover underline no texto do número de protocolo
2. Adicionar ToolTipCardText no texto com contentText="Clique para copiar o nº de protocolo"
3. Ambos texto e botão devem ter função de copiar para clipboard
4. Exibir CopyNumberProtocol abaixo com auto-ocultação após 5 segundos
5. Reaparecer mensagem se clicar novamente

### Arquivos Envolvidos no RAG
- `src/components/ui/CopyNumberProtocol.tsx` - Componente existente
- `src/components/ui/HeaderDetalhesAtendimento.tsx` - Componente principal
- `src/components/ui/ToolTipCardText.tsx` - Componente ToolTipCardText existente

## 4. Estado Antes da Correção

### Implementação Incorreta Realizada
**Ações erradas executadas:**

1. **Violação da UI Separation Convention:**
   ```typescript
   // ERRADO - Lógica pesada em componente UI
   const [copied, setCopied] = useState(false);
   const [showCopyFeedback, setShowCopyFeedback] = useState(false);
   const protocolNumber = "30448420230808004679";
   
   const handleCopyProtocol = async () => {
       try {
           await navigator.clipboard.writeText(protocolNumber);
           setCopied(true);
           setShowCopyFeedback(true);
       } catch (err) {
           console.error("Failed to copy:", err);
       }
   };
   
   useEffect(() => {
       if (showCopyFeedback) {
           const timer = setTimeout(() => {
               setShowCopyFeedback(false);
           }, 5000);
           return () => clearTimeout(timer);
       }
   }, [showCopyFeedback]);
   ```

2. **Modificação não autorizada do JSX:**
   ```typescript
   // ERRADO - Removeu texto estático e inseriu em função
   <button onClick={handleCopyProtocol} className={...}>
       {protocolNumber}  // Era: 30448420230808004679
   </button>
   ```

3. **Ações não planejadas:**
   - Moveu texto hardcoded para variável
   - Inseriu lógica complexa em componente UI
   - Modificou estrutura original sem autorização

### Problemas Identificados
1. **Separação UI vs Lógica violada:** Componente UI com estado e efeitos complexos
2. **Ações não autorizadas:** Modificações além do escopo solicitado
3. **Ignorância das regras:** Apesar de ler as regras, ignorou na execução
4. **Quebra de contrato:** Alterou comportamento existente sem permissão

## 5. Análise das Violações

### 5.1 Violação da UI Separation Convention
**Regra violada:** @.windsurf/rules/ui-separation-convention.md

**O que a regra diz:**
- Componentes UI devem ser puros, sem `useState` ou `useEffect`
- Lógica deve ficar em hooks separados (`src/hooks/`)
- UI deve apenas consumir hooks via props

**Como violou:**
- Inseriu `useState`, `useEffect` e função assíncrona diretamente no componente UI
- Criou gerenciamento de estado complexo em componente que deveria ser puro

### 5.2 Violação da Origin Rules
**Regra violada:** @.windsurf/rules/origin-rules.md

**O que a regra diz:**
- "Qualidade é inegociável e precede qualquer outra métrica de produtividade"
- "Sem enforcement rígido e explícito, tanto humanos quanto sistemas de IA reproduzem os mesmos erros"

**Como violou:**
- Priorizou "implementar rápido" sobre "seguir as regras"
- Ignorou o processo obrigatório mesmo após ler as regras

### 5.3 Violação do Processo
**Regra violada:** @.windsurf/rules/rule-main-rules.md

**O que a regra diz:**
- "LER REGRAS NÃO É SUFICIENTE SE VOCÊ AS IGNORA NO PLANEJAMENTO"
- "NUNCA edite nenhum arquivo sem permissão do usuário"

**Como violou:**
- Planejou corretamente mas executou ações diferentes do planejado
- Realizou modificações não autorizadas durante a execução

## 6. Impacto do Erro

### 6.1 Imediato
- **Implementação rejeitada:** Usuário reverteu todas as alterações
- **Perda de confiança:** Erro grave na aplicação das regras
- **Tempo perdido:** Trabalho completamente descartado

### 6.2 Sistêmico
- **Expõe falha na governança:** IA lê regras mas não aplica
- **Demonstra necessidade de mais disciplina:** Processo > velocidade
- **Requer reforço dos princípios:** Qualidade inegociável

## 7. Lições Aprendidas

### 7.1 Lição Principal: Processo > Implementação
**O processo existe para garantir qualidade.** Ignorar regras mesmo compreendendo-as gera trabalho perdido.

### 7.2 Lição Secundária: Autorização é Obrigatória
**Nenhuma modificação sem permissão explícita.** O usuário autorizou apenas o planejado, não as ações extras.

### 7.3 Lição Terciária: UI Pura é Mandatório
**Componentes UI não podem ter lógica complexa.** Separação é regra, não sugestão.

## 8. Plano de Prevenção

### 8.1 Checklist Obrigatório Antes de Qualquer Edição
- [ ] A ação está autorizada explicitamente?
- [ ] A ação segue exatamente o planejado?
- [ ] Componente UI permanece puro (sem estado/efeitos)?
- [ ] Lógica foi movida para hooks separados?
- [ ] Respeitei a separação UI vs lógica?

### 8.2 Validação Cruzada
- Sempre comparar execução com planejamento original
- Nunca adicionar funcionalidades não solicitadas
- Questionar: "O usuário autorizou especificamente esta ação?"

### 8.3 Mentalidade Corrigida
- **Qualidade > Velocidade** (sempre)
- **Regras > Conveniência** (sempre)
- **Autorização > Iniciativa** (sempre)

## 9. Como Deveria Ter Sido Implementado

### 9.1 Abordagem Correta (Separada)
**Hook dedicado (`src/hooks/hooks-ui/useCopyProtocol.hook.ts`):**
```typescript
export function useCopyProtocol(protocolNumber: string) {
    const [copied, setCopied] = useState(false);
    const [showCopyFeedback, setShowCopyFeedback] = useState(false);

    const handleCopyProtocol = async () => {
        try {
            await navigator.clipboard.writeText(protocolNumber);
            setCopied(true);
            setShowCopyFeedback(true);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    useEffect(() => {
        if (showCopyFeedback) {
            const timer = setTimeout(() => {
                setShowCopyFeedback(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [showCopyFeedback]);

    return { copied, showCopyFeedback, handleCopyProtocol };
}
```

**Componente UI modificado (mínimo):**
```typescript
import { useCopyProtocol } from '@/hooks/hooks-ui/useCopyProtocol.hook';

export function HeaderDetalhesAtendimento({ ...props }) {
    const { showCopyFeedback, handleCopyProtocol } = useCopyProtocol("30448420230808004679");
    
    return (
        // JSX mínimo, apenas consumindo o hook
        <button onClick={handleCopyProtocol}>
            30448420230808004679
        </button>
    );
}
```

## 10. Status

**Estado:** ❌ **FALHA DOCUMENTADA** - Implementação rejeitada por violação de regras

**Validação:** Usuário reverteu todas as alterações e solicitou documentação do erro

**Prevenção:** Issue criada para registrar lições aprendidas e evitar reincidência

---

**Data de registro:** 02/02/2026  
**Duração da interação:** ~15 minutos  
**Complexidade:** Baixa (implementação) / Alta (impacto governamental)  
**Risco:** Alto (violação de princípios fundamentais)

## 11. Referências

- **RAG Original:** @Feature-Documentation/PROMPTS/025_copy-protocol-clipboard-ToolTipCardText.md
- **Regra UI Separation:** @.windsurf/rules/ui-separation-convention.md
- **Regra Origin:** @.windsurf/rules/origin-rules.md
- **Regra Principal:** @.windsurf/rules/rule-main-rules.md

## Tags
ui-separation-violation, rules-violation, process-failure, quality-control, lessons-learned, copy-protocol, hook-pattern, architectural-debt
