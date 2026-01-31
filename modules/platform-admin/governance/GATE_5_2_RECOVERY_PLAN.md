# Gate 5.2 — Recovery Plan

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Module Name    | platform-admin                          |
| Document Title | GATE_5_2_RECOVERY_PLAN                  |
| Repo           | Suite (Layer / Product Repo)            |
| Status         | DIAGNOSIS COMPLETE — AWAITING APPROVAL  |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Date           | 2026-01-31                              |

---

## Problem Statement

**What is Broken**: Gate 5.1 artifact `modules/platform-admin/src/__tests__/prisma.wiring.spec.ts` was **deleted** during Gate 5.2 execution.

**Root Cause**: During Gate 5.2 test location fix, the file was moved from `src/__tests__/` to `tests/unit/policy/` for policy tests, but the **Gate 5.1 wiring test** was accidentally deleted instead of being preserved.

**Impact**:

- Gate 5.1 artifact missing (regression)
- Git shows deletion: `D modules/platform-admin/src/__tests__/prisma.wiring.spec.ts`
- Directory `src/__tests__/` no longer exists
- Gate 5.1 tag `suite-platform-admin-gate-5.1` contains the original file

---

## Diagnostic Commands Output

### Environment

**Repository Root**:

```
D:/Basaan os/suite-shavi
```

**Branch**:

```
master
```

**Current Commit**:

```
6228b08070ae45cc1e7cd594d8f78aa6ae754b3e
```

**Gate 5.1 Tag**: Points to current commit (6228b08)

---

### Working Tree State

**git status --porcelain**:

```
 D modules/platform-admin/src/__tests__/prisma.wiring.spec.ts
 M modules/platform-admin/src/repositories/organization.repository.ts
?? .env
?? modules/platform-admin/governance/GATE_5_2_AUDIT_REPORT.md
?? modules/platform-admin/governance/GATE_5_2_EVIDENCE.md
?? modules/platform-admin/src/policy/
?? modules/platform-admin/src/repositories/repository.guard.ts
?? modules/platform-admin/tests/unit/policy/
```

**git diff --name-only**:

```
modules/platform-admin/src/__tests__/prisma.wiring.spec.ts (DELETED)
modules/platform-admin/src/repositories/organization.repository.ts (MODIFIED)
```

**git diff --stat**:

```
 .../src/__tests__/prisma.wiring.spec.ts            | 38 ----------------------
 .../src/repositories/organization.repository.ts    |  3 ++
 2 files changed, 3 insertions(+), 38 deletions(-)
```

---

### File Status

**File**: `modules/platform-admin/src/__tests__/prisma.wiring.spec.ts`

**Status**: **DELETED** (38 lines removed)

**Directory**: `modules/platform-admin/src/__tests__/` **DOES NOT EXIST**

**Verification**:

```powershell
dir modules\platform-admin\src\__tests__
# Error: Cannot find path ... because it does not exist.
```

---

### Gate 5.1 Tag Content

**Command**: `git show --name-only suite-platform-admin-gate-5.1`

**Commit**:

```
6228b08 (HEAD -> master, tag: suite-platform-admin-gate-5.1, origin/master)
gate(5.1): db integration skeleton (prisma di + org repo + wiring test)
```

**Files in Gate 5.1**:

```
modules/platform-admin/platform-admin.module.ts
modules/platform-admin/src/__tests__/prisma.wiring.spec.ts
modules/platform-admin/src/db/prisma.module.ts
modules/platform-admin/src/db/prisma.service.ts
modules/platform-admin/src/repositories/organization.repository.ts
```

**Confirmation**: File **EXISTS** in tag `suite-platform-admin-gate-5.1`

---

### Deleted File Content

**git diff -- modules/platform-admin/src/**tests**/prisma.wiring.spec.ts**:

```diff
deleted file mode 100644
index 066716f..0000000
--- a/modules/platform-admin/src/__tests__/prisma.wiring.spec.ts
+++ /dev/null
@@ -1,38 +0,0 @@
-import { Test, TestingModule } from '@nestjs/testing';
-import { PlatformAdminModule } from '../../platform-admin.module';
-import { PrismaService } from '../db/prisma.service';
-import { OrganizationRepository } from '../repositories/organization.repository';
-
-describe('PlatformAdmin — Prisma Wiring', () => {
-  let module: TestingModule;
-  let prismaService: PrismaService;
-  let organizationRepository: OrganizationRepository;
-
-  beforeAll(async () => {
-    module = await Test.createTestingModule({
-      imports: [PlatformAdminModule],
-    }).compile();
-
-    prismaService = module.get<PrismaService>(PrismaService);
-    organizationRepository = module.get<OrganizationRepository>(OrganizationRepository);
-  });
-
-  afterAll(async () => {
-    await module.close();
-  });
-
-  it('should provide PrismaService', () => {
-    expect(prismaService).toBeDefined();
-    expect(prismaService).toBeInstanceOf(PrismaService);
-  });
-
-  it('should provide OrganizationRepository', () => {
-    expect(organizationRepository).toBeDefined();
-    expect(organizationRepository).toBeInstanceOf(OrganizationRepository);
-  });
-
-  it('should inject PrismaService into OrganizationRepository', () => {
-    expect(organizationRepository['prisma']).toBeDefined();
-    expect(organizationRepository['prisma']).toBeInstanceOf(PrismaService);
-  });
-});
```

---

## Current Untracked Files

**Gate 5.2 Additions** (all valid):

