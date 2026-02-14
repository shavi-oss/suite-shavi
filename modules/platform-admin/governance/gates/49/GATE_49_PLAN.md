# Gate 49 — Plan

## Suite Session Implementation (httpOnly Cookie-Based)

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Gate Number    | 49                                      |
| Gate Name      | Suite Session Implementation            |
| Document Title | GATE_49_PLAN                            |
| Repo           | Suite (Layer / Product Repo)            |
| Module         | platform-admin                          |
| Status         | FINAL — PLAN APPROVED (49A DOCS-ONLY)   |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-02-12                              |

---

## 1) Objective

Implement Suite session handling using **httpOnly cookies** in BFF to enable authenticated UI ↔ BFF communication.

**This is NOT Core authentication**. Core authentication uses user-scoped JWT (per INTEGRATION_CONTRACT_CORE.md Section 5.1). This gate implements Suite-side session management only.

**Gate 49A**: Docs-only (plan + authorization)  
**Gate 49B**: Implementation (requires separate authorization)

---

## 2) Scope (Implementation in Gate 49B)

### IN SCOPE

**BFF Session Endpoints**:

- `POST /api/platform-admin/auth/login` — Issue Suite session cookie
- `POST /api/platform-admin/auth/logout` — Clear Suite session cookie
- `GET /api/platform-admin/auth/session` — Validate current session

**Session Cookie Issuance**:

