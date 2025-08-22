# Dockerfile simples para Next.js no Render
FROM node:18-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código
COPY . .

# Configurar ambiente
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Build da aplicação
RUN npm run build

# Expor porta
EXPOSE 3000

# Iniciar aplicação
CMD ["npm", "start"]
