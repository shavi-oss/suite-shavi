# Gate 7 — Execution Checklist

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Module Name    | platform-admin                          |
| Document Title | GATE_7_CHECKLIST                        |
| Repo           | Suite (Layer / Product Repo)            |
| Status         | DRAFT — AWAITING APPROVAL               |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-02-07                              |

---

## 1) Preflight Checklist

**MUST verify** before starting Gate 7 execution:

- [ ] Working tree is clean (`git status --porcelain` returns empty)
- [ ] Current branch is correct (`git rev-parse --abbrev-ref HEAD`)
- [ ] Previous gates (Gate 4, Gate 5) are closed and tagged
- [ ] Binding sources are accessible and reviewed:
  - [ ] `MODULE_SECURITY_LAWS.md`
  - [ ] `MODULE_SCOPE_LOCK.md`
  - [ ] `IMPLEMENTATION_PLAN_PLATFORM_ADMIN.md`
  - [ ] `ARCHITECTURAL_LAWS.md`
  - [ ] `SECURITY_BASELINE.md`
- [ ] `GATE_7_AUTHORIZATION.md` approved by Governance Authority

**Evidence**: `EXECUTION_AUTHORITY.md`, `GATE_7_AUTHORIZATION.md`

---

## 2) Implementation Checklist

### 2.1 Correlation ID

- [ ] Correlation ID extracted from `x-correlation-id` header
- [ ] Server-side generation if header missing (using `randomUUID()`)
- [ ] Correlation ID validated (no secrets, no PII, safe format)
- [ ] Correlation ID propagated to all layers (controller → service → repository → audit)
- [ ] Correlation ID included in all audit records
- [ ] Correlation ID consistency enforced (same ID throughout request)

**Evidence**: `MODULE_SECURITY_LAWS.md` Section 3.4

---

### 2.2 Audit Logging

- [ ] Audit service implements append-only writes
- [ ] Audit repository enforces immutability (no updates/deletes)
- [ ] All WRITE operations create audit logs:
  - [ ] Organization create/suspend/unsuspend
  - [ ] Org mapping link
  - [ ] Internal user create/deactivate
- [ ] Audit records include all required fields:
  - [ ] `correlationId`
  - [ ] `entityType`
  - [ ] `entityId`
  - [ ] `action`
  - [ ] `performedBy`
  - [ ] `performedAt`
  - [ ] `result`
  - [ ] `metadata`
- [ ] Metadata validation (no forbidden keys: token, password, secret, dbUrl)
- [ ] No secrets in audit logs (tokens, passwords, JWTs, DB credentials)
- [ ] No PII in audit logs (use user IDs, not names/emails)

**Evidence**: `MODULE_SECURITY_LAWS.md` Section 3.4

---

### 2.3 Fail-Closed Behavior

- [ ] Audit write failure for administrative actions → operation denied
- [ ] Safe error messages (no internal details exposed to client)
- [ ] Server-side logging of audit failures (safe, no secrets)

**Evidence**: `MODULE_SECURITY_LAWS.md` Section 3.4, `ARCHITECTURAL_LAWS.md` LAW-10

---

## 3) Test Checklist

### 3.1 Unit Tests

- [ ] Correlation ID extraction (header present)
- [ ] Correlation ID generation (header missing)
- [ ] Correlation ID validation (malformed input rejected)
- [ ] Audit service success path
- [ ] Audit service failure path (database error)
- [ ] Audit repository create operation
- [ ] Audit repository immutability enforcement
- [ ] Metadata validation (forbidden keys rejected)

**Evidence**: `GATE_7_PLAN.md` Section 4

---

### 3.2 Integration Tests

- [ ] End-to-end correlation ID propagation (controller → audit)
- [ ] Audit logging on organization create
- [ ] Audit logging on organization suspend
- [ ] Audit logging on org mapping link
- [ ] Audit logging on internal user deactivate

**Evidence**: `GATE_7_PLAN.md` Section 4

---

### 3.3 Negative Tests

