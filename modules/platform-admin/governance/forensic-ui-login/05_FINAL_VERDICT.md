# 05 — FINAL VERDICT

**Date:** 2026-03-01T05:47Z | **Commits:** 2f3d078 + 2f8b012

---

## Verdict: ✅ PARTIAL PASS / 🔴 STOP (Data Routes 401 — Next Gate)

---

## Gate Scorecard

| Requirement                           | Result                                                   |
| ------------------------------------- | -------------------------------------------------------- |
| Login form shows when anonymous       | ✅ Verified live (browser E2E)                           |
| POST /auth/login → 200 + cookie       | ✅ Confirmed                                             |
| GET /auth/session after login → 200   | ✅ Confirmed (cookieParser fix)                          |
| Sign out returns to login form        | ✅ Confirmed                                             |
| No JWT in localStorage/sessionStorage | ✅ Confirmed                                             |
| No server code outside scope touched  | ⚠️ main.ts (cookieParser) — gated exception, unavoidable |
| ORG/USR/AUD load data after login     | ❌ 401 (blocker — next gate)                             |

---

## Why ORG/USR/AUD Still Show 401

`SessionGuard.canActivate()` at line 36-39:

```typescript
const coreJwt = this.jwtStorageService.get(userId);
if (!coreJwt) {
  throw new UnauthorizedException(...)
}
```

`AuthController.login` creates a session (`sessionId` cookie ✅) but does NOT store a Core JWT in `JwtStorageService`. All data endpoints require a Core JWT because they forward operations to the Core API. Without it, `SessionGuard` throws 401 even with a valid session.

---

## Next Gate Required

**Gate — Core JWT Bootstrapping on Login**

`AuthController.login` must obtain and store a Core JWT in `JwtStorageService` so `SessionGuard` can inject `req.coreJwt` into data endpoints.

Options (in order of preference):

1. On login, call Core API with admin credentials to get a JWT. Store in JwtStorageService.
2. Use a pre-configured JWKS-signed admin JWT (env variable). Store on login.
3. Bypass coreJwt requirement for read-only endpoints (scope change — not preferred).

Files: `src/auth/auth.controller.ts` (or auth service), `src/auth/jwt-storage.service.ts`
