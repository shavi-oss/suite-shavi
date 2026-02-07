# Gate 7 — Audit & Correlation Implementation Plan

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Module Name    | platform-admin                          |
| Document Title | GATE_7_PLAN                             |
| Repo           | Suite (Layer / Product Repo)            |
| Status         | PLAN ONLY — NOT STARTED                 |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-02-07                              |

---

## 1) Purpose

Gate 7 implements append-only audit logging and correlation ID propagation for the platform-admin module. This gate enforces fail-closed traceability for all administrative WRITE operations, ensures correlation IDs are present and propagated end-to-end within platform-admin BFF boundaries, and implements append-only audit logging with mandatory writes for all WRITE operations. Audit write failures must cause operation denial (fail-closed). No secrets, tokens, or PII may be logged. This gate does NOT implement RBAC, authentication, or authorization logic.

**Evidence**: `MODULE_SECURITY_LAWS.md` Section 3.4, `ARCHITECTURAL_LAWS.md` LAW-10

---

## 2) In-Scope

**Code Implementation**:

- Correlation ID extraction from `x-correlation-id` header or server-side generation
- Correlation ID propagation through controller → service → repository → audit layers
- Audit service implementation for append-only log writes
- Audit repository implementation with fail-closed behavior
- Integration of audit logging into all WRITE operations (create, update, suspend, unsuspend, link, deactivate)
- Metadata validation (no secrets, no forbidden keys)
- PII redaction from audit metadata (use IDs only, no email/name/role)
- Safe error messages (no raw error.message in logs/audit/client responses)

**Test Implementation**:

- Unit tests for correlation ID extraction and generation
- Unit tests for audit service (success and failure paths)
- Unit tests for audit repository
- Integration tests for end-to-end correlation ID propagation
- Integration tests for audit logging on WRITE operations
- Negative tests for audit write failures (must deny operation)
- Negative tests for forbidden metadata content
- Negative tests for PII leakage in audit metadata

**Scope Boundaries**:

- Changes limited to `modules/platform-admin/**` only
- No Core integration changes
- No Prisma schema or migration changes
- No dependency additions

**Evidence**: `MODULE_SCOPE_LOCK.md`, `ARCHITECTURAL_LAWS.md` LAW-1

---

## 3) Out-of-Scope

**Explicitly Forbidden**:

- Any changes to Bassan.os Core or Core repositories
- Prisma schema modifications or migrations
- Adding new dependencies to package.json
- Infrastructure or CI/CD changes
- Changes outside `modules/platform-admin/**`
- New endpoints beyond `MODULE_SCOPE_LOCK.md`
- Audit log analysis or alerting features
- Audit log retention automation
- Cross-module correlation (only platform-admin)
- Dynamic audit schema changes
- Audit record updates or deletes

**Evidence**: `MODULE_SCOPE_LOCK.md`, `ARCHITECTURAL_LAWS.md` LAW-1

---

## 4) Planned Deliverables

**Code Files** (Expected paths under `modules/platform-admin/`):

- `src/audit/audit.service.ts` (if not exists; else modify)
- `src/audit/audit.repository.ts` (if not exists; else modify)
- `src/correlation/correlation.middleware.ts` (new)
- `src/correlation/correlation.service.ts` (new)
- Modifications to existing controllers to integrate audit logging
- Modifications to existing services to propagate correlationId

**Test Files** (Expected paths under `modules/platform-admin/tests/`):

- `unit/audit/audit.service.spec.ts`
- `unit/audit/audit.repository.spec.ts`
- `unit/correlation/correlation.middleware.spec.ts`
- `integration/audit/audit-flow.spec.ts`
- `integration/correlation/correlation-propagation.spec.ts`

**Note**: File paths are planned; actual existence will be verified during execution.

**Evidence**: `IMPLEMENTATION_PLAN_PLATFORM_ADMIN.md` Section 2.1

---

## 5) Verification Plan

### 5.1 TypeScript Compilation

**Command**: `npx tsc --noEmit`

**Expected**: Zero compilation errors

**Evidence**: `ARCHITECTURAL_LAWS.md` LAW-10

---

### 5.2 Test Execution

**Command**: `npx jest --config jest.config.cjs`

**Expected**: 100% pass rate for all tests

**Evidence**: `MODULE_SECURITY_LAWS.md` Section 5

---

### 5.3 Git Diff Boundaries

**Command**: `git diff --name-only`

**Expected**: Only files under `modules/platform-admin/**` modified

**Evidence**: `MODULE_SCOPE_LOCK.md`

---

### 5.4 STOP Checks

**Verify**:

- No secrets in audit logs (manual code review)
- No tokens in audit metadata (manual code review)
- Audit write failure causes operation denial (test coverage)
- CorrelationId present in all audit records (test coverage)
- Forbidden metadata keys rejected (test coverage)

**Evidence**: `MODULE_SECURITY_LAWS.md` Section 3.4, `SECURITY_BASELINE.md`

---

### 5.5 PII / Secret Leakage Verification

**Commands** (PowerShell-safe):

```powershell
# Verify no raw error.message in src code
git grep -n "error\.message" modules/platform-admin/src

# Verify correlationId in all audit calls
git grep -n "logAction" modules/platform-admin/src
```

**Manual Inspection**:

Inspect audit metadata in:

- `modules/platform-admin/src/internal-users/internal-user.service.ts`
- `modules/platform-admin/src/org-mapping/org-mapping.service.ts`
- `modules/platform-admin/src/organizations/organization.service.ts`
- `modules/platform-admin/src/audit/audit.service.ts`

**Expected**:

- Metadata contains ONLY IDs (entityId, userId, orgId)
- NO email/name/role in metadata payloads
- NO raw error.message in structured logs/audit/exceptions

**STOP Clarification**:

- **NOT a violation**: `email`/`name` in DTO/repository/response definitions
- **IS a violation**: `email`/`name` in audit metadata, logs, or client error messages

**Evidence**: `MODULE_SECURITY_LAWS.md` Section 3.4, `SECURITY_BASELINE.md`

---

## 6) Evidence References

### 6.1 Repo-Level Governance

- `ARCHITECTURAL_LAWS.md` — LAW-1 (Governance First), LAW-10 (Fail-Closed By Default)
- `SECURITY_BASELINE.md` — Safe error messages, no secrets in logs
- `EXECUTION_AUTHORITY.md` — Gate-based execution model
- `SECURITY_STOP_CONDITIONS.md` — Fail-closed enforcement

---

### 6.2 Module-Level Governance

- `MODULE_SECURITY_LAWS.md` — Section 3.4 (Audit Log Integrity), Section 3.5 (JWT Protection)
- `MODULE_SCOPE_LOCK.md` — Section 2.2 (Endpoints), Section 2.5 (RBAC Roles)
- `IMPLEMENTATION_PLAN_PLATFORM_ADMIN.md` — Section 2.1 (Audit Logging)

---

---

## 7) Signature

**Approved By**: Governance Authority  
**Date**: 2026-02-07  
**Status**: PLAN ONLY — NOT STARTED
