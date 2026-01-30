# Test Execution Checklist — Gate 4.8

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Module Name    | platform-admin                          |
| Document Title | TEST_EXECUTION_CHECKLIST                |
| Repo           | Suite (Layer / Product Repo)            |
| Status         | TEMPORARY — PLAN ONLY                   |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-01-30                              |

---

## 1) Purpose

Step-by-step checklist to execute Gate 4.8 (Test Harness) after plan approval.

---

## 2) Preconditions

Before starting Gate 4.8 execution:

- [ ] Gate 4.7 is CLOSED and TAGGED (`suite-platform-admin-gate-4.7`)
- [ ] Git status is clean
- [ ] Test harness plan is APPROVED
- [ ] Test structure map is APPROVED
- [ ] No uncommitted changes

---

## 3) Execution Steps

### Phase 1 — Test Framework Setup

- [ ] Install Jest: `npm install --save-dev jest @types/jest`
- [ ] Install ts-jest: `npm install --save-dev ts-jest`
- [ ] Create `jest.config.js` or `jest.config.ts`
- [ ] Configure TypeScript support in Jest
- [ ] Verify Jest runs: `npm test` (should fail with "no tests found")

### Phase 2 — Unit Tests (Guards)

- [ ] Create `tests/unit/guards/deny-all.guard.spec.ts`
- [ ] Write test: `should always return false`
- [ ] Write test: `should not throw exceptions`
- [ ] Write test: `should work with any ExecutionContext`
- [ ] Run tests: `npm test` (should pass)

### Phase 3 — Unit Tests (Module)

- [ ] Create `tests/unit/module/platform-admin.module.spec.ts`
- [ ] Write test: `should wire APP_GUARD provider`
- [ ] Write test: `should use DenyAllGuard as guard class`
- [ ] Write test: `should compile and load`
- [ ] Run tests: `npm test` (should pass)

### Phase 4 — Security Tests

- [ ] Create `tests/security/fail-closed.spec.ts`
- [ ] Write test: `should deny all requests by default`
- [ ] Write test: `should not allow bypass`
- [ ] Run tests: `npm test` (should pass)

### Phase 5 — Non-Regression Tests

- [ ] Create `tests/non-regression/build.spec.ts`
- [ ] Write test: `should compile TypeScript without errors`
- [ ] Write test: `should not generate JS artifacts`
- [ ] Write test: `should export only PlatformAdminModule`
- [ ] Run tests: `npm test` (should pass)

### Phase 6 — Verification

- [ ] Run all tests: `npm test` (all should pass)
- [ ] Run TypeScript compilation: `npx tsc -p .` (should pass)
- [ ] Check test coverage (if configured)
- [ ] Verify git status: no untracked JS files
- [ ] Verify no production code changes: `git diff src/`

### Phase 7 — Commit & Tag

- [ ] Stage test files only: `git add tests/ jest.config.*`
- [ ] Verify staged files: `git diff --cached --name-only`
- [ ] Commit: `test(platform-admin): add test harness for Gate 4.8`
- [ ] Tag: `suite-platform-admin-gate-4.8`
- [ ] Verify tag created: `git tag --list "suite-platform-admin-gate-4.8"`

---

## 4) Verification Steps

After execution, verify:

- [ ] All tests pass (`npm test`)
- [ ] TypeScript compilation passes (`npx tsc -p .`)
- [ ] No JS artifacts in `modules/` folder
- [ ] Git status clean (no untracked files)
- [ ] Only test files and config committed
- [ ] No production code changes
- [ ] Tag created: `suite-platform-admin-gate-4.8`

---

## 5) Evidence Required to Close Gate

**Test Execution Evidence**:

- Screenshot or log of `npm test` output (all tests passing)
- Test coverage report (if configured)

**Build Evidence**:

- Output of `npx tsc -p .` (no errors)
- Output of `git status --porcelain` (clean)

**Git Evidence**:

- Output of `git log --oneline -1` (commit message)
- Output of `git tag --list "suite-platform-admin-gate-4.8"` (tag exists)
- Output of `git diff --name-only <previous-commit> HEAD` (only test files)

---

## 6) Stop Conditions

STOP execution immediately if:

- Any production code changes detected
- Any new features or endpoints created
- Any Core integration code added
- Any database migrations created
- Any dependencies beyond test framework added
- Any CI/CD changes made
- TypeScript compilation fails
- Tests fail and cannot be fixed

---

## 7) Rollback Plan

If Gate 4.8 execution fails:

1. Do NOT commit
2. Revert all changes: `git reset --hard HEAD`
3. Document failure reason
4. Return to planning phase
5. Update plan based on failure
6. Request re-approval

---

## 8) Signature

**Status**: TEMPORARY — PLAN ONLY  
**Next Step**: Review and approval required before execution
