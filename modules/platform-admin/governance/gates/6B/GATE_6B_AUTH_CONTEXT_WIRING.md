# Gate 6B — Auth Context Wiring

## Platform Admin Module

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Gate Number    | 6B                                      |
| Gate Name      | Auth Context Wiring                     |
| Document Title | GATE_6B_AUTH_CONTEXT_WIRING             |
| Repo           | Suite (Layer / Product Repo)            |
| Module         | platform-admin                          |
| Status         | FINAL — PLAN                            |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-02-12                              |
| Risk Level     | P1 (Critical Security)                  |

---

## 1) Executive Summary

**Goal**: Populate `request.user` from JWT without introducing implicit authentication or weakening fail-closed architecture

**Scope**: JWT-to-user adapter, guard chain ordering, explicit wiring

**Risk**: P1 (Critical Security) — Authentication bypass, implicit wiring, magic injection

**Preservation**: Global `DenyAllGuard` active, explicit session validation, fail-closed on missing JWT

**Blocker**: JWT claim structure must be proven before execution

---

## 2) Architectural Context

**Current State** (Post-Gate 6A):

- `SessionGuard` validates session, retrieves JWT
- JWT stored in `JwtStorageService` (server-side)
- `request.user` NOT populated
- `RbacGuard` depends on `request.user` (currently undefined)

**Target State**:

- `SessionGuard` validates session, retrieves JWT, **populates `request.user`**
- `request.user` structure: Minimal proven fields only
- `RbacGuard` can access `request.user` for permission validation
- Fail-closed on missing/invalid JWT

---

## 3) Preconditions (MUST BE VERIFIED BEFORE EXECUTION)

### 3.1 JWT Claim Structure Proof Required

**Requirement**: JWT payload fields must be proven by Core contract or existing evidence

**Verification Sources**:

- Core contract extract in governance
- Existing implementation evidence
- Integration test evidence

**Minimum Proven Claim**: `sub` (user ID)

**If Additional Claims Needed**: Must be proven before execution

**Action**: STOP execution of Gate 6B until JWT claims are proven

---

### 3.2 request.user Structure

**Minimal Structure** (if only `sub` proven):

```typescript
interface RequestUser {
  userId: string; // from JWT.sub
}
```

**Extended Structure** (if additional claims proven):

- Add fields ONLY if proven by contract/evidence
- Example: `organizationId` (if proven), `roles` (if proven)

**Forbidden**: Inventing fields not proven by contract

---

## 4) Risk Classification

**Risk Level**: P1 (Critical Security)

**Risks**:

- Authentication bypass if `request.user` populated without validation
- Implicit wiring introducing magic injection
- JWT extraction failure not caught
- `request.user` structure mismatch

**Mitigation**:

- Explicit JWT extraction in `SessionGuard`
- Fail-closed on missing/invalid JWT
- Strict `request.user` structure validation
- No magic injection, no auto-discovery

---

## 5) request.user Lifecycle

### 5.1 Request Flow (Conceptual)

```
1. Request arrives
2. Cookie parser extracts session cookie
3. SessionGuard.canActivate() called
4. SessionGuard validates session
5. SessionGuard retrieves JWT from JwtStorageService
6. SessionGuard extracts proven claims from JWT
7. SessionGuard populates request.user with proven fields only
8. RbacGuard.canActivate() called (if applicable)
9. RbacGuard validates permissions using request.user
10. Controller executes
```

---

### 5.2 Fail-Closed Points

**Point 1**: No session cookie → 401 (existing)

**Point 2**: Invalid/expired session → 401 (existing)

**Point 3**: No JWT in session → 401 (existing)

**Point 4**: JWT extraction fails → 401 (NEW)

**Point 5**: `request.user` structure invalid → 401 (NEW)

**Point 6**: RBAC validation fails → 403 (existing)

---

## 6) JWT/Session Extraction Model

### 6.1 JWT Payload (Opaque Unless Proven)

**Approach**: Treat JWT payload as opaque except proven fields

**Proven Fields** (minimum):

- `sub`: User ID (standard JWT claim)

