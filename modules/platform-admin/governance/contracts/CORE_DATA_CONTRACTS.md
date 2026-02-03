# Core Data Contracts — platform-admin

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Module Name    | platform-admin                          |
| Document Title | CORE_DATA_CONTRACTS                     |
| Repo           | Suite (Layer / Product Repo)            |
| Status         | ACTIVE — DATA CONTRACT                  |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-01-30                              |

---

## 1) Purpose

This document defines the data contract between Suite `platform-admin` module and Bassan.os Core. It establishes:

- Core-owned resources that platform-admin may reference (read-only)
- Suite-owned resources for mapping and administrative purposes
- Data minimization rules
- Caching policies
- Forbidden data storage

**Contract Philosophy**: Core is a black box. Suite MUST NOT rely on Core internal schemas or store Core-owned sensitive data.

---

## 2) Core-Owned Resources (Read-Only References)

### 2.1 Core Organization

**Owner**: Core  
**Storage**: Core DB  
**Access Method**: Core API (endpoint TBD per INTEGRATION_CONTRACT_CORE.md)  
**Org-Scope**: Yes (each organization is isolated)

**What platform-admin May Read**:

- `coreOrgId` (string, UUID) — for mapping validation only
- `status` (enum: active, suspended) — if needed for validation (TBD)

**Allowed Caching**:

- `coreOrgId` ONLY (as external reference in `SuiteOrgMapping` table)
- Cache duration: Indefinite (mapping is immutable)

**Forbidden Fields** (MUST NOT store in Suite DB):

- Organization name, metadata, configuration
- User lists, roles, permissions
- Billing or subscription data
- Any Core internal state

**TODO (BLOCKED)**:

- [x] Exact Core API endpoint confirmed: `GET /api/v1/organizations/:id` (per Core Contract v1 Extract line 182)
- [ ] Confirm response schema from Core team
- [ ] Define whether `status` field is needed for validation

---

### 2.2 Core Template

> [!WARNING]
> **DEFERRED IN CORE V1** — Template entities and flows are DEFERRED.  
> Core v1 does NOT expose template publish endpoints.

**Owner**: Core  
**Storage**: Core DB  
**Access Method**: NONE (template publish is DEFERRED in Core v1)  
**Org-Scope**: Yes (templates are org-specific after publishing)

**What platform-admin May Read**:

- NONE (template publish is DEFERRED in Core v1)

**Allowed Caching**:

- NONE (template data is Core-owned; template publish is DEFERRED)

**Forbidden Fields** (MUST NOT store in Suite DB):

- Template definitions, steps, configurations
- Template execution logs
- Template version history

**Status**: Template publish capability is DEFERRED until Core v2 (requires new contract lock)

---

## 3) Suite-Owned Resources (For Mapping Only)

### 3.1 SuiteOrganization

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

**Retention Stance**: Indefinite (soft delete via `status: suspended`)

---

### 3.2 SuiteOrgMapping

**Owner**: platform-admin module  
**Storage**: Suite DB  
**Source of Truth**: Suite  
**Purpose**: Map Suite organizationId to Core organizationId

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

**Retention Stance**: Immutable (MUST NOT delete; use status field if needed in future)

---

### 3.3 InternalUser

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

**Retention Stance**: Indefinite (soft delete via `status: deactivated`)

---

### 3.4 PlatformAdminAuditLog

**Owner**: platform-admin module  
**Storage**: Suite DB  
**Source of Truth**: Suite  
**Purpose**: Immutable audit log of all platform-admin actions

**Schema**:

```typescript
{
  id: string (UUID, primary key)
  correlationId: string (indexed)
  entityType: enum (organization, org_mapping, internal_user, template_publish)
  entityId: string
  action: enum (create, update, suspend, unsuspend, link, deactivate, publish)
  performedBy: string (internal user ID)
  performedAt: timestamp
  result: enum (success, failure)
  metadata: jsonb (additional context, NO SECRETS)
}
```

**Retention Stance**: TBD (TODO: define retention period, e.g., 2 years)

---

## 4) Data Minimization Rules

**MUST**:

- Store ONLY `coreOrgId` as external reference (no other Core org data)
- Store ONLY internal user data necessary for platform administration
- Store ONLY audit metadata necessary for compliance (no secrets)

**MUST NOT**:

- Store Core-owned sensitive data (user credentials, workflow logs, audit logs)
- Store Core internal state or configuration
- Store PII beyond what is necessary for internal user management (email, name)
- Cache Core data beyond `coreOrgId` mapping

---

## 5) Caching Policy

| Data Entity     | Allowed to Cache? | Max Cache Duration | Reason                             |
| --------------- | ----------------- | ------------------ | ---------------------------------- |
| coreOrgId       | Yes               | Indefinite         | Immutable mapping reference        |
| Core org status | No                | N/A                | Core is source of truth            |
| Core template   | No                | N/A                | Core is source of truth            |
| Suite org       | Yes (own data)    | N/A                | Suite owns this data               |
| Suite mapping   | Yes (own data)    | N/A                | Suite owns this data               |
| Internal user   | Yes (own data)    | N/A                | Suite owns this data               |
| Audit log       | Yes (own data)    | N/A                | Suite owns this data (append-only) |

---

## 6) TODO List (Unknown Core Resource Shapes)

**BLOCKED** (requires Core team input):

- [ ] Define exact Core organization resource schema (fields, types, constraints)
- [ ] Define exact Core template resource schema (fields, types, constraints)
- [ ] Confirm Core API endpoint URLs for organization validation and template publishing
- [ ] Confirm Core API request/response formats
- [ ] Confirm Core API error codes and meanings
- [ ] Define Core API versioning strategy (header, path, etc.)

**Action**: Do NOT guess or assume Core resource shapes. Mark as TODO and proceed with interface-level contracts only.

---

## 7) Stop Rules

Execution MUST STOP IMMEDIATELY if:

- platform-admin stores Core-owned sensitive data (beyond `coreOrgId` reference)
- platform-admin caches Core data beyond allowed policy
- platform-admin accesses Core DB directly
- platform-admin stores secrets (tokens, passwords) in audit logs or metadata

**Action on STOP**: Halt all work, document violation, escalate to Governance Authority.

---

## 8) Acceptance Criteria

This data contract is ACTIVE and BINDING when:

- [x] Core-owned resources are explicitly listed with allowed/forbidden fields
- [x] Suite-owned resources are explicitly listed with schemas
- [x] Data minimization rules are explicit
- [x] Caching policy is explicit
- [x] TODO list documents unknown Core resource shapes
- [x] Stop rules are explicit and enforceable
- [ ] Core team has confirmed resource schemas and API endpoints (BLOCKED)

---

## 9) Signature

**Approved By**: Governance Authority  
**Date**: 2026-01-30  
**Status**: ACTIVE — DATA CONTRACT
