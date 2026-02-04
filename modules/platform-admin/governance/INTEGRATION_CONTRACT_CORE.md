# Suite — INTEGRATION_CONTRACT_CORE (Suite ↔ Core Contract)

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Module Name    | platform-admin                          |
| Document Title | INTEGRATION_CONTRACT_CORE               |
| Repo           | Suite (Layer / Product Repo)            |
| Status         | FINAL — BINDING INTEGRATION CONTRACT    |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-02-04                              |

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

**SUITE-ONLY**

**MUST**: All Suite ↔ Core integration MUST be defined in this contract BEFORE implementation.

**MUST**: Core is treated as a black box; Suite MUST NOT rely on Core internal implementation details.

**MUST**: Any change to integration patterns requires updating this contract and obtaining approval.

**MUST NOT**: Implement "temporary" or "experimental" Core integrations outside this contract.

**Evidence**: `ARCHITECTURAL_LAWS.md` LAW-2 (Core Black Box), LAW-9 (Contract-First Integration)

---

## 2) Definitions

| Term                | Definition                                                                                                            |
| ------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **User-Scoped JWT** | JSON Web Token issued by Core for user authentication; contains user and organization claims (CONFIRMED)              |
| **Org Alignment**   | Process of mapping Suite organizationId to Core organizationId; stored in Suite DB (SUITE-ONLY)                       |
| **Correlation ID**  | Unique identifier for a request, propagated across UI → BFF → Core for tracing (SUITE-ONLY, Core echo NOT guaranteed) |
| **BFF**             | Backend-for-Frontend; Suite's server-side API layer, the ONLY component allowed to call Core (SUITE-ONLY)             |
| **UI**              | Suite frontend applications (web/mobile); MUST NOT call Core directly (SUITE-ONLY)                                    |

---

## 3) Allowed Interaction Patterns (Strict)

### 3.1 UI → BFF Only

**SUITE-ONLY**

**MUST**: All UI requests MUST go to Suite BFF.

**MUST NOT**: UI MUST NEVER call Core APIs directly.

**MUST NOT**: UI MUST NEVER possess or use Core JWTs.

**Evidence**: `ARCHITECTURAL_LAWS.md` LAW-3 (UI Never Talks to Core)

---

### 3.2 BFF → Core Only

**SUITE-ONLY**

**MUST**: Suite BFF is the ONLY component allowed to call Core APIs.

**MUST**: BFF MUST use HTTPS/TLS for all Core API calls.

**Evidence**: `ARCHITECTURAL_LAWS.md` LAW-4 (BFF is the Only Integration Boundary)

---

### 3.3 No Core DB Access Ever

**SUITE-ONLY**

**MUST NOT**: Suite MUST NEVER access Core database directly.

**MUST**: All Core data access MUST occur via Core APIs.

**MUST**: Suite MUST NOT assume knowledge of Core DB schema.

**Evidence**: `ARCHITECTURAL_LAWS.md` LAW-6 (Database Separation)

---

## 4) Identity & Tenant Alignment

### 4.1 OrganizationId Mapping Rules

**SUITE-ONLY**

**MUST**: Suite stores a mapping table in Suite DB:

