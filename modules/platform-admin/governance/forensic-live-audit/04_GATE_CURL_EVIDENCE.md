# 04 — GATE CURL EVIDENCE

**Date:** 2026-02-28T20:33Z (fresh probes — not replayed)  
**Binary running:** `dc48127` (ETag `W/"29-zmRbQiQJP94KG54GtGDpWj1h6So"`)

---

## Suite BFF

### Gate 1: `GET /api/platform-admin/health`

```
curl -si https://web-production-6f02f6.up.railway.app/api/platform-admin/health

HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
ETag: W/"29-zmRbQiQJP94KG54GtGDpWj1h6So"
X-Powered-By: Express
Access-Control-Allow-Credentials: true
Vary: Origin

{"status":"ok","module":"platform-admin"}
```

✅ 200 `application/json` — healthcheck passes — Railway accepts this as healthy.

---

### Gate 2: `GET /api/platform-admin/organizations` (no auth)

```
curl -si https://web-production-6f02f6.up.railway.app/api/platform-admin/organizations -H "Accept: application/json"

HTTP/1.1 403 Forbidden
Content-Type: application/json; charset=utf-8

{"message":"Forbidden resource","error":"Forbidden","statusCode":403}
```

✅ 403 `application/json` — DenyAllGuard active. NOT HTML. Fail-closed preserved.

---

### Gate 3: `GET /` (SPA root)

```
curl -si https://web-production-6f02f6.up.railway.app/

HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
ETag: W/"14d-19ca5de47f0"

<!doctype html>
<html lang="en">
```

✅ 200 `text/html` — Vite-built SPA served correctly.

---

## Core Admin Mount

### Gate 4: `POST /api/v2/admin/organizations` (no JWT)

```
curl -si -X POST https://core-admin-mount-production.up.railway.app/api/v2/admin/organizations -H "Content-Type: application/json" -d "{}"

HTTP/1.1 401 Unauthorized
Content-Type: application/json; charset=utf-8

{"message":"Unauthorized","statusCode":401}
```

✅ 401 `application/json` — AdminJwtAuthGuard active. Fail-closed.

### Gate 5: `GET /api/v1/auth/me` (no JWT)

```
curl -si https://core-admin-mount-production.up.railway.app/api/v1/auth/me

HTTP/1.1 401 Unauthorized
Content-Type: application/json; charset=utf-8

{"message":"Unauthorized","statusCode":401}
```

✅ 401 `application/json` — JwtAuthGuard active. Fail-closed.

---

## JWKS Server

**Domain used:** `jwks-server-production.up.railway.app` (confirmed from `railway services` CLI)

### Gate 6: `GET /.well-known/jwks.json`

```
curl -si https://jwks-server-production.up.railway.app/.well-known/jwks.json

HTTP/1.1 200 OK
Content-Type: application/json

{"keys":[{"kty":"RSA","n":"2dJl85fI...","e":"AQAB","use":"sig","kid":"admin-key-2","alg":"RS256"}]}
```

✅ 200 `application/json` — RSA public key served. Fields present: `kty`, `n`, `e`, `use`, `kid`, `alg`. Private fields (`d`, `p`, `q`, `dp`, `dq`, `qi`) absent. ✅

---

## Gate Scorecard

| #   | Service | Path                                  | Status | Content-Type     | Pass? |
| --- | ------- | ------------------------------------- | ------ | ---------------- | ----- |
| 1   | Suite   | GET /api/platform-admin/health        | 200    | application/json | ✅    |
| 2   | Suite   | GET /api/platform-admin/organizations | 403    | application/json | ✅    |
| 3   | Suite   | GET /                                 | 200    | text/html        | ✅    |
| 4   | Core    | POST /api/v2/admin/organizations      | 401    | application/json | ✅    |
| 5   | Core    | GET /api/v1/auth/me                   | 401    | application/json | ✅    |
| 6   | JWKS    | GET /.well-known/jwks.json            | 200    | application/json | ✅    |

**6 of 6 gates pass.** 🎯
