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

| Term                | Definition                                                                                                |
| ------------------- | --------------------------------------------------------------------------------------------------------- |
| **User-Scoped JWT** | JSON Web Token issued by Core for user authentication; contains user and organization claims              |
| **Org Alignment**   | Process of mapping Suite organizationId to Core organizationId; stored in Suite DB                        |
| **Correlation ID**  | Unique identifier for a request, propagated across UI → BFF → Core for tracing and debugging (Suite-only) |
| **BFF**             | Backend-for-Frontend; Suite's server-side API layer, the ONLY component allowed to call Core              |
| **UI**              | Suite frontend applications (web/mobile); MUST NOT call Core directly                                     |

---

## 3) Allowed Interaction Patterns (Strict)

### 3.1 UI → BFF Only

**MUST**: All UI requests MUST go to Suite BFF.

**MUST NOT**: UI MUST NEVER call Core APIs directly.

**MUST NOT**: UI MUST NEVER possess or use Core service tokens.

### 3.2 BFF → Core Only

**MUST**: Suite BFF is the ONLY component allowed to call Core APIs.

**Core v1 Authentication: User-scoped JWT ONLY. Service-to-service auth/tokens are NOT AVAILABLE in Core v1 (DEFERRED to Core v2 contract lock).**

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

**MUST**: BFF MUST include tenant context in every Core API call that is org-scoped.

**Tenant context: derived from JWT claim organizationId ONLY. No X-Organization-Id / X-Tenant-Id headers. No ?organizationId= query param.**

---

## 5) Authentication & Authorization Model (Server-Only)

### 5.1 Core v1 Authentication Reality

**Core v1 uses User-Scoped JWT authentication ONLY.**

**NOT AVAILABLE in Core v1:**

- Service-to-service authentication
- Core service tokens
- OAuth2 client credentials flow
- Token refresh mechanism

**MUST**: BFF validates user-scoped JWT (containing organizationId claim) and forwards it to Core as `Authorization: Bearer <jwt-token>`.

**MUST**: BFF includes JWT in `Authorization: Bearer <jwt-token>` header for Core API calls.

**401/403 from Core: DENY immediately (fail-closed). No retry. No refresh.**

### 5.2 Never Expose to Clients

**MUST NOT**: Core service token MUST NEVER be sent to UI (NOT AVAILABLE in Core v1).

**MUST NOT**: Sensitive authentication tokens MUST NEVER be logged in application logs.

**MUST NOT**: Authentication tokens MUST NEVER be included in error messages returned to clients.

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

**Policy**: Max 3 retries, exponential backoff (1s, 2s, 4s).

### 7.2 Idempotency Considerations (Conceptual)

**MUST**: BFF MUST ensure idempotency for non-idempotent Core API calls (e.g., use idempotency keys if supported by Core).

**MUST**: BFF MUST NOT retry non-idempotent operations (e.g., POST /create-resource) without idempotency safeguards.

**Note**: Template Publishing is DEFERRED in Core v1, so idempotency requirements for publish are N/A in v1.

### 7.3 Timeouts

**MUST**: BFF MUST set reasonable timeouts for Core API calls.

**Timeouts**:

- Read operations (GET): 10 seconds
- Write operations (POST, PATCH): 30 seconds

**MUST**: BFF MUST handle timeout errors gracefully (log, return safe error to UI).

### 7.4 Circuit Breaker Principle (No Tooling)

**Principle**: If Core API repeatedly fails, BFF SHOULD temporarily stop calling that endpoint to prevent cascading failures.

**MUST**: BFF MUST log circuit breaker state changes (open, half-open, closed) for observability.

**Thresholds**: 5 consecutive failures, 60 second timeout in open state, half-open recovery strategy.

---

## 8) Observability Contract

### 8.1 Correlation IDs

**MUST**: Every request from UI → BFF MUST generate a unique correlation ID.

**MUST**: BFF MUST propagate correlation ID to Core in every API call (e.g., via `X-Correlation-Id` header).

**MUST**: BFF MUST include correlation ID in all log entries for that request.

**Correlation ID is Suite-only. Core does not guarantee echo/logging.**

### 8.2 Logging Boundaries

**MUST Log** (BFF side):

- Core API call (endpoint, method, status code, duration)
- Correlation ID
- Tenant context (coreOrgId)
- Errors and retries

**MUST NOT Log**:

- Core service tokens (NOT AVAILABLE in Core v1)
- Sensitive request/response payloads (unless explicitly safe and approved)
- PII or confidential business data

### 8.3 No Secrets in Logs

**MUST**: BFF MUST sanitize logs to exclude authentication tokens, API keys, passwords, and PII.

**MUST**: Use correlation IDs for debugging instead of logging sensitive context.

---

## 9) Versioning Strategy

### 9.1 How Contract Changes Are Tracked

