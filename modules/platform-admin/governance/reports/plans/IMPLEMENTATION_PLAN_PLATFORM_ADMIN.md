# Implementation Plan — platform-admin

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Module Name    | platform-admin                          |
| Document Title | IMPLEMENTATION_PLAN_PLATFORM_ADMIN      |
| Repo           | Suite (Layer / Product Repo)            |
| Status         | FINAL — CORE V1 ALIGNED                 |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-02-04                              |

---

## 1) Purpose

The `platform-admin` module provides an internal operator console for managing Suite layer infrastructure.

**Evidence**: `ARCHITECTURAL_LAWS.md` LAW-1 (Governance First)

---

## 2) Scope (LOCKED)

### 2.1 In-Scope Responsibilities

**SUITE-ONLY**

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

**Audit Logging**:

- Log all administrative actions
- Store correlation IDs for request tracing
- Provide read-only audit log viewer UI
- Enforce retention policy (indefinite, append-only)

---

**DEFERRED (Core v2+)**

**Template Publishing**: NOT available in Core v1.

**Evidence**: `CORE_V1_INTEGRATION_LOCK.md` Section 4.1

---

### 2.2 Out-of-Scope List

**SUITE-ONLY**

- Workflow builder or visual workflow editor
- Custom template creation or modification UI
- Customer user management
- Billing, subscriptions, or payment processing
- Real-time dashboards or analytics
- CRM or Omnichannel features
- Any modification to Bassan.os Core
- Direct UI → Core API calls
- Storing Core-owned runtime state in Suite DB

**Evidence**: `MODULE_SCOPE_LOCK.md`

---

## 3) Architectural Positioning

### 3.1 Where platform-admin Lives

**SUITE-ONLY**

The `platform-admin` module consists of:

- **UI Layer**: Internal admin console (web application)
- **BFF Layer**: Suite Backend-for-Frontend API endpoints under `/api/platform-admin/*`
- **Data Layer**: Suite DB tables (SuiteOrganization, SuiteOrgMapping, InternalUser, PlatformAdminAuditLog)

**Evidence**: `ARCHITECTURAL_LAWS.md` LAW-4 (BFF is the Only Integration Boundary)

---

### 3.2 Relationship to Core

**CONFIRMED (Core v1)**

Core is treated as a black box. Integration ONLY via:

- **BFF → Core API calls**: Server-to-server using validated user-scoped JWT
- **Allowed Core interactions**: Validate Core organizationId exists (`GET /api/v1/organizations/:id`)

**Evidence**: `CORE_CONTRACT_V1_EXTRACT.md` Section B.8

---

**NOT AVAILABLE** (Core v1):

- Service-to-Service Authentication
- Template Publishing

**Evidence**: `CORE_V1_INTEGRATION_LOCK.md` Section 4.1, Section 5.1

---

### 3.3 BFF Boundary

**SUITE-ONLY**

**Strict Separation**:

- UI authenticates to Suite BFF using Suite-issued tokens
- UI calls ONLY Suite BFF endpoints
- BFF forwards validated user-scoped JWT to Core
- BFF is the ONLY component allowed to call Core APIs

**Token Separation**:

- Suite UI tokens are validated by Suite BFF
- Core JWTs are forwarded as-is (no minting/constructing)
- UI tokens MUST NEVER be forwarded to Core
- Core JWTs MUST NEVER reach UI

**Evidence**: `ARCHITECTURAL_LAWS.md` LAW-3 (UI Never Talks to Core), LAW-5 (Token & Identity Separation)

---

## 4) Domain Breakdown

### 4.1 Companies / Tenants

**SUITE-ONLY**

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
- Suspend/unsuspend requires RBAC check
- All operations require correlation ID and audit logging

**Evidence**: `ARCHITECTURAL_LAWS.md` LAW-7 (Tenant Boundary — Org Alignment Only)

---

### 4.2 OrgId Mapping

**SUITE-ONLY**

**Responsibility**: Establish one-to-one mapping between Suite organizationId and Core organizationId.

**Data Ownership**:

- Suite owns `SuiteOrgMapping` table in Suite DB
- Core organizationId is treated as an external reference

**Operations**:

- Link Suite org ↔ Core org (create mapping)
- View all mappings
- View mapping for specific Suite org

**Fail-Closed Rules**:

- Missing mapping = deny access (no fallback, no guessing)
- Ambiguous mapping = deny access
- Mapping creation requires validation that Core organizationId exists (BFF → Core API call)
- All mapping operations require audit logging

**Evidence**: `ARCHITECTURAL_LAWS.md` LAW-10 (Fail-Closed By Default)

---

### 4.3 Operators & RBAC

**SUITE-ONLY**

**Responsibility**: Manage internal operator users and enforce RBAC.

**Roles (Locked)**:

- `platform_admin`: Full access
- `developer_ops`: Read/write orgs, mappings; read-only users
- `support`: Read-only access
- `viewer`: Read-only access

**Fail-Closed Rules**:

- All BFF endpoints require authentication
- All write operations require RBAC check
- Deactivated users are denied access
- All user operations require audit logging

---

### 4.4 Audit & Correlation

