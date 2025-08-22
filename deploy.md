# 🚀 Deploy do CALLCORD no Render

## 📋 **Pré-requisitos**

1. **Conta no Render** (gratuita): https://render.com
2. **Banco PostgreSQL** (pode ser do Render ou externo)
3. **Conta no Clerk** para autenticação
4. **Conta no LiveKit** para voz/vídeo
5. **Conta no UploadThing** para uploads

## 🔧 **Passo 1: Preparar o Banco de Dados**

### **Opção A: Banco do Render (Recomendado)**
1. No Render Dashboard → "New" → "PostgreSQL"
2. Nome: `callcord-db`
3. Database: `callcord`
4. User: `callcord_user`
5. Copie a **Internal Database URL**

### **Opção B: Banco Externo (Supabase, Neon, etc.)**
- Use a URL de conexão fornecida pelo serviço

## 🔑 **Passo 2: Configurar Clerk**

1. Acesse: https://dashboard.clerk.com
2. Crie um novo aplicativo
3. Em "API Keys", copie:
   - **Publishable Key**
   - **Secret Key**
4. Em "Webhooks", crie um webhook para:
   - URL: `https://seu-app.onrender.com/api/webhook/clerk`
   - Eventos: `user.created`, `user.updated`

## 🎥 **Passo 3: Configurar LiveKit**

1. Acesse: https://cloud.livekit.io
2. Crie um novo projeto
3. Copie:
   - **API Key**
   - **API Secret**
   - **WebSocket URL**

## 📤 **Passo 4: Configurar UploadThing**

1. Acesse: https://uploadthing.com
2. Crie um novo projeto
3. Copie:
   - **App ID**
   - **Secret Key**
   - **URL**

## 🌐 **Passo 5: Deploy no Render**

### **5.1: Conectar Repositório**
1. No Render Dashboard → "New" → "Web Service"
2. Conecte seu repositório GitHub
3. Selecione o repositório `discord-clone-main`

### **5.2: Configurações do Serviço**
```
Name: callcord
Environment: Node
Region: Escolha o mais próximo
Branch: main
Root Directory: (deixe vazio)
Build Command: npm install && npx prisma generate && npm run build
Start Command: npm start
```

### **5.3: Variáveis de Ambiente**
Adicione todas estas variáveis:

```env
NODE_ENV=production
DATABASE_URL=sua_url_do_banco
CLERK_SECRET_KEY=sua_clerk_secret
CLERK_PUBLISHABLE_KEY=sua_clerk_publishable
CLERK_WEBHOOK_SECRET=seu_webhook_secret
LIVEKIT_API_KEY=sua_livekit_api_key
LIVEKIT_API_SECRET=sua_livekit_api_secret
NEXT_PUBLIC_LIVEKIT_URL=sua_livekit_url
UPLOADTHING_SECRET=sua_uploadthing_secret
UPLOADTHING_APP_ID=sua_uploadthing_app_id
UPLOADTHING_URL=sua_uploadthing_url
```

### **5.4: Deploy**
1. Clique em "Create Web Service"
2. Aguarde o build (pode demorar 5-10 minutos)
3. O Render fornecerá uma URL: `https://seu-app.onrender.com`

## 🗄️ **Passo 6: Configurar Banco de Dados**

### **6.1: Executar Migrações**
1. No Render Dashboard → seu serviço → "Shell"
2. Execute:
```bash
npx prisma migrate deploy
npx prisma db seed
```

### **6.2: Verificar Conexão**
```bash
npx prisma studio
```

## 🔄 **Passo 7: Atualizar Webhook do Clerk**

1. Volte ao Clerk Dashboard
2. Atualize a URL do webhook para: `https://seu-app.onrender.com/api/webhook/clerk`
3. Teste o webhook

## ✅ **Passo 8: Testar**

1. Acesse: `https://seu-app.onrender.com`
2. Teste:
   - ✅ Login/Registro
   - ✅ Criação de servidores
   - ✅ Chat em tempo real
   - ✅ Canais de voz/vídeo
   - ✅ Sistema de cargos
   - ✅ Comandos Nitro

## 🚨 **Problemas Comuns**

### **Erro de Build**
- Verifique se todas as dependências estão no `package.json`
- Confirme se o Node.js 18+ está sendo usado

### **Erro de Banco**
- Verifique se a `DATABASE_URL` está correta
- Confirme se o banco está acessível

### **Erro de Autenticação**
- Verifique as chaves do Clerk
- Confirme se o webhook está funcionando

### **Erro de LiveKit**
- Verifique as chaves do LiveKit
- Confirme se a URL está correta

## 📱 **URLs Importantes**

- **App**: `https://seu-app.onrender.com`
- **Clerk Dashboard**: https://dashboard.clerk.com
- **LiveKit Cloud**: https://cloud.livekit.io
- **UploadThing**: https://uploadthing.com
- **Render Dashboard**: https://dashboard.render.com

## 🎉 **Sucesso!**

Seu CALLCORD está rodando em produção! 🚀

**URL Final**: `https://seu-app.onrender.com`
