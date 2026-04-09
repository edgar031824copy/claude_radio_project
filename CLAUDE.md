# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Start the Express server (port 3001)
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

### MCP / Permissions (`.claude/settings.local.json`)

- `Bash(*)` — all bash commands allowed.
- `WebFetch(domain:d3d4yli4hf5bmh.cloudfront.net)` — CloudFront CDN fetch allowed (stream, metadata, cover art).

### Other

- **Port** — Server runs on `3001` (port 3000 is occupied by another local app).
