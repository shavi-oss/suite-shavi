# Module Data Ownership — platform-admin

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Module Name    | platform-admin                          |
| Document Title | MODULE_DATA_OWNERSHIP                   |
| Repo           | Suite (Layer / Product Repo)            |
| Status         | FINAL — BINDING DATA OWNERSHIP          |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-01-26                              |

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

**Owner**: platform-admin module  
**Storage**: Suite DB  
**Source of Truth**: Suite  
**Purpose**: Store Suite-owned organization records

**Schema**:

```
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

### 2.2 SuiteOrgMapping

**Owner**: platform-admin module  
**Storage**: Suite DB  
**Source of Truth**: Suite  
**Purpose**: Store mapping between Suite organizationId and Core organizationId

**Schema**:

```
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

### 2.3 InternalUser

**Owner**: platform-admin module  
**Storage**: Suite DB  
**Source of Truth**: Suite  
**Purpose**: Store internal platform users (admins, developers, support)

**Schema**:

```
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

### 2.4 PlatformAdminAuditLog

**Owner**: platform-admin module  
**Storage**: Suite DB  
**Source of Truth**: Suite  
**Purpose**: Immutable audit log of all platform-admin actions

**Schema**:

```
{
  id: string (UUID, primary key)
  correlationId: string (indexed)
  entityType: enum (organization, org_mapping, internal_user, template_publish)
  entityId: string
  action: enum (create, update, suspend, unsuspend, link, deactivate, publish)
  performedBy: string (internal user ID)
  performedAt: timestamp
  metadata: jsonb (additional context, no secrets)
}
```

**Ownership Rules**:

- MUST be append-only (no updates or deletes)
- MUST be written by platform-admin module for every administrative action
- MUST NOT contain secrets (tokens, passwords, API keys)
- Other Suite modules MUST NOT write to this table
- Retention policy: TBD (TODO: define retention period, e.g., 2 years)

---

## 3) Data Read from Core (Via Contract)

### 3.1 Core Organization Data

**Owner**: Core  
**Storage**: Core DB  
**Source of Truth**: Core  
**Access Method**: Core API (TBD: exact endpoint per INTEGRATION_CONTRACT_CORE.md)

**What platform-admin Reads**:

- Core organizationId (for mapping validation)
- Core organization status (if needed for validation)

**What platform-admin MUST NOT Do**:

- Store Core organization details in Suite DB (except coreOrgId as external reference)
- Modify Core organization data
- Access Core DB directly

### 3.2 Core Template Data

**Owner**: Core  
**Storage**: Core DB  
**Source of Truth**: Core  
**Access Method**: Core API (TBD: exact endpoint per INTEGRATION_CONTRACT_CORE.md)

**What platform-admin Reads**:

- Template publish status (if needed for confirmation)

**What platform-admin MUST NOT Do**:

- Store Core template definitions in Suite DB
- Modify Core templates
- Access Core DB directly

---

## 4) Data platform-admin MUST NOT Store

**Forbidden** (unless explicitly authorized by future scope change):

- Customer user credentials or authentication data (owned by Core or separate auth module)
- Core workflow execution logs (owned by Core)
- Core audit logs (owned by Core)
- Billing or subscription data (owned by future billing module)
- CRM or Omnichannel data (owned by future CRM/Omnichannel modules)
- Core internal state or configuration
- Any PII beyond what is necessary for internal user management (email, name)

**Action on violation**: STOP immediately, escalate to Governance Authority.

---

## 5) Source of Truth Matrix

| Data Entity            | Owner          | Storage  | Source of Truth | Access by platform-admin |
| ---------------------- | -------------- | -------- | --------------- | ------------------------ |
| SuiteOrganization      | platform-admin | Suite DB | Suite           | Read/Write               |
| SuiteOrgMapping        | platform-admin | Suite DB | Suite           | Read/Write               |
| InternalUser           | platform-admin | Suite DB | Suite           | Read/Write               |
| PlatformAdminAuditLog  | platform-admin | Suite DB | Suite           | Write-only (append)      |
| Core Organization      | Core           | Core DB  | Core            | Read-only (via API)      |
| Core Template          | Core           | Core DB  | Core            | Read-only (via API)      |
| Customer User          | Core or Auth   | Core DB  | Core            | No access                |
| Workflow Execution Log | Core           | Core DB  | Core            | No access                |

---

## 6) Data Retention & Lifecycle

### 6.1 SuiteOrganization

- **Retention**: Indefinite (until explicitly deleted by authorized admin)
- **Soft Delete**: Use `status: suspended` instead of hard delete
- **Hard Delete**: Requires explicit approval and audit log entry

### 6.2 SuiteOrgMapping

- **Retention**: Indefinite (immutable mapping)
- **Deletion**: FORBIDDEN (use status field if needed in future)

### 6.3 InternalUser

- **Retention**: Indefinite (until explicitly deleted by authorized admin)
- **Soft Delete**: Use `status: deactivated` instead of hard delete
- **Hard Delete**: Requires explicit approval and audit log entry

### 6.4 PlatformAdminAuditLog

- **Retention**: TBD (TODO: define retention period, e.g., 2 years)
- **Deletion**: FORBIDDEN (immutable audit log)
- **Archival**: TBD (TODO: define archival strategy for old logs)

---

## 7) Data Classification

| Data Entity           | Classification | Encryption at Rest | Encryption in Transit |
| --------------------- | -------------- | ------------------ | --------------------- |
| SuiteOrganization     | Internal       | Required           | Required (TLS)        |
| SuiteOrgMapping       | Internal       | Required           | Required (TLS)        |
| InternalUser          | Confidential   | Required           | Required (TLS)        |
| PlatformAdminAuditLog | Confidential   | Required           | Required (TLS)        |

**Note**: No Restricted or Public data in this module.

---

## 8) Stop Rules

Execution MUST STOP IMMEDIATELY if any of the following occurs:

- platform-admin stores Core-owned sensitive data (e.g., customer credentials, workflow logs) without explicit authorization
- platform-admin modifies Core DB directly
- platform-admin deletes audit logs
- platform-admin stores secrets (tokens, passwords) in audit logs or metadata fields
- Other Suite modules write to PlatformAdminAuditLog
- SuiteOrgMapping is hard-deleted without approval

**Action on STOP**: Halt all work, document the violation, escalate to Governance Authority.

---

## 9) Acceptance Criteria

This data ownership document is considered ACTIVE and BINDING when ALL of the following are true:

- [ ] All Suite DB tables owned by platform-admin are explicitly listed with schemas
- [ ] All Core data accessed by platform-admin is explicitly listed with access method
- [ ] All forbidden data storage is explicitly listed
- [ ] Source of truth matrix is complete and unambiguous
- [ ] Data retention and lifecycle policies are defined (or marked TODO)
- [ ] Data classification is defined for all owned data
- [ ] Stop rules are explicit and enforceable
- [ ] No contradictions exist with MODULE_CHARTER.md, MODULE_SCOPE_LOCK.md, or repo-level governance
- [ ] Governance Authority has reviewed and approved this document

---

## 10) Change Control

### 10.1 Required Approvals

Changes to data ownership require:

- Written justification
- Explicit approval from Governance Authority
- Update to MODULE_SCOPE_LOCK.md (if adding new tables)
- Version increment and git tag

### 10.2 Forbidden Changes

The following changes are FORBIDDEN without escalation:

- Storing Core-owned sensitive data in Suite DB
- Allowing other modules to write to PlatformAdminAuditLog
- Deleting audit logs
- Weakening encryption or classification requirements

---

## 11) Signature

**Approved By**: Governance Authority  
**Date**: 2026-01-26  
**Status**: FINAL — BINDING DATA OWNERSHIP
