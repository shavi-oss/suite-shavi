# LIVE FINDINGS

**Date:** 2026-02-28T06:32Z

---

## BLOCKER 1 — Suite: Old Binary Running (ALL /api/\* Return HTML)

**Symptom**: `GET /api/platform-admin/health` → `200 text/html`. `GET /api/platform-admin/organizations` → `200 text/html`.

**Root cause (proved)**:

- Railway logs ETag `"dgpxmdj4av4099"` + Last-Modified `2026-02-27 17:48:54 GMT` = old pre-PR-1 Nixpacks build.
- PRs `3eebe0f` (Dockerfile + Vite build) and `06bdc43` (CORS fix) were pushed to master, but **Railway Docker build is still in progress** — the Vite step (bundling React SPA) takes significantly longer than a Nixpacks build.
- Old binary: NestJS BFF code NOT loaded → `express.static` middleware not present with `/api` guard → ALL `/api/*` GET routes served by the buffered static handler → returns cached `index.html`.

**Expected behavior after rebuild**:

- `GET /api/platform-admin/health` → `200 application/json {"status":"ok"}`
- `GET /api/platform-admin/organizations` (no auth) → `401 application/json {"statusCode":401,...}`

**Blast radius**: Suite API is completely bypassing NestJS. No guard, no RBAC, no auth enforcement for GET requests.

---

## BLOCKER 2 — Core: `/health` Returns 404

**Symptom**: `GET /health` → `404 {"message":"Cannot GET /health"}`.

**Root cause**: Commit `40e5266` added `AppController` with `GET /health` to Core, but Railway Docker rebuild hasn't completed yet. Live binary is pre-`40e5266`.

**Impact**: Railway healthcheck may be failing silently. External monitoring on `/health` gets 404.

**Expected after rebuild**: `200 {"status":"ok"}`.

---

## NON-BLOCKERS (Important Observations)

### O1 — CORS_ORIGIN vs CORS_ALLOWED_ORIGINS

- Suite CLI reports `CORS_ORIGIN` is PRESENT (not `CORS_ALLOWED_ORIGINS`).
- Earlier Railway dashboard showed `CORS_ALLOWED_ORIGINS`. CLI `railway variables` now shows `CORS_ORIGIN = PRESENT`.
- The fix in `06bdc43` reads `CORS_ALLOWED_ORIGINS || CORS_ORIGIN` — so either var name works once new binary deploys.
- **No further action required** — new binary handles both.

### O2 — Core Guards Working Correctly

- `GET /api/v1/auth/me` → 401 ✅
- `POST /api/v2/admin/organizations` → 401 ✅
- Fail-closed posture confirmed on Core. No regression.

### O3 — JWKS Live and Correct

- `/.well-known/jwks.json` → 200, RSA public key with `kid: admin-key-2`, no private fields.
- `ADMIN_JWKS_URL` present in Suite env → Suite can forward coreJwt correctly.
- Core's `AdminJwtAuthGuard` is configured to verify against this JWKS URL.

### O4 — Suite→Core Wiring Vars Present

- `CORE_API_BASE_URL`: PRESENT → CoreClient can reach Core admin endpoint.
- `ADMIN_JWKS_URL`: PRESENT → suite may forward JWT context once session works.

---

## Hypothesis: Why Docker Build Takes So Long

The PR-2 Dockerfile now includes `RUN npx vite build --config modules/platform-admin/client/vite.config.ts`. On a fresh Railway Docker build (no cache), this:

1. Runs TypeScript+React compilation via Vite
2. Tree-shakes and bundles all React components
3. On Railway's build runners, this takes 8-15 minutes total

Once complete, Railway auto-deploys the new container and the ETag will change from `dgpxmdj4av4099`.
