# 🚂 Deploy no Railway - Guia Rápido

## ✅ Arquivos de Configuração Criados

Todos os arquivos necessários para deploy no Railway já foram criados e commitados:

- ✅ `railway.json` - Configuração do Railway
- ✅ `nixpacks.toml` - Configuração do buildpack Nixpacks
- ✅ `Dockerfile` - Para deploy via Docker (opcional)
- ✅ `Procfile` - Para deploy via buildpack (padrão)
- ✅ `next.config.js` - Atualizado com `output: 'standalone'`

## 🚀 Passo a Passo para Deploy

### 1. Acesse o Railway

Acesse: https://railway.app

### 2. Faça Login

- Clique em "Login" ou "Start a New Project"
- Escolha "Login with GitHub"
- Autorize o Railway a acessar seus repositórios

### 3. Criar Novo Projeto

1. Clique em **"New Project"**
2. Selecione **"Deploy from GitHub repo"**
3. Escolha o repositório: **`ferramentameegra-cell/alimentacao-sem-medo`**
4. Clique em **"Deploy Now"**

### 4. Configuração Automática

O Railway detectará automaticamente:
- ✅ Framework: Next.js
- ✅ Build Command: `npm run build`
- ✅ Start Command: `npm start`
- ✅ Port: 3000

### 5. Variáveis de Ambiente (Opcional)

Se precisar de variáveis de ambiente:

1. Vá em **Settings** > **Variables**
2. Adicione as variáveis necessárias:
   ```
   NODE_ENV=production
   ```

### 6. Aguardar Deploy

O Railway irá:
1. Instalar dependências (`npm ci`)
2. Fazer build do projeto (`npm run build`)
3. Iniciar o servidor (`npm start`)

### 7. Obter URL do Deploy

Após o deploy:
1. Vá na aba **Settings**
2. Role até **"Domains"**
3. Você verá uma URL automática tipo: `alimentacao-sem-medo-production.up.railway.app`
4. Clique para abrir e testar!

## 🔄 Deploy Automático

O Railway está configurado para fazer **deploy automático** sempre que você fizer push para a branch `main` no GitHub.

Para fazer deploy manual:
```bash
git add .
git commit -m "Sua mensagem"
git push origin main
```

O Railway detectará automaticamente e fará o deploy!

## 🌐 Domínio Customizado (Opcional)

Para usar um domínio próprio:

1. Vá em **Settings** > **Domains**
2. Clique em **"Custom Domain"**
3. Adicione seu domínio
4. Configure os registros DNS conforme instruções do Railway

## 📊 Monitoramento

O Railway oferece:
- ✅ Logs em tempo real
- ✅ Métricas de uso
- ✅ Status do serviço
- ✅ Histórico de deploys

## 🔧 Troubleshooting

### Build falha?

1. Verifique os logs no Railway
2. Certifique-se de que `npm run build` funciona localmente
3. Verifique se todas as dependências estão no `package.json`

### Aplicação não inicia?

1. Verifique se a porta está configurada como 3000
2. Verifique os logs de erro
3. Certifique-se de que `npm start` funciona localmente

### Deploy automático não funciona?

1. Verifique se o Railway está conectado ao repositório correto
2. Verifique se está fazendo push para a branch `main`
3. Verifique as configurações de webhook no GitHub

## 💰 Plano Gratuito

O Railway oferece:
- ✅ $5 de crédito grátis por mês
- ✅ Deploy ilimitado
- ✅ Domínios gratuitos (.railway.app)
- ✅ SSL automático

## 📝 Comandos Úteis

```bash
# Ver status do repositório
git status

# Fazer commit e push
git add .
git commit -m "Sua mensagem"
git push origin main

# Ver logs do Railway (via CLI - opcional)
railway logs
```

## 🎉 Pronto!

Seu projeto está configurado e pronto para deploy no Railway!

**Repositório GitHub**: https://github.com/ferramentameegra-cell/alimentacao-sem-medo

**Próximo passo**: Acesse https://railway.app e faça o deploy!