**MUST**: This document is versioned using git tags (e.g., `suite-integration-contract-v1`, `suite-integration-contract-v2`).

**MUST**: Any change to allowed interaction patterns, data flow rules, or Core endpoints requires a new version.

**MUST**: Version changes require written justification and approval from Governance Authority.

### 9.2 Backward Compatibility

**MUST**: Suite MUST handle Core API version changes gracefully (e.g., detect version mismatch, log error, fail-closed).

**Core API versioning**: Endpoint path `/api/v1/...`

### 9.3 Breaking Changes

**MUST**: If Core introduces a breaking change, Suite MUST update this contract BEFORE adapting implementation.

**MUST**: Breaking changes MUST be documented in contract changelog.

---

## 10) Stop Rules

Execution MUST STOP IMMEDIATELY if any of the following occurs:

- UI attempts to call Core API directly
- Core service token found in UI code or client-side storage (NOT AVAILABLE in Core v1)
- BFF accesses Core DB directly
- BFF calls Core endpoint not listed in Core Contract v1
- Tenant mapping ambiguity handled with fail-open behavior
- Core API call made without tenant context (organizationId from JWT claim)
- Authentication tokens logged or included in error messages
- Suite stores Core-owned sensitive data without explicit authorization in this contract
- BFF attempts to implement service-token flows (NOT AVAILABLE in Core v1)
- BFF attempts to implement token refresh mechanism (NOT AVAILABLE in Core v1)
- BFF invents tenant headers not in Core v1 (e.g., X-Organization-Id, X-Tenant-Id)

**Action on STOP**: Halt all work, document the violation, escalate to Governance Authority.

---

## 11) Acceptance Criteria

This integration contract is considered ACTIVE and BINDING when ALL of the following are true:

- [ ] All allowed interaction patterns are explicit (UI → BFF only, BFF → Core only, no Core DB access)
- [ ] OrganizationId mapping rules are defined and fail-closed
- [ ] Authentication uses User-Scoped JWT only (Core v1 reality)
- [ ] Data flow rules are defined (what may be cached, source of truth boundaries)
- [ ] Error handling and resilience principles are documented (retries, idempotency, timeouts, circuit breaker)
- [ ] Observability contract is defined (correlation IDs, logging boundaries, no secrets)
- [ ] Versioning strategy is documented
- [ ] Stop rules are explicit and enforceable
- [ ] No contradictions exist with EXECUTION_AUTHORITY.md, ARCHITECTURAL_LAWS.md, or SECURITY_BASELINE.md
- [ ] Governance Authority has reviewed and approved this document

---

## 12) Core Contract v1 Alignment

### 12.1 Core Endpoints (Locked to Core Contract v1)

**Authorized Core Endpoints**:

**Organization Validation**:

- Endpoint: `GET /api/v1/organizations/:id`
- Purpose: Validate that Core organizationId exists before creating mapping
- Headers: `Authorization: Bearer <jwt-token>`, `X-Correlation-Id: <id>` (Suite-only)
- Response: 200 OK (org exists), 404 Not Found (org does not exist)
- Idempotency: N/A (read-only)

**Template Publishing: DEFERRED. No Core publish endpoint exists in Core v1. Implementation requires Core v2 and a new contract lock.**

### 12.2 Authentication Flow (Core Contract v1)

**Core v1 Reality**:

- User-scoped JWT authentication ONLY
- No service-to-service authentication
- No core service tokens
- No OAuth2 client credentials flow
- No token refresh mechanism

**Authentication Mechanism**:

- Suite validates a user-scoped JWT (must include organizationId claim) and forwards it as Authorization: Bearer <jwt-token> on Core API calls
- JWT contains claims: `sub` (user ID), `email`, `organizationId`
- No token minting/refresh exists in Core v1; any 401 is fail-closed

### 12.3 Tenant Context Propagation (Core Contract v1)

**Mechanism**:

- JWT Claim: `organizationId` (in JWT payload)
- Core extracts `organizationId` from JWT via `JwtStrategy`
- Core sets CLS context: `orgId`, `userId`

**NOT USED** (confirmed NOT in Core v1):

- ❌ `X-Organization-Id` header
- ❌ `X-Tenant-Id` header
- ❌ Query parameter `?organizationId=`

### 12.4 Correlation ID (Suite-Only)

**Suite Implementation**:

- UI → BFF: Generate correlation ID in BFF (UUID v4)
- BFF → Core: Include `X-Correlation-Id: <id>` header in outbound requests
- BFF logs: Include correlation ID in ALL Suite log entries

**Core v1 Reality**:

- Core v1 does NOT have correlation ID middleware/interceptor
- Core echo/logging of correlation ID is NOT GUARANTEED
- Correlation ID is for Suite-side tracing only

---

## 13) Signature

**Approved By**: Governance Authority  
**Date**: 2026-01-26  
**Status**: FINAL — BINDING INTEGRATION CONTRACT
