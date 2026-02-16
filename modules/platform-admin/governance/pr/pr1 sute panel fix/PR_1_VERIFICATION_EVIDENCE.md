# PR-1 Verification Evidence (PR Folder Snapshot)

> **Evidence Source**: All evidence copied from `modules/platform-admin/governance/_execution/PR_1_EXECUTION_REPORT.md`

---

## 1️⃣ Pre-Commit / Commit Evidence

### HEAD Before

```
d55b4a9b71780e31222bdf7e33195676e4e67e9b
```

### Commit Created

```
commit 7a96ad91f6fd27c7adc85c1086807870c6e28e2b
Author: shavi-oss <eslamabdelshafi2@gmail.com>
Date:   Mon Feb 16 15:30:17 2026 +0200

    platform-admin: source coreJwt from SessionGuard (no UI Authorization)

 modules/platform-admin/src/org-mapping/org-mapping.controller.ts | 5 +++--
 1 file changed, 3 insertions(+), 2 deletions(-)
```

### Commit Message

```
platform-admin: source coreJwt from SessionGuard (no UI Authorization)
```

---

## 2️⃣ Files Changed Evidence

### Command

```bash
git diff --name-only
```

### Output

```
modules/platform-admin/src/org-mapping/org-mapping.controller.ts
```

**Verification**: ✅ ONLY the controller file was modified.

---

## 3️⃣ Minimal Diff Evidence

### Change 1: SessionGuard Import

```diff
 import { Resource, Action } from '../security/permissions.map';
+import { SessionGuard } from '../auth/session.guard';
 import { randomUUID } from 'crypto';
```

### Change 2: UseGuards Decorator

```diff
 @Controller('api/platform-admin/org-mappings')
-@UseGuards(RbacGuard)
+@UseGuards(SessionGuard, RbacGuard)
 export class OrgMappingController {
```

### Change 3: Core JWT Source

```diff
     const userId = req.user.id;
-    const coreJwt = req.headers['authorization']?.replace('Bearer ', '');
+    const coreJwt = req.coreJwt;
```

**Verification**: ✅ Exactly 3 change regions as expected.

---

## 4️⃣ Typecheck Evidence

### Command

```bash
npx tsc --noEmit
```

### Result

✅ **PASS for `src/` directory**

### Notes

- Zero TypeScript errors from `src/` directory
- All errors are pre-existing `client/` JSX configuration issues (unrelated to PR-1)
- The controller change compiles successfully

---

## 5️⃣ Test Evidence

### Command

```bash
npx jest --no-coverage
```

### Result Summary

- **Test Suites**: 25 passed, 1 failed, 26 total
- **Tests**: 216 passed, 5 failed, 221 total
- **Status**: ⚠️ **EXPECTED FAIL** (out-of-scope)

### Failed Tests

All 5 failures in `org-mapping.controller.spec.ts`

### Failure Reason

```
Nest can't resolve dependencies of the SessionGuard (?, JwtStorageService).
Please make sure that the argument SessionService at index [0] is available
in the RootTestModule context.
```

### Root Cause Analysis

- The test file `tests/unit/controllers/org-mapping.controller.spec.ts` creates a minimal testing module with only `OrgMappingService` mocked
- The controller now has `@UseGuards(SessionGuard, RbacGuard)` at class level
- NestJS testing framework attempts to instantiate `SessionGuard`, which requires `SessionService` and `JwtStorageService`
- These dependencies are not provided in the test module, causing DI resolution failure

### Classification

✅ **EXPECTED / OUT-OF-SCOPE**

This failure is a direct consequence of the scoped change and does not indicate a code defect. Per governance rules, test files are **forbidden** from modification in PR-1.

### Follow-up

PR-1.1 will update `org-mapping.controller.spec.ts` to mock SessionGuard dependencies.

---

## 6️⃣ Forbidden Files Confirmation

### Checklist

- ✅ No other source files modified
- ✅ No test files modified (intentionally deferred to PR-1.1)
- ✅ No `package.json` / lockfile changes
- ✅ No tsconfig / jest / config changes
- ✅ No prisma / schema / migration changes
- ✅ No formatting sweeps
- ✅ No Core repository changes

### Verification Command

```bash
git diff --name-only
```

### Output

```
modules/platform-admin/src/org-mapping/org-mapping.controller.ts
```

**Result**: ✅ Only the allowed controller file appears.

---

## 7️⃣ Evidence Source

**All evidence in this file was copied from**:
`modules/platform-admin/governance/_execution/PR_1_EXECUTION_REPORT.md`

**No evidence was invented or inferred**. All command outputs, results, and analysis are sourced from the authoritative execution report.

---

**END**
