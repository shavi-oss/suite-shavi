# GATE 1.9.2 — EVIDENCE

**Module**: platform-admin  
**Gate**: 1.9.2 Prisma Wiring Test Infrastructure Remediation  
**Date**: 2026-02-06  
**Authority**: Governance Authority (Layer)

---

## FAILURE CAUSE

**Original Error** (Gate 1.9):

```
expect(received).toBeInstanceOf(expected)
Expected constructor: PrismaService
Received constructor: PrismaService
```

**Root Cause**: Jest module caching creates multiple class references for `PrismaService`, causing `toBeInstanceOf` to fail even when both are the same class

---

## ATTEMPTED SOLUTIONS (ALL FAILED)

### Solution 1: Provider Override with Plain Object

**Code**:

```typescript
.overrideProvider(PrismaService)
.useValue({
  $connect: jest.fn().mockResolvedValue(undefined),
  $disconnect: jest.fn().mockResolvedValue(undefined),
  $on: jest.fn(),
})
```

**Result**: FAIL  
**Reason**: Mock is plain `Object`, not `PrismaService` instance

---

### Solution 2: jest.spyOn on PrismaService Prototype

**Code**:

```typescript
jest
  .spyOn(PrismaService.prototype, "onModuleInit")
  .mockResolvedValue(undefined);
jest
  .spyOn(PrismaService.prototype, "onModuleDestroy")
  .mockResolvedValue(undefined);
jest
  .spyOn(PrismaService.prototype, "$connect" as any)
  .mockResolvedValue(undefined);
jest
  .spyOn(PrismaService.prototype, "$disconnect" as any)
  .mockResolvedValue(undefined);
```

**Result**: FAIL  
**Reason**: Class reference mismatch between test import and NestJS module

---

### Solution 3: Mock PrismaClient Prototype + DATABASE_URL

**Code**:

```typescript
process.env.DATABASE_URL = "postgresql://mock:mock@localhost:5432/mock";
jest
  .spyOn(require("@prisma/client").PrismaClient.prototype, "$connect")
  .mockImplementation(mockConnect);
jest
  .spyOn(require("@prisma/client").PrismaClient.prototype, "$disconnect")
  .mockImplementation(mockDisconnect);
```

**Result**: FAIL  
**Reason**: Class reference mismatch persists

---

### Solution 4: Dynamic require for Class Reference

**Code**:

```typescript
const { Test } = require("@nestjs/testing");
const { PlatformAdminModule } = require("../../../platform-admin.module");
PrismaService = require("../../../src/db/prisma.service").PrismaService;
const {
  OrganizationRepository,
} = require("../../../src/organizations/organization.repository");
```

**Result**: FAIL  
**Reason**: Jest module caching still creates separate class instances

---

## VERIFICATION OUTPUT

**Command**: `npx jest --config jest.config.cjs modules/platform-admin/tests/unit/db/prisma.wiring.spec.ts --no-cache`

**Output**:

```
FAIL modules/platform-admin/tests/unit/db/prisma.wiring.spec.ts (7.189 s)
  PlatformAdmin — Prisma Wiring
    × should provide PrismaService (5 ms)
    √ should provide OrganizationRepository
    × should inject PrismaService into OrganizationRepository (1 ms)

Test Suites: 1 failed, 1 total
Tests:       2 failed, 1 passed, 3 total
Exit code: 1
```

---

## GIT DIFF

**Command**: `git diff --name-only`

**Output**:

```
modules/platform-admin/tests/unit/db/prisma.wiring.spec.ts
```

**File Count**: 1 (test infrastructure only)

---

## NO PRODUCTION CHANGES CONFIRMATION

**Files Modified**: 1 (test file only)

**Production Code (src/**)**: UNCHANGED  
**Controllers**: UNCHANGED  
**Services**: UNCHANGED  
**Repositories**: UNCHANGED  
**Prisma Service**: UNCHANGED  
**Prisma Schema**: UNCHANGED  
**Dependencies\*\*: UNCHANGED

**Test Assertions**: UNCHANGED (per governance rules)  
**Test Infrastructure**: MODIFIED (mocking attempts)

**Scope Expansion**: NONE

---

## TECHNICAL ANALYSIS

**Jest Module Caching Issue**:

- Jest caches modules and creates separate instances of classes
- `toBeInstanceOf` uses strict reference equality (`instanceof` operator)
- When test imports `PrismaService` and NestJS loads it separately, they are different class references
- This is a known Jest limitation with ES6 classes

**Possible Solutions (ALL FORBIDDEN)**:

1. Change assertion to check constructor.name instead of instanceof (forbidden - changes assertions)
2. Use jest.mock() at file level (forbidden - changes test structure significantly)
3. Modify PrismaService to be mockable (forbidden - changes src/\*\*)
4. Add Jest configuration for module mapping (forbidden - changes dependencies)

---

**END OF EVIDENCE**
