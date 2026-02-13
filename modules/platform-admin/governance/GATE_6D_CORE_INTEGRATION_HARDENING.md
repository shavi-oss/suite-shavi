# Gate 6D — Core Integration Hardening

## Platform Admin Module

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Gate Number    | 6D                                      |
| Gate Name      | Core Integration Hardening              |
| Document Title | GATE_6D_CORE_INTEGRATION_HARDENING      |
| Repo           | Suite (Layer / Product Repo)            |
| Module         | platform-admin                          |
| Status         | FINAL — PLAN                            |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-02-12                              |
| Risk Level     | P1 (Critical Security)                  |

---

## 1) Executive Summary

**Goal**: Harden Core integration to prevent token leakage, enforce correlation ID, and ensure audit invariants

**Scope**: Correlation ID enforcement, JWT forwarding boundaries, env gating strictness, audit invariants

**Risk**: P1 (Critical Security) — Token leakage, correlation ID bypass, audit drift

**Preservation**: Server-only JWT storage, no JWT logging, fail-closed on missing correlation ID

---

## 2) Architectural Context

**Current State** (Post-Gates 50B, 51A, 51B, 51C):

- Core JWT stored server-side (in-memory)
- JWT forwarded as `Authorization: Bearer <jwt>`
- Correlation ID required for Core API calls
- Correlation ID assertion enforced (fail-closed on missing/empty)
- No JWT logging

**Target State**:

- All existing invariants preserved
- Additional hardening: env gating strictness, audit invariants enforcement
- Integration failure handling model defined

---

## 3) Risk Classification

**Risk Level**: P1 (Critical Security)

**Risks**:

- Token leakage (JWT exposed to client or logs)
- Correlation ID bypass (missing/empty correlation ID not caught)
- Audit drift (audit logs missing correlation ID or tenant context)
- Integration failure not handled gracefully

**Mitigation**:

- Server-only JWT storage (existing)
- No JWT logging (existing)
- Fail-closed on missing correlation ID (existing)
- Audit invariants enforcement (new)
- Integration failure handling model (new)

---

## 4) Correlation ID Enforcement Model

### 4.1 Current State (Gate 51B)

**Enforced**: Correlation ID required for all Core API calls

**Fail-Closed**: Missing/empty/whitespace correlation ID → Error

**Verification**: Existing tests in `core.client.spec.ts`

---

### 4.2 Hardening (Gate 6D)

**Additional Enforcement**:

- Correlation ID format validation (UUID v4 recommended, not required)
- Correlation ID propagation to audit logs
- Correlation ID in error responses (safe, no JWT)

**Verification**: New tests in `core.client.spec.ts`

---

## 5) JWT Forwarding Boundaries

### 5.1 Current State (Gates 50B, 51A, 51B)

**Server-Side Storage**: Core JWT stored in-memory via `JwtStorageService`

**Bearer Token**: JWT forwarded as `Authorization: Bearer <jwt>`

**No Logging**: JWT never logged

**Verification**: Existing tests in `core.client.spec.ts`, `jwt-storage.service.spec.ts`

---

### 5.2 Hardening (Gate 6D)

**Additional Boundaries**:

- JWT never in error responses
- JWT never in audit logs
- JWT never in client-side storage
- JWT never in URL parameters

**Verification**: Code review + manual audit

---

## 6) Env Gating Strictness

### 6.1 Current State (Gate 6A)

**Required Env Vars**:

- `CORE_API_BASE_URL`: Base URL for Core API

**Fail-Closed**: Missing env var → Error on startup

---

### 6.2 Hardening (Gate 6D)

**Additional Env Vars**:

- `DATABASE_URL`: Prisma database connection string
- `SESSION_SECRET`: Secret for session signing

**Fail-Closed**: Missing env var → Error on startup

**No Defaults**: No default values for production env vars

**Verification**: Startup validation test or manual verification

---

## 7) Token Leakage Prevention Rules

### 7.1 Rule 1: No JWT in Logs

**Enforcement**: Code review + manual audit

**Verification**: Search codebase for logging statements with JWT

**Forbidden**: Logging JWT in any form

---

### 7.2 Rule 2: No JWT in Error Responses

**Enforcement**: Code review + manual audit

**Verification**: Review error handling code

**Forbidden**: Including JWT in error messages or responses

---

### 7.3 Rule 3: No JWT in Client-Side Storage

**Enforcement**: Code review + manual audit

**Verification**: Review client-side code (if applicable)

**Forbidden**: Storing JWT in localStorage, sessionStorage, cookies (client-side)

---

### 7.4 Rule 4: No JWT in URL Parameters

**Enforcement**: Code review + manual audit

**Verification**: Review URL construction code

**Forbidden**: Including JWT in query parameters or path

---

## 8) Audit Invariants Enforcement

### 8.1 Audit Log Structure (Policy-Level)

**Required Fields**:

- `correlationId`: REQUIRED
- `organizationId`: REQUIRED (tenant context, if proven in JWT)
- `userId`: REQUIRED (if proven in JWT)
- `entityType`: REQUIRED
- `action`: REQUIRED
- `entityId`: REQUIRED
- `timestamp`: REQUIRED

**Forbidden Fields**:

- JWT
- Session ID
- Passwords
- Secrets

---

### 8.2 Invariants

