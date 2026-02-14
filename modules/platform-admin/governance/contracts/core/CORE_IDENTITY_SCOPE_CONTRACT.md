# Core Identity Scope Contract — platform-admin

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Module Name    | platform-admin                          |
| Document Title | CORE_IDENTITY_SCOPE_CONTRACT            |
| Repo           | Suite (Layer / Product Repo)            |
| Status         | FINAL — IDENTITY CONTRACT               |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-02-04                              |

---

## 1) Purpose

This document defines the identity and scope contract for Suite `platform-admin` module interactions with Bassan.os Core. It establishes:

- JWT authentication mechanism (Core-issued, Suite validates)
- Tenant context propagation (organizationId via JWT claim)
- OrganizationId mapping model (Suite ↔ Core)
- Fail-closed ambiguity rules
- Correlation ID rules (Suite-only feature)
- Token model separation (UI token vs Core JWT)
- Logging boundaries (no secrets)

---

## 2) JWT Authentication (Core-Issued)

### 2.1 Authentication Mechanism

**CONFIRMED (Core v1)**

Core uses JWT-based authentication with Bearer tokens.

**Token Type**: Bearer token  
**Header**: `Authorization: Bearer <jwt-token>`

**Evidence**: `CORE_V1_INTEGRATION_LOCK.md` Section 3.2

---

### 2.2 JWT Claims

**CONFIRMED (Core v1)**

Core JWT payload contains the following claims:

| Claim            | Type   | Purpose                |
| ---------------- | ------ | ---------------------- |
| `sub`            | string | User ID                |
| `email`          | string | User email             |
| `organizationId` | string | Tenant/Organization ID |

**Evidence**: `CORE_CONTRACT_V1_EXTRACT.md` Section D.1 (jwt.strategy.ts:L29-L33)

---

### 2.3 req.user Fields

**CONFIRMED (Core v1)**

Core JwtStrategy populates `req.user` with:

```typescript
{
  id: payload.sub,           // User ID
  email: payload.email,      // User email
  organizationId: payload.organizationId  // Tenant ID
}
```

**Evidence**: `CORE_CONTRACT_V1_EXTRACT.md` Section D.1 (jwt.strategy.ts:L45-L49)

---

### 2.4 Guards

**CONFIRMED (Core v1)**

Core applies the following guards to protected endpoints:

- `JwtAuthGuard` — JWT validation (Passport)
- `TenantGuard` — CLS context + request sanitization

**Evidence**: `CORE_V1_INTEGRATION_LOCK.md` Section 3.2

---

## 3) Tenant Context Propagation

### 3.1 Tenant Context Mechanism

**CONFIRMED (Core v1)**

Core extracts tenant context from JWT claim `organizationId` (NOT from headers or query params).

**Propagation Flow**:

1. Client → Core: JWT claim in `Authorization` header
2. Core extracts `organizationId` from JWT payload via JwtStrategy
3. Core sets CLS context: `orgId`, `userId`

**Evidence**: `CORE_V1_INTEGRATION_LOCK.md` Section 3.3

---

### 3.2 CLS Keys

**CONFIRMED (Core v1)**

Core TenantGuard sets the following CLS keys:

| CLS Key  | Source                               | Type   |
| -------- | ------------------------------------ | ------ |
| `orgId`  | `req.user.organizationId` (from JWT) | string |
| `userId` | `req.user.id` (from JWT sub)         | string |

**Evidence**: `CORE_CONTRACT_V1_EXTRACT.md` Section D.2 (tenant.guard.ts:L56-L57)

---

### 3.3 NOT USED (Core v1)

**NOT AVAILABLE**

The following mechanisms are NOT used by Core v1 for tenant context:

- ❌ `X-Organization-Id` header
- ❌ `X-Tenant-Id` header
- ❌ Query parameter `?organizationId=`

**Evidence**: `CORE_V1_INTEGRATION_LOCK.md` Section 3.3

---

### 3.4 Request Sanitization

**CONFIRMED (Core v1)**

Core TenantGuard actively **removes** manual tenant injection attempts from:

- Query parameters: `organizationId`, `orgId`, `tenantId`
- Request body: `organizationId`, `orgId`, `tenantId`
- URL params: `organizationId`

**Security Behavior**: Blocks manual tenant injection, logs warnings.

**Evidence**: `CORE_CONTRACT_V1_EXTRACT.md` Section D.2 (tenant.guard.ts:L72-L124)

---

## 4) Suite → Core OrganizationId Mapping

### 4.1 Mapping Model

**SUITE-ONLY**

Suite maintains a mapping between Suite organizationId and Core organizationId.

**Mapping Structure**:

