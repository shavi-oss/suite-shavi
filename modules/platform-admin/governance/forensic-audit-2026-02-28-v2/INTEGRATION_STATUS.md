# INTEGRATION STATUS

**Date:** 2026-02-28T06:48Z

---

## Suite ↔ Core Wiring (Code-Verified)

| Capability     | Core Route                                         | Core Guard        | Suite BFF Route                          | CoreClient Method                         | Wired?  |
| -------------- | -------------------------------------------------- | ----------------- | ---------------------------------------- | ----------------------------------------- | ------- |
| Create Org     | `POST /api/v2/admin/organizations`                 | AdminJwtAuthGuard | `POST /api/platform-admin/organizations` | `CoreClient.createOrganization()`         | ✅ Code |
| Validate Org   | `GET /api/v1/organizations/:id`                    | JwtAuthGuard      | `OrgMappingController`                   | `CoreClient.validateOrganizationExists()` | ✅ Code |
| Suspend Org    | `PATCH /api/v2/admin/organizations/:id/suspend`    | AdminJwtAuthGuard | `PATCH .../suspend`                      | `CoreClient.suspendOrganization()`        | ✅ Code |
| Unsuspend Org  | `PATCH /api/v2/admin/organizations/:id/unsuspend`  | AdminJwtAuthGuard | `PATCH .../unsuspend`                    | `CoreClient.unsuspendOrganization()`      | ✅ Code |
| Deactivate Org | `PATCH /api/v2/admin/organizations/:id/deactivate` | AdminJwtAuthGuard | `DELETE .../:id`                         | `CoreClient.deactivateOrganization()`     | ✅ Code |

---

## Live Connectivity Test (Fail-Closed Proofs)

Cannot exercise Suite→Core flow directly (no session token available without browser login).
However, fail-closed proofs confirm the guards are active on both sides:

| Test                                                                           | Result                |
| ------------------------------------------------------------------------------ | --------------------- |
| Core `POST /api/v2/admin/organizations` (no JWT) → 401                         | ✅ CONFIRMED          |
| Core `GET /api/v1/auth/me` (no JWT) → 401                                      | ✅ CONFIRMED          |
| Suite `GET /api/platform-admin/organizations` (no session) → **should be 401** | 🟡 PENDING new binary |

---

## Current Integration Status

| Item                                     | Status                             |
| ---------------------------------------- | ---------------------------------- |
| CoreClient allowlist (5 endpoints)       | ✅ Code-verified, runtime-asserted |
| `CORE_API_BASE_URL` env set              | ✅ PRESENT                         |
| `ADMIN_JWKS_URL` env set                 | ✅ PRESENT                         |
| JWKS live and serving valid RSA key      | ✅ CONFIRMED                       |
| Core guards reject unauthenticated calls | ✅ CONFIRMED                       |
| Suite guards enforcing DenyAllGuard      | 🟡 Pending new binary deploy       |
| Suite returns JSON for /api/\*           | 🟡 Pending new binary deploy       |

---

## Missing Pieces for Real UI

1. **Suite binary deploy** — once new Docker image deploys, Suite guards fire → UI can start session flow
2. **Session login flow** — user logs into Suite → Suite calls Core auth → gets JWT → stores in JwtStorageService
3. **Org create end-to-end** — test: create org in Suite → Suite calls Core admin → Core creates org → Suite stores mapping

All code exists. Blocked only by Railway build completion.
