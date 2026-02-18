# Migration Guide - Nemesis Enforcement Engine v2

**Data:** 17 de fevereiro de 2026  
**Versão:** 2.0.0  
**Para:** Usuários do Nemesis v1.x  

## Visão Geral

Este guia orienta na migração do Nemesis Enforcement Engine v1.x para v2.0. A nova versão introduz mudanças significativas na arquitetura, compatibilidade e eficácia do enforcement.

## Pré-requisitos

### Sistema Operacional
- ✅ Windows 10+ (PowerShell)
- ✅ macOS 10.15+ (zsh/bash)
- ✅ Linux (bash)

### Gerenciadores de Pacotes Suportados
- ✅ Yarn (Berry + PnP)
- ✅ Bun (v1.0+)
- ✅ npm (v8+)
- ✅ pnpm (v7+)

### Node.js
- ✅ Node.js 18+ (recomendado 20+)

## Backup Antes da Migração

### 1. Backup dos Hooks Existentes
```bash
# Criar pasta de backup
mkdir -p .nemesis/backup/v1

# Backup dos hooks atuais
cp -r .nemesis/hooks .nemesis/backup/v1/

# Backup de configurações
cp .windsurf/rules/ .nemesis/backup/v1/rules -r
```

### 2. Backup de Configurações
```bash
# Exportar configurações atuais
cat .nemesis/config.toml > .nemesis/backup/v1/config-backup.toml
```

## Processo de Migração

### Passo 1: Verificar Versão Atual
```bash
# Verificar se já está usando v2
node .nemesis/hooks/nemesis-pretool-check.js --version

# Se não existir --version, está na v1
```

### Passo 2: Atualizar Arquivos Core

#### 2.1 Atualizar PreToolUse Hook
```bash
# Fazer backup do hook atual
cp .nemesis/hooks/nemesis-pretool-check.js .nemesis/backup/v1/nemesis-pretool-check.js.bak

# O novo hook já inclui detecção de ambiente
# Se estiver usando o repo original, o arquivo já foi atualizado
```

#### 2.2 Adicionar Pre-Edit Hook (NOVO)
```bash
# Criar novo hook para edições
# O arquivo já existe em .nemesis/hooks/pre-edit-hook.js
chmod +x .nemesis/hooks/pre-edit-hook.js
```

### Passo 3: Instalar Dependências do Enforcement Engine

#### 3.1 Verificar Estrutura de Pastas
```bash
# Estrutura esperada:
# .nemesis/
# ├── hooks/
# │   ├── nemesis-pretool-check.js (atualizado)
# │   └── pre-edit-hook.js (novo)
# ├── workflow-enforcement/
# │   ├── detectors/
# │   ├── validators/
# │   ├── engine/
# │   ├── behavioral/
# │   └── analysis/
# └── config.toml
```

#### 3.2 Compilar TypeScript (se necessário)
```bash
# Se estiver usando TypeScript diretamente
npm run build:enforcement

# Ou usar tsx direto
npx tsx src/workflow-enforcement/index.ts
```

### Passo 4: Configurar Ambiente

#### 4.1 Detectar Ambiente Automaticamente
```bash
# Executar detecção de ambiente
node -e "
const { detectEnvironment } = require('./src/workflow-enforcement');
const env = detectEnvironment();
console.log('Ambiente detectado:', env);
"
```

#### 4.2 Validar Compatibilidade
```bash
# Verificar compatibilidade
node -e "
const { detectEnvironment, validateEnvironmentCompatibility } = require('./src/workflow-enforcement');
const env = detectEnvironment();
const validation = validateEnvironmentCompatibility(env);
console.log('Compatível:', validation.compatible);
if (!validation.compatible) {
  console.log('Issues:', validation.issues);
  console.log('Recommendations:', validation.recommendations);
}
"
```

### Passo 5: Testar Migração

#### 5.1 Testar Básico
```bash
# Testar com comando simples
echo '{"tool":"bash","command":"echo test"}' | node .nemesis/hooks/nemesis-pretool-check.js

# Deve retornar exit code 0 e permitir
```

#### 5.2 Testar Validação de Regras
```bash
# Criar arquivo de teste temporário
cat > test-violation.tsx << 'EOF'
export function TestComponent() {
  const [state, setState] = useState<any>(null); // Múltiplas violações
  return <div style={{ color: '#ff0000' }}>Test</div>;
}
EOF

# Testar validação
echo '{"tool":"edit","file":"test-violation.tsx"}' | node .nemesis/hooks/pre-edit-hook.js edit test-violation.tsx test-violation.tsx

# Deve ser bloqueado
rm test-violation.tsx
```

#### 5.3 Testar Adaptação de Comandos
```bash
# Se estiver usando Bun
echo '{"tool":"bash","command":"yarn tsc --noEmit"}' | node .nemesis/hooks/nemesis-pretool-check.js

# Deve adaptar automaticamente para Bun
```

### Passo 6: Atualizar Configurações

#### 6.1 Configurar Regras Personalizadas
```typescript
// .nemesis/config.toml (se existir)
[enforcement]
strict_mode = true
log_violations = true
allowed_file_patterns = ["*.ts", "*.tsx", "*.js", "*.jsx"]

[behavioral]
override_level = "strict" # strict, moderate, lenient
gap_detection = true
```

