# Framework NemesisIA_Skills_SPRW - Guia de Instalação

## Comandos de Instalação

### Opção 1: Instalação Direta via GitHub (Recomendada)
```bash
npx github:feryamaha/system_prompt_rules-workflows_windsurf
```

### Opção 2: Clone e Instalação Manual
```bash
# Clona o repositório
git clone https://github.com/feryamaha/system_prompt_rules-workflows_windsurf.git temp-framework

# Copia as pastas para seu projeto
cp -r temp-framework/.windsurf seu-projeto/
cp -r temp-framework/Feature-Documentation seu-projeto/

# Remove o temporário
rm -rf temp-framework
```

### Opção 3: Download Direto
```bash
# Baixa o arquivo ZIP
wget https://github.com/feryamaha/system_prompt_rules-workflows_windsurf/archive/refs/heads/master.zip

# Extrai e copia as pastas
unzip master.zip
cp -r system_prompt_rules-workflows_windsurf-master/.windsurf seu-projeto/
cp -r system_prompt_rules-workflows_windsurf-master/Feature-Documentation seu-projeto/

# Limpeza
rm -rf master.zip system_prompt_rules-workflows_windsurf-master
```

### Opção 4: Usando Script Local
```bash
# Navega até o repositório do framework
cd /path/to/system_prompt_rules-workflows_windsurf

# Executa o script de instalação
node index.js ../seu-projeto
```

## Instruções de Uso

### 1. Pré-requisitos
- Node.js >= 18
- Windsurf IDE com Cascade habilitado
- Git instalado

### 2. Instalação do Vercel Agent Skills (Obrigatório)
```bash
npx add-skill vercel-labs/agent-skills
```

### 3. Validação da Instalação
Após instalar, verifique se as pastas foram criadas:
```bash
ls -la .windsurf/
ls -la Feature-Documentation/
```

### 4. Estrutura Esperada
```
seu-projeto/
├── .windsurf/
│   ├── rules/
│   └── workflows/
├── Feature-Documentation/
│   ├── issues/
│   ├── PR/
│   └── prompts/
└── info.md (este arquivo)
```

### 5. Primeiro Uso
1. Abra seu projeto no Windsurf IDE
2. Use o comando `/generate-prompt-rag` para converter pedidos informais
3. Use o comando `/audit-create-pr` para validar antes de commits
4. Siga as regras em `.windsurf/rules/rule-main-rules.md`

### 6. Workflows Disponíveis
- `/generate-prompt-rag` - Converte pedidos em prompts estruturados
- `/audit-create-pr` - Auditoria completa antes de PR
- `/auditoria-de-conformidade` - Auditoria arquitetural completa

### 7. Suporte
- Documentação completa em `Feature-Documentation/`
- Issues e exemplos em `Feature-Documentation/issues/`
- Templates de PR em `Feature-Documentation/PR/`

## Notas Importantes

- Este framework está em fase de testes e validação
- Não publique no NPM até validação completa em produção
- Use sempre a versão mais recente do repositório GitHub
- Contribua com issues e sugestões no repositório oficial

## Versão
- Framework: NemesisIA_Skills_SPRW v0.1.0
- Data: 31 de janeiro de 2026
- Status: Em validação de produção
