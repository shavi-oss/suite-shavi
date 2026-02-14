# PATCH — TEST REALITY ALIGNMENT (PLAN)

## 1) Objective

Fix pre-existing failing tests to match Stage 6 Reality:

- `ExplicitAllowGuard` usages: **4** (was 1)
- Controller count: **6** (was 3)

No production code changes.

## 2) Allowlist (Hard)

- `modules/platform-admin/tests/security/fail-closed.spec.ts`
- `modules/platform-admin/tests/non-regression/build.spec.ts`
- `modules/platform-admin/governance/PATCH_TEST_REALITY_ALIGNMENT_PLAN.md`
- `modules/platform-admin/governance/PATCH_TEST_REALITY_ALIGNMENT_REPORT.md`
- `modules/platform-admin/governance/PATCH_TEST_REALITY_ALIGNMENT_EVIDENCE.md`

## 3) Execution Steps

1. Pre-flight Check (`git status`, `git diff`).
2. Update `fail-closed.spec.ts`: Change expectation `1` -> `4`.
3. Update `build.spec.ts`: Change expectation `3` -> `6`.
4. Verify: `git diff`, `npm run test:platform-admin`.
5. Report & Evidence generation.

## 4) Stop Conditions

- Any diff outside allowlist.
- Any dependency drift.
- Any new test failures.
