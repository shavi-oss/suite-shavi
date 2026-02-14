# Gate 4.10 — Hardening & Evidence Pack

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Module Name    | platform-admin                          |
| Document Title | GATE_4_10_EXECUTION_PLAN                |
| Repo           | Suite (Layer / Product Repo)            |
| Status         | TEMPORARY — PLAN ONLY                   |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-01-30                              |

---

## 1) Purpose

Gate 4.10 **proves** (not adds) that the Control Plane kernel built through Gate 4.9 is:

- Fail-closed by default
- Drift-resistant
- Verifiable through static inspection only

**NO new behavior. Only proof.**

---

## 2) Core Principle

**Invariants must be proven with failing assertions.**

Inspection alone is insufficient. Every invariant must have a test that **breaks** if violated.

---

## 3) Invariants to Prove

### 3.1 Fail-Closed Default is Absolute

**Current Coverage**: ✅ Partial

- `fail-closed.spec.ts` tests `DenyAllGuard` behavior
- `fail-closed.spec.ts` verifies `APP_GUARD` metadata

**Gap**: Need comprehensive proof of fail-closed enforcement

**Required Proofs**:

1. **Static Proof**: Verify `DenyAllGuard` is wired as `APP_GUARD` in module providers
2. **Behavioral Proof**: Verify `ExplicitAllowGuard` is used exactly once (static scan)
3. **Security Proof**: Existing tests confirm deny-all behavior

**Rationale**: Avoid relying on internal provider properties (e.g., `scope`). Prove fail-closed through static wiring + behavioral tests, not implementation details.

### 3.2 Exactly ONE Route Exists

**Current Coverage**: ✅ Partial

- `build.spec.ts` counts controller methods (1 method)
- `build.spec.ts` verifies method name (`getHealth`)

**Gap**: No verification of HTTP method or path

**Required Assertions**:

```typescript
// Verify route metadata
const pathMetadata = Reflect.getMetadata("path", HealthController);
expect(pathMetadata).toBe("platform-admin");

const methodMetadata = Reflect.getMetadata("path", controller.getHealth);
expect(methodMetadata).toBe("health");

// Verify HTTP method using RequestMethod enum (avoid magic numbers)
import { RequestMethod } from "@nestjs/common";
const httpMethod = Reflect.getMetadata("method", controller.getHealth);
expect(httpMethod).toBe(RequestMethod.GET);
```

**Rationale**: Use `RequestMethod.GET` enum instead of magic number `0` to avoid fragile tests.

### 3.3 ExplicitAllowGuard Used EXACTLY Once

**Current Coverage**: ✅ Partial

- `fail-closed.spec.ts` verifies guard on `getHealth` method

**Gap**: No verification that guard is NOT used elsewhere

**Required Assertion**:

```typescript
// Scan all controllers for ExplicitAllowGuard usage
const controllers =
  Reflect.getMetadata("controllers", PlatformAdminModule) || [];
let guardUsageCount = 0;

controllers.forEach((ControllerClass) => {
  const instance = new ControllerClass();
  const methods = Object.getOwnPropertyNames(
    Object.getPrototypeOf(instance),
  ).filter((name) => name !== "constructor");

  methods.forEach((method) => {
    const guards = Reflect.getMetadata("__guards__", instance[method]) || [];
    if (guards.includes(ExplicitAllowGuard)) {
      guardUsageCount++;
    }
  });
});

expect(guardUsageCount).toBe(1); // EXACTLY one usage
```

### 3.4 DenyAllGuard Remains APP_GUARD

**Current Coverage**: ✅ Complete

- `fail-closed.spec.ts` verifies `APP_GUARD` provider uses `DenyAllGuard`

**No gap identified.**

### 3.5 No Hidden Controllers or Routes

**Current Coverage**: ✅ Partial

- `build.spec.ts` counts controllers (1 controller)

**Gap**: No verification of controller count at module level

**Required Assertion**:

```typescript
// Verify module has exactly 1 controller
const controllers = Reflect.getMetadata("controllers", PlatformAdminModule);
expect(controllers).toBeDefined();
expect(controllers.length).toBe(1);
expect(controllers).toEqual([HealthController]);
```

### 3.6 No Accidental Exports or Side-Effects

**Current Coverage**: ✅ Complete

- `build.spec.ts` verifies module exports only `PlatformAdminModule`

**No gap identified.**

### 3.7 Test Command Invariant

**Current Coverage**: ❌ None

**Required Documentation**:

- **Official test command**: `npx jest --config jest.config.cjs`
- **npm test status**: Intentionally not configured (deferred to dedicated tooling gate)

