# Suite — INTEGRATION_CONTRACT_CORE (Suite ↔ Core Contract)

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Document Title | INTEGRATION_CONTRACT_CORE               |
| Repo           | Suite (Layer / Product Repo)            |
| Status         | FINAL — BINDING INTEGRATION CONTRACT    |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-01-26                              |

---

## 1) Purpose & Contract Philosophy

### 1.1 Purpose

This document defines the binding contract for how Suite integrates with Bassan.os Core. It establishes:

- Allowed interaction patterns
- Identity and tenant alignment rules
- Authentication and authorization model
- Data flow boundaries
- Error handling and resilience principles
- Observability requirements

### 1.2 Contract-First Philosophy

**MUST**: All Suite ↔ Core integration MUST be defined in this contract BEFORE implementation.

**MUST**: Core is treated as a black box; Suite MUST NOT rely on Core internal implementation details.

**MUST**: Any change to integration patterns requires updating this contract and obtaining approval.

**MUST NOT**: Implement "temporary" or "experimental" Core integrations outside this contract.

---

## 2) Definitions

| Term                   | Definition                                                                                                 |
| ---------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Core JWT**           | JSON Web Token issued by Core for service-to-service authentication; server-only, never exposed to clients |
| **Core Service Token** | Synonym for Core JWT; used by BFF to authenticate to Core APIs                                             |
| **Org Alignment**      | Process of mapping Suite organizationId to Core organizationId; stored in Suite DB                         |
| **Correlation ID**     | Unique identifier for a request, propagated across UI → BFF → Core for tracing and debugging               |
| **BFF**                | Backend-for-Frontend; Suite's server-side API layer, the ONLY component allowed to call Core               |
| **UI**                 | Suite frontend applications (web/mobile); MUST NOT call Core directly                                      |

---

## 3) Allowed Interaction Patterns (Strict)

### 3.1 UI → BFF Only

**MUST**: All UI requests MUST go to Suite BFF.

**MUST NOT**: UI MUST NEVER call Core APIs directly.

**MUST NOT**: UI MUST NEVER possess or use Core JWT/service tokens.

### 3.2 BFF → Core Only

**MUST**: Suite BFF is the ONLY component allowed to call Core APIs.

**MUST**: BFF MUST authenticate to Core using Core-issued service token.

**MUST**: BFF MUST use HTTPS/TLS for all Core API calls.

### 3.3 No Core DB Access Ever

**MUST NOT**: Suite MUST NEVER access Core database directly.

**MUST**: All Core data access MUST occur via Core APIs.

**MUST**: Suite MUST NOT assume knowledge of Core DB schema.

---

## 4) Identity & Tenant Alignment

### 4.1 OrganizationId Mapping Rules

**MUST**: Suite stores a mapping table in Suite DB:

```
SuiteOrganizationMapping {
  suiteOrgId: string (primary key)
  coreOrgId: string (external reference)
  createdAt: timestamp
  updatedAt: timestamp
}
```

**MUST**: Mapping is created when a Suite organization is linked to a Core organization.

**MUST**: Mapping is stored ONLY in Suite DB; Core stores its own organizationId independently.

**MUST NOT**: Suite and Core share a tenant table or database.

### 4.2 Fail-Closed Rules for Missing/Ambiguous Mapping

**MUST**: If `suiteOrgId` has no corresponding `coreOrgId`, BFF MUST deny the request and return safe error.

**MUST**: If `coreOrgId` is ambiguous (multiple Suite orgs map to same Core org without explicit authorization), BFF MUST deny the request.

**MUST**: BFF MUST log mapping failures with correlation ID for debugging.

**MUST NOT**: BFF MUST NOT guess, infer, or create mappings automatically.

### 4.3 Tenant Context Propagation

**MUST**: BFF MUST include tenant context (coreOrgId) in every Core API call (e.g., via header, JWT claim, or query parameter as defined by Core).

**TODO**: Define exact mechanism for passing tenant context to Core (e.g., `X-Organization-Id` header, JWT claim).

---

## 5) Authentication & Authorization Model (Server-Only)

### 5.1 How BFF Obtains Core Service Token (Principles)

**MUST**: BFF obtains Core service token via Core's designated authentication endpoint (e.g., OAuth2 client credentials flow, service account login).

**MUST**: BFF stores Core service token securely in server-side environment (environment variable, secret store).

**MUST**: BFF includes Core service token in `Authorization` header for all Core API calls (e.g., `Authorization: Bearer <token>`).

**MUST NOT**: BFF MUST NOT expose Core service token to UI or client-side code.

**TODO**: Define exact Core authentication endpoint and flow (e.g., `POST /auth/service-token`).

### 5.2 Token Rotation & Expiry Handling (Principles)