```typescript
{
  suiteOrgId: string (UUID, primary key)
  coreOrgId: string (UUID, external reference, unique)
  createdAt: timestamp
  updatedAt: timestamp
  createdBy: string (internal user ID)
}
```

**Storage**: Suite DB only (Core does NOT store this mapping)

**Source of Truth**: Suite (for mapping); Core (for org existence)

---

### 4.2 Mapping Creation Rules

**SUITE-ONLY**

**MUST**:

- Validate `coreOrgId` exists in Core BEFORE creating mapping (via `GET /api/v1/organizations/:id`)
- Ensure `suiteOrgId` is unique (one Suite org maps to one Core org)
- Ensure `coreOrgId` is unique (one Core org maps to one Suite org)
- Write audit log entry on mapping creation

**MUST NOT**:

- Create mapping without validating Core org existence
- Allow multiple Suite orgs to map to same Core org (unless explicitly authorized)
- Allow same Suite org to map to multiple Core orgs

---

### 4.3 Fail-Closed Ambiguity Rules

**SUITE-ONLY**

#### Scenario 1: Missing Mapping

**Condition**: Suite org has no `coreOrgId` mapping

**Action**:

- **DENY** the request
- Return safe error: `"Organization mapping not found. Please link this organization to Core first."`
- Log failure with correlation ID
- **MUST NOT** guess, infer, or create mapping automatically

---

#### Scenario 2: Ambiguous Mapping

**Condition**: Multiple Suite orgs map to same `coreOrgId` (should not happen, but fail-closed)

**Action**:

- **DENY** the request
- Return safe error: `"Organization mapping is ambiguous. Please contact support."`
- Log failure with correlation ID
- **MUST NOT** proceed with any operation

---

#### Scenario 3: Stale Mapping

**Condition**: `coreOrgId` exists in mapping but no longer exists in Core (org deleted in Core)

**Action**:

- **DENY** the request (Core API will return 404)
- Return safe error: `"Core organization not found. Please verify mapping."`
- Log failure with correlation ID
- **MUST NOT** proceed with operation

---

## 5) Suite BFF → Core Tenant Propagation

### 5.1 Propagation Flow

**SUITE-ONLY**

**UI → BFF**:

- UI sends `suiteOrgId` in request (e.g., in JWT claim, header, or request body)
- BFF validates UI token and extracts `suiteOrgId`

**BFF → Core**:

- BFF resolves `suiteOrgId` → `coreOrgId` via mapping table
- BFF validates that the user-scoped Core JWT (already issued by Core) contains the correct `organizationId` claim matching `coreOrgId`
- BFF forwards the validated Core JWT as-is in `Authorization: Bearer <core-jwt>` header

> [!IMPORTANT]
> BFF does NOT mint, construct, or modify Core JWTs. BFF only validates and forwards Core-issued JWTs.

---

### 5.2 Fail-Closed Enforcement

**SUITE-ONLY**

**MUST**:

- Fail-closed if `suiteOrgId` → `coreOrgId` mapping is missing
- Fail-closed if `coreOrgId` is ambiguous
- Include `coreOrgId` in Core JWT for EVERY org-scoped Core API call

**MUST NOT**:

- Proceed without tenant context when required
- Use default or fallback `coreOrgId`
- Guess tenant context from other sources

---

## 6) Correlation ID (Suite-Only Feature)

### 6.1 Core v1 Reality

**NOT AVAILABLE**

Core v1 does NOT have correlation ID middleware or interceptor.

**Evidence**: `CORE_V1_INTEGRATION_LOCK.md` Section 5.3

---

### 6.2 Suite Correlation ID Generation

**SUITE-ONLY**

Suite BFF generates and propagates correlation IDs for tracing.

**UI → BFF**:

- BFF generates UUID v4 correlation ID for every request
- If UI provides correlation ID (e.g., `X-Correlation-Id` header), BFF accepts it
- BFF validates correlation ID format (UUID v4)

**BFF → Core**:

- BFF includes correlation ID in `X-Correlation-Id` header for ALL Core API calls
- BFF logs correlation ID in ALL log entries for that request

**Core Echo**: NOT GUARANTEED (Core v1 has no correlation middleware)

**Purpose**: Suite-side request tracing and debugging only

**Evidence**: `CORE_V1_INTEGRATION_LOCK.md` Section 6.1

---

### 6.3 Correlation ID Propagation Rules

**SUITE-ONLY**

**MUST**:

- Generate correlation ID if not provided by UI
- Propagate same correlation ID to ALL Core API calls in transaction
- Include correlation ID in ALL log entries (BFF side)
- Include correlation ID in ALL error responses to UI

