# 07 — PORTABLE MIGRATION PLAN (Railway → Hetzner / VPS / Kubernetes)

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                   Reverse Proxy (Caddy / Nginx)          │
│  admin.yourdomain.com → suite-bff:4000                  │
│  api.yourdomain.com  → core-api:3000                    │
│  jwks.yourdomain.com → jwks:3001                        │
└──────────────────────────────────┬──────────────────────┘
                                   │
          ┌────────────────────────┼────────────────┐
          │                        │                │
    ┌─────▼───────┐       ┌───────▼──────┐   ┌────▼─────┐
    │  suite-bff  │       │   core-api   │   │  jwks    │
    │  :4000      │──────▶│   :3000      │   │  :3001   │
    │  NestJS     │       │   NestJS     │   │  Node    │
    └──────┬──────┘       └──────┬───────┘   └──────────┘
           │                     │
    ┌──────▼──────┐       ┌──────▼───────────┐
    │ suite-db    │       │  core-db         │
    │ postgres    │       │  postgres        │
    │ :5432       │       │  :5432           │
    └─────────────┘       └──────────────────┘
```

---

## Docker Compose Skeleton (No Secrets)

```yaml
version: "3.9"

networks:
  bassan-net:
    driver: bridge

services:
  # ── Suite BFF ──────────────────────────────────────────
  suite-bff:
    build:
      context: ./suite-shavi
      dockerfile: Dockerfile
    image: bassan/suite-bff:latest
    networks: [bassan-net]
    ports:
      - "4000:4000"
    environment:
      PORT: "4000"
      DATABASE_URL: ${SUITE_DATABASE_URL}
      CORE_API_BASE_URL: ${CORE_API_BASE_URL}
      CORS_ORIGIN: ${CORS_ORIGIN}
    depends_on:
      suite-db:
        condition: service_healthy
    restart: unless-stopped
    healthcheck:
      test:
        ["CMD", "curl", "-f", "http://localhost:4000/api/platform-admin/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  suite-db:
    image: postgres:15-alpine
    networks: [bassan-net]
    environment:
      POSTGRES_DB: suite_db
      POSTGRES_USER: ${SUITE_DB_USER}
      POSTGRES_PASSWORD: ${SUITE_DB_PASSWORD}
    volumes:
      - suite-db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${SUITE_DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ── Core API ───────────────────────────────────────────
  core-api:
    build:
      context: ./Bassan.os/backend
      dockerfile: Dockerfile
    image: bassan/core-api:latest
    networks: [bassan-net]
    ports:
      - "3000:3000"
    environment:
      PORT: "3000"
      DATABASE_URL: ${CORE_DATABASE_URL}
      CORS_ALLOWED_ORIGINS: ${CORS_ALLOWED_ORIGINS}
      ADMIN_JWKS_URL: ${ADMIN_JWKS_URL}
    depends_on:
      core-db:
        condition: service_healthy
    restart: unless-stopped

  core-db:
    image: postgres:15-alpine
    networks: [bassan-net]
    environment:
      POSTGRES_DB: core_db
      POSTGRES_USER: ${CORE_DB_USER}
      POSTGRES_PASSWORD: ${CORE_DB_PASSWORD}
    volumes:
      - core-db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${CORE_DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ── JWKS Server ────────────────────────────────────────
  jwks:
    build:
      context: ./Bassan.os/backend/tools/jwks-server
      dockerfile: Dockerfile
    image: bassan/jwks:latest
    networks: [bassan-net]
    ports:
      - "3001:3001"
    environment:
      PORT: "3001"
      JWKS_KEYS_B64: ${JWKS_KEYS_B64}
    restart: unless-stopped

volumes:
  suite-db-data:
  core-db-data:
```

---

## Required Environment Variables (Names Only)

### Suite BFF

| Var                 | Description                       |
| ------------------- | --------------------------------- |
| `PORT`              | Listen port (4000)                |
| `DATABASE_URL`      | PostgreSQL connection string      |
| `CORE_API_BASE_URL` | Core API base URL                 |
| `CORS_ORIGIN`       | Allowed origins (comma-separated) |

### Core API

| Var                    | Description                       |
| ---------------------- | --------------------------------- |
| `PORT`                 | Listen port (3000)                |
| `DATABASE_URL`         | PostgreSQL connection string      |
| `CORS_ALLOWED_ORIGINS` | Allowed origins (comma-separated) |
| `ADMIN_JWKS_URL`       | Full URL to JWKS endpoint         |
| `JWT_SECRET` / keys    | (from Passport config)            |

### JWKS Server

| Var             | Description                                 |
| --------------- | ------------------------------------------- |
| `PORT`          | Listen port (3001)                          |
| `JWKS_KEYS_B64` | Base64-encoded JWKS JSON (public keys only) |

---

## Reverse Proxy (Caddy)

```caddyfile
admin.yourdomain.com {
  reverse_proxy suite-bff:4000
}

api.yourdomain.com {
  reverse_proxy core-api:3000
}

jwks.yourdomain.com {
  reverse_proxy jwks:3001
}
```

---

## Database Migration Approach

1. **Railway export**: `pg_dump` from Railway Postgres → `.sql` file.
2. **Hetzner import**: Create Postgres container, `psql < dump.sql`.
3. **Prisma**: Run `npx prisma migrate deploy` on startup (already wired in Dockerfiles).

---

## Observability Checklist

- [ ] Health endpoints: `/api/platform-admin/health` (Suite), `/api/v1/health` (Core, if exists)
- [ ] Structured JSON logs (NestJS default Logger)
- [ ] Metrics: expose `/metrics` via `@nestjs/terminus` or Prometheus scraper
- [ ] Alerting: configure uptime checks on health paths
- [ ] Log shipping: Docker STDOUT → Loki/CloudWatch/Datadog
