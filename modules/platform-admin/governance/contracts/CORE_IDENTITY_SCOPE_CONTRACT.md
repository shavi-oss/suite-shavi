# Core Identity Scope Contract — platform-admin

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Module Name    | platform-admin                          |
| Document Title | CORE_IDENTITY_SCOPE_CONTRACT            |
| Repo           | Suite (Layer / Product Repo)            |
| Status         | ACTIVE — IDENTITY CONTRACT              |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-01-30                              |

---

## 1) Purpose

This document defines the identity and scope contract for Suite `platform-admin` module interactions with Bassan.os Core. It establishes:

- OrganizationId mapping model (Suite ↔ Core)
- Fail-closed ambiguity rules
- Tenant context propagation mechanism
- Correlation ID rules (UI → BFF → Core)
- Token model separation (UI token vs Core service token)
- Logging boundaries (no secrets)

---

## 2) OrganizationId Mapping Model

### 2.1 Mapping Structure

**Suite → Core Mapping**:

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

### 2.2 Mapping Creation Rules

**MUST**:

- Validate `coreOrgId` exists in Core BEFORE creating mapping (via `ValidateCoreOrganization` command)
- Ensure `suiteOrgId` is unique (one Suite org maps to one Core org)
- Ensure `coreOrgId` is unique (one Core org maps to one Suite org)
- Write audit log entry on mapping creation

**MUST NOT**:

- Create mapping without validating Core org existence
- Allow multiple Suite orgs to map to same Core org (unless explicitly authorized)
- Allow same Suite org to map to multiple Core orgs

---

### 2.3 Fail-Closed Ambiguity Rules

**Scenario 1: Missing Mapping**

**Condition**: Suite org has no `coreOrgId` mapping

**Action**:

- **DENY** the request
- Return safe error: `"Organization mapping not found. Please link this organization to Core first."`
- Log failure with correlation ID
- **MUST NOT** guess, infer, or create mapping automatically

---

**Scenario 2: Ambiguous Mapping**

**Condition**: Multiple Suite orgs map to same `coreOrgId` (should not happen, but fail-closed)

**Action**:

- **DENY** the request
- Return safe error: `"Organization mapping is ambiguous. Please contact support."`
- Log failure with correlation ID
- **MUST NOT** proceed with any operation

---

**Scenario 3: Stale Mapping**

**Condition**: `coreOrgId` exists in mapping but no longer exists in Core (org deleted in Core)

**Action**:

- **DENY** the request (Core API will return 404)
- Return safe error: `"Core organization not found. Please verify mapping."`
- Log failure with correlation ID
- **MUST NOT** proceed with operation

---

## 3) Tenant Context Propagation Mechanism

### 3.1 Propagation Flow

**UI → BFF**:

- UI sends `suiteOrgId` in request (e.g., in JWT claim, header, or request body)
- BFF validates UI token and extracts `suiteOrgId`

**BFF → Core**:

- BFF resolves `suiteOrgId` → `coreOrgId` via mapping table
- BFF includes `coreOrgId` in Core API request

**Mechanism** (TBD):

- **Option 1**: `X-Organization-Id: <coreOrgId>` header
- **Option 2**: JWT claim in Core service token (if Core supports org-scoped tokens)
- **Option 3**: Query parameter `?organizationId=<coreOrgId>`

**TODO (BLOCKED)**:

- [ ] Confirm tenant context propagation mechanism with Core team
- [ ] Define exact header name, JWT claim, or query parameter

---

### 3.2 Fail-Closed Enforcement

**MUST**:

- Fail-closed if `suiteOrgId` → `coreOrgId` mapping is missing
- Fail-closed if `coreOrgId` is ambiguous
- Include `coreOrgId` in EVERY org-scoped Core API call

**MUST NOT**:

- Proceed without tenant context when required
- Use default or fallback `coreOrgId`
- Guess tenant context from other sources

---

## 4) Correlation ID Rules (End-to-End)

### 4.1 Correlation ID Generation

**UI → BFF**:

- BFF generates UUID v4 correlation ID for every request
- If UI provides correlation ID (e.g., `X-Correlation-Id` header), BFF accepts it
- BFF validates correlation ID format (UUID v4)

**BFF → Core**:

- BFF includes correlation ID in `X-Correlation-Id` header for ALL Core API calls
- BFF logs correlation ID in ALL log entries for that request

**Core → BFF**:

- Core SHOULD include correlation ID in response headers (if supported)
- Core SHOULD log correlation ID for debugging (if supported)