**MUST NOT**:

- Change correlation ID mid-request
- Omit correlation ID from Core API calls
- Omit correlation ID from log entries

---

## 7) Token Model Separation

### 7.1 Suite UI Token

**SUITE-ONLY**

**Purpose**: Authenticate UI users to Suite BFF

**Issuer**: Suite Authentication Service (to be defined)

**Scope**: Suite BFF only (NEVER forwarded to Core)

**Storage**: UI (browser/mobile, short-lived session)

**Claims** (minimal):

- `userId` (Suite internal user ID)
- `suiteOrgId` (Suite organization ID)
- `role` (internal role: platform_admin, developer_ops, support, viewer)
- `exp` (expiry timestamp)

**MUST NOT**:

- Forward UI token to Core
- Use UI token to authenticate to Core
- Store UI token server-side beyond session duration

**Evidence**: `ARCHITECTURAL_LAWS.md` LAW-5 (Token & Identity Separation)

---

### 7.2 Core JWT (User-Scoped)

**CONFIRMED (Core v1)**

Core uses JWT-based authentication for user-scoped operations.

**Issuer**: Core Authentication Service

**Scope**: Core API only

**Claims**: `sub`, `email`, `organizationId`

**Evidence**: `CORE_V1_INTEGRATION_LOCK.md` Section 3.2

---

### 7.3 Service-to-Service Authentication

**NOT AVAILABLE**

Core v1 does NOT support service-to-service authentication.

**Not Found in Core v1**:

- ❌ Service token contract
- ❌ OAuth2 client credentials flow
- ❌ Service account endpoints

**Evidence**: `CORE_V1_INTEGRATION_LOCK.md` Section 5.1

**Status**: DEFERRED until Core v2

---

### 7.4 Token Separation Enforcement

**SUITE-ONLY**

**MUST**:

- Maintain strict separation between UI token and Core JWT
- Use UI token ONLY for Suite BFF authentication
- Use Core JWT ONLY for Core API authentication

**MUST NOT**:

- Mix or conflate UI token and Core JWT
- Forward UI token to Core
- Expose Core JWT to UI

**Evidence**: `ARCHITECTURAL_LAWS.md` LAW-5 (Token & Identity Separation)

---

## 8) Logging Boundaries (No Secrets)

### 8.1 What MUST Be Logged

**SUITE-ONLY**

**BFF Side**:

- Correlation ID (every log entry)
- Tenant context (`suiteOrgId`, `coreOrgId` when applicable)
- Core API call (endpoint, method, status code, duration)
- Errors and retries
- Mapping resolution (success/failure)

---

### 8.2 What MUST NOT Be Logged

**SUITE-ONLY**

**Secrets**:

- Core JWT (value)
- UI token (value)
- API keys, passwords, credentials

**Sensitive Data**:

- PII (unless explicitly safe and approved)
- Confidential business data
- Core internal error details (sanitize before logging)

---

### 8.3 Log Sanitization Rules

**SUITE-ONLY**

**MUST**:

- Sanitize logs to exclude tokens, passwords, API keys
- Sanitize Core error messages before logging (remove internal details)
- Use correlation IDs for debugging instead of logging sensitive context

**MUST NOT**:

- Log raw request/response payloads without sanitization
- Log Core JWT or UI token values
- Log PII or confidential data

---

## 9) Stop Rules

**SUITE-ONLY**

Execution MUST STOP IMMEDIATELY if:

- BFF forwards UI token to Core
- BFF exposes Core JWT to UI
- BFF logs Core JWT value
- BFF proceeds without tenant context when required
- BFF proceeds with ambiguous org mapping
- BFF omits correlation ID from Core API calls

**Action on STOP**: Halt all work, document violation, escalate to Governance Authority.

---

## 10) Acceptance Criteria

This identity scope contract is ACTIVE and BINDING when:

- [x] JWT authentication mechanism is documented (CONFIRMED from Core v1)
- [x] Tenant context propagation is documented (CONFIRMED from Core v1)
- [x] OrganizationId mapping model is explicit with fail-closed rules (SUITE-ONLY)
- [x] Correlation ID rules are explicit (SUITE-ONLY, Core echo NOT guaranteed)
- [x] Token model separation is explicit (UI token vs Core JWT)
- [x] Service-to-service auth is marked NOT AVAILABLE (Core v1)
- [x] Logging boundaries are explicit (what to log, what NOT to log)
- [x] All CONFIRMED claims have evidence links
- [x] All NOT AVAILABLE items are documented

---

## 11) Signature

**Approved By**: Governance Authority  
**Date**: 2026-02-04  
**Status**: FINAL — IDENTITY CONTRACT
