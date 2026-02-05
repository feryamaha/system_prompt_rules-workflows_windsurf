## Para atualizar o repositório original com o repositório de backup, siga os passos abaixo:

git remote set-url origin https://github.com/feryamaha/system_prompt_rules-workflows_windsurf.git
git remote add backup https://github.com/mayconmartins01/readme-ias.git

# 1. Adicionar arquivos
git add .

# 2. Commit (ajuste a mensagem conforme necessário)
git commit -m "sua mensagem de commit"

# 3. Push para o repositório original (origin)
git push origin master   # ou main, conforme o nome da sua branch

# 4. Push para o repositório secundário (backup)
git push backup master   # ou main, igual ao passo anterior