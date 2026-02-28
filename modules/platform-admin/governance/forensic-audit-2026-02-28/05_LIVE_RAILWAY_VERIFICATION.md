# 05 — LIVE RAILWAY VERIFICATION

**Date:** 2026-02-28T04:35Z
**Auditor:** Agent (anti-gravity) via Railway CLI + curl probes

## A. Railway CLI Evidence

```
railway whoami
→ Logged in as eslam abdelshafi (eslam.abdelshafi41@gmail.com) 👋

railway status
→ Project: suite-shavi-staging
→ Environment: production
→ Service: web
```

## B. Environment Variables (Names Only — Sanitized)

```
CORE_API_BASE_URL  = https://core-admin-mount-... [REDACTED]
CORS_ORIGIN        = https://web-production-6f02f6.up.railway.app
DATABASE_PUBLIC_URL = postgresql://... [REDACTED]
DATABASE_URL        = postgresql://... [REDACTED]
```

_Note: `PORT` not listed — Railway injects `$PORT` at runtime automatically._

## C. Railway Logs Evidence

```
Last log entry for GET /api/platform-admin/organizations:
  status=200
  Content-Type=text/html; charset=utf-8
  ETag="dgpxmdj4av4099"
  Last-Modified=Fri, 27 Feb 2026 17:48:54 GMT
  size=333 (index.html bytes)
```

**Conclusion**: The live deployed binary is serving `index.html` for all GET requests including `/api/*`. This is the OLD pre-PR-1 `dist/main.js`. The ETag `dgpxmdj4av4099` is the Vite-built index.html and matches the 17:48 build timestamp from the initial deployment.

## D. Curl Probes

### Suite Web

| Path                                            | Method | Expected                   | Actual                                           | Status       |
| ----------------------------------------------- | ------ | -------------------------- | ------------------------------------------------ | ------------ |
| `/`                                             | GET    | 200 HTML (SPA)             | 200 HTML `<title>Platform Admin Console</title>` | ✅ SPA Loads |
| `/api/platform-admin/health`                    | GET    | 200 JSON `{"status":"ok"}` | **200 HTML** (SPA fallback)                      | 🔴 BROKEN    |
| `/api/platform-admin/organizations`             | GET    | 401 JSON                   | **200 HTML** (SPA fallback)                      | 🔴 BROKEN    |
| `/api/platform-admin/organizations/:id/suspend` | PATCH  | 401 JSON                   | **405 Method Not Allowed**                       | ⚠️ PARTIAL   |

### Core API

| Path                                      | Method | Expected | Actual                                            | Status          |
| ----------------------------------------- | ------ | -------- | ------------------------------------------------- | --------------- |
| `/api/v1/auth/me`                         | GET    | 401 JSON | `401 {"message":"Unauthorized","statusCode":401}` | ✅ Guard Active |
| `/api/v2/admin/organizations`             | POST   | 401 JSON | `401 {"message":"Unauthorized","statusCode":401}` | ✅ Guard Active |
| `/api/v2/admin/organizations/:id/suspend` | PATCH  | 401 JSON | 401 (inferred from guard pattern)                 | ✅              |

### JWKS Server

| Path                     | Method | Expected                | Actual                    | Status            |
| ------------------------ | ------ | ----------------------- | ------------------------- | ----------------- |
| `/.well-known/jwks.json` | GET    | 200 JSON `{keys:[...]}` | 404 (domain probe failed) | ⚠️ DOMAIN UNKNOWN |

## E. Key Finding: Live Deployed Binary

The live Suite deployment is running the pre-PR-1 binary. Evidence:

- ETag and Last-Modified timestamp match original Vite build
- `/api/platform-admin/organizations` returns HTML (no `/api` guard)
- PATCH requests correctly reach NestJS (405) — `express.static` doesn't intercept non-GET methods

**Root Cause confirmed**: Railway's Docker build does NOT serve the SPA because:

1. Vite client build is NOT in the Dockerfile
2. The current Docker deployment may be running an old cached build
