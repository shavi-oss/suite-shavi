# Gate 5.3 Execution Checklist — Template Publishing

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Module Name    | platform-admin                          |
| Document Title | GATE_5_3_EXECUTION_CHECKLIST            |
| Repo           | Suite (Layer / Product Repo)            |
| Status         | DRAFT — PLANNING ONLY                   |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-01-31                              |

---

## 1) Purpose

This checklist provides a step-by-step execution plan for Gate 5.3: Template Publishing. It follows the **Plan → Execute → Verify → Evidence → Close** pattern.

---

## 2) Phase 1: Plan

### 2.1 Pre-Flight Checks

- [ ] Gate 5.2 is CLOSED, TAGGED (`suite-platform-admin-gate5.2-complete`)
- [ ] `git status` is clean (no uncommitted changes)
- [ ] All governance documents are FINAL and approved
- [ ] INTEGRATION_CONTRACT_CORE.md explicitly authorizes Core template publishing endpoint (BLOCKER if not)
- [ ] No STOP rule violations exist

**Command to verify clean status**:

```bash
git status
```

**Expected Output**: `nothing to commit, working tree clean`

**Command to verify Gate 5.2 tag**:

```bash
git tag | grep suite-platform-admin-gate5.2-complete
```

**Expected Output**: `suite-platform-admin-gate5.2-complete`

### 2.2 Scope Verification

- [ ] Review MODULE_SCOPE_LOCK.md Section 2.2 (BFF Endpoints) — confirm Template Publishing endpoint is listed
- [ ] Review MODULE_SECURITY_LAWS.md Section 3.2 (RBAC Matrix) — confirm roles for Template Publishing
- [ ] Review MODULE_INTEGRATION_PLAN.md Section 3.1 (Core Endpoints) — confirm Core template publishing endpoint details
- [ ] Review INTEGRATION_CONTRACT_CORE.md Section 12.1 — confirm Core endpoint is explicitly authorized (BLOCKER if TODO)

**Command to verify scope**:

```bash
git diff --name-only suite-platform-admin-gate5.2-complete HEAD
```

**Expected Output**: Empty (no changes yet)

---

## 3) Phase 2: Execute

### 3.1 Implementation Tasks

**BFF Endpoint**:

- [ ] Create `modules/platform-admin/src/controllers/templates.controller.ts`
  - Implement `POST /api/platform-admin/templates/publish`
  - Apply RBAC guard (only `platform_admin` and `developer_ops`)
  - Validate input (templateId, suiteOrgId)
  - Call templates service
  - Return safe response to UI

**Templates Service**:

- [ ] Create `modules/platform-admin/src/services/templates.service.ts`
  - Validate org mapping exists (suiteOrgId → coreOrgId)
  - Fail-closed if mapping missing
  - Call Core template publishing endpoint (if authorized)
  - Propagate correlation ID
  - Handle Core errors (retry 5xx, return safe 4xx)
  - Create audit log entry (success or failure)

**DTO**:

- [ ] Create `modules/platform-admin/src/dto/publish-template.dto.ts`
  - Define request DTO (templateId, suiteOrgId)
  - Add validation decorators

**RBAC Enforcement**:

- [ ] Update guards (if needed) to enforce RBAC for template publishing

### 3.2 Testing Tasks

**Unit Tests**:

- [ ] Create `modules/platform-admin/tests/templates.controller.spec.ts`
  - Test RBAC enforcement (platform_admin → allow, support → deny)
  - Test input validation (valid/invalid templateId, suiteOrgId)
  - Test controller calls service correctly

- [ ] Create `modules/platform-admin/tests/templates.service.spec.ts`
  - Test org mapping validation (exists → proceed, missing → deny)
  - Test fail-closed behavior (missing mapping → safe error)
  - Test audit log creation (success and failure)
  - Test Core service call (mock Core response)

**Integration Tests**:

- [ ] Create `modules/platform-admin/tests/templates.integration.spec.ts`
  - Test BFF → Core with valid token (expect 201)
  - Test BFF → Core with invalid token (expect 401/403)
  - Test org mapping validation (valid coreOrgId, invalid coreOrgId)
  - Test correlation ID propagation (verify in logs)
  - Test error handling (Core 5xx → retry, Core 4xx → safe error)

**Security Tests**:

- [ ] Create `modules/platform-admin/tests/templates.security.spec.ts`
  - Test IDOR (attempt to publish for other org → deny)
  - Test privilege escalation (support role → deny)
  - Test Core token protection (verify token never in UI/logs)
  - Test audit immutability (verify audit log is append-only)

---

## 4) Phase 3: Verify

### 4.1 Lint

- [ ] Run linter

**Command**:

```bash
npm run lint
```

**Expected Output**: No errors

