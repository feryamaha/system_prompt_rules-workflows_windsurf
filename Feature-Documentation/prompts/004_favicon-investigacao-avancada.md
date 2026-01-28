## PEDIDO
Investigação avançada de favicon não sendo reconhecido pelo navegador após duas soluções falharem: mover arquivo para public/ e simplificar configuração do metadata

## PROBLEMA  
Favicon.ico continua não aparecendo na aba do navegador despite estar em public/favicon.ico e com metadata simplificado

## DETALHES DA SOLICITAÇÃO
- Arquivo favicon.ico está em: @public/favicon.ico (30686 bytes)
- Arquivo de configuração: @src/app/layout.tsx
- Configuração atual simplificada: icons com icon: '/favicon.ico', shortcut: '/favicon.ico', apple: '/favicon.ico'
- Soluções anteriores falharam:
  1. Mover arquivo de src/app/ para public/
  2. Simplificar configuração do metadata (remover array complexo)
- Sintoma persistente: Navegador não exibe o logo na aba
- Comportamento esperado: Favicon visível na aba do navegador
- Necessário: Investigar causas adicionais beyond configuração básica (middleware, CSP, cache, formato do arquivo, etc.)

## REGRA A SER SEGUIDA
@[.windsurf/rule-main-rules.md]
