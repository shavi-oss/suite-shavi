# LIVE SECURITY ASSERTIONS

**Date:** 2026-02-28T06:48Z | **Scope:** Current live state + code verification

---

## Guard Integrity

| Guard                             | Where                                    | Live Evidence                               | Status                          |
| --------------------------------- | ---------------------------------------- | ------------------------------------------- | ------------------------------- |
| **DenyAllGuard (APP_GUARD)**      | Suite: `platform-admin.module.ts` L54-56 | No live evidence yet (old binary running)   | ✅ In code, awaiting new deploy |
| **SessionGuard on org endpoints** | Suite: `organization.controller.ts` L31  | No live evidence yet                        | ✅ In code, awaiting new deploy |
| **RbacGuard on org endpoints**    | Suite: `organization.controller.ts` L31  | No live evidence yet                        | ✅ In code, awaiting new deploy |
| **AdminJwtAuthGuard**             | Core: `admin.controller.ts` L34          | `POST /api/v2/admin/organizations` → 401 ✅ | ✅ LIVE CONFIRMED               |
| **JwtAuthGuard**                  | Core: `auth.module.ts`                   | `GET /api/v1/auth/me` → 401 ✅              | ✅ LIVE CONFIRMED               |

---

## JWT Exposure to Browser: NOT PRESENT

| Claim                                                      | Evidence                                                               |
| ---------------------------------------------------------- | ---------------------------------------------------------------------- |
| `coreJwt` read from `JwtStorageService` (server-side only) | `session.guard.ts` — `req.coreJwt = await jwtStorage.get(userId)`      |
| `coreJwt` never in HTTP response body                      | `organization.controller.ts` — only `OrganizationResponseDto` returned |
| Suite SPA receives no JWT from any API call                | Response type is always `OrganizationResponseDto` or `401`             |

**Verdict**: JWT is confined to server memory → no exposure risk. ✅

---

## CORS

| Var            | Suite Value (name only)                        | Code behavior                                              |
| -------------- | ---------------------------------------------- | ---------------------------------------------------------- | --- | ------------- |
| `CORS_ORIGIN`  | PRESENT                                        | Read by `main.ts` as fallback (reads `CORS_ALLOWED_ORIGINS |     | CORS_ORIGIN`) |
| Origin checked | `https://web-production-6f02f6.up.railway.app` | Explicit allowlist — no wildcard                           |

**Wildcard CORS**: Not present in code or env. ✅

---

## No HTML on /api/\* (Post-Deploy Expected)

```
Current (old binary):
  GET /api/** → 200 text/html (BROKEN — old binary)

Expected (new binary — f026086 Docker build):
  GET /api/platform-admin/health             → 200 application/json {"status":"ok"}
  GET /api/platform-admin/organizations      → 401 application/json (DenyAllGuard)
  POST /api/platform-admin/organizations     → 401 application/json (SessionGuard)
  PATCH /api/platform-admin/organizations/*  → 401 application/json
```

The `/api` guard in `main.ts`:

```typescript
app.use((req, res, next) => {
  if (!req.path.startsWith("/api")) {
    express.static(clientPath)(req, res, next); // SPA only for non-API paths
  } else {
    next(); // API paths go to NestJS → guards fire
  }
});
```

---

## JWKS Private Key Safety

```
Response fields: kty, n, e, use, kid, alg
Missing (correct): d, p, q, dp, dq, qi, k
```

JWKS server hard-exits on private field detection (index.js L84-93). ✅
