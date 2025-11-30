FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

COPY prisma ./prisma

RUN npm ci --only=production

COPY . .

FROM node:20-alpine

WORKDIR /app

RUN mkdir -p /app/uploads/products
RUN mkdir -p /app/uploads/profiles

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

COPY . .

EXPOSE 8080

ENTRYPOINT ["npm", "start"]