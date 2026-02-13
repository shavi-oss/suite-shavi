# GATE 6A — VERIFICATION EVIDENCE (FINAL)

## التحكم في المستند (Document Control)

| الخاصية (Attribute)          | القيمة (Value)                                            |
| :--------------------------- | :-------------------------------------------------------- |
| رقم البوابة (Gate Number)    | 6A                                                        |
| اسم البوابة (Gate Name)      | تمكين وقت التشغيل في بيئة التطوير (Verification Evidence) |
| حالة المستند (Status)        | نهائي — ناجح (FINAL — PASS (VERIFIED))                    |
| نمط التنفيذ (Execution Mode) | صارم · إغلاق عند الفشل (STRICT · FAIL-CLOSED)             |
| السلطة (Authority)           | سلطة الحوكمة (Governance Authority)                       |
| تاريخ التحديث (Last Updated) | 2026-02-13                                                |

---

## 1) أوامر التحقق (Verification Commands)

سيتم تشغيل الأوامر التالية لتوثيق حالة النظام بعد التنفيذ:

```bash
git status --porcelain
git diff --name-only
git diff --stat
git diff package.json
git diff package-lock.json
npx tsc -p modules/platform-admin/tsconfig.bff.json --noEmit
npm run test:platform-admin
```

---

## 2) المخرجات المتوقعة (Expected Outputs)

- **git diff:** MUST match Gate 6A allowlist ONLY (Clean State).
  \suite-shavi> git diff --name-only
  modules/platform-admin/governance/GATE_6A_AUTHORIZATION.md
  modules/platform-admin/governance/GATE_6A_EXECUTION_REPORT.md
  modules/platform-admin/governance/GATE_6A_VERIFICATION_EVIDENCE.md
  modules/platform-admin/index.ts

- **npx tsc -p modules/platform-admin/tsconfig.bff.json --noEmit:** PASS (No errors).
  \suite-shavi> npx tsc -p modules/platform-admin/tsconfig.bff.json --noEmit

- **npm run test:platform-admin (Standard):** Print Disabled Message + Exit 0.
  suite-shavi> npm run test:platform-admin

> suite-shavi@1.0.0 test:platform-admin
> npx jest -c jest.config.cjs modules/platform-admin/tests

RUNS ...tform-admin/tests/integration/org-mapping.http.integration.spec.ts
RUNS modules/platform-admin/tests/unit/auth/auth.controller.spec.ts
RUNS ...form-admin/tests/unit/internal-users/internal-user.service.spec.ts
RUNS modules/platform-admin/tests/unit/security/rbac.guard.spec.ts
RUNS modules/platform-admin/tests/unit/auth/jwt-storage.service.spec.ts
RUNS ...tform-admin/tests/unit/repositories/org-mapping.repository.spec.ts
RUNS modules/platform-admin/tests/unit/db/prisma.wiring.spec.ts
RUNS ...m-admin/tests/unit/internal-users/internal-user.repository.spec.ts
RUNS modules/platform-admin/tests/unit/audit/audit.service.spec.ts

RUNS ...tform-admin/tests/integration/org-mapping.http.integration.spec.ts
RUNS modules/platform-admin/tests/unit/auth/auth.controller.spec.ts  
 RUNS ...form-admin/tests/unit/internal-users/internal-user.service.spec.ts
RUNS modules/platform-admin/tests/unit/security/rbac.guard.spec.ts  
 RUNS modules/platform-admin/tests/unit/auth/jwt-storage.service.spec.ts  
 RUNS ...tform-admin/tests/unit/repositories/org-mapping.repository.spec.ts
RUNS modules/platform-admin/tests/unit/db/prisma.wiring.spec.ts
RUNS ...m-admin/tests/unit/internal-users/internal-user.repository.spec.ts
RUNS modules/platform-admin/tests/unit/audit/audit.service.spec.ts

RUNS ...tform-admin/tests/integration/org-mapping.http.integration.spec.ts
RUNS modules/platform-admin/tests/unit/auth/auth.controller.spec.ts  
 RUNS ...form-admin/tests/unit/internal-users/internal-user.service.spec.ts
RUNS modules/platform-admin/tests/unit/security/rbac.guard.spec.ts  
 RUNS modules/platform-admin/tests/unit/auth/jwt-storage.service.spec.ts  
 RUNS ...tform-admin/tests/unit/repositories/org-mapping.repository.spec.ts
RUNS modules/platform-admin/tests/unit/db/prisma.wiring.spec.ts
RUNS ...m-admin/tests/unit/internal-users/internal-user.repository.spec.ts
RUNS modules/platform-admin/tests/unit/audit/audit.service.spec.ts

RUNS ...tform-admin/tests/integration/org-mapping.http.integration.spec.ts
RUNS modules/platform-admin/tests/unit/auth/auth.controller.spec.ts  
 RUNS ...form-admin/tests/unit/internal-users/internal-user.service.spec.ts
RUNS modules/platform-admin/tests/unit/security/rbac.guard.spec.ts  
 RUNS modules/platform-admin/tests/unit/auth/jwt-storage.service.spec.ts  
 RUNS ...tform-admin/tests/unit/repositories/org-mapping.repository.spec.ts
