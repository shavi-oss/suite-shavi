# Production Readiness Baseline — V2

## Platform Admin Module

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Document Title | PRODUCTION_READINESS_BASELINE_V2        |
| Version        | V2 (Post-Gate 53B)                      |
| Repo           | Suite (Layer / Product Repo)            |
| Module         | platform-admin                          |
| Status         | FINAL — BASELINE                        |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-02-12                              |
| Baseline Tag   | suite-platform-admin-gate-53B           |

---

## 1) Production-Ready Definition

**What is production-ready** within the current system:

- Module compiles without errors (TypeScript)
- All tests pass (26/26 suites, 221/221 tests)
- Fail-closed enforcement active (deny-by-default)
- Session layer operational (httpOnly cookie, server-side validation)
- Core JWT forwarding operational (server-side storage, Bearer token)
- Correlation ID assertion enforced
- No dependency drift
- No Core modifications
- Governance artifacts complete

---

## 2) Required Environment Variables

**Documented** (as per governance sources):

- `CORE_API_BASE_URL`: Base URL for Core API (e.g., `http://core-api.test`)
- `DATABASE_URL`: Prisma database connection string
- `SESSION_SECRET`: Secret for session signing (server-side)

**Note**: Do not guess or invent environment variables. Only documented variables are listed.

---

## 3) Runtime Posture

### 3.1 Fail-Closed

**Enforced**: Deny-by-default via `DenyAllGuard` as `APP_GUARD`

**Evidence**: `platform-admin.module.ts` lines 51-54

---

### 3.2 Correlation Assertions

**Enforced**: Correlation ID required for all Core API calls

**Fail-Closed**: Missing/empty/whitespace correlation ID → Error

**Evidence**: `core.client.ts` lines 71-76, Gate 51B

---

### 3.3 Session Cookie (httpOnly)

**Enforced**: Suite session stored in httpOnly cookie (client-side)

**Validation**: Server-side via `SessionGuard`

**Fail-Closed**: Missing/invalid/expired session → 401

**Evidence**: Gates 49B, 50B, 51A

---

### 3.4 Core JWT Forwarding

**Enforced**: Core JWT stored server-side only (in-memory via `JwtStorageService`)

**Forwarding**: JWT forwarded as `Authorization: Bearer <jwt>` on Core API calls

**Fail-Closed**: Missing Core JWT → 401

**No Logging**: JWT never logged

**Evidence**: Gates 50B, 51A, 51B

---

## 4) Guard Topology (High-Level)

### 4.1 Global Guard

**Guard**: `DenyAllGuard`

**Scope**: APP_GUARD (global)

**Behavior**: Deny all requests by default

---

### 4.2 Explicit Allow Guard

**Guard**: `ExplicitAllowGuard`

**Scope**: EXACTLY 4 usages

**Allowed Controllers**:

- **HealthController**: `getHealth`
- **AuthController**: `login`, `logout`, `getSession`

**Forbidden Controllers**: InternalUserController, OrgMappingController, OrganizationController, AuditController

**Evidence**: Gate 53B

---

### 4.3 Session Guard

**Guard**: `SessionGuard`

**Scope**: Applied to protected endpoints (non-explicit-allow)

**Behavior**: Validate Suite session, retrieve Core JWT, fail-closed on missing/invalid

**Evidence**: Gates 49B, 50B, 51A

---

### 4.4 RBAC Guard

**Guard**: `RbacGuard`

**Scope**: Applied to endpoints requiring role-based access control

**Behavior**: Validate user roles, fail-closed on unauthorized

**Evidence**: Gate 43

---

## 5) Controller Inventory

**EXACTLY 6 controllers**:

1. **HealthController**: Health check endpoint (`/platform-admin/health`)
2. **AuthController**: Authentication endpoints (`/platform-admin/auth/login`, `/logout`, `/session`)
3. **AuditController**: Audit log endpoints
4. **OrganizationController**: Organization management endpoints
5. **InternalUserController**: Internal user management endpoints
6. **OrgMappingController**: Organization mapping endpoints (Suite ↔ Core)

