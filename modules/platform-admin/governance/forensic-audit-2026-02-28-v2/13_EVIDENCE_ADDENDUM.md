# 13 — EVIDENCE ADDENDUM (Phase 2 Continuation)

**Date:** 2026-02-28T06:15Z
**Trigger:** User provided Railway variable dump + live service state.

---

## New Evidence from User

### Services Identified

| Service          | Domain                                       | Project ID                           |
| ---------------- | -------------------------------------------- | ------------------------------------ |
| Core Admin Mount | `core-admin-mount-production.up.railway.app` | e56fd682-ed5c-449b-b109-9ad7feb888a5 |
| Core Workflow    | `core-workflow-production.up.railway.app`    | e56fd682 (same project)              |
| JWKS Server      | `jwks-server-production.up.railway.app`      | e56fd682 (same project)              |
| Suite BFF        | `web-production-6f02f6.up.railway.app`       | d107e5cc-24d2-4a4c-98cc-cb672570e8a4 |

### Railway Variables Confirmed

| Service | Var                    | Value                                                                                                   |
| ------- | ---------------------- | ------------------------------------------------------------------------------------------------------- |
| Core    | `ADMIN_JWKS_URL`       | `https://jwks-server-production.up.railway.app/.well-known/jwks.json`                                   |
| Core    | `CORE_API_BASE_URL`    | `https://core-admin-mount-production.up.railway.app` (self-referential — used for org validation flow)  |
| Suite   | `CORS_ALLOWED_ORIGINS` | `https://web-production-6f02f6.up.railway.app`                                                          |
| Suite   | `CORE_API_BASE_URL`    | `https://core-admin-mount-production.up.railway.app`                                                    |
| Suite   | `ADMIN_JWKS_URL`       | `https://jwks-server-production.up.railway.app/.well-known/jwks.json` (Suite doesn't use this directly) |

---

## Critical New Finding: CORS Env Var Mismatch (C9)

**Symptom**: Suite has `CORS_ALLOWED_ORIGINS` on Railway, but `main.ts` read `process.env.CORS_ORIGIN`.
**Impact**: CORS fell back to `['http://localhost:3000']` in production. All browser AJAX requests to `/api/*` from `web-production-6f02f6.up.railway.app` returned CORS errors.
**Fix applied**: `main.ts` updated to read `process.env.CORS_ALLOWED_ORIGINS || process.env.CORS_ORIGIN`.
**Commit**: `06bdc43` (suite-shavi)

---

## Live Curl Evidence (2026-02-28T06:15Z)

```
JWKS /.well-known/jwks.json
  → HTTP/1.1 200 OK
  → Content-Type: application/json
  → {"keys":[{"kty":"RSA","alg":"RS256","kid":"admin-key-2","use":"sig",...}]}
  → NO PRIVATE FIELDS ✅

JWKS /health
  → HTTP/1.1 200 OK
  → {"status":"ok"} ✅

Core POST /api/v2/admin/organizations (no auth)
  → HTTP/1.1 401 Unauthorized
  → {"message":"Unauthorized","statusCode":401}
  → AdminJwtAuthGuard ACTIVE ✅

Core GET /api/v2/admin/organizations (no GET handler — expected)
  → HTTP/1.1 404 Not Found  ✅ (correct — only POST exists)

Core workflow GET /health
  → HTTP/1.1 404 Not Found  ← health endpoint not yet deployed ⚠️

Suite GET /api/platform-admin/health
  → HTTP/1.1 200 OK, Content-Type: text/html  ← old binary still running ⚠️
```

---

## Commits Applied

| Repo        | Commit    | Change                                                         |
| ----------- | --------- | -------------------------------------------------------------- |
| suite-shavi | `06bdc43` | **CRITICAL**: Fix CORS env var mismatch (CORS_ALLOWED_ORIGINS) |
| Bassan.os   | `40e5266` | Add GET /health to Core (AppController)                        |