RUNS modules/platform-admin/tests/unit/db/prisma.wiring.spec.ts
RUNS ...m-admin/tests/unit/internal-users/internal-user.repository.spec.ts
RUNS modules/platform-admin/tests/unit/audit/audit.service.spec.ts

RUNS ...tform-admin/tests/integration/org-mapping.http.integration.spec.ts
RUNS modules/platform-admin/tests/unit/auth/auth.controller.spec.ts  
 RUNS ...form-admin/tests/unit/internal-users/internal-user.service.spec.ts
RUNS modules/platform-admin/tests/unit/security/rbac.guard.spec.ts  
 RUNS modules/platform-admin/tests/unit/auth/jwt-storage.service.spec.ts  
 RUNS ...tform-admin/tests/unit/repositories/org-mapping.repository.spec.ts
RUNS modules/platform-admin/tests/unit/db/prisma.wiring.spec.ts
RUNS ...m-admin/tests/unit/internal-users/internal-user.repository.spec.ts
RUNS modules/platform-admin/tests/unit/audit/audit.service.spec.ts

RUNS ...tform-admin/tests/integration/org-mapping.http.integration.spec.ts
RUNS modules/platform-admin/tests/unit/auth/auth.controller.spec.ts
RUNS ...form-admin/tests/unit/internal-users/internal-user.service.spec.ts
RUNS modules/platform-admin/tests/unit/security/rbac.guard.spec.ts
RUNS modules/platform-admin/tests/unit/auth/jwt-storage.service.spec.ts
RUNS ...tform-admin/tests/unit/repositories/org-mapping.repository.spec.ts
RUNS modules/platform-admin/tests/unit/db/prisma.wiring.spec.ts
RUNS ...m-admin/tests/unit/internal-users/internal-user.repository.spec.ts
RUNS modules/platform-admin/tests/unit/audit/audit.service.spec.ts

RUNS ...tform-admin/tests/integration/org-mapping.http.integration.spec.ts
RUNS modules/platform-admin/tests/unit/auth/auth.controller.spec.ts
RUNS ...form-admin/tests/unit/internal-users/internal-user.service.spec.ts
RUNS modules/platform-admin/tests/unit/security/rbac.guard.spec.ts
RUNS modules/platform-admin/tests/unit/auth/jwt-storage.service.spec.ts
RUNS ...tform-admin/tests/unit/repositories/org-mapping.repository.spec.ts
RUNS modules/platform-admin/tests/unit/db/prisma.wiring.spec.ts
RUNS ...m-admin/tests/unit/internal-users/internal-user.repository.spec.ts
RUNS modules/platform-admin/tests/unit/audit/audit.service.spec.ts

RUNS ...tform-admin/tests/integration/org-mapping.http.integration.spec.ts
RUNS modules/platform-admin/tests/unit/auth/auth.controller.spec.ts
RUNS ...form-admin/tests/unit/internal-users/internal-user.service.spec.ts
RUNS modules/platform-admin/tests/unit/security/rbac.guard.spec.ts
RUNS modules/platform-admin/tests/unit/auth/jwt-storage.service.spec.ts
RUNS ...tform-admin/tests/unit/repositories/org-mapping.repository.spec.ts
RUNS modules/platform-admin/tests/unit/db/prisma.wiring.spec.ts
RUNS ...m-admin/tests/unit/internal-users/internal-user.repository.spec.ts
RUNS modules/platform-admin/tests/unit/audit/audit.service.spec.ts

RUNS ...tform-admin/tests/integration/org-mapping.http.integration.spec.ts
RUNS modules/platform-admin/tests/unit/auth/auth.controller.spec.ts
RUNS ...form-admin/tests/unit/internal-users/internal-user.service.spec.ts
RUNS modules/platform-admin/tests/unit/security/rbac.guard.spec.ts
RUNS modules/platform-admin/tests/unit/auth/jwt-storage.service.spec.ts
RUNS ...tform-admin/tests/unit/repositories/org-mapping.repository.spec.ts
RUNS modules/platform-admin/tests/unit/db/prisma.wiring.spec.ts
RUNS ...m-admin/tests/unit/internal-users/internal-user.repository.spec.ts
RUNS modules/platform-admin/tests/unit/audit/audit.service.spec.ts

RUNS ...tform-admin/tests/integration/org-mapping.http.integration.spec.ts
RUNS modules/platform-admin/tests/unit/auth/auth.controller.spec.ts
RUNS ...form-admin/tests/unit/internal-users/internal-user.service.spec.ts
RUNS modules/platform-admin/tests/unit/security/rbac.guard.spec.ts
RUNS modules/platform-admin/tests/unit/auth/jwt-storage.service.spec.ts
RUNS ...tform-admin/tests/unit/repositories/org-mapping.repository.spec.ts
RUNS modules/platform-admin/tests/unit/db/prisma.wiring.spec.ts
RUNS ...m-admin/tests/unit/internal-users/internal-user.repository.spec.ts
RUNS modules/platform-admin/tests/unit/audit/audit.service.spec.ts

RUNS ...tform-admin/tests/integration/org-mapping.http.integration.spec.ts
RUNS modules/platform-admin/tests/unit/auth/auth.controller.spec.ts
RUNS ...form-admin/tests/unit/internal-users/internal-user.service.spec.ts
RUNS modules/platform-admin/tests/unit/security/rbac.guard.spec.ts
RUNS modules/platform-admin/tests/unit/auth/jwt-storage.service.spec.ts
RUNS ...tform-admin/tests/unit/repositories/org-mapping.repository.spec.ts
RUNS modules/platform-admin/tests/unit/db/prisma.wiring.spec.ts
RUNS ...m-admin/tests/unit/internal-users/internal-user.repository.spec.ts
RUNS modules/platform-admin/tests/unit/audit/audit.service.spec.ts

RUNS ...tform-admin/tests/integration/org-mapping.http.integration.spec.ts
RUNS modules/platform-admin/tests/unit/auth/auth.controller.spec.ts
RUNS ...form-admin/tests/unit/internal-users/internal-user.service.spec.ts
RUNS modules/platform-admin/tests/unit/security/rbac.guard.spec.ts
RUNS modules/platform-admin/tests/unit/auth/jwt-storage.service.spec.ts
RUNS ...tform-admin/tests/unit/repositories/org-mapping.repository.spec.ts
RUNS modules/platform-admin/tests/unit/db/prisma.wiring.spec.ts
RUNS ...m-admin/tests/unit/internal-users/internal-user.repository.spec.ts
RUNS modules/platform-admin/tests/unit/audit/audit.service.spec.ts

RUNS ...tform-admin/tests/integration/org-mapping.http.integration.spec.ts
RUNS modules/platform-admin/tests/unit/auth/auth.controller.spec.ts
RUNS ...form-admin/tests/unit/internal-users/internal-user.service.spec.ts
RUNS modules/platform-admin/tests/unit/security/rbac.guard.spec.ts
RUNS modules/platform-admin/tests/unit/auth/jwt-storage.service.spec.ts
RUNS ...tform-admin/tests/unit/repositories/org-mapping.repository.spec.ts
RUNS modules/platform-admin/tests/unit/db/prisma.wiring.spec.ts
RUNS ...m-admin/tests/unit/internal-users/internal-user.repository.spec.ts
RUNS modules/platform-admin/tests/unit/audit/audit.service.spec.ts

RUNS ...tform-admin/tests/integration/org-mapping.http.integration.spec.ts
RUNS modules/platform-admin/tests/unit/auth/auth.controller.spec.ts
RUNS ...form-admin/tests/unit/internal-users/internal-user.service.spec.ts
RUNS modules/platform-admin/tests/unit/security/rbac.guard.spec.ts
RUNS modules/platform-admin/tests/unit/auth/jwt-storage.service.spec.ts
RUNS ...tform-admin/tests/unit/repositories/org-mapping.repository.spec.ts
RUNS modules/platform-admin/tests/unit/db/prisma.wiring.spec.ts
RUNS ...m-admin/tests/unit/internal-users/internal-user.repository.spec.ts
RUNS modules/platform-admin/tests/unit/audit/audit.service.spec.ts

RUNS ...tform-admin/tests/integration/org-mapping.http.integration.spec.ts
RUNS modules/platform-admin/tests/unit/auth/auth.controller.spec.ts
RUNS ...form-admin/tests/unit/internal-users/internal-user.service.spec.ts
RUNS modules/platform-admin/tests/unit/security/rbac.guard.spec.ts
RUNS modules/platform-admin/tests/unit/auth/jwt-storage.service.spec.ts
RUNS ...tform-admin/tests/unit/repositories/org-mapping.repository.spec.ts
RUNS modules/platform-admin/tests/unit/db/prisma.wiring.spec.ts
RUNS ...m-admin/tests/unit/internal-users/internal-user.repository.spec.ts
RUNS modules/platform-admin/tests/unit/audit/audit.service.spec.ts

RUNS ...tform-admin/tests/integration/org-mapping.http.integration.spec.ts
RUNS modules/platform-admin/tests/unit/auth/auth.controller.spec.ts
RUNS ...form-admin/tests/unit/internal-users/internal-user.service.spec.ts
RUNS modules/platform-admin/tests/unit/security/rbac.guard.spec.ts
RUNS modules/platform-admin/tests/unit/auth/jwt-storage.service.spec.ts
RUNS ...tform-admin/tests/unit/repositories/org-mapping.repository.spec.ts
RUNS modules/platform-admin/tests/unit/db/prisma.wiring.spec.ts
RUNS ...m-admin/tests/unit/internal-users/internal-user.repository.spec.ts
RUNS modules/platform-admin/tests/unit/audit/audit.service.spec.ts

RUNS ...tform-admin/tests/integration/org-mapping.http.integration.spec.ts
RUNS modules/platform-admin/tests/unit/auth/auth.controller.spec.ts
RUNS ...form-admin/tests/unit/internal-users/internal-user.service.spec.ts
RUNS modules/platform-admin/tests/unit/security/rbac.guard.spec.ts
RUNS modules/platform-admin/tests/unit/auth/jwt-storage.service.spec.ts
RUNS ...tform-admin/tests/unit/repositories/org-mapping.repository.spec.ts
RUNS modules/platform-admin/tests/unit/db/prisma.wiring.spec.ts
RUNS ...m-admin/tests/unit/internal-users/internal-user.repository.spec.ts
RUNS modules/platform-admin/tests/unit/audit/audit.service.spec.ts
PASS modules/platform-admin/tests/unit/guards/deny-all.guard.spec.ts (14.507 s)

RUNS ...tform-admin/tests/integration/org-mapping.http.integration.spec.ts
RUNS modules/platform-admin/tests/unit/auth/auth.controller.spec.ts  
 RUNS ...form-admin/tests/unit/internal-users/internal-user.service.spec.ts
RUNS modules/platform-admin/tests/unit/security/rbac.guard.spec.ts  
 RUNS modules/platform-admin/tests/unit/auth/jwt-storage.service.spec.ts  
 RUNS ...tform-admin/tests/unit/repositories/org-mapping.repository.spec.ts
RUNS modules/platform-admin/tests/unit/db/prisma.wiring.spec.ts
RUNS ...m-admin/tests/unit/internal-users/internal-user.repository.spec.ts
RUNS modules/platform-admin/tests/unit/audit/audit.service.spec.ts

RUNS ...tform-admin/tests/integration/org-mapping.http.integration.spec.ts
RUNS modules/platform-admin/tests/unit/auth/auth.controller.spec.ts  
 RUNS ...form-admin/tests/unit/internal-users/internal-user.service.spec.ts
RUNS modules/platform-admin/tests/unit/security/rbac.guard.spec.ts  
 RUNS modules/platform-admin/tests/unit/auth/jwt-storage.service.spec.ts  
 RUNS ...tform-admin/tests/unit/repositories/org-mapping.repository.spec.ts
RUNS modules/platform-admin/tests/unit/db/prisma.wiring.spec.ts
RUNS ...m-admin/tests/unit/internal-users/internal-user.repository.spec.ts
RUNS modules/platform-admin/tests/unit/audit/audit.service.spec.ts

RUNS ...tform-admin/tests/integration/org-mapping.http.integration.spec.ts
RUNS modules/platform-admin/tests/unit/auth/auth.controller.spec.ts
RUNS ...form-admin/tests/unit/internal-users/internal-user.service.spec.ts
RUNS modules/platform-admin/tests/unit/security/rbac.guard.spec.ts
RUNS modules/platform-admin/tests/unit/auth/jwt-storage.service.spec.ts
RUNS ...tform-admin/tests/unit/repositories/org-mapping.repository.spec.ts
RUNS modules/platform-admin/tests/unit/db/prisma.wiring.spec.ts
RUNS ...m-admin/tests/unit/internal-users/internal-user.repository.spec.ts
RUNS modules/platform-admin/tests/unit/audit/audit.service.spec.ts

RUNS ...tform-admin/tests/integration/org-mapping.http.integration.spec.ts
RUNS modules/platform-admin/tests/unit/auth/auth.controller.spec.ts
RUNS ...form-admin/tests/unit/internal-users/internal-user.service.spec.ts
RUNS modules/platform-admin/tests/unit/security/rbac.guard.spec.ts
RUNS modules/platform-admin/tests/unit/auth/jwt-storage.service.spec.ts
RUNS ...tform-admin/tests/unit/repositories/org-mapping.repository.spec.ts
RUNS modules/platform-admin/tests/unit/db/prisma.wiring.spec.ts
RUNS ...m-admin/tests/unit/internal-users/internal-user.repository.spec.ts
RUNS modules/platform-admin/tests/unit/audit/audit.service.spec.ts
PASS modules/platform-admin/tests/unit/controllers/health.controller.spec.ts (14.938 s)

RUNS ...tform-admin/tests/integration/org-mapping.http.integration.spec.ts
RUNS modules/platform-admin/tests/unit/auth/auth.controller.spec.ts  
 RUNS ...form-admin/tests/unit/internal-users/internal-user.service.spec.ts
RUNS modules/platform-admin/tests/unit/security/rbac.guard.spec.ts  
 RUNS modules/platform-admin/tests/unit/auth/jwt-storage.service.spec.ts  
 RUNS ...tform-admin/tests/unit/repositories/org-mapping.repository.spec.ts
RUNS modules/platform-admin/tests/unit/db/prisma.wiring.spec.ts
RUNS ...m-admin/tests/unit/internal-users/internal-user.repository.spec.ts
RUNS modules/platform-admin/tests/unit/audit/audit.service.spec.ts

RUNS ...tform-admin/tests/integration/org-mapping.http.integration.spec.ts
RUNS modules/platform-admin/tests/unit/auth/auth.controller.spec.ts  
 RUNS ...form-admin/tests/unit/internal-users/internal-user.service.spec.ts
