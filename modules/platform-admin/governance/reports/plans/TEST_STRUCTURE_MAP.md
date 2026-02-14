# Test Structure Map — Gate 4.8

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Module Name    | platform-admin                          |
| Document Title | TEST_STRUCTURE_MAP                      |
| Repo           | Suite (Layer / Product Repo)            |
| Status         | TEMPORARY — PLAN ONLY                   |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-01-30                              |

---

## 1) Purpose

Define the test folder structure and naming conventions for platform-admin module tests.

---

## 2) Proposed Test Folder Structure

```
modules/platform-admin/
├── src/
│   ├── guards/
│   │   ├── deny-all.guard.ts
│   │   └── index.ts
│   ├── platform-admin.module.ts
│   └── index.ts
└── tests/
    ├── unit/
    │   ├── guards/
    │   │   └── deny-all.guard.spec.ts
    │   └── module/
    │       └── platform-admin.module.spec.ts
    ├── security/
    │   └── fail-closed.spec.ts
    └── non-regression/
        └── build.spec.ts
```

---

## 3) Folder Responsibilities

### 3.1 `tests/unit/`

**Purpose**: Unit tests for individual classes and functions

**Allowed**:

- Test individual guard behavior
- Test module configuration
- Mock ExecutionContext for guards
- Test pure functions (if any)

**Forbidden**:

- HTTP requests or responses
- Database access
- Core API calls
- Integration between multiple classes

**Naming Convention**: `<filename>.spec.ts`

---

### 3.2 `tests/security/`

**Purpose**: Security-focused tests for fail-closed enforcement

**Allowed**:

- Test deny-by-default behavior
- Test guard enforcement
- Test that no routes are accessible

**Forbidden**:

- Authentication tests (no auth yet)
- Authorization tests beyond deny-all (no RBAC yet)
- Penetration tests (deferred)

**Naming Convention**: `<security-concern>.spec.ts`

---

### 3.3 `tests/non-regression/`

**Purpose**: Non-regression tests to ensure build and module integrity

**Allowed**:

- Test TypeScript compilation
- Test module exports
- Test no JS artifacts generated

**Forbidden**:

- Performance tests (deferred)
- Load tests (deferred)
- Compatibility tests (deferred)

**Naming Convention**: `<regression-concern>.spec.ts`

---

### 3.4 `tests/integration/` (NOT CREATED YET)

**Status**: Deferred to future gates

**Purpose**: Integration tests for BFF ↔ Core, database, etc.

**Will Be Allowed** (in future gates):

- Test Core API calls
- Test database operations
- Test service integration

---

### 3.5 `tests/e2e/` (NOT CREATED YET)

**Status**: Deferred to future gates

**Purpose**: End-to-end tests for HTTP endpoints

**Will Be Allowed** (in future gates):

- Test HTTP routes
- Test request/response flows
- Test authentication/authorization

---

## 4) Naming Conventions

### 4.1 Test Files

**Pattern**: `<source-filename>.spec.ts`

**Examples**:

- `deny-all.guard.spec.ts` (tests `deny-all.guard.ts`)
- `platform-admin.module.spec.ts` (tests `platform-admin.module.ts`)

### 4.2 Test Suites

**Pattern**: `describe('<ClassName or ModuleName>', () => { ... })`

**Examples**:

- `describe('DenyAllGuard', () => { ... })`
- `describe('PlatformAdminModule', () => { ... })`

### 4.3 Test Cases

**Pattern**: `it('should <expected behavior>', () => { ... })`

**Examples**:

- `it('should always return false', () => { ... })`
- `it('should wire APP_GUARD provider', () => { ... })`

---

## 5) Test File Template

```typescript
/**
 * <ClassName> Tests — platform-admin
 *
 * GATE 4.8 — UNIT TESTS
 * Tests for <ClassName> behavior.
 */

import { <ClassName> } from '../../../src/<path>/<filename>';

describe('<ClassName>', () => {
  describe('<method or behavior>', () => {
    it('should <expected behavior>', () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

---

## 6) What Each Folder Is Allowed to Test

| Folder                  | Allowed to Test              | Forbidden                    |
| ----------------------- | ---------------------------- | ---------------------------- |
| `tests/unit/guards/`    | Guard behavior (canActivate) | HTTP requests, DB access     |
| `tests/unit/module/`    | Module configuration         | Feature logic, integration   |
| `tests/security/`       | Fail-closed enforcement      | Auth, RBAC (not implemented) |
| `tests/non-regression/` | Build, exports, artifacts    | Performance, load            |
| `tests/integration/`    | (NOT CREATED)                | N/A (deferred)               |
| `tests/e2e/`            | (NOT CREATED)                | N/A (deferred)               |

---

## 7) Stop Conditions

Execution MUST STOP IMMEDIATELY if:

- Any test file outside `tests/` folder
- Any test for non-existent features
- Any integration or E2E tests (deferred)
- Any test mocks for Core APIs (not implemented)
- Any test database setup (not needed)

---

## 8) Signature

**Status**: TEMPORARY — PLAN ONLY  
**Next Step**: Review and approval required before execution
