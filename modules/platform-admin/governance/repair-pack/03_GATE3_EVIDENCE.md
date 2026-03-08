# 03_GATE3_EVIDENCE.md — Remove Sentinel coreJwt

**Gate**: 3  
**Commit**: 4f75d2a  
**Tag**: `suite-repair-g3-corejwt-real`  
**tsc**: exit 0  
**Result**: ✅ PASS (Option B applied)

## Decision: Option B — Remove coreJwt from SessionGuard

The sentinel `platform-admin-session:{email}` was replaced by removing the `coreJwt` check
from `SessionGuard` entirely. Root cause: the check was **over-broad** — read-only endpoints
(ORG/USR/AUD) query local Prisma only and never forward `coreJwt` to Core API.
Write operations that require a real Core JWT are a future gate.

No new env var introduced (`PLATFORM_ADMIN_CORE_JWT` not needed for this gate).

## Changes Made

- `auth.controller.ts`: removed `JwtStorageService` import and constructor injection; removed `jwtStorageService.set(...)` on login; removed `jwtStorageService.clear(...)` on logout.
- `session.guard.ts`: removed `JwtStorageService` import, constructor injection, `coreJwt` check, and `request.coreJwt` attachment (all done in Gate 2 rewrite).
- `platform-admin.module.ts`: `JwtStorageService` removed from providers (Gate 2).

## Curl Evidence

### Login response (no JWT in headers or body)

```
HTTP/1.1 200 OK
{"message":"Login successful"}
No Authorization / jwt / bearer / token header present  ✅
```

### ORG with valid operator → 200

```
HTTP/1.1 200 OK
```

### Browser storage: no JWT

Cookie set: `sessionId=<uuid>; HttpOnly; SameSite=Strict` — opaque session ID only. ✅

## STOP Conditions — All Clear

- ✅ No sentinel string remains in any code file
- ✅ No JWT appears in any response header or body
- ✅ No PLATFORM_ADMIN_CORE_JWT env var invented
- ✅ JwtStorageService is not imported or used anywhere in the active auth flow
