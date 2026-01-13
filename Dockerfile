FROM node:20-alpine

WORKDIR /app

# Copia arquivos de dependências
COPY package*.json ./

# Instala dependências
RUN npm ci --only=production

# Copia código da aplicação
COPY . .

# Expõe porta
EXPOSE 3000

# Comando padrão (pode ser sobrescrito no docker-compose)
CMD ["node", "src/server.js"]