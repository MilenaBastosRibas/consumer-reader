FROM node:18-alpine

# Definir o diretório de trabalho dentro do container
WORKDIR /app

# Copiar o arquivo package.json e instalar as dependências
COPY package*.json ./
RUN npm install

# Copiar todo o código da aplicação para o diretório de trabalho
COPY . .

# Compilar o código TypeScript para JavaScript
RUN npm run build

# Expor a porta que a aplicação irá usar
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "run", "start:prod"]