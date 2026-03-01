# 01 — DOCS TO CODE TRACEABILITY

| Governance Claim (`MODULE_SCOPE_LOCK.md`) | Implementation Truth (Code Path / Symbol)                          | Status                         |
| ----------------------------------------- | ------------------------------------------------------------------ | ------------------------------ |
| **UI: Org List / Detail / Create**        | `/client/src/router` (Expected, currently unservable via `/`)      | PARTIAL (Static file unserved) |
| **UI: Org Mapping**                       | `/client/src/router`                                               | PARTIAL                        |
| **UI: Internal Users**                    | `/client/src/router`                                               | PARTIAL                        |
| **UI: Audit Log Viewer**                  | `/client/src/router`                                               | PARTIAL                        |
| **UI: Workflow / Billing / KPI**          | Not found in client routes                                         | ✅ PASS (Forbidden)            |
| **BFF: Org /:suspend/unsuspend**          | `organization.controller.ts` `@Patch(':id/suspend')`               | ✅ PASS                        |
| **BFF: Internal Users**                   | `internal-user.controller.ts`                                      | ✅ PASS                        |
| **BFF: Audit Logs**                       | `audit.controller.ts`                                              | ✅ PASS                        |
| **Core: `GET /api/v1/organizations/:id`** | `core.client.ts` `validateOrganization`                            | ✅ PASS                        |
| **Core: `suspend/unsuspend/deactivate`**  | `core.client.ts` `patchLifecycle` (**BUT NOT IN DOCS**)            | 🔴 FAIL (Governance Gap)       |
| **DB: SuiteOrganization**                 | `prisma/schema.prisma` `model SuiteOrganization`                   | ✅ PASS                        |
| **DB: SuiteOrgMapping**                   | `prisma/schema.prisma` `model SuiteOrgMapping`                     | ✅ PASS                        |
| **DB: PlatformAdminAuditLog**             | `prisma/schema.prisma` `model PlatformAdminAuditLog`               | ✅ PASS                        |
| **RBAC Roles**                            | `security/roles.enum.ts` (`platform_admin`, `developer_ops`, etc.) | ✅ PASS                        |

**Conclusion:** The codebase is well-aligned with the Scope Lock, but the Scope Lock document itself is outdated and missing the 3 lifecycle endpoints approved during Phase C. The UI is built but conceptually "missing" because the host does not serve the static assets.
