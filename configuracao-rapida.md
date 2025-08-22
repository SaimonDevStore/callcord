# ⚡ Configuração Rápida - CALLCORD Local

## 🚀 **Setup em 5 Minutos**

### **1. Banco de Dados (Escolha uma opção)**

#### **Opção A: Supabase (Mais Fácil)**
1. Acesse: https://supabase.com
2. Crie conta gratuita
3. Crie novo projeto
4. Vá em "Settings" → "Database"
5. Copie a **Connection String**

#### **Opção B: PostgreSQL Local**
1. Baixe: https://www.postgresql.org/download/windows/
2. Instale com senha: `callcord123`
3. Use: `postgresql://postgres:callcord123@localhost:5432/callcord`

### **2. Clerk (Autenticação)**
1. Acesse: https://dashboard.clerk.com
2. Crie novo aplicativo
3. Copie as chaves da API
4. Configure webhook: `http://localhost:3000/api/webhook/clerk`

### **3. LiveKit (Voz/Vídeo)**
1. Acesse: https://cloud.livekit.io
2. Crie novo projeto
3. Copie API Key, Secret e URL

### **4. UploadThing (Arquivos)**
1. Acesse: https://uploadthing.com
2. Crie novo projeto
3. Copie App ID, Secret e URL

## ⚙️ **Arquivo .env**

Crie um arquivo `.env` na raiz do projeto:

```env
# Ambiente
NODE_ENV=development

# Banco de Dados
DATABASE_URL="sua_url_do_banco"

# Clerk
CLERK_SECRET_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# LiveKit
LIVEKIT_API_KEY=API...
LIVEKIT_API_SECRET=...
NEXT_PUBLIC_LIVEKIT_URL=wss://seu-projeto.livekit.cloud

# UploadThing
UPLOADTHING_SECRET=sk_live_...
UPLOADTHING_APP_ID=...
UPLOADTHING_URL=https://uploadthing.com
```

## 🖥️ **Iniciar Servidor**

### **Opção 1: Script Automático**
```bash
# Clique duas vezes no arquivo:
start-local.bat
```

### **Opção 2: Comando Manual**
```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

### **Opção 3: Com PM2 (Mais Estável)**
```bash
# Clique duas vezes no arquivo:
start-pm2.bat
```

## 🌐 **URLs de Acesso**

- **Seu PC**: `http://localhost:3000`
- **Amigos na rede**: `http://[SEU-IP]:3000`
- **Descobrir IP**: Execute `get-ip.bat`

## 🔧 **Comandos Úteis**

```bash
# Ver status do servidor
pm2 status

# Ver logs
pm2 logs callcord

# Reiniciar
pm2 restart callcord

# Parar
pm2 stop callcord

# Ver banco
npx prisma studio
```

## 🚨 **Problemas Comuns**

### **Erro de Porta**
```bash
# Verificar se está em uso
netstat -ano | findstr :3000

# Matar processo
taskkill /PID [PID] /F
```

### **Erro de Banco**
```bash
# Resetar banco
npx prisma migrate reset

# Sincronizar
npx prisma db push
```

### **Erro de Rede**
- Verifique firewall
- Verifique se está na mesma rede WiFi
- Teste com `ping [IP-DO-AMIGO]`

## 📱 **Teste com Amigos**

1. **Execute** `get-ip.bat` para descobrir seu IP
2. **Compartilhe** a URL com seus amigos
3. **Testem** login, chat e voz juntos
4. **Verifiquem** se tudo está funcionando

## 🎯 **Próximos Passos**

✅ **Configurar** banco de dados
✅ **Configurar** Clerk, LiveKit, UploadThing
✅ **Iniciar** servidor
✅ **Testar** localmente
✅ **Compartilhar** com amigos

## 🎉 **Sucesso!**

Seu CALLCORD está rodando localmente! 🏠

**Dica**: Use o script `start-pm2.bat` para maior estabilidade

