# Gate 51 — Task System

## Coordinated Hardening Phase (Task Breakdown)

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Gate Number    | 51                                      |
| Gate Name      | Coordinated Hardening Phase             |
| Document Title | GATE_51_TASKS                           |
| Repo           | Suite (Layer / Product Repo)            |
| Module         | platform-admin                          |
| Status         | FINAL — TASK SYSTEM                     |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-02-12                              |

---

## A) Master Route

### Execution Sequence (Mandatory Checkpoints)

```
START
  ↓
[READ] GATE_51_MASTER_PLAN.md
  ↓
[CHECKPOINT] Confirm understanding of phase goals
  ↓
[EXECUTE] Phase 51A Tasks (51A-T1 → 51A-T3)
  ↓
[VERIFY] 51A Verification Commands
  ↓
[CREATE] 51A Evidence Files
  ↓
⚠️ [STOP] Request approval from ChatGPT
  ↓
[APPROVED] Tag 51A
  ↓
[EXECUTE] Phase 51B Tasks (51B-T1 → 51B-T4)
  ↓
[VERIFY] 51B Verification Commands
  ↓
[CREATE] 51B Evidence Files
  ↓
⚠️ [STOP] Request approval from ChatGPT
  ↓
[APPROVED] Tag 51B
  ↓
[EXECUTE] Phase 51C Tasks (51C-T1 → 51C-T2)
  ↓
[VERIFY] 51C Verification Commands
  ↓
[CREATE] 51C Evidence Files
  ↓
⚠️ [STOP] Request approval from ChatGPT
  ↓
[APPROVED] Tag 51C
  ↓
END
```

---

## B) Task Breakdown Per Phase

### Phase 51A — Contract Semantics Tightening (Guards Only)

#### Task 51A-T1: Review SessionGuard Current State

**Objective**: Understand current SessionGuard implementation and identify inconsistencies in 401/403 handling

**Allowed Files**:

- READ ONLY: `modules/platform-admin/src/auth/session.guard.ts`
- READ ONLY: `modules/platform-admin/tests/unit/auth/session.guard.spec.ts`

**Expected Diff Outcome**: None (read-only task)

**Tests/Verification**: None (analysis task)

**Stop Triggers**: None

**Evidence to Capture**: Document current 401/403 behavior in GATE_51A_EXECUTION_REPORT.md

---

#### Task 51A-T2: Normalize 401/403 Error Messages in SessionGuard

**Objective**: Ensure all authorization failures in SessionGuard return consistent error messages

**Allowed Files**:

```
modules/platform-admin/src/auth/session.guard.ts
modules/platform-admin/tests/unit/auth/session.guard.spec.ts
```

**Expected Diff Outcome**:

- `session.guard.ts`: Error message normalization (if needed)
- `session.guard.spec.ts`: Updated tests to verify consistent error messages

**Tests/Verification**:

```bash
npx jest -c jest.config.cjs modules/platform-admin/tests/unit/auth/session.guard.spec.ts
```

**Stop Triggers**:

- Error message format changed (breaking UI contract)
- 401/403 semantics weakened
- JWT or session ID logged

**Evidence to Capture**:

- git diff output
- Test results

---

#### Task 51A-T3: Verify No Controller/CoreClient Changes

**Objective**: Confirm no files outside allowlist were modified

**Allowed Files**: None (verification task)

**Expected Diff Outcome**:

```bash
git diff --name-only
# Expected ONLY:
# modules/platform-admin/src/auth/session.guard.ts
# modules/platform-admin/tests/unit/auth/session.guard.spec.ts
```

**Tests/Verification**:

```bash
git diff --name-only
git diff package.json
git diff package-lock.json
npx tsc -p modules/platform-admin/tsconfig.bff.json
npx jest -c jest.config.cjs modules/platform-admin/tests/unit
```

**Stop Triggers**:

- Controller file in diff
- CoreClient in diff
- package.json changed
- TypeScript compilation fails
- Any test fails

**Evidence to Capture**:

- Full git diff --name-only output
- Full git diff output
- tsc exit code
- jest output

---

### Phase 51B — Runtime Assertions Layer

#### Task 51B-T1: Add Session Presence Assertion to SessionGuard

**Objective**: Add explicit runtime assertion that session cookie exists before validation