#### 6.2 Configurar Exceções (se necessário)
```typescript
// Adicionar exceções em regras específicas
const customExceptions = [
  'src/components/ui/Button.tsx',
  'src/components/ui/Container.tsx',
  'src/components/ui/InputPesquisaAjuda.tsx'
]
```

## Validação Pós-Migração

### Testes de Integração
```bash
# Executar suite completa de testes
npm test tests/workflow-enforcement/integration.test.ts

# Verificar todos os cenários
npm run test:enforcement
```

### Verificar Cenários de Falha Antigos

#### SuperCard Scenario
```bash
# Tentar criar componente com múltiplas violações
# Deve ser bloqueado em todas as violações
```

#### Price Filter Scenario
```bash
# Tentar usar CSS inline
# Deve ser bloqueado imediatamente
```

#### Audit Create PR Scenario
```bash
# Tentar instalar pacotes sem autorização
# Deve ser bloqueado
```

## Configurações Avançadas

### Modo de Desenvolvimento
```bash
# Ativar modo debug
export DEBUG=nemesis:*
export NEMESIS_ENV=development

# Logs detalhados serão mostrados
```

### Modo de Produção
```bash
# Modo estrito (padrão)
export NEMESIS_ENV=production
export NEMESIS_STRICT=true

# Máximo enforcement
```

### Personalizar Regras
```typescript
// Criar arquivo de regras personalizadas
// .windsurf/rules/custom-rules.md

export const customRules = {
  'no-console-log': {
    pattern: /console\.log/g,
    message: 'Console.log não permitido em produção',
    severity: 'warning',
    suggestion: 'Use sistema de logging apropriado'
  }
}
```

## Troubleshooting de Migração

### Problema: Hook Não Encontrado
```
Erro: pretool-hook.ts não encontrado
```
**Solução:**
```bash
# Verificar estrutura de pastas
ls -la .nemesis/workflow-enforcement/

# Reinstalar se necessário
npm install nemesis-enforcement@latest
```

### Problema: Comandos Não Adaptados
```
Erro: yarn tsc --noEmit falhando em ambiente Bun
```
**Solução:**
```bash
# Verificar detecção de ambiente
node -e "console.log(require('./src/workflow-enforcement').detectEnvironment())"

# Forçar detecção manual se necessário
export NEMESIS_PACKAGE_MANAGER=bun
```

### Problema: Falsos Positivos
```
Erro: Ação permitida sendo bloqueada
```
**Solução:**
```bash
# Adicionar exceção temporária
export NEMESIS_DEBUG=true

# Analisar logs para identificar regra problemática
# Adicionar arquivo à lista de exceções
```

### Problema: Performance Lenta
```
Erro: Operações muito lentas após migração
```
**Solução:**
```bash
# Ativar cache de validações
export NEMESIS_CACHE=true

# Limitar regras ativas
export NEMESIS_ACTIVE_RULES=ts,react,ui
```

## Rollback (Se Necessário)

### Rollback Rápido
```bash
# Restaurar hooks v1
cp .nemesis/backup/v1/hooks/* .nemesis/hooks/

# Restaurar configurações
cp .nemesis/backup/v1/config-backup.toml .nemesis/config.toml

# Testar rollback
echo '{"tool":"bash","command":"echo test"}' | node .nemesis/hooks/nemesis-pretool-check.js
```

### Rollback Completo
```bash
# Remover v2 completamente
rm -rf .nemesis/workflow-enforcement/
rm .nemesis/hooks/pre-edit-hook.js

# Restaurar v1 do backup
cp -r .nemesis/backup/v1/* .nemesis/

# Reinstalar dependências v1 se necessário
npm install nemesis-v1@latest
```

## Verificação Final

### Checklist de Migração
- [ ] Backup realizado com sucesso
- [ ] Novos hooks instalados
- [ ] Ambiente detectado corretamente
- [ ] Comandos sendo adaptados
- [ ] Validações funcionando
- [ ] Testes passando
- [ ] Cenários de falha bloqueados
- [ ] Performance aceitável
- [ ] Logs funcionando

### Comando de Verificação Final
```bash
# Verificação completa
npm run migration:verify

# Ou manualmente
echo "Migration complete. Testing all scenarios..."
npm test && echo "✅ Migration successful!"
```

## Suporte

### Logs para Debug
```bash
# Ativar logs completos
export DEBUG=nemesis:*
export NEMESIS_VERBOSE=true

# Executar operação problemática
# Analisar logs gerados
```

### Comando de Status
```bash
# Verificar status do enforcement
node -e "
const { setupEnforcementEngine } = require('./src/workflow-enforcement');
setupEnforcementEngine().then(setup => {
  console.log('Status:', setup);
  console.log('Environment:', setup.environment);
  console.log('Compatible:', setup.isCompatible);
  console.log('Issues:', setup.issues);
});
"
```

## Conclusão

A migração para o Nemesis v2 deve ser transparente para o usuário final, mas oferece melhorias significativas:

1. **Compatibilidade real** com múltiplos ambientes
2. **Enforcement efetivo** de violações de regras
3. **Correção comportamental** da IA
4. **Observabilidade completa** do sistema

Após a migração, os cenários de falha documentados não devem mais ocorrer, e o sistema deve fornecer proteção robusta contra violações das convenções do projeto.

---

**Guia atualizado:** 17 de fevereiro de 2026  
**Versão:** 2.0.0  
**Status:** ✅ pronto para uso
