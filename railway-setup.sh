#!/bin/bash

# Script de configuração do Railway
# Token: 3685c4be-52ef-4742-8058-81de830a4e27

echo "🚂 Configurando deploy no Railway..."

# Verificar se Railway CLI está instalado
if ! command -v railway &> /dev/null; then
    echo "📦 Instalando Railway CLI..."
    npm install -g @railway/cli
fi

# Login no Railway
echo "🔐 Fazendo login no Railway..."
echo "3685c4be-52ef-4742-8058-81de830a4e27" | railway login

# Criar projeto
echo "📦 Criando projeto no Railway..."
railway init --name alimentacao-sem-medo

# Conectar ao repositório GitHub
echo "🔗 Conectando ao repositório GitHub..."
railway link

# Configurar variáveis de ambiente
echo "⚙️ Configurando variáveis de ambiente..."
railway variables set NODE_ENV=production

# Fazer deploy
echo "🚀 Fazendo deploy..."
railway up

echo "✅ Deploy configurado com sucesso!"
echo "🌐 Acesse o dashboard do Railway para ver a URL do deploy:"
echo "   https://railway.app/dashboard"
