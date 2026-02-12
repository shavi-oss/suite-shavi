# Gate 53B — Plan

## Test Governance Reconciliation

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Gate Number    | 53B                                     |
| Gate Name      | Test Governance Reconciliation          |
| Document Title | GATE_53B_PLAN                           |
| Repo           | Suite (Layer / Product Repo)            |
| Module         | platform-admin                          |
| Status         | FINAL — PLAN                            |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-02-12                              |

---

## 1) Objective

Fix exactly two failing test suites by reconciling stale test invariants with post-52A reality:

- `fail-closed.spec.ts`: Currently expects ExplicitAllowGuard usage EXACTLY once, but reality is 4 usages
- `build.spec.ts`: Currently expects exactly 3 controllers, but reality is 6 controllers

**Constraint**: Do NOT weaken tests. Replace numeric counts with strict allowlists (order-independent) + exact counts.

---

## 2) Scope Allowlist

**Allowed to MODIFY**:

1. `modules/platform-admin/tests/security/fail-closed.spec.ts`
2. `modules/platform-admin/tests/non-regression/build.spec.ts`
3. `modules/platform-admin/governance/GATE_53B_PLAN.md` (this file)
4. `modules/platform-admin/governance/GATE_53B_AUTHORIZATION.md`
5. `modules/platform-admin/governance/GATE_53B_EXECUTION_REPORT.md`
6. `modules/platform-admin/governance/GATE_53B_VERIFICATION_EVIDENCE.md`

**Allowed to READ** (no modify):

- `modules/platform-admin/platform-admin.module.ts`
- Any other files for inspection only

---

## 3) Forbidden List

**MUST NOT**:

- Modify any file outside allowlist
- Modify `package.json` or `package-lock.json`
- Modify any file in `src/**`, `host/**`, `client/**`, `prisma/**`
- Modify root configs
- Add dependencies
- Touch Core

---

## 4) Controller Reality (Expected Allowlist)

**Controllers in PlatformAdminModule** (from `platform-admin.module.ts` lines 42-49):

1. HealthController
2. InternalUserController
3. OrgMappingController
4. OrganizationController
5. AuditController
6. AuthController

**Total**: 6 controllers

---

## 5) ExplicitAllowGuard Reality (Expected Allowlist)

**ExplicitAllowGuard usages MUST be exactly 4** and ONLY within:

- **HealthController**: `getHealth` method
- **AuthController**: `login`, `logout`, `getSession` methods

**Total**: 4 usages

**Forbidden controllers for ExplicitAllowGuard**:

- InternalUserController
- OrgMappingController
- OrganizationController
- AuditController

---

## 6) Task Breakdown

### Task T1: Extract Controllers Allowlist from PlatformAdminModule

**Objective**: Read `platform-admin.module.ts` and extract exact controller list

**Action**: READ ONLY (already done in preflight)

**Evidence**: 6 controllers confirmed

---

### Task T2: Update build.spec.ts Controller Assertion

**Objective**: Replace `controllers.length === 3` with strict allowlist validation

**File**: `modules/platform-admin/tests/non-regression/build.spec.ts`

**Changes** (line 25-37):

- Replace `expect(controllers.length).toBe(3)` with `expect(controllers.length).toBe(6)`
- Keep order-independent set validation
- Add exact controller names:
  - HealthController
  - InternalUserController
  - OrgMappingController
  - OrganizationController
  - AuditController
  - AuthController
- Fail with clear message if extra/missing controller

---

### Task T3: Update fail-closed.spec.ts ExplicitAllowGuard Assertion

**Objective**: Replace "exactly once" with strict allowlist validation (exactly 4 usages, only allowed controllers)

**File**: `modules/platform-admin/tests/security/fail-closed.spec.ts`

**Changes** (line 89-108):

- Replace `expect(guardUsageCount).toBe(1)` with `expect(guardUsageCount).toBe(4)`
- Add allowlist validation: each usage must belong to HealthController or AuthController only
- Track which controller/method has ExplicitAllowGuard
- Fail with clear message if any usage outside allowlist (e.g., InternalUserController, OrgMappingController, OrganizationController, AuditController)
- Do NOT use `<=` or `>=` ranges; must be exact

---

### Task T4: Run Verification

**Objective**: Verify all tests pass

**Command**:

```bash
npm run test:platform-admin
```

**Acceptance**:

- Test Suites: 26 passed, 26 total
- Tests: all passed

**If not green**: STOP. Do not touch other files. Report which suite failed.

---

### Task T5: Evidence Capture + Execution Report

**Objective**: Create governance artifacts

**Files**:

- `GATE_53B_AUTHORIZATION.md`
- `GATE_53B_EXECUTION_REPORT.md`
- `GATE_53B_VERIFICATION_EVIDENCE.md`

---

## 7) Verification Commands

**Pre-Flight**:

```bash
git status --porcelain
git diff --name-only
git diff --name-only --cached
```

**Post-Patch**:

```bash
git diff --name-only
npm run test:platform-admin
```

**Expected**:

- `git diff --name-only`: ONLY 2 test files + 4 governance files
- `npm run test:platform-admin`: 26/26 suites passed

---

## 8) Stop Conditions

- **SC-53B-1**: Any file outside allowlist modified
- **SC-53B-2**: `package.json` or `package-lock.json` modified
- **SC-53B-3**: Any file in `src/**` modified
- **SC-53B-4**: Tests do not pass (26/26 suites)
- **SC-53B-5**: Test assertions weakened (e.g., using `<=` instead of exact count)
- **SC-53B-6**: ExplicitAllowGuard usage detected outside HealthController or AuthController

**Action on STOP**: Halt immediately, report deviation.

---

## 9) Acceptance Criteria

Gate 53B is COMPLETE when:

- [x] `build.spec.ts` updated: controller count 3 → 6, strict allowlist
- [x] `fail-closed.spec.ts` updated: ExplicitAllowGuard count 1 → 4, strict allowlist (HealthController + AuthController only)
- [x] All tests pass: 26/26 suites
- [x] No files outside allowlist modified
- [x] Governance artifacts created

---

## 10) Signature

**Approved By**: Governance Authority  
**Date**: 2026-02-12  
**Status**: FINAL — PLAN
