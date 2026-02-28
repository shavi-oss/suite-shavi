# 08 — VERDICT

**Audit Date:** 2026-02-28T04:35Z
**Audit Mode:** Docker-Truth · Evidence-Driven · Fail-Closed

---

## Final Decision: STOP — 2 Critical Blockers Must Be Fixed

---

## Service Status Table

| Service         | Status     | Evidence                             | Notes                      |
| --------------- | ---------- | ------------------------------------ | -------------------------- |
| **Suite BFF**   | 🟡 PARTIAL | SPA loads, `/api` routes return HTML | Old `dist/main.js` running |
| **Core API**    | ✅ RUNNING | 401 JSON on all probed endpoints     | Guards active              |
| **JWKS Server** | ⚠️ UNKNOWN | Domain probe 404                     | Must verify domain         |

---

## Critical Blockers (Must Fix Before APPROVE)

### BLOCKER 1 — Suite: API Routes Return HTML (Security Violation)

**Evidence**: Railway logs + curl probes confirm `GET /api/platform-admin/organizations` returns `200 HTML` with `ETag: dgpxmdj4av4099`. This means the `DenyAllGuard` is NOT intercepting unauthenticated GET requests — they are served by the SPA middleware before NestJS routing fires.

**Root Cause**: The Dockerfile does NOT include a Vite build step. Fresh Docker builds have no `dist/platform-admin/client/index.html`. The live deployment is running an old cached Nixpacks build (not Docker). The express.static middleware path (`dist/platform-admin/client`) won't exist → fallback serves `index.html` anyway → all GETs return HTML.

**Fix**: Add `RUN npx vite build --config modules/platform-admin/client/vite.config.ts` to `Dockerfile`. Fix `railway.json` to use `builder: DOCKERFILE`.

**Stop Condition if unfixed**: Users can bypass the DenyAllGuard on GET routes, potentially leaking information or bypassing authorization on GET endpoints.

### BLOCKER 2 — JWKS Server Domain Unresolved

**Evidence**: All probed JWKS domains returned 404. The `ADMIN_JWKS_URL` env var in Core is required for the `admin-jwt` Passport strategy. If JWKS is unreachable, all Suite→Core admin calls fail (Suite cannot create/suspend/deactivate organizations).

**Fix**: Verify JWKS domain in Railway Dashboard, confirm `ADMIN_JWKS_URL` is set correctly in Core service env vars.

---

## Non-Critical Issues (Must Fix Before Production Hardening)

| Issue                                                        | Fix                                  | Priority |
| ------------------------------------------------------------ | ------------------------------------ | -------- |
| `railway.json` `builder: NIXPACKS` conflicts with Dockerfile | Change to `builder: DOCKERFILE`      | HIGH     |
| `main.ts` missing `0.0.0.0` bind                             | Add `'0.0.0.0'` to `app.listen()`    | HIGH     |
| JWKS Dockerfile missing `npm install`                        | Add `RUN npm install --production`   | MEDIUM   |
| `healthcheckPath` returns HTML not JSON                      | Resolved if blockers above are fixed | MEDIUM   |

---

## Approved Items (No Change Needed)

| Item                                | Evidence                                       |
| ----------------------------------- | ---------------------------------------------- |
| Core API guard topology             | AdminJwtAuthGuard active, 401 confirmed        |
| Suite DenyAllGuard                  | Wired as APP_GUARD in platform-admin.module.ts |
| SessionGuard + JWT never in browser | session.guard.ts reads from JwtStorageService  |
| CORS restrictions                   | env-var driven, no wildcard                    |
| Prisma migrate on start             | Dockerfile CMD includes migrate deploy         |
| BFF-only tsconfig.bff.json          | Correctly excludes client/, compiles host+src  |

---

## Conditions for APPROVE

1. ✅ Add Vite build to Dockerfile
2. ✅ Fix railway.json builder to DOCKERFILE
3. ✅ Fix main.ts PORT to `app.listen(port, '0.0.0.0')`
4. ✅ Verify JWKS domain is alive and env var is set
5. ✅ Confirm `GET /api/platform-admin/organizations` (no session) → 401 JSON (not HTML)
6. ✅ Confirm `GET /api/platform-admin/health` → 200 JSON `{"status": "ok"}`

When all 6 conditions pass → verdict changes to **APPROVE**.