**Evidence**: `platform-admin.module.ts` lines 42-49, Gate 53B

---

## 6) Database Schema

**Prisma Schema**: `modules/platform-admin/prisma/schema.prisma`

**Tables**:

- `Organization`
- `InternalUser`
- `OrgMapping`
- `AuditLog`

**Note**: Schema details documented in Prisma schema file. No modifications allowed without governance approval.

---

## 7) Core Integration

### 7.1 Allowed Endpoints

**From `INTEGRATION_CONTRACT_CORE.md`**:

- `POST /auth/login`: Login endpoint
- `GET /organizations/:id`: Get organization by ID
- `GET /organizations`: List organizations
- `GET /internal-users/:id`: Get internal user by ID
- `GET /internal-users`: List internal users
- `POST /internal-users`: Create internal user
- `PATCH /internal-users/:id`: Update internal user
- `DELETE /internal-users/:id`: Delete internal user
- `GET /roles`: List roles
- `GET /roles/:id`: Get role by ID

**Forbidden**: Any endpoint NOT in contract

---

### 7.2 Authentication Model

**JWT Only**: Server-side Core JWT forwarding

**No Service-to-Service Auth**: Not available in Core v1

**No Token Refresh**: Not available in Core v1

**Evidence**: `CORE_V1_INTEGRATION_LOCK.md`

---

### 7.3 Tenant Alignment

**organizationId Mapping**: Suite `organizationId` → Core `organizationId`

**Stored**: `OrgMapping` table

**Validation**: Core org must exist before mapping creation

**Evidence**: `INTEGRATION_CONTRACT_CORE.md`, Gate 3

---

## 8) Test Coverage

**Test Suites**: 26/26 passed

**Tests**: 221/221 passed

**Coverage Areas**:

- Unit tests (controllers, services, repositories, guards)
- Integration tests (auth flow, org mapping)
- Security tests (fail-closed, explicit-allow)
- Non-regression tests (build, controller count)

**Evidence**: Gate 53B verification

---

## 9) What Is NOT Included

**Explicitly NOT production-ready** (scope not included):

- Customer user management
- Workflow builder or visual editor
- Custom template creation UI
- Template publishing (DEFERRED — Core v1)
- Billing or subscription features
- CRM or Omnichannel features
- Real-time notifications or webhooks
- MFA for internal users
- External identity provider integration

**Authority**: `MODULE_SCOPE_LOCK.md` Section 3

---

## 10) Governance Authorities Referenced

This baseline is derived from:

- [ARCHITECTURAL_LAWS.md](file:///d:/Basaan%20os/suite-shavi/ARCHITECTURAL_LAWS.md)
- [REPO_GOVERNANCE.md](file:///d:/Basaan%20os/suite-shavi/REPO_GOVERNANCE.md)
- [EXECUTION_AUTHORITY.md](file:///d:/Basaan%20os/suite-shavi/EXECUTION_AUTHORITY.md)
- [INTEGRATION_CONTRACT_CORE.md](file:///d:/Basaan%20os/suite-shavi/INTEGRATION_CONTRACT_CORE.md)
- [SECURITY_BASELINE.md](file:///d:/Basaan%20os/suite-shavi/SECURITY_BASELINE.md)
- [POST_51C_EVIDENCE_LOCK.md](file:///d:/Basaan%20os/suite-shavi/modules/platform-admin/governance/POST_51C_EVIDENCE_LOCK.md)
- Gate 52A artifacts
- Gate 53B artifacts

---

## 11) Signature

**Approved By**: Governance Authority  
**Date**: 2026-02-12  
**Status**: FINAL — BASELINE V2  
**Baseline Tag**: suite-platform-admin-gate-53B
