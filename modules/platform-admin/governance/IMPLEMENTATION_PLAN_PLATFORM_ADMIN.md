# Implementation Plan — platform-admin (Gate 2)

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Module Name    | platform-admin                          |
| Document Title | IMPLEMENTATION_PLAN_PLATFORM_ADMIN      |
| Repo           | Suite (Layer / Product Repo)            |
| Status         | FINAL — GATE 2                          |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-01-26                              |

---

## 1. Purpose of This Plan

### 1.1 Why This Module Exists

The `platform-admin` module exists to provide an internal operator/developer console for managing the Suite layer infrastructure. It enables internal teams to:

- Manage Suite organizations (tenants) and their lifecycle
- Establish and maintain the critical organizationId mapping between Suite and Core (Bassan.os)
- Manage internal operator users and enforce role-based access control
- Publish predefined workflow templates from Suite to Core
- Maintain comprehensive audit trails for all administrative actions

This module is strictly internal-facing and serves as the operational control plane for Suite.

### 1.2 Explicitly What It Does NOT Do

The `platform-admin` module does NOT:

- Provide customer-facing user management or self-service portals
- Implement workflow builders, visual editors, or custom template creation
- Modify or extend Bassan.os Core codebase
- Store or manage Core-owned runtime state (workflow executions, Core audit logs)
- Implement billing, subscription, or payment processing
- Provide CRM, Omnichannel, or other vertical business functionality
- Allow UI to call Core APIs directly
- Manage customer users or their permissions

---

## 2. Scope (LOCKED)

### 2.1 In-Scope Responsibilities

**Organization Management**:

- Create Suite organizations
- View all Suite organizations
- Suspend/unsuspend Suite organizations
- Store organization metadata in Suite DB only

**OrganizationId Mapping**:

- Link Suite organizationId to Core organizationId (one-to-one mapping)
- Store mapping in Suite DB (SuiteOrgMapping table)
- Enforce fail-closed validation on all mapping operations
- Deny access when mapping is missing or ambiguous

**Internal User Management**:

- Create internal operator users (platform_admin, developer_ops, support, viewer)
- View all internal users
- Deactivate internal users
- Enforce RBAC for platform-admin module access

**Template Publishing**:

- Trigger publication of predefined workflow templates to Core
- Predefined templates are stored in Suite codebase (read-only)
- BFF calls Core template publishing endpoint (server-to-server)
- Audit all publish actions

**Audit Logging**:

- Log all administrative actions (create, update, suspend, link, publish, deactivate)
- Store correlation IDs for request tracing
- Provide read-only audit log viewer UI
- Enforce retention policy (DECISION REQUIRED)

### 2.2 Out-of-Scope List (Explicit)

- Workflow builder or visual workflow editor
- Custom template creation or modification UI
- Customer user management
- Customer-facing authentication or authorization
- Billing, subscriptions, or payment processing
- Real-time dashboards or analytics
- CRM or Omnichannel features
- Any modification to Bassan.os Core
- Direct UI → Core API calls
- Storing Core-owned runtime state in Suite DB

---

## 3. Architectural Positioning

### 3.1 Where platform-admin Lives in Suite

The `platform-admin` module is a discrete functional unit within the Suite layer repository. It consists of:

- **UI Layer**: Internal admin console (web application) accessible only to internal operators
- **BFF Layer**: Suite Backend-for-Frontend API endpoints under `/api/platform-admin/*`
- **Data Layer**: Suite DB tables (SuiteOrganization, SuiteOrgMapping, InternalUser, PlatformAdminAuditLog)

The module operates entirely within Suite boundaries and does not extend into Core.

### 3.2 Relationship to Core (Bassan.os)

Core is treated as a black box. The `platform-admin` module interacts with Core ONLY via:

- **BFF → Core API calls**: Server-to-server integration using Core service token
- **Allowed Core interactions** (abstract, exact endpoints TBD):
  - Validate Core organizationId exists
  - Publish predefined workflow template to Core
  - (No other Core interactions are authorized)

The `platform-admin` module MUST NOT:

- Access Core DB directly
- Modify Core source code
- Rely on Core internal implementation details
- Store Core-owned sensitive data

### 3.3 BFF Boundary Explanation (No UI → Core)

**Strict Separation**:

- UI authenticates to Suite BFF using Suite-issued tokens
- UI calls ONLY Suite BFF endpoints (`/api/platform-admin/*`)
- BFF authenticates to Core using Core-issued service token (server-only)
- BFF is the ONLY component allowed to call Core APIs

**Token Separation**:

