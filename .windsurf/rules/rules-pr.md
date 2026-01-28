---
name: PR Rules
status: stable
last_updated: 2026-01-26
---

# Padrão de Documentação de Pull Requests (Feature-Documentation/PR/)

Este documento define o padrão consolidado de escrita dos arquivos de PR no projeto, observado nos PRs existentes (PR_001 a PR_005 e comportamento recorrente).

## Convenção de Nomeação do Arquivo

- Formato: `PR_XXX_NOME-CURTO-DESCRITIVO.md`
- XXX → número sequencial com 3 dígitos (001, 002, ..., 006, ...)
- NOME-CURTO → palavra-chave principal em maiúsculas ou CamelCase, seguida de traço e descrição curta em kebab-case
- Exemplos reais:
  - PR_001_WEBSITE-BASE.md
  - PR_002_HEADER-ROUTAS-PLACEHOLDERS.md
  - PR_003_BUTTON-REFOIL.md
  - PR_004_INPUTPESQUISA-REFATOR.md
  - PR_005_FOOTER-MICROCOMPONENTS.md
  - PR_006_ESLINT-CONFIG.md

## Estrutura Obrigatória e Ordem Exata

1. Título principal (H1)  
   Frase descritiva, objetiva e que informa o escopo principal da entrega.  
   Exemplos reais:  
   - Ambientação inicial do website institucional (App Router)  
   - Desenvolvimento dos Microcomponentes Atômicos do Footer Modular  
   - Configuração ESLint e migração para ESLint CLI
   SIGA EXATAMENTE A MESMA CONVENÇÃO DO TEMPLATE EXEMPLO @Feature-Documentation/PR/PR_000_template-exemple-pr.md

2. Objetivo (H2)  
   Parágrafo curto (1–4 linhas) explicando diretamente o que foi entregue e por quê, seguindo sempre o que o usuario forneceu como sendo o objetivo real da PR.
   SIGA EXATAMENTE A MESMA CONVENÇÃO DO TEMPLATE EXEMPLO @Feature-Documentation/PR/PR_000_template-exemple-pr.md

3. Arquivos Afetados (H2)  
   Lista com bullets no formato:  
   - `caminho/do/arquivo` [novo] / [modificado] / [renomeado] / [removido]  
   - Liste todos os arquivos que foram modificados/criados/renomeados/removidos, TODOS, não é opcional é TODOS!
   SIGA EXATAMENTE A MESMA CONVENÇÃO DO TEMPLATE EXEMPLO @Feature-Documentation/PR/PR_000_template-exemple-pr.md

4. Implementações Realizadas ou Adequações Implementadas (H2)  
   Seção mais detalhada, organizada em subseções numeradas ou com ###  
   - Uso comum de negrito em nomes de componentes, arquivos, props, tokens  
   - Referências a linhas quando fizer sentido  
   - Nessa seção cada arquivo afetados ganha um topico discorrendo sobre o que foi feito no arquivo! Isso nao é opcional é obrigatório! Todos arquivos devem ter um topico explicando o que foi realizado!
   SIGA EXATAMENTE A MESMA CONVENÇÃO DO TEMPLATE EXEMPLO @Feature-Documentation/PR/PR_000_template-exemple-pr.md

5. Benefícios arquiteturais e prontidão para escala (H2) — muito comum  
   Foco em: reutilização, desacoplamento, pipeline ui → shared → main-content → page, governança, redução de retrabalho, mehorias, ganhos que o projeto teve, melhorias que o projeto teve.
   SIGA EXATAMENTE A MESMA CONVENÇÃO DO TEMPLATE EXEMPLO @Feature-Documentation/PR/PR_000_template-exemple-pr.md

## Regras Rígidas de Formatação e Conteúdo

ESSA TABELA NUNCA DEVE ESTAR NO INICIO DO ARQUIVO SEMPRE NO FINAL DO ARQUIVO. 
A POSIÇÃO DESSA TABELA É NO FINAL DO ARQUIVO, ULTIMO CONTEUDO! 
É OBRIGATORIO QUE A TABELA DE VALIDACAO CLI FICAR NO FINAL DO ARQUIVO, ULTIMO CONTEUDO! NUNCA NO INCIO, NUNCA NO MEIO SEMPRE NO FINAL DO ARQUIVO!

SIGA EXATAMENTE A MESMA CONVENÇÃO DO TEMPLATE EXEMPLO @Feature-Documentation/PR/PR_000_template-exemple-pr.md

| Comando             | Resultado (OK/FALHA) | Observações            |
|---------------------|----------------------|------------------------|
| yarn lint           | OK                   | ESLint CLI funcionando |
| yarn tsc --noEmit   | OK                   | TypeScript valido      |
| yarn build          | OK                   | Build sucesso          |

- **A tabela de validação CLI NUNCA deverá estar no início do arquivo**  
- A inclusão da tabela do resultados dos comandos (lint, tsc, build) deve ficar **somente na seção Validações**, no final do documento  
- Proibido colocar tabela logo após o título ou antes do Objetivo  
- Proibido emojis em qualquer parte do PR  
- Proibido linguagem promocional ou excessivamente informal  
- Manter acentuação correta (ç, ã, õ, á, é, í, ú) — usar editor que preserve UTF-8 se atentar com o comando set-Content do powershell para preservar acentuação para nao ocorrer esse tipo de erro de escrita: Implementa��o, pol�ticas, padroniza��o em palavras que possuem acentuação USE SEMPRE  UTF-8  NUNCA UTILIZE ASCII/ANSI.
- Termos recorrentes esperados: microcomponentes atômicos, tokens do design system, pipeline modular, composição, governança, validação visual, conformidade, Yarn Berry + PnP
- NUNCA INDIQUE PROXIMOS PASSOS AO USUARIO
- NUNCA INDIQUE VALIDAÇÕES AO USUARIO!
- NUNCA INDIQUE DECISÕES TECNICAS AO USUARIO!
- NUNCA CRIE SEÇÕES DE DETALHES COM MAIS DE 2 TOPICOS SEJA SEMPRE OBJETIVO AO QUE FOI CRIADO e as CONVENÇÕES DE PR!
- NUNCA INDIQUE COMANDOS AO USUARIO!
- Use a seção Implementações realizadas apenas para discorrer sobre o que foi criado, modificado, reutilzado, melhorados nos arquivos afetados.

SIGA EXATAMENTE A MESMA CONVENÇÃO DO TEMPLATE EXEMPLO @Feature-Documentation/PR/PR_000_template-exemple-pr.md

## Validações CLI Obrigatórias (antes de criar o PR)

Executar sempre, nesta ordem exata:

```bash
yarn lint
yarn tsc --noEmit
yarn build
```
Seguir este guia e as regras no arquivo `create-pr` mantém os PRs consistentes e evita regressões de qualidade.

SIGA EXATAMENTE A MESMA CONVENÇÃO DO TEMPLATE EXEMPLO @Feature-Documentation/PR/PR_000_template-exemple-pr.md
