# Gate 4.9 — Test Plan

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Module Name    | platform-admin                          |
| Document Title | GATE_4_9_TEST_PLAN                      |
| Repo           | Suite (Layer / Product Repo)            |
| Status         | TEMPORARY — PLAN ONLY                   |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-01-30                              |

---

## 1) Purpose

Define test requirements for Gate 4.9 to verify:

1. Health endpoint is accessible (opt-in works)
2. All other routes remain denied (fail-closed preserved)
3. No unintended controllers or routes exist

---

## 2) Test Categories

### 2.1 Unit Tests

**File**: `modules/platform-admin/tests/unit/controllers/health.controller.spec.ts`

**Tests**:

- `should return health response with status "ok"`
- `should return module name "platform-admin"`
- `should return valid ISO 8601 timestamp`
- `should not throw exceptions`

### 2.2 Security Tests

**File**: `modules/platform-admin/tests/security/fail-closed.spec.ts` (UPDATE)

**New Tests**:

- `should allow access to health endpoint only`
- `should deny access to all other routes`
- `should preserve APP_GUARD as DenyAllGuard`
- `should use ExplicitAllowGuard on exactly one route`

### 2.3 Non-Regression Tests

**File**: `modules/platform-admin/tests/non-regression/build.spec.ts` (UPDATE)

**New Tests**:

- `should have exactly one controller (HealthController)`
- `should have exactly one route (/platform-admin/health)`
- `should not have services beyond health controller`

---

## 3) Pass Criteria

Gate 4.9 passes when ALL of the following are true:

- [ ] All unit tests pass (health controller, ExplicitAllowGuard)
- [ ] All security tests pass (fail-closed preserved, ExplicitAllowGuard used once)
- [ ] All non-regression tests pass (only one controller/route)
- [ ] TypeScript compilation passes (`npx tsc -p .`)
- [ ] All tests run successfully (`npm test`)
- [ ] Git status clean after test run (no artifacts)
- [ ] No production code changes beyond allowed paths

---

## 4) Evidence Required to Close Gate

### 4.1 Test Execution Evidence

**Command**: `npm test`  
**Expected**: All tests passing

**Screenshot/Log**: Test output showing:

- Unit tests: passing (health controller, ExplicitAllowGuard)
- Security tests: passing (fail-closed preserved, ExplicitAllowGuard used once)
- Non-regression tests: passing (only one controller/route)

### 4.2 Build Evidence

**Command**: `npx tsc -p .`  
**Expected**: No errors

### 4.3 Git Evidence

**Command**: `git diff --name-only <previous-commit> HEAD`  
**Expected**: Only allowed paths modified

---

## 5) Test Implementation Details

### 5.1 Unit Test Example

```typescript
describe("HealthController", () => {
  let controller: HealthController;

  beforeEach(() => {
    controller = new HealthController();
  });

  it('should return health response with status "ok"', () => {
    const result = controller.getHealth();
    expect(result.status).toBe("ok");
  });

  it('should return module name "platform-admin"', () => {
    const result = controller.getHealth();
    expect(result.module).toBe("platform-admin");
  });

  it("should return valid ISO 8601 timestamp", () => {
    const result = controller.getHealth();
    expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
  });
});
```

---

## 6) Stop Conditions

STOP execution immediately if:

- Any test fails and cannot be fixed
- Security tests show `APP_GUARD` is not `DenyAllGuard`
- Non-regression tests show more than one controller/route
- TypeScript compilation fails

---

## 7) Allowed Changes (Gate 4.9 EXECUTE)

**Test Files** (NEW):

- `modules/platform-admin/tests/unit/controllers/health.controller.spec.ts`
- `modules/platform-admin/tests/unit/guards/explicit-allow.guard.spec.ts`

**Test Files** (MODIFY):

- `modules/platform-admin/tests/security/fail-closed.spec.ts`
- `modules/platform-admin/tests/non-regression/build.spec.ts`

---

## 8) Signature

**Status**: TEMPORARY — PLAN ONLY  
**Test Coverage**: Unit, Security, Non-Regression  
**Approval**: Pending governance review
