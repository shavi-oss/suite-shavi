# Suite PR-1.1 — How to Fix the Tests (Exact Edits)
Target file:
`modules/platform-admin/tests/unit/controllers/org-mapping.controller.spec.ts`

---

## 1) Why tests fail now (code-sourced)
### A) Old test mocks Authorization header
The test currently provides:
- `headers.authorization = 'Bearer jwt-token-123'` fileciteturn36file0L40-L43
and expects the service call to receive extracted token `'jwt-token-123'` fileciteturn36file0L51-L53.

But PR-1 sources token from `req.coreJwt` (server-side), not header.

### B) Guard DI dependencies
`SessionGuard` needs `SessionService` and `JwtStorageService` fileciteturn36file2L9-L12.
`RbacGuard` needs `Reflector` fileciteturn37file0L44-L45.
So the test module must provide these.

---

## 2) Exact changes to apply

### Change A — Add guard-related providers in TestingModule
In `beforeEach`, extend providers with:
- `SessionGuard`
- `RbacGuard`
- `Reflector`
- mock `SessionService` with `validateSession: jest.fn()`
- mock `JwtStorageService` with `get: jest.fn()`

> Note: The guards will not run when calling `controller.create(dto, req)` directly, but Nest still must instantiate them.

### Change B — Update create() tests to use req.coreJwt
In the request object for the create tests:
- Remove `headers.authorization`
- Add `coreJwt: 'jwt-token-123'`

Update expectation:
- `expect(service.create).toHaveBeenCalledWith(dto, 'user-1', 'jwt-token-123', 'corr-1');` should remain token `'jwt-token-123'`, but now sourced from `req.coreJwt` (not extracted from header).

Update the test title:
- from: “with JWT from Authorization header” fileciteturn36file0L28-L33
- to: “with coreJwt from request context (req.coreJwt)”

### Change C — Update the “missing JWT” test
Currently it passes `headers: {}` and expects an error fileciteturn36file0L83-L93.
Change to pass `coreJwt` missing/undefined and keep the same expectation.

---

## 3) Suggested patch (illustrative diff)
```diff
diff --git a/modules/platform-admin/tests/unit/controllers/org-mapping.controller.spec.ts b/modules/platform-admin/tests/unit/controllers/org-mapping.controller.spec.ts
@@
 import { Test, TestingModule } from '@nestjs/testing';
+import { Reflector } from '@nestjs/core';
 import { OrgMappingController } from '../../../src/org-mapping/org-mapping.controller';
 import { OrgMappingService } from '../../../src/org-mapping/org-mapping.service';
+import { SessionGuard } from '../../../src/auth/session.guard';
+import { SessionService } from '../../../src/auth/session.service';
+import { JwtStorageService } from '../../../src/auth/jwt-storage.service';
+import { RbacGuard } from '../../../src/security/rbac.guard';

@@
       providers: [
+        Reflector,
+        SessionGuard,
+        RbacGuard,
+        { provide: SessionService, useValue: { validateSession: jest.fn() } },
+        { provide: JwtStorageService, useValue: { get: jest.fn() } },
         {
           provide: OrgMappingService,
           useValue: {
@@
-    it('should create org mapping with JWT from Authorization header', async () => {
+    it('should create org mapping with coreJwt from request context (req.coreJwt)', async () => {
@@
       const req = {
         headers: {
           'x-correlation-id': 'corr-1',
-          'authorization': 'Bearer jwt-token-123',
         },
+        coreJwt: 'jwt-token-123',
         user: { id: 'user-1' },
       };
@@
       expect(result).toEqual(mockMapping);
       expect(service.create).toHaveBeenCalledWith(dto, 'user-1', 'jwt-token-123', 'corr-1');
     });
@@
       const req = {
-        headers: {
-          'authorization': 'Bearer jwt-token-123',
-        },
+        headers: {},
+        coreJwt: 'jwt-token-123',
         user: { id: 'user-1' },
       };
@@
       const req = {
         headers: {},
+        // coreJwt intentionally missing
         user: { id: 'user-1' },
       };
```
---

## 4) Verification
Run:
```bash
cd modules/platform-admin
npx jest --no-coverage
```
Expected: PASS.

---
END