**SUITE-ONLY**

**Responsibility**: Maintain comprehensive audit trail.

**Data Ownership**:

- Suite owns `PlatformAdminAuditLog` table in Suite DB
- Core owns its own audit logs (no overlap)

**Mandatory Fields**:

- `correlationId`: Unique identifier for request tracing
- `entityType`: Type of entity affected
- `entityId`: ID of affected entity
- `action`: Action performed
- `performedBy`: Internal user ID
- `performedAt`: Timestamp
- `result`: Success/failure
- `metadata`: Additional context (JSONB, no secrets)

**Fail-Closed Rules**:

- Audit logging is mandatory for all write operations (failure to log = STOP)
- Audit logs MUST NOT contain tokens, passwords, or sensitive data
- Retention policy: Indefinite (append-only, no deletion)

---

## 5) Execution Flow

### 5.1 Organization Creation Flow

**SUITE-ONLY**

1. Internal user authenticates to Suite UI
2. UI invokes organization creation on BFF
3. BFF validates Suite UI token and RBAC
4. BFF generates correlation ID
5. BFF creates organization record in Suite DB
6. BFF logs action to PlatformAdminAuditLog
7. BFF returns success response to UI

---

### 5.2 Org Mapping Creation Flow

**CONFIRMED (Core v1)** — Core validation step:

6. BFF calls Core API to validate `coreOrgId` exists using validated user-scoped JWT

**Evidence**: `CORE_CONTRACT_V1_EXTRACT.md` Section B.8

---

**SUITE-ONLY** — Full flow:

1. Internal user authenticates to Suite UI
2. UI invokes org mapping creation on BFF with `suiteOrgId` and `coreOrgId`
3. BFF validates Suite UI token and RBAC
4. BFF generates correlation ID
5. BFF validates `suiteOrgId` exists in Suite DB
6. BFF calls Core API to validate `coreOrgId` exists
7. If Core validation fails → deny mapping creation, log failure, return safe error
8. If Core validation succeeds → create mapping in Suite DB
9. BFF logs action to PlatformAdminAuditLog
10. BFF returns success response to UI

---

### 5.3 Fail-Closed Checkpoints

**SUITE-ONLY**

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

**Evidence**: `ARCHITECTURAL_LAWS.md` LAW-10 (Fail-Closed By Default)

---

## 6) Sequencing Plan

### Phase A: Foundation

**SUITE-ONLY**

**Purpose**: Establish governance, database schema, fail-closed validation rules.

**Deliverables**:

- All module governance documents
- Data schema specification
- Fail-closed validation rules specification

---

### Phase B: BFF Core Integration Adapter

**CONFIRMED (Core v1)** — Authentication:

BFF forwards validated user-scoped JWT to Core.

**Evidence**: `CORE_V1_INTEGRATION_LOCK.md` Section 3.2

---

**SUITE-ONLY** — Deliverables:

- Core API client (User-Scoped JWT forwarding)
- Correlation ID propagation
- Timeout, retry, and circuit breaker logic (implementation-level, non-contractual, within authorized scope)
- Integration tests (mock Core responses)

> [!NOTE]
> Core service token acquisition is NOT AVAILABLE in Core v1. BFF forwards validated user-scoped JWT only.

---

### Phase C: BFF Business Logic (Organizations & Mapping)

**SUITE-ONLY**

**Deliverables**:

- Organization Management (create, suspend, unsuspend, list, retrieve)
- Org Mapping (link Suite org ↔ Core org, list, retrieve)
- Unit tests for all capabilities
- Integration tests for fail-closed scenarios

---

### Phase D: BFF Business Logic (Users, Audit)

**SUITE-ONLY**

**Deliverables**:

- Internal User Management (create, deactivate, list, retrieve)
- Audit Log Query Operations (retrieve logs with filtering)
- Unit tests for all capabilities
- Integration tests for RBAC and audit logging

---

### Phase E: UI Implementation

**SUITE-ONLY**

**Deliverables**:

- Organization List, Detail, Create screens
- Org Mapping Management screen
- Internal User List, Detail, Create screens
- Audit Log Viewer screen
- UI authentication and routing
- End-to-end tests

---

## 7) Explicit Non-Goals

**SUITE-ONLY**

The following are FORBIDDEN:

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
- Adding any capability not listed in MODULE_SCOPE_LOCK.md

**Evidence**: `MODULE_SCOPE_LOCK.md`

---

## 8) Acceptance Criteria

This implementation plan is ACTIVE and BINDING when:

- [x] All in-scope responsibilities are explicitly listed
- [x] All out-of-scope items are explicitly listed
- [x] Architectural positioning is clear
- [x] Domain breakdown is complete
- [x] Execution flows are documented
- [x] Sequencing plan is defined
- [x] Non-goals are explicit
- [x] All CONFIRMED claims have evidence links
- [x] Template publishing marked DEFERRED (Core v1)
- [x] Service-to-service auth marked NOT AVAILABLE (Core v1)

---

## 9) Signature

**Approved By**: Governance Authority  
**Date**: 2026-02-04  
**Status**: FINAL — CORE V1 ALIGNED
