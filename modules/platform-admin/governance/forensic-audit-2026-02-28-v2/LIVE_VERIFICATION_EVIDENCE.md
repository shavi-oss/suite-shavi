# LIVE VERIFICATION EVIDENCE

**Date:** 2026-02-28T06:32Z | **Mode:** Verify-only (zero code changes)

---

## A) Railway Context

```
railway whoami
→ eslam abdelshafi (eslam.abdelshafi41@gmail.com)

railway status (suite project d107e5cc)
→ Project: suite-shavi-staging | Env: production | Service: web

railway logs (recent — last entry)
→ 2026-02-28T04:19:25Z [INFO] handled request
    uri: /api/platform-admin/organizations
    ETag: "dgpxmdj4av4099"
    Last-Modified: Fri, 27 Feb 2026 17:48:54 GMT
    status: 200
    Content-Type: text/html
```

**Binary identification:** `ETag: "dgpxmdj4av4099"` with `Last-Modified: 2026-02-27 17:48:54 GMT` is the Vite-compiled `index.html` from the **pre-PR-1 Nixpacks build**. The latest PR-2 Docker build (with `vite build` step) is longer and still in progress.

---

## B) Suite: Endpoint Probes

### B1. `GET /` — SPA Root

```
curl -si https://web-production-6f02f6.up.railway.app/
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
<!doctype html>
<title>Platform Admin Console</title>
```

✅ SPA loads correctly.

### B2. `GET /api/platform-admin/health` — Suite Health

```
curl -si .../api/platform-admin/health
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
```

🔴 **BLOCKER**: Returns HTML (not JSON). Old binary running. NestJS routing not active.

### B3. `GET /api/platform-admin/organizations` (no auth)

```
curl -si .../api/platform-admin/organizations -H "Accept: application/json"
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
```

🔴 **BLOCKER**: Returns 200 HTML. DenyAllGuard/SessionGuard not intercepting. Old binary confirmed.

---

## C) Core: Endpoint Probes

### C1. `GET /health`

```
curl -si https://core-admin-mount-production.up.railway.app/health
HTTP/1.1 404 Not Found
Content-Type: application/json
{"message":"Cannot GET /health","error":"Not Found","statusCode":404}
```

⚠️ Health endpoint fix (commit 40e5266) not yet deployed.

### C2. `GET /api/v1/auth/me` (no auth)

```
curl -si .../api/v1/auth/me
HTTP/1.1 401 Unauthorized
Content-Type: application/json; charset=utf-8
{"message":"Unauthorized","statusCode":401}
```

✅ Auth guard active.

### C3. `POST /api/v2/admin/organizations` (no auth, no JWT)

```
curl -si -X POST .../api/v2/admin/organizations -d "{}"
HTTP/1.1 401 Unauthorized
Content-Type: application/json; charset=utf-8
{"message":"Unauthorized","statusCode":401}
```

✅ AdminJwtAuthGuard active. Fail-closed confirmed.

---

## D) JWKS: Endpoint Probes

### D1. `GET /.well-known/jwks.json`

```
curl -si https://jwks-server-production.up.railway.app/.well-known/jwks.json
HTTP/1.1 200 OK
Content-Type: application/json
{"keys":[{
  "kty":"RSA",
  "alg":"RS256",
  "kid":"admin-key-2",
  "use":"sig",
  "n":"2dJl85fIqWpuHeit...",
  "e":"AQAB"
}]}
```

✅ Live. RSA public key returned. No private fields (d, p, q, etc. absent).

### D2. `GET /health`

```
HTTP/1.1 200 OK
{"status":"ok"}
```

✅ JWKS server healthy.

---

## E) Wiring Verification (Suite env — names only)

| Var                    | Present?                                |
| ---------------------- | --------------------------------------- |
| `CORE_API_BASE_URL`    | ✅ PRESENT                              |
| `ADMIN_JWKS_URL`       | ✅ PRESENT                              |
| `CORS_ORIGIN`          | ✅ PRESENT (active CORS var)            |
| `CORS_ALLOWED_ORIGINS` | ❌ ABSENT                               |
| `DATABASE_URL`         | ✅ PRESENT                              |
| `NODE_ENV`             | ✅ PRESENT                              |
| `PORT`                 | ❌ ABSENT (Railway-injected — expected) |
