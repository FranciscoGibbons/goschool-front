# Etapa 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

# Etapa 2: Producción
FROM node:18-alpine AS runner

# Crear usuario no root y grupo
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copiar artefactos del build
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Cambiar dueño de los archivos a appuser
RUN chown -R appuser:appgroup /app

# Cambiar a usuario no root
USER appuser

ENV PORT=3000
EXPOSE 3000

CMD ["npm", "start"]