- [ ] Audit write failure → operation denied (administrative action)
- [ ] Missing correlation ID → operation rejected
- [ ] Forbidden metadata keys → validation error
- [ ] Secrets in metadata → validation error

**Evidence**: `MODULE_SECURITY_LAWS.md` Section 3.4, `SECURITY_BASELINE.md`

---

## 4) Evidence Checklist

### 4.1 Git Boundaries

- [ ] `git diff --name-only` shows only `modules/platform-admin/**` files
- [ ] No changes to Prisma schema or migrations
- [ ] No changes to `package.json` or `package-lock.json`
- [ ] No changes to Core integration contract
- [ ] No changes outside module scope

**Evidence**: `GATE_7_AUTHORIZATION.md` Section 3

---

### 4.2 Logs Redaction

- [ ] Manual code review: no secrets in audit logs
- [ ] Manual code review: no tokens in audit metadata
- [ ] Manual code review: no passwords in audit logs
- [ ] Manual code review: no DB credentials in audit logs
- [ ] Manual code review: no PII in audit logs (user IDs only)

**Evidence**: `MODULE_SECURITY_LAWS.md` Section 3.4, `SECURITY_BASELINE.md`

---

### 4.3 PII / Secret Leakage Verification — MUST PASS

**CRITICAL**: Verify NO PII or secrets in audit metadata/logs/client errors.

**Verification Commands** (PowerShell-safe):

```powershell
# 1. Verify no raw error.message in src code (comments OK)
git grep -n "error\.message" modules/platform-admin/src

# Expected: Only comments or safe redaction helpers, NO usage in logs/audit/exceptions

# 2. Verify correlationId present in all audit calls
git grep -n "logAction" modules/platform-admin/src

# Expected: All calls include correlationId parameter

# 3. Manual inspection: Check audit metadata does NOT contain email/name/role
# Inspect these files for metadata field values:
# - modules/platform-admin/src/internal-users/internal-user.service.ts
# - modules/platform-admin/src/org-mapping/org-mapping.service.ts
# - modules/platform-admin/src/organizations/organization.service.ts
# - modules/platform-admin/src/audit/audit.service.ts

# Expected: metadata contains ONLY IDs (entityId, userId, orgId), NO email/name/role
```

**STOP Clarification**:

- **NOT a violation**: Presence of `email`/`name` in DTO definitions, repository methods, or response objects
- **IS a violation**: `email`/`name` appearing in:
  - Audit metadata payloads (e.g., `metadata: { email: ... }`)
  - Structured log objects (e.g., `logger.error({ email: ... })`)
  - Client-facing exception messages (e.g., `throw new Error(\`Email ${email} ...\`)`)

**Action if ambiguous**: STOP → Request file/line evidence → Verify context

**Evidence**: `MODULE_SECURITY_LAWS.md` Section 3.4, `SECURITY_BASELINE.md`

---

### 4.4 Pass Criteria

- [ ] `npx tsc --noEmit` → Zero errors
- [ ] `npx jest --config jest.config.cjs` → 100% pass rate
- [ ] All STOP conditions verified (no violations)
- [ ] Code review completed (no forbidden patterns)
- [ ] Documentation updated (if needed)
- [ ] PII/Secret leakage verification passed (Section 4.3)

**Evidence**: `GATE_7_PLAN.md` Section 5

---

## 5) Close Criteria

**Gate 7 is CLOSED when**:

1. All implementation checklist items complete
2. All test checklist items complete
3. All evidence checklist items complete
4. TypeScript compilation passes
5. All tests pass (100% pass rate)
6. Git diff boundaries verified (only `modules/platform-admin/**`)
7. Code review completed (no STOP violations)
8. PII/Secret leakage verification passed
9. Single commit created with proper message
10. Governance Authority approval obtained
11. Git tag created: `suite-platform-admin-gate-7`

**Evidence**: `GATE_7_AUTHORIZATION.md` Section 8

---

## 6) Signature

**Approved By**: [PENDING GOVERNANCE AUTHORITY APPROVAL]  
**Date**: [PENDING]  
**Status**: DRAFT — AWAITING APPROVAL
