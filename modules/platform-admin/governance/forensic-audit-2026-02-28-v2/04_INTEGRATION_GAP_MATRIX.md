# 04 — INTEGRATION GAP MATRIX (Suite ↔ Core)

**Date:** 2026-02-28 | **Evidence source:** Code + live probes

---

## Legend

- ✅ Implemented + verified
- ⚠️ Implemented but not live-verified
- 🔴 Missing or broken
- 📋 Documented

---

## Core Admin Capabilities vs Suite Wiring

| Capability              | Core Route (code)                                  | Core Guard          | Suite BFF Route                                                                             | Suite CoreClient                                                               | Suite UI                       | Live Verified?                               |
| ----------------------- | -------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------ | -------------------------------------------- |
| **Create Org**          | `POST /api/v2/admin/organizations`                 | `AdminJwtAuthGuard` | `POST /api/platform-admin/organizations` → `OrganizationService.create()`                   | `CoreClient.createOrganization()` — asserts `POST /api/v2/admin/organizations` | OrganizationCreate screen      | ⚠️ NOT live-tested (Railway rebuild pending) |
| **Validate Org Exists** | `GET /api/v1/organizations/:id`                    | (user JWT required) | `OrgMappingController` → `OrgMappingService.create()`                                       | `CoreClient.validateOrganizationExists()`                                      | OrgMapping create flow         | ⚠️ NOT live-tested                           |
| **Suspend Org**         | `PATCH /api/v2/admin/organizations/:id/suspend`    | `AdminJwtAuthGuard` | `PATCH /api/platform-admin/organizations/:id/suspend` → `OrganizationService.suspend()`     | `CoreClient.suspendOrganization()`                                             | Org detail → Suspend button    | ⚠️ NOT live-tested                           |
| **Unsuspend Org**       | `PATCH /api/v2/admin/organizations/:id/unsuspend`  | `AdminJwtAuthGuard` | `PATCH /api/platform-admin/organizations/:id/unsuspend` → `OrganizationService.unsuspend()` | `CoreClient.unsuspendOrganization()`                                           | Org detail → Unsuspend button  | ⚠️ NOT live-tested                           |
| **Deactivate Org**      | `PATCH /api/v2/admin/organizations/:id/deactivate` | `AdminJwtAuthGuard` | `DELETE /api/platform-admin/organizations/:id` → `OrganizationService.deactivate()`         | `CoreClient.deactivateOrganization()`                                          | Org detail → Deactivate button | ⚠️ NOT live-tested                           |

---

## Route Mapping Detail

```
Suite UI (browser)
  → POST /api/platform-admin/organizations
      [DenyAllGuard pass → SessionGuard (validates session cookie, reads coreJwt from JwtStorageService)]
      [RbacGuard (checks ORGANIZATIONS:WRITE permission)]
      [OrganizationController.create()]
          → OrganizationService.create()
              → CoreClient.createOrganization(name, coreJwt, correlationId)
                  → assertCoreEndpointAllowed('POST', '/api/v2/admin/organizations')
                  → fetch POST https://{CORE_API_BASE_URL}/api/v2/admin/organizations
                      Authorization: Bearer {coreJwt}
                      [Core: AdminJwtAuthGuard validates JWT via JWKS]
                      [Core: AdminService.createOrganization()]
                      → returns { id: coreOrgId }
              ← coreOrgId
          → prisma: create Suite Organization with coreOrgId
          ← OrganizationResponseDto
```

---

## Missing Integration Points

| Gap                                 | Description                                                                                                                                                                                              | Risk                                              |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| **Login/Session Bootstrap**         | Suite `/api/platform-admin/auth/login` → how does it establish the session and store `coreJwt`? `AuthController` → `SessionService`? Must verify the actual login flow creates the session + stores JWT. | HIGH — if broken, no authenticated API calls work |
| **Core Health Probe**               | No Core `/health` endpoint. Suite cannot verify Core is reachable before making S2S calls.                                                                                                               | MEDIUM                                            |
| **JWKS URL in Core env**            | `ADMIN_JWKS_URL` must point to live JWKS. Unverified. If wrong, all admin S2S calls fail with 401.                                                                                                       | HIGH                                              |
| **TenantMiddleware + Admin Routes** | Core's `TenantMiddleware` runs on `/api/v2/admin/*`. May reject S2S admin calls from Suite if no tenant context in headers.                                                                              | MEDIUM                                            |

---

## Allowlist Completeness Check

Suite `core.contract.assert.ts` allowlist:

```
GET  /api/v1/organizations/:id           ← used by CoreClient.validateOrganizationExists()
POST /api/v2/admin/organizations         ← used by CoreClient.createOrganization()
PATCH /api/v2/admin/organizations/:id/suspend    ← used by CoreClient.suspendOrganization()
PATCH /api/v2/admin/organizations/:id/unsuspend  ← used by CoreClient.unsuspendOrganization()
PATCH /api/v2/admin/organizations/:id/deactivate ← used by CoreClient.deactivateOrganization()
```

Core actual admin routes (from `admin.controller.ts`):

```
POST /api/v2/admin/organizations         ✅ present in allowlist
PATCH .../suspend                        ✅ present in allowlist
PATCH .../unsuspend                      ✅ present in allowlist
PATCH .../deactivate                     ✅ present in allowlist
```

**Allowlist is complete and correct. No missing routes, no extra unauthorized routes.**

---

## Suite UI Screens vs BFF Routes (Scope Lock Compliance)

| UI Screen               | BFF Route                                               | Status |
| ----------------------- | ------------------------------------------------------- | ------ |
| Organizations list      | `GET /api/platform-admin/organizations`                 | ✅     |
| Organization create     | `POST /api/platform-admin/organizations`                | ✅     |
| Organization detail     | `GET /api/platform-admin/organizations/:id`             | ✅     |
| Organization suspend    | `PATCH /api/platform-admin/organizations/:id/suspend`   | ✅     |
| Organization unsuspend  | `PATCH /api/platform-admin/organizations/:id/unsuspend` | ✅     |
| Organization deactivate | `DELETE /api/platform-admin/organizations/:id`          | ✅     |
| Org-Core mapping        | via `OrgMappingController`                              | ✅     |
| Audit logs              | `GET /api/platform-admin/audit-logs`                    | ✅     |
| Internal users          | via `InternalUserController`                            | ✅     |
