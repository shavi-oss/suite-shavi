# Core Command Contracts — platform-admin

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Module Name    | platform-admin                          |
| Document Title | CORE_COMMAND_CONTRACTS                  |
| Repo           | Suite (Layer / Product Repo)            |
| Status         | FINAL — CORE V1 ALIGNED                 |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-02-04                              |

---

## 1) Purpose

This document defines the command-level contract for Suite `platform-admin` module interactions with Bassan.os Core. It establishes:

- Allowed commands (POST/PATCH operations)
- Command intent and preconditions
- Input/output shapes (minimal, interface-level)
- Idempotency stance
- Fail-closed behavior

---

## 2) Command Catalog

### 2.1 ValidateCoreOrganization

**CONFIRMED (Core v1)**

**Intent**: Verify that a Core organizationId exists before creating Suite → Core mapping.

**Endpoint**: `GET /api/v1/organizations/:id`

**Evidence**: `CORE_CONTRACT_V1_EXTRACT.md` Section B.8 (Organizations Module, Line 182)

---

**SUITE-ONLY** — Preconditions:

- `coreOrgId` is a valid UUID format
- Caller has `MAPPING_CREATE` permission
- Correlation ID is present

**Input Shape** (minimal):

```typescript
{
  coreOrgId: string(UUID);
  correlationId: string(UUID);
}
```

**Expected Outputs**:

- **Success (200)**: `{ exists: true, coreOrgId: string }`
- **Not Found (404)**: `{ exists: false, coreOrgId: string }`
- **Error**: Throw exception (fail-closed)

**Idempotency Stance**: Idempotent (read-only operation)

**Fail-Closed Behavior**:

- **401 Unauthorized**: Throw `CoreAuthenticationError` (no retry)
- **403 Forbidden**: Throw `CoreAuthorizationError` (no retry)
- **404 Not Found**: Return `{ exists: false }` (valid response)
- **5xx Server Error**: Retry max 3 times with exponential backoff (1s, 2s, 4s), then throw `CoreServiceError`
- **Timeout** (>10s): Retry max 3 times, then throw `CoreTimeoutError`
- **Network Error**: Retry max 3 times, then throw `CoreNetworkError`

---

### 2.2 PublishTemplate

**DEFERRED (Core v2+)**

Template publishing is NOT available in Core v1. No template publish endpoint found in Core controllers.

**Evidence**: `CORE_V1_INTEGRATION_LOCK.md` Section 4.1

**Status**: This command contract is catalog-only. DO NOT implement until Core v2.

---

**SUITE-ONLY** — Intent (for future reference):

Publish a predefined workflow template to Core for a specific organization.

**Preconditions** (when available in Core v2):

- Suite org → Core org mapping exists (fail-closed if missing)
- Template ID is valid (from predefined list in Suite codebase)
- Caller has `TEMPLATE_PUBLISH` permission
- Correlation ID is present
- Idempotency key is generated

**Input Shape** (minimal, for future reference):

```typescript
{
  coreOrgId: string(UUID);
  templateId: string;
  templateVersion: string;
  correlationId: string(UUID);
  idempotencyKey: string(UUID);
}
```

**Idempotency Stance**: Idempotent (via idempotency key)

---

## 3) Command Execution Rules

### 3.1 Tenant Context Propagation

**CONFIRMED (Core v1)**

**Mechanism**: JWT claim `organizationId` ONLY

- Core extracts `organizationId` from JWT via `JwtStrategy`
- Core sets CLS context: `orgId`, `userId`

**NOT USED** (Core v1):

- ❌ `X-Organization-Id` header
- ❌ `X-Tenant-Id` header
- ❌ Query parameter `?organizationId=`

**Evidence**: `CORE_V1_INTEGRATION_LOCK.md` Section 3.3

---

### 3.2 Correlation ID Propagation

**SUITE-ONLY**

**Mechanism**:

- Header: `X-Correlation-Id: <correlationId>`
- BFF generates correlation ID if not provided by UI
- BFF includes correlation ID in all log entries

