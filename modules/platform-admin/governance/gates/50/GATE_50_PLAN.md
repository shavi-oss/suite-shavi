# Gate 50 — Plan

## BFF → Core JWT Forwarding (Server-Side Only)

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Gate Number    | 50                                      |
| Gate Name      | BFF → Core JWT Forwarding               |
| Document Title | GATE_50_PLAN                            |
| Repo           | Suite (Layer / Product Repo)            |
| Module         | platform-admin                          |
| Status         | FINAL — PLAN APPROVED (50A DOCS-ONLY)   |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-02-12                              |

---

## 1) Objective

Implement BFF → Core user-scoped JWT forwarding to enable Suite BFF to call Core APIs on behalf of authenticated users.

**This is server-side only**. Core JWT MUST NEVER reach UI or browser storage.

**Gate 50A**: Docs-only (plan + authorization)  
**Gate 50B**: Implementation (requires separate authorization)

---

## 2) Architectural Context

```
┌─────────────┐          ┌─────────────┐          ┌──────────┐
│             │          │             │          │          │
│  UI Client  │  Suite   │  Suite BFF  │  Core    │   Core   │
│  (port 3000)│  Session │ (port 4000) │  JWT     │ (v1 API) │
│             │  Cookie  │             │  Header  │          │
└─────────────┘          └─────────────┘          └──────────┘
      │                        │                        │
      │  httpOnly cookie       │  Authorization:        │
      │  (Suite session)       │  Bearer <core-jwt>     │
      │                        │                        │
   [Gate 49B]              [Gate 50B]              [Core v1]
```

**Key Principles**:

- UI sends Suite session cookie (httpOnly, Gate 49B)
- BFF validates Suite session (SessionGuard, Gate 49B)
- BFF extracts Core JWT from server-side storage (NOT from UI)
- BFF forwards Core JWT to Core as `Authorization: Bearer <jwt>`
- Core validates JWT and returns response
- BFF returns response to UI (no JWT exposure)

**Source**: INTEGRATION_CONTRACT_CORE.md Section 5.1, 12.2

---

## 3) JWT Extraction Strategy (Server-Side Only)

### 3.1 Core v1 Reality

**Per INTEGRATION_CONTRACT_CORE.md Section 5.1**:

- Core v1 uses **user-scoped JWT** authentication ONLY
- JWT contains claims: `sub` (user ID), `email`, `organizationId`
- No service-to-service authentication
- No Core service tokens
- No token refresh mechanism

### 3.2 JWT Storage (Server-Side)

**MUST**: Core JWT stored ONLY in BFF server memory/environment  
**MUST NOT**: Core JWT in cookies, localStorage, sessionStorage, or any UI-accessible storage

**Implementation Strategy** (Gate 50B):

- Store mapping: `Suite userId → Core JWT` in BFF server memory (Map)
- Extract Core JWT from server-side storage using `userId` from Suite session
- Forward to Core as `Authorization: Bearer <jwt>` header

**Source**: SECURITY_BASELINE.md 3.3, GATE_48_DEV_AUTH_FLOW_LOCK.md Section 2.2

---

## 4) Forwarding Flow via CoreClient

### 4.1 Current CoreClient State

**Existing**: `modules/platform-admin/src/core-adapter/core.client.ts`

**Current Behavior**:

- Calls Core API: `GET /api/v1/organizations/:id`
- Uses `Authorization: Bearer <jwt>` header
- Includes `X-Correlation-Id` header (Suite-only)

### 4.2 Required Changes (Gate 50B)

**Modify CoreClient**:

- Accept `coreJwt` parameter in `validateOrganization()` method
- Set `Authorization: Bearer ${coreJwt}` header
- Preserve existing correlation ID logic
- Preserve existing error handling (401/403 fail-closed)

**No New Methods Required**: Existing `validateOrganization()` is sufficient for Gate 50B scope

---

## 5) Error Mapping (401/403/5xx)

