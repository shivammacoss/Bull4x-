# Bull4x

Forex / CFD B-Book trading platform — trader app (Next.js), admin dashboard (Next.js), and a Python (FastAPI) backend running in Docker.

## Quick start (Docker)

```bash
cp .env.example .env       # fill in passwords, JWT secrets, INFOWAY_API_KEY
APP_VERSION=$(date +%Y%m%d-%H%M%S) docker compose build --no-cache
docker compose up -d
docker compose --profile migrate up migrate   # seeds super admin
```

Services come up at:

| Service          | URL                              |
| ---------------- | -------------------------------- |
| Trader frontend  | http://localhost:3010            |
| Admin frontend   | http://localhost:3011            |
| Gateway API      | http://localhost:8000            |
| Admin API        | http://localhost:8001            |
| Kafka UI (dev)   | http://localhost:8080            |

Default admin login after migrations: `admin@bull4x.com` / `Bull4xAdmin2025!` — rotate immediately.

## Production

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

Production hosts `bull4x.com` (trader) and `admin.bull4x.com` (admin); API is reverse-proxied at `api.bull4x.com` with WebSocket on `wss://api.bull4x.com`.

## Layout

- `backend/` — FastAPI services: `gateway`, `admin`, `market-data`, `b-book-engine`, `risk-engine`, plus shared `packages/common`
- `frontend/trader/` — Next.js 15 trader app (port 3000)
- `frontend/admin/` — Next.js 15 admin dashboard (port 3001)
- `docs/` — Platform specs and integration guides

## Tech

Backend: FastAPI, SQLAlchemy (asyncpg), Alembic, Kafka, Redis, TimescaleDB, Sentry.
Frontend: Next.js 15, React 18, Tailwind 3, Zustand, lucide-react.
