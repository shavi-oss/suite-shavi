# Module Integration Plan — platform-admin

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Module Name    | platform-admin                          |
| Document Title | MODULE_INTEGRATION_PLAN                 |
| Repo           | Suite (Layer / Product Repo)            |
| Status         | FINAL — CORE V1 ALIGNED                 |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-02-04                              |

---

## 1) Purpose

This document defines how the `platform-admin` module integrates with external systems, specifically Bassan.os Core.

---

## 2) Integration Scope

### 2.1 External Systems

**CONFIRMED (Core v1)** — Bassan.os Core:

- **Purpose**: Validate Core organizationId
- **Integration Method**: BFF → Core API (HTTPS/TLS)
- **Authentication**: User-Scoped JWT ONLY

**Evidence**: `CORE_V1_INTEGRATION_LOCK.md` Section 3.2

---

**DEFERRED (Core v2+)** — Template Publishing:

Template publishing is NOT available in Core v1.

**Evidence**: `CORE_V1_INTEGRATION_LOCK.md` Section 4.1

---

**NOT AVAILABLE** (Core v1) — Service-to-Service Auth:

Service-to-Service Authentication is NOT supported by Core v1.

**Evidence**: `CORE_V1_INTEGRATION_LOCK.md` Section 5.1

---

### 2.2 Internal Systems

**SUITE-ONLY**

**Suite DB**:

- **Purpose**: Store Suite orgs, mappings, internal users, audit logs
- **Integration Method**: Direct database access via ORM/Prisma (server-side only)

---

## 3) Core Integration Details

### 3.1 Core Endpoints

**CONFIRMED (Core v1)**

**Organization Validation**:

- **Endpoint**: `GET /api/v1/organizations/:id`
- **Purpose**: Validate that Core organizationId exists before creating mapping
- **Headers**: `Authorization: Bearer <jwt-token>`, `X-Correlation-Id: <id>`
- **Response**: 200 OK (exists), 404 Not Found (does not exist)
- **Error Handling**: 404 → fail mapping creation, 5xx → retry with backoff

**Evidence**: `CORE_CONTRACT_V1_EXTRACT.md` Section B.8 (Line 182)

---

**DEFERRED (Core v2+)**

**Template Publishing**: NOT available in Core v1.

**Evidence**: `CORE_V1_INTEGRATION_LOCK.md` Section 4.1

---

### 3.2 Authentication Flow

**CONFIRMED (Core v1)**

Core v1 uses JWT-based authentication for user-scoped operations.

**Mechanism**:

- BFF forwards validated Core JWT in `Authorization: Bearer <jwt-token>` header
- JWT contains claims: `sub` (user ID), `email`, `organizationId`
- 401 responses result in fail-closed behavior

**Evidence**: `CORE_V1_INTEGRATION_LOCK.md` Section 3.2

---

**NOT AVAILABLE** (Core v1):

- Service-to-Service Authentication
- Token refresh mechanism

**Evidence**: `CORE_V1_INTEGRATION_LOCK.md` Section 5.1, Section 5.2

---

### 3.3 Tenant Context Propagation

**CONFIRMED (Core v1)**

**Mechanism**: JWT claim `organizationId` ONLY

- Core extracts `organizationId` from JWT via `JwtStrategy`
- Core sets CLS context: `orgId`, `userId`

**Evidence**: `CORE_V1_INTEGRATION_LOCK.md` Section 3.3

---

**NOT USED** (Core v1):

- ❌ `X-Organization-Id` header
- ❌ `X-Tenant-Id` header
- ❌ Query parameter `?organizationId=`

---

### 3.4 Correlation ID Propagation

**SUITE-ONLY**

**Implementation**:

- UI → BFF: Generate correlation ID in BFF (UUID v4)
- BFF → Core: Include `X-Correlation-Id: <id>` header
- BFF logs: Include correlation ID in ALL Suite log entries

**NOT GUARANTEED** (Core v1):

- Core v1 does NOT have correlation ID middleware
- Core echo/logging of correlation ID is NOT GUARANTEED
- Correlation ID is for Suite-side tracing only

**Evidence**: `CORE_V1_INTEGRATION_LOCK.md` Section 6.1

---

## 4) Error Handling & Resilience

### 4.1 Retry Policy

**SUITE-ONLY**

**Policy**:

- **Max Retries**: 3
- **Backoff Strategy**: Exponential (1s, 2s, 4s)
- **Retry Conditions**: 5xx errors, network timeouts
- **No Retry Conditions**: 4xx errors, 401/403

---

### 4.2 Timeouts

**SUITE-ONLY**

**Timeouts**:

