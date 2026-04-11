# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Start the Express server (port 3001)
npm test           # Run Jest test suite (12 tests)
```

### Make targets

```bash
make dev           # Build and start dev stack (docker compose)
make prod          # Build and start prod stack (docker compose + nginx)
make test          # Run Jest tests
make down          # Stop both dev and prod stacks
make logs          # Tail dev stack logs
make security      # Run npm audit for vulnerability scanning
```

## Environment

Copy `.env` and set your values before starting. Required variables:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=radiocalico
DB_USER=<your macOS username>
DB_PASSWORD=<your password>
```

PostgreSQL 16 is managed via Homebrew:

```bash
brew services start postgresql@16   # Start DB
brew services stop postgresql@16    # Stop DB
createdb radiocalico                # One-time DB creation (already done)
```

The `psql` binary is at `/opt/homebrew/opt/postgresql@16/bin/psql`.

## Architecture

### Backend (`src/`)

- **`src/server.js`** — Express app entry point. Serves static files from `public/` and connects to PostgreSQL via a `pg.Pool`. Environment variables are loaded with `dotenv`.
- **`src/app.js`** — Express app configuration.
- **`src/config/db.js`** — PostgreSQL pool setup.
- **`src/routes/ratings.js`** — Ratings API routes.
- **`src/controllers/ratingsController.js`** — Ratings request handlers.
- **`src/models/ratingModel.js`** — DB queries for ratings (get, insert, delete).

### Frontend (`public/`)

- **`public/index.html`** — Markup only, no inline styles or scripts.
- **`public/style.css`** — All styles.
- **`public/app.js`** — All client-side logic: HLS playback, metadata polling, ratings UI.

### Key URLs

- Stream: `https://d3d4yli4hf5bmh.cloudfront.net/hls/live.m3u8`
- Metadata: `https://d3d4yli4hf5bmh.cloudfront.net/metadatav2.json`
- Cover art: `https://d3d4yli4hf5bmh.cloudfront.net/cover.jpg`

### CI (`.github/workflows/ci.yml`)

Runs on every push to `master` and every PR:

- **`Unit Tests`** job — `npm ci` + `npm test` on Node 20
- **`Security Scan`** job — `npm audit --audit-level=moderate`

The existing `.github/workflows/claude.yml` is separate — it powers the `@claude` bot in PR/issue comments.

### MCP / Permissions (`.claude/settings.local.json`)

- `Bash(*)` — all bash commands allowed.
- `WebFetch(domain:d3d4yli4hf5bmh.cloudfront.net)` — CloudFront CDN fetch allowed (stream, metadata, cover art).

### Docker

- **`Dockerfile`** — Multi-stage build: `dev` (all deps, `--watch`) and `prod` (no devDeps, no watch).
- **`docker-compose.yml`** — Dev stack: app + postgres (both ports exposed to host).
- **`docker-compose.prod.yml`** — Prod stack: app + postgres + nginx (only nginx on `:8080` exposed).
- **`nginx/nginx.conf`** — Serves `public/` as static files; proxies `/api/*` to `app:3001`.
- **`db/init.sql`** — Creates ratings table on first postgres container start.

> Note: Port 80 is occupied by Laravel Herd on this machine, so prod nginx maps to `8080:80`.

### Tests

- **`__tests__/backend.test.js`** — Supertest integration tests for Express routes.
- **`__tests__/frontend.test.js`** — jsdom unit tests for client-side logic (`public/app.js`).

### Other

- **Port** — Server runs on `3001` (port 3000 is occupied by another local app).
- **`Makefile`** — Convenience targets for dev, prod, test, security scanning.
