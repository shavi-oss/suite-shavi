# Module Scope Lock — platform-admin

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Module Name    | platform-admin                          |
| Document Title | MODULE_SCOPE_LOCK                       |
| Repo           | Suite (Layer / Product Repo)            |
| Status         | FINAL — BINDING SCOPE LOCK              |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-02-04                              |

---

## 1) Purpose

This document establishes an immutable scope boundary for the `platform-admin` module MVP (v1.0). Any feature, endpoint, database table, or integration not explicitly listed here is FORBIDDEN until a formal scope change is approved.

---

## 2) Locked Scope (MVP v1.0)

### 2.1 UI Components (Allowed)

**SUITE-ONLY**

**MUST implement ONLY these UI screens**:

- Organization List (view all Suite orgs)
- Organization Detail (view single org, suspend/unsuspend)
- Create Organization Form
- Org Mapping Management (view mappings, link Suite org ↔ Core org)
- Internal User List (view all internal users)
- Create Internal User Form
- User Detail (view user, deactivate)
- Audit Log Viewer (read-only, filterable by entity, action, user, date)

**MUST NOT implement**:

- Workflow builder or visual editor
- Custom template creation UI
- Customer user management screens
- Billing or subscription screens
- Real-time dashboards or analytics
- Template Publish Trigger (DEFERRED — Core v1 has no template publish endpoint)
- Any screen not listed above

---

### 2.2 BFF Endpoints (Allowed)

**SUITE-ONLY**

**MUST implement ONLY these BFF endpoints**:

**Organization Management**:

- `POST /api/platform-admin/organizations` — Create Suite org
- `GET /api/platform-admin/organizations` — List all Suite orgs
- `GET /api/platform-admin/organizations/:id` — Get single org
- `PATCH /api/platform-admin/organizations/:id/suspend` — Suspend org
- `PATCH /api/platform-admin/organizations/:id/unsuspend` — Unsuspend org

**Org Mapping Management**:

- `POST /api/platform-admin/org-mappings` — Link Suite org ↔ Core org
- `GET /api/platform-admin/org-mappings` — List all mappings
- `GET /api/platform-admin/org-mappings/:suiteOrgId` — Get mapping for Suite org

**Internal User Management**:

- `POST /api/platform-admin/internal-users` — Create internal user
- `GET /api/platform-admin/internal-users` — List all internal users
- `GET /api/platform-admin/internal-users/:id` — Get single user
- `PATCH /api/platform-admin/internal-users/:id/deactivate` — Deactivate user

**Audit Logs**:

- `GET /api/platform-admin/audit-logs` — List audit logs (filterable)

**MUST NOT implement**:

- Template Publishing endpoints (DEFERRED — Core v1)
- Any endpoint not listed above
- Customer-facing user endpoints
- Workflow builder endpoints
- Billing or subscription endpoints
- Real-time notification endpoints

---

### 2.3 Database Tables (Allowed)

**SUITE-ONLY**

**MUST create ONLY these Suite DB tables**:

**SuiteOrganization**:

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

**SuiteOrgMapping**:

```typescript
{
  suiteOrgId: string (UUID, primary key, FK to SuiteOrganization)
  coreOrgId: string (external reference, unique)
  createdAt: timestamp
  updatedAt: timestamp
  createdBy: string (internal user ID)
}
```

**InternalUser**:

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

**PlatformAdminAuditLog**:

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

**MUST NOT create**:

- Customer user tables
- Workflow definition tables
- Billing or subscription tables
- Template publish tracking tables (DEFERRED)
- Any table not listed above

---

### 2.4 Core Integration (Allowed)

**CONFIRMED (Core v1)**

**MUST call ONLY these Core endpoints**:

- `GET /api/v1/organizations/:id` — Validate Core organizationId exists

**Evidence**: `CORE_CONTRACT_V1_EXTRACT.md` Section B.8

---

**DEFERRED (Core v2+)**

Template publishing is NOT available in Core v1.

**Evidence**: `CORE_V1_INTEGRATION_LOCK.md` Section 4.1

---

**SUITE-ONLY**

**MUST NOT call**:

- Any Core endpoint not explicitly authorized in Core Contract v1
- Core DB directly

---

### 2.5 RBAC Roles (Locked)

**SUITE-ONLY**

**MUST implement ONLY these roles**:

- `platform_admin` — Full access to all platform-admin features
- `developer_ops` — Read/write access to orgs, mappings; read-only users
- `support` — Read-only access to all resources
- `viewer` — Read-only access to all resources (same as support, for future differentiation)

**MUST NOT implement**:

- Customer-facing roles
- Granular permission system beyond these 4 roles in MVP

---

## 3) Forbidden Scope Expansions

**SUITE-ONLY**

The following are EXPLICITLY FORBIDDEN without formal scope change approval:

- Adding customer user management
- Adding workflow builder or visual editor
- Adding custom template creation UI
- Adding template publishing (DEFERRED — Core v1)
- Adding billing or subscription features
- Adding CRM or Omnichannel features
- Adding real-time notifications or webhooks
- Adding MFA for internal users (deferred to v2)
- Adding external identity provider integration (deferred to v2)
- Adding any endpoint, table, or UI screen not listed in Section 2

**Action on violation**: STOP immediately, escalate to Governance Authority.

---

## 4) Acceptance Criteria

This scope lock is considered ACTIVE and BINDING when ALL of the following are true:

- [x] All allowed UI components are explicitly listed
- [x] All allowed BFF endpoints are explicitly listed
- [x] All allowed database tables are explicitly listed with schemas
- [x] All allowed Core integrations are explicitly listed (Core v1)
- [x] Template publishing marked DEFERRED (Core v1)
- [x] All RBAC roles are explicitly listed
- [x] All forbidden scope expansions are explicitly listed
- [x] All CONFIRMED claims have evidence links

---

## 5) Signature

**Approved By**: Governance Authority  
**Date**: 2026-02-04  
**Status**: FINAL — BINDING SCOPE LOCK
