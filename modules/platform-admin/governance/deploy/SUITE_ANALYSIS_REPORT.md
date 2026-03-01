# SUITE ANALYSIS REPORT

## platform-admin BFF + Client — Full Architecture Analysis

**Generated:** 2026-02-24T16:26 UTC+2  
**Scope:** suite-shavi/modules/platform-admin (BFF + Client)

---

## 1. Architecture Map

### 1.1 BFF Server (NestJS)

```
Entry:        modules/platform-admin/host/main.ts
AppModule:    modules/platform-admin/host/app.module.ts
Module:       modules/platform-admin/platform-admin.module.ts
Port:         process.env.PORT || 4000
CORS:         ['http://localhost:3000'] (HARDCODED — ⚠️ needs env var for prod)
```

**Guard Topology (Fail-Closed):**

```
APP_GUARD → DenyAllGuard (returns false always — deny all by default)
    └── per-endpoint override via @UseGuards(ExplicitAllowGuard)
        ExplicitAllowGuard: returns true (explicit opt-in only)
```

**Controllers + Opt-In Status:**

| Controller               | Route Prefix                         | Guards                             | Status                |
| ------------------------ | ------------------------------------ | ---------------------------------- | --------------------- |
| `HealthController`       | `/api/platform-admin/health`         | ExplicitAllowGuard                 | ✅ Public             |
| `AuthController`         | `/api/platform-admin/auth`           | ExplicitAllowGuard on all 3 routes | ✅ Public (stub auth) |
| `InternalUserController` | `/api/platform-admin/internal-users` | DenyAllGuard (default)             | 🔒 Blocked            |
| `OrganizationController` | `/api/platform-admin/organizations`  | DenyAllGuard (default)             | 🔒 Blocked            |
| `OrgMappingController`   | `/api/platform-admin/org-mapping`    | DenyAllGuard (default)             | 🔒 Blocked            |
| `AuditController`        | `/api/platform-admin/audit`          | DenyAllGuard (default)             | 🔒 Blocked            |

**Auth routes (all ExplicitAllowGuard):**

- `POST /api/platform-admin/auth/login` — accepts any credentials ⚠️ stub
- `POST /api/platform-admin/auth/logout`
- `GET /api/platform-admin/auth/session`

### 1.2 Client (Vite/React)

```
Root:         modules/platform-admin/client/
Entry:        src/main.tsx
Build:        vite build → dist/platform-admin/client (repo root /dist)
Local dev:    port 3000, proxy /api/platform-admin → http://localhost:4000
Build env:    VITE_API_URL (baked at build time — must be set before build)
```

**Boundary enforcement:**

- Client calls BFF only via `/api/platform-admin/*` proxy
- No direct Core API calls (`git grep api/v1 client/src` → EXIT:1 ✅)
- No localStorage use (`git grep localStorage client/src` → EXIT:1 ✅)

### 1.3 Communication Flow

```
[Browser / React Client]
    ↓  /api/platform-admin/* (cookie-session)
[BFF — NestJS platform-admin]
    ↓  GET /api/v1/organizations/:id (Bearer JWT + X-Correlation-Id)
[BassanOs Core API — EXTERNAL]
```

---

## 2. Build / Run Commands

### BFF (NestJS)

```bash
# Install
npm ci                             # root suite-shavi

# Build BFF TypeScript
npx tsc -p tsconfig.json          # compiles to dist/

# Prisma client generate
npx prisma generate --schema=modules/platform-admin/prisma/schema.prisma

# Prisma migration (deploy-time)
npx prisma migrate deploy --schema=modules/platform-admin/prisma/schema.prisma

# Start BFF
node dist/modules/platform-admin/host/main.js
```

### Client (Vite)

```bash
cd modules/platform-admin/client
npm ci
VITE_API_URL=https://<bff-host> npm run build   # → ../../dist/platform-admin/client
```

---

## 3. Environment Variables

### BFF Server (Railway env vars)

| Variable            | Required                      | Description                                                          |
| ------------------- | ----------------------------- | -------------------------------------------------------------------- |
| `DATABASE_URL`      | ✅ REQUIRED                   | PostgreSQL connection string (Railway Postgres)                      |
| `CORE_API_BASE_URL` | ✅ REQUIRED                   | BassanOs Core API base URL. Server **throws** at startup if missing. |
| `ADMIN_JWKS_URL`    | Required for JWT verification | JWKS endpoint for RS256 verification                                 |
| `CORS_ORIGIN`       | ✅ REQUIRED (after fix T-1)   | Allowed client origin e.g. `https://suite.up.railway.app`            |
| `NODE_ENV`          | Recommended                   | Set to `production` — enables `secure` on cookies                    |
| `PORT`              | Set by Railway                | BFF listen port                                                      |