**Unproven Fields** (require proof before use):

- `organizationId`: Tenant context (NOT PROVEN)
- `roles`: User roles (NOT PROVEN)
- Other custom claims (NOT PROVEN)

**Action**: Verify Core contract or existing evidence for additional claims

---

### 6.2 request.user Structure (Minimal)

**Minimal Structure**:

```typescript
interface RequestUser {
  userId: string; // from JWT.sub
}
```

**Policy**: Add fields ONLY if proven by governance evidence

---

## 7) Guard Chain Ordering

### 7.1 Global Guard

**Guard**: `DenyAllGuard`

**Order**: 1 (first)

**Behavior**: Deny all requests by default

---

### 7.2 Explicit Allow Guard

**Guard**: `ExplicitAllowGuard`

**Order**: 2 (after DenyAllGuard)

**Behavior**: Allow specific routes (4 usages: Health + Auth)

---

### 7.3 Session Guard

**Guard**: `SessionGuard`

**Order**: 3 (after ExplicitAllowGuard)

**Behavior**: Validate session, retrieve JWT, **populate request.user**

---

### 7.4 RBAC Guard

**Guard**: `RbacGuard`

**Order**: 4 (after SessionGuard)

**Behavior**: Validate permissions using `request.user`

---

## 8) 401 vs 403 Semantics

### 8.1 401 Unauthorized

**Trigger**:

- No session cookie
- Invalid/expired session
- No JWT in session
- JWT extraction fails
- `request.user` structure invalid

**Response**: `{ "statusCode": 401, "message": "Unauthorized access. Please contact your administrator." }`

**Action**: Client should redirect to login

---

### 8.2 403 Forbidden

**Trigger**:

- Session valid, JWT valid, but insufficient permissions
- RBAC validation fails

**Response**: `{ "statusCode": 403, "message": "Forbidden. Insufficient permissions." }`

**Action**: Client should show "Access Denied" message

---

## 9) No Implicit Wiring

**Forbidden**:

- Auto-discovery of auth middleware
- Magic injection of `request.user`
- Implicit session validation
- Global middleware that auto-populates `request.user`

**Required**:

- Explicit `SessionGuard` on protected routes
- Explicit JWT extraction in `SessionGuard.canActivate()`
- Explicit `request.user` population in `SessionGuard`

---

## 10) No Magic Injection

**Forbidden**:

- `@CurrentUser()` decorator that auto-injects `request.user`
- Global interceptor that auto-populates `request.user`
- Passport.js or similar auto-discovery frameworks

**Required**:

- Manual `request.user` access in controllers
- Explicit guard chain ordering

---

## 11) No Auth Assumptions

**Forbidden**:

- Assume `request.user` always populated
- Assume JWT always valid
- Assume session always present

**Required**:

- Fail-closed on missing `request.user`
- Fail-closed on missing JWT
- Fail-closed on missing session

---

## 12) Required Verification Tests (Without Modifying Current Tests)

### 12.1 New Tests to Add

**File**: `modules/platform-admin/tests/unit/auth/session.guard.spec.ts`

**Tests**:

1. `should populate request.user from valid JWT`
2. `should throw 401 if JWT extraction fails`
3. `should throw 401 if request.user structure invalid`
4. `should include userId in request.user`

**Total New Tests**: +4 (minimum, more if additional claims proven)

---

### 12.2 Existing Tests to Preserve

**File**: `modules/platform-admin/tests/unit/auth/session.guard.spec.ts`

**Existing Tests**: 8 tests (from Gate 51A)

**Modification**: NONE (no existing tests modified)

---

## 13) Allowed File List

**ONLY** these files may be modified:

```
modules/platform-admin/src/auth/session.guard.ts
modules/platform-admin/tests/unit/auth/session.guard.spec.ts
modules/platform-admin/governance/GATE_6B_AUTH_CONTEXT_WIRING.md
modules/platform-admin/governance/GATE_6B_EXECUTION_REPORT.md
modules/platform-admin/governance/GATE_6B_VERIFICATION_EVIDENCE.md
```

