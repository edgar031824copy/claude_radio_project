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

```bash
cp .env.example .env   # fill in DB credentials
brew services start postgresql@16
npm install
npm start              # http://localhost:3001
```

## API

| Method | Endpoint                 | Description                    |
| ------ | ------------------------ | ------------------------------ |
| GET    | `/api/ratings?song=<id>` | Get up/down counts + user vote |
| POST   | `/api/ratings`           | Submit or toggle a vote        |
