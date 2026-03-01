# 00 — BASELINE EVIDENCE

**Date:** 2026-03-01T05:09Z | **Commit:** 3c2f883

```
GET /api/platform-admin/health
→ HTTP/1.1 200 OK | Content-Type: application/json | {"status":"ok","module":"platform-admin"}

GET /api/platform-admin/auth/session (no cookie)
→ HTTP/1.1 403 Forbidden | Content-Type: application/json | {"message":"Forbidden resource","error":"Forbidden","statusCode":403}

POST /api/platform-admin/auth/login (body: {})
→ HTTP/1.1 403 Forbidden | Content-Type: application/json | {"message":"Forbidden resource","error":"Forbidden","statusCode":403}

POST /api/platform-admin/auth/login (body: {"email":"a@b.com","password":"test"} — Windows backtick quoting)
→ HTTP/1.1 400 Bad Request | Content-Type: application/json | {"message":"Expected property name or '}' in JSON at position 1"}
```

**Critical observation**: auth/login with `{}` body → 403 (DenyAllGuard). Auth/login with JSON body → 400 (Express-layer body parse error from Windows backtick shell escaping — occurred BEFORE NestJS guards run). This confirms ALL NestJS routes are blocked by DenyAllGuard. ExplicitAllowGuard at route-level does NOT bypass APP_GUARD.