**MUST**: BFF MUST handle Core service token expiry gracefully (detect 401 Unauthorized, refresh token, retry request).

**MUST**: BFF MUST rotate Core service token according to Core's policy (e.g., daily, weekly).

**MUST**: BFF MUST log token refresh events for audit purposes.

**TODO**: Define Core service token TTL and rotation frequency.

### 5.3 Never Expose to Clients

**MUST NOT**: Core service token MUST NEVER be sent to UI.

**MUST NOT**: Core service token MUST NEVER be logged in application logs.

**MUST NOT**: Core service token MUST NEVER be included in error messages returned to clients.

---

## 6) Data Flow Rules

### 6.1 What May Be Cached in Suite DB

**Allowed** (with explicit authorization):

- Metadata about Core resources (e.g., workflow definition IDs, user IDs) for mapping purposes
- OrganizationId mapping (Suite ↔ Core)
- Non-sensitive reference data explicitly authorized by Core contract

**Forbidden** (unless explicitly authorized):

- Core-owned sensitive records (e.g., user credentials, financial data, health records)
- Core internal state (e.g., workflow execution logs, audit trails)
- Any data where Core is the source of truth and Suite has no business need to store

### 6.2 Source of Truth Boundaries

**Core is Source of Truth** for:

- User authentication and authorization
- Workflow definitions and executions
- Core tenant (organization) records
- Core audit logs

**Suite is Source of Truth** for:

- CRM contacts, deals, activities
- Omnichannel messages, channels, routing rules
- Suite-specific configuration and settings
- Suite organizationId ↔ Core organizationId mapping

**MUST**: Suite MUST NOT modify Core-owned data.

**MUST**: Core MUST NOT modify Suite-owned data (Core is black box; this is enforced by separation).

---

## 7) Error Handling & Resilience

### 7.1 Safe Retries (Bounded)

**MUST**: BFF MUST implement bounded retries for Core API calls (e.g., max 3 retries with exponential backoff).

**MUST**: BFF MUST retry only on transient errors (e.g., 5xx, network timeout).

**MUST NOT**: BFF MUST NOT retry on client errors (4xx) or authentication failures (401, 403).

**TODO**: Define exact retry policy (max retries, backoff strategy, timeout values).

### 7.2 Idempotency Considerations (Conceptual)

**MUST**: BFF MUST ensure idempotency for non-idempotent Core API calls (e.g., use idempotency keys if supported by Core).

**MUST**: BFF MUST NOT retry non-idempotent operations (e.g., POST /create-resource) without idempotency safeguards.

**TODO**: Define which Core endpoints support idempotency keys and how to use them.

### 7.3 Timeouts

**MUST**: BFF MUST set reasonable timeouts for Core API calls (e.g., 10 seconds for read, 30 seconds for write).

**MUST**: BFF MUST handle timeout errors gracefully (log, return safe error to UI).

**TODO**: Define specific timeout values per Core endpoint category.

### 7.4 Circuit Breaker Principle (No Tooling)

**Principle**: If Core API repeatedly fails, BFF SHOULD temporarily stop calling that endpoint to prevent cascading failures.

**MUST**: BFF MUST log circuit breaker state changes (open, half-open, closed) for observability.

**TODO**: Define circuit breaker thresholds (failure count, timeout duration, recovery strategy).

---

## 8) Observability Contract

### 8.1 Correlation IDs

**MUST**: Every request from UI → BFF MUST generate a unique correlation ID.

**MUST**: BFF MUST propagate correlation ID to Core in every API call (e.g., via `X-Correlation-Id` header).

**MUST**: BFF MUST include correlation ID in all log entries for that request.

**MUST**: Core SHOULD include correlation ID in its responses and logs (if supported).

**TODO**: Confirm Core's support for correlation ID propagation.

### 8.2 Logging Boundaries

**MUST Log** (BFF side):

- Core API call (endpoint, method, status code, duration)
- Correlation ID
- Tenant context (coreOrgId)
- Errors and retries

**MUST NOT Log**:

- Core service token
- Sensitive request/response payloads (unless explicitly safe and approved)
- PII or confidential business data

### 8.3 No Secrets in Logs

**MUST**: BFF MUST sanitize logs to exclude Core service tokens, API keys, passwords, and PII.

**MUST**: Use correlation IDs for debugging instead of logging sensitive context.

---

## 9) Versioning Strategy

### 9.1 How Contract Changes Are Tracked

**MUST**: This document is versioned using git tags (e.g., `suite-integration-contract-v1`, `suite-integration-contract-v2`).

**MUST**: Any change to allowed interaction patterns, data flow rules, or Core endpoints requires a new version.

