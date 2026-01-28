## PEDIDO
Analisar problema de sobreposição de camadas entre header e SectionHero na página inicial, onde o Container da SectionHero está sobrepondo o conteúdo do Header renderizado estaticamente pelo layout

## PROBLEMA  
Header não está acessível via inspecionar elemento na página /pagina-inicial, sendo sobreposto pelo conteúdo da SectionHero. Apenas o conteúdo do main-content está selecionável no DevTools

## DETALHES DA SOLICITAÇÃO
- Arquivo principal: @src/components/main-content/pagina-inicial/SectionHero.tsx
- Arquivo secundário: @src/app/pagina-inicial/page.tsx
- Layout: @src/app/layout.tsx
- Header: @src/components/shared/Header.tsx
- Container: @src/components/ui/Container.tsx
- Sintomas observados: Header inacessível, Container da SectionHero sobrepondo conteúdo, apenas conteúdo principal selecionável via inspecionar elemento
- Comportamento esperado: Header acessível e não sobreposto pelo Container da SectionHero

## REGRA A SER SEGUIDA
@[.windsurf/rule-main-rules.md]
