# Gate 8.2 — Integration Tests (Docs-Only Checklist)

## Document Control

| Attribute      | Value                                    |
| -------------- | ---------------------------------------- |
| Gate Name      | Gate 8.2 — Integration Tests (Docs-Only) |
| Module Name    | platform-admin                           |
| Document Title | GATE_8_2_CHECKLIST                       |
| Status         | PROPOSED — DOCS-ONLY CHECKLIST           |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST  |
| Authority      | Governance Authority                     |
| Date           | 2026-02-07                               |

---

## 1) Preconditions

**MUST verify before proceeding:**

- [ ] Gate 8.1 tagged: `suite-platform-admin-gate-8.1`
- [ ] Working tree clean (no uncommitted changes)
- [ ] Current branch: `main` or approved feature branch
- [ ] Gate 8.1 completion report exists: `GATE_8_1_COMPLETION_REPORT.md`
- [ ] Gate 8.1 evidence exists: `GATE_8_1_EVIDENCE.md`

**Verification Commands:**

```bash
git tag | grep suite-platform-admin-gate-8.1
git status --porcelain
git rev-parse --abbrev-ref HEAD
```

**Expected Output:**

- Tag exists: `suite-platform-admin-gate-8.1`
- Working tree clean: (empty output from `git status --porcelain`)
- Branch: `main` or approved branch

---

## 2) Docs Required (Gate 8.2 Docs-Only)

**MUST create these documents:**

- [ ] `modules/platform-admin/governance/GATE_8_2_PLAN.md`
- [ ] `modules/platform-admin/governance/GATE_8_2_CHECKLIST.md` (this file)
- [ ] `modules/platform-admin/governance/GATE_8_2_AUTHORIZATION.md`

**MUST NOT create/modify:**

- ❌ Any code files (`src/**`)
- ❌ Any test files (`tests/**`)
- ❌ Prisma schema (`prisma/**`)
- ❌ Dependencies (`package.json`)
- ❌ Any files outside `modules/platform-admin/governance/**`

---

## 3) Content Checklist (GATE_8_2_PLAN.md)

**MUST include:**

- [ ] Purpose and objective (Integration Tests for Org Mapping)
- [ ] Scope (docs-only, no code/tests)
- [ ] Hard lock constraints (Core endpoint, service tokens, Prisma/deps)
- [ ] All 16 integration test scenarios defined:
  - [ ] Scenario 1: Core 200 → Mapping Created
  - [ ] Scenario 2: Core 404 → Mapping Rejected
  - [ ] Scenario 3: Core 401 → Mapping Rejected
  - [ ] Scenario 4: Core 403 → Mapping Rejected
  - [ ] Scenario 5: Core 5xx → Mapping Rejected
  - [ ] Scenario 6: Core Timeout → Mapping Rejected
  - [ ] Scenario 7: Mapping Exists → Return coreOrgId
  - [ ] Scenario 8: Mapping Not Found → Safe Error
  - [ ] Scenario 9: platform_admin → Can Create/Read
  - [ ] Scenario 10: developer_ops → Can Create/Read
  - [ ] Scenario 11: support → Can Read Only
  - [ ] Scenario 12: viewer → Can Read Only
  - [ ] Scenario 13: JWT Never in Responses
  - [ ] Scenario 14: JWT Never in Logs
  - [ ] Scenario 15: JWT Never in DB
  - [ ] Scenario 16: Correlation ID in Audit Metadata
- [ ] Test file structure proposed (`tests/integration/org-mapping.integration.spec.ts`)
- [ ] Core isolation strategy (Mock/Stub, no real Core)
- [ ] PASS/STOP criteria explicit
- [ ] Exit criteria for docs-only gate
- [ ] Next steps (future execution gate)

---

## 4) Content Checklist (GATE_8_2_AUTHORIZATION.md)

**MUST include:**

- [ ] Authorized scope (docs-only now, execution later)
- [ ] Forbidden items (code, tests, Prisma, deps)
- [ ] Allowed file for future execution (`tests/integration/org-mapping.integration.spec.ts`)
- [ ] Core endpoint constraint (GET /api/v1/organizations/:id ONLY)
- [ ] Service token constraint (NOT AVAILABLE)
- [ ] JWT protection rules
- [ ] RBAC enforcement rules
- [ ] Fail-closed enforcement rules
- [ ] STOP conditions

