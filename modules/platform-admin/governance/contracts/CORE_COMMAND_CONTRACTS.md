# Core Command Contracts — platform-admin

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Module Name    | platform-admin                          |
| Document Title | CORE_COMMAND_CONTRACTS                  |
| Repo           | Suite (Layer / Product Repo)            |
| Status         | ACTIVE — COMMAND CONTRACT               |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-01-30                              |

---

## 1) Purpose

This document defines the command-level contract for Suite `platform-admin` module interactions with Bassan.os Core. It establishes:

- Allowed commands (interface-level only, no endpoint URLs unless defined)
- Command intent and preconditions
- Input/output shapes (minimal, interface-level)
- Idempotency stance
- Fail-closed behavior

**NOTE**: This is NOT an API specification. Exact endpoint URLs, HTTP methods, and detailed schemas are defined in `INTEGRATION_CONTRACT_CORE.md` (or marked TODO if not yet defined).

---

## 2) Command Catalog

### 2.1 ValidateCoreOrganization

**Intent**: Verify that a Core organizationId exists before creating Suite → Core mapping.

**Preconditions**:

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

- **Success**: `{ exists: true, coreOrgId: string }`
- **Not Found**: `{ exists: false, coreOrgId: string }`
- **Error**: Throw exception (fail-closed)

**Idempotency Stance**: Idempotent (read-only operation)

**Fail-Closed Behavior**:

- **401 Unauthorized**: Throw `CoreAuthenticationError` (no retry)
- **403 Forbidden**: Throw `CoreAuthorizationError` (no retry)
- **404 Not Found**: Return `{ exists: false }` (valid response)
- **5xx Server Error**: Retry max 3 times with exponential backoff (1s, 2s, 4s), then throw `CoreServiceError`
- **Timeout** (>10s): Retry max 3 times, then throw `CoreTimeoutError`
- **Network Error**: Retry max 3 times, then throw `CoreNetworkError`

**TODO (BLOCKED)**:

- [ ] Define exact Core API endpoint (e.g., `GET /api/v1/organizations/:coreOrgId`)
- [ ] Confirm response schema from Core team
- [ ] Confirm timeout value (default: 10s for read)

---

### 2.2 PublishTemplate

**Intent**: Publish a predefined workflow template to Core for a specific organization.

**Preconditions**:

- Suite org → Core org mapping exists (fail-closed if missing)
- Template ID is valid (from predefined list in Suite codebase)
- Caller has `TEMPLATE_PUBLISH` permission
- Correlation ID is present
- Idempotency key is generated

**Input Shape** (minimal):

```typescript
{
  coreOrgId: string(UUID);
  templateId: string;
  templateVersion: string;
  correlationId: string(UUID);
  idempotencyKey: string(UUID);
}
```

**Expected Outputs**:

- **Success**: `{ success: true, coreTemplateId: string }`
- **Error**: Throw exception (fail-closed)

**Idempotency Stance**: Idempotent (via idempotency key)

- **MUST** include idempotency key in request (e.g., `X-Idempotency-Key` header or request body)
- **MUST** reuse same idempotency key for retries
- **MUST NOT** retry without idempotency key

**Fail-Closed Behavior**:

- **400 Bad Request**: Throw `CoreValidationError` (no retry, invalid template or org)
- **401 Unauthorized**: Throw `CoreAuthenticationError` (no retry)
- **403 Forbidden**: Throw `CoreAuthorizationError` (no retry)
- **404 Not Found**: Throw `CoreNotFoundError` (no retry, org or template not found)
- **409 Conflict**: Throw `CoreConflictError` (no retry, template already published)
- **5xx Server Error**: Retry max 2 times with exponential backoff (1s, 2s), then throw `CoreServiceError`
- **Timeout** (>20s): Retry max 2 times (with same idempotency key), then throw `CoreTimeoutError`
- **Network Error**: Retry max 2 times, then throw `CoreNetworkError`

**TODO (BLOCKED)**:

- [ ] Define exact Core API endpoint (e.g., `POST /api/v1/templates/publish`)
- [ ] Confirm request/response schema from Core team
- [ ] Confirm idempotency key mechanism (header vs body field)
- [ ] Confirm timeout value (default: 20s for write)

---

## 3) Command Execution Rules

### 3.1 Tenant Context Propagation

**MUST**: Every command MUST include tenant context (`coreOrgId`) when org-scoped.

**Mechanism** (TBD):

- Option 1: `X-Organization-Id: <coreOrgId>` header
- Option 2: JWT claim in Core service token
- Option 3: Query parameter `?organizationId=<coreOrgId>`

**TODO (BLOCKED)**:

- [ ] Confirm tenant context propagation mechanism with Core team

---

### 3.2 Correlation ID Propagation

**MUST**: Every command MUST include correlation ID for tracing.

**Mechanism**:

- Header: `X-Correlation-Id: <correlationId>`
- BFF generates correlation ID if not provided by UI
- BFF includes correlation ID in all log entries

**TODO (BLOCKED)**:

- [ ] Confirm Core's support for `X-Correlation-Id` header

---

### 3.3 Authentication

**MUST**: Every command MUST include Core service token.

**Mechanism**:

- Header: `Authorization: Bearer <core-service-token>`
- Token is server-only (NEVER exposed to UI)
- Token is obtained via Core authentication endpoint (TBD)

**TODO (BLOCKED)**:

- [ ] Define Core authentication endpoint and flow

---

## 4) Retry Policy (Bounded)

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
- **Write Operations** (PublishTemplate): Max 2 retries (with idempotency key)

**Backoff Strategy**: Exponential (1s, 2s, 4s for reads; 1s, 2s for writes)

---

## 5) Idempotency Rules

**Commands Requiring Idempotency**:

- `PublishTemplate` (write operation)

**Commands NOT Requiring Idempotency**:

- `ValidateCoreOrganization` (read operation, naturally idempotent)

**Idempotency Key Generation**:

- Generate UUID v4 for each unique operation
- Include `suiteOrgId + templateId + templateVersion` in key derivation (deterministic)
- Store idempotency key in Suite DB to prevent duplicate requests
- Reuse same idempotency key for retries

**TODO (BLOCKED)**:

- [ ] Confirm Core's support for idempotency keys
- [ ] Define idempotency key header name or body field

---

## 6) Fail-Closed Enforcement

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
- `"Invalid template. Please contact support."`

**MUST NOT**:

- Expose Core error details to UI
- Guess or infer missing data
- Proceed with operation on failure

---

## 7) TODO List

**BLOCKED** (requires Core team input):

- [ ] Define exact Core API endpoints for all commands
- [ ] Confirm request/response schemas for all commands
- [ ] Confirm error codes and meanings for all commands
- [ ] Confirm tenant context propagation mechanism
- [ ] Confirm correlation ID support
- [ ] Confirm idempotency key mechanism
- [ ] Confirm timeout values for read/write operations
- [ ] Confirm Core authentication endpoint and flow

**Action**: Do NOT implement commands until Core API contracts are defined. Proceed with interface-level contracts only.

---

## 8) Stop Rules

Execution MUST STOP IMMEDIATELY if:

- BFF calls Core command not listed in this catalog
- BFF retries 4xx errors (client errors)
- BFF retries without idempotency key for write operations
- BFF exposes Core error details to UI
- BFF proceeds with operation after Core API failure (without bounded retries)

**Action on STOP**: Halt all work, document violation, escalate to Governance Authority.

---

## 9) Acceptance Criteria

This command contract is ACTIVE and BINDING when:

- [x] All allowed commands are explicitly listed with intent and preconditions
- [x] Input/output shapes are defined (minimal, interface-level)
- [x] Idempotency stance is explicit for each command
- [x] Fail-closed behavior is explicit for each command
- [x] Retry policy is explicit and bounded
- [x] TODO list documents unknown Core API details
- [ ] Core team has confirmed API endpoints and schemas (BLOCKED)

---

## 10) Signature

**Approved By**: Governance Authority  
**Date**: 2026-01-30  
**Status**: ACTIVE — COMMAND CONTRACT