**NOT AVAILABLE** (Core v1):

Core v1 does NOT have correlation ID middleware/interceptor. Core echo/logging of correlation ID is NOT GUARANTEED.

**Evidence**: `CORE_V1_INTEGRATION_LOCK.md` Section 6.1

---

### 3.3 Authentication

**CONFIRMED (Core v1)**

Core v1 uses JWT-based authentication for user-scoped operations.

**Mechanism**:

- BFF forwards validated Core JWT in `Authorization: Bearer <jwt-token>` header
- JWT contains claims: `sub` (user ID), `email`, `organizationId`

**Evidence**: `CORE_V1_INTEGRATION_LOCK.md` Section 3.2

---

**NOT AVAILABLE** (Core v1):

Service-to-Service Authentication is NOT supported by Core v1.

**Evidence**: `CORE_V1_INTEGRATION_LOCK.md` Section 5.1

**Status**: DEFERRED until Core v2

---

## 4) Retry Policy (Bounded)

**SUITE-ONLY**

**Safe to Retry** (transient errors):

- 5xx Server Error
- Network timeout
- Network connection error

**NOT Safe to Retry** (non-transient errors):

- 4xx Client Error (400, 404, 409, etc.)
- 401 Unauthorized
- 403 Forbidden

**Retry Limits**:

- **Read Operations** (ValidateCoreOrganization): Max 3 retries
- **Write Operations** (PublishTemplate, when available): Max 2 retries (with idempotency key)

**Backoff Strategy**: Exponential (1s, 2s, 4s for reads; 1s, 2s for writes)

---

## 5) Idempotency Rules

**SUITE-ONLY**

**Commands Requiring Idempotency**:

- `PublishTemplate` (write operation, when available in Core v2)

**Commands NOT Requiring Idempotency**:

- `ValidateCoreOrganization` (read operation, naturally idempotent)

**Idempotency Key Generation** (for future write operations):

- Generate UUID v4 for each unique operation
- Include `suiteOrgId + templateId + templateVersion` in key derivation (deterministic)
- Store idempotency key in Suite DB to prevent duplicate requests
- Reuse same idempotency key for retries

---

## 6) Fail-Closed Enforcement

**SUITE-ONLY**

**MUST**: All commands MUST fail-closed by default.

**Fail-Closed Principles**:

- Deny on ambiguity (e.g., missing org mapping)
- Deny on missing preconditions (e.g., missing permission)
- Deny on Core API failure (after bounded retries)
- Return safe error messages to UI (no Core internal details)
- Log all failures with correlation ID

**Safe Error Messages** (examples):

- `"Organization mapping not found. Please link this organization to Core first."`
- `"Service temporarily unavailable. Please try again later."`
- `"Core organization not found. Please verify mapping."`

**MUST NOT**:

- Expose Core error details to UI
- Guess or infer missing data
- Proceed with operation on failure

---

## 7) Stop Rules

**SUITE-ONLY**

Execution MUST STOP IMMEDIATELY if:

- BFF calls Core command not listed in Core Contract v1
- BFF retries 4xx errors (client errors)
- BFF retries without idempotency key for write operations
- BFF exposes Core error details to UI
- BFF proceeds with operation after Core API failure (without bounded retries)

**Action on STOP**: Halt all work, document violation, escalate to Governance Authority.

---

## 8) Acceptance Criteria

This command contract is ACTIVE and BINDING when:

- [x] All allowed commands are explicitly listed with intent and preconditions
- [x] ValidateCoreOrganization endpoint confirmed (Core v1)
- [x] PublishTemplate marked DEFERRED (Core v1)
- [x] Input/output shapes are defined (minimal, interface-level)
- [x] Idempotency stance is explicit for each command
- [x] Fail-closed behavior is explicit for each command
- [x] Retry policy is explicit and bounded
- [x] All CONFIRMED claims have evidence links

---

## 9) Signature

**Approved By**: Governance Authority  
**Date**: 2026-02-04  
**Status**: FINAL — CORE V1 ALIGNED