- httpOnly: true (SECURITY_BASELINE.md 4.2, line 134)
- secure: true (prod), false (dev)
- sameSite: 'strict' (CSRF protection, GATE_48_DEV_AUTH_FLOW_LOCK.md Section 4.1)
- path: '/'
- maxAge: 900000 (15 minutes, per SECURITY_BASELINE.md TODO #1)

**Auth Guard Wiring**:

- Create `SessionGuard` to validate Suite session cookie
- Wire to existing controllers (Organizations, InternalUsers, Audit)
- Fail-closed: 401 if session invalid/missing

**Fail-Closed Behavior**:

- Invalid session → 401 Unauthorized
- Missing session → 401 Unauthorized
- Expired session → 401 Unauthorized
- Safe error messages (no internal details)

### OUT OF SCOPE

**NOT AUTHORIZED**:

- Core authentication changes (Core is immutable, ARCHITECTURAL_LAWS.md LAW-2)
- New dependencies (package.json/package-lock.json changes)
- UI storing tokens (localStorage/sessionStorage forbidden, SECURITY_BASELINE.md 4.2)
- UI → Core direct calls (forbidden, ARCHITECTURAL_LAWS.md LAW-3)
- Refresh tokens (NOT AVAILABLE in Core v1, INTEGRATION_CONTRACT_CORE.md 5.1)
- Service tokens (NOT AVAILABLE in Core v1, INTEGRATION_CONTRACT_CORE.md 5.1)
- CSRF token implementation (sameSite: 'strict' provides protection, GATE_48_DEV_AUTH_FLOW_LOCK.md Section 4.1)

---

## 3) Assumptions & NOT AVAILABLE

### Assumptions

- ✅ Nest.js `@nestjs/common` already available (confirmed in package.json)
- ✅ CORS credentials enabled (confirmed in host/main.ts line 15)
- ✅ httpOnly cookies supported by browser (standard web API)

### NOT AVAILABLE (Core v1 Limitations)

Per INTEGRATION_CONTRACT_CORE.md Section 5.1, 12.2:

- ❌ Service-to-service authentication
- ❌ Core service tokens
- ❌ OAuth2 client credentials flow
- ❌ Token refresh mechanism
- ❌ Core-issued refresh tokens

**Implication**: Suite session is independent of Core. Core JWT forwarding (future gate) will use user-scoped JWT only.

---

## 4) Work Breakdown (Gate 49B Implementation)

### Phase 1: Session Service & DTOs

**Files to Create**:

- `src/auth/session.service.ts` — Session validation logic
- `src/auth/dto/login.dto.ts` — Login request DTO
- `src/auth/dto/session-response.dto.ts` — Session response DTO

**Responsibilities**:

- Generate session ID (UUID v4)
- Store session in memory (Map<sessionId, userId>) — **NOT AVAILABLE**: Redis/external store
- Validate session existence and expiry
- Clear session on logout

### Phase 2: Auth Controller

**Files to Create**:

- `src/auth/auth.controller.ts` — Login/logout/session endpoints

**Endpoints**:

- `POST /api/platform-admin/auth/login` — Issue httpOnly cookie
- `POST /api/platform-admin/auth/logout` — Clear httpOnly cookie
- `GET /api/platform-admin/auth/session` — Validate session

**Cookie Configuration**:

```typescript
{
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/',
  maxAge: 900000 // 15 minutes
}
```

### Phase 3: Session Guard

**Files to Create**:

- `src/auth/session.guard.ts` — Validate Suite session cookie

**Behavior**:

- Extract session ID from cookie
- Validate via SessionService
- Fail-closed: 401 if invalid/missing
- Attach userId to request context

### Phase 4: Module Wiring

**Files to Modify**:

- `platform-admin.module.ts` — Register AuthController, SessionService, SessionGuard

**Changes**:

- Add AuthController to controllers array
- Add SessionService to providers array
- Wire SessionGuard to protected endpoints (Organizations, InternalUsers, Audit)

### Phase 5: Tests

**Files to Create**:

- `tests/unit/auth/session.service.spec.ts`
- `tests/unit/auth/auth.controller.spec.ts`
- `tests/unit/auth/session.guard.spec.ts`

**Coverage**:

- Session creation/validation/expiry
- Cookie issuance/clearing
- Guard fail-closed behavior (401 on invalid/missing session)
- Negative tests (expired session, tampered cookie)

---

## 5) Verification Plan (Gate 49B)

### V1 — TypeScript Compilation

**Command**:

```bash
npx tsc -p modules/platform-admin/tsconfig.bff.json
```

**Expected**: Exit code 0, no errors

### V2 — Unit Tests

**Command**:

```bash
npm run test:platform-admin:unit
```

**Expected**: All tests pass, including new auth tests

### V3 — Runtime Smoke Test

**Step 1**: Start BFF

```bash
node dist/modules/platform-admin/host/main.js
```

**Step 2**: Login (issue session cookie)

```bash
curl -X POST http://localhost:4000/api/platform-admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}' \
  -c cookies.txt
```

**Expected**: 200 OK, Set-Cookie header with httpOnly session cookie

**Step 3**: Validate session

```bash
curl http://localhost:4000/api/platform-admin/auth/session \
  -b cookies.txt
```

**Expected**: 200 OK with session info

**Step 4**: Access protected endpoint

```bash
curl http://localhost:4000/api/platform-admin/organizations \
  -b cookies.txt
```

**Expected**: 200 OK (or 403 if RBAC blocks, but NOT 401)

**Step 5**: Logout (clear session)

```bash
curl -X POST http://localhost:4000/api/platform-admin/auth/logout \
  -b cookies.txt
```

**Expected**: 200 OK, Set-Cookie with expired cookie

**Step 6**: Verify session cleared

```bash
curl http://localhost:4000/api/platform-admin/auth/session \
  -b cookies.txt
```

**Expected**: 401 Unauthorized

---

## 6) Evidence Requirements (Gate 49B)

**MUST provide**:

1. `git diff --name-only` output (only allowed files)
2. `git diff` output (verify no forbidden changes)
3. `npx tsc` build log (exit code 0)
4. `npm run test:platform-admin:unit` output (all pass)
5. Runtime smoke test outputs (curl commands + responses)

**MUST NOT show**:

- Dependency changes (package.json/package-lock.json)
- Core modifications
- UI token storage (localStorage/sessionStorage)
- Files outside allowed paths

---

## 7) Risk Controls

### CSRF Protection

**Strategy**: `sameSite: 'strict'` cookie attribute (GATE_48_DEV_AUTH_FLOW_LOCK.md Section 4.1)

**Rationale**: Strict same-site policy prevents CSRF attacks without requiring CSRF tokens

**Alternative**: If `sameSite: 'lax'` is needed (cross-site navigation), implement CSRF token validation

### Logging Discipline

**MUST Log**:

- Login/logout events (userId, timestamp, correlation ID)
- Session validation failures (correlation ID, reason)

**MUST NOT Log**:

- Session IDs (treat as secrets)
- Passwords
- Cookie values
- PII (unless explicitly approved)

**Source**: SECURITY_BASELINE.md Section 4.7, GATE_48_DEV_AUTH_FLOW_LOCK.md Section 6

### Correlation ID Preservation

**MUST**: Preserve existing correlation ID flow (UI → BFF)

**Source**: GATE_48_DEV_AUTH_FLOW_LOCK.md Section 6.1, client/src/api/platformAdmin.ts line 41

---

## 8) Clear Statement

**Gate 49A produces plan + authorization ONLY.**

**Gate 49B is REQUIRED for code implementation.**

No implementation is authorized in Gate 49A. All code changes require explicit Gate 49B authorization with approved file allowlist.

---

## 9) Signature

**Approved By**: Governance Authority  
**Date**: 2026-02-12  
**Status**: FINAL — PLAN APPROVED (49A DOCS-ONLY)