```
?? modules/platform-admin/governance/GATE_5_2_AUDIT_REPORT.md
?? modules/platform-admin/governance/GATE_5_2_EVIDENCE.md
?? modules/platform-admin/src/policy/
?? modules/platform-admin/src/repositories/repository.guard.ts
?? modules/platform-admin/tests/unit/policy/
```

---

## Proposed Fix Steps

### Step 1: Restore Gate 5.1 Artifact from Tag

**Command**:

```bash
git checkout suite-platform-admin-gate-5.1 -- modules/platform-admin/src/__tests__/prisma.wiring.spec.ts
```

**Expected Result**:

- File restored to `modules/platform-admin/src/__tests__/prisma.wiring.spec.ts`
- Directory `modules/platform-admin/src/__tests__/` created
- File content matches tag exactly (38 lines)

---

### Step 2: Verify Directory Exists

**Command**:

```powershell
dir modules\platform-admin\src\__tests__
```

**Expected Result**:

- Directory exists
- Contains `prisma.wiring.spec.ts`

---

### Step 3: Verify No Unintended Deletions

**Commands**:

```bash
git diff --name-only
git status --porcelain
```

**Expected Result**:

- `prisma.wiring.spec.ts` should appear as **modified** (M) or **untracked** (??)
- No other deletions
- Gate 5.2 files remain untracked

---

### Step 4: Verify Test Discovery

**Commands**:

```bash
npx jest --config jest.config.cjs --listTests
npx jest --config jest.config.cjs
npx tsc -p .
```

**Expected Results**:

- `--listTests`: Shows both `prisma.wiring.spec.ts` (Gate 5.1) AND `data-access.policy.spec.ts` (Gate 5.2)
- `jest`: All tests pass (29 existing + 3 wiring = 32 total, or similar)
- `tsc`: Exit 0 (no errors)

---

### Step 5: Update Evidence Documents

**Files to Update**:

1. `modules/platform-admin/governance/GATE_5_2_AUDIT_REPORT.md`
2. `modules/platform-admin/governance/GATE_5_2_EVIDENCE.md`

**Change**: Add note in both files:

```markdown
**Recovery Note**: Gate 5.1 artifact `src/__tests__/prisma.wiring.spec.ts` was restored from tag `suite-platform-admin-gate-5.1` to remove regression caused by accidental deletion during Gate 5.2 test relocation.
```

---

### Step 6: Final Snapshot

**Commands**:

```bash
git diff --name-only
git status --porcelain
```

**Expected Result**:

- Modified: `organization.repository.ts` (Gate 5.2 policy enforcement)
- Untracked: Gate 5.2 files (policy/, tests/unit/policy/, governance/GATE*5_2*\*)
- Restored: `src/__tests__/prisma.wiring.spec.ts` (should appear as untracked or modified)

---

## Risks & STOP Conditions

### STOP Immediately If:

1. **File Restoration Fails**:
   - `git checkout` command fails
   - Restored file differs from tag content
   - Directory still does not exist after restore

2. **Test Discovery Fails**:
   - Jest does not discover `prisma.wiring.spec.ts` after restore
   - Jest does not discover `data-access.policy.spec.ts` (Gate 5.2)
   - Either test file missing from `--listTests` output

3. **Verification Fails**:
   - `tsc` fails (Exit code != 0)
   - `jest` fails (any test failures)

4. **Scope Violation**:
   - Any file outside `modules/platform-admin/**` touched
   - Unintended modifications to other files

5. **Unintended Side Effects**:
   - Gate 5.2 files deleted or modified unintentionally
   - Other test files affected

---

## Verification Plan

### Pre-Restore Verification

1. **Confirm tag exists**:

   ```bash
   git tag -l suite-platform-admin-gate-5.1
   ```

   Expected: Tag listed

2. **Confirm file in tag**:
   ```bash
   git show suite-platform-admin-gate-5.1:modules/platform-admin/src/__tests__/prisma.wiring.spec.ts
   ```
   Expected: File content displayed (38 lines)

---

### Post-Restore Verification

1. **File Existence**:

   ```bash
   Test-Path modules/platform-admin/src/__tests__/prisma.wiring.spec.ts
   ```

   Expected: True

2. **File Content Match**:

   ```bash
   git diff suite-platform-admin-gate-5.1 -- modules/platform-admin/src/__tests__/prisma.wiring.spec.ts
   ```

   Expected: No output (files identical)

3. **TypeScript Compilation**:

   ```bash
   npx tsc -p .
   ```

   Expected: Exit 0

4. **Jest Test Discovery**:

   ```bash
   npx jest --config jest.config.cjs --listTests | Select-String "prisma.wiring"
   npx jest --config jest.config.cjs --listTests | Select-String "data-access.policy"
   ```

   Expected: Both files found

5. **Jest Test Execution**:

   ```bash
   npx jest --config jest.config.cjs
   ```

   Expected: All tests pass (32 total: 24 existing + 5 policy + 3 wiring)

6. **Git Status Clean**:
   ```bash
   git status --porcelain
   ```
   Expected: No deletions (D), only modifications (M) and untracked (??)

---

## Success Criteria

✅ Gate 5.1 artifact restored exactly from tag
✅ Directory `src/__tests__/` exists
✅ No unintended deletions remain
✅ Jest discovers both Gate 5.1 and Gate 5.2 tests
✅ All tests pass (tsc + jest)
✅ Scope compliance maintained (all changes under `modules/platform-admin/**`)
✅ Evidence documents updated with recovery note

---

## AWAITING APPROVAL TO EXECUTE PHASE B
