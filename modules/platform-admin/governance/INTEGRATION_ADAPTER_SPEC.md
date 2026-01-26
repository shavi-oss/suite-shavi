# Core Integration Adapter Specification (Gate 2) — platform-admin

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Module Name    | platform-admin                          |
| Document Title | INTEGRATION_ADAPTER_SPEC                |
| Repo           | Suite (Layer / Product Repo)            |
| Status         | FINAL — GATE 2                          |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-01-27                              |

---

## 1. Adapter Purpose

### 1.1 Why the Adapter Exists

The Core Integration Adapter exists to:

- Provide a single, controlled abstraction layer for all BFF → Core communication
- Enforce server-only Core service token handling
- Ensure mandatory correlation ID propagation to Core
- Implement fail-closed timeout and retry policies
- Prevent direct Core API calls from UI or other unauthorized components
- Abstract Core authentication and tenant context propagation

The adapter is the ONLY component in `platform-admin` authorized to call Core APIs.

### 1.2 What It Abstracts (and Does Not)

**The Adapter Abstracts**:

- Core service token acquisition and refresh
- Correlation ID propagation to Core
- Tenant context (coreOrgId) propagation to Core
- Timeout enforcement
- Retry logic for transient failures
- Error sanitization (remove Core internal details before returning to BFF business logic)

**The Adapter Does NOT Abstract**:

- Business logic (validation, RBAC, mapping resolution)
- Suite DB operations
- Audit logging
- UI token validation
- Suite-specific error handling

Business logic remains in BFF service layer. The adapter is purely for Core communication.

---

## 2. Allowed Core Interactions (Abstract)

### 2.1 Enumerate Allowed Interaction Types

The adapter MUST support ONLY the following abstract interaction types:

**Organization Validation**:

- Validate that a Core organizationId exists
- Purpose: Verify Core org before creating Suite → Core mapping

**Template Publishing**:

- Publish a predefined workflow template to Core for a specific organization
- Purpose: Enable internal operators to provision workflow templates for tenants

**MUST NOT support any other interaction types** without explicit authorization via governance change control.

### 2.2 Explicitly Forbidden Interactions

The adapter MUST NOT:

- Access Core DB directly
- Retrieve Core user credentials
- Retrieve Core workflow execution state
- Modify Core workflow definitions
- Retrieve Core audit logs
- Create or delete Core organizations
- Manage Core user accounts
- Retrieve Core billing or subscription data
- Perform any operation not listed in Section 2.1

Any attempt to implement forbidden interactions is a STOP condition.

---

## 3. Authentication Model (Server-Only)

### 3.1 Core Service Credentials Handling

**MUST**:

- Obtain Core service token via Core authentication mechanism (DECISION REQUIRED: exact mechanism, e.g., OAuth2 client credentials, service account login)
- Store Core service credentials (client ID, client secret, or service account key) in server-side environment variable or secret store
- Never expose Core service credentials to UI or client-side code
- Never log Core service credentials
- Authenticate to Core using server-to-server flow only

**MUST NOT**:

- Accept Core service token from UI
- Forward Suite UI token to Core
- Store Core service credentials in Suite DB
- Include Core service credentials in error messages

### 3.2 Token Storage Constraints

**MUST**:

- Store Core service token in server-side memory or secure cache
- Protect Core service token with server-side access controls
- Invalidate cached Core service token on expiry or refresh

**MUST NOT**:

- Store Core service token in Suite DB
- Store Core service token in UI-accessible storage
- Transmit Core service token to UI
- Log Core service token value

### 3.3 Token Refresh Constraints

**Core Service Token TTL**: Determined by Core (BFF accepts Core-issued TTL)

**Token Refresh Trigger**: BFF detects Core service token expiry via 401 response from Core

**Token Refresh Frequency**: On-demand (refresh when Core returns 401)

**MUST**:

- Refresh Core service token when expired (detect 401 from Core)
- Retry failed request ONCE after token refresh
- Log token refresh events for audit purposes

**MUST NOT**:

