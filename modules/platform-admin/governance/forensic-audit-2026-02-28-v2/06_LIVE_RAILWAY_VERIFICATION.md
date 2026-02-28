# 06 — LIVE RAILWAY VERIFICATION (Evidence)

**Date:** 2026-02-28T05:15Z | **Method:** Railway CLI + curl (sanitized)

---

## Railway CLI

```
railway whoami
→ Logged in as eslam abdelshafi (eslam.abdelshafi41@gmail.com)

railway status
→ Project: suite-shavi-staging
→ Environment: production
→ Service: web
```

## Railway Variables (Names Only — Values Redacted)

```
CORE_API_BASE_URL   = https://core-admin-mount-...[REDACTED]
CORS_ORIGIN         = https://web-production-6f02f6.up.railway.app
DATABASE_PUBLIC_URL = postgresql://...[REDACTED]
DATABASE_URL        = postgresql://...[REDACTED]
```

_`PORT` is injected by Railway at runtime — not set as user var._

---

## Railway Logs Evidence (Suite)

```
2026-02-28T02:36:49.840Z [INFO] handled request
  uri: /api/platform-admin/organizations
  method: GET
  status: 200
  Content-Type: text/html; charset=utf-8
  ETag: "dgpxmdj4av4099"
  Last-Modified: Fri, 27 Feb 2026 17:48:54 GMT
  size: 333
```

**Interpretation**: The live binary is the Nixpacks-built OLD dist. ETag `dgpxmdj4av4099` corresponds to the original Vite-built `index.html` from 2026-02-27 17:48. This confirms the pre-PR-1 binary is running.

**PR-2 (`3eebe0f`) was pushed at ~03:00Z and triggered Railway Docker rebuild. Results pending.**

---

## Curl Probes

### Suite BFF

```
GET /
  HTTP/1.1 200 OK
  Content-Type: text/html; charset=utf-8
  <!doctype html>
  <title>Platform Admin Console</title>
  → SPA is loading ✅

GET /api/platform-admin/health
  HTTP/1.1 200 OK
  Content-Type: text/html; charset=utf-8  ← SPA HTML (BROKEN — should be JSON)
  → Old dist confirmed 🔴

GET /api/platform-admin/organizations (Accept: application/json, no auth)
  HTTP/1.1 200 OK
  Content-Type: text/html; charset=utf-8  ← SPA HTML (BROKEN — should be 401)
  → Guard not firing 🔴

PATCH /api/platform-admin/organizations/x/suspend (no auth)
  HTTP/1.1 405 Method Not Allowed   ← NestJS is routing non-GET
  → NestJS routing active for non-GET ⚠️
```

### Core API

```
GET /api/v1/auth/me (no auth)
  HTTP/1.1 401 Unauthorized
  Content-Type: application/json
  {"message":"Unauthorized","statusCode":401}
  → Guard active ✅

POST /api/v2/admin/organizations (no auth)
  HTTP/1.1 401 Unauthorized
  Content-Type: application/json
  {"message":"Unauthorized","statusCode":401}
  → AdminJwtAuthGuard active ✅
```

### JWKS Server

```
GET /.well-known/jwks.json
  HTTP/1.1 404 Not Found   ← Domain not resolved; multiple attempts failed
  → JWKS domain UNKNOWN ⚠️
```

---

## Current Service Status Table

| Service     | Status     | Evidence                           | Health Path                        |
| ----------- | ---------- | ---------------------------------- | ---------------------------------- |
| Suite BFF   | 🟡 PARTIAL | SPA loads, /api routes return HTML | Pending PR-2 rebuild               |
| Core API    | ✅ RUNNING | 401 JSON on all probed endpoints   | No /health endpoint                |
| JWKS Server | ⚠️ UNKNOWN | Domain probe 404                   | Need domain from Railway Dashboard |

---

## Post-PR-2 Verification (Pending Railway Rebuild)

After Railway Docker build from `3eebe0f` completes (~3-5 min), verify:

```bash
# Suite health must return JSON
curl -si https://web-production-6f02f6.up.railway.app/api/platform-admin/health
# Expected: 200 application/json {"status":"ok"}

# Suite API routes must return 401 JSON (not HTML)
curl -si https://web-production-6f02f6.up.railway.app/api/platform-admin/organizations
# Expected: 401 application/json {"statusCode":401,"message":"Forbidden resource"}
```
