# 🚂 Railway - Início Rápido com Token

## Token Configurado

Seu token do Railway está configurado: `3685c4be-52ef-4742-8058-81de830a4e27`

## Opção 1: Via Interface Web (Mais Fácil) ⭐

1. **Acesse**: https://railway.app
2. **Faça login** com sua conta GitHub
3. **Clique em "New Project"**
4. **Selecione "Deploy from GitHub repo"**
5. **Escolha**: `ferramentameegra-cell/alimentacao-sem-medo`
6. **Clique em "Deploy Now"**

O Railway detectará automaticamente a configuração e fará o deploy!

## Opção 2: Via Railway CLI

### Instalar Railway CLI

```bash
npm install -g @railway/cli
```

### Login

```bash
railway login
# Quando solicitado, cole o token: 3685c4be-52ef-4742-8058-81de830a4e27
```

### Criar e Configurar Projeto

```bash
# Navegar até o diretório do projeto
cd "/Users/josyasborba/fernando lemos"

# Inicializar projeto
railway init

# Conectar ao repositório GitHub (se ainda não conectado)
railway link

# Configurar variáveis de ambiente
railway variables set NODE_ENV=production

# Fazer deploy
railway up
```

### Ou usar o script automatizado

```bash
./railway-setup.sh
```

## Opção 3: Via Script Automatizado

Execute o script que foi criado:

```bash
cd "/Users/josyasborba/fernando lemos"
./railway-setup.sh
```

## 🔄 Deploy Automático

Após conectar o Railway ao repositório GitHub, cada push para `main` fará deploy automático:

```bash
git add .
git commit -m "Sua mensagem"
git push origin main
```

## 🌐 Obter URL do Deploy

Após o primeiro deploy:

1. Acesse o dashboard: https://railway.app/dashboard
2. Clique no projeto `alimentacao-sem-medo`
3. Vá em **Settings** > **Domains**
4. Você verá a URL: `alimentacao-sem-medo-production.up.railway.app`

## 📊 Monitorar Deploy

```bash
# Ver logs em tempo real
railway logs

# Ver status
railway status

# Ver variáveis de ambiente
railway variables
```

## ⚙️ Variáveis de Ambiente

Se precisar adicionar variáveis de ambiente:

```bash
railway variables set NOME_VARIAVEL=valor
```

Ou via dashboard:
1. Vá em **Settings** > **Variables**
2. Adicione as variáveis necessárias

## 🔐 Segurança do Token

⚠️ **IMPORTANTE**: O token foi salvo neste arquivo. Para maior segurança:

1. Não compartilhe este token publicamente
2. Considere usar variáveis de ambiente
3. O token pode ser revogado e regenerado no dashboard do Railway

## ✅ Checklist de Deploy

- [x] Código no GitHub
- [x] Arquivos de configuração criados
- [x] Token do Railway configurado
- [ ] Projeto criado no Railway (via web ou CLI)
- [ ] Deploy inicial realizado
- [ ] URL do deploy obtida
- [ ] Testado e funcionando

## 🆘 Problemas?

### Build falha?
- Verifique os logs: `railway logs`
- Teste localmente: `npm run build`

### Deploy não inicia?
- Verifique a porta: deve ser 3000
- Verifique variáveis de ambiente
- Veja os logs de erro

### Deploy automático não funciona?
- Verifique se o Railway está conectado ao repositório
- Verifique se está fazendo push para `main`
- Verifique as configurações de webhook

## 📚 Documentação

- Railway Docs: https://docs.railway.app
- Railway Dashboard: https://railway.app/dashboard
- Repositório: https://github.com/ferramentameegra-cell/alimentacao-sem-medo

## 🎉 Pronto para Deploy!

Tudo está configurado! Escolha uma das opções acima e faça o deploy.

**Recomendação**: Use a **Opção 1 (Interface Web)** - é a mais simples e rápida!