**Invariant 1**: Every audit log MUST include `correlationId`

**Invariant 2**: Every audit log MUST include tenant context (if available)

**Invariant 3**: Every audit log MUST include user context (if available)

**Invariant 4**: Audit logs MUST NOT include JWT or session ID

**Verification**: Existing tests in `audit.service.spec.ts`

---

## 9) Integration Failure Handling Model

### 9.1 Failure Scenarios

**Scenario 1**: Core API unreachable

**Response**: 503 Service Unavailable

**Action**: Log error (no JWT), return safe error message

---

**Scenario 2**: Core API returns 401 (Unauthorized)

**Response**: 401 Unauthorized

**Action**: Clear session, return safe error message

---

**Scenario 3**: Core API returns 403 (Forbidden)

**Response**: 403 Forbidden

**Action**: Log error (no JWT), return safe error message

---

**Scenario 4**: Core API returns 500 (Internal Server Error)

**Response**: 500 Internal Server Error

**Action**: Log error (no JWT), return safe error message

---

### 9.2 Safe Error Messages

**Forbidden**: Exposing internal details, stack traces, JWT, session ID

**Required**: Generic error messages

**Examples**:

- `"Service temporarily unavailable. Please try again later."`
- `"Unauthorized access. Please contact your administrator."`
- `"Forbidden. Insufficient permissions."`
- `"An error occurred. Please contact support."`

---

## 10) Allowed File List

**ONLY** these files may be modified:

```
modules/platform-admin/src/core-adapter/core.client.ts
modules/platform-admin/src/main.ts
modules/platform-admin/tests/unit/core-adapter/core.client.spec.ts
modules/platform-admin/governance/GATE_6D_CORE_INTEGRATION_HARDENING.md
modules/platform-admin/governance/GATE_6D_EXECUTION_REPORT.md
modules/platform-admin/governance/GATE_6D_VERIFICATION_EVIDENCE.md
```

**Total**: 2 production files, 1 test file, 3 governance files

---

## 11) Explicit Forbidden List

**MUST NOT** modify:

- `platform-admin.module.ts`
- Any guard files
- Any controller files
- Any service files (except `core.client.ts`)
- `package.json` or `package-lock.json`
- Prisma schema

**MUST NOT**:

- Disable `DenyAllGuard`
- Add new controllers
- Add new routes
- Expand `ExplicitAllowGuard` usage
- Log JWT or session ID

---

## 12) Acceptance Criteria

### 12.1 Correlation ID Format Validation

**Requirement**: Correlation ID validated (format check recommended, not required)

**Verification**: New test in `core.client.spec.ts`

---

### 12.2 Env Gating Strictness

**Requirement**: Missing env vars → Error on startup

**Verification**: Startup validation test or manual verification

---

### 12.3 No JWT in Logs/Errors

**Requirement**: JWT never logged or included in error responses

**Verification**: Code review + manual audit

---

### 12.4 All Tests Pass

**Requirement**: 26/26 suites, 229+ tests (existing 228 + new 1 minimum)

**Verification**: Use commands from `RELEASE_QUALIFICATION_MATRIX_V2.md`

**Primary Command**: `npm test`

---

## 13) Verification Commands

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
grep -r "logger.*jwt" modules/platform-admin/src/ || echo "No JWT logging found"
grep -r "console.*jwt" modules/platform-admin/src/ || echo "No JWT logging found"
```

**Expected**:

- `git diff --name-only`: ONLY 6 files (2 prod, 1 test, 3 governance)
- `npm test`: All tests pass (26/26 suites minimum, 229+ tests)
- `git diff package.json`: Empty
- `git diff package-lock.json`: Empty
- `grep` commands: No matches (no JWT logging)

**Note**: Use commands exactly as listed in `RELEASE_QUALIFICATION_MATRIX_V2.md`

---

## 14) Failure Conditions

**STOP if**:

- Any test fails
- Dependency changes detected
- Files outside allowlist modified
- JWT found in logs or error responses
- Correlation ID validation bypassed

**Action**: Rollback all changes, report failure

---

## 15) Rollback Strategy

**If failure detected**:

1. `git reset --hard HEAD`
2. Verify clean working tree: `git status --porcelain`
3. Verify tests pass: `npm test`
4. Report failure with error details

**No partial commits**: All changes must pass verification before commit

---

## 16) Governance Compliance Statement

This gate complies with:

- `ARCHITECTURAL_LAWS.md` (Fail-closed by default, Core black box)
- `SECURITY_BASELINE.md` (No secrets in logs, server-only tokens)
- `modules/platform-admin/governance/PRODUCTION_READINESS_BASELINE_V2.md` (Correlation ID assertion, JWT forwarding)
- `modules/platform-admin/governance/INTEGRATION_CONTRACT_CORE.md` (Core v1 contract)
- `modules/platform-admin/governance/STAGE_6_RUNTIME_STRATEGY.md` (Core integration hardening philosophy)

**Preservation Guarantees**:

- Server-only JWT storage
- No JWT logging
- Fail-closed on missing correlation ID
- Audit invariants enforced
- Safe error messages

---

## 17) Signature

**Approved By**: Governance Authority  
**Date**: 2026-02-12  
**Status**: FINAL — PLAN  
**Risk Level**: P1 (Critical Security)
