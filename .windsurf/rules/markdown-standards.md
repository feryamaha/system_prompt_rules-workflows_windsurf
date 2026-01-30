---
trigger: always_on
globs: ["**/*.md", ".windsurf/rules/**/*"]
---

# Padrões de Linguagem Markdown e Regras de Edição

## Proibições Gerais
- NUNCA usar emojis em nenhum arquivo do projeto
- Emojis são estritamente proibidos em arquivos de código e arquivos .md

## Padrões de Formatação Markdown
- Usar títulos com hierarquia correta (# para título principal, ## para seções, ### para subseções)
- Usar listas com marcadores (-) ou numeradas (1., 2., 3.)
- Usar blocos de código com especificação de linguagem (```python, ```javascript, etc.)
- Separar seções com linhas em branco
- Usar **negrito** para ênfase forte e *itálico* para ênfase leve

## Estrutura de Arquivos de Regras
- Incluir frontmatter YAML quando necessário (trigger, globs)
- Manter regras simples, concisas e específicas
- Usar bullet points em vez de parágrafos longos
- Limite de 12.000 caracteres por arquivo

## Nomenclatura
- Nomes de arquivos em kebab-case (exemplo: minha-regra.md)
- Títulos descritivos e claros