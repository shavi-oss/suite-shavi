# 08_LIVE_E2E_EVIDENCE.md — Gate 5 Phase 4

**Date**: 2026-03-08  
**Suite deploy commit**: 6e1195f (`gate5.1-suite-write-auth-admin-key-3`)

## A — Suite Health

```
GET /api/platform-admin/health
HTTP/1.1 200 OK
```

✅

## B — Read-only with valid session (JWT auth inactive for reads)

```
POST /api/platform-admin/auth/login (valid creds)
HTTP/1.1 200 OK
Set-Cookie: sessionId=947609b6...  HttpOnly; Secure; SameSite=Strict

GET /api/platform-admin/organizations (with cookie)
HTTP/1.1 200 OK
```

✅ Read-only works. No JWT in login response.

## C — Unauthenticated write (no session cookie)

```
POST /api/platform-admin/organizations
HTTP/1.1 401 Unauthorized
{"message":"Unauthorized access. Please contact your administrator.","statusCode":401}
```

✅ Fail-closed.

## D — Authenticated write (JWT minting path confirmed active)

```
POST /api/platform-admin/organizations (with valid session cookie)
SessionGuard: write route detected → mintAdminJwt() called → coreJwt attached to request
CoreClient.createOrganization() → bears valid JWT → Core responds 400 (not 401)
HTTP/1.1 500 Internal Server Error (surfaced as ORGANIZATION_CREATE_FAILED)
```

**JWT Authentication: ✅ CONFIRMED WORKING** (Core returns 400, not 401)

⚠️ Core 400 is caused by **pre-existing payload contract gap**:

- Suite sends `{ name }` only
- Core `CreateOrganizationDto` requires `name, adminEmail, adminPassword, adminFirstName, adminLastName`
- This contract mismatch pre-dates Gate 5 and is outside Gate 5 scope (gate spec: Core controller is read-only)

## E — Direct Core unauthenticated POST

```
POST https://core-admin-mount-production.up.railway.app/api/v2/admin/organizations
(no Authorization header)
→ 401 Unauthorized (Core AdminJwtAuthGuard rejects)
```

✅ Core correctly rejects unauthenticated calls.

## F — JWT in browser/response

No JWT appears in any response body, Set-Cookie header, or client-visible field.
✅ Browser-JWT rule intact.

## Summary

| Check                                   | Expected | Result                      |
| --------------------------------------- | -------- | --------------------------- |
| Health 200                              | ✅       | ✅                          |
| Login 200 + HttpOnly cookie             | ✅       | ✅                          |
| GET orgs 200 (read-only, no JWT minted) | ✅       | ✅                          |
| Unauthenticated write → 401             | ✅       | ✅                          |
| JWT minted and forwarded to Core        | ✅       | ✅ (Core gets 400, not 401) |
| No JWT in browser                       | ✅       | ✅                          |
| Core rejects without JWT                | ✅       | ✅                          |

**Blocker (pre-existing, outside Gate 5 scope)**:  
Suite `CreateOrganizationDto` missing `adminEmail/adminPassword/adminFirstName/adminLastName`. Needs a separate gate (PR fix to org.dto.ts + organization.service.ts + core.client.ts payload mapping).
