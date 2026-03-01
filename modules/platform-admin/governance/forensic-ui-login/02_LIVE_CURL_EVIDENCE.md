# 02 — LIVE CURL EVIDENCE

**Date:** 2026-03-01T05:47Z | **Commits:** 2f3d078 (UI) + 2f8b012 (cookieParser)

## 1. Session without cookie → 401 ✅

```
GET /api/platform-admin/auth/session
→ HTTP/1.1 401 Unauthorized | {"message":"Unauthorized access...","statusCode":401}
```

## 2. Organizations without cookie → 401 ✅

```
GET /api/platform-admin/organizations
→ HTTP/1.1 401 Unauthorized | {"message":"Unauthorized access...","statusCode":401}
```

## 3. Health → 200 ✅

```
GET /api/platform-admin/health
→ HTTP/1.1 200 OK | {"status":"ok","module":"platform-admin"}
```

## 4. Browser E2E — login round-trip (from DevTools network tab)

```
POST /api/platform-admin/auth/login  (credentials: email=admin@test.com)
→ 200 OK | {"message":"Login successful"} | Set-Cookie: sessionId=<uuid>

GET /api/platform-admin/auth/session (cookie: sessionId=<uuid>)
→ 200 OK | {"userId":"admin@test.com","expiresAt":...}

GET /api/platform-admin/organizations (cookie: sessionId=<uuid>)
→ 401 Unauthorized (see note below)
```

## Note: Data Endpoints 401 After Login (Next Gate Blocker)

SessionGuard validates the session cookie correctly (userId retrieved). But then:

```typescript
// session.guard.ts L37-39
const coreJwt = this.jwtStorageService.get(userId);
if (!coreJwt) {
  throw new UnauthorizedException(...)  // ← fires because no Core JWT is stored
}
```

AuthController.login does NOT store a Core JWT in JwtStorageService. The data endpoints require coreJwt (injected into req.coreJwt by SessionGuard) to forward requests to Core API. Since no coreJwt is stored post-login, 401 is thrown.

This is the next gate: `AuthController.login` must store a valid Core JWT in `JwtStorageService` for the authenticated session.