**Total**: 1 production file, 1 test file, 3 governance files

---

## 14) Explicit Forbidden List

**MUST NOT** modify:

- `platform-admin.module.ts`
- `deny-all.guard.ts`
- `explicit-allow.guard.ts`
- `rbac.guard.ts`
- Any controller files
- Any service files
- `package.json` or `package-lock.json`
- Prisma schema

**MUST NOT**:

- Disable `DenyAllGuard`
- Add new controllers
- Add new routes
- Expand `ExplicitAllowGuard` usage
- Introduce global middleware for `request.user`

---

## 15) Acceptance Criteria

### 15.1 request.user Populated

**Requirement**: `SessionGuard` populates `request.user` from JWT with proven fields only

**Verification**: New test in `session.guard.spec.ts`

---

### 15.2 Fail-Closed on JWT Extraction Failure

**Requirement**: `SessionGuard` throws 401 if JWT extraction fails

**Verification**: New test in `session.guard.spec.ts`

---

### 15.3 request.user Structure Valid

**Requirement**: `request.user` includes only proven fields (minimum: `userId`)

**Verification**: New test in `session.guard.spec.ts`

---

### 15.4 All Tests Pass

**Requirement**: 26/26 suites, 225+ tests (existing 221 + new 4 minimum)

**Verification**: Use commands from `RELEASE_QUALIFICATION_MATRIX_V2.md`

**Primary Command**: `npm test`

---

## 16) Verification Commands

**Pre-Flight**:

```bash
git status --porcelain
git diff --name-only
npm test
```

**Post-Execution**:

```bash
git diff --name-only
npm test
git diff package.json
git diff package-lock.json
```

**Expected**:

- `git diff --name-only`: ONLY 5 files (1 prod, 1 test, 3 governance)
- `npm test`: All tests pass (26/26 suites minimum, 225+ tests)
- `git diff package.json`: Empty
- `git diff package-lock.json`: Empty

**Note**: Use commands exactly as listed in `RELEASE_QUALIFICATION_MATRIX_V2.md`

---

## 17) Failure Conditions

**STOP if**:

- JWT claim structure not proven
- Any test fails
- Dependency changes detected
- Files outside allowlist modified
- `DenyAllGuard` disabled or weakened
- Controller count changes
- `ExplicitAllowGuard` usage count changes
- `request.user` populated without JWT validation

**Action**: Rollback all changes, report failure

---

## 18) Rollback Strategy

**If failure detected**:

1. `git reset --hard HEAD`
2. Verify clean working tree: `git status --porcelain`
3. Verify tests pass: `npm test`
4. Report failure with error details

**No partial commits**: All changes must pass verification before commit

---

## 19) Governance Compliance Statement

This gate complies with:

- `ARCHITECTURAL_LAWS.md` (Fail-closed by default, no implicit auth)
- `SECURITY_BASELINE.md` (Server-only tokens, no secrets in logs)
- `modules/platform-admin/governance/PRODUCTION_READINESS_BASELINE_V2.md` (Session layer preservation)
- `modules/platform-admin/governance/MODULE_SCOPE_LOCK.md` (No scope expansion)
- `modules/platform-admin/governance/STAGE_6_RUNTIME_STRATEGY.md` (Auth context lifecycle strategy)

**Preservation Guarantees**:

- Global `DenyAllGuard` active
- No implicit authentication
- No magic injection
- Fail-closed on missing/invalid JWT
- Explicit guard chain ordering

---

## 20) Detected Conflicts (Must Resolve Before Execution)

### Conflict 1: JWT Claim Structure Unknown

**Issue**: Cannot populate `request.user` without knowing JWT claim structure

**Resolution Required**: Prove JWT claim structure from Core contract or existing evidence

**Minimum Requirement**: Prove `sub` claim exists

**Additional Claims**: Prove `organizationId`, `roles`, etc. if needed for RBAC

---

## 21) Signature

**Approved By**: Governance Authority  
**Date**: 2026-02-12  
**Status**: FINAL — PLAN  
**Risk Level**: P1 (Critical Security)