- Suite UI tokens are issued by Suite authentication service
- Core service tokens are issued by Core and stored ONLY in BFF server environment
- UI tokens MUST NEVER be forwarded to Core
- Core tokens MUST NEVER reach UI

**Fail-Closed Enforcement**:

- Any attempt by UI to call Core directly = STOP
- Any Core token exposure to UI = STOP
- Any missing organizationId mapping = deny access

---

## 4. Domain Breakdown

### 4.1 Companies / Tenants

**Responsibility**: Manage Suite organizations (tenants) as logical isolation boundaries.

**Data Ownership**:

- Suite owns `SuiteOrganization` table in Suite DB
- Core owns its own organization records in Core DB
- No shared tenant tables

**Operations**:

- Create Suite organization (store in Suite DB)
- Suspend/unsuspend Suite organization (update Suite DB)
- View organization list and details (read from Suite DB)

**Fail-Closed Rules**:

- Organization creation requires valid internal user authentication
- Suspend/unsuspend requires RBAC check (platform_admin or developer_ops role)
- All operations require correlation ID and audit logging

### 4.2 OrgId Mapping

**Responsibility**: Establish and maintain one-to-one mapping between Suite organizationId and Core organizationId.

**Data Ownership**:

- Suite owns `SuiteOrgMapping` table in Suite DB
- Mapping is stored ONLY in Suite DB
- Core organizationId is treated as an external reference

**Operations**:

- Link Suite org ↔ Core org (create mapping)
- View all mappings
- View mapping for specific Suite org

**Fail-Closed Rules**:

- Missing mapping = deny access (no fallback, no guessing)
- Ambiguous mapping (multiple Suite orgs → same Core org without authorization) = deny access
- Mapping creation requires validation that Core organizationId exists (BFF → Core API call)
- All mapping operations require audit logging

### 4.3 Operators & RBAC

**Responsibility**: Manage internal operator users and enforce role-based access control.

**Data Ownership**:

- Suite owns `InternalUser` table in Suite DB
- Internal users are distinct from customer users (customer users are out of scope)

**Roles (Locked)**:

- `platform_admin`: Full access to all platform-admin features
- `developer_ops`: Read/write orgs, mappings, templates; read-only users
- `support`: Read-only access to all resources
- `viewer`: Read-only access to all resources

**Operations**:

- Create internal user (store in Suite DB)
- Deactivate internal user (update Suite DB)
- View internal user list and details (read from Suite DB)

**Fail-Closed Rules**:

- All BFF endpoints require authentication (valid Suite UI token)
- All write operations require RBAC check (role-based authorization)
- Deactivated users are denied access
- All user operations require audit logging

### 4.4 Template Publishing

**Responsibility**: Trigger publication of predefined workflow templates from Suite to Core.

**Data Ownership**:

- Predefined templates are stored in Suite codebase (read-only, version-controlled)
- Templates are NOT stored in Suite DB
- Core owns published template instances in Core DB

**Operations**:

- List available predefined templates (read from Suite codebase)
- Trigger publish template to Core (BFF → Core API call)

**Fail-Closed Rules**:

- Only predefined templates may be published (no custom template creation in MVP)
- Publish requires valid organizationId mapping (Suite org ↔ Core org)
- Publish requires RBAC check (platform_admin or developer_ops role)
- BFF validates template exists before calling Core
- All publish actions require correlation ID propagation to Core
- All publish actions require audit logging

### 4.5 Audit & Correlation

**Responsibility**: Maintain comprehensive audit trail for all administrative actions.

**Data Ownership**:

- Suite owns `PlatformAdminAuditLog` table in Suite DB
- Core owns its own audit logs in Core DB (no overlap)

**Operations**:

- Log all administrative actions (create, update, suspend, link, publish, deactivate)
- View audit logs (read-only, filterable by entity, action, user, date)

**Mandatory Fields**:

- `correlationId`: Unique identifier for request tracing (propagated UI → BFF → Core)
- `entityType`: Type of entity affected (organization, org_mapping, internal_user, template_publish)
- `entityId`: ID of affected entity
- `action`: Action performed (create, update, suspend, unsuspend, link, deactivate, publish)
- `performedBy`: Internal user ID who performed action
- `performedAt`: Timestamp of action
- `metadata`: Additional context (JSONB, no secrets)

**Fail-Closed Rules**:

- Audit logging is mandatory for all write operations (failure to log = STOP)
- Audit logs MUST NOT contain tokens, passwords, or sensitive business data
- Audit log viewer requires authentication and RBAC check (all roles have read access)
- Retention policy MUST be defined (DECISION REQUIRED)