### Client (build-time only)

| Variable       | Required    | Description                                       |
| -------------- | ----------- | ------------------------------------------------- |
| `VITE_API_URL` | ✅ REQUIRED | BFF base URL; embedded in JS bundle at build time |

---

## 4. Database

### Prisma Setup

- **Active schema:** `modules/platform-admin/prisma/schema.prisma`
- **Root schema** (`prisma/schema.prisma`): legacy/scaffolding — 1 table (`Organization`)
- **Provider:** PostgreSQL
- **Prisma client output:** `node_modules/.prisma/client` (generated into repo-standard location)

### Tables (4 locked by MODULE_SCOPE_LOCK.md)

| Table                       | Purpose                      |
| --------------------------- | ---------------------------- |
| `suite_organizations`       | Suite org records            |
| `suite_org_mappings`        | Suite → Core org ID mapping  |
| `internal_users`            | Platform admin user accounts |
| `platform_admin_audit_logs` | Immutable action audit log   |

### Migration Strategy

- **Deploy-time:** `prisma migrate deploy` runs in Dockerfile ENTRYPOINT before server start
- **Safe seed:** No seed required — data created via API after deploy
- **Manual:** Do NOT run `prisma migrate reset` in staging

---

## 5. External Integrations

### BassanOs Core API (via CoreClient)

- Env: `CORE_API_BASE_URL`
- Only one allowed endpoint: `GET /api/v1/organizations/:id`
- Auth: Bearer JWT forwarded from client request
- Correlation: `X-Correlation-Id` required on all calls (throws if absent)
- Timeout: 10 seconds (AbortSignal)

### JWKS Server

- Referenced via `ADMIN_JWKS_URL`
- Suite BFF does NOT host JWKS (correct — JWKS is in separate jwks-server)
- Suite verifies JWTs received from clients against this endpoint

---

## 6. Risk List + Stop Conditions

| Risk                                   | Severity  | Mitigation                                         |
| -------------------------------------- | --------- | -------------------------------------------------- |
| CORS hardcoded to localhost:3000       | 🔴 HIGH   | Fix T-1: use CORS_ORIGIN env var                   |
| Auth is a stub (any credentials pass)  | 🟡 MEDIUM | Document known limitation; future gate             |
| Session is in-memory (lost on restart) | 🟡 MEDIUM | Document; do not scale horizontally until replaced |
| VITE_API_URL baked at build time       | 🟡 MEDIUM | Must be set correctly before image build           |
| Two prisma schemas                     | 🟡 MEDIUM | Only run platform-admin schema in deploy           |
| CORE_API_BASE_URL missing → crash      | 🟡 MEDIUM | Operator must set before deploy                    |
| Cookie SameSite: strict                | ✅ OK     | Correctly set in code                              |
| Cookie Secure flag                     | ✅ OK     | Tied to NODE_ENV=production                        |
| httpOnly cookie                        | ✅ OK     | Set correctly                                      |
| No JWT in logs                         | ✅ OK     | CoreClient uses redaction helper                   |
| No localStorage                        | ✅ OK     | Confirmed by grep                                  |

---

## 7. Portability Assessment

| Aspect                   | Status                              |
| ------------------------ | ----------------------------------- |
| Dockerfile needed?       | ✅ YES — none exists yet (T-2)      |
| Railway-specific config? | None required — standard Dockerfile |
| Node version             | 20 LTS (recommended)                |
| Build reproducible?      | Yes — `npm ci` locks deps           |
| Env-driven config?       | Mostly ✅ — CORS needs fix T-1      |

---

## 8. Local Verification Results

```
git status --porcelain                      → (empty)   ✅ CLEAN
git grep "api/v1" client/src               → EXIT:1     ✅ NO DIRECT CORE CALLS
git grep "localStorage" client/src         → EXIT:1     ✅ NO LOCALSTORAGE
git grep "BEGIN PRIVATE KEY"               → EXIT:1     ✅ NO PRIVATE KEYS
git ls-files | grep .pem/.key              → EXIT:1     ✅ NO PEM/KEY FILES
npx tsc --noEmit (root tsconfig)           → JSX errors ⚠️ EXPECTED (root tsconfig is BFF-only; client uses its own tsconfig.json + Vite)
```

> [!NOTE]
> TSC errors from root `tsconfig.json` are expected: it does not have `jsx` configured because the root is a BFF/NestJS project. The React client has its own `tsconfig.json` with `"jsx": "react-jsx"`. Run client TypeScript checks via `tsc -p modules/platform-admin/client/tsconfig.json --noEmit`.
