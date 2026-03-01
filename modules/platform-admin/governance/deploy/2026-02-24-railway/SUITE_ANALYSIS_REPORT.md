# SUITE ANALYSIS REPORT

## platform-admin BFF + Client — Pre-Deploy Architecture Analysis

**Generated:** 2026-02-24T19:29 UTC+2  
**Executor:** Antigravity (full authority — no approval gate)  
**Scope:** suite-shavi/modules/platform-admin (BFF + Client)

---

## 1. Architecture Map

### 1.1 BFF Server (NestJS)

```
Entry:        modules/platform-admin/host/main.ts
AppModule:    modules/platform-admin/host/app.module.ts
Module:       modules/platform-admin/platform-admin.module.ts
Port:         process.env.PORT || 4000
CORS:         process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000']  ✅ T-1 APPLIED
```

**Guard Topology (Fail-Closed):**

```
APP_GUARD → DenyAllGuard (returns false always — deny all by default)
    └── per-endpoint override via @UseGuards(ExplicitAllowGuard)
        ExplicitAllowGuard: returns true (explicit opt-in only)
```

**Controllers:**

| Controller               | Route                            | Guard                              | Status         |
| ------------------------ | -------------------------------- | ---------------------------------- | -------------- |
| `HealthController`       | `GET /platform-admin/health`     | ExplicitAllowGuard                 | ✅ Public      |
| `AuthController`         | `/platform-admin/auth/*`         | ExplicitAllowGuard on all 3 routes | ✅ Public stub |
| `InternalUserController` | `/platform-admin/internal-users` | DenyAllGuard                       | 🔒 Blocked     |
| `OrganizationController` | `/platform-admin/organizations`  | DenyAllGuard                       | 🔒 Blocked     |
| `OrgMappingController`   | `/platform-admin/org-mapping`    | DenyAllGuard                       | 🔒 Blocked     |
| `AuditController`        | `/platform-admin/audit`          | DenyAllGuard                       | 🔒 Blocked     |

> NOTE: No global prefix set in main.ts. Routes are accessed at `/platform-admin/...` (not `/api/platform-admin/...`).

### 1.2 Client (Vite/React)

```
Root:       modules/platform-admin/client/
Entry:      src/main.tsx
Build:      vite build → dist/platform-admin/client (repo root dist/)
Local dev:  port 3000, proxy /api/platform-admin → http://localhost:4000
Build env:  VITE_API_URL (baked at build time — must be set before build)
```

### 1.3 Communication Flow

```
[Browser / React Client]
    ↓  /api/platform-admin/* (cookie-session)
[BFF — NestJS platform-admin]
    ↓  GET /api/v1/organizations/:id (Bearer JWT + X-Correlation-Id)
[BassanOs Core API — EXTERNAL]
```

---

## 2. T-1 / T-2 Verification

| Task | File                     | Change                                     | Status       |
| ---- | ------------------------ | ------------------------------------------ | ------------ |
| T-1  | `host/main.ts`           | CORS_ORIGIN env var (comma-split fallback) | ✅ COMMITTED |
| T-2  | `Dockerfile` (repo root) | node:20-alpine, npm ci, prisma, tsc build  | ✅ COMMITTED |

Commit: `1b41950 fix(platform-admin): use CORS_ORIGIN env var; add portable Dockerfile (T-1/T-2)`

---

## 3. Environment Variables

### BFF (Railway web service)

| Variable            | Required?   | Description                                      |
| ------------------- | ----------- | ------------------------------------------------ |
| `DATABASE_URL`      | ✅ REQUIRED | PostgreSQL connection string (Railway Postgres)  |
| `CORE_API_BASE_URL` | ✅ REQUIRED | BassanOs Core API — throws at startup if missing |
| `ADMIN_JWKS_URL`    | ✅ REQUIRED | JWKS endpoint for RS256 JWT verification         |
| `CORS_ORIGIN`       | ✅ REQUIRED | Client origin(s), comma-separated                |
| `NODE_ENV`          | Recommended | `production` — enables secure cookies            |
| `PORT`              | Auto        | Set by Railway                                   |

### Client (build-time)

| Variable       | Required    | Description                                      |
| -------------- | ----------- | ------------------------------------------------ |
| `VITE_API_URL` | ✅ REQUIRED | BFF base URL; baked into JS bundle at build time |

---

## 4. Database

- **Active schema:** `modules/platform-admin/prisma/schema.prisma`
- **Root schema** (`prisma/schema.prisma`): legacy/scaffolding — NOT used in deploy
- **Provider:** PostgreSQL
- **Migrate deploy:** Runs in Dockerfile CMD before server start (idempotent)

### Tables (4)

| Table                       | Purpose                      |
| --------------------------- | ---------------------------- |
| `suite_organizations`       | Suite org records            |
| `suite_org_mappings`        | Suite → Core org ID mapping  |
| `internal_users`            | Platform admin user accounts |
| `platform_admin_audit_logs` | Immutable action audit log   |

---

## 5. Security Scan Results

| Scan                                      | Result                   |
| ----------------------------------------- | ------------------------ |
| `git grep "api/v1" client/src`            | EXIT:1 ✅                |
| `git grep "localStorage" client/src`      | EXIT:1 ✅                |
| `git grep "BEGIN PRIVATE KEY"`            | EXIT:1 ✅                |
| `git ls-files \| grep -E "\.(pem\|key)$"` | Empty ✅                 |
| `.env` in git                             | Blocked by .gitignore ✅ |

---

## 6. Risk Register

| Risk                                   | Severity  | Mitigation                                                |
| -------------------------------------- | --------- | --------------------------------------------------------- |
| Auth is a stub (any credentials pass)  | 🟡 MEDIUM | Document; future gate                                     |
| Session is in-memory (lost on restart) | 🟡 MEDIUM | Document; no horizontal scaling until replaced            |
| VITE_API_URL baked at build time       | 🟡 MEDIUM | Must be set before build; rebuild required if URL changes |
| CORE_API_BASE_URL missing → crash      | 🟡 MEDIUM | Operator must set before deploy                           |
| No global prefix in NestJS             | ✅ OK     | Routes documented correctly as `/platform-admin/...`      |
| Cookie SameSite: strict                | ✅ OK     | Correctly set in code                                     |
| Cookie Secure flag                     | ✅ OK     | Tied to NODE_ENV=production                               |
| httpOnly cookie                        | ✅ OK     | Set correctly                                             |
| No JWT in logs                         | ✅ OK     | CoreClient uses redaction helper                          |