---

## 5. Execution Flow (High Level)

### 5.1 Read-Only Diagram Description (Textual)

**Organization Creation Flow**:

1. Internal user authenticates to Suite UI (Suite-issued token)
2. UI invokes organization creation capability on BFF
3. BFF validates Suite UI token and RBAC (platform_admin or developer_ops)
4. BFF generates correlation ID
5. BFF creates organization record in Suite DB (SuiteOrganization table)
6. BFF logs action to PlatformAdminAuditLog
7. BFF returns success response to UI

**Org Mapping Creation Flow**:

1. Internal user authenticates to Suite UI
2. UI invokes org mapping creation capability on BFF with `suiteOrgId` and `coreOrgId`
3. BFF validates Suite UI token and RBAC
4. BFF generates correlation ID
5. BFF validates `suiteOrgId` exists in Suite DB
6. BFF calls Core API to validate `coreOrgId` exists (using Core service token)
7. If Core validation fails → deny mapping creation, log failure, return safe error
8. If Core validation succeeds → create mapping in Suite DB (SuiteOrgMapping table)
9. BFF logs action to PlatformAdminAuditLog
10. BFF returns success response to UI

**Template Publish Flow**:

1. Internal user authenticates to Suite UI
2. UI invokes template publish capability on BFF with `templateId` and `suiteOrgId`
3. BFF validates Suite UI token and RBAC
4. BFF generates correlation ID
5. BFF validates `templateId` exists in predefined templates (Suite codebase)
6. BFF resolves `suiteOrgId` → `coreOrgId` via SuiteOrgMapping table
7. If mapping missing or ambiguous → deny publish, log failure, return safe error
8. BFF calls Core template publishing endpoint (using Core service token, propagating correlation ID and coreOrgId)
9. If Core publish fails → log failure, return safe error
10. If Core publish succeeds → log success to PlatformAdminAuditLog
11. BFF returns success response to UI

### 5.2 Fail-Closed Checkpoints

**Checkpoint 1: Authentication**

- Every BFF request validates Suite UI token
- Invalid token → deny access, return 401

**Checkpoint 2: RBAC**

- Every write operation validates user role
- Insufficient permissions → deny access, return 403, log attempt

**Checkpoint 3: OrgId Mapping Resolution**

- Every Core integration validates mapping exists
- Missing mapping → deny access, log failure, return safe error
- Ambiguous mapping → deny access, log failure, return safe error

**Checkpoint 4: Core Validation**

- BFF validates Core organizationId exists before creating mapping
- Core validation failure → deny mapping creation, log failure

**Checkpoint 5: Audit Logging**

- Every write operation logs to PlatformAdminAuditLog
- Logging failure → STOP (do not proceed with operation)

---

## 6. Sequencing Plan

### Phase A: Foundation (Governance & Data Layer)

**Purpose**: Establish governance, database schema specification, and fail-closed validation rules.

**Deliverables**:

- All module governance documents (CHARTER, SCOPE_LOCK, DATA_OWNERSHIP, INTEGRATION_PLAN, SECURITY_LAWS, GATES_CHECKLIST, EXECUTION_AUTHORIZATION)
- Data schema specification (SuiteOrganization, SuiteOrgMapping, InternalUser, PlatformAdminAuditLog tables)
- Fail-closed validation rules specification (mapping resolution, RBAC checks)

**Why First**: No code can proceed without governance approval and data layer specification.

### Phase B: BFF Core Integration Adapter

**Purpose**: Implement server-to-server integration with Core.

**Deliverables**:

- Core service token acquisition and rotation logic
- Core API client (abstract, endpoint-agnostic)
- Correlation ID propagation
- Timeout, retry, and circuit breaker logic (conceptual)
- Integration tests (mock Core responses)

**Why Second**: BFF must be able to call Core before implementing business logic that depends on Core.

### Phase C: BFF Business Logic (Organizations & Mapping)

**Purpose**: Implement organization and mapping management capabilities.

**Deliverables**:

- Organization Management — Write Operations (create, suspend, unsuspend)
- Organization Management — Read Operations (list all, retrieve single)
- Org Mapping — Write Operations (link Suite org ↔ Core org)
- Org Mapping — Read Operations (list all mappings, retrieve mapping for Suite org)
- Unit tests for all capabilities
- Integration tests for fail-closed scenarios

**Why Third**: Organizations and mappings are foundational to all other features.

### Phase D: BFF Business Logic (Users, Templates, Audit)

