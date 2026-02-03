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

- **Purpose**: Validate Core organizationId. Template Publishing is DEFERRED (NOT AVAILABLE in Core v1). No Core publish call exists in v1.
- **Integration Method**: BFF → Core API (server-to-server, HTTPS/TLS)
- **Authentication**: User-Scoped JWT ONLY. (Service Tokens **NOT AVAILABLE** in Core v1).

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

### 3.1 Core Endpoints (Locked to Core Contract v1)

> [!IMPORTANT]
> **Source**: Core Contract v1 (see `core-contract/CORE_V1_INTEGRATION_LOCK.md`)

**MUST call ONLY these Core endpoints**:

**Organization Validation**:

- **Endpoint**: `GET /api/v1/organizations/:id`
- **Purpose**: Validate that Core organizationId exists before creating mapping
- **Method**: GET
- **Headers**: `Authorization: Bearer <jwt-token>`, `X-Correlation-Id: <id>` (Suite-only, Core echo not guaranteed)
- **Response**: 200 OK (org exists), 404 Not Found (org does not exist)
- **Error Handling**: 404 → fail mapping creation, 5xx → retry with backoff
- **Source**: Confirmed in Core Contract v1 Extract

**Template Publishing**:

> [!WARNING]
> **DEFERRED IN CORE V1** — Template publish endpoint does NOT exist in Core v1.  
> This capability is DEFERRED until Core v2. DO NOT implement.

- **Status**: ❌ DEFERRED (not in Core v1)
- **Reason**: No template publish controller found in Core v1 source
- **Future**: May be added in Core v2 (requires new contract lock)

### 3.2 Authentication Flow (Core Contract v1)

> [!WARNING]
> **Service-to-Service Authentication: NOT AVAILABLE in Core v1**

**Core v1 Reality**:

- Core v1 uses JWT-based authentication for user-scoped operations
- No service-token contract exists in Core v1
- No OAuth2 client credentials flow in Core v1
- No token refresh mechanism in Core v1

**Authentication Mechanism**:

- Suite uses JWT Bearer tokens issued to users
- JWT contains claims: `sub` (user ID), `email`, `organizationId`
- Suite includes JWT in `Authorization: Bearer <jwt-token>` header for Core API calls
- 401 responses from Core result in fail-closed behavior (no refresh available)

**Service-to-Service Auth**: DEFERRED until Core v2

### 3.3 Tenant Context Propagation (Core Contract v1)

**MUST**: Suite MUST include tenant context in every Core API call that is org-scoped.

**Mechanism** (CONFIRMED from Core v1):

- **JWT Claim**: `organizationId` (in JWT payload)
- Core extracts `organizationId` from JWT via `JwtStrategy`
- Core sets CLS context: `orgId`, `userId`

**NOT USED** (confirmed NOT in Core v1):

- ❌ `X-Organization-Id` header
- ❌ `X-Tenant-Id` header
- ❌ Query parameter `?organizationId=`

**Source**: Core Contract v1 Extract, Section D.2

### 3.4 Correlation ID Propagation (Suite-Only)

> [!IMPORTANT]
> **Correlation ID is SUITE-ONLY** — Core v1 does NOT have correlation ID middleware.

**Suite Implementation**:

- UI → BFF: Generate correlation ID in BFF (UUID v4)
- BFF → Core: Include `X-Correlation-Id: <id>` header in outbound requests
- BFF logs: Include correlation ID in ALL Suite log entries

**Core v1 Reality**:

- Core v1 does NOT have correlation ID middleware/interceptor
- Core echo/logging of correlation ID is NOT GUARANTEED
- Correlation ID is for Suite-side tracing only

**Source**: Core Contract v1 Extract, Section D.4 (NOT FOUND in Core source)

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

**MUST**: BFF MUST ensure idempotency for non-idempotent Core API calls.

Note: Template Publishing is DEFERRED in Core v1, so idempotency requirements for publish are N/A in v1.

**Mechanism** (TBD):

- Use idempotency keys if supported by Core (e.g., `X-Idempotency-Key: <uuid>`)
- Store idempotency key in Suite DB to prevent duplicate requests

**TODO**: Confirm Core's support for idempotency keys.

---

## 5) Fail-Closed Enforcement

### 5.1 Missing Org Mapping

**Scenario**: User submits a publish request (DEFERRED) but Suite org has no coreOrgId mapping. No Core call exists in v1.

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
- N/A (token refresh NOT AVAILABLE in Core v1)

