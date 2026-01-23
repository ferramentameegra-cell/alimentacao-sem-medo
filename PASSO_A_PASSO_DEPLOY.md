# 🚂 Passo a Passo - Deploy no Railway

## ✅ O que JÁ está pronto:

- ✅ Código no GitHub: `ferramentameegra-cell/alimentacao-sem-medo`
- ✅ Configurações do Railway criadas (`railway.json`, `nixpacks.toml`)
- ✅ `package.json` configurado corretamente
- ✅ Scripts de build e start funcionando
- ✅ Token do Railway: `3685c4be-52ef-4742-8058-81de830a4e27`

## 🎯 O que FALTA fazer:

**Apenas conectar o Railway ao repositório GitHub e fazer o deploy!**

---

## 📋 PASSO A PASSO COMPLETO

### **PASSO 1: Acessar o Railway**

1. Abra seu navegador
2. Acesse: **https://railway.app**
3. Clique em **"Login"** ou **"Start a New Project"**

---

### **PASSO 2: Fazer Login**

1. Escolha **"Login with GitHub"**
2. Autorize o Railway a acessar seus repositórios
3. Você será redirecionado para o dashboard do Railway

---

### **PASSO 3: Criar Novo Projeto**

1. No dashboard, clique no botão **"+ New Project"** (canto superior direito)
2. Selecione **"Deploy from GitHub repo"**
3. Você verá uma lista dos seus repositórios GitHub

---

### **PASSO 4: Selecionar Repositório**

1. Procure e selecione: **`alimentacao-sem-medo`**
   - Repositório: `ferramentameegra-cell/alimentacao-sem-medo`
2. Clique em **"Deploy Now"** ou **"Add"**

---

### **PASSO 5: Aguardar Deploy Automático**

O Railway irá automaticamente:

1. **Detectar** que é um projeto Next.js
2. **Instalar** dependências (`npm ci`)
3. **Fazer build** (`npm run build`)
4. **Iniciar** o servidor (`npm start`)

⏱️ **Tempo estimado**: 3-5 minutos

---

### **PASSO 6: Obter URL do Deploy**

Após o deploy concluir:

1. No dashboard do Railway, clique no projeto **`alimentacao-sem-medo`**
2. Vá na aba **"Settings"** (no menu lateral)
3. Role até a seção **"Domains"**
4. Você verá uma URL automática tipo:
   ```
   alimentacao-sem-medo-production.up.railway.app
   ```
5. Clique na URL para abrir e testar!

---

### **PASSO 7: (Opcional) Configurar Domínio Customizado**

Se quiser usar um domínio próprio:

1. Na seção **"Domains"**, clique em **"Custom Domain"**
2. Adicione seu domínio (ex: `alimentacaosemmedo.com`)
3. Configure os registros DNS conforme instruções do Railway
4. Aguarde a propagação DNS (pode levar algumas horas)

---

## 🔄 Deploy Automático (Já Configurado!)

Após conectar o Railway ao repositório, **cada push para `main` fará deploy automático**:

```bash
git add .
git commit -m "Sua mensagem"
git push origin main
```

O Railway detectará automaticamente e fará o deploy!

---

## 📊 Monitorar Deploy

### Ver Logs em Tempo Real:

1. No dashboard do Railway
2. Clique no projeto
3. Vá na aba **"Deployments"**
4. Clique no deployment mais recente
5. Veja os logs em tempo real

### Ver Status:

- ✅ **Success** = Deploy concluído com sucesso
- ⏳ **Building** = Ainda fazendo build
- ❌ **Failed** = Erro no deploy (veja os logs)

---

## 🆘 Troubleshooting

### ❌ Build falha?

1. **Verifique os logs** no Railway
2. **Teste localmente**:
   ```bash
   npm ci
   npm run build
   ```
3. **Verifique** se todas as dependências estão em `dependencies` (não `devDependencies`)

### ❌ Aplicação não inicia?

1. **Verifique os logs** de erro
2. **Confirme** que a porta está usando `$PORT`
3. **Teste localmente**:
   ```bash
   npm start
   ```

### ❌ Deploy automático não funciona?

1. **Verifique** se o Railway está conectado ao repositório:
   - Settings > GitHub
   - Deve mostrar o repositório conectado
2. **Verifique** se está fazendo push para a branch `main`
3. **Verifique** os webhooks do GitHub (Railway cria automaticamente)

---

## ✅ Checklist Final

Antes de começar, confirme:

- [x] Código no GitHub
- [x] Configurações criadas
- [x] package.json correto
- [ ] **Conta Railway criada** ← Fazer agora
- [ ] **Projeto conectado ao GitHub** ← Fazer agora
- [ ] **Deploy inicial realizado** ← Fazer agora
- [ ] **URL obtida e testada** ← Fazer agora

---

## 🎉 Resumo

**O que falta fazer:**

1. ✅ Acessar https://railway.app
2. ✅ Fazer login com GitHub
3. ✅ Criar novo projeto
4. ✅ Selecionar repositório `alimentacao-sem-medo`
5. ✅ Clicar em "Deploy Now"
6. ✅ Aguardar 3-5 minutos
7. ✅ Obter URL e testar!

**Tempo total**: ~10 minutos

---

## 📚 Links Úteis

- **Railway Dashboard**: https://railway.app/dashboard
- **Repositório GitHub**: https://github.com/ferramentameegra-cell/alimentacao-sem-medo
- **Documentação Railway**: https://docs.railway.app

---

## 🚀 Pronto para Deploy!

Tudo está configurado! Basta seguir os passos acima e seu projeto estará no ar em minutos! 🎉
