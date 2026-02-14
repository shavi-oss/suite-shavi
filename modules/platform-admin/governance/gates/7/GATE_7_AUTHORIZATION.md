# Gate 7 — Authorization Draft

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Module Name    | platform-admin                          |
| Document Title | GATE_7_AUTHORIZATION                    |
| Repo           | Suite (Layer / Product Repo)            |
| Status         | DRAFT — AWAITING APPROVAL               |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-02-07                              |

---

## 1) Purpose

This document defines the **explicit authorization boundaries** for Gate 7 execution.

Gate 7 may proceed ONLY after Governance Authority approval.

**Evidence**: `EXECUTION_AUTHORITY.md`

---

## 2) Allowed Directories

**MUST**: Limit all changes to:

- `modules/platform-admin/src/**`
- `modules/platform-admin/tests/**`
- `modules/platform-admin/governance/**` (documentation updates only)

**Evidence**: `MODULE_SCOPE_LOCK.md`

---

## 3) Forbidden Directories

**MUST NOT** modify:

- Any path outside `modules/platform-admin/**`
- `modules/platform-admin/prisma/**` (schema or migrations)
- Root-level `package.json` or `package-lock.json`
- Any Core repository or Bassan.os files
- Infrastructure files (Docker, CI/CD, deployment configs)
- Any files in other modules

**Evidence**: `ARCHITECTURAL_LAWS.md` LAW-1, `MODULE_SCOPE_LOCK.md`

---

## 4) STOP Conditions

### STOP Condition 1: Scope Violation

**Trigger**: Any file outside `modules/platform-admin/**` is modified

**Action**: STOP → Revert changes → Report violation

**Evidence**: `MODULE_SCOPE_LOCK.md`

---

### STOP Condition 2: Prisma Schema Change

**Trigger**: `schema.prisma` or migration files modified

**Action**: STOP → Revert changes → Report violation

**Evidence**: `MODULE_SCOPE_LOCK.md`, Gate 7 scope

---

### STOP Condition 3: Dependency Addition

**Trigger**: `package.json` or `package-lock.json` modified

**Action**: STOP → Revert changes → Report violation

**Evidence**: `ARCHITECTURAL_LAWS.md` LAW-1

---

### STOP Condition 4: Core Integration Change

**Trigger**: Changes to Core contract or Core adapter beyond correlation ID propagation

**Action**: STOP → Revert changes → Report violation

**Evidence**: `INTEGRATION_CONTRACT_CORE.md`

---

### STOP Condition 5: Secrets in Audit Logs

**Trigger**: Code writes tokens, passwords, or secrets to audit logs

**Action**: STOP → Code review failure → Reject implementation

**Evidence**: `MODULE_SECURITY_LAWS.md` Section 3.4, `SECURITY_BASELINE.md`

---

### STOP Condition 6: Fail-Open Audit Behavior

**Trigger**: Audit write failure allows operation to proceed

**Action**: STOP → Code review failure → Reject implementation

**Evidence**: `MODULE_SECURITY_LAWS.md` Section 3.4, `ARCHITECTURAL_LAWS.md` LAW-10

---

### STOP Condition 7: PII in Audit Metadata or Logs

**Trigger**: Audit metadata or structured logs contain email, name, or role (PII)

**Clarification**:

- **NOT a violation**: Presence of `email`/`name` in DTO definitions, repository method signatures, or response objects
- **IS a violation**: `email`/`name` appearing in:
  - Audit metadata payloads (e.g., `metadata: { email: dto.email }`)
  - Structured log objects (e.g., `logger.error({ email: user.email })`)
  - Client-facing exception messages (e.g., `throw new Error(\`Email ${email} already exists\`)`)

**Verification**:

```powershell
# Check for raw error.message usage in src code
git grep -n "error\.message" modules/platform-admin/src

# Manual inspection of audit metadata in service files
# Expected: metadata contains ONLY IDs, NO email/name/role
```

**Action if ambiguous**: STOP → Request file/line evidence → Verify context

**Evidence**: `MODULE_SECURITY_LAWS.md` Section 3.4, `SECURITY_BASELINE.md`

---

### STOP Condition 8: Test Failure

**Trigger**: Any test fails during verification

**Action**: STOP → Fix failures → Re-verify

**Evidence**: `MODULE_SECURITY_LAWS.md` Section 5

---

### STOP Condition 9: TypeScript Compilation Error

**Trigger**: `npx tsc --noEmit` reports errors

**Action**: STOP → Fix errors → Re-verify

**Evidence**: `ARCHITECTURAL_LAWS.md` LAW-10

---

## 5) Required Verification Commands

**MUST run** before closing Gate 7:

```bash
# TypeScript compilation
npx tsc --noEmit

# Test execution
npx jest --config jest.config.cjs

# Git diff boundaries
git diff --name-only

# Git status (clean tree after commit)
git status --porcelain
```

**PII/Secret Leakage Verification** (PowerShell-safe):

```powershell
# Verify no raw error.message in src code
git grep -n "error\.message" modules/platform-admin/src

# Verify correlationId in all audit calls
git grep -n "logAction" modules/platform-admin/src
```

**Evidence**: `GATE_7_PLAN.md` Section 5

---

## 6) Commit Discipline

### 6.1 One Gate = One Commit

**MUST**: Create a single commit for all Gate 7 changes

**MUST**: Use commit message format:

```
Gate 7: Audit & Correlation Implementation

- Implement correlation ID extraction and propagation
- Implement audit service with fail-closed behavior
- Add comprehensive unit and integration tests
- Verify compliance with MODULE_SECURITY_LAWS.md

Evidence: GATE_7_PLAN.md, MODULE_SECURITY_LAWS.md
```

**Evidence**: `EXECUTION_AUTHORITY.md`

---

### 6.2 Tag After Approval

**MUST**: Create annotated Git tag after Governance Authority approval

**Tag Format**: `suite-platform-admin-gate-7`

**Tag Message**:

```
Gate 7: Audit & Correlation Implementation

Date: 2026-02-07
Status: CLOSED
Evidence: GATE_7_PLAN.md, GATE_7_CHECKLIST.md
```

**Evidence**: `EXECUTION_AUTHORITY.md`

---

## 7) NO ASSUMPTIONS Clause

**MUST NOT**:

- Assume Core behavior beyond `INTEGRATION_CONTRACT_CORE.md`
- Assume database schema changes are allowed
- Assume new dependencies can be added
- Assume scope can expand beyond `MODULE_SCOPE_LOCK.md`
- Assume audit log analysis features are in-scope
- Assume cross-module correlation is allowed

**MUST**:

- Verify all claims against binding sources
- Mark unsupported features as NOT AVAILABLE
- STOP if binding evidence is missing

**Evidence**: `ARCHITECTURAL_LAWS.md` LAW-1, `EXECUTION_AUTHORITY.md`

---

## 8) Approval Requirements

**Gate 7 may proceed ONLY when**:

1. Governance Authority has reviewed this authorization document
2. All STOP conditions are acknowledged
3. Scope boundaries are confirmed
4. Verification plan is approved
5. Explicit approval is granted

**Evidence**: `EXECUTION_AUTHORITY.md`

---

## 9) Signature

**Approved By**: [PENDING GOVERNANCE AUTHORITY APPROVAL]  
**Date**: [PENDING]  
**Status**: DRAFT — AWAITING APPROVAL