RUNS modules/platform-admin/tests/unit/security/rbac.guard.spec.ts  
 RUNS modules/platform-admin/tests/unit/auth/jwt-storage.service.spec.ts  
 RUNS ...tform-admin/tests/unit/repositories/org-mapping.repository.spec.ts
RUNS modules/platform-admin/tests/unit/db/prisma.wiring.spec.ts
RUNS ...m-admin/tests/unit/internal-users/internal-user.repository.spec.ts
RUNS modules/platform-admin/tests/unit/audit/audit.service.spec.ts

RUNS ...tform-admin/tests/integration/org-mapping.http.integration.spec.ts
RUNS modules/platform-admin/tests/unit/auth/auth.controller.spec.ts
RUNS ...form-admin/tests/unit/internal-users/internal-user.service.spec.ts
RUNS modules/platform-admin/tests/unit/security/rbac.guard.spec.ts
RUNS modules/platform-admin/tests/unit/auth/jwt-storage.service.spec.ts
RUNS ...tform-admin/tests/unit/repositories/org-mapping.repository.spec.ts
RUNS modules/platform-admin/tests/unit/db/prisma.wiring.spec.ts
RUNS ...m-admin/tests/unit/internal-users/internal-user.repository.spec.ts
RUNS modules/platform-admin/tests/unit/audit/audit.service.spec.ts
PASS modules/platform-admin/tests/unit/services/org-mapping.service.spec.ts (15.278 s)

RUNS ...tform-admin/tests/integration/org-mapping.http.integration.spec.ts
RUNS modules/platform-admin/tests/unit/auth/auth.controller.spec.ts  
 RUNS ...form-admin/tests/unit/internal-users/internal-user.service.spec.ts
RUNS modules/platform-admin/tests/unit/security/rbac.guard.spec.ts  
 RUNS modules/platform-admin/tests/unit/auth/jwt-storage.service.spec.ts  
 RUNS ...tform-admin/tests/unit/repositories/org-mapping.repository.spec.ts
RUNS modules/platform-admin/tests/unit/db/prisma.wiring.spec.ts
RUNS ...m-admin/tests/unit/internal-users/internal-user.repository.spec.ts
RUNS modules/platform-admin/tests/unit/audit/audit.service.spec.ts  
 PASS modules/platform-admin/tests/unit/core-adapter/core.contract.assert.spec.ts

RUNS ...tform-admin/tests/integration/org-mapping.http.integration.spec.ts
RUNS modules/platform-admin/tests/unit/auth/auth.controller.spec.ts  
 RUNS ...form-admin/tests/unit/internal-users/internal-user.service.spec.ts
RUNS modules/platform-admin/tests/unit/security/rbac.guard.spec.ts  
 RUNS modules/platform-admin/tests/unit/auth/jwt-storage.service.spec.ts  
 RUNS ...tform-admin/tests/unit/repositories/org-mapping.repository.spec.ts
RUNS modules/platform-admin/tests/unit/db/prisma.wiring.spec.ts
RUNS ...m-admin/tests/unit/internal-users/internal-user.repository.spec.ts
RUNS modules/platform-admin/tests/unit/audit/audit.service.spec.ts

RUNS ...tform-admin/tests/integration/org-mapping.http.integration.spec.ts
RUNS modules/platform-admin/tests/unit/auth/auth.controller.spec.ts  
 RUNS ...form-admin/tests/unit/internal-users/internal-user.service.spec.ts
RUNS modules/platform-admin/tests/unit/security/rbac.guard.spec.ts  
 RUNS modules/platform-admin/tests/unit/auth/jwt-storage.service.spec.ts  
 RUNS ...tform-admin/tests/unit/repositories/org-mapping.repository.spec.ts
RUNS modules/platform-admin/tests/unit/db/prisma.wiring.spec.ts
RUNS ...m-admin/tests/unit/internal-users/internal-user.repository.spec.ts
PASS modules/platform-admin/tests/unit/auth/auth.controller.spec.ts (15.366 s)

RUNS ...tform-admin/tests/integration/org-mapping.http.integration.spec.ts
RUNS modules/platform-admin/tests/unit/auth/auth.controller.spec.ts  
 RUNS ...form-admin/tests/unit/internal-users/internal-user.service.spec.ts
RUNS modules/platform-admin/tests/unit/security/rbac.guard.spec.ts  
 RUNS modules/platform-admin/tests/unit/auth/jwt-storage.service.spec.ts  
 RUNS ...tform-admin/tests/unit/repositories/org-mapping.repository.spec.ts
RUNS modules/platform-admin/tests/unit/db/prisma.wiring.spec.ts
RUNS ...m-admin/tests/unit/internal-users/internal-user.repository.spec.ts
[Nest] 47644 - 02/13/2026, 7:56:09 PM ERROR [CoreClient] Object(4) {  
 message: 'Core auth failure',
correlationId: 'correlation-123',
coreOrgId: 'core-org-1',
statusCode: 401
}

RUNS ...tform-admin/tests/integration/org-mapping.http.integration.spec.ts
RUNS modules/platform-admin/tests/unit/auth/auth.controller.spec.ts  
 RUNS ...form-admin/tests/unit/internal-users/internal-user.service.spec.ts
