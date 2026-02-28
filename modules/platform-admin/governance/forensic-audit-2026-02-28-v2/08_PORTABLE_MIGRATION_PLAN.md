# 08 — PORTABLE MIGRATION PLAN (Railway → Hetzner/VPS/K8s)

**Goal**: Replace Railway with a self-hosted equivalent using Docker.
**Constraint**: Zero secrets in code or docker-compose.yml. Env vars only.

---

## Architecture Diagram

```
Internet
   │
   ▼
[Caddy / Nginx Reverse Proxy]
   ├── admin.yourdomain.com  → suite-bff:4000
   ├── api.yourdomain.com    → core-api:3000
   └── jwks.yourdomain.com   → jwks:3001

[suite-bff]                    [core-api]                [jwks]
   ↓ CORE_API_BASE_URL           ↓ ADMIN_JWKS_URL           +
[suite-db: postgres]          [core-db: postgres]        (no DB)
```

---

## Docker Compose Skeleton (No Secrets)

```yaml
version: "3.9"

networks:
  bassan-internal:
    driver: bridge

services:
  # ── Suite BFF ─────────────────────────────────────────
  suite-bff:
    build:
      context: ./suite-shavi
      dockerfile: Dockerfile
    image: bassan/suite-bff:latest
    networks: [bassan-internal]
    ports: ["4000:4000"]
    environment:
      PORT: "4000"
      DATABASE_URL: ${SUITE_DATABASE_URL}
      CORE_API_BASE_URL: ${CORE_API_BASE_URL}
      CORS_ORIGIN: ${SUITE_CORS_ORIGIN}
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
    networks: [bassan-internal]
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

  # ── Core API ──────────────────────────────────────────
  core-api:
    build:
      context: ./Bassan.os/backend
      dockerfile: Dockerfile
    image: bassan/core-api:latest
    networks: [bassan-internal]
    ports: ["3000:3000"]
    environment:
      PORT: "3000"
      DATABASE_URL: ${CORE_DATABASE_URL}
      CORS_ALLOWED_ORIGINS: ${CORE_CORS_ORIGINS}
      ADMIN_JWKS_URL: ${ADMIN_JWKS_URL}
      JWT_SECRET: ${CORE_JWT_SECRET}
    depends_on:
      core-db:
        condition: service_healthy
    restart: unless-stopped

  core-db:
    image: postgres:15-alpine
    networks: [bassan-internal]
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

  # ── JWKS Server ───────────────────────────────────────
  jwks:
    build:
      context: ./Bassan.os/backend/tools/jwks-server
      dockerfile: Dockerfile
    image: bassan/jwks:latest
    networks: [bassan-internal]
    ports: ["3001:3001"]
    environment:
      PORT: "3001"
      ADMIN_JWKS_B64: ${ADMIN_JWKS_B64}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 5s
      retries: 3

volumes:
  suite-db-data:
  core-db-data:
```

---

## Required Environment Variables (Names Only)

### Suite BFF

| Var                 | Description                           |
| ------------------- | ------------------------------------- |
| `PORT`              | Server port (4000)                    |
| `DATABASE_URL`      | Suite Postgres URL                    |
| `CORE_API_BASE_URL` | Core API base URL (no trailing slash) |
| `CORS_ORIGIN`       | Allowed origins (comma-separated)     |

### Core API

| Var                    | Description                       |
| ---------------------- | --------------------------------- |
| `PORT`                 | Server port (3000)                |
| `DATABASE_URL`         | Core Postgres URL                 |
| `CORS_ALLOWED_ORIGINS` | Allowed origins (comma-separated) |
| `ADMIN_JWKS_URL`       | Full URL to JWKS endpoint         |
| `JWT_SECRET`           | JWT signing secret                |

### JWKS Server

| Var              | Description                                 |
| ---------------- | ------------------------------------------- |
| `PORT`           | Server port (3001)                          |
| `ADMIN_JWKS_B64` | Base64-encoded JWKS JSON (public keys only) |

---

## Reverse Proxy (Caddy)

```caddyfile
# Caddyfile — auto-HTTPS via Let's Encrypt
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

1. **Export from Railway**: `pg_dump -Fc <railway-postgres-url> > suite_backup.dump`
2. **Import**: `pg_restore -d <hetzner-postgres-url> suite_backup.dump`
3. **Run Prisma migrations**: Suite BFF Docker CMD already runs `npx prisma migrate deploy` on start.
4. **Core migrations**: Must add `prisma migrate deploy` to Core CMD or run as pre-start step.

---

## Observability Checklist

- [ ] **Health endpoints**: Suite `/api/platform-admin/health`, JWKS `/health`, Core `/health` (to be added)
- [ ] **Log shipping**: Docker STDOUT → Loki / Datadog / CloudWatch (via log driver)
- [ ] **Metrics**: Consider `@nestjs/terminus` or expose `/metrics` (Prometheus scrape)
- [ ] **Uptime monitoring**: Configure external probe on all health paths
- [ ] **Alert on restart-loop**: JWKS exits with error if `ADMIN_JWKS_B64` malformed

---

## Cutover Plan

1. Stand up Hetzner VMs + Postgres instances.
2. Deploy all Docker images to new infrastructure.
3. Run database migrations.
4. Smoke test all services (health + auth guard probes).
5. Update DNS: point domains to Hetzner.
6. Monitor for 1 hour.
7. Decommission Railway services.

**Rollback**: Keep Railway services running until DNS TTL expires. Revert DNS if issues arise.
