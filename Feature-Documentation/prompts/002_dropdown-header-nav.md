## PEDIDO
Reutilizar componente Dropdown no HeaderNav mantendo estilização atual do header

## PROBLEMA  
Ao substituir o link "Agenda" pelo componente Dropdown, o conteúdo perde a estilização atual do HeaderNav e assume a estilização própria do Dropdown

## DETALHES DA SOLICITAÇÃO
- Arquivo principal: @src/components/ui/header/HeaderNav.tsx
- Componente a reutilizar: @src/components/ui/Dropdown.tsx
- Item a substituir: @src/components/ui/header/HeaderNav.tsx:L33-L38
- Estilização a manter: @src/components/ui/header/HeaderNav.tsx:L12-L14
- Sintomas observados: Dropdown assume sua própria estilização, perdendo a estilização do header
- Comportamento esperado: Dropdown funcional com estilização do HeaderNav (font-satoshi, text-base, flex items-center, gap-[8px], letter-spacing-304, line-height-150)

## REGRA A SER SEGUIDA
@[.windsurf/rule-main-rules.md]