RUNS modules/platform-admin/tests/unit/security/rbac.guard.spec.ts  
 RUNS modules/platform-admin/tests/unit/auth/jwt-storage.service.spec.ts  
 RUNS ...tform-admin/tests/unit/repositories/org-mapping.repository.spec.ts
RUNS modules/platform-admin/tests/unit/db/prisma.wiring.spec.ts
RUNS ...m-admin/tests/unit/internal-users/internal-user.repository.spec.ts

RUNS ...tform-admin/tests/integration/org-mapping.http.integration.spec.ts
RUNS ...form-admin/tests/unit/internal-users/internal-user.service.spec.ts
RUNS modules/platform-admin/tests/unit/security/rbac.guard.spec.ts  
 RUNS modules/platform-admin/tests/unit/auth/jwt-storage.service.spec.ts  
 RUNS ...tform-admin/tests/unit/repositories/org-mapping.repository.spec.ts
RUNS modules/platform-admin/tests/unit/db/prisma.wiring.spec.ts
RUNS ...m-admin/tests/unit/internal-users/internal-user.repository.spec.ts
[Nest] 47644 - 02/13/2026, 7:56:09 PM ERROR [CoreClient] Object(4) {  
 message: 'Core auth failure',
correlationId: 'correlation-123',
coreOrgId: 'core-org-1',
statusCode: 403
}
[Nest] 47644 - 02/13/2026, 7:56:09 PM ERROR [CoreClient] Object(4) {  
 message: 'Core auth failure',
correlationId: 'correlation-123',
coreOrgId: 'core-org-1',
statusCode: 401
}

RUNS ...tform-admin/tests/integration/org-mapping.http.integration.spec.ts
RUNS ...form-admin/tests/unit/internal-users/internal-user.service.spec.ts
RUNS modules/platform-admin/tests/unit/security/rbac.guard.spec.ts  
 RUNS modules/platform-admin/tests/unit/auth/jwt-storage.service.spec.ts  
 RUNS ...tform-admin/tests/unit/repositories/org-mapping.repository.spec.ts
RUNS modules/platform-admin/tests/unit/db/prisma.wiring.spec.ts
RUNS ...m-admin/tests/unit/internal-users/internal-user.repository.spec.ts
PASS modules/platform-admin/tests/unit/controllers/internal-user.controller.spec.ts (15.366 s)

RUNS ...tform-admin/tests/integration/org-mapping.http.integration.spec.ts
RUNS ...form-admin/tests/unit/internal-users/internal-user.service.spec.ts
RUNS modules/platform-admin/tests/unit/security/rbac.guard.spec.ts  
 RUNS modules/platform-admin/tests/unit/auth/jwt-storage.service.spec.ts  
 RUNS ...tform-admin/tests/unit/repositories/org-mapping.repository.spec.ts
RUNS modules/platform-admin/tests/unit/db/prisma.wiring.spec.ts
RUNS ...m-admin/tests/unit/internal-users/internal-user.repository.spec.ts
[Nest] 47644 - 02/13/2026, 7:56:09 PM ERROR [CoreClient] Object(4) {  
 message: 'Core auth failure',
correlationId: 'correlation-123',
coreOrgId: 'core-org-1',
statusCode: 403
}

RUNS ...tform-admin/tests/integration/org-mapping.http.integration.spec.ts
RUNS ...form-admin/tests/unit/internal-users/internal-user.service.spec.ts
RUNS modules/platform-admin/tests/unit/security/rbac.guard.spec.ts  
 RUNS modules/platform-admin/tests/unit/auth/jwt-storage.service.spec.ts  
 RUNS ...tform-admin/tests/unit/repositories/org-mapping.repository.spec.ts
RUNS modules/platform-admin/tests/unit/db/prisma.wiring.spec.ts
RUNS ...m-admin/tests/unit/internal-users/internal-user.repository.spec.ts
PASS modules/platform-admin/tests/unit/policy/data-access.policy.spec.ts

RUNS ...tform-admin/tests/integration/org-mapping.http.integration.spec.ts
RUNS ...form-admin/tests/unit/internal-users/internal-user.service.spec.ts
RUNS modules/platform-admin/tests/unit/security/rbac.guard.spec.ts  
 RUNS modules/platform-admin/tests/unit/auth/jwt-storage.service.spec.ts  
 RUNS ...tform-admin/tests/unit/repositories/org-mapping.repository.spec.ts
RUNS modules/platform-admin/tests/unit/db/prisma.wiring.spec.ts
RUNS ...m-admin/tests/unit/internal-users/internal-user.repository.spec.ts
PASS modules/platform-admin/tests/unit/internal-users/internal-user.repository.spec.ts (15.63 s)

RUNS ...tform-admin/tests/integration/org-mapping.http.integration.spec.ts
RUNS ...form-admin/tests/unit/internal-users/internal-user.service.spec.ts
RUNS modules/platform-admin/tests/unit/security/rbac.guard.spec.ts  
 RUNS modules/platform-admin/tests/unit/auth/jwt-storage.service.spec.ts  
 RUNS ...tform-admin/tests/unit/repositories/org-mapping.repository.spec.ts