**Allowed Files**:

```
modules/platform-admin/src/auth/session.guard.ts
modules/platform-admin/tests/unit/auth/session.guard.spec.ts
```

**Expected Diff Outcome**:

- `session.guard.ts`: Add assertion for session cookie presence
- `session.guard.spec.ts`: Add test verifying assertion triggers on missing session

**Tests/Verification**:

```bash
npx jest -c jest.config.cjs modules/platform-admin/tests/unit/auth/session.guard.spec.ts
```

**Stop Triggers**:

- Assertion bypasses fail-closed
- Try-catch silences assertion
- Session ID logged

**Evidence to Capture**:

- git diff for session.guard.ts
- Test results showing assertion triggers

---

#### Task 51B-T2: Add JWT Presence Assertion to SessionGuard

**Objective**: Add explicit runtime assertion that Core JWT exists in storage before attaching to request

**Allowed Files**:

```
modules/platform-admin/src/auth/session.guard.ts
modules/platform-admin/tests/unit/auth/session.guard.spec.ts
```

**Expected Diff Outcome**:

- `session.guard.ts`: Add assertion for JWT presence (may already exist from Gate 50B)
- `session.guard.spec.ts`: Add/verify test for missing JWT assertion

**Tests/Verification**:

```bash
npx jest -c jest.config.cjs modules/platform-admin/tests/unit/auth/session.guard.spec.ts
```

**Stop Triggers**:

- Assertion bypasses fail-closed
- JWT logged
- Assertion removed or weakened

**Evidence to Capture**:

- git diff for session.guard.ts
- Test results

---

#### Task 51B-T3: Add Correlation ID Assertion to CoreClient

**Objective**: Add explicit runtime assertion that correlation ID is present before Core API call

**Allowed Files**:

```
modules/platform-admin/src/core-adapter/core.client.ts
modules/platform-admin/tests/unit/core-adapter/core.client.spec.ts
```

**Expected Diff Outcome**:

- `core.client.ts`: Add assertion for correlation ID presence
- `core.client.spec.ts`: Add test verifying assertion triggers on missing correlation ID

**Tests/Verification**:

```bash
npx jest -c jest.config.cjs modules/platform-admin/tests/unit/core-adapter/core.client.spec.ts
```

**Stop Triggers**:

- CoreClient behavior changed (only assertions allowed)
- Assertion bypasses fail-closed
- Correlation ID logged with sensitive data

**Evidence to Capture**:

- git diff for core.client.ts
- Test results

---

#### Task 51B-T4: Verify No Logging of Secrets

**Objective**: Confirm no JWT, session ID, or sensitive data is logged

**Allowed Files**: None (verification task)

**Expected Diff Outcome**: None (verification task)

**Tests/Verification**:

```bash
grep -r "logger.log.*jwt" modules/platform-admin/src/auth/
grep -r "logger.log.*sessionId" modules/platform-admin/src/auth/
grep -r "console.log" modules/platform-admin/src/auth/
grep -r "console.log" modules/platform-admin/src/core-adapter/
npx tsc -p modules/platform-admin/tsconfig.bff.json
npx jest -c jest.config.cjs modules/platform-admin/tests/unit
```

**Stop Triggers**:

- JWT logged
- Session ID logged
- Any grep match on sensitive data logging

**Evidence to Capture**:

- grep outputs (should be empty or show only safe logs)
- Full test results

---

### Phase 51C — Integration Hardening Tests

#### Task 51C-T1: Create Integration Test File with Positive Path

**Objective**: Create new integration test file validating valid session → valid JWT → Core success path

**Allowed Files**:

```
modules/platform-admin/tests/unit/integration/auth-flow.integration.spec.ts (NEW)
```

**Expected Diff Outcome**:

- New file: `auth-flow.integration.spec.ts`
- Test: Valid session + valid JWT → Core API call succeeds (mocked)

**Tests/Verification**:

```bash
npx jest -c jest.config.cjs modules/platform-admin/tests/unit/integration/auth-flow.integration.spec.ts
git diff src/
```

**Stop Triggers**:

- Production code modified (`git diff src/` non-empty)
- Real Core API call made (no mocking)
- External network call made

**Evidence to Capture**:

- git diff showing only new test file
- git diff src/ (should be empty)
- Test results

---

