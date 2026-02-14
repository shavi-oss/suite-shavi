# Module Data Ownership — platform-admin

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Module Name    | platform-admin                          |
| Document Title | MODULE_DATA_OWNERSHIP                   |
| Repo           | Suite (Layer / Product Repo)            |
| Status         | FINAL — CORE V1 ALIGNED                 |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-02-04                              |

---

## 1) Purpose

This document establishes clear data ownership boundaries for the `platform-admin` module. It defines:

- What data this module owns (Suite DB tables)
- What data this module reads from Core (via contract)
- What data this module MUST NOT store
- Source of truth for each data entity

---

## 2) Data Owned by platform-admin (Suite DB)

### 2.1 SuiteOrganization

**SUITE-ONLY**

**Owner**: platform-admin module  
**Storage**: Suite DB  
**Source of Truth**: Suite  
**Purpose**: Store Suite-owned organization records

**Schema**:

```typescript
{
  id: string (UUID, primary key)
  name: string
  status: enum (active, suspended)
  createdAt: timestamp
  updatedAt: timestamp
  createdBy: string (internal user ID)
}
```

**Ownership Rules**:

- MUST be created, updated, and deleted ONLY by platform-admin module
- MUST NOT be modified by Core
- Other Suite modules MAY read this data (if authorized)

**Evidence**: `ARCHITECTURAL_LAWS.md` LAW-8 (Module Ownership & Data Ownership)

---

### 2.2 SuiteOrgMapping

**SUITE-ONLY**

**Owner**: platform-admin module  
**Storage**: Suite DB  
**Source of Truth**: Suite  
**Purpose**: Store mapping between Suite organizationId and Core organizationId

**Schema**:

```typescript
{
  suiteOrgId: string (UUID, primary key, FK to SuiteOrganization)
  coreOrgId: string (external reference, unique)
  createdAt: timestamp
  updatedAt: timestamp
  createdBy: string (internal user ID)
}
```

**Ownership Rules**:

- MUST be created and updated ONLY by platform-admin module
- MUST NOT be deleted (immutable mapping; use status field if needed in future)
- Other Suite modules MUST read this data to resolve Suite org ↔ Core org alignment
- Core MUST NOT access or modify this table

**Evidence**: `ARCHITECTURAL_LAWS.md` LAW-7 (Tenant Boundary — Org Alignment Only)

---

### 2.3 InternalUser

**SUITE-ONLY**

**Owner**: platform-admin module  
**Storage**: Suite DB  
**Source of Truth**: Suite  
**Purpose**: Store internal platform users (admins, developers, support)

**Schema**:

```typescript
{
  id: string (UUID, primary key)
  email: string (unique)
  name: string
  role: enum (platform_admin, developer_ops, support, viewer)
  status: enum (active, deactivated)
  createdAt: timestamp
  updatedAt: timestamp
  createdBy: string (internal user ID)
}
```

**Ownership Rules**:

- MUST be created, updated, and deactivated ONLY by platform-admin module
- MUST NOT be modified by Core
- Other Suite modules MAY read this data for authorization purposes (if authorized)

---

### 2.4 PlatformAdminAuditLog

**SUITE-ONLY**

**Owner**: platform-admin module  
**Storage**: Suite DB  
**Source of Truth**: Suite  
**Purpose**: Immutable audit log of all platform-admin actions

**Schema**:

```typescript
{
  id: string (UUID, primary key)
  correlationId: string (indexed)
  entityType: enum (organization, org_mapping, internal_user)
  entityId: string
  action: enum (create, update, suspend, unsuspend, link, deactivate)
  performedBy: string (internal user ID)
  performedAt: timestamp
  result: enum (success, failure)
  metadata: jsonb (additional context, no secrets)
}
```

**Ownership Rules**:

- MUST be append-only (no updates or deletes)
- MUST be written by platform-admin module for every administrative action
- MUST NOT contain secrets (tokens, passwords, API keys)
- Other Suite modules MUST NOT write to this table
- Retention policy: Indefinite (append-only, no deletion)

---

## 3) Data Read from Core (Via Contract)

### 3.1 Core Organization Data

**CONFIRMED (Core v1)**

