# Test Harness Plan — Gate 4.8

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Module Name    | platform-admin                          |
| Document Title | TEST_HARNESS_PLAN                       |
| Repo           | Suite (Layer / Product Repo)            |
| Status         | TEMPORARY — PLAN ONLY                   |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-01-30                              |

---

## 1) Purpose

Define the test harness scope for Gate 4.8, establishing test infrastructure for platform-admin module without creating features or integration code.

---

## 2) Test Scope

### 2.1 Unit Tests (In Scope)

**DenyAllGuard Tests**:

- `canActivate()` always returns `false`
- No exceptions thrown
- No side effects
- Works with any ExecutionContext

**Module Tests**:

- `APP_GUARD` provider wired correctly
- `DenyAllGuard` is the guard class
- Module compiles and loads

### 2.2 Security Tests (In Scope)

**Fail-Closed Enforcement**:

- Deny-by-default behavior verified
- No routes accessible without explicit override
- Guard cannot be bypassed

### 2.3 Non-Regression Tests (In Scope)

**Build Verification**:

- TypeScript compilation passes
- No JS artifacts generated (noEmit)
- Module exports only `PlatformAdminModule`

---

## 3) Explicit Out-of-Scope Tests

❌ **Integration Tests**: No BFF ↔ Core integration exists yet  
❌ **E2E Tests**: No endpoints exist yet  
❌ **Controller Tests**: No controllers exist yet  
❌ **Service Tests**: No services exist yet  
❌ **Repository Tests**: No repositories exist yet  
❌ **Database Tests**: No database access exists yet  
❌ **Authentication Tests**: No auth exists yet  
❌ **Authorization Tests** (beyond deny-all): No RBAC exists yet

---

## 4) Pass Criteria

Gate 4.8 passes when ALL of the following are true:

- [ ] Test framework configured (Jest)
- [ ] Unit tests for `DenyAllGuard` pass
- [ ] Security tests for fail-closed enforcement pass
- [ ] Non-regression tests pass
- [ ] All tests run successfully (`npm test`)
- [ ] Test coverage meets minimum threshold (TBD, suggest 100% for guards)
- [ ] No production code changes (tests only)
- [ ] TypeScript compilation still passes
- [ ] Git status clean after test run (no artifacts)

---

## 5) Stop Conditions

Execution MUST STOP IMMEDIATELY if:

- Any production code changes (beyond test files)
- Any new features or endpoints
- Any Core integration code
- Any test mocks for non-existent features
- Any database migrations or schema changes
- Any dependency additions beyond test framework
- Any CI/CD pipeline changes
- Any configuration changes beyond test config

---

## 6) Test Framework Requirements

**Allowed**:

- Jest configuration (`jest.config.js` or `jest.config.ts`)
- TypeScript test support (`ts-jest`)
- Test utilities (if needed for mocking ExecutionContext)

**Forbidden**:

- E2E testing frameworks (Supertest, etc.) — deferred
- Database testing utilities — deferred
- HTTP mocking libraries (beyond ExecutionContext) — deferred

---

## 7) Signature

**Status**: TEMPORARY — PLAN ONLY  
**Next Step**: Review and approval required before execution
