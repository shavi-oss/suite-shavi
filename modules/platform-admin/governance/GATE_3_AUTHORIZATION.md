# Gate 3 Authorization — platform-admin

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Module Name    | platform-admin                          |
| Document Title | GATE_3_AUTHORIZATION                    |
| Repo           | Suite (Layer / Product Repo)            |
| Status         | DRAFT — GATE 3 AUTH                     |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-01-27                              |

---

## 1. Authorization Scope

### 1.1 Exactly What is Authorized to Implement in Gate 3

Gate 3 authorizes implementation of the following capabilities ONLY:

**Organization Management Capabilities**:

- Organization creation (write to Suite DB)
- Organization retrieval (read from Suite DB)
- Organization suspension/unsuspension (update Suite DB)

**OrgId Mapping Capabilities**:

- Mapping creation (write to Suite DB, validate via Core)
- Mapping retrieval (read from Suite DB)
- Mapping resolution (fail-closed lookup for Core integration)

**Internal User Management Capabilities**:

- Internal user creation (write to Suite DB)
- Internal user retrieval (read from Suite DB)
- Internal user deactivation (update Suite DB)

**Template Publishing Capabilities**:

- Template publish command (BFF → Core integration with idempotency)
- Template list query (read from Suite codebase)

**Audit Logging Capabilities**:

- Audit log write (mandatory for all write operations)
- Audit log query (read from Suite DB with RBAC)

**Supporting Infrastructure**:

- Core integration adapter (server-only, token handling, correlation propagation)
- RBAC enforcement (role-based authorization checks)
- Fail-closed validation (mapping resolution, authentication, authorization)
- Correlation ID generation and propagation

### 1.2 Explicitly: What Remains Forbidden

The following remain FORBIDDEN in Gate 3 and all future gates unless explicitly authorized via governance change control:

**Forbidden Capabilities**:

- Workflow builder or visual editor
- Custom template creation or modification
- Customer user management
- Customer-facing authentication or authorization
- Billing, subscriptions, or payment processing
- Real-time dashboards or analytics
- CRM or Omnichannel features
- MFA for internal users (deferred to v2)
- External identity provider integration (deferred to v2)
- Audit log export (deferred to v2)

**Forbidden Architectural Patterns**:

- UI → Core direct calls
- Core token exposure to UI
- Shared databases between Suite and Core
- Core DB access from Suite
- Suite DB access from Core
- Shared authentication tokens between UI and Core
- BFF bypass for any operation

**Forbidden Scope Expansions**:

- Any capability not listed in Section 1.1
- Any table not listed in MODULE_SCOPE_LOCK.md
- Any UI screen not listed in MODULE_SCOPE_LOCK.md
- Any Core interaction not listed in INTEGRATION_ADAPTER_SPEC.md

---

## 2. Allowed Files & Paths

### 2.1 Define the Allowed Folders/Paths for Implementation Changes

Implementation changes are ONLY allowed within the following paths:

**Module Root**:

- `modules/platform-admin/`

**Allowed Subdirectories**:

- `modules/platform-admin/src/` — Implementation code
- `modules/platform-admin/tests/` — Test code
- `modules/platform-admin/governance/` — Governance documents (read-only in Gate 3, no modifications)

**Allowed File Types**:

- TypeScript source files (`.ts`)
- TypeScript test files (`.spec.ts`, `.test.ts`)
- JSON configuration files (`.json`) — module-specific only
- Markdown documentation (`.md`) — non-governance only

### 2.2 Define Explicitly Forbidden Areas

The following areas are FORBIDDEN for any changes:

**Core Repository**:

- Any path in Bassan.os Core repository

**Suite Shared Infrastructure**:

- `src/shared/` (if exists)
- `src/common/` (if exists)
- Root-level configuration files (unless module-specific)

**Other Modules**:

- Any path under `modules/` except `modules/platform-admin/`

**Governance Documents**:

- All files in `modules/platform-admin/governance/` are read-only in Gate 3
- No modifications to governance documents without explicit authorization

**Database**:

- No direct database migration files (schema changes must be specified, not implemented in Gate 3)
- No Core DB access code

---

## 3. Allowed Technical Changes

### 3.1 What Types of Changes Are Allowed

The following technical changes are authorized:

**Domain Services**:

- Organization management service
- OrgId mapping service
- Internal user management service
- Template publishing service

**Repositories**:

- Organization repository (Suite DB access)
- OrgId mapping repository (Suite DB access)
- Internal user repository (Suite DB access)
- Audit log repository (Suite DB access, append-only)

**Adapters**:

- Core integration adapter (server-only, token handling, correlation propagation)

**RBAC & Validation**:

- RBAC enforcement logic (role-based authorization)
- Fail-closed validation logic (mapping resolution, input validation)

**Audit & Correlation**:

- Audit logging service (mandatory write, fail-closed)
- Correlation ID generation and propagation

**Tests**:

- Unit tests for all services, repositories, adapters
- Integration tests for fail-closed scenarios
- Security tests for token separation, RBAC, mapping enforcement

### 3.2 What Types Are Forbidden

The following technical changes are FORBIDDEN:

**Core Modifications**:

- Any changes to Bassan.os Core codebase
- Any changes to Core DB schema
- Any changes to Core API contracts

**Shared Infrastructure**:

