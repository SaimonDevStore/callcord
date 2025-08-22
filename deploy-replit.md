# 🚀 Deploy do CALLCORD no Replit

## 📋 **Pré-requisitos**

1. **Conta no Replit** (gratuita): https://replit.com
2. **Banco PostgreSQL** (Replit, Supabase, Neon, etc.)
3. **Conta no Clerk** para autenticação
4. **Conta no LiveKit** para voz/vídeo
5. **Conta no UploadThing** para uploads

## 🔧 **Passo 1: Criar Replit**

### **1.1: Acessar Replit**
1. Vá para: https://replit.com
2. Faça login ou crie uma conta
3. Clique em "Create Repl"

### **1.2: Configurar o Repl**
```
Template: Node.js
Title: CALLCORD
Description: Discord clone com Next.js
```

### **1.3: Importar o Projeto**
1. **Opção A: GitHub**
   - Clique em "Import from GitHub"
   - Cole a URL: `https://github.com/seu-usuario/discord-clone-main`
   - Clique em "Import from GitHub"

2. **Opção B: Upload Manual**
   - Faça download do projeto
   - Arraste os arquivos para o Replit

## 🗄️ **Passo 2: Configurar Banco de Dados**

### **Opção A: Replit Database (Gratuito)**
1. No Replit → "Tools" → "Database"
2. Clique em "Create Database"
3. Escolha "PostgreSQL"
4. Copie a **Connection String**

### **Opção B: Banco Externo (Recomendado)**
- **Supabase**: https://supabase.com
- **Neon**: https://neon.tech
- **Railway**: https://railway.app

## 🔑 **Passo 3: Configurar Clerk**

1. Acesse: https://dashboard.clerk.com
2. Crie um novo aplicativo
3. Em "API Keys", copie:
   - **Publishable Key**
   - **Secret Key**
4. Em "Webhooks", crie um webhook para:
   - URL: `https://seu-repl.replit.app/api/webhook/clerk`
   - Eventos: `user.created`, `user.updated`

## 🎥 **Passo 4: Configurar LiveKit**

1. Acesse: https://cloud.livekit.io
2. Crie um novo projeto
3. Copie:
   - **API Key**
   - **API Secret**
   - **WebSocket URL**

## 📤 **Passo 5: Configurar UploadThing**

1. Acesse: https://uploadthing.com
2. Crie um novo projeto
3. Copie:
   - **App ID**
   - **Secret Key**
   - **URL**

## ⚙️ **Passo 6: Configurar Variáveis de Ambiente**

### **6.1: No Replit**
1. Clique em "Tools" → "Secrets"
2. Adicione cada variável:

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

### **6.2: Exemplo de Banco Replit**
```env
DATABASE_URL=postgresql://postgres:senha@localhost:5432/callcord
```

## 🚀 **Passo 7: Instalar Dependências**

### **7.1: No Terminal do Replit**
```bash
npm install
```

### **7.2: Gerar Prisma Client**
```bash
npx prisma generate
```

### **7.3: Executar Migrações**
```bash
npx prisma migrate deploy
```

## 🌐 **Passo 8: Configurar Domínio**

### **8.1: Replit Pro (Pago)**
- Vá em "Tools" → "Domains"
- Configure um domínio personalizado

### **8.2: Replit Gratuito**
- Use a URL padrão: `https://seu-repl.replit.app`
- Ou use o domínio: `https://seu-repl.replit.co`

## 🔄 **Passo 9: Atualizar Webhook do Clerk**

1. Volte ao Clerk Dashboard
2. Atualize a URL do webhook para: `https://seu-repl.replit.app/api/webhook/clerk`
3. Teste o webhook

## ✅ **Passo 10: Testar**

1. Clique em "Run" no Replit
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

### **Erro de Porta**
- O Replit usa a porta 3000 por padrão
- Verifique se não há conflitos

## 📱 **URLs Importantes**

- **App**: `https://seu-repl.replit.app`
- **Clerk Dashboard**: https://dashboard.clerk.com
- **LiveKit Cloud**: https://cloud.livekit.io
- **UploadThing**: https://uploadthing.com
- **Replit Dashboard**: https://replit.com

## 🎉 **Vantagens do Replit**

✅ **Gratuito** para projetos pequenos
✅ **Deploy automático** a cada commit
✅ **Terminal integrado** para comandos
✅ **Banco de dados** integrado
✅ **Domínio personalizado** (com Pro)
✅ **Colaboração em tempo real**

## 💰 **Planos Replit**

- **Hacker (Gratuito)**: 500MB RAM, 0.5 CPU
- **Pro ($7/mês)**: 2GB RAM, 1 CPU, domínio personalizado
- **Teams ($20/mês)**: 4GB RAM, 2 CPU, colaboração avançada

## 🎯 **Próximos Passos**

1. **Criar o Repl** no Replit
2. **Importar o projeto** do GitHub
3. **Configurar as variáveis** de ambiente
4. **Executar as migrações** do banco
5. **Testar todas as funcionalidades**

## 🚀 **Sucesso!**

Seu CALLCORD está rodando no Replit! 🎉

**URL Final**: `https://seu-repl.replit.app`