**TODO (BLOCKED)**:

- [ ] Confirm Core's support for `X-Correlation-Id` header
- [ ] Confirm whether Core includes correlation ID in responses

---

### 4.2 Correlation ID Propagation Rules

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

## 5) Token Model Separation

### 5.1 Suite UI Token

**Purpose**: Authenticate UI users to Suite BFF

**Issuer**: Suite Authentication Service (TBD)

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

---

### 5.2 Core Service Token

**Purpose**: Authenticate Suite BFF to Core APIs (server-to-server)

**Issuer**: Core Authentication Service

**Scope**: Core APIs only

**Storage**: Suite BFF server-side ONLY (environment variable, secret store, in-memory cache)

**Claims** (TBD):

- Service account ID (TBD)
- Expiry timestamp (TBD)
- Possibly org-scope (TBD)

**MUST**:

- Obtain token via Core authentication endpoint (TBD)
- Store token server-side only
- Include token in `Authorization: Bearer <token>` header for ALL Core API calls
- Rotate token according to Core's policy (TBD)
- Monitor token expiry and refresh proactively

**MUST NOT**:

- Expose token to UI or client-side code
- Log token value
- Include token in error messages
- Store token in Suite DB
- Forward UI token to Core

**TODO (BLOCKED)**:

- [ ] Define Core authentication endpoint and flow
- [ ] Confirm Core service token TTL and rotation frequency
- [ ] Confirm Core service token claims and scope

---

### 5.3 Token Separation Enforcement

**MUST**:

- Maintain strict separation between UI token and Core service token
- Use UI token ONLY for Suite BFF authentication
- Use Core service token ONLY for Core API authentication

**MUST NOT**:

- Mix or conflate UI token and Core service token
- Forward UI token to Core
- Expose Core service token to UI

---

## 6) Logging Boundaries (No Secrets)

### 6.1 What MUST Be Logged

**BFF Side**:

- Correlation ID (every log entry)
- Tenant context (`suiteOrgId`, `coreOrgId` when applicable)
- Core API call (endpoint, method, status code, duration)
- Errors and retries
- Token refresh events (WITHOUT token value)
- Mapping resolution (success/failure)

---

### 6.2 What MUST NOT Be Logged

**Secrets**:

- Core service token (value)
- UI token (value)
- API keys, passwords, credentials

**Sensitive Data**:

- PII (unless explicitly safe and approved)
- Confidential business data
- Core internal error details (sanitize before logging)

---

### 6.3 Log Sanitization Rules

**MUST**:

- Sanitize logs to exclude tokens, passwords, API keys
- Sanitize Core error messages before logging (remove internal details)
- Use correlation IDs for debugging instead of logging sensitive context

**MUST NOT**:

- Log raw request/response payloads without sanitization
- Log Core service token or UI token values
- Log PII or confidential data

---

## 7) TODO List

**BLOCKED** (requires Core team input):

- [ ] Confirm tenant context propagation mechanism (header, JWT claim, query param)
- [ ] Confirm correlation ID support in Core
- [ ] Define Core authentication endpoint and flow for service token
- [ ] Confirm Core service token TTL and rotation frequency
- [ ] Confirm Core service token claims and scope
- [ ] Define Suite UI token issuer and claims (if separate auth service)

**Action**: Do NOT implement identity/scope logic until contracts are defined. Proceed with interface-level contracts only.

---

## 8) Stop Rules

Execution MUST STOP IMMEDIATELY if:

- BFF forwards UI token to Core
- BFF exposes Core service token to UI
- BFF logs Core service token value
- BFF proceeds without tenant context when required
- BFF proceeds with ambiguous org mapping
- BFF omits correlation ID from Core API calls

**Action on STOP**: Halt all work, document violation, escalate to Governance Authority.

---

## 9) Acceptance Criteria

This identity scope contract is ACTIVE and BINDING when:

- [x] OrganizationId mapping model is explicit with fail-closed rules
- [x] Tenant context propagation mechanism is defined (or marked TODO)
- [x] Correlation ID rules are explicit (generation, propagation, logging)
- [x] Token model separation is explicit (UI token vs Core service token)
- [x] Logging boundaries are explicit (what to log, what NOT to log)
- [x] TODO list documents unknown mechanisms
- [ ] Core team has confirmed propagation mechanisms and token flows (BLOCKED)

---

## 10) Signature

**Approved By**: Governance Authority  
**Date**: 2026-01-30  
**Status**: ACTIVE — IDENTITY CONTRACT
