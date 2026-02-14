# Gate 6A — Dev Runtime Enablement

## Platform Admin Module

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Gate Number    | 6A                                      |
| Gate Name      | Dev Runtime Enablement                  |
| Document Title | GATE_6A_DEV_RUNTIME_ENABLEMENT          |
| Repo           | Suite (Layer / Product Repo)            |
| Module         | platform-admin                          |
| Status         | FINAL — PLAN                            |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-02-12                              |
| Risk Level     | P2 (Operational)                        |

---

## 1) Executive Summary

**Goal**: Enable minimal runtime wiring for dev environment without weakening fail-closed architecture

**Scope**: Cookie parser (if dependency exists), env validation, CoreClient production readiness

**Risk**: P2 (Operational) — Runtime failures, env misconfiguration

**Preservation**: Global `DenyAllGuard` remains active, no implicit authentication

---

## 2) Architectural Context

**Current State**:

- No runtime cookie parser wired
- CoreClient env-gated but not production-ready
- Tests passing (26/26 suites, 221/221 tests)
- Fail-closed architecture active

**Target State**:

- Cookie parser enabled (if dependency exists and verified)
- CoreClient production-ready (strict env validation)
- All tests still passing
- Fail-closed architecture preserved

---

## 3) Preconditions (MUST BE VERIFIED BEFORE EXECUTION)

### 3.1 Cookie Parser Dependency

**Requirement**: `cookie-parser` MUST already exist in `package.json`

**Verification Command**:

```bash
grep "cookie-parser" package.json
```

**If NOT found**: Cookie parser wiring is DEFERRED and requires a separate deps-only gate

**Action**: STOP execution of Gate 6A until dependency gate completes

---

### 3.2 Build Script Verification

**Requirement**: Verify build/test scripts exist

**Verification**: Check `RELEASE_QUALIFICATION_MATRIX_V2.md` for documented commands

**Fallback**: Use `npm test` and `npm run build` (if build exists)

---

## 4) Risk Classification

**Risk Level**: P2 (Operational)

**Risks**:

- Runtime failures if env vars missing
- Dev/prod parity issues
- Cookie parser misconfiguration (if dependency missing)

**Mitigation**:

- Strict env validation on startup
- Fail-closed on missing env vars
- Explicit error messages
- Dependency verification before execution

---

## 5) Allowed File List

**ONLY** these files may be modified:

```
modules/platform-admin/src/main.ts
modules/platform-admin/src/core-adapter/core.client.ts
modules/platform-admin/tests/unit/core-adapter/core.client.spec.ts
modules/platform-admin/governance/GATE_6A_DEV_RUNTIME_ENABLEMENT.md
modules/platform-admin/governance/GATE_6A_EXECUTION_REPORT.md
modules/platform-admin/governance/GATE_6A_VERIFICATION_EVIDENCE.md
```

**Total**: 3 production files, 1 test file, 3 governance files

---

## 6) Explicit Forbidden List

**MUST NOT** modify:

- `platform-admin.module.ts` (controller/provider list)
- Any guard files (`deny-all.guard.ts`, `explicit-allow.guard.ts`, `session.guard.ts`, `rbac.guard.ts`)
- Any controller files
- Any service files (except `core.client.ts`)
- `package.json` or `package-lock.json`
- Prisma schema
- Any test files (except `core.client.spec.ts`)

**MUST NOT**:

- Disable `DenyAllGuard`
- Add new controllers
- Add new routes
- Expand `ExplicitAllowGuard` usage
- Introduce implicit authentication
- Bypass session validation
- Add dependencies

---

## 7) Acceptance Criteria

### 7.1 Cookie Parser Enabled (Conditional)

**Requirement**: Cookie parser wired in `main.ts` ONLY IF dependency verified

**Policy-Level Requirement**:

- Application bootstrap must include cookie parser middleware
- Cookie parser must be configured before route handlers

**Verification**: Code review (no execution in docs-only phase)

---

### 7.2 CoreClient Env Validation

**Requirement**: `CORE_API_BASE_URL` validated on startup

**Policy-Level Requirement**:

- CoreClient constructor must validate required env vars
- Missing env var must throw error with clear message
- No default values for production env vars

**Verification**: Add test in `core.client.spec.ts`

---

### 7.3 All Tests Pass

**Requirement**: 26/26 suites, 221+ tests (may increase, never decrease)

**Verification**: Use commands from `RELEASE_QUALIFICATION_MATRIX_V2.md`

**Primary Command**: `npm test`

**Note**: Verify exact command from release matrix before execution

---

### 7.4 No Dependency Changes

**Requirement**: No changes to `package.json` or `package-lock.json`

**Verification**:

```bash
git diff package.json
git diff package-lock.json
```

**Expected**: Empty (no changes)

---

## 8) Verification Commands

**Pre-Flight**:

```bash
git status --porcelain
git diff --name-only
grep "cookie-parser" package.json
npm test
```

**Post-Execution**:

```bash
git diff --name-only
npm test
git diff package.json
git diff package-lock.json
```

**Expected**:

- `git diff --name-only`: ONLY 6 files (3 prod, 1 test, 3 governance)
- `npm test`: All tests pass (26/26 suites minimum, 221+ tests)
- `git diff package.json`: Empty
- `git diff package-lock.json`: Empty

**Note**: Use commands exactly as listed in `RELEASE_QUALIFICATION_MATRIX_V2.md`

---

## 9) Failure Conditions

**STOP if**:

- Cookie parser dependency not found in `package.json`
- Any test fails
- Dependency changes detected
- Files outside allowlist modified
- `DenyAllGuard` disabled or weakened
- Controller count changes
- `ExplicitAllowGuard` usage count changes

**Action**: Rollback all changes, report failure

---

## 10) Rollback Strategy

**If failure detected**:

1. `git reset --hard HEAD`
2. Verify clean working tree: `git status --porcelain`
3. Verify tests pass: `npm test`
4. Report failure with error details

**No partial commits**: All changes must pass verification before commit

---

## 11) Test Impact Assessment

**Existing Tests**: 26 suites, 221 tests

**New Tests**: +1 test (CoreClient env validation)

**Modified Tests**: 0 (no existing tests modified)

**Expected Total**: 26 suites, 222 tests

**Risk**: Low (only adding tests, not modifying)

---

## 12) Governance Compliance Statement

This gate complies with:

- `ARCHITECTURAL_LAWS.md` (Fail-closed by default, governance-first)
- `SECURITY_BASELINE.md` (No secrets in logs, server-only tokens)
- `modules/platform-admin/governance/PRODUCTION_READINESS_BASELINE_V2.md` (Runtime posture preservation)
- `modules/platform-admin/governance/MODULE_SCOPE_LOCK.md` (No scope expansion)
- `modules/platform-admin/governance/STAGE_6_RUNTIME_STRATEGY.md` (Dev runtime enablement philosophy)

**Preservation Guarantees**:

- Global `DenyAllGuard` active
- No implicit authentication
- No route expansion
- No controller expansion
- Fail-closed semantics preserved

---

## 13) Detected Conflicts (Must Resolve Before Execution)

### Conflict 1: Cookie Parser Dependency Unknown

**Issue**: Cannot wire cookie parser without verifying dependency exists

**Resolution Required**: Run `grep "cookie-parser" package.json` before execution

**If Not Found**: Defer cookie parser wiring to separate deps-only gate

---

## 14) Signature

**Approved By**: Governance Authority  
**Date**: 2026-02-12  
**Status**: FINAL — PLAN  
**Risk Level**: P2 (Operational)
