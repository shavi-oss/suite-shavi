# Integration Contract — Suite ↔ Core v1

## Document Control

| Attribute | Value                                   |
| --------- | --------------------------------------- |
| Status    | FINAL — GATE 2                          |
| Mode      | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Date      | 2026-02-06                              |

---

## 1) Allowed Integration Point

**Single Endpoint**:

- `GET /api/v1/organizations/:id`

**Evidence**: [CORE_CONTRACT_V1_EXTRACT.md § 8](file:///d:/Basaan%20os/suite-shavi/modules/platform-admin/governance/core-contract/CORE_CONTRACT_V1_EXTRACT.md#L174-L186)

**Purpose**: Validate Core organization exists before Suite mapping creation

**Auth**: JWT Bearer token (user-scoped)

**Tenant Context**: JWT claim `organizationId`

---

## 2) Capability Matrix

| Capability                                          | Status           | Evidence                                             |
| --------------------------------------------------- | ---------------- | ---------------------------------------------------- |
| Organization Read (`GET /api/v1/organizations/:id`) | ✅ AVAILABLE     | CORE_CONTRACT_V1_EXTRACT.md § 8, Line 182            |
| JWT Authentication                                  | ✅ AVAILABLE     | CORE_CONTRACT_V1_EXTRACT.md § D.1, Line 357-413      |
| Tenant Context (JWT claim)                          | ✅ AVAILABLE     | CORE_CONTRACT_V1_EXTRACT.md § D.2, Line 417-447      |
| Global Prefix `/api/v1`                             | ✅ AVAILABLE     | CORE_CONTRACT_V1_EXTRACT.md § B, Line 49             |
| Service Tokens                                      | ❌ NOT AVAILABLE | CORE_V1_INTEGRATION_LOCK.md § 5.1, Line 159-174      |
| Template Publishing                                 | ❌ NOT AVAILABLE | CORE_V1_INTEGRATION_LOCK.md § 4.1, Line 139-154      |
| Token Refresh                                       | ❌ NOT AVAILABLE | CORE_V1_INTEGRATION_LOCK.md § 5.2, Line 177-190      |
| Correlation ID Middleware                           | ❌ NOT AVAILABLE | CORE_V1_INTEGRATION_LOCK.md § 5.3, Line 193-208      |
| Any Other Core Endpoint                             | ❌ NOT AVAILABLE | CORE_CONTRACT_V1_LOCK_DECLARATION.md § 2, Line 51-57 |

---

## 3) Explicitly Forbidden

### Forbidden Endpoints

❌ `POST /api/v1/templates/publish` — Does not exist  
❌ `POST /auth/service-token` — Does not exist  
❌ `POST /auth/refresh` — Does not exist  
❌ Any workflow endpoints — Not in scope for platform-admin  
❌ Any user/role endpoints — Not in scope for platform-admin

**Evidence**: CORE_V1_INTEGRATION_LOCK.md § 8.2, Line 274-285

### Forbidden Assumptions

❌ Core echoes correlation IDs  
❌ Core supports service-to-service auth  
❌ Core supports template operations  
❌ Core supports token refresh

**Evidence**: CORE_V1_INTEGRATION_LOCK.md § 5, Line 157-208

---

## 4) Integration Flow

**Suite BFF → Core**:

1. Suite receives user request with JWT
2. Suite validates JWT locally (signature, expiry)
3. Suite extracts `organizationId` from JWT claim
4. Suite forwards JWT to Core in `Authorization: Bearer <token>` header
5. Core validates JWT, extracts tenant context
6. Core returns organization data or error

**Fail-Closed Paths**:

- Core returns 404 → Suite returns safe error to UI
- Core returns 401 → Suite returns authentication error to UI
- Core returns 403 → Suite returns authorization error to UI
- Network timeout → Suite returns safe error to UI

**Evidence**: CORE_V1_INTEGRATION_LOCK.md § 3.2, Line 70-90

---

## 5) Contract Immutability

**Rule**: Any new Core dependency requires:

1. New Core Contract version
2. New governance gate
3. Explicit approval

**Evidence**: CORE_V1_INTEGRATION_LOCK.md § 7, Line 240-256

---

## What Was Explicitly Deferred by Gate 2

- **Template Publishing** — Core v1 has no template endpoints (see [GATE_2_DECISIONS_AND_DEFERRED.md](./GATE_2_DECISIONS_AND_DEFERRED.md))
- **Service-to-Service Authentication** — Core v1 has no service token contract (see [GATE_2_DECISIONS_AND_DEFERRED.md](./GATE_2_DECISIONS_AND_DEFERRED.md))
- **Token Refresh** — Core v1 has no refresh endpoint (see [GATE_2_DECISIONS_AND_DEFERRED.md](./GATE_2_DECISIONS_AND_DEFERRED.md))
- **Multi-Endpoint Integration** — Governance scope limited to single endpoint (see [GATE_2_DECISIONS_AND_DEFERRED.md](./GATE_2_DECISIONS_AND_DEFERRED.md))
- **RBAC Implementation** — Gate 2 is docs-only (see [GATE_2_DECISIONS_AND_DEFERRED.md](./GATE_2_DECISIONS_AND_DEFERRED.md))

---

**END OF CONTRACT**
