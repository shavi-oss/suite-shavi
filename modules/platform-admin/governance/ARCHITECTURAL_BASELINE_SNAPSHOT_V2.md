# Architectural Baseline Snapshot — V2

## Platform Admin Module

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Document Title | ARCHITECTURAL_BASELINE_SNAPSHOT_V2      |
| Version        | V2 (Post-Gate 53B)                      |
| Repo           | Suite (Layer / Product Repo)            |
| Module         | platform-admin                          |
| Status         | FINAL — SNAPSHOT                        |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-02-12                              |
| Baseline Tag   | suite-platform-admin-gate-53B           |

---

## 1) Architectural DNA

### 1.1 Shell-First

**Principle**: Suite is a shell around Core, not a replacement

**Implementation**:

- Core is BLACK BOX (immutable)
- Suite never talks to Core DB directly
- BFF is the sole integration boundary
- UI never talks to Core directly

**Evidence**: `ARCHITECTURAL_LAWS.md` LAW-2

---

### 1.2 Calm-First

**Principle**: Fail-closed by default, no surprises

**Implementation**:

- Deny-by-default via `DenyAllGuard`
- Explicit opt-in via `ExplicitAllowGuard` (4 usages only)
- Safe error messages (no PII, no internal details)
- No retry on 401/403

**Evidence**: `ARCHITECTURAL_LAWS.md` LAW-1, Gates 49B, 50B, 51A

---

### 1.3 Workspace-Centered

**Principle**: Multi-tenant by design, tenant isolation enforced

**Implementation**:

- `organizationId` mapping (Suite ↔ Core)
- Tenant context in all requests
- No cross-tenant access
- Fail-closed on missing tenant context

**Evidence**: `INTEGRATION_CONTRACT_CORE.md`, `SECURITY_BASELINE.md`

---

## 2) New Invariants (Post-Gate 53B)

### 2.1 Controller Set Invariant

**EXACTLY 6 controllers** (strict allowlist):

1. HealthController
2. AuthController
3. AuditController
4. OrganizationController
5. InternalUserController
6. OrgMappingController

**Verification**: `modules/platform-admin/tests/non-regression/build.spec.ts`

**Evidence**: `GATE_53B_EXECUTION_REPORT.md`

**Change from V1**: Previously 3 controllers (Gate 3), now 6 controllers

---

### 2.2 ExplicitAllowGuard Policy Invariant

**EXACTLY 4 usages** in allowed controllers only:

- **HealthController**: `getHealth`
- **AuthController**: `login`, `logout`, `getSession`

**Forbidden Controllers**: InternalUserController, OrgMappingController, OrganizationController, AuditController

**Verification**: `modules/platform-admin/tests/security/fail-closed.spec.ts`

**Evidence**: `GATE_53B_EXECUTION_REPORT.md`

**Change from V1**: Previously 1 usage (Gate 4.10), now 4 usages (Health + Auth only)

---

### 2.3 Fail-Closed Enforcement Invariant

**Deny-by-default**: `DenyAllGuard` as `APP_GUARD`

**Explicit opt-in**: `ExplicitAllowGuard` for public endpoints only

**No bypass**: No authorization bypass allowed

**Evidence**: `platform-admin.module.ts` lines 51-54, Gates 4.5, 4.9

---

### 2.4 Session Layer Invariant

**httpOnly Cookie**: Suite session stored in httpOnly cookie (client-side)

**Server-Side Validation**: `SessionGuard` validates session server-side

**Fail-Closed**: Missing/invalid/expired session → 401

**No Session ID Logging**: Session ID never logged

**Evidence**: Gates 49B, 50B, 51A

---

### 2.5 Core JWT Forwarding Invariant

**Server-Side Storage**: Core JWT stored in-memory via `JwtStorageService`

**Bearer Token**: JWT forwarded as `Authorization: Bearer <jwt>`

**Fail-Closed**: Missing Core JWT → 401

**No JWT Logging**: JWT never logged

**Evidence**: Gates 50B, 51A, 51B

---

### 2.6 Correlation ID Assertion Invariant

**Required**: Correlation ID required for all Core API calls

**Fail-Closed**: Missing/empty/whitespace correlation ID → Error

**Suite-Only**: Core echo NOT guaranteed

**Evidence**: Gate 51B

---

## 3) Layer Boundaries

### 3.1 UI Layer

**Responsibility**: User interface, client-side state management

**Allowed**:

- React components
- Client-side routing
- Form validation
- Error display

**Forbidden**:

- Direct Core API calls
- Database access
- Server-side logic

**Evidence**: `ARCHITECTURAL_LAWS.md` LAW-2

---

### 3.2 BFF Layer

**Responsibility**: Backend-for-frontend, sole integration boundary

**Allowed**:

- NestJS controllers
- Session validation
- Core API calls (via `CoreClient`)
- Database access (via Prisma)

**Forbidden**:

- Direct Core DB access
- Bypassing session validation
- Exposing Core JWT to client

**Evidence**: `ARCHITECTURAL_LAWS.md` LAW-2

---

### 3.3 Core Layer

**Responsibility**: Core business logic (BLACK BOX)

**Allowed**:

- Read Core API contract
- Call allowed Core endpoints

**Forbidden**:

- Modify Core code
- Access Core DB directly
- Invent Core capabilities beyond contract

**Evidence**: `ARCHITECTURAL_LAWS.md` LAW-2, `INTEGRATION_CONTRACT_CORE.md`

---

## 4) Integration Contract

