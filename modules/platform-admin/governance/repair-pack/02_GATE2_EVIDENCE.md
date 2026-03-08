# 02_GATE2_EVIDENCE.md — Remove RBAC Hardcode

**Gate**: 2  
**Commit**: 394fa22  
**Tag**: `suite-repair-g2-rbac-real`  
**tsc**: exit 0  
**Result**: ✅ PASS

## Changes Made

- `session.guard.ts`: removed hardcoded `{ role: 'platform_admin' }` block. Added `InternalUserRepository.findByEmail(userId)` async DB lookup. `canActivate` is now `async`.
- `platform-admin.module.ts`: replaced `JwtStorageService` provider with `SessionGuard` provider (DI wiring so InternalUserRepository is resolved).
- `docs/runbook/OPERATOR_SEED.md`: one-shot operator provisioning command documented.

## Curl Evidence

### 1. ORG no cookie → 401 (fail-closed)

```
HTTP/1.1 401 Unauthorized
{"message":"Unauthorized access...","statusCode":401}
```

### 2. Login valid operator (admin@bassan.io)

```
HTTP/1.1 200 OK
{"message":"Login successful"}
```

### 3. ORG with valid operator cookie → 200 ✅

```
HTTP/1.1 200 OK
```

### 4. internal-users with valid operator cookie → 200 ✅

```
HTTP/1.1 200 OK
```

### 5. audit-logs with valid operator cookie → 200 ✅

```
HTTP/1.1 200 OK
```

### 6. Login non-operator email (ghost@nowhere.io) → session created (200)

```
HTTP/1.1 200 OK
```

### 7. ORG with non-operator cookie → 401 (fail-closed from DB lookup) ✅

```
HTTP/1.1 401 Unauthorized
{"message":"Unauthorized access...","statusCode":401}
```

## STOP Conditions — All Clear

- ✅ No hardcoded role assignment remains anywhere
- ✅ No endpoint accessible without an active `InternalUser` DB record
- ✅ Deploy healthy (`/health` → 200)