- Changes to Suite shared libraries (unless explicitly authorized)
- Changes to Suite authentication service (unless explicitly authorized)
- Changes to Suite database connection pool (unless explicitly authorized)

**UI Implementation**:

- UI code is out of scope for Gate 3 (deferred to later gate)

**Database Migrations**:

- Actual migration scripts are out of scope for Gate 3 (schema specification only)

**Deployment Configuration**:

- Deployment scripts, CI/CD pipelines, infrastructure-as-code (out of scope for Gate 3)

---

## 4. Required Invariants (MUST HOLD)

The following invariants MUST hold at all times during Gate 3 implementation:

### 4.1 Fail-Closed Rules

**MUST**:

- Deny access when Suite UI token is missing, expired, or invalid
- Deny access when user role is insufficient for requested operation
- Deny access when Suite organizationId has no corresponding Core organizationId
- Deny access when mapping is ambiguous
- Deny access when Core API call fails (timeout, 5xx, 401, 403)
- Deny access when audit log write fails

**MUST NOT**:

- Proceed with operation when any precondition fails
- Guess or infer missing context
- Default to ALLOW when context is missing or ambiguous

### 4.2 Token Separation

**MUST**:

- Store Core service token ONLY in BFF server-side environment
- Obtain Core service token via server-to-server authentication
- Include Core service token in `Authorization` header for Core API calls

**MUST NOT**:

- Expose Core service token to UI
- Forward Suite UI token to Core
- Log Core service token value
- Include Core service token in error messages

### 4.3 Mapping Enforcement

**MUST**:

- Resolve Suite organizationId → Core organizationId via SuiteOrgMapping table before every Core API call
- Fail-closed when mapping is missing or ambiguous
- Validate Core organizationId exists via Core API before creating mapping

**MUST NOT**:

- Proceed with Core API call when mapping resolution fails
- Guess or use default Core organizationId
- Cache mapping resolution results without expiry

### 4.4 Audit + Correlation Invariants

**MUST**:

- Generate correlation ID at BFF entry point (UUID v4)
- Propagate correlation ID to Core in `X-Correlation-Id` header
- Include correlation ID in all audit log entries
- Write audit log entry for every write operation (success or failure)
- Fail-closed when audit log write fails (rollback operation)

**MUST NOT**:

- Proceed with operation when correlation ID generation fails
- Omit correlation ID from Core API calls or audit logs
- Proceed with operation when audit log write fails

---

## 5. STOP Conditions (Immediate Halt)

Implementation MUST STOP IMMEDIATELY if any of the following occurs:

**Architectural Violations**:

- UI → Core direct call detected
- Core service token found in UI code or browser storage
- Suite UI token forwarded to Core
- Suite code accesses Core DB directly
- Shared database detected between Suite and Core

**Token Violations**:

- Core service token logged
- Core service token included in error message
- Core service token exposed to UI

**Fail-Closed Violations**:

- Operation proceeds when mapping resolution fails
- Operation proceeds when RBAC check fails
- Operation proceeds when audit log write fails
- Default to ALLOW when context is missing

**Scope Violations**:

- Implementation of forbidden capability (workflow builder, customer user management, etc.)
- Creation of table not listed in MODULE_SCOPE_LOCK.md
- Creation of UI screen not listed in MODULE_SCOPE_LOCK.md
- Core interaction not listed in INTEGRATION_ADAPTER_SPEC.md

**Governance Violations**:

- Code written before Gate 3 authorization
- Modification of governance documents without approval
- Bypass of required gates or checklists

**Action on STOP**: Halt all work, document violation, escalate to Governance Authority, rollback changes if necessary.

---

## 6. Evidence Required for Gate Pass

To pass Gate 3, the following evidence MUST exist:

### 6.1 Test Evidence

**Unit Tests**:

- All services have unit tests with mocked dependencies
- All repositories have unit tests with mocked database
- All adapters have unit tests with mocked Core API
- All RBAC logic has unit tests covering all roles
- All fail-closed validation has unit tests covering failure scenarios

**Integration Tests**:

- Fail-closed scenarios tested (missing mapping, invalid token, RBAC failure)
- Core integration adapter tested with mocked Core responses
- Audit logging tested (success and failure cases)
- Correlation ID propagation tested end-to-end

**Security Tests**:

- Token separation verified (Core token never reaches UI)
- RBAC enforcement verified (insufficient role denied)
- Mapping enforcement verified (missing mapping denied)
- Audit immutability verified (no updates or deletes)

### 6.2 Audit Evidence

**Audit Logs**:

- All write operations logged (success and failure)
- All audit log entries include correlation ID
- All audit log entries include performedBy (if authenticated)
- All audit log entries sanitized (no tokens, no credentials)

### 6.3 Code Review Evidence

**Review Artifacts**:

- Code review completed by Governance Authority or authorized reviewer
- All STOP conditions verified as enforced
- All invariants verified as held
- All forbidden patterns verified as absent

### 6.4 Compliance Evidence

**Scope Compliance**:

- All implemented capabilities listed in Section 1.1
- No forbidden capabilities implemented (Section 1.2)
- All files within allowed paths (Section 2.1)
- No forbidden areas modified (Section 2.2)

---

## 7. Signature

**Prepared By**: Principal Software Architect & Governance Authority  
**Date**: 2026-01-27  
**Status**: DRAFT — GATE 3 AUTH
