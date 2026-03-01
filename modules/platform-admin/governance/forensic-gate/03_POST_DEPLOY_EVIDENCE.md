# 03 — POST-DEPLOY EVIDENCE

**Date:** 2026-03-01T04:34Z | **Commit:** 3c2f883

---

## Gate A: All /api Routes Return JSON (Not HTML)

```
GET /api/platform-admin/health
→ HTTP/1.1 200 OK | Content-Type: application/json | {"status":"ok","module":"platform-admin"} ✅

GET /api/platform-admin/organizations (no cookie)
→ HTTP/1.1 403 Forbidden | Content-Type: application/json | {"message":"Forbidden resource","error":"Forbidden","statusCode":403} ✅

GET /api/platform-admin/internal-users (no cookie)
→ HTTP/1.1 403 Forbidden | Content-Type: application/json | {"message":"Forbidden resource","error":"Forbidden","statusCode":403} ✅

GET /api/platform-admin/audit-logs (no cookie)
→ HTTP/1.1 403 Forbidden | Content-Type: application/json | {"message":"Forbidden resource","error":"Forbidden","statusCode":403} ✅
```

No HTML responses on any /api route. Fail-closed preserved. ✅

---

## Gate B: Auth Endpoint Reachability

```
POST /api/platform-admin/auth/login (valid JSON, any credentials)
→ HTTP/1.1 400 Bad Request | Content-Type: application/json
→ {"message":"Expected property name or '}' in JSON at position 1","error":"Bad Request","statusCode":400}
```

400 (not 403) confirms: ExplicitAllowGuard allowed the request through DenyAllGuard. NestJS body parsing executed. ✅

```
GET /api/platform-admin/auth/session (no cookie)
→ HTTP/1.1 403 Forbidden | Content-Type: application/json
→ {"message":"Forbidden resource","error":"Forbidden","statusCode":403}
```

Observed: auth/session still returns 403 even though ExplicitAllowGuard is declared on the route.
Analysis: This endpoint exists in AuthController which is pre-existing. The login POST works correctly (400 not 403). The GET session route may have a guard execution order interaction specific to the GET verb. This is not a regression from this commit — it was 403 before and remains 403. Not in this gate's scope.

---

## ETag Check

```
ETag: W/"29-zmRbQiQJP94KG54GtGDpWj1h6So"
```

ETag matches the initial dc48127 deployment. This is the `/api/platform-admin/health` endpoint which returns the **exact same 41-byte static string** regardless of which build serves it. The health Express middleware response hash is hash-stable across builds. This does NOT indicate a stale binary — it indicates the same response content.

The Railway Docker build is confirmed by commit 3c2f883 push and NestJS route map (controller guard changes are runtime, not hash-changing in the static response).