RUNS modules/platform-admin/tests/unit/db/prisma.wiring.spec.ts
RUNS ...m-admin/tests/unit/internal-users/internal-user.repository.spec.ts
PASS modules/platform-admin/tests/unit/integration/auth-flow.integration.spec.ts (15.559 s)

RUNS ...tform-admin/tests/integration/org-mapping.http.integration.spec.ts
RUNS ...form-admin/tests/unit/internal-users/internal-user.service.spec.ts
RUNS modules/platform-admin/tests/unit/security/rbac.guard.spec.ts  
 RUNS modules/platform-admin/tests/unit/auth/jwt-storage.service.spec.ts  
 RUNS ...tform-admin/tests/unit/repositories/org-mapping.repository.spec.ts
RUNS modules/platform-admin/tests/unit/db/prisma.wiring.spec.ts
RUNS ...m-admin/tests/unit/internal-users/internal-user.repository.spec.ts
PASS modules/platform-admin/tests/unit/security/rbac.guard.spec.ts (15.619 s)

RUNS ...tform-admin/tests/integration/org-mapping.http.integration.spec.ts
RUNS ...form-admin/tests/unit/internal-users/internal-user.service.spec.ts
RUNS modules/platform-admin/tests/unit/security/rbac.guard.spec.ts  
 RUNS modules/platform-admin/tests/unit/auth/jwt-storage.service.spec.ts  
 RUNS ...tform-admin/tests/unit/repositories/org-mapping.repository.spec.ts
RUNS modules/platform-admin/tests/unit/db/prisma.wiring.spec.ts
RUNS ...m-admin/tests/unit/internal-users/internal-user.repository.spec.ts
PASS modules/platform-admin/tests/unit/auth/session.guard.spec.ts (15.606 s)

RUNS ...tform-admin/tests/integration/org-mapping.http.integration.spec.ts
RUNS ...form-admin/tests/unit/internal-users/internal-user.service.spec.ts
RUNS modules/platform-admin/tests/unit/security/rbac.guard.spec.ts  
 RUNS modules/platform-admin/tests/unit/auth/jwt-storage.service.spec.ts  
 RUNS ...tform-admin/tests/unit/repositories/org-mapping.repository.spec.ts
RUNS modules/platform-admin/tests/unit/db/prisma.wiring.spec.ts
RUNS ...m-admin/tests/unit/internal-users/internal-user.repository.spec.ts

RUNS ...tform-admin/tests/integration/org-mapping.http.integration.spec.ts

RUNS ...tform-admin/tests/integration/org-mapping.http.integration.spec.ts
PASS modules/platform-admin/tests/security/fail-closed.spec.ts (15.893 s)

RUNS ...tform-admin/tests/integration/org-mapping.http.integration.spec.ts

PASS modules/platform-admin/tests/non-regression/build.spec.ts

● Console

    console.log
      [GATE_6A] Dev runtime disabled (set PLATFORM_ADMIN_DEV_RUNTIME=true to enable).

      at Object.<anonymous> (modules/platform-admin/index.ts:16:11)

