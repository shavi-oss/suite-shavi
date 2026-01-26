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
| Effective Date | 2026-01-26                              |

---

## 1) Purpose

This document establishes an immutable scope boundary for the `platform-admin` module MVP (v1.0). Any feature, endpoint, database table, or integration not explicitly listed here is FORBIDDEN until a formal scope change is approved.

---

## 2) Locked Scope (MVP v1.0)

### 2.1 UI Components (Allowed)

**MUST implement ONLY these UI screens**:

- Organization List (view all Suite orgs)
- Organization Detail (view single org, suspend/unsuspend)
- Create Organization Form
- Org Mapping Management (view mappings, link Suite org ↔ Core org)
- Internal User List (view all internal users)
- Create Internal User Form
- User Detail (view user, deactivate)
- Template Publish Trigger (select pre-defined template, trigger publish to Core)
- Audit Log Viewer (read-only, filterable by entity, action, user, date)

**MUST NOT implement**:

- Workflow builder or visual editor
- Custom template creation UI
- Customer user management screens
- Billing or subscription screens
- Real-time dashboards or analytics
- Any screen not listed above

### 2.2 BFF Endpoints (Allowed)

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

**Template Publishing**:

- `POST /api/platform-admin/templates/publish` — Trigger publish template to Core

**Audit Logs**:

- `GET /api/platform-admin/audit-logs` — List audit logs (filterable)

**MUST NOT implement**:

- Any endpoint not listed above
- Customer-facing user endpoints
- Workflow builder endpoints
- Billing or subscription endpoints
- Real-time notification endpoints

### 2.3 Database Tables (Allowed)

**MUST create ONLY these Suite DB tables**:

**SuiteOrganization**:

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

**SuiteOrgMapping**:

```
{
  suiteOrgId: string (UUID, primary key, FK to SuiteOrganization)
  coreOrgId: string (external reference, unique)
  createdAt: timestamp
  updatedAt: timestamp
  createdBy: string (internal user ID)
}
```

**InternalUser**:

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

**PlatformAdminAuditLog**:

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

**MUST NOT create**:

- Customer user tables
- Workflow definition tables
- Billing or subscription tables
- Any table not listed above

### 2.4 Core Integration (Allowed)

**MUST call ONLY these Core endpoints** (TBD: exact endpoints per INTEGRATION_CONTRACT_CORE.md):

- Core org creation/validation endpoint (TBD)
- Core template publishing endpoint (TBD)

**MUST NOT call**:

- Any Core endpoint not explicitly authorized in INTEGRATION_CONTRACT_CORE.md
- Core DB directly

### 2.5 RBAC Roles (Locked)

**MUST implement ONLY these roles**:

- `platform_admin` — Full access to all platform-admin features
- `developer_ops` — Read/write access to orgs, mappings, templates; read-only users
- `support` — Read-only access to all resources
- `viewer` — Read-only access to all resources (same as support, for future differentiation)

**MUST NOT implement**:

- Customer-facing roles
- Granular permission system beyond these 4 roles in MVP

---

## 3) Forbidden Scope Expansions

The following are EXPLICITLY FORBIDDEN without formal scope change approval:

- Adding customer user management
- Adding workflow builder or visual editor
- Adding custom template creation UI
- Adding billing or subscription features
- Adding CRM or Omnichannel features
- Adding real-time notifications or webhooks
- Adding MFA for internal users (deferred to v2)
- Adding external identity provider integration (deferred to v2)
- Adding any endpoint, table, or UI screen not listed in Section 2

**Action on violation**: STOP immediately, escalate to Governance Authority.

---

## 4) Scope Change Protocol

### 4.1 How to Request Scope Change

1. Document proposed change in writing (feature description, justification, impact analysis)
2. Update MODULE_CHARTER.md and MODULE_SCOPE_LOCK.md with proposed changes
3. Submit for review to Governance Authority
4. Obtain explicit written approval
5. Increment module version (e.g., v1.1 or v2.0)
6. Create git tag: `suite-platform-admin-v<version>`

### 4.2 Forbidden Shortcuts

**MUST NOT**:

- Implement features "temporarily" without scope approval
- Add "experimental" endpoints or tables
- Bypass scope lock for "urgent" requests
- Assume verbal approval is sufficient

---

## 5) Acceptance Criteria

This scope lock is considered ACTIVE and BINDING when ALL of the following are true:

- [ ] All allowed UI components are explicitly listed
- [ ] All allowed BFF endpoints are explicitly listed
- [ ] All allowed database tables are explicitly listed with schemas
- [ ] All allowed Core integrations are explicitly listed (or marked TBD with reference to contract)
- [ ] All RBAC roles are explicitly listed
- [ ] All forbidden scope expansions are explicitly listed
- [ ] Scope change protocol is documented
- [ ] No contradictions exist with MODULE_CHARTER.md or repo-level governance
- [ ] Governance Authority has reviewed and approved this scope lock

---

## 6) Change Control

### 6.1 Required Approvals

Changes to this scope lock require:

- Written justification
- Explicit approval from Governance Authority
- Version increment and git tag
- Update to MODULE_CHARTER.md (if applicable)

### 6.2 Immutability

Once approved and tagged, this scope lock is IMMUTABLE for v1.0. Any change requires a new version (v1.1, v2.0, etc.).

---

## 7) Signature

**Approved By**: Governance Authority  
**Date**: 2026-01-26  
**Status**: FINAL — BINDING SCOPE LOCK