### 4.1 Allowed Core Endpoints

**From `INTEGRATION_CONTRACT_CORE.md`**:

- `POST /auth/login`
- `GET /organizations/:id`
- `GET /organizations`
- `GET /internal-users/:id`
- `GET /internal-users`
- `POST /internal-users`
- `PATCH /internal-users/:id`
- `DELETE /internal-users/:id`
- `GET /roles`
- `GET /roles/:id`

---

### 4.2 Deferred Core Capabilities

**NOT AVAILABLE in Core v1**:

- Template publish endpoints
- Service-to-service authentication
- Token refresh mechanism
- Correlation ID middleware in Core

**Evidence**: `CORE_V1_INTEGRATION_LOCK.md`

---

### 4.3 Forbidden Core Capabilities

**MUST NOT assume available**:

- OAuth2 client credentials flow
- Logout endpoint
- Register endpoint (DTO exists but no controller route)

**Evidence**: `SPEC_DRIFT_NOTICE.md`

---

## 5) Security Baseline

### 5.1 Tenant Isolation

**Enforced**: `organizationId` in all requests

**Validation**: Core validates tenant context

**Fail-Closed**: Missing/invalid tenant context → 403

**Evidence**: `SECURITY_BASELINE.md`, `INTEGRATION_CONTRACT_CORE.md`

---

### 5.2 Least Privilege

**Enforced**: RBAC via `RbacGuard`

**Roles**: Defined in Core

**Fail-Closed**: Unauthorized role → 403

**Evidence**: `SECURITY_BASELINE.md`, Gate 43

---

### 5.3 Server-Only Core Tokens

**Enforced**: Core JWT stored server-side only

**Forbidden**: JWT in client-side storage

**Evidence**: `SECURITY_BASELINE.md`, Gates 50B, 51A

---

### 5.4 No Secrets in Logs

**Enforced**: JWT, session ID never logged

**Validation**: Code review + test coverage

**Evidence**: `SECURITY_BASELINE.md`, Gates 50B, 51A

---

### 5.5 Fail-Closed by Default

**Enforced**: Deny-by-default via `DenyAllGuard`

**Explicit opt-in**: `ExplicitAllowGuard` for public endpoints only

**Evidence**: `SECURITY_BASELINE.md`, Gates 4.5, 4.9

---

## 6) What Is NOT Included

**Explicitly NOT in scope** (no expansion without governance approval):

### 6.1 Customer User Management

**Reason**: Out of scope for platform-admin module

**Authority**: `MODULE_SCOPE_LOCK.md`

---

### 6.2 Workflow Builder or Visual Editor

**Reason**: Out of scope for MVP v1.0

**Authority**: `MODULE_SCOPE_LOCK.md`

---

### 6.3 Custom Template Creation UI

**Reason**: Out of scope for MVP v1.0

**Authority**: `MODULE_SCOPE_LOCK.md`

---

### 6.4 Template Publishing

**Reason**: DEFERRED to Core v2 (not available in Core v1)

**Authority**: `CORE_V1_INTEGRATION_LOCK.md`

---

### 6.5 Billing or Subscription Features

**Reason**: Out of scope for platform-admin module

**Authority**: `MODULE_SCOPE_LOCK.md`

---

### 6.6 CRM or Omnichannel Features

**Reason**: Out of scope for platform-admin module

**Authority**: `MODULE_SCOPE_LOCK.md`

---

### 6.7 Real-Time Notifications or Webhooks

**Reason**: Out of scope for MVP v1.0

**Authority**: `MODULE_SCOPE_LOCK.md`

---

### 6.8 MFA for Internal Users

**Reason**: Out of scope for MVP v1.0

**Authority**: `MODULE_SCOPE_LOCK.md`

---

### 6.9 External Identity Provider Integration

**Reason**: Out of scope for MVP v1.0

**Authority**: `MODULE_SCOPE_LOCK.md`

---

## 7) Governance Authorities Referenced

This snapshot is derived from:

- [ARCHITECTURAL_LAWS.md](file:///d:/Basaan%20os/suite-shavi/ARCHITECTURAL_LAWS.md)
- [REPO_GOVERNANCE.md](file:///d:/Basaan%20os/suite-shavi/REPO_GOVERNANCE.md)
- [EXECUTION_AUTHORITY.md](file:///d:/Basaan%20os/suite-shavi/EXECUTION_AUTHORITY.md)
- [INTEGRATION_CONTRACT_CORE.md](file:///d:/Basaan%20os/suite-shavi/INTEGRATION_CONTRACT_CORE.md)
- [SECURITY_BASELINE.md](file:///d:/Basaan%20os/suite-shavi/SECURITY_BASELINE.md)
- [MODULE_SCOPE_LOCK.md](file:///d:/Basaan%20os/suite-shavi/modules/platform-admin/governance/MODULE_SCOPE_LOCK.md)
- [CORE_V1_INTEGRATION_LOCK.md](file:///d:/Basaan%20os/suite-shavi/modules/platform-admin/governance/core-contract/CORE_V1_INTEGRATION_LOCK.md)
- [POST_51C_EVIDENCE_LOCK.md](file:///d:/Basaan%20os/suite-shavi/modules/platform-admin/governance/POST_51C_EVIDENCE_LOCK.md)
- Gate 52A, 53B, 54A artifacts

---

## 8) Signature

**Approved By**: Governance Authority  
**Date**: 2026-02-12  
**Status**: FINAL — SNAPSHOT V2  
**Baseline Tag**: suite-platform-admin-gate-53B
