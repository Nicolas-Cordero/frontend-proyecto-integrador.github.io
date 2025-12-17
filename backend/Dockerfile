FROM node:18-alpine

RUN apk add --no-cache python3 make g++ sqlite

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY src/ ./src/

RUN mkdir -p data/simulaciones

EXPOSE 4000

CMD ["node", "src/servidor.js"]

