# Stack Boundaries — Suite / platform-admin

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Module Name    | platform-admin                          |
| Document Title | STACK_BOUNDARIES                        |
| Repo           | Suite (Layer / Product Repo)            |
| Status         | FINAL — CORE V1 ALIGNED                 |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-02-04                              |

---

## 1) Boundary Principles

### 1.1 Separation of Concerns

**SUITE-ONLY**

Each layer in the `platform-admin` module operates within a strictly defined boundary:

- **UI Layer**: Presentation and user interaction only
- **BFF Layer**: Authentication, authorization, orchestration, and Core integration only
- **Data Layer**: Suite-owned data storage only

No layer SHALL perform responsibilities assigned to another layer.

**Evidence**: `ARCHITECTURAL_LAWS.md` LAW-3 (UI Never Talks to Core), LAW-4 (BFF is the Only Integration Boundary)

---

### 1.2 Fail-Closed Enforcement

**SUITE-ONLY**

All boundary violations MUST result in immediate denial of access:

- Missing authentication → deny
- Missing authorization → deny
- Missing organizationId mapping → deny
- Ambiguous tenant context → deny
- Unauthorized data access → deny

No fallback behaviors are permitted. No guessing is permitted.

**Evidence**: `ARCHITECTURAL_LAWS.md` LAW-10 (Fail-Closed By Default)

---

### 1.3 Black-Box Core Isolation

**SUITE-ONLY**

Bassan.os Core is treated as an immutable, external dependency:

- Core internal implementation details are unknown and irrelevant
- Core DB schema is unknown and inaccessible
- Core source code is immutable from Suite perspective
- All Core interaction occurs via documented API contracts only

Any attempt to bypass this isolation is a STOP condition.

**Evidence**: `ARCHITECTURAL_LAWS.md` LAW-2 (Core Black Box)

---

## 2) UI Layer Boundary

### 2.1 Allowed Responsibilities

**SUITE-ONLY**

The UI Layer MUST perform ONLY the following:

- Render internal operator console screens
- Collect user input via forms and controls
- Display data retrieved from BFF
- Authenticate users to Suite (obtain Suite UI token)
- Send requests to Suite BFF with Suite UI token
- Handle BFF responses (success, error, validation failures)
- Display safe error messages to users

---

### 2.2 Forbidden Actions

**SUITE-ONLY**

The UI Layer MUST NOT:

- Call Core APIs directly
- Possess, store, or transmit Core JWTs
- Access Suite DB directly
- Access Core DB directly
- Implement business logic (validation, RBAC, tenant scoping)
- Store sensitive data in browser storage (tokens in localStorage/sessionStorage)
- Forward Suite UI tokens to Core
- Bypass BFF for any operation
- Implement retry logic for Core integration
- Cache Core-owned data without explicit authorization

**Evidence**: `ARCHITECTURAL_LAWS.md` LAW-3 (UI Never Talks to Core), LAW-5 (Token & Identity Separation)

---

### 2.3 Failure Conditions (STOP Rules)

**SUITE-ONLY**

Execution MUST STOP IMMEDIATELY if:

- UI attempts to call Core API directly
- Core JWT found in UI code, browser storage, or network requests
- UI implements business logic (RBAC, tenant scoping, validation)
- UI accesses any database directly
- UI stores authentication tokens in localStorage or sessionStorage without explicit written approval

**Action on STOP**: Halt all work, document violation, escalate to Governance Authority.

---

## 3) BFF Layer Boundary

### 3.1 Authentication Responsibilities

**SUITE-ONLY**

The BFF Layer MUST:

- Validate Suite UI token on every incoming request
- Deny requests with missing, expired, or invalid Suite UI tokens
- Extract authenticated user identity from Suite UI token
- Forward validated Core JWT to Core (as-is, no minting/constructing)

**Evidence**: `ARCHITECTURAL_LAWS.md` LAW-5 (Token & Identity Separation)

---

**NOT AVAILABLE** (Core v1):

Service-to-Service Authentication is NOT supported by Core v1.

**Evidence**: `CORE_V1_INTEGRATION_LOCK.md` Section 5.1

---

The BFF Layer MUST NOT:

- Attempt to obtain or mint Core JWTs (BFF only forwards validated Core JWTs)
- Forward Suite UI tokens to Core
- Expose any upstream tokens to UI in responses, logs, or error messages

---