**MUST**: Version changes require written justification and approval from Governance Authority.

### 9.2 Backward Compatibility

**MUST**: Suite MUST handle Core API version changes gracefully (e.g., detect version mismatch, log error, fail-closed).

**TODO**: Define how Core API versioning is communicated (e.g., version header, endpoint path).

### 9.3 Breaking Changes

**MUST**: If Core introduces a breaking change, Suite MUST update this contract BEFORE adapting implementation.

**MUST**: Breaking changes MUST be documented in contract changelog.

---

## 10) Stop Rules

Execution MUST STOP IMMEDIATELY if any of the following occurs:

- UI attempts to call Core API directly
- Core service token found in UI code or client-side storage
- BFF accesses Core DB directly
- BFF calls Core endpoint not listed in this contract (TODO section)
- Tenant mapping ambiguity handled with fail-open behavior
- Core API call made without tenant context (coreOrgId)
- Core service token logged or included in error messages
- Suite stores Core-owned sensitive data without explicit authorization in this contract

**Action on STOP**: Halt all work, document the violation, escalate to Governance Authority.

---

## 11) Acceptance Criteria

This integration contract is considered ACTIVE and BINDING when ALL of the following are true:

- [ ] All allowed interaction patterns are explicit (UI → BFF only, BFF → Core only, no Core DB access)
- [ ] OrganizationId mapping rules are defined and fail-closed
- [ ] Core service token handling is documented (obtain, store, rotate, never expose)
- [ ] Data flow rules are defined (what may be cached, source of truth boundaries)
- [ ] Error handling and resilience principles are documented (retries, idempotency, timeouts, circuit breaker)
- [ ] Observability contract is defined (correlation IDs, logging boundaries, no secrets)
- [ ] Versioning strategy is documented
- [ ] Stop rules are explicit and enforceable
- [ ] No contradictions exist with EXECUTION_AUTHORITY.md, ARCHITECTURAL_LAWS.md, or SECURITY_BASELINE.md
- [ ] Governance Authority has reviewed and approved this document

---

## 12) TODO Appendix

The following items require further definition before implementation:

### 12.1 Core Endpoints

**TODO**: Define exact list of Core API endpoints that Suite BFF is authorized to call, including:

- Endpoint URL
- HTTP method
- Purpose
- Required headers (e.g., Authorization, X-Organization-Id, X-Correlation-Id)
- Request/response schema (reference or inline)
- Expected status codes
- Idempotency support

**Example placeholder**:

```
GET /api/v1/workflows
Purpose: Retrieve workflow definitions for organization
Headers: Authorization: Bearer <token>, X-Organization-Id: <coreOrgId>, X-Correlation-Id: <id>
Response: 200 OK, array of workflow objects
Idempotency: N/A (read-only)
```

### 12.2 Core Authentication Flow

**TODO**: Define exact Core authentication endpoint and flow for obtaining service token:

- Endpoint URL (e.g., `POST /auth/service-token`)
- Authentication method (e.g., OAuth2 client credentials, service account credentials)
- Request payload (e.g., `{ clientId, clientSecret }`)
- Response format (e.g., `{ accessToken, expiresIn }`)
- Token TTL and rotation frequency

### 12.3 Tenant Context Propagation Mechanism

**TODO**: Define exact mechanism for passing tenant context (coreOrgId) to Core:

- Header name (e.g., `X-Organization-Id`)
- JWT claim (e.g., `orgId` in Core service token)
- Query parameter (e.g., `?organizationId=<coreOrgId>`)

### 12.4 Retry Policy

**TODO**: Define exact retry policy for Core API calls:

- Max retries (e.g., 3)
- Backoff strategy (e.g., exponential: 1s, 2s, 4s)
- Timeout values per endpoint category (e.g., 10s for read, 30s for write)

### 12.5 Circuit Breaker Thresholds

**TODO**: Define circuit breaker thresholds:

- Failure count to open circuit (e.g., 5 consecutive failures)
- Timeout duration in open state (e.g., 60 seconds)
- Recovery strategy (e.g., half-open state, single test request)

### 12.6 Core API Versioning

**TODO**: Define how Core API versioning is communicated:

- Version header (e.g., `X-API-Version: 1`)
- Endpoint path (e.g., `/api/v1/workflows`)
- How Suite detects and handles version mismatches

### 12.7 Correlation ID Support in Core

**TODO**: Confirm whether Core supports correlation ID propagation:

- Header name (e.g., `X-Correlation-Id`)
- Whether Core includes correlation ID in responses
- Whether Core logs correlation ID for debugging

---

## 13) Signature

**Approved By**: Governance Authority  
**Date**: 2026-01-26  
**Status**: FINAL — BINDING INTEGRATION CONTRACT