---

## 5) Evidence Requirements

**MUST reference these canonical sources:**

- [ ] `GATE_8_1_EXECUTION_AUTHORIZATION.md` (deferred integration tests)
- [ ] `GATE_8_1_COMPLETION_REPORT.md` (deferred integration tests)
- [ ] `MODULE_SCOPE_LOCK.md` (scope boundaries)
- [ ] `CORE_V1_INTEGRATION_LOCK.md` (Core Contract v1)
- [ ] `MODULE_SECURITY_LAWS.md` (RBAC, JWT protection)

**MUST NOT:**

- ❌ Invent new Core claims
- ❌ Assume Core capabilities beyond Core Contract v1
- ❌ Reference non-existent endpoints
- ❌ Propose service tokens (NOT AVAILABLE)

---

## 6) STOP Conditions (Immediate Halt)

**STOP immediately if any of the following occur:**

- [ ] Core endpoints beyond `GET /api/v1/organizations/:id` mentioned
- [ ] Service token mentioned or proposed
- [ ] Prisma schema changes proposed
- [ ] New dependencies proposed
- [ ] New test infrastructure proposed (SQLite, Postgres, Docker, etc.)
- [ ] Template publishing mentioned (DEFERRED)
- [ ] Real Core instance proposed (instead of mock/stub)
- [ ] Fail-open behavior proposed (Core error → mapping created)
- [ ] JWT storage in DB or logs proposed
- [ ] JWT exposure to UI proposed
- [ ] Code or test implementation included (docs-only violation)

**Action on STOP:**

1. Halt all work immediately
2. Revert all changes
3. Escalate to Governance Authority
4. Do NOT proceed until violation resolved

---

## 7) Verification Steps (Gate 8.2 Docs-Only)

**After creating all 3 documents:**

### 7.1 File Existence

```bash
ls modules/platform-admin/governance/GATE_8_2_*.md
```

**Expected Output:**

```
GATE_8_2_PLAN.md
GATE_8_2_CHECKLIST.md
GATE_8_2_AUTHORIZATION.md
```

### 7.2 Working Tree Status

```bash
git status --porcelain
```

**Expected Output:**

```
?? modules/platform-admin/governance/GATE_8_2_PLAN.md
?? modules/platform-admin/governance/GATE_8_2_CHECKLIST.md
?? modules/platform-admin/governance/GATE_8_2_AUTHORIZATION.md
```

**MUST verify:**

- [ ] Only 3 new files (GATE*8_2*\*.md)
- [ ] No modifications to existing files
- [ ] No files outside `modules/platform-admin/governance/**`

### 7.3 Content Verification

**MUST verify each document contains:**

- [ ] Document Control table
- [ ] All required sections per checklist
- [ ] Evidence links to canonical sources
- [ ] No code snippets (except illustrative examples)
- [ ] No test implementations
- [ ] No Prisma schema changes
- [ ] No dependency changes

---

## 8) Exit Criteria (Gate 8.2 Docs-Only)

**Gate 8.2 (Docs-Only) is complete when:**

- [ ] All preconditions verified
- [ ] All 3 documents created
- [ ] All content checklists satisfied
- [ ] All evidence requirements met
- [ ] No STOP conditions triggered
- [ ] All verification steps passed
- [ ] Working tree contains only 3 new governance files
- [ ] No code, tests, Prisma, or deps modified
- [ ] Governance Authority approval obtained

---

## 9) Decision

**Status:** PENDING REVIEW

**Approval Required:** Governance Authority

**Next Steps:**

1. Review all 3 documents
2. Verify compliance with checklist
3. Approve or request revisions
4. If approved, proceed to future execution gate

---

## 10) Signature

**Prepared By:** Governance Authority  
**Date:** 2026-02-07  
**Status:** PROPOSED — DOCS-ONLY CHECKLIST

**Approval Status:**

- [ ] Governance Authority: **\_\_\_\_\_\_\_\_** (Date: **\_\_\_\_**)

---

**END OF GATE 8.2 CHECKLIST**
