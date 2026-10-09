# syntax=docker/dockerfile:1

# Stage 1: pasang production dependencies saja. Dipisah agar layer ini ter-cache
# selama package.json/package-lock.json tidak berubah (build ulang jadi cepat).
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Stage 2: image akhir. Tidak ada devDependencies, test, atau tooling di dalamnya.
FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app

COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package.json ./
COPY --chown=node:node src ./src
COPY --chown=node:node migrations ./migrations
COPY --chown=node:node scripts ./scripts

# Jalan sebagai user non-root bawaan image (uid 1000).
USER node
EXPOSE 3000

# Liveness: proses masih menjawab. (Compose memakai /ready untuk urutan startup.)
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:3000/health || exit 1

# Panggil node langsung (bukan "npm start") agar SIGTERM dari Docker/Kubernetes
# sampai ke aplikasi dan graceful shutdown berjalan.
CMD ["node", "src/server.js"]
