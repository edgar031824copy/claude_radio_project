# ── Base: shared setup ──────────────────────────────────────────────────────
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# ── Dev: all deps + hot reload via --watch ───────────────────────────────────
FROM base AS dev
RUN npm install
COPY . .
EXPOSE 3001
CMD ["node", "--watch", "src/server.js"]

# ── Prod: production deps only, minimal image ────────────────────────────────
FROM base AS prod
RUN npm ci --omit=dev
COPY . .
EXPOSE 3001
CMD ["node", "src/server.js"]