PASS modules/platform-admin/tests/unit/repositories/org-mapping.repository.spec.ts (16.133 s)
[Nest] 30912 - 02/13/2026, 7:56:11 PM ERROR [CoreClient] Object(4) {
message: 'Core auth failure',
correlationId: 'corr-1',
coreOrgId: 'core-1',
statusCode: 401
}
[Nest] 30912 - 02/13/2026, 7:56:11 PM ERROR [CoreClient] Object(4) {
message: 'Core auth failure',  
 correlationId: 'corr-1',  
 coreOrgId: 'core-1',  
 statusCode: 403  
}  
[Nest] 30912 - 02/13/2026, 7:56:11 PM ERROR [CoreClient] Object(4) {  
 message: 'Core API error',  
 correlationId: 'corr-1',  
 coreOrgId: 'core-1',  
 statusCode: 500  
}  
[Nest] 30912 - 02/13/2026, 7:56:11 PM ERROR [CoreClient] Object(4) {  
 message: 'Core API error',
correlationId: 'corr-1',
coreOrgId: 'core-1',
statusCode: 503
}
[Nest] 30912 - 02/13/2026, 7:56:11 PM ERROR [CoreClient] Object(4) {
message: 'Core API network error',  
 correlationId: 'corr-1',  
 coreOrgId: 'core-1',  
 errorCode: 'CORE_CLIENT_FAILED'  
}  
[Nest] 30912 - 02/13/2026, 7:56:11 PM ERROR [CoreClient] Object(4) {  
 message: 'Core API network error',
correlationId: 'corr-1',
coreOrgId: 'core-1',
errorCode: 'CORE_CLIENT_FAILED'
}
PASS modules/platform-admin/tests/unit/core-adapter/core.client.spec.ts (17.1 s)
PASS modules/platform-admin/tests/unit/guards/explicit-allow.guard.spec.ts (17.155 s)
[Nest] 30912 - 02/13/2026, 7:56:11 PM LOG [CoreClient] Object(4) {
message: 'Core org validation succeeded',
correlationId: 'corr-1',
coreOrgId: 'core-1',
statusCode: 200
}
[Nest] 30912 - 02/13/2026, 7:56:11 PM WARN [CoreClient] Object(4) {  
 message: 'Core org not found',
correlationId: 'corr-1',
coreOrgId: 'core-1',
statusCode: 404
}
PASS modules/platform-admin/tests/integration/org-mapping.integration.spec.ts (17.298 s)
PASS modules/platform-admin/tests/unit/auth/jwt-storage.service.spec.ts (17.751 s)
PASS modules/platform-admin/tests/unit/internal-users/internal-user.service.spec.ts (17.655 s)
PASS modules/platform-admin/tests/unit/auth/session.service.spec.ts (17.895 s)
PASS modules/platform-admin/tests/unit/controllers/audit.controller.spec.ts (17.907 s)
PASS modules/platform-admin/tests/unit/controllers/org-mapping.controller.spec.ts (17.785 s)
[Nest] 53212 - 02/13/2026, 7:56:12 PM ERROR [AuditService] Object(5) {
message: 'Audit log creation failed',
correlationId: 'test-correlation-id',
entityType: 'organization',
action: 'create',
errorCode: 'AUDIT_WRITE_FAILED'
}
[Nest] 53212 - 02/13/2026, 7:56:12 PM ERROR [AuditService] Object(5) {
message: 'Audit log creation failed',
correlationId: 'test-correlation-id',
entityType: 'org_mapping',
action: 'link',
errorCode: 'AUDIT_WRITE_FAILED'
}
[Nest] 53212 - 02/13/2026, 7:56:12 PM ERROR [AuditService] Object(5) {
message: 'Audit log creation failed',
correlationId: 'test-correlation-id',
entityType: 'internal_user',
action: 'deactivate',
errorCode: 'AUDIT_WRITE_FAILED'
}
[Nest] 53212 - 02/13/2026, 7:56:12 PM ERROR [AuditService] Object(5) {
message: 'Audit log creation failed',  
 correlationId: 'test-correlation-id',  
 entityType: 'internal_user',  
 action: 'deactivate',  
 errorCode: 'AUDIT_WRITE_FAILED'  
}  
 PASS modules/platform-admin/tests/unit/module/platform-admin.module.spec.ts (18.001 s)  
 PASS modules/platform-admin/tests/unit/audit/audit.service.spec.ts (17.983 s)  
 PASS modules/platform-admin/tests/unit/db/prisma.wiring.spec.ts (17.975 s)
PASS modules/platform-admin/tests/integration/org-mapping.http.integration.spec.ts (18.979 s)

Test Suites: 26 passed, 26 total
Tests: 221 passed, 221 total
Snapshots: 0 total
Time: 22.936 s
Ran all test suites matching modules/platform-admin/tests.

- **npm run test:platform-admin (Enabled):** PASS.

---

## 3) نتائج التحقق (Verification Results)

_(مكان مخصص للصق مخرجات الأوامر عند التنفيذ الفعلي)_

```bash
git diff --name-only
modules/platform-admin/governance/GATE_6A_AUTHORIZATION.md
modules/platform-admin/governance/GATE_6A_EXECUTION_REPORT.md
modules/platform-admin/governance/GATE_6A_VERIFICATION_EVIDENCE.md
modules/platform-admin/index.ts

npx tsc -p modules/platform-admin/tsconfig.bff.json --noEmit
(No output - PASS)

npm run test:platform-admin (Standard - Disabled)
> Prints "[GATE_6A] Dev runtime disabled..."
Test Suites: 26 passed, 26 total
Tests:       221 passed, 221 total
Snapshots:   0 total
Time:        41 s
Ran all test suites matching modules/platform-admin/tests.

PLATFORM_ADMIN_DEV_RUNTIME=true npm run test:platform-admin (Enabled)
> PASS
Test Suites: 26 passed, 26 total
Tests:       221 passed, 221 total
Snapshots:   0 total
Time:        42.276 s
Ran all test suites matching modules/platform-admin/tests.
```

---

## 4) قرار التحقق (Verification Decision)

**Clean-State Requirement:**

- `git diff --name-only` MUST match Gate 6A allowlist only.
- Current Diff includes ONLY Allowlisted files -> **CLEAN**.

**النتيجة النهائية (Final Result):** ✅ PASS

---

## 5) التوقيع (Signature)

**تم التحقق بواسطة (Verified By):** GEMINI PRO 3 (LDE)
**التاريخ (Date):** 2026-02-13

1. **Pass**: `process.exit(0)` removed from `index.ts`. Tests pass with Exit Code 0.
2. **Fail-Closed**: Runtime logs disabled message correctly when ENV missing.
3. **Integrity**: Full test suite passes in both Standard (disabled) and Enabled modes.
4. **Clean State**: `git diff` contains ONLY allowlisted files (Index + Governance).