**Optional Assertion** (if included):

```typescript
// Verify npm test is NOT the official command
const packageJson = require("../../../../package.json");
const testScript = packageJson.scripts?.test;

// Either undefined OR explicitly not the official command
if (testScript) {
  expect(testScript).not.toBe("jest --config jest.config.cjs");
}
```

**Rationale**: Avoid regex matching on error message strings (fragile). Check stable condition: test script is either undefined or not the official command.

---

## 4) Files to Modify

### 4.1 Test Files (ONLY)

**File**: `modules/platform-admin/tests/security/fail-closed.spec.ts`
**Changes**:

- Add scan for `ExplicitAllowGuard` usage count across all controllers
- Verify fail-closed enforcement through existing behavioral tests

**File**: `modules/platform-admin/tests/non-regression/build.spec.ts`
**Changes**:

- Add HTTP method/path metadata verification
- Add controller count verification at module level
- Add test command invariant verification

**File**: `modules/platform-admin/tests/security/invariants.spec.ts` (NEW)
**Purpose**: Dedicated invariant tests (no runtime)
**Contents**:

- Route count invariant
- Guard usage invariant
- Export barrier invariant
- Test command invariant

### 4.2 Documentation Files (ONLY)

**File**: `modules/platform-admin/governance/GATE_4_10_EVIDENCE.md` (NEW)
**Purpose**: Evidence pack for Gate 4.10 closure
**Contents**:

- Invariants proven
- Test results
- Metadata inspection results
- Verification steps (reproducible)

**File**: `modules/platform-admin/governance/PLATFORM_ADMIN_READINESS.md`
**Changes**:

- Update Gate 4.10 status to CLOSED
- Add invariant summary section

---

## 5) Forbidden Changes

❌ **Production Code**: No changes to controllers, guards, services, modules
❌ **Runtime Execution**: No `createNestApplication()` or server startup
❌ **Dependencies**: No new npm packages
❌ **Config**: No tsconfig, env, or config changes
❌ **Core/DB/Auth**: No integration code
❌ **New Features**: No new behavior or endpoints

---

## 6) Verification Steps

### 6.1 Static Verification (No Runtime)

1. Run TypeScript compilation:

   ```bash
   npx tsc -p .
   ```

   **Expected**: No errors

2. Run test suite:

   ```bash
   npx jest --config jest.config.cjs
   ```

   **Expected**: All tests pass (including new invariant tests)

3. Verify test count increased:
   **Before Gate 4.10**: 21 tests
   **After Gate 4.10**: Approximately 25-30 tests (new invariant tests added)

   **Note**: Test count is approximate; requirement is invariant coverage, not a fixed number.

### 6.2 Metadata Inspection (Manual)

1. Verify `APP_GUARD` provider:

   ```typescript
   const providers = Reflect.getMetadata("providers", PlatformAdminModule);
   const appGuard = providers.find((p) => p.provide === APP_GUARD);
   console.log(appGuard); // { provide: APP_GUARD, useClass: DenyAllGuard }
   ```

2. Verify controller count:

   ```typescript
   const controllers = Reflect.getMetadata("controllers", PlatformAdminModule);
   console.log(controllers.length); // 1
   ```

3. Verify route metadata:
   ```typescript
   const controller = new HealthController();
   const path = Reflect.getMetadata("path", controller.getHealth);
   console.log(path); // 'health'
   ```

---

## 7) Evidence Requirements

### 7.1 Test Evidence

- Screenshot of test run showing all tests passing
- Test count: before (21) → after (~28)
- No runtime execution (no server startup logs)

### 7.2 Commit Evidence

- Commit message: `test(platform-admin): Gate 4.10 hardening & invariant proofs`
- Tag: `suite-platform-admin-gate-4.10`
- Files changed: tests + docs only

### 7.3 Documentation Evidence

- `GATE_4_10_EVIDENCE.md` created
- `PLATFORM_ADMIN_READINESS.md` updated
- All invariants documented with test references

---

## 8) Stop Conditions

STOP immediately if:

- Any production code change required
- Any runtime execution needed
- Any ambiguity in requirements
- Any dependency addition needed
- Any config change needed

---

## 9) Success Criteria

✅ All 7 invariants proven with assertions (test count approximate)
✅ Test suite passes (no runtime execution)
✅ TypeScript compilation passes
✅ Evidence docs created
✅ Zero production code changes
✅ Zero scope expansion

---

## 10) Signature

**Status**: TEMPORARY — PLAN ONLY
**Approval**: Pending governance review
**Next Step**: Await explicit approval before execution