### 4.2 Build

- [ ] Run build

**Command**:

```bash
npm run build
```

**Expected Output**: Build succeeds, no errors

### 4.3 Unit Tests

- [ ] Run unit tests

**Command**:

```bash
npm run test -- --testPathPattern=templates --forceExit
```

**Expected Output**: All tests pass, 100% success rate

### 4.4 Integration Tests

- [ ] Run integration tests

**Command**:

```bash
npm run test -- --testPathPattern=templates.integration --forceExit
```

**Expected Output**: All tests pass, 100% success rate

### 4.5 Security Tests

- [ ] Run security tests

**Command**:

```bash
npm run test -- --testPathPattern=templates.security --forceExit
```

**Expected Output**: All tests pass, 100% success rate

### 4.6 All Tests

- [ ] Run all tests

**Command**:

```bash
npm run test -- --forceExit
```

**Expected Output**: All tests pass, no regressions

### 4.7 Scope Verification

- [ ] Verify only allowed files were modified

**Command**:

```bash
git diff --name-only suite-platform-admin-gate5.2-complete HEAD
```

**Expected Output**: Only files in `modules/platform-admin/**` (controllers, services, dto, tests, governance)

**Command to verify no forbidden files**:

```bash
git diff --name-only suite-platform-admin-gate5.2-complete HEAD | grep -E '^(src/|prisma/|\.github/|package\.json|package-lock\.json)'
```

**Expected Output**: Empty (no matches)

---

## 5) Phase 4: Evidence

### 5.1 Collect Evidence

- [ ] Capture lint output (screenshot or log)
- [ ] Capture build output (screenshot or log)
- [ ] Capture test results (all tests pass)
- [ ] Capture `git diff --name-only` output (verify scope)
- [ ] Capture `git status` output (verify clean)

### 5.2 Create Completion Report

- [ ] Create `modules/platform-admin/governance/_planning/GATE_5_3_COMPLETION_EVIDENCE.md`
  - Document all verification steps
  - Include evidence (test results, git diff)
  - Confirm all exit criteria met
  - Confirm no STOP rule violations

---

## 6) Phase 5: Close

### 6.1 Commit Changes

- [ ] Stage all changes

**Command**:

```bash
git add modules/platform-admin/
```

- [ ] Commit with message

**Command**:

```bash
git commit -m "feat(platform-admin): Gate 5.3 - Template Publishing"
```

### 6.2 Tag Gate 5.3

- [ ] Create git tag

**Command**:

```bash
git tag suite-platform-admin-gate5.3-complete
```

- [ ] Push tag (if applicable)

**Command**:

```bash
git push origin suite-platform-admin-gate5.3-complete
```

### 6.3 Update Governance

- [ ] Update `modules/platform-admin/governance/MODULE_GATES_CHECKLIST.md`
  - Mark Gate 5.3 as COMPLETE
  - Update status to PASSED

### 6.4 Final Verification

- [ ] Verify `git status` is clean

**Command**:

```bash
git status
```

**Expected Output**: `nothing to commit, working tree clean`

- [ ] Verify tag exists

**Command**:

```bash
git tag | grep suite-platform-admin-gate5.3-complete
```

**Expected Output**: `suite-platform-admin-gate5.3-complete`

---

## 7) STOP Conditions (Fail-Closed)

If ANY of the following occur, STOP immediately and escalate:

- Lint fails → STOP, fix errors, re-run
- Build fails → STOP, fix errors, re-run
- Any test fails → STOP, fix errors, re-run
- Forbidden files modified (src/, prisma/, .github/, package.json) → STOP, revert, escalate
- Core endpoint not authorized in INTEGRATION_CONTRACT_CORE.md → STOP, create Gate 5.3A (Contract Finalization)
- RBAC bypassed → STOP, fix, escalate
- Audit logging skipped → STOP, fix, escalate
- Core token exposed to UI → STOP, fix, escalate
- Fail-open behavior detected → STOP, fix, escalate

**Action on STOP**: Halt all work, document the issue, create remediation plan, obtain approval, fix, re-verify.

---

## 8) Acceptance Criteria

This execution checklist is considered COMPLETE when:

- [ ] All phases (Plan → Execute → Verify → Evidence → Close) are defined
- [ ] All commands are explicit and testable
- [ ] All expected outputs are documented
- [ ] All STOP conditions are explicit
- [ ] No contradictions exist with GATE_5_3_DRAFT_AUTHORIZATION.md

---

## 9) Signature

**Status**: DRAFT — PLANNING ONLY  
**Prepared By**: Execution Assistant (Sonnet 4.5)  
**Date**: 2026-01-31  
**Approval Status**: PENDING GOVERNANCE AUTHORITY REVIEW