- Retry token refresh indefinitely
- Proceed with Core API call if token refresh fails
- Cache expired Core service token

---

## 4. Timeout Policy (DECISION REQUIRED)

### 4.1 Read vs Write Timeouts (Placeholders)

**Read Operation Timeout**: 8 seconds

- Applies to: Core organizationId validation

**Write Operation Timeout**: 20 seconds

- Applies to: Core template publishing

**MUST**:

- Enforce timeout on all Core API calls
- Distinguish between read and write operation timeouts
- Log timeout events with correlation ID

**MUST NOT**:

- Allow Core API calls to hang indefinitely
- Retry on timeout without idempotency safeguards

### 4.2 Behavior on Timeout (Fail-Closed)

**MUST**:

- Abort Core API call when timeout is reached
- Log timeout failure with correlation ID, operation type, and timeout threshold
- Return safe error to BFF business logic (no Core internal details)
- Audit log the failure

**MUST NOT**:

- Retry timed-out operation automatically without idempotency key
- Proceed with operation as if Core call succeeded
- Return Core internal error details to UI

---

## 5. Retry & Idempotency (DECISION REQUIRED)

### 5.1 Retry Taxonomy (What Can Be Retried vs Must Not)

**MAY Retry (Transient Failures)**:

- Core API returns 5xx (server error)
- Network timeout (connection timeout, not request timeout)
- Network unreachable

**MUST NOT Retry**:

- Core API returns 4xx (client error: 400, 401, 403, 404)
- Core API returns 401 (authentication failure) — MUST refresh token and retry ONCE
- Core API returns 403 (authorization failure)
- Request timeout (operation-level timeout)
- Non-idempotent operations without idempotency key

**Max Retry Count**: 2 retries

- Retry ONLY on network errors or Core 5xx responses
- NO retry on any 4xx responses
- NO retry on write operation timeouts

**Backoff Strategy**: Exponential backoff (1s, 2s)

**MUST**:

- Limit retry count to prevent infinite loops
- Use exponential backoff to avoid overwhelming Core
- Log each retry attempt with correlation ID

**MUST NOT**:

- Retry indefinitely
- Retry client errors (4xx)
- Retry without backoff

### 5.2 Idempotency Key Requirements (Publish)

**Core Idempotency Support**: REQUIRED for template publishing

- Idempotency key header: `Idempotency-Key`
- Key scope: `suiteOrgId + templateId + templateVersion`
- If Core lacks idempotency support: Single-attempt fail-closed (no retry)

**MUST** (if Core supports idempotency):

- Generate unique idempotency key for each publish operation
- Include idempotency key in Core API request
- Retry publish operation with same idempotency key on transient failure

**MUST NOT**:

- Retry publish operation without idempotency key
- Reuse idempotency keys across different operations

**If Core does NOT support idempotency**:

- Publish operation MUST NOT be retried on failure
- Log failure and return error to UI

### 5.3 Duplicate Detection Expectations

**Core Duplicate Detection**: Core returns 409 Conflict for duplicate template publish

- Duplicate detection based on idempotency key
- 409 responses are NOT retried

**MUST**:

- Handle Core duplicate detection responses gracefully
- Log duplicate detection events
- Return safe error to UI

**MUST NOT**:

- Retry on duplicate detection response
- Treat duplicate detection as transient failure

---

## 6. Correlation & Traceability

### 6.1 Correlation ID Generation Source (BFF)

**MUST**:

- Generate correlation ID at BFF entry point (first request handler)
- Use UUID v4 or equivalent globally unique identifier
- Propagate correlation ID to adapter for all Core API calls

**MUST NOT**:

- Generate correlation ID in adapter (adapter receives correlation ID from BFF)
- Proceed with Core API call if correlation ID is missing
- Reuse correlation IDs across multiple requests

### 6.2 Propagation Requirements to Core

**Correlation ID Header Name**: `X-Correlation-Id`

- Generated at BFF entry point
- Propagated to Core in all API requests

**MUST**:

- Include correlation ID in all Core API requests
- Use header specified by Core (DECISION REQUIRED)
- Propagate correlation ID received from BFF without modification

