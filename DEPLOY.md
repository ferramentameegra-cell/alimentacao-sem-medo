# Guia de Deploy Automático

## ✅ Repositório GitHub Configurado

O repositório foi criado e configurado com sucesso:
- **URL**: https://github.com/ferramentameegra-cell/alimentacao-sem-medo
- **Branch principal**: `main`

## 🚀 Opções de Deploy

### Opção 1: Vercel (Recomendado para Next.js)

1. Acesse [vercel.com](https://vercel.com) e faça login com sua conta GitHub
2. Clique em "Add New Project"
3. Selecione o repositório `alimentacao-sem-medo`
4. Vercel detectará automaticamente que é um projeto Next.js
5. Clique em "Deploy"

**Deploy automático**: Toda vez que você fizer push para a branch `main`, o Vercel fará deploy automaticamente.

**Para configurar secrets no GitHub Actions (opcional)**:
1. Vá em Settings > Secrets and variables > Actions no GitHub
2. Adicione os seguintes secrets:
   - `VERCEL_TOKEN`: Token do Vercel (obtenha em Vercel > Settings > Tokens)
   - `VERCEL_ORG_ID`: ID da organização (encontrado na URL do projeto Vercel)
   - `VERCEL_PROJECT_ID`: ID do projeto (encontrado na URL do projeto Vercel)

### Opção 2: Netlify

1. Acesse [netlify.com](https://netlify.com) e faça login com GitHub
2. Clique em "Add new site" > "Import an existing project"
3. Selecione o repositório `alimentacao-sem-medo`
4. Configure:
   - Build command: `npm run build`
   - Publish directory: `.next`
5. Clique em "Deploy site"

### Opção 3: GitHub Actions (Deploy customizado)

O workflow já está configurado em `.github/workflows/deploy.yml`. Você pode personalizar para fazer deploy em qualquer plataforma.

## 📝 Comandos Git

Para fazer push de novas alterações:

```bash
git add .
git commit -m "Sua mensagem de commit"
git push origin main
```

O deploy será automático após o push!

## 🔐 Segurança

⚠️ **IMPORTANTE**: O token do GitHub está configurado no remote. Para maior segurança, considere usar SSH ou GitHub CLI no futuro.

Para remover o token do remote e usar SSH:

```bash
git remote set-url origin git@github.com:ferramentameegra-cell/alimentacao-sem-medo.git
```
