# SUITE DEPLOY PLAN

## platform-admin BFF + Client → Railway Staging

**Created:** 2026-02-24T16:26 UTC+2  
**Status:** ⏳ AWAITING HUMAN APPROVAL  
**Scope:** suite-shavi repo ONLY

---

> [!IMPORTANT]
> This plan must be approved before any execution begins. No code changes are made by the planning step.

---

## 1. Scope Lock

### Allowed Touches (this plan)

- `modules/platform-admin/host/main.ts` — CORS origin via env var
- `Dockerfile` (new, root of suite-shavi) — portable BFF container
- `modules/platform-admin/client/` — production build artifact only (no code changes)
- `modules/platform-admin/governance/deploy/` — governance docs
- `.env.example` (update only if needed)

### Forbidden

- Any changes in BassanOs or jwks-server
- Any dependency additions (no new packages)
- Any secret/token in git
- Any changes to NestJS controllers, services, guards, or Prisma schema

---

## 2. Task List

### Phase 1 — Pre-Deploy Fixes (minimal code changes)

| Task | File                                         | Change                                                                         | Reason                                    |
| ---- | -------------------------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------- |
| T-1  | `host/main.ts`                               | CORS origin from `process.env.CORS_ORIGIN` (fallback: `http://localhost:3000`) | Hardcoded localhost breaks production     |
| T-2  | `Dockerfile` (new)                           | Standard node:20-alpine, `npm ci`, `prisma generate`, BFF build, serve         | Portability requirement                   |
| T-3  | `modules/platform-admin/client/package.json` | Add `build:prod` script (already has `build`) — verify VITE_API_URL path       | Client must bake in BFF URL at build time |

### Phase 2 — Railway Setup (human actions required)

| Task | Who   | Action                                                |
| ---- | ----- | ----------------------------------------------------- |
| T-4  | Human | Create Railway project: `suite-shavi-staging`         |
| T-5  | Human | Add Railway Postgres plugin → note connection string  |
| T-6  | Human | Set env vars (see SUITE_RAILWAY_RUNBOOK.md for names) |
| T-7  | Human | Trigger deploy via `railway up` or GitHub integration |

### Phase 3 — Migration + Smoke Tests

| Task | Executor                 | Command                                                          |
| ---- | ------------------------ | ---------------------------------------------------------------- |
| T-8  | CI/Dockerfile ENTRYPOINT | `prisma migrate deploy` (then start server)                      |
| T-9  | Sonit                    | `curl /api/platform-admin/health` → expect 200                   |
| T-10 | Sonit                    | `curl /api/platform-admin/auth/session` (no cookie) → expect 401 |
| T-11 | Sonit                    | `curl /api/platform-admin/orgs` (no session) → expect 403/401    |

---

## 3. Stop Conditions (Auto-Stop)

1. Any secret appears in tracked files or terminal output
2. Protected endpoint returns 2xx without valid session (fail-open detected)
3. Direct client → Core API call found during verification
4. Dependency drift required without justification
5. Any changes outside allowed scope above

---

## 4. Verification Commands

```bash
# Pre-deploy local checks
git status --porcelain                                        # must be empty
git grep "api/v1" modules/platform-admin/client/src          # must be empty
git grep "localStorage" modules/platform-admin/client/src    # must be empty
git grep "BEGIN PRIVATE KEY"                                  # docs/scripts only
git ls-files | grep -E "\.(pem|key)$"                        # must be empty

# BFF TypeScript check (BFF only, not client)
npx tsc -p modules/platform-admin/tsconfig.bff.json --noEmit

# Client build
cd modules/platform-admin/client && npm ci && npm run build

# Railway smoke tests
curl -s -o /dev/null -w "%{http_code}" https://<host>/api/platform-admin/health           # 200
curl -s -o /dev/null -w "%{http_code}" https://<host>/api/platform-admin/auth/session     # 401
curl -s -o /dev/null -w "%{http_code}" https://<host>/api/platform-admin/organizations    # 401/403
```

---

## 5. Rollback Plan

| Event                      | Rollback                                                                                            |
| -------------------------- | --------------------------------------------------------------------------------------------------- |
| Dockerfile build fails     | Revert `Dockerfile`, no server running                                                              |
| CORS fix causes regression | Revert `main.ts`, redeploy                                                                          |
| Prisma migration fails     | Railway Postgres reset or rollback to prior migration; DO NOT use `prisma migrate reset` in staging |
| Smoke test fail-open       | IMMEDIATE — revert deploy, investigate guard wiring                                                 |

---

## 6. Environment Variables Required on Railway

| Variable            | Where Used                                                                   | Required?                    |
| ------------------- | ---------------------------------------------------------------------------- | ---------------------------- |
| `DATABASE_URL`      | Prisma, BFF                                                                  | ✅ REQUIRED                  |
| `CORE_API_BASE_URL` | CoreClient (throws if absent)                                                | ✅ REQUIRED                  |
| `ADMIN_JWKS_URL`    | JWT verification (if session guard uses JWKS)                                | ✅ REQUIRED                  |
| `CORS_ORIGIN`       | main.ts CORS (after T-1)                                                     | ✅ REQUIRED                  |
| `NODE_ENV`          | Cookie `secure` flag, logging                                                | Recommended → `production`   |
| `PORT`              | NestJS listen port                                                           | Set by Railway automatically |
| `VITE_API_URL`      | Client build-time env (set during image build or via separate client deploy) | Required at BUILD time only  |

---

## 7. Architecture Risks Identified (must resolve before production)

| Risk                                           | Severity  | In Scope?                                      |
| ---------------------------------------------- | --------- | ---------------------------------------------- |
| CORS hardcoded to localhost:3000               | 🔴 HIGH   | ✅ T-1 addresses it                            |
| Session is in-memory (lost on restart/scale)   | 🟡 MEDIUM | ❌ Out of scope — document as known limitation |
| Auth stub (any credentials accepted)           | 🟡 MEDIUM | ❌ Out of scope — document                     |
| VITE_API_URL must be set at build time         | 🟡 MEDIUM | ✅ Document in runbook                         |
| CORE_API_BASE_URL throws at startup if missing | 🟡 MEDIUM | ✅ Operator must set                           |
| Two prisma schemas (root vs platform-admin)    | 🟡 MEDIUM | ✅ Use platform-admin schema                   |

---

## 8. Final Verdict Format (after execution)

- ✅ SAFE TO DEPLOY
- ⚠️ SAFE WITH CONDITIONS
- ❌ NOT SAFE
