# 05 — INTEGRATION GAP MATRIX

| Feature Area / Capability  | Core Implemented?         | Suite UI Expected? | Suite BFF Wired? | Doc Governance Updated? | Severity    | Missing Link Recommendation                                                                                                                                                             |
| -------------------------- | ------------------------- | ------------------ | ---------------- | ----------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Org Creation**           | ✅ YES (POST)             | ✅ YES             | ✅ YES           | ✅ YES                  | N/A         | None.                                                                                                                                                                                   |
| **Org Suspension**         | ✅ YES (PATCH suspend)    | ✅ YES             | ✅ YES           | 🔴 NO                   | **LOW**     | Update `MODULE_SCOPE_LOCK.md` to reflect the approved adapter patterns.                                                                                                                 |
| **Org Unsuspension**       | ✅ YES (PATCH unsuspend)  | ✅ YES             | ✅ YES           | 🔴 NO                   | **LOW**     | Same as above.                                                                                                                                                                          |
| **Org Deactivation**       | ✅ YES (PATCH deactivate) | ✅ YES             | ✅ YES           | 🔴 NO                   | **LOW**     | Same as above.                                                                                                                                                                          |
| **Serve Main Application** | N/A                       | ✅ YES             | 🔴 NO            | ✅ YES                  | **BLOCKER** | The compiled React frontend (`dist/platform-admin/client`) is not served by NestJS (`host/main.ts` / `platform-admin.module.ts`). Import `ServeStaticModule` pointing to the dist root. |
| **Internal Users**         | N/A                       | ✅ YES             | ✅ YES           | ✅ YES                  | N/A         | None. Handled in Suite DB entirely.                                                                                                                                                     |

## Core Constraints

All Core API integrations are verified completely wired in the `core.client.ts` component via `patchLifecycle()` which handles `coreJwt` threading and throws transaction-terminating errors if Core drops the request.

## Summary of Next Steps

1. **(Code)** Fix the frontend serving issue in `platform-admin.module.ts` by adding `@nestjs/serve-static`.
2. **(Docs)** Update the `MODULE_SCOPE_LOCK.md` to cleanly allowlist the updated Core endpoints.
