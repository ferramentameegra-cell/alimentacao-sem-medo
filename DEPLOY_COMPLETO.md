# 🚀 Deploy Completo - GitHub + Railway

## ✅ Status Atual

- ✅ **GitHub**: Código enviado e sincronizado
- ✅ **Railway**: Configuração completa pronta
- ✅ **Token Railway**: Configurado (`3685c4be-52ef-4742-8058-81de830a4e27`)

## 📍 Repositório GitHub

**URL**: https://github.com/ferramentameegra-cell/alimentacao-sem-medo

## 🚂 Deploy no Railway - 3 Opções

### ⭐ Opção 1: Interface Web (RECOMENDADO - Mais Fácil)

1. **Acesse**: https://railway.app
2. **Faça login** com sua conta GitHub
3. **Clique em "New Project"**
4. **Selecione "Deploy from GitHub repo"**
5. **Escolha**: `ferramentameegra-cell/alimentacao-sem-medo`
6. **Clique em "Deploy Now"**

✅ **Pronto!** O Railway fará o deploy automaticamente.

**Tempo estimado**: 2-3 minutos

---

### Opção 2: Railway CLI (Local)

#### Instalar Railway CLI

```bash
# Opção A: Global (requer sudo)
sudo npm install -g @railway/cli

# Opção B: Local no projeto (já instalado)
cd "/Users/josyasborba/fernando lemos"
npm install --save-dev @railway/cli
npx railway --version
```

#### Login e Deploy

```bash
# Login com token
echo "3685c4be-52ef-4742-8058-81de830a4e27" | railway login

# Ou usar npx se instalado localmente
npx railway login

# Criar projeto
railway init --name alimentacao-sem-medo

# Conectar ao GitHub (se necessário)
railway link

# Fazer deploy
railway up
```

---

### Opção 3: Script Automatizado

```bash
cd "/Users/josyasborba/fernando lemos"
./railway-setup.sh
```

---

## 🔄 Deploy Automático

Após conectar o Railway ao repositório GitHub, **cada push para `main` fará deploy automático**:

```bash
git add .
git commit -m "Sua mensagem"
git push origin main
```

O Railway detectará automaticamente e fará o deploy!

---

## 🌐 Obter URL do Deploy

Após o primeiro deploy:

1. Acesse: https://railway.app/dashboard
2. Clique no projeto `alimentacao-sem-medo`
3. Vá em **Settings** > **Domains**
4. Você verá a URL: `alimentacao-sem-medo-production.up.railway.app`

**Ou via CLI:**
```bash
railway domain
```

---

## ⚙️ Configurações Importantes

### Variáveis de Ambiente

Se precisar adicionar variáveis:

**Via Dashboard:**
1. Vá em **Settings** > **Variables**
2. Adicione: `NODE_ENV=production`

**Via CLI:**
```bash
railway variables set NODE_ENV=production
```

### Porta

O Railway detecta automaticamente a porta 3000 do Next.js. Não é necessário configurar.

---

## 📊 Monitoramento

### Ver Logs

**Via Dashboard:**
- Acesse o projeto no Railway
- Clique na aba **"Deployments"**
- Veja os logs em tempo real

**Via CLI:**
```bash
railway logs
railway logs --tail  # Logs em tempo real
```

### Status do Deploy

```bash
railway status
```

---

## 🔧 Troubleshooting

### ❌ Build falha?

1. **Verifique os logs:**
   ```bash
   railway logs
   ```

2. **Teste localmente:**
   ```bash
   npm run build
   ```

3. **Verifique dependências:**
   ```bash
   npm install
   ```

### ❌ Aplicação não inicia?

1. **Verifique a porta:** Deve ser 3000 (padrão do Next.js)
2. **Verifique variáveis de ambiente**
3. **Veja os logs de erro:**
   ```bash
   railway logs --tail
   ```

### ❌ Deploy automático não funciona?

1. **Verifique conexão GitHub:**
   - Vá em Settings > GitHub
   - Certifique-se de que o repositório está conectado

2. **Verifique branch:**
   - Deve fazer push para `main`

3. **Verifique webhooks:**
   - Railway cria webhooks automaticamente

---

## 📝 Arquivos de Configuração

Todos os arquivos necessários já foram criados:

- ✅ `railway.json` - Configuração do Railway
- ✅ `nixpacks.toml` - Buildpack Nixpacks
- ✅ `Dockerfile` - Deploy via Docker
- ✅ `Procfile` - Deploy via buildpack
- ✅ `next.config.js` - Configurado para produção
- ✅ `.railway.env` - Referência de variáveis

---

## 🎯 Próximos Passos

1. **Escolha uma opção de deploy acima** (recomendo Opção 1)
2. **Aguarde o deploy** (2-3 minutos)
3. **Obtenha a URL** do deploy
4. **Teste a aplicação**
5. **Configure domínio customizado** (opcional)

---

## 🔐 Segurança

⚠️ **IMPORTANTE**: 

- O token do Railway está documentado neste guia
- Para produção, considere usar variáveis de ambiente
- O token pode ser revogado e regenerado no dashboard

**Para regenerar token:**
1. Acesse: https://railway.app/account
2. Vá em **Tokens**
3. Revogue o antigo e crie um novo

---

## ✅ Checklist Final

- [x] Código no GitHub
- [x] Arquivos de configuração criados
- [x] Token do Railway configurado
- [ ] Projeto criado no Railway
- [ ] Deploy inicial realizado
- [ ] URL do deploy obtida
- [ ] Aplicação testada e funcionando
- [ ] Deploy automático configurado

---

## 📚 Links Úteis

- **Railway Dashboard**: https://railway.app/dashboard
- **Railway Docs**: https://docs.railway.app
- **GitHub Repo**: https://github.com/ferramentameegra-cell/alimentacao-sem-medo
- **Railway Status**: https://status.railway.app

---

## 🎉 Pronto!

Tudo está configurado e pronto para deploy!

**Recomendação**: Use a **Opção 1 (Interface Web)** - é a mais rápida e simples!

**Tempo total estimado**: 5 minutos para ter sua aplicação no ar! 🚀