**Owner**: Core  
**Storage**: Core DB  
**Source of Truth**: Core  
**Access Method**: `GET /api/v1/organizations/:id`

**Evidence**: `CORE_CONTRACT_V1_EXTRACT.md` Section B.8

---

**SUITE-ONLY** — What platform-admin Reads:

- Core organizationId (for mapping validation)

**What platform-admin MUST NOT Do**:

- Store Core organization details in Suite DB (except coreOrgId as external reference)
- Modify Core organization data
- Access Core DB directly

**Evidence**: `ARCHITECTURAL_LAWS.md` LAW-6 (Database Separation)

---

### 3.2 Core Template Data

**DEFERRED (Core v2+)**

Template publishing is NOT available in Core v1.

**Evidence**: `CORE_V1_INTEGRATION_LOCK.md` Section 4.1

---

**SUITE-ONLY** — Status:

**Owner**: Core (when available)  
**Storage**: Core DB (when available)  
**Source of Truth**: Core  
**Access Method**: NONE (template publish is DEFERRED in Core v1)

**What platform-admin Reads**:

- NONE (template publish is DEFERRED in Core v1)

**What platform-admin MUST NOT Do**:

- Store Core template definitions in Suite DB
- Modify Core templates
- Access Core DB directly

---

## 4) Data platform-admin MUST NOT Store

**SUITE-ONLY**

**Forbidden** (unless explicitly authorized by future scope change):

- Customer user credentials or authentication data (owned by Core or separate auth module)
- Core workflow execution logs (owned by Core)
- Core audit logs (owned by Core)
- Core JWTs (server-side in-memory only, never stored)
- Billing or subscription data (owned by future billing module)
- CRM or Omnichannel data (owned by future CRM/Omnichannel modules)
- Core internal state or configuration
- Any PII beyond what is necessary for internal user management (email, name)

**Action on violation**: STOP immediately, escalate to Governance Authority.

**Evidence**: `ARCHITECTURAL_LAWS.md` LAW-6 (Database Separation), LAW-8 (Module Ownership)

---

## 5) Source of Truth Matrix

| Data Entity            | Owner          | Storage  | Source of Truth | Access by platform-admin |
| ---------------------- | -------------- | -------- | --------------- | ------------------------ |
| SuiteOrganization      | platform-admin | Suite DB | Suite           | Read/Write               |
| SuiteOrgMapping        | platform-admin | Suite DB | Suite           | Read/Write               |
| InternalUser           | platform-admin | Suite DB | Suite           | Read/Write               |
| PlatformAdminAuditLog  | platform-admin | Suite DB | Suite           | Write-only (append)      |
| Core Organization      | Core           | Core DB  | Core            | Read-only (via API)      |
| Core Template          | Core           | Core DB  | Core            | No access (DEFERRED)     |
| Customer User          | Core or Auth   | Core DB  | Core            | No access                |
| Workflow Execution Log | Core           | Core DB  | Core            | No access                |

---

## 6) Stop Rules

**SUITE-ONLY**

Execution MUST STOP IMMEDIATELY if any of the following occurs:

- platform-admin stores Core-owned sensitive data (e.g., customer credentials, workflow logs) without explicit authorization
- platform-admin modifies Core DB directly
- platform-admin deletes audit logs
- platform-admin stores secrets (tokens, passwords) in audit logs or metadata fields
- Other Suite modules write to PlatformAdminAuditLog
- SuiteOrgMapping is hard-deleted without approval

**Action on STOP**: Halt all work, document the violation, escalate to Governance Authority.

---

## 7) Acceptance Criteria

This data ownership document is considered ACTIVE and BINDING when ALL of the following are true:

- [x] All Suite DB tables owned by platform-admin are explicitly listed with schemas
- [x] All Core data accessed by platform-admin is explicitly listed with access method
- [x] Core Organization endpoint confirmed (Core v1)
- [x] Core Template marked DEFERRED (Core v1)
- [x] All forbidden data storage is explicitly listed
- [x] Source of truth matrix is complete and unambiguous
- [x] Stop rules are explicit and enforceable
- [x] All CONFIRMED claims have evidence links

---

## 8) Signature

**Approved By**: Governance Authority  
**Date**: 2026-02-04  
**Status**: FINAL — CORE V1 ALIGNED
