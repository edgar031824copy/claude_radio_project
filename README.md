# Radio Calico

Live HLS radio player with track ratings. Express backend, PostgreSQL, vanilla JS frontend.

## Stack

- **Backend** — Node.js, Express, PostgreSQL (`pg`)
- **Frontend** — HTML, CSS, vanilla JS, hls.js
- **Stream** — HLS via CloudFront CDN

## Structure

```
public/
  index.html      # Markup
  style.css       # Styles
  app.js          # Client logic (HLS playback, metadata polling, ratings)
src/
  server.js       # Entry point, starts Express on port 3001
  app.js          # Express config, routes, static files
  config/db.js    # PostgreSQL pool
  routes/         # API route definitions
  controllers/    # Request handlers
  models/         # DB queries
```

## Setup

### Local

```bash
cp .env.example .env   # fill in DB credentials
brew services start postgresql@16
npm install
npm start              # http://localhost:3001
```

### Docker (recommended)

```bash
cp .env.example .env   # fill in DB_USER and DB_PASSWORD

make dev     # dev stack — hot reload, ports exposed, postgres sidecar
make prod    # prod stack — nginx on :8080, Express internal only
make down    # stop all containers
make logs    # tail dev logs
```

The postgres container auto-creates the `ratings` table on first start via `db/init.sql`.

In prod, nginx serves static files from `public/` and proxies `/api/*` to Express. Express is not reachable directly from outside the Docker network.

## Testing

```bash
make test      # run Jest (12 tests: BE routes + FE DOM)
make security  # run npm audit (fails on moderate+ CVEs)
```

## CI

GitHub Actions runs on every push to `master` and every pull request:

| Job | What it does |
|---|---|
| `Unit Tests` | Installs deps, runs Jest |
| `Security Scan` | Runs `npm audit --audit-level=moderate` |

Workflow file: `.github/workflows/ci.yml`

## API

| Method | Endpoint                 | Description                    |
| ------ | ------------------------ | ------------------------------ |
| GET    | `/api/ratings?song=<id>` | Get up/down counts + user vote |
| POST   | `/api/ratings`           | Submit or toggle a vote        |