**Purpose**: Implement remaining BFF capabilities.

**Deliverables**:

- Internal User Management — Write Operations (create, deactivate)
- Internal User Management — Read Operations (list all, retrieve single)
- Template Publish Command (trigger publish predefined template to Core)
- Audit Log Query Operations (retrieve logs with filtering)
- Unit tests for all capabilities
- Integration tests for RBAC and audit logging

**Why Fourth**: These features depend on organizations and mappings being functional.

### Phase E: UI Implementation

**Purpose**: Implement internal admin console UI.

**Deliverables**:

- Organization List, Detail, Create screens
- Org Mapping Management screen
- Internal User List, Detail, Create screens
- Template Publish Trigger screen
- Audit Log Viewer screen
- UI authentication and routing
- End-to-end tests

**Why Last**: UI depends on all BFF capabilities being functional and tested.

---

## 7. Explicit Non-Goals

The following are FORBIDDEN in this implementation plan:

- Implementing workflow builder or visual editor
- Implementing custom template creation UI
- Implementing customer user management
- Implementing billing or subscription features
- Implementing CRM or Omnichannel features
- Implementing real-time notifications or webhooks
- Modifying Bassan.os Core codebase
- Allowing UI to call Core APIs directly
- Storing Core-owned runtime state in Suite DB
- Implementing MFA for internal users (deferred to v2)
- Implementing external identity provider integration (deferred to v2)
- Adding any capability, table, or UI screen not listed in MODULE_SCOPE_LOCK.md

---

## 8. Gate 2 Decisions Required

The following decisions are REQUIRED before proceeding to Gate 3 (implementation):

### 8.1 Core Integration Decisions

**DECISION REQUIRED: Core Authentication Flow**

- How does BFF obtain Core service token?
- What is the exact Core authentication endpoint?
- What authentication method is used (OAuth2 client credentials, service account)?
- What is the Core service token TTL?
- What is the token rotation frequency?

**DECISION REQUIRED: Core OrganizationId Validation Endpoint**

- What is the exact Core API endpoint to validate organizationId exists?
- What is the request/response schema?
- What status codes indicate success/failure?

**DECISION REQUIRED: Core Template Publishing Endpoint**

- What is the exact Core API endpoint to publish workflow template?
- What is the request/response schema?
- How is tenant context (coreOrgId) passed to Core (header, JWT claim, query param)?
- What status codes indicate success/failure?
- Does Core support idempotency keys for publish operations?

**DECISION REQUIRED: Correlation ID Propagation**

- What header name does Core expect for correlation ID (e.g., `X-Correlation-Id`)?
- Does Core include correlation ID in responses?

### 8.2 Timeout & Retry Decisions

**DECISION REQUIRED: Timeout Policy**

- What is the timeout for Core API calls (read operations)?
- What is the timeout for Core API calls (write operations)?

**DECISION REQUIRED: Retry Policy**

- How many retries for transient Core API failures (e.g., 3)?
- What backoff strategy (e.g., exponential: 1s, 2s, 4s)?
- Which status codes trigger retry (e.g., 5xx, network timeout)?
- Which status codes do NOT trigger retry (e.g., 4xx, 401, 403)?

**DECISION REQUIRED: Circuit Breaker Thresholds**

- How many consecutive failures to open circuit (e.g., 5)?
- How long to keep circuit open (e.g., 60 seconds)?
- What recovery strategy (e.g., half-open state, single test request)?

### 8.3 Audit & Retention Decisions

**DECISION REQUIRED: Audit Log Retention Policy**

- How long to retain audit logs in Suite DB (e.g., 90 days, 1 year, indefinitely)?
- What is the archival strategy for old logs (e.g., move to cold storage, delete)?

**DECISION REQUIRED: Audit Log Access Rules**

- Which roles can read audit logs (all roles, or restricted)?
- Are there any restrictions on filtering or exporting audit logs?

### 8.4 RBAC Model Decisions

**DECISION REQUIRED: RBAC Enforcement Granularity**

- Is the 4-role model (platform_admin, developer_ops, support, viewer) sufficient for MVP?
- Are there any operations that require additional role differentiation?

### 8.5 Predefined Template Storage

**DECISION REQUIRED: Template Storage Location**

- Where are predefined templates stored in Suite codebase (e.g., `/templates` directory, JSON files)?
- What is the template schema/format?
- How are templates versioned?

---

## 9) Signature

**Prepared By**: Principal Software Architect & Governance Authority  
**Date**: 2026-01-27  
**Status**: FINAL — GATE 2
