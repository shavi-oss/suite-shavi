# Module Integration Plan — platform-admin

## Document Control

| Attribute | Value                                   |
| --------- | --------------------------------------- |
| Status    | FINAL — GATE 2                          |
| Mode      | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Date      | 2026-02-06                              |

---

## 1) Integration Flow

**Single Flow**: Suite BFF → Core

**Endpoint**: `GET /api/v1/organizations/:id`

**Trigger**: User creates Suite organization mapping

**Steps**:

1. User submits organization mapping request to Suite BFF
2. Suite BFF validates request (DTO validation)
3. Suite BFF extracts JWT from request header
4. Suite BFF calls Core: `GET /api/v1/organizations/:id`
   - Header: `Authorization: Bearer <user-jwt>`
   - Param: `:id` = Core organization ID
5. Core validates JWT, checks tenant context
6. Core returns organization data or error
7. Suite BFF processes response (fail-closed on error)
8. Suite BFF creates mapping in Suite DB (if Core org exists)

**Evidence**: CORE_CONTRACT_V1_EXTRACT.md § 8, Line 182

---

## 2) User-Scoped JWT Forwarding

**Mechanism**: Suite forwards user JWT to Core (as-is)

**JWT Claims** (from Core):

- `sub` — User ID
- `email` — User email
- `organizationId` — Tenant/Organization ID

**Evidence**: CORE_CONTRACT_V1_EXTRACT.md § D.1, Line 384-393

**Suite Behavior**:

- Suite does NOT issue JWTs
- Suite does NOT modify JWTs
- Suite validates JWT signature locally
- Suite forwards JWT to Core in `Authorization` header

**Evidence**: CORE_V1_INTEGRATION_LOCK.md § 3.2, Line 70-90

---

## 3) Fail-Closed Paths

| Scenario                  | Suite Action                                    | Evidence                                    |
| ------------------------- | ----------------------------------------------- | ------------------------------------------- |
| Core returns 404          | Return safe error to UI, do NOT create mapping  | INTEGRATION_CONTRACT_CORE.md § 4            |
| Core returns 401          | Return authentication error to UI, do NOT retry | CORE_V1_INTEGRATION_LOCK.md § 5.2, Line 188 |
| Core returns 403          | Return authorization error to UI                | INTEGRATION_CONTRACT_CORE.md § 4            |
| Network timeout           | Return safe error to UI, do NOT create mapping  | INTEGRATION_CONTRACT_CORE.md § 4            |
| Missing/Ambiguous Mapping | Return validation error to UI                   | INTEGRATION_CONTRACT_CORE.md § 4            |

**Rule**: On any error, Suite MUST NOT create mapping. Fail-closed.

---

## 4) Explicitly Forbidden in Core v1

### Forbidden Capabilities

❌ **Service Tokens** — Core v1 has no service-to-service auth  
**Evidence**: CORE_V1_INTEGRATION_LOCK.md § 5.1, Line 159-174

❌ **Template Publishing** — Core v1 has no template endpoints  
**Evidence**: CORE_V1_INTEGRATION_LOCK.md § 4.1, Line 139-154

❌ **Token Refresh** — Core v1 has no refresh endpoint  
**Evidence**: CORE_V1_INTEGRATION_LOCK.md § 5.2, Line 177-190

❌ **Correlation ID Middleware** — Core v1 does not guarantee echo  
**Evidence**: CORE_V1_INTEGRATION_LOCK.md § 5.3, Line 193-208

### Forbidden Endpoints

❌ Any workflow endpoints  
❌ Any user/role endpoints  
❌ Any template endpoints  
❌ Any auth endpoints beyond login/me

**Evidence**: INTEGRATION_CONTRACT_CORE.md § 3

---

## 5) Suite-Only Features

**Correlation ID Tracing**:

- Suite generates UUID v4 correlation ID
- Suite includes `X-Correlation-Id` header in Core requests
- **Core echo NOT guaranteed** (Core v1 has no correlation middleware)
- Suite logs correlation ID for Suite-side tracing only

**Evidence**: CORE_V1_INTEGRATION_LOCK.md § 6.1, Line 213-225

**Suite → Core Mapping**:

- Suite stores mapping in Suite DB (`SuiteOrgMapping` table)
- Suite validates Core org exists before creating mapping

**Evidence**: CORE_V1_INTEGRATION_LOCK.md § 6.2, Line 228-237

---

## What Was Explicitly Deferred by Gate 2

- **Template Publishing** — Core v1 has no template endpoints (see [GATE_2_DECISIONS_AND_DEFERRED.md](./GATE_2_DECISIONS_AND_DEFERRED.md))
- **Service-to-Service Authentication** — Core v1 has no service token contract (see [GATE_2_DECISIONS_AND_DEFERRED.md](./GATE_2_DECISIONS_AND_DEFERRED.md))
- **Token Refresh** — Core v1 has no refresh endpoint (see [GATE_2_DECISIONS_AND_DEFERRED.md](./GATE_2_DECISIONS_AND_DEFERRED.md))
- **Correlation ID Middleware (Core-side)** — Core v1 has no correlation middleware (see [GATE_2_DECISIONS_AND_DEFERRED.md](./GATE_2_DECISIONS_AND_DEFERRED.md))
- **Code Implementation** — Gate 2 is docs-only (see [GATE_2_DECISIONS_AND_DEFERRED.md](./GATE_2_DECISIONS_AND_DEFERRED.md))

---

**END OF PLAN**
