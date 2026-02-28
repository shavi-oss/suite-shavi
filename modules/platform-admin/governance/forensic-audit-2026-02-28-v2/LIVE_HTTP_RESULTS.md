# LIVE HTTP RESULTS

**Date:** 2026-02-28T06:48Z | **Binary running:** Old Nixpacks (ETag `dgpxmdj4av4099`)

---

## Suite BFF

| Probe                   | Command                                         | Status | Content-Type  | Body (first 2 lines)                                        | Result       |
| ----------------------- | ----------------------------------------------- | ------ | ------------- | ----------------------------------------------------------- | ------------ |
| GET /                   | `curl -si .../`                                 | 200    | text/html     | `<!doctype html>` / `<title>Platform Admin Console</title>` | ✅ SPA loads |
| GET /api/health         | `curl -si .../api/platform-admin/health`        | 200    | **text/html** | SPA HTML                                                    | 🔴 BLOCKER   |
| GET /api/orgs (no auth) | `curl -si .../api/platform-admin/organizations` | 200    | **text/html** | SPA HTML                                                    | 🔴 BLOCKER   |

**Root cause**: Old Nixpacks binary (no NestJS BFF code) running. All requests handled by static file server → returns cached `index.html`.

---

## Core Admin Mount

| Probe                   | Command                                                   | Status | Content-Type     | Body (first 2 lines)                          | Result          |
| ----------------------- | --------------------------------------------------------- | ------ | ---------------- | --------------------------------------------- | --------------- |
| GET /health             | `curl -si .../health`                                     | 404    | application/json | `{"message":"Cannot GET /health"}`            | ⚠️ Building     |
| GET /api/v1/auth/me     | `curl -si .../api/v1/auth/me`                             | 401    | application/json | `{"message":"Unauthorized","statusCode":401}` | ✅ Guard active |
| POST /api/v2/admin/orgs | `curl -si -X POST .../api/v2/admin/organizations -d "{}"` | 401    | application/json | `{"message":"Unauthorized","statusCode":401}` | ✅ Guard active |

---

## JWKS Server

| Probe                      | Command               | Status | Content-Type     | Body (first 2 lines)                                                                                  | Result     |
| -------------------------- | --------------------- | ------ | ---------------- | ----------------------------------------------------------------------------------------------------- | ---------- |
| GET /.well-known/jwks.json | `curl -si .../`       | 200    | application/json | `{"keys":[{"kty":"RSA","alg":"RS256","kid":"admin-key-2","use":"sig","n":"2dJl85fI...","e":"AQAB"}]}` | ✅ Live    |
| GET /health                | `curl -si .../health` | 200    | application/json | `{"status":"ok"}`                                                                                     | ✅ Healthy |

**Private field check**: Response contains only `kty`, `n`, `e`, `use`, `kid`, `alg` — no `d`, `p`, `q`, `dp`, `dq`, `qi`. ✅ SAFE.

---

## Redeploy Actions Taken

```
railway redeploy --service web --yes  → exit 0 (re-ran OLD image — not a fresh build)
git commit --allow-empty -m "chore(deploy): force Railway Docker rebuild"
git push origin master                → f026086 pushed (triggers GitHub → Railway build)
```