### 3.2 Authorization (RBAC)

**SUITE-ONLY**

The BFF Layer MUST:

- Enforce role-based access control on all write operations
- Validate user role against required role for each operation
- Deny requests when user role is insufficient
- Log all authorization failures with correlation ID
- Deny access for deactivated users

The BFF Layer MUST NOT:

- Allow operations without RBAC checks
- Default to ALLOW when role is ambiguous or missing
- Bypass RBAC for "internal" or "trusted" requests

---

### 3.3 Core JWT Handling (Server-Only)

**CONFIRMED (Core v1)**

Core uses JWT-based authentication for user-scoped operations.

**Evidence**: `CORE_V1_INTEGRATION_LOCK.md` Section 3.2

---

**SUITE-ONLY** — The BFF Layer MUST:

- Forward validated Core JWT to Core in `Authorization: Bearer <jwt-token>` header
- Propagate tenant context via JWT claim `organizationId` ONLY
- Propagate correlation ID to Core (Suite-only header `X-Correlation-Id`)
- **Fail-Closed on 401**: Core authentication failures MUST result in immediate DENIAL. No refresh.

**Evidence**: `CORE_V1_INTEGRATION_LOCK.md` Section 3.3 (Tenant via JWT claim), Section 5.2 (No token refresh)

---

The BFF Layer MUST NOT:

- Attempt to "refresh" tokens (No refresh endpoint in Core v1)
- Attempt to retry on 401 Unauthorized
- Log any JWT values
- Mint or construct Core JWTs

---

### 3.4 Correlation ID Handling

**SUITE-ONLY**

The BFF Layer MUST:

- Generate a unique correlation ID for every incoming request from UI
- Propagate correlation ID to Core via header `X-Correlation-Id` (Suite-only tracing)
- Include correlation ID in all log entries for that request
- Include correlation ID in all audit log entries
- Return correlation ID to UI in error responses for debugging

**Evidence**: `CORE_V1_INTEGRATION_LOCK.md` Section 6.1 (Correlation ID is Suite-only)

---

The BFF Layer MUST NOT:

- Proceed with operations when correlation ID generation fails
- Omit correlation ID from Core API calls
- Omit correlation ID from audit logs
- Depend on Core echoing the Correlation ID (Core v1 does NOT guarantee echo)

---

### 3.5 Failure Conditions (STOP Rules)

**SUITE-ONLY**

Execution MUST STOP IMMEDIATELY if:

- BFF exposes any JWT to UI
- BFF forwards Suite UI token to Core
- BFF allows operation without authentication
- BFF allows write operation without RBAC check
- BFF proceeds with Core integration when organizationId mapping is missing or ambiguous
- BFF logs JWT values
- BFF includes JWT in error messages
- BFF fails to propagate correlation ID to Core or audit logs
- BFF attempts to mint or construct Core JWTs

**Action on STOP**: Halt all work, document violation, escalate to Governance Authority.

---

## 4) Data Layer Boundary (Suite DB)

### 4.1 Allowed Data Ownership

**SUITE-ONLY**

Suite DB MUST store ONLY the following data:

- Suite organizations (SuiteOrganization table)
- Suite organizationId ↔ Core organizationId mappings (SuiteOrgMapping table)
- Internal operator users (InternalUser table)
- Platform-admin audit logs (PlatformAdminAuditLog table)

All data stored in Suite DB is owned by Suite and is the source of truth for Suite operations.

**Evidence**: `ARCHITECTURAL_LAWS.md` LAW-8 (Module Ownership & Data Ownership)

---

### 4.2 Forbidden Data Storage

**SUITE-ONLY**

Suite DB MUST NOT store:

- Core-owned user credentials
- Core-owned workflow definitions
- Core-owned workflow execution state
- Core-owned audit logs
- Core JWTs
- Any data where Core is the source of truth
- Customer user records (out of scope for platform-admin)
- Any sensitive data from Core without explicit authorization in INTEGRATION_CONTRACT_CORE.md

**Evidence**: `ARCHITECTURAL_LAWS.md` LAW-6 (Database Separation)

---

### 4.3 No Shared Database Rule

**SUITE-ONLY**

Suite DB and Core DB MUST remain strictly separated:

- No shared database instances
- No cross-database foreign keys
- No cross-database queries or joins
- No direct access from Suite to Core DB
- No direct access from Core to Suite DB
- No "reporting access" from Suite to Core DB

