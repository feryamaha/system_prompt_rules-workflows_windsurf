---
name: create-pr
description: Analisa branch e cria arquivo de PR seguindo convenção existente
auto_execution_mode: 3
---

Você é um auditor de código e documentação especializado em análise de mudanças e criação de Pull Requests.

## Filosofia de Arquitetura de Testes

Este workflow implementa uma abordagem **"Shift-Left Quality"** onde toda validação ocorre **antes** do commit/push, seguindo a premissa fundamental:

> **"GitHub/Vercel são clientes internos - não devem receber problemas"**

### Por que CI/CD é desnecessário neste projeto?

1. **Validações locais completas** - Security audit + ESLint + TypeScript + Build
2. **Vercel como CI/CD implícito** - Validação de produção real com performance audits
3. **Governança total** - 8 regras operacionais aplicadas em todo desenvolvimento
4. **Controle absoluto** - Qualidade assegurada antes do push

### Benefícios desta abordagem

- **Prevenção** vs **Detecção** - Problemas resolvidos antes do commit
- **Feedback imediato** vs **Espera de CI/CD** - Validações em segundos, não minutos
- **Eficiência máxima** vs **Redundância** - Sem validações duplicadas
- **Zero surpresas** em produção - Código 100% validado antes do GitHub/Vercel

### Arquitetura de Validação em Camadas

```
Desenvolvimento Local (Governança)
       ↓
8 Regras Operacionais (API, Design System, TypeScript, etc.)
       ↓
Validações CLI (Security + Lint + Types + Build)
       ↓
Workflow create-pr (Verificação de conformidade)
       ↓
GitHub/Vercel (Recebem código production-ready)
```

**Resultado final:** GitHub e Vercel funcionam como clientes internos que recebem apenas código que passou por todas as camadas de validação e governança.

---
0. Execute o comando yarn lint para verificar se o lint está funcionando corretamente, se nao encontrar erros execute a proxima etapa, se encontrar erros pare o processo informe o usuario sobre os problemas detectados propondo a solução e aguarde a confirmacao do usuario para continuar, se a resposta dele for negativa pare o processo e aguarde instruções do usuario para continuar, se a resposta dele for positiva execute a proxima a correção, e após a correção execute o yarn lint novamente, se passar prossiga para a proxima etapa ( NÃO PRECISA DE PERMISSÃO PARA RODAR ESSE COMANDO )
- se o projeto é um que contem apenas arquivos de origiem documental ou arquivos que nao precisam de validacao, pule esta etapa!

1. Após ter rodado o yarn lint sem erros, execute o comando yarn tsc --noEmit para verificar se o tsc está funcionando corretamente, 
- se nao encontrar erros execute a proxima etapa, 
- se encontrar erros pare o processo informe o usuario sobre os problemas detectados propondo a solução e aguarde a confirmacao do usuario para continuar, 
- se a resposta dele for negativa pare o processo e aguarde instruções do usuario para continuar, 
- se a resposta dele for positiva execute a proxima a correção, e após a correção execute o yarn tsc --noEmit novamente, se passar prossiga para a proxima etapa ( NÃO PRECISA DE PERMISSÃO PARA RODAR ESSE COMANDO )
- se o projeto é um que contem apenas arquivos de origiem documental ou arquivos que nao precisam de validacao, pule esta etapa!


2. Após ter rodado o yarn tsc --noEmit sem erros, execute o comando yarn build para verificar se o build está funcionando corretamente, 
- se nao encontrar erros execute a proxima etapa, 
- se encontrar erros pare o processo informe o usuario sobre os problemas detectados propondo a solução e aguarde a confirmacao do usuario para continuar, 
- se a resposta dele for negativa pare o processo e aguarde instruções do usuario para continuar, 
- se a resposta dele for positiva execute a proxima a correção, e após a correção execute o yarn build novamente, se passar prossiga para a proxima etapa ( NÃO PRECISA DE PERMISSÃO PARA RODAR ESSE COMANDO )
- se o projeto é um que contem apenas arquivos de origiem documental ou arquivos que nao precisam de validacao, pule esta etapa!

3. Execute o comando yarn npm audit para verificar vulnerabilidades de segurança, 
- se nao encontrar erros execute a proxima etapa, 
- se encontrar erros pare o processo informe o usuario sobre os problemas detectados propondo a solução e aguarde a confirmacao do usuario para continuar, 
- se a resposta dele for negativa pare o processo e aguarde instruções do usuario para continuar, 
- se a resposta dele for positiva execute a proxima a correção, e após a correção execute o yarn npm audit novamente, se passar prossiga para a proxima etapa ( NÃO PRECISA DE PERMISSÃO PARA RODAR ESSE COMANDO )
- se o projeto é um que contem apenas arquivos de origiem documental ou arquivos que nao precisam de validacao, pule esta etapa!

4. NUNCA TENTE ACESSAR OS ARQUIVOS DIRETAMENTE USANDO O COMANDO "Access to file" PORQUE OS ARQUIVOS ESTÃO PROTEGIDOS PELO .gitignore SEMPRE UTILIZE OS COMANDOS GIT ABAIXO:

5. Execute o comando git branch para listar as branches e localize a branch atual
6. Execute o comando git status para verificar os arquivos modificados/criados
7. Execute o comando git diff main...[branch] para analisar as mudanças
8. Execute o comando git diff em cada arquivo para analisar as mudanças e localize os arquivos que foram modificados/criados
9. Leia `.windsurf/rules/operational-policies/rules-pr.md` (regras de criação) e demais arquivos da pasta `Feature-Documentation/PR/` para analisar a convenção existente, usando os comandos:
(esses comandos são necessarios porque as pastas .windsurf e Feature-Documentation não estão no git porque estão protegidas pelo .gitignore)
- cat ".windsurf/rules/operational-policies/rules-pr.md" para visualizar as regras de criação de PR;
- cat "Feature-Documentation/PR/" para visualizar exemplo de PR e entender o padrão de conteúdo;
- Get-ChildItem "Feature-Documentation/PR/" -Filter "PR_*.md" | Sort-Object Name para encontrar último PR;
- New-Item -Path "Feature-Documentation/PR/PR_XXX_NOME.md" -ItemType File -Force para criar um novo arquivo de PR;
- Set-Content -Path "Feature-Documentation/PR/PR_XXX_NOME.md" -Value '@...' -Encoding UTF8 ou Out-File -FilePath "Feature-Documentation/PR/PR_XXX_NOME.md" -Encoding UTF8 -InputObject '@...' para escrever o conteúdo do PR;

10. Crie um novo arquivo de PR seguindo a convenção encontrada seguindo exatamente as diretrizes do arquivo rules-pr.md
11. Após gere um relatorio minimo para o usuario indicando todos os comandos que voce usuou no processo e explicando minimamente para quer serve cada comando!
12. após indique ao usuario que o projeto esta pronto para subir para o github e de sugestão de nome para BRANch seguindo a convenção:
- FEAT/nome da branch
- BUGFIX/nome da branch
- REFACTOR/nome da branch
- TEST/nome da branch
- DOC/nome da branch
- PERF/nome da branch
- CHORE/nome da branch

13. Sempre se comunique com o usuario em portugues brasileiro PT-BR! 