**MUST NOT**:

- Omit correlation ID from Core API requests
- Modify or regenerate correlation ID in adapter

### 6.3 Logging Requirements

**MUST Log**:

- Correlation ID for every Core API call
- Core API operation type (validate org, publish template)
- Tenant context (coreOrgId)
- Request timestamp
- Response status code
- Response duration
- Retry attempts (if any)
- Timeout events
- Failure events

**MUST NOT Log**:

- Core service token
- Core service credentials
- Sensitive request/response payloads (unless explicitly safe and approved)
- Core internal error details (sanitize before logging)

---

## 7. Forbidden Integration Patterns

### 7.1 Explicit List

The following integration patterns are FORBIDDEN and constitute STOP conditions:

**Token Leak**:

- Core service token exposed to UI
- Core service token included in error messages
- Core service token logged

**UI → Core Direct Call**:

- UI calls Core API directly
- UI possesses Core service token
- UI bypasses BFF and adapter

**Database Access**:

- Adapter accesses Core DB directly
- Adapter queries Core DB tables
- Adapter writes to Core DB

**Shared Tokens**:

- Suite UI token forwarded to Core
- Core service token shared with UI

**Unauthorized Operations**:

- Adapter calls Core endpoints not listed in Section 2.1
- Adapter implements operations forbidden in Section 2.2

**Fail-Open Behavior**:

- Adapter proceeds with operation when Core API call fails
- Adapter guesses or infers missing Core response
- Adapter defaults to success when Core is unavailable

**Missing Correlation ID**:

- Adapter calls Core without correlation ID
- Adapter omits correlation ID from logs

**Retry Violations**:

- Adapter retries non-idempotent operations without idempotency key
- Adapter retries client errors (4xx)
- Adapter retries indefinitely

### 7.2 Required STOP Response

When any forbidden integration pattern is detected, the system MUST:

1. **Deny the operation immediately** (fail-closed)
2. **Log the violation** with correlation ID, operation type, and violation details
3. **Return safe error message** to BFF business logic (no Core internal details)
4. **Escalate to Governance Authority** for review
5. **Do NOT proceed** with any fallback behavior
6. **Do NOT expose Core internal details** to UI

---

## 8) Acceptance Criteria

This integration adapter specification is considered ACTIVE and BINDING when ALL of the following are true:

- [ ] Adapter purpose is clearly defined
- [ ] Allowed Core interactions are enumerated (abstract, no endpoints)
- [ ] Forbidden interactions are explicitly listed
- [ ] Authentication model is defined (server-only, token storage, token refresh)
- [ ] Timeout policy placeholders are documented (DECISION REQUIRED items identified)
- [ ] Retry and idempotency rules are defined (DECISION REQUIRED items identified)
- [ ] Correlation ID propagation requirements are explicit
- [ ] Logging requirements are defined
- [ ] Forbidden integration patterns are explicitly listed
- [ ] Required STOP response is defined
- [ ] No contradictions exist with EXECUTION_AUTHORITY.md, ARCHITECTURAL_LAWS.md, SECURITY_BASELINE.md, INTEGRATION_CONTRACT_CORE.md, or STACK_BOUNDARIES.md
- [ ] Governance Authority has reviewed and approved this document

---

## 9) Change Control

### 9.1 Required Approvals

Changes to this integration adapter specification require:

- Written justification explaining why change is needed
- Explicit approval from Governance Authority
- Version increment and git tag
- Update to INTEGRATION_CONTRACT_CORE.md (if applicable)

### 9.2 Forbidden Changes

The following changes are FORBIDDEN without escalation:

- Adding Core interactions not authorized in Section 2.1
- Allowing UI → Core direct calls
- Allowing Core token exposure to UI
- Allowing Core DB access
- Weakening fail-closed rules
- Removing timeout enforcement
- Allowing retry of non-idempotent operations without idempotency key

---

## 10) Signature

**Prepared By**: Principal Software Architect & Governance Authority  
**Date**: 2026-01-27  
**Status**: FINAL — GATE 2
