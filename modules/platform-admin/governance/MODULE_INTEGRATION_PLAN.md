# Module Integration Plan — platform-admin

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Module Name    | platform-admin                          |
| Document Title | MODULE_INTEGRATION_PLAN                 |
| Repo           | Suite (Layer / Product Repo)            |
| Status         | FINAL — BINDING INTEGRATION PLAN        |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-01-26                              |

---

## 1) Purpose

This document defines how the `platform-admin` module integrates with external systems, specifically Bassan.os Core. It establishes:

- Allowed integration patterns
- Core endpoints to be called
- Authentication and authorization flow
- Error handling and resilience
- Observability requirements

---

## 2) Integration Scope

### 2.1 External Systems

**Bassan.os Core**:

- **Purpose**: Validate Core organizationId, publish templates to Core
- **Integration Method**: BFF → Core API (server-to-server, HTTPS/TLS)
- **Authentication**: Core-issued service token (server-only, never exposed to UI)

**No Other External Systems** in MVP.

### 2.2 Internal Systems

**Suite DB**:

- **Purpose**: Store Suite orgs, mappings, internal users, audit logs
- **Integration Method**: Direct database access via ORM/Prisma (server-side only)

**Suite Authentication Service** (TBD):

- **Purpose**: Authenticate internal users
- **Integration Method**: TBD (TODO: define if separate auth service or embedded in BFF)

---

## 3) Core Integration Details

### 3.1 Core Endpoints (TBD — Requires INTEGRATION_CONTRACT_CORE.md Update)

**MUST call ONLY these Core endpoints**:

**Organization Validation**:

- **Endpoint**: TBD (e.g., `GET /api/v1/organizations/:coreOrgId`)
- **Purpose**: Validate that Core organizationId exists before creating mapping
- **Method**: GET
- **Headers**: `Authorization: Bearer <core-service-token>`, `X-Correlation-Id: <id>`
- **Response**: 200 OK (org exists), 404 Not Found (org does not exist)
- **Error Handling**: 404 → fail mapping creation, 5xx → retry with backoff

**Template Publishing**:

- **Endpoint**: TBD (e.g., `POST /api/v1/templates/publish`)
- **Purpose**: Publish pre-defined template to Core for a specific organization
- **Method**: POST
- **Headers**: `Authorization: Bearer <core-service-token>`, `X-Organization-Id: <coreOrgId>`, `X-Correlation-Id: <id>`
- **Request Body**: TBD (e.g., `{ templateId: string, coreOrgId: string }`)
- **Response**: 201 Created (success), 400 Bad Request (invalid template), 404 Not Found (org not found)
- **Error Handling**: 4xx → return safe error to UI, 5xx → retry with backoff

**TODO**: Define exact Core endpoint URLs, request/response schemas, and error codes in INTEGRATION_CONTRACT_CORE.md before implementation.

### 3.2 Authentication Flow

**How BFF Obtains Core Service Token**:

1. BFF starts up and reads Core service credentials from environment variables or secret store
2. BFF calls Core authentication endpoint (TBD: e.g., `POST /auth/service-token`) with credentials
3. Core returns service token (JWT) with expiry
4. BFF stores token in memory (server-side only, never exposed to UI)
5. BFF includes token in `Authorization: Bearer <token>` header for all Core API calls
6. BFF monitors token expiry and refreshes proactively before expiry

**TODO**: Define exact Core authentication endpoint, credentials format, token TTL, and refresh mechanism.

### 3.3 Tenant Context Propagation

**MUST**: BFF MUST include tenant context (coreOrgId) in every Core API call that is org-scoped.

**Mechanism** (TBD):

- Option 1: `X-Organization-Id: <coreOrgId>` header
- Option 2: JWT claim in Core service token
- Option 3: Query parameter `?organizationId=<coreOrgId>`

**TODO**: Confirm with Core team which mechanism is required.

### 3.4 Correlation ID Propagation

**MUST**: BFF MUST generate a unique correlation ID for every request from UI and propagate it to Core.

**Mechanism**:

- UI → BFF: Generate correlation ID in BFF (or accept from UI if provided)
- BFF → Core: Include `X-Correlation-Id: <id>` header in all Core API calls
- BFF logs: Include correlation ID in all log entries
- Core logs: Core SHOULD include correlation ID in its logs (if supported)

**TODO**: Confirm Core's support for `X-Correlation-Id` header.

---

## 4) Error Handling & Resilience

### 4.1 Retry Policy

**MUST**: BFF MUST implement bounded retries for Core API calls.

**Policy**:

- **Max Retries**: 3
- **Backoff Strategy**: Exponential (1s, 2s, 4s)
- **Retry Conditions**: 5xx errors, network timeouts
- **No Retry Conditions**: 4xx errors (client errors), 401/403 (auth failures)

**TODO**: Confirm retry policy aligns with Core's rate limiting and idempotency support.

### 4.2 Timeouts

**MUST**: BFF MUST set reasonable timeouts for Core API calls.

**Timeouts**:

- **Read Operations** (GET): 10 seconds
- **Write Operations** (POST, PATCH): 30 seconds

**TODO**: Adjust timeouts based on Core's actual response times during testing.

### 4.3 Circuit Breaker (Principle)

**Principle**: If Core API repeatedly fails, BFF SHOULD temporarily stop calling that endpoint to prevent cascading failures.

**Thresholds** (TBD):

- **Failure Count to Open Circuit**: 5 consecutive failures
- **Timeout in Open State**: 60 seconds
- **Recovery Strategy**: Half-open state, single test request

**TODO**: Implement circuit breaker pattern if Core integration proves unstable during testing.

### 4.4 Idempotency