- **Read Operations** (GET): 10 seconds
- **Write Operations** (POST, PATCH): 30 seconds

---

### 4.3 Circuit Breaker

**SUITE-ONLY**

**Principle**: Temporarily stop calling failing Core endpoints.

**Thresholds**:

- **Failure Count to Open Circuit**: 5 consecutive failures
- **Timeout in Open State**: 60 seconds
- **Recovery Strategy**: Half-open state, single test request

---

### 4.4 Idempotency

**SUITE-ONLY**

**Idempotency**: N/A for Core v1, as the only authorized Core endpoint is a read-only GET operation.

Idempotency requirements for write operations apply only if new Core endpoints are introduced in a future Core version (v2+).

---

## 5) Fail-Closed Enforcement

### 5.1 Missing Org Mapping

**SUITE-ONLY**

**Action**:

- BFF MUST deny the request
- BFF MUST return safe error to UI
- BFF MUST log the failure with correlation ID
- BFF MUST NOT guess or infer coreOrgId

---

### 5.2 Ambiguous Org Mapping

**SUITE-ONLY**

**Action**:

- BFF MUST deny the request
- BFF MUST return safe error to UI
- BFF MUST log the failure with correlation ID
- BFF MUST NOT proceed with any operation

---

### 5.3 Core API Failure

**SUITE-ONLY**

**Action**:

- BFF MUST retry with bounded backoff (max 3 retries)
- If all retries fail, BFF MUST return safe error to UI
- BFF MUST log the failure with correlation ID
- BFF MUST NOT expose Core error details to UI

---

## 6) Observability

### 6.1 Logging

**SUITE-ONLY**

**MUST Log** (BFF side):

- Core API call (endpoint, method, status code, duration)
- Correlation ID
- Tenant context (coreOrgId, if applicable)
- Errors and retries

**MUST NOT Log**:

- Core JWT (NOT AVAILABLE: service tokens in Core v1)
- Sensitive request/response payloads
- PII or confidential business data

---

## 7) Security Requirements

### 7.1 JWT Handling

**CONFIRMED (Core v1)**

BFF forwards validated user-scoped JWT to Core.

**Evidence**: `CORE_V1_INTEGRATION_LOCK.md` Section 3.2

---

**SUITE-ONLY**

**MUST**:

- Forward validated Core JWT in `Authorization: Bearer <jwt-token>` header
- Store JWT server-side in-memory only

**MUST NOT**:

- Store JWT in UI or browser storage
- Include JWT in URLs or query parameters
- Log JWT values
- Mint or construct Core JWTs

**Evidence**: `ARCHITECTURAL_LAWS.md` LAW-5 (Token & Identity Separation)

---

### 7.2 TLS/HTTPS

**SUITE-ONLY**

**MUST**: All BFF → Core communication MUST use HTTPS/TLS 1.2 or higher.

**MUST NOT**: Disable TLS or accept self-signed certificates in production.

---

## 8) Stop Rules

**SUITE-ONLY**

Execution MUST STOP IMMEDIATELY if:

**Core Endpoint Violations**:

- BFF calls Core endpoint not listed in Core Contract v1
- BFF attempts to call template publish endpoint (DEFERRED in Core v1)
- BFF accesses Core DB directly

**Authentication Violations**:

- Core JWT is exposed to UI or logged
- BFF attempts to implement service-token acquisition (NOT AVAILABLE in Core v1)
- BFF attempts to implement token refresh mechanism (NOT AVAILABLE in Core v1)
- BFF forwards UI token to Core

**Tenant Context Violations**:

- Org mapping ambiguity is handled with fail-open behavior
- BFF proceeds with Core API call without tenant context when required
- BFF invents tenant headers not in Core v1

**Evidence**: `CORE_V1_INTEGRATION_LOCK.md` (Core Contract v1 locked)

---

## 9) Acceptance Criteria

This integration plan is ACTIVE and BINDING when:

- [x] All Core endpoints are explicitly listed and locked to Core Contract v1
- [x] Authentication flow uses User-Scoped JWT only
- [x] Tenant context propagation is locked to JWT claim organizationId
- [x] Correlation ID propagation is documented (Suite-only)
- [x] Retry policy, timeouts, and circuit breaker principles are defined
- [x] Template publishing marked DEFERRED (Core v1)
- [x] Service-to-service auth marked NOT AVAILABLE (Core v1)
- [x] Fail-closed enforcement rules are explicit
- [x] Security requirements documented
- [x] Stop rules are explicit and enforceable
- [x] All CONFIRMED claims have evidence links

---

## 10) Signature

**Approved By**: Governance Authority  
**Date**: 2026-02-04  
**Status**: FINAL — CORE V1 ALIGNED