#### Task 51C-T2: Add Negative Path Tests to Integration File

**Objective**: Add comprehensive negative path tests (missing session, expired session, missing JWT, Core 401, Core 403)

**Allowed Files**:

```
modules/platform-admin/tests/unit/integration/auth-flow.integration.spec.ts
```

**Expected Diff Outcome**:

- Updated file: `auth-flow.integration.spec.ts`
- Tests added:
  - Missing session → 401
  - Expired session → 401
  - Missing JWT → 401
  - Core returns 401 → 401 to UI
  - Core returns 403 → 403 to UI

**Tests/Verification**:

```bash
npx jest -c jest.config.cjs modules/platform-admin/tests/unit/integration/auth-flow.integration.spec.ts
npx jest -c jest.config.cjs modules/platform-admin/tests/unit
git diff src/
```

**Stop Triggers**:

- Production code modified
- Positive-only tests (negative paths mandatory)
- Real Core calls made

**Evidence to Capture**:

- git diff output
- Full test results showing all negative paths pass
- git diff src/ (should be empty)

---

## C) Review Checklist for ChatGPT

### Phase 51A Review

**Outputs to Paste Back**:

```bash
git status --porcelain
git diff --name-only
git diff
npx tsc -p modules/platform-admin/tsconfig.bff.json
npx jest -c jest.config.cjs modules/platform-admin/tests/unit
```

**Pass Criteria**:

- ✅ git diff --name-only shows ONLY:
  - `modules/platform-admin/src/auth/session.guard.ts`
  - `modules/platform-admin/tests/unit/auth/session.guard.spec.ts`
- ✅ package.json unchanged
- ✅ package-lock.json unchanged
- ✅ TypeScript compilation exit code 0
- ✅ All tests pass

**Fail Criteria**:

- ❌ Controller file in diff
- ❌ CoreClient in diff
- ❌ package.json changed
- ❌ TypeScript compilation fails
- ❌ Any test fails

---

### Phase 51B Review

**Outputs to Paste Back**:

```bash
git status --porcelain
git diff --name-only
git diff
npx tsc -p modules/platform-admin/tsconfig.bff.json
npx jest -c jest.config.cjs modules/platform-admin/tests/unit
grep -r "logger.log.*jwt" modules/platform-admin/src/
grep -r "logger.log.*sessionId" modules/platform-admin/src/
```

**Pass Criteria**:

- ✅ git diff --name-only shows ONLY:
  - `modules/platform-admin/src/auth/session.guard.ts`
  - `modules/platform-admin/src/core-adapter/core.client.ts`
  - `modules/platform-admin/tests/unit/auth/session.guard.spec.ts`
  - `modules/platform-admin/tests/unit/core-adapter/core.client.spec.ts`
- ✅ package.json unchanged
- ✅ package-lock.json unchanged
- ✅ TypeScript compilation exit code 0
- ✅ All tests pass
- ✅ No JWT/session logging detected

**Fail Criteria**:

- ❌ Controller file in diff
- ❌ package.json changed
- ❌ TypeScript compilation fails
- ❌ Any test fails
- ❌ JWT or session ID logged

---

### Phase 51C Review

**Outputs to Paste Back**:

```bash
git status --porcelain
git diff --name-only
git diff src/
npx tsc -p modules/platform-admin/tsconfig.bff.json
npx jest -c jest.config.cjs modules/platform-admin/tests/unit/integration/auth-flow.integration.spec.ts
npx jest -c jest.config.cjs modules/platform-admin/tests/unit
```

**Pass Criteria**:

- ✅ git diff --name-only shows ONLY:
  - `modules/platform-admin/tests/unit/integration/auth-flow.integration.spec.ts`
- ✅ git diff src/ is empty (no production code changes)
- ✅ TypeScript compilation exit code 0
- ✅ Integration tests pass (positive + negative paths)
- ✅ All unit tests still pass

**Fail Criteria**:

- ❌ Production code modified (`src/**`)
- ❌ package.json changed
- ❌ TypeScript compilation fails
- ❌ Integration tests fail
- ❌ Any unit test fails
- ❌ Only positive paths tested (negative paths mandatory)

---

## Signature

**Approved By**: Governance Authority  
**Date**: 2026-02-12  
**Status**: FINAL — TASK SYSTEM