```typescript
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

**Evidence**: `ARCHITECTURAL_LAWS.md` LAW-7 (Tenant Boundary — Org Alignment Only)

---

### 4.2 Fail-Closed Rules for Missing/Ambiguous Mapping

**SUITE-ONLY**

**MUST**: If `suiteOrgId` has no corresponding `coreOrgId`, BFF MUST deny the request and return safe error.

**MUST**: If `coreOrgId` is ambiguous (multiple Suite orgs map to same Core org without explicit authorization), BFF MUST deny the request.

**MUST**: BFF MUST log mapping failures with correlation ID for debugging.

**MUST NOT**: BFF MUST NOT guess, infer, or create mappings automatically.

**Evidence**: `ARCHITECTURAL_LAWS.md` LAW-10 (Fail-Closed By Default)

---

### 4.3 Tenant Context Propagation

**CONFIRMED (Core v1)**

Core extracts tenant context from JWT claim `organizationId` ONLY.

**Mechanism**:

- Client → Core: JWT claim in `Authorization` header
- Core extracts `organizationId` from JWT payload via JwtStrategy
- Core sets CLS context: `orgId`, `userId`

**NOT USED** (Core v1):

- ❌ `X-Organization-Id` header
- ❌ `X-Tenant-Id` header
- ❌ Query parameter `?organizationId=`

**Evidence**: `CORE_V1_INTEGRATION_LOCK.md` Section 3.3

---

## 5) Authentication & Authorization Model

### 5.1 Core v1 Authentication Reality

**CONFIRMED (Core v1)**

Core v1 uses User-Scoped JWT authentication ONLY.

**Authentication Mechanism**:

- JWT Bearer token in `Authorization` header
- JWT contains claims: `sub` (user ID), `email`, `organizationId`
- Core validates JWT via JwtStrategy

**Evidence**: `CORE_V1_INTEGRATION_LOCK.md` Section 3.2

---

### 5.2 NOT AVAILABLE in Core v1

**NOT AVAILABLE**

The following authentication mechanisms are NOT supported by Core v1:

- ❌ Service-to-service authentication
- ❌ Core service tokens
- ❌ OAuth2 client credentials flow
- ❌ Token refresh mechanism

**Evidence**: `CORE_V1_INTEGRATION_LOCK.md` Section 5.1, Section 5.2

**Status**: DEFERRED until Core v2

---

### 5.3 BFF Authentication Flow

**SUITE-ONLY**

**MUST**: BFF validates user-scoped JWT (containing organizationId claim) and forwards it to Core as `Authorization: Bearer <jwt-token>`.

**MUST**: BFF includes JWT in `Authorization: Bearer <jwt-token>` header for Core API calls.

**401/403 from Core**: DENY immediately (fail-closed). No retry. No refresh.

**Evidence**: `ARCHITECTURAL_LAWS.md` LAW-10 (Fail-Closed By Default)

---

### 5.4 Never Expose to Clients

**SUITE-ONLY**

**MUST NOT**: Core JWT MUST NEVER be sent to UI.

**MUST NOT**: Sensitive authentication tokens MUST NEVER be logged in application logs.

**MUST NOT**: Authentication tokens MUST NEVER be included in error messages returned to clients.

**Evidence**: `ARCHITECTURAL_LAWS.md` LAW-5 (Token & Identity Separation)

---

## 6) Data Flow Rules

### 6.1 What May Be Cached in Suite DB

**SUITE-ONLY**

**Allowed** (with explicit authorization):

- Metadata about Core resources (e.g., workflow definition IDs, user IDs) for mapping purposes
- OrganizationId mapping (Suite ↔ Core)
- Non-sensitive reference data explicitly authorized by Core contract

**Forbidden** (unless explicitly authorized):

- Core-owned sensitive records (e.g., user credentials, financial data, health records)
- Core internal state (e.g., workflow execution logs, audit trails)
- Any data where Core is the source of truth and Suite has no business need to store

**Evidence**: `ARCHITECTURAL_LAWS.md` LAW-8 (Module Ownership & Data Ownership)

---

### 6.2 Source of Truth Boundaries

**CONFIRMED (Core v1)** — Core is Source of Truth for:

- User authentication and authorization
- Workflow definitions and executions
- Core tenant (organization) records
- Core audit logs

**Evidence**: `CORE_V1_INTEGRATION_LOCK.md` Section 3.1

---

**SUITE-ONLY** — Suite is Source of Truth for:

- CRM contacts, deals, activities
- Omnichannel messages, channels, routing rules
- Suite-specific configuration and settings
- Suite organizationId ↔ Core organizationId mapping

---

**MUST**: Suite MUST NOT modify Core-owned data.

**MUST**: Core MUST NOT modify Suite-owned data (Core is black box; this is enforced by separation).

**Evidence**: `ARCHITECTURAL_LAWS.md` LAW-6 (Database Separation)

---

## 7) Error Handling & Resilience

### 7.1 Safe Retries (Bounded)

**SUITE-ONLY**

**MUST**: BFF MUST implement bounded retries for Core API calls (e.g., max 3 retries with exponential backoff).

**MUST**: BFF MUST retry only on transient errors (e.g., 5xx, network timeout).

**MUST NOT**: BFF MUST NOT retry on client errors (4xx) or authentication failures (401, 403).

**Policy**: Max 3 retries, exponential backoff (1s, 2s, 4s).

---

### 7.2 Idempotency Considerations

**SUITE-ONLY**

**MUST**: BFF MUST ensure idempotency for non-idempotent Core API calls (e.g., use idempotency keys if supported by Core).

**MUST**: BFF MUST NOT retry non-idempotent operations (e.g., POST /create-resource) without idempotency safeguards.

---

### 7.3 Timeouts

**SUITE-ONLY**

**MUST**: BFF MUST set reasonable timeouts for Core API calls.

**Timeouts**:

- Read operations (GET): 10 seconds
- Write operations (POST, PATCH): 30 seconds

**MUST**: BFF MUST handle timeout errors gracefully (log, return safe error to UI).

---

### 7.4 Circuit Breaker Principle

**SUITE-ONLY**

**Principle**: If Core API repeatedly fails, BFF SHOULD temporarily stop calling that endpoint to prevent cascading failures.

**MUST**: BFF MUST log circuit breaker state changes (open, half-open, closed) for observability.

**Thresholds**: 5 consecutive failures, 60 second timeout in open state, half-open recovery strategy.

---

## 8) Observability Contract

### 8.1 Correlation IDs

**SUITE-ONLY**

**MUST**: Every request from UI → BFF MUST generate a unique correlation ID.

**MUST**: BFF MUST propagate correlation ID to Core in every API call (e.g., via `X-Correlation-Id` header).

**MUST**: BFF MUST include correlation ID in all log entries for that request.

---

**NOT AVAILABLE** (Core v1)

Core v1 does NOT have correlation ID middleware/interceptor. Core echo/logging of correlation ID is NOT GUARANTEED.

**Evidence**: `CORE_V1_INTEGRATION_LOCK.md` Section 6.1

---

### 8.2 Logging Boundaries

**SUITE-ONLY**

**MUST Log** (BFF side):

- Core API call (endpoint, method, status code, duration)
- Correlation ID
- Tenant context (coreOrgId)
- Errors and retries

**MUST NOT Log**:

- Core JWTs (value)
- Sensitive request/response payloads (unless explicitly safe and approved)
- PII or confidential business data

---

### 8.3 No Secrets in Logs

**SUITE-ONLY**

**MUST**: BFF MUST sanitize logs to exclude authentication tokens, API keys, passwords, and PII.

**MUST**: Use correlation IDs for debugging instead of logging sensitive context.

---

## 9) Versioning Strategy

### 9.1 How Contract Changes Are Tracked

**SUITE-ONLY**

**MUST**: This document is versioned using git tags (e.g., `suite-integration-contract-v1`, `suite-integration-contract-v2`).

**MUST**: Any change to allowed interaction patterns, data flow rules, or Core endpoints requires a new version.

**MUST**: Version changes require written justification and approval from Governance Authority.

---

### 9.2 Core API Versioning

**CONFIRMED (Core v1)**

Core API uses URL prefix versioning: `/api/v1/...`

**Evidence**: `CORE_V1_INTEGRATION_LOCK.md` Section 3.4

---

### 9.3 Breaking Changes

**SUITE-ONLY**

**MUST**: If Core introduces a breaking change, Suite MUST update this contract BEFORE adapting implementation.

**MUST**: Breaking changes MUST be documented in contract changelog.

---

## 10) Core Contract v1 Alignment

### 10.1 Core Endpoints (Locked to Core Contract v1)

**CONFIRMED (Core v1)**

**Total Endpoints**: 42 endpoints across 9 controllers

**Evidence**: `CORE_CONTRACT_V1_EXTRACT.md` Section B

---

**Organization Validation**:

- **Endpoint**: `GET /api/v1/organizations/:id`
- **Purpose**: Validate that Core organizationId exists before creating mapping
- **Headers**: `Authorization: Bearer <jwt-token>`, `X-Correlation-Id: <id>` (Suite-only, echo NOT guaranteed)
- **Response**: 200 OK (org exists), 404 Not Found (org does not exist)
- **Idempotency**: N/A (read-only)

**Evidence**: `CORE_V1_INTEGRATION_LOCK.md` Section 8.1

---

### 10.2 Template Publishing

**DEFERRED (Core v2+)**

Template publishing is NOT available in Core v1. No template publish endpoint found in Core controllers.

**Evidence**: `CORE_V1_INTEGRATION_LOCK.md` Section 4.1

**Status**: Implementation requires Core v2 and a new contract lock.

---

### 10.3 Authentication Flow (Core Contract v1)

**CONFIRMED (Core v1)**

**Authentication Mechanism**:

- Suite validates a user-scoped JWT (must include organizationId claim) and forwards it as `Authorization: Bearer <jwt-token>` on Core API calls
- JWT contains claims: `sub` (user ID), `email`, `organizationId`
- No token minting/refresh exists in Core v1; any 401 is fail-closed

**Evidence**: `CORE_V1_INTEGRATION_LOCK.md` Section 3.2, Section 5.2

---

### 10.4 Tenant Context Propagation (Core Contract v1)

**CONFIRMED (Core v1)**

**Mechanism**:

- JWT Claim: `organizationId` (in JWT payload)
- Core extracts `organizationId` from JWT via `JwtStrategy`
- Core sets CLS context: `orgId`, `userId`

**NOT USED** (confirmed NOT in Core v1):

- ❌ `X-Organization-Id` header
- ❌ `X-Tenant-Id` header
- ❌ Query parameter `?organizationId=`

**Evidence**: `CORE_V1_INTEGRATION_LOCK.md` Section 3.3

---

### 10.5 Correlation ID (Suite-Only)

**SUITE-ONLY**

**Suite Implementation**:

- UI → BFF: Generate correlation ID in BFF (UUID v4)
- BFF → Core: Include `X-Correlation-Id: <id>` header in outbound requests
- BFF logs: Include correlation ID in ALL Suite log entries

**NOT AVAILABLE** (Core v1)

Core v1 does NOT have correlation ID middleware/interceptor. Core echo/logging of correlation ID is NOT GUARANTEED.

**Evidence**: `CORE_V1_INTEGRATION_LOCK.md` Section 6.1

---

## 11) Stop Rules

**SUITE-ONLY**

Execution MUST STOP IMMEDIATELY if any of the following occurs:

- UI attempts to call Core API directly
- Core JWT found in UI code or client-side storage
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

## 12) Acceptance Criteria

This integration contract is considered ACTIVE and BINDING when ALL of the following are true:

- [x] All allowed interaction patterns are explicit (UI → BFF only, BFF → Core only, no Core DB access)
- [x] OrganizationId mapping rules are defined and fail-closed
- [x] Authentication uses User-Scoped JWT only (Core v1 reality)
- [x] Service-to-service auth marked NOT AVAILABLE (Core v1)
- [x] Token refresh marked NOT AVAILABLE (Core v1)
- [x] Template publishing marked DEFERRED (Core v1)
- [x] Data flow rules are defined (what may be cached, source of truth boundaries)
- [x] Error handling and resilience principles are documented (retries, idempotency, timeouts, circuit breaker)
- [x] Observability contract is defined (correlation IDs, logging boundaries, no secrets)
- [x] Versioning strategy is documented
- [x] Stop rules are explicit and enforceable
- [x] All CONFIRMED claims have evidence links
- [x] No contradictions exist with EXECUTION_AUTHORITY.md, ARCHITECTURAL_LAWS.md, or CORE_V1_INTEGRATION_LOCK.md

---

## 13) Signature

**Approved By**: Governance Authority  
**Date**: 2026-02-04  
**Status**: FINAL — BINDING INTEGRATION CONTRACT