**MUST**: BFF MUST ensure idempotency for non-idempotent Core API calls (e.g., template publishing).

**Mechanism** (TBD):

- Use idempotency keys if supported by Core (e.g., `X-Idempotency-Key: <uuid>`)
- Store idempotency key in Suite DB to prevent duplicate requests

**TODO**: Confirm Core's support for idempotency keys.

---

## 5) Fail-Closed Enforcement

### 5.1 Missing Org Mapping

**Scenario**: User attempts to publish template to Core, but Suite org has no coreOrgId mapping.

**Action**:

- BFF MUST deny the request
- BFF MUST return safe error to UI: "Organization mapping not found. Please link this organization to Core first."
- BFF MUST log the failure with correlation ID
- BFF MUST NOT guess or infer coreOrgId

### 5.2 Ambiguous Org Mapping

**Scenario**: Multiple Suite orgs map to the same coreOrgId (should not happen, but fail-closed).

**Action**:

- BFF MUST deny the request
- BFF MUST return safe error to UI: "Organization mapping is ambiguous. Please contact support."
- BFF MUST log the failure with correlation ID
- BFF MUST NOT proceed with any operation

### 5.3 Core API Failure

**Scenario**: Core API returns 5xx error or times out.

**Action**:

- BFF MUST retry with bounded backoff (max 3 retries)
- If all retries fail, BFF MUST return safe error to UI: "Service temporarily unavailable. Please try again later."
- BFF MUST log the failure with correlation ID
- BFF MUST NOT expose Core error details to UI

---

## 6) Observability

### 6.1 Logging

**MUST Log** (BFF side):

- Core API call (endpoint, method, status code, duration)
- Correlation ID
- Tenant context (coreOrgId, if applicable)
- Errors and retries
- Token refresh events (without logging token value)

**MUST NOT Log**:

- Core service token
- Sensitive request/response payloads (unless explicitly safe)
- PII or confidential business data

### 6.2 Metrics (TBD)

**TODO**: Define metrics to track (e.g., Core API latency, error rate, retry count).

### 6.3 Alerts (TBD)

**TODO**: Define alerts for critical failures (e.g., Core API down, token refresh failure).

---

## 7) Security Requirements

### 7.1 Core Service Token Handling

**MUST**:

- Store Core service token in server-side environment (environment variable, secret store)
- Include token in `Authorization` header for all Core API calls
- Rotate token according to Core's policy (TBD)
- Never expose token to UI or client-side code
- Never log token value

**MUST NOT**:

- Store token in UI or browser storage
- Include token in URLs or query parameters
- Forward UI token to Core

### 7.2 TLS/HTTPS

**MUST**: All BFF → Core communication MUST use HTTPS/TLS 1.2 or higher.

**MUST NOT**: Disable TLS or accept self-signed certificates in production.

---

## 8) Break-Glass Policy (Org Mapping Changes)

### 8.1 Purpose

In rare cases, an org mapping may need to be corrected (e.g., wrong coreOrgId linked). This is a high-risk operation and requires explicit approval.

### 8.2 Break-Glass Protocol

**Allowed Actions**:

- Update existing SuiteOrgMapping.coreOrgId (change mapping)

**Required Approvals**:

- Written justification (why mapping is incorrect)
- Explicit approval from Governance Authority or designated approver
- Audit log entry with approval reference

**Forbidden Actions**:

- Delete SuiteOrgMapping (mappings are immutable)
- Bulk update mappings without individual approvals

**TODO**: Define designated approvers and approval workflow.

---

## 9) Stop Rules

Execution MUST STOP IMMEDIATELY if any of the following occurs:

- BFF calls Core endpoint not listed in this plan (or INTEGRATION_CONTRACT_CORE.md)
- BFF accesses Core DB directly
- Core service token is exposed to UI or logged
- BFF forwards UI token to Core
- Org mapping ambiguity is handled with fail-open behavior
- BFF proceeds with Core API call without tenant context (coreOrgId) when required

**Action on STOP**: Halt all work, document the violation, escalate to Governance Authority.

---

## 10) Acceptance Criteria

This integration plan is considered ACTIVE and BINDING when ALL of the following are true:

- [ ] All Core endpoints to be called are explicitly listed (or marked TBD with reference to contract)
- [ ] Authentication flow for obtaining Core service token is documented
- [ ] Tenant context propagation mechanism is defined (or marked TBD)
- [ ] Correlation ID propagation is documented
- [ ] Retry policy, timeouts, and circuit breaker principles are defined
- [ ] Idempotency handling is documented (or marked TBD)
- [ ] Fail-closed enforcement rules are explicit
- [ ] Observability requirements (logging, metrics, alerts) are defined (or marked TBD)
- [ ] Security requirements (token handling, TLS) are documented
- [ ] Break-glass policy for org mapping changes is documented
- [ ] Stop rules are explicit and enforceable
- [ ] No contradictions exist with MODULE_CHARTER.md, MODULE_SCOPE_LOCK.md, or repo-level governance
- [ ] Governance Authority has reviewed and approved this plan

---

## 11) Change Control

### 11.1 Required Approvals

Changes to this integration plan require:

- Written justification
- Explicit approval from Governance Authority
- Update to INTEGRATION_CONTRACT_CORE.md (if adding new Core endpoints)
- Version increment and git tag

### 11.2 Forbidden Changes

The following changes are FORBIDDEN without escalation:

- Adding Core endpoints not authorized in INTEGRATION_CONTRACT_CORE.md
- Allowing UI → Core direct calls
- Exposing Core service token to UI
- Weakening fail-closed enforcement

---

## 12) Signature

**Approved By**: Governance Authority  
**Date**: 2026-01-26  
**Status**: FINAL — BINDING INTEGRATION PLAN
