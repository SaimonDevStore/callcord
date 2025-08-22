# 🏠 Hospedagem Local do CALLCORD

## 📋 **Pré-requisitos**

1. **PC com Windows 10/11** (ou Linux/Mac)
2. **Node.js 18+** instalado
3. **Git** instalado
4. **Porta 3000** disponível
5. **Conexão com internet** estável

## 🔧 **Passo 1: Preparar o Ambiente**

### **1.1: Verificar Node.js**
```bash
node --version
npm --version
```
**Deve mostrar**: Node.js 18.x ou superior

### **1.2: Instalar Dependências Globais**
```bash
npm install -g pm2
npm install -g @prisma/client
```

## 🗄️ **Passo 2: Banco de Dados Local**

### **Opção A: PostgreSQL Local (Recomendado)**
1. **Baixar**: https://www.postgresql.org/download/windows/
2. **Instalar** com senha: `callcord123`
3. **Criar banco**:
```sql
CREATE DATABASE callcord;
CREATE USER callcord_user WITH PASSWORD 'callcord123';
GRANT ALL PRIVILEGES ON DATABASE callcord TO callcord_user;
```

### **Opção B: Banco Online (Mais Fácil)**
- **Supabase**: https://supabase.com (gratuito)
- **Neon**: https://neon.tech (gratuito)

## 🔑 **Passo 3: Configurar Clerk**

1. Acesse: https://dashboard.clerk.com
2. Crie um novo aplicativo
3. Em "API Keys", copie:
   - **Publishable Key**
   - **Secret Key**
4. Em "Webhooks", crie um webhook para:
   - URL: `http://localhost:3000/api/webhook/clerk`
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

### **6.1: Criar arquivo .env**
```env
# Ambiente
NODE_ENV=development

# Banco de Dados Local
DATABASE_URL="postgresql://callcord_user:callcord123@localhost:5432/callcord"

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

## 🚀 **Passo 7: Configurar o Projeto**

### **7.1: Instalar Dependências**
```bash
npm install
```

### **7.2: Gerar Prisma Client**
```bash
npx prisma generate
```

### **7.3: Executar Migrações**
```bash
npx prisma migrate dev --name init
```

### **7.4: Verificar Banco**
```bash
npx prisma studio
```

## 🌐 **Passo 8: Configurar Rede Local**

### **8.1: Descobrir IP Local**
```bash
ipconfig
```
**Procure por**: "IPv4 Address" (ex: 192.168.1.100)

### **8.2: Configurar Firewall**
1. **Windows Defender** → "Firewall"
2. **Permitir aplicativo** → Node.js
3. **Porta 3000** → Permitir entrada

### **8.3: Configurar Roteador (Opcional)**
- **Port Forwarding**: Porta 3000 → IP do seu PC
- **DMZ**: IP do seu PC (só para testes)

## 🖥️ **Passo 9: Iniciar o Servidor**

### **9.1: Modo Desenvolvimento**
```bash
npm run dev
```

### **9.2: Modo Produção (Recomendado)**
```bash
npm run build
npm start
```

### **9.3: Com PM2 (Mais Estável)**
```bash
pm2 start npm --name "callcord" -- start
pm2 save
pm2 startup
```

## 🔗 **Passo 10: URLs de Acesso**

### **10.1: Local (Seu PC)**
- **App**: `http://localhost:3000`
- **API**: `http://localhost:3000/api`

### **10.2: Rede Local (Amigos)**
- **App**: `http://192.168.1.100:3000`
- **API**: `http://192.168.1.100:3000/api`

### **10.3: Internet (Com Port Forward)**
- **App**: `http://seu-ip-publico:3000`
- **API**: `http://seu-ip-publico:3000/api`

## 📱 **Passo 11: Testar com Amigos**

### **11.1: Teste Local**
1. Acesse: `http://localhost:3000`
2. Teste todas as funcionalidades
3. Verifique se está funcionando

### **11.2: Teste na Rede**
1. Amigos acessem: `http://192.168.1.100:3000`
2. Testem login/registro
3. Testem chat e voz

### **11.3: Teste pela Internet**
1. Configure port forwarding
2. Amigos acessem: `http://seu-ip:3000`
3. Testem de qualquer lugar

## 🚨 **Problemas Comuns**

### **Erro de Porta**
```bash
# Verificar se a porta está em uso
netstat -ano | findstr :3000

# Matar processo se necessário
taskkill /PID [PID] /F
```

### **Erro de Banco**
```bash
# Verificar conexão
npx prisma db push

# Resetar banco se necessário
npx prisma migrate reset
```

### **Erro de Rede**
- Verifique firewall
- Verifique antivírus
- Verifique roteador

### **Erro de SSL**
- Use `http://` em vez de `https://`
- Configure certificado local se necessário

## 🔒 **Segurança Local**

### **Recomendações**
✅ **Firewall** ativo
✅ **Antivírus** atualizado
✅ **Senhas** fortes
✅ **Acesso limitado** aos amigos
✅ **Backup** regular do banco

### **Não Recomendado**
❌ **Expor para internet** sem proteção
❌ **Usar em rede pública**
❌ **Compartilhar credenciais**
❌ **Deixar rodando 24/7** sem monitoramento

## 📊 **Monitoramento**

### **Com PM2**
```bash
# Ver status
pm2 status

# Ver logs
pm2 logs callcord

# Reiniciar
pm2 restart callcord

# Parar
pm2 stop callcord
```

### **Com Scripts**
```bash
# Verificar se está rodando
netstat -ano | findstr :3000

# Ver uso de memória
tasklist | findstr node
```

## 🎯 **Vantagens da Hospedagem Local**

✅ **Gratuito** - Sem custos mensais
✅ **Controle total** - Seu servidor, suas regras
✅ **Rede local** - Amigos próximos
✅ **Sem limites** - Use o que quiser
✅ **Privacidade** - Dados ficam com você

## ⚠️ **Limitações**

❌ **IP dinâmico** - Pode mudar
❌ **Depende do PC** - Precisa estar ligado
❌ **Banda limitada** - Sua conexão
❌ **Sem backup** - Precisa configurar
❌ **Manutenção** - Você que resolve

## 🚀 **Próximos Passos**

1. **Instalar** PostgreSQL local
2. **Configurar** as variáveis de ambiente
3. **Executar** as migrações
4. **Testar** localmente
5. **Compartilhar** com amigos na rede

## 🎉 **Sucesso!**

Seu CALLCORD está rodando localmente! 🏠

**URLs**:
- **Local**: `http://localhost:3000`
- **Rede**: `http://192.168.1.100:3000`
- **Internet**: `http://seu-ip:3000`

