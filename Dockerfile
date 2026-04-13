# ── Base: shared setup ──────────────────────────────────────────────────────
FROM node:20-alpine AS base
ARG APK_UPGRADE=true
RUN if [ "$APK_UPGRADE" = "true" ]; then apk upgrade --no-cache; else echo "Skipping apk upgrade"; fi
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
