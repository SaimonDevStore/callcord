# 🚀 Deploy no Render

## 📋 Passos para Deploy:

### 1. Acesse o Render
- Vá para [render.com](https://render.com)
- Faça login ou crie conta

### 2. Conecte o GitHub
- Clique em "New +"
- Selecione "Web Service"
- Conecte seu repositório: `SaimonDevStore/callcord`

### 3. Configure o Serviço
- **Name:** `callcord`
- **Environment:** `Node`
- **Region:** `Oregon (US West)`
- **Branch:** `master`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`

### 4. Configure as Variáveis de Ambiente
Adicione estas variáveis:

```
NODE_ENV=production
DATABASE_URL=sua_url_do_neon
CLERK_SECRET_KEY=sua_clerk_secret_key
CLERK_PUBLISHABLE_KEY=sua_clerk_publishable_key
LIVEKIT_API_KEY=sua_livekit_api_key
LIVEKIT_API_SECRET=sua_livekit_api_secret
NEXT_PUBLIC_LIVEKIT_URL=https://sua_livekit_url.livekit.cloud
UPLOADTHING_SECRET=seu_uploadthing_secret
NEXT_PUBLIC_BASE_URL=https://seu_app.onrender.com
NEXT_PUBLIC_APP_URL=https://seu_app.onrender.com
```

### 5. Deploy
- Clique em "Create Web Service"
- Aguarde o build e deploy

## 🎯 Vantagens do Render:
- ✅ Mais estável para Next.js 14/15
- ✅ Melhor suporte para Server Components
- ✅ Menos problemas com serialização
- ✅ Deploy mais rápido
- ✅ Suporte técnico melhor

## 🔧 Se houver problemas:
1. Verifique os logs do build
2. Confirme se todas as variáveis estão configuradas
3. Teste localmente primeiro