All data exchange between Suite and Core MUST occur via Core APIs only.

**Evidence**: `ARCHITECTURAL_LAWS.md` LAW-6 (Database Separation)

---

### 4.4 Failure Conditions (STOP Rules)

**SUITE-ONLY**

Execution MUST STOP IMMEDIATELY if:

- Suite DB stores Core-owned sensitive data without explicit authorization
- Suite code attempts to access Core DB directly
- Suite DB schema includes foreign keys to Core DB
- Suite stores Core JWTs in Suite DB
- Suite stores customer user credentials in Suite DB (out of scope)

**Action on STOP**: Halt all work, document violation, escalate to Governance Authority.

---

## 5) Cross-Layer Boundary Violations

### 5.1 Explicit Examples of Invalid Flows

**SUITE-ONLY**

The following flows are FORBIDDEN and constitute STOP conditions:

**Invalid Flow 1: UI → Core Direct Call**

- UI sends HTTP request directly to Core API
- UI possesses Core JWT
- UI bypasses BFF

**System Response**: STOP. Deny request. Log violation. Escalate.

---

**Invalid Flow 2: Core JWT in UI**

- BFF returns Core JWT to UI in response
- BFF includes Core JWT in error message
- UI stores Core JWT in browser storage

**System Response**: STOP. Deny request. Log violation. Escalate.

---

**Invalid Flow 3: Suite UI Token Forwarded to Core**

- BFF forwards Suite UI token to Core in `Authorization` header
- BFF includes Suite UI token in Core API request

**System Response**: STOP. Deny request. Log violation. Escalate.

---

**Invalid Flow 4: Suite Accesses Core DB Directly**

- BFF connects to Core DB directly
- BFF queries Core DB tables
- BFF writes to Core DB

**System Response**: STOP. Deny request. Log violation. Escalate.

---

**Invalid Flow 5: Missing OrgId Mapping with Fail-Open**

- BFF cannot resolve Suite organizationId → Core organizationId
- BFF proceeds with Core API call anyway (guesses, uses default, or omits tenant context)

**System Response**: STOP. Deny request. Log failure. Return safe error to UI.

---

**Invalid Flow 6: RBAC Bypass**

- BFF allows write operation without validating user role
- BFF defaults to ALLOW when role is missing or ambiguous

**System Response**: STOP. Deny request. Log violation. Escalate.

---

**Invalid Flow 7: Audit Logging Failure Ignored**

- BFF fails to write to PlatformAdminAuditLog
- BFF proceeds with operation anyway

**System Response**: STOP. Rollback operation. Return error to UI.

---

**Invalid Flow 8: Core-Owned Data Stored in Suite DB**

- BFF caches Core workflow execution state in Suite DB
- BFF stores Core user credentials in Suite DB

**System Response**: STOP. Deny storage. Log violation. Escalate.

---

### 5.2 Required System Response (STOP)

**SUITE-ONLY**

When any boundary violation is detected, the system MUST:

1. **Deny the operation immediately** (fail-closed)
2. **Log the violation** with correlation ID, user ID, timestamp, and violation type
3. **Return safe error message** to UI (no internal details, no stack traces)
4. **Escalate to Governance Authority** for review
5. **Do NOT proceed** with any fallback behavior
6. **Do NOT guess** or infer missing context

---

## 6) Acceptance Criteria

This boundary specification is considered ACTIVE and BINDING when ALL of the following are true:

- [x] All layer boundaries are explicitly defined (UI, BFF, Data)
- [x] All allowed responsibilities are listed for each layer
- [x] All forbidden actions are listed for each layer
- [x] All failure conditions (STOP rules) are explicit and enforceable
- [x] Cross-layer boundary violations are documented with examples
- [x] Required system response to violations is defined
- [x] All SUITE-ONLY sections are clearly marked
- [x] All CONFIRMED sections have evidence links
- [x] Service-to-service auth marked NOT AVAILABLE (Core v1)
- [x] Token refresh marked NOT AVAILABLE (Core v1)
- [x] No contradictions exist with EXECUTION_AUTHORITY.md, ARCHITECTURAL_LAWS.md, or CORE_V1_INTEGRATION_LOCK.md

---

## 7) Signature

**Approved By**: Governance Authority  
**Date**: 2026-02-04  
**Status**: FINAL — CORE V1 ALIGNED