**MUST NOT Log**:

- Core service token
- Sensitive request/response payloads (unless explicitly safe)
- PII or confidential business data

### 6.2 Metrics (TBD)

**TODO**: Define metrics to track (e.g., Core API latency, error rate, retry count).

### 6.3 Alerts (TBD)

**TODO**: Define alerts for critical failures (e.g., Core API down). Note: Token refresh is NOT AVAILABLE in Core v1.

---

## 7) Security Requirements

### 7.1 Core Service Token Handling

> [!WARNING]
> **NOT AVAILABLE IN CORE V1**
> Core Service Tokens do not exist. Authentication is User-Scoped JWT only.

- **Status**: **NOT AVAILABLE**.
- **Action**: Do NOT attempt to obtain or store service tokens.

**MUST NOT**:

- Store token in UI or browser storage
- Include token in URLs or query parameters
- Forward an unvalidated client token to Core (MUST forward only a validated user-scoped JWT issued/verified by Suite auth).

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

> [!CAUTION]
> **Core Contract v1 Alignment** — The following stop rules enforce Core v1 reality.

Execution MUST STOP IMMEDIATELY if any of the following occurs:

**Core Endpoint Violations**:

- BFF calls Core endpoint not listed in Core Contract v1 (or `core-contract/CORE_V1_INTEGRATION_LOCK.md`)
- BFF attempts to call template publish endpoint (DEFERRED in Core v1)
- BFF accesses Core DB directly

**Authentication Violations**:

- Core service token is exposed to UI or logged
- BFF attempts to implement service-token acquisition (NOT AVAILABLE in Core v1)
- BFF attempts to implement token refresh mechanism (NOT AVAILABLE in Core v1)
- BFF forwards UI token to Core

**Tenant Context Violations**:

- Org mapping ambiguity is handled with fail-open behavior
- BFF proceeds with Core API call without tenant context (organizationId) when required
- BFF invents tenant headers not in Core v1 (e.g., `X-Organization-Id`, `X-Tenant-Id`)

**Gate 5.3A Specific Stop Rules**:

- Template publish is DEFERRED until Core v2. Any attempt to implement template publish in Gate 5.3 or later is a STOP condition.
- Service-to-service authentication is NOT AVAILABLE in Core v1. Any attempt to implement service-token flows is a STOP condition.
- Correlation ID echo from Core is NOT GUARANTEED. Any dependency on Core logging correlation IDs is a STOP condition.

**Action on STOP**: Halt all work, document the violation, escalate to Governance Authority.

---

**Gate 5.3A Lock Scope**: This document locks Core v1 integration contract items only (authorized endpoints, auth model, tenant propagation, correlation handling, and explicit DEFERRED items). Any remaining "future implementation" items must be tracked in later gates and MUST NOT introduce Core assumptions.

## 10) Acceptance Criteria

This integration plan is considered ACTIVE and BINDING when ALL of the following are true:

- [ ] All Core endpoints to be called are explicitly listed and locked to Core Contract v1. No TBD endpoints permitted.
- [ ] Authentication flow uses User-Scoped JWT only
- [ ] Tenant context propagation is locked to JWT claim organizationId (Core v1). No tenant headers/query params permitted.
- [ ] Correlation ID propagation is documented
- [ ] Retry policy, timeouts, and circuit breaker principles are defined
- [ ] Idempotency is N/A for authorized read-only Core endpoint(s); publish idempotency is DEFERRED (Core v2 only).
- [ ] Fail-closed enforcement rules are explicit
- [ ] Observability is defined: correlation ID is Suite-only; Core echo/logging is not guaranteed; Suite logs include correlation ID on all Core calls.
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
- Attempting to use Service Tokens (feature does not exist)
- Weakening fail-closed enforcement

---

## 12) Signature

**Approved By**: Governance Authority  
**Date**: 2026-01-26  
**Status**: FINAL — BINDING INTEGRATION PLAN

---

## Changelog

- **2026-02-02**: Removed residual Core v2 assumptions (token refresh events in observability, token refresh failure alerts).
- **2026-02-02**: Aligned strictly to Core Contract v1 + Gate 5.3A Decision A.
- Removed remaining Template Publish-to-Core implications (Core v1 has no publish endpoint).
- Marked publish idempotency references as N/A (DEFERRED to Core v2).