### 5.1 Authentication Failures (401/403)

**MUST**: On 401/403 from Core → deny immediately, no retry  
**MUST**: Return safe error to UI: "Unauthorized access. Please contact your administrator."  
**MUST NOT**: Expose Core error details, stack traces, or JWT

**Source**: INTEGRATION_CONTRACT_CORE.md Section 7.1, GATE_48_DEV_AUTH_FLOW_LOCK.md Section 7.1

### 5.2 Server Errors (5xx)

**MUST**: Retry on transient errors (5xx, network timeout) with bounded retries (max 3)  
**MUST**: Use exponential backoff (1s, 2s, 4s)  
**MUST NOT**: Retry on 401/403

**Source**: INTEGRATION_CONTRACT_CORE.md Section 7.1

### 5.3 Error Logging

**MUST Log**:

- Core API call (endpoint, method, status code, duration)
- Correlation ID
- Tenant context (organizationId from JWT claim)
- Error reason (safe, no JWT)

**MUST NOT Log**:

- Core JWT
- Authorization headers
- PII

**Source**: SECURITY_BASELINE.md 4.7, GATE_48_DEV_AUTH_FLOW_LOCK.md Section 6.2

---

## 6) Fail-Closed Behavior Definition

### 6.1 Missing Core JWT

**Condition**: Suite session valid, but no Core JWT found in server storage

**Action**: Return 401 Unauthorized with safe error message

**Rationale**: Fail-closed on missing auth material

### 6.2 Invalid/Expired Core JWT

**Condition**: Core returns 401/403

**Action**: Return 401/403 to UI immediately, no retry

**Rationale**: Core v1 has no refresh mechanism (INTEGRATION_CONTRACT_CORE.md 5.1)

### 6.3 Ambiguous Tenant Mapping

**Condition**: Suite orgId has no Core orgId mapping

**Action**: Return 403 Forbidden with safe error message

**Rationale**: Fail-closed on tenant mapping ambiguity (INTEGRATION_CONTRACT_CORE.md 4.2)

---

## 7) Logging Discipline

**MUST Log**:

- Core API call metadata (endpoint, status, duration, correlation ID)
- Tenant context (organizationId from JWT claim)
- Authentication failures (401/403, no JWT)

**MUST NOT Log**:

- Core JWT value
- Authorization header value
- Passwords or credentials
- PII (unless explicitly approved)

**Source**: SECURITY_BASELINE.md 4.7, INTEGRATION_CONTRACT_CORE.md 8.2

---

## 8) Correlation ID Propagation

**MUST**: Preserve existing correlation ID flow from Gate 48/49

**Flow**:

1. UI generates correlation ID (or BFF generates if missing)
2. BFF includes `X-Correlation-Id` header in Core API calls
3. BFF logs correlation ID in all log entries

**Note**: Core v1 does NOT guarantee echo/logging of correlation ID (INTEGRATION_CONTRACT_CORE.md 8.1)

---

## 9) Out-of-Scope Declarations

**NOT AUTHORIZED in Gate 50**:

- Implementing token refresh (NOT AVAILABLE in Core v1)
- Implementing service tokens (NOT AVAILABLE in Core v1)
- Modifying Core (Core is immutable, ARCHITECTURAL_LAWS.md LAW-2)
- Adding dependencies (package.json/package-lock.json changes)
- Exposing Core JWT to UI (forbidden, SECURITY_BASELINE.md 3.3)
- Implementing retry on 401/403 (forbidden, INTEGRATION_CONTRACT_CORE.md 7.1)
- Storing Core JWT in cookies/localStorage (forbidden, GATE_48_DEV_AUTH_FLOW_LOCK.md 2.2)

---

## 10) NOT AVAILABLE (Core v1 Limitations)

Per INTEGRATION_CONTRACT_CORE.md Section 5.1, 12.2:

- ❌ Service-to-service authentication
- ❌ Core service tokens
- ❌ OAuth2 client credentials flow
- ❌ Token refresh mechanism
- ❌ Core-issued refresh tokens

