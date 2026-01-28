## PEDIDO
Análise crítica de problema persistente de favicon não sendo carregado na aba do navegador despite múltiplas tentativas de solução e configuração conforme documentação oficial Next.js

## PROBLEMA  
Favicon.ico não aparece na aba do navegador DESCARTE estar em app/favicon.ico (local padrão Next.js) e configuração metadata testada em dois formatos diferentes e mais outras tantas tentivas frustadas!

## DETALHES DA SOLICITAÇÃO
- Arquivo favicon.ico está em: @src/app/favicon.ico (30686 bytes) - local padrão Next.js
- Arquivo de configuração: @src/app/layout.tsx
- Tentativas de configuração metadata falharam:
  1. Formato array: icon: [{ url: '/favicon.ico', type: 'image/x-icon', rel: 'icon' }]
  2. Formato simplificado: icon: '/favicon.ico', shortcut: '/favicon.ico', apple: '/favicon.ico'
- Testes adicionais realizados sem sucesso:
  - Limpeza de cache do navegador
  - Teste em aba anônima
  - Movimento temporário para public/ (resultou em erro)
  - Substituição do arquivo favicon.ico por outro (possível corrupção)
- Middleware está configurado corretamente (exclui favicon.ico do matcher):
Não há conflito entre essa diretiva e o carregamento do favicon.ico. Pelo contrário, ela é configurada de forma a permitir o ícone por dois motivos principais:
- o favicon.ico está explicitamente listado no matcher com uma negação (?!...). Isso significa que o middleware não roda para pedidos desse arquivo, portanto, nenhuma dessas regras de segurança (CSP) é aplicada a ele.
- Regra de Origem Própria: Mesmo que o middleware fosse aplicado, a diretiva img-src 'self' autoriza qualquer imagem (incluindo o favicon) que venha do seu próprio domínio.
- Sintoma persistente: Navegador não exibe o logo na aba em nenhuma circunstância
- Comportamento esperado: Favicon visível na aba do navegador conforme padrão web
- Histórico de tentativas mal-sucedidas: 003_favicon-nao-reconhecido.md, 004_favicon-investigacao-avancada.md
- quando acesso ![local](http://localhost:3000/favicon.ico) eu consigo ver a imagem no navegador e no terminal tenho a respota de carregamento:
"...
 GET /pagina-inicial 200 in 289ms
 ○ Compiling /favicon.ico ...
 ✓ Compiled /favicon.ico in 634ms (454 modules)
 GET /favicon.ico 200 in 1050ms..."
 Mas a aba continua não carregando a imagem! 

 ANALISE A IMAGEM EM ANEXO!

## REGRA A SER SEGUIDA
@.windsurf/rule-main-rules.md


____

A SOLUÇÃO ERA O CACHE LOCAL PASTA .next ( bundle )