## PEDIDO
Converter o repositório System Prompt Rules Workflows em um pacote NPM instalável via terminal (npx) que instale automaticamente toda a estrutura de pastas e arquivos do framework de governança em projetos alvo, criando um produto comercializável de consultoria para implementação de IA-assisted development com governança técnica, seguindo o mesmo modelo do Vercel Agent Skills como referência arquitetural.

## PROBLEMA  
O framework atual existe apenas como repositório local, exigindo cópia manual de arquivos para implementação em novos projetos. Não há automação para instalação, nem produto definido para comercialização como consultoria de implementação de governança IA.

## DETALHES DA SOLICITAÇÃO
- **Arquivos a serem instalados**: Estrutura completa .windsurf/ (rules/, workflows/) e Feature-Documentation/ (issues/, PR/, prompts/, to-do-list/, DIVERSOS/, FEAT/)
- **Tecnologia alvo**: Node.js script com fs-extra para cópia de arquivos
- **Comando desejado**: npx install-genesis (ou similar)
- **Ecossistema suportado**: Next.js, React, TypeScript, Tailwind, OWASP, CSP, Windsurf IDE
- **Dependência obrigatória**: Vercel Agent Skills (https://github.com/vercel-labs/agent-skills) - deve ser instalado via `npx add-skill vercel-labs/agent-skills` como pré-requisito
- **Modelo de negócio**: Consultoria em parceria (especialista IA + técnico corporativo)
- **Expansão**: Nativo para o windsurf + suporte para Cursor (.cursorrules), VSCode, outras IDEs
- **Alinhamento estratégico**: Framework GenesisIA_Skills_SPRW segue mesmo modelo do Vercel Agent Skills - sistema de regras documentadas que complementam e aprimoram o comportamento de IAs em desenvolvimento
- **Arquitetura de integração**: 
  - **Camada 1**: Regras locais GenesisIA_Skills_SPRW (.windsurf/rules/) - governança específica do projeto
  - **Camada 2**: Vercel Agent Skills - padrões globais de mercado (react-best-practices, web-design-guidelines)
  - **Camada 3**: Documentação oficial - fallback para casos não cobertos
  - **Hierarquia de precedência**: GenesisIA_Skills_SPRW > Vercel Skills > Docs oficiais (conforme definido em rule-main-rules.md:L84)

## REGRA A SER SEGUIDA
@[.windsurf/rule-main-rules.md]
