# 04 — GATE CURL EVIDENCE

**Date:** 2026-02-28T07:53Z (7 min after commit 782fa28 push)
**Binary running:** Old Nixpacks (ETag `dgpxmdj4av4099`, Last-Modified: Fri, 27 Feb 2026 17:48)

---

## Gate 1: Suite SPA Root

```
GET https://web-production-6f02f6.up.railway.app/

HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
<!doctype html>
<html lang="en">
```

✅ SPA HTML served at `/`.

---

## Gate 2: Suite Health (API)

```
GET https://web-production-6f02f6.up.railway.app/api/platform-admin/health

HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8     ← BLOCKER
ETag: "dgpxmdj4av4099"
Last-Modified: Fri, 27 Feb 2026 17:48:54 GMT

<!doctype html>
<html lang="en">
```

🔴 BLOCKER: Returns HTML. Old binary running.

---

## Gate 3: Suite Orgs (No Auth)

```
GET https://web-production-6f02f6.up.railway.app/api/platform-admin/organizations

HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8     ← BLOCKER
ETag: "dgpxmdj4av4099"
Last-Modified: Fri, 27 Feb 2026 17:48:54 GMT

<!doctype html>
<html lang="en">
```

🔴 BLOCKER: Returns HTML, not 401 JSON. Old binary running.

---

## Gate 4: Core Auth/Me

```
GET https://core-admin-mount-production.up.railway.app/api/v1/auth/me

HTTP/1.1 401 Unauthorized
Content-Type: application/json; charset=utf-8
{"message":"Unauthorized","statusCode":401}
```

✅ JwtAuthGuard active.

---

## Gate 5: Core Admin POST (No Auth)

```
POST https://core-admin-mount-production.up.railway.app/api/v2/admin/organizations

HTTP/1.1 401 Unauthorized
Content-Type: application/json; charset=utf-8
{"message":"Unauthorized","statusCode":401}
```

✅ AdminJwtAuthGuard active.

---

## Gate 6: JWKS

```
GET https://jwks-server-production.up.railway.app/.well-known/jwks.json

HTTP/1.1 200 OK
Content-Type: application/json
{"keys":[{"kty":"RSA","n":"2dJl85fI...","e":"AQAB","use":"sig","kid":"admin-key-2","alg":"RS256"}]}
```

✅ RSA public key served. No private fields (d, p, q absent).

---

## ETag Status (Build Tracker)

| ETag                                              | Binary              | Status               |
| ------------------------------------------------- | ------------------- | -------------------- |
| `dgpxmdj4av4099` (Last-Modified 2026-02-27 17:48) | Pre-PR-1 Nixpacks   | 🔴 STILL RUNNING     |
| _new ETag (when 782fa28 deploys)_                 | Docker + Vite build | ⏳ BUILD IN PROGRESS |