**Implication**: Any 401 from Core is fail-closed. No automatic token refresh exists.

---

## 11) Implementation Breakdown (Gate 50B)

### Phase 1: JWT Storage Service

**Files to Create**:

- `src/auth/jwt-storage.service.ts` — In-memory Map<userId, coreJwt>

**Responsibilities**:

- Store Core JWT by userId (server-side only)
- Retrieve Core JWT by userId
- Clear JWT on logout

### Phase 2: CoreClient Modification

**Files to Modify**:

- `src/core-adapter/core.client.ts`

**Changes**:

- Add `coreJwt` parameter to `validateOrganization()` method
- Set `Authorization: Bearer ${coreJwt}` header
- Preserve existing error handling (401/403 fail-closed)
- Preserve correlation ID logic

### Phase 3: Integration with SessionGuard

**Files to Modify**:

- `src/auth/session.guard.ts` (or create new guard)

**Changes**:

- Extract userId from Suite session
- Retrieve Core JWT from JwtStorageService
- Attach Core JWT to request context (server-side only, NOT to response)
- Fail-closed if Core JWT missing

### Phase 4: Tests

**Files to Create**:

- `tests/unit/auth/jwt-storage.service.spec.ts`
- Update `tests/unit/core-adapter/core.client.spec.ts` (add JWT forwarding tests)

**Coverage**:

- JWT storage/retrieval
- CoreClient JWT forwarding
- 401/403 fail-closed behavior
- Negative tests (missing JWT, expired JWT)

---

## 12) Verification Plan (Gate 50B)

### V1 — TypeScript Compilation

**Command**:

```bash
npx tsc -p modules/platform-admin/tsconfig.bff.json
```

**Expected**: Exit code 0, no errors

### V2 — Unit Tests

**Command**:

```bash
npx jest -c jest.config.cjs modules/platform-admin/tests/unit
```

**Expected**: All tests pass, including new JWT forwarding tests

### V3 — Runtime Smoke Test

**Prerequisites**:

- Gate 49B session implementation active
- Core JWT manually stored in JwtStorageService (for testing)

**Steps**:

1. Login to Suite (issue Suite session cookie)
2. Call protected endpoint that requires Core validation
3. Verify Core API called with `Authorization: Bearer <jwt>` header
4. Verify 401/403 fail-closed behavior

**Expected**:

- Core API called with correct JWT header
- 401/403 returned to UI on auth failure (no retry)
- No JWT exposed to UI

---

## 13) Evidence Requirements (Gate 50B)

**MUST provide**:

1. `git diff --name-only` output (only allowed files)
2. `git diff` output (verify no forbidden changes)
3. `npx tsc` build log (exit code 0)
4. `npm run test:platform-admin:unit` output (all pass)
5. Runtime smoke test outputs (Core API call logs showing JWT header, no UI exposure)

**MUST NOT show**:

- Dependency changes
- Core modifications
- UI JWT exposure
- Files outside allowlist

---

## 14) Risk Controls

### JWT Leakage Prevention

**Control**: Server-side storage only (Map in BFF memory)  
**Verification**: Code review + tests verify no JWT in response/cookies/localStorage

### 401/403 Retry Prevention

**Control**: Explicit no-retry logic on 401/403  
**Verification**: Unit tests verify no retry on auth failures

### Correlation ID Preservation

**Control**: Existing correlation ID logic preserved  
**Verification**: Tests verify correlation ID included in Core API calls

---

## 15) Clear Statement

**Gate 50A produces plan + authorization ONLY.**

**Gate 50B is REQUIRED for code implementation.**

No implementation is authorized in Gate 50A. All code changes require explicit Gate 50B authorization with approved file allowlist.

---

## 16) Signature

**Approved By**: Governance Authority  
**Date**: 2026-02-12  
**Status**: FINAL — PLAN APPROVED (50A DOCS-ONLY)
