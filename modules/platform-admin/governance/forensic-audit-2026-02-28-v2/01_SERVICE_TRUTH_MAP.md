# 01 — SERVICE TRUTH MAP (From Code)

---

## Service 1: Suite BFF — `web` (suite-shavi-staging/production)

| Field                     | Value                                                                                              | Source                                                                                               |
| ------------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------- |
| **Repo**                  | shavi-oss/suite-shavi                                                                              | Railway                                                                                              |
| **Root**                  | `/` (monorepo root)                                                                                | —                                                                                                    |
| **Module path**           | `modules/platform-admin/`                                                                          | tsconfig.bff.json                                                                                    |
| **Host entrypoint (src)** | `modules/platform-admin/host/main.ts`                                                              | tsconfig.bff.json `include: host/**/*`                                                               |
| **Build command**         | `npx tsc -p modules/platform-admin/tsconfig.bff.json`                                              | Dockerfile L30                                                                                       |
| **Client build**          | `npx vite build --config modules/platform-admin/client/vite.config.ts`                             | Dockerfile L37 (PR-2)                                                                                |
| **Runtime entrypoint**    | `dist/modules/platform-admin/host/main.js`                                                         | Dockerfile CMD, tsconfig.bff.json outDir                                                             |
| **Start command**         | `npx prisma migrate deploy ... && node dist/modules/platform-admin/host/main.js`                   | Dockerfile CMD L41+                                                                                  |
| **Port**                  | `process.env.PORT \|\| 4000` — `app.listen(port, '0.0.0.0')` (post PR-2)                           | main.ts L49-L53                                                                                      |
| **EXPOSE**                | 4000                                                                                               | Dockerfile L36                                                                                       |
| **Global prefix**         | None — routes declared with full path in controllers                                               | e.g., `@Controller('api/platform-admin/organizations')`                                              |
| **Health path**           | `/api/platform-admin/health`                                                                       | HealthController                                                                                     |
| **API paths**             | `GET                                                                                               | POST /api/platform-admin/organizations`, `PATCH .../suspend\|unsuspend\|unsuspend`, `DELETE .../:id` | OrganizationController |
| **Auth paths**            | `/api/platform-admin/auth/login`, `/api/platform-admin/auth/logout`, `/api/platform-admin/auth/me` | AuthController                                                                                       |
| **Public domain**         | `https://web-production-6f02f6.up.railway.app`                                                     | Live probe                                                                                           |
| **Railway service**       | web (suite-shavi-staging, production)                                                              | `railway status`                                                                                     |
| **Builder**               | DOCKERFILE (post PR-2 — pre-PR-2 was NIXPACKS)                                                     | railway.json                                                                                         |
| **Required env vars**     | `PORT`, `DATABASE_URL`, `CORE_API_BASE_URL`, `CORS_ORIGIN`                                         | Confirmed via `railway variables`                                                                    |

### SPA Serving Model

- **Model: Single-domain host-serves-SPA** (one-domain)
- `express.static(dist/platform-admin/client)` for static assets
- `sendFile(index.html)` fallback for non-API routes
- `/api*` prefix guard: `if (!req.path.startsWith('/api'))` before all static serving
- Client build present in Docker image after PR-2 Vite build step

---

## Service 2: Core API Admin Mount — `core-admin-mount`

| Field                  | Value                                                                                    | Source                                                  |
| ---------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| **Repo**               | shavi-oss/Bassan.os                                                                      | —                                                       |
| **Root**               | `/backend`                                                                               | Railway service config                                  |
| **Build command**      | `npm ci` → `npx prisma generate` → `npm run build` (nest build)                          | Dockerfile                                              |
| **Runtime entrypoint** | `dist/src/main`                                                                          | Dockerfile CMD: `node dist/src/main`                    |
| **Start command**      | `node dist/src/main`                                                                     | Dockerfile CMD L20                                      |
| **Port**               | `parseInt(process.env.PORT \|\| '3000', 10)` — `app.listen(port, '0.0.0.0')` ✅          | main.ts L32-33                                          |
| **EXPOSE**             | 3000                                                                                     | Dockerfile L18                                          |
| **Global prefix**      | `api/v1` (excluding `/api/v2/admin/:path*`)                                              | main.ts L28-30                                          |
| **Admin base path**    | `/api/v2/admin/organizations`                                                            | admin.controller.ts L33, no global prefix bypass needed |
| **Admin routes**       | `POST /` (create), `PATCH /:id/suspend`, `PATCH /:id/unsuspend`, `PATCH /:id/deactivate` | admin.controller.ts L44-126                             |
| **Guard**              | `AdminJwtAuthGuard` via JWKS URL                                                         | admin.controller.ts L34                                 |
| **Middleware**         | `TenantMiddleware` on ALL paths (`path: "*"`)                                            | app.module.ts L47-49                                    |
| **Health path**        | ⚠️ Not defined in code — no `/health` in AppModule                                       | Code inspection                                         |
| **Domain**             | `https://core-admin-mount-production.up.railway.app`                                     | Live probe (401 confirmed)                              |
| **Required env vars**  | `PORT`, `DATABASE_URL`, `CORS_ALLOWED_ORIGINS`, `ADMIN_JWKS_URL`, Auth secrets           | Inferred from code                                      |

### Core Workflow

- **Separate Railway service** (core-admin-mount vs core-workflow per user context)
- Both use the same codebase (`backend/`) — differentiated by Railway service config and env vars
- `WorkflowsModule`, `WorkflowInstancesModule`, `WorkflowTriggersModule` all loaded

---

## Service 3: JWKS Server

| Field                  | Value                                                                             | Source                          |
| ---------------------- | --------------------------------------------------------------------------------- | ------------------------------- |
| **Repo**               | shavi-oss/Bassan.os                                                               | —                               |
| **Root**               | `/backend/tools/jwks-server`                                                      | Dockerfile path                 |
| **Build**              | None — JavaScript (no compile step)                                               | Dockerfile (no build step)      |
| **Runtime entrypoint** | `index.js`                                                                        | Dockerfile CMD: `node index.js` |
| **Start command**      | `node index.js`                                                                   | Dockerfile CMD L11              |
| **Port**               | `process.env.PORT \|\| 3001` — `server.listen(PORT, '0.0.0.0')` ✅                | index.js L23, L116              |
| **EXPOSE**             | 3001                                                                              | Dockerfile L10                  |
| **Routes**             | `GET /.well-known/jwks.json` → 200 JSON, `GET /health` → 200 JSON, else 404       | index.js L101-113               |
| **Env vars**           | `ADMIN_JWKS_B64` (required, process.exit(1) if missing), `PORT`                   | index.js L43-49                 |
| **Dependencies**       | None (Node built-ins only: `require('http')`) — no npm install needed             | index.js L21                    |
| **Private key safety** | Hard-fails and exits if private key fields (d, p, q, dp, dq, qi, k) found in JWKS | index.js L84-93                 |
| **Domain**             | ⚠️ Unknown — multiple probe attempts returned 404                                 | Live probe                      |
