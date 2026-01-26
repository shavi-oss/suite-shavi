# Module Charter — platform-admin

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Module Name    | platform-admin                          |
| Document Title | MODULE_CHARTER                          |
| Repo           | Suite (Layer / Product Repo)            |
| Status         | FINAL — BINDING CHARTER                 |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-01-26                              |

---

## 1) Purpose & Mission

### 1.1 Module Purpose

`platform-admin` is an internal Operator/Developer Console that enables authorized Suite platform administrators to manage the foundational operational aspects of the Suite layer. This module provides the control plane for:

- Company/Tenant lifecycle management
- Core organizationId mapping (Suite ↔ Core alignment)
- Internal team user management and RBAC
- Template publishing to Core (using pre-defined templates only)

### 1.2 Mission Statement

Provide a secure, auditable, fail-closed administrative interface for Suite platform operations, ensuring strict tenant isolation, immutable audit trails, and zero tolerance for unauthorized access or token leakage.

---

## 2) Scope (MVP — Version 1.0)

### 2.1 In-Scope Features (MVP)

**Company/Tenant Management**:

- Create new Suite organization (company/tenant)
- View list of all Suite organizations
- View single organization details
- Suspend organization (soft-delete, reversible)
- Unsuspend organization (restore access)

**Core Organization Mapping**:

- Link Suite organizationId to Core organizationId (one-to-one mapping)
- View existing mappings
- Audit mapping changes (immutable log)
- Fail-closed enforcement: deny operations if mapping is missing or ambiguous

**Internal Team User Management**:

- Create internal platform users (not customer users)
- Assign RBAC roles: `platform_admin`, `developer_ops`, `support`, `viewer`
- View internal user list
- Deactivate internal user

**Template Publishing to Core**:

- Trigger "Publish template to Core" action using pre-defined templates
- Templates are hardcoded/configured (no workflow builder in MVP)
- Audit all publish actions with correlation IDs

**Mandatory Cross-Cutting Concerns**:

- Immutable audit logs for all administrative actions
- Correlation IDs for all operations
- Deny-by-default authorization
- No Core token exposure to UI
- All BFF → Core calls use server-only Core service token

### 2.2 Explicitly Out-of-Scope (MVP)

**Forbidden in MVP**:

- Customer-facing user management (customer users are managed elsewhere)
- Workflow builder or visual workflow editor
- Custom template creation UI (templates are pre-defined)
- Billing or subscription management
- CRM or Omnichannel features
- Real-time notifications or webhooks
- Multi-factor authentication (MFA) for internal users (TODO: add in v2)
- Advanced analytics or reporting dashboards
- Integration with external identity providers (SAML, OAuth) (TODO: add in v2)

---

## 3) Definitions

| Term               | Definition                                                                               |
| ------------------ | ---------------------------------------------------------------------------------------- |
| **Suite Org**      | A Suite-owned organization record stored in Suite DB                                     |
| **Core Org**       | A Core-owned organization record stored in Core DB; referenced by Suite via mapping only |
| **Org Mapping**    | One-to-one link between Suite organizationId and Core organizationId, stored in Suite DB |
| **Internal User**  | Platform administrator, developer, or support user (not a customer user)                 |
| **RBAC Role**      | Role-based access control role: `platform_admin`, `developer_ops`, `support`, `viewer`   |
| **Template**       | Pre-defined workflow or configuration that can be published to Core                      |
| **Audit Log**      | Immutable record of administrative actions (who, what, when, correlation ID)             |
| **Correlation ID** | Unique identifier for a request, propagated across UI → BFF → Core for tracing           |

---

## 4) Non-Goals (Explicit)

This module will NOT:

- Manage customer-facing users or customer authentication
- Provide a workflow builder or visual editor
- Allow custom template creation via UI
- Implement billing, invoicing, or subscription logic
- Provide CRM or Omnichannel functionality
- Expose Core tokens to UI or client-side code
- Allow direct UI → Core API calls
- Share databases with Core
- Implement real-time notifications or webhooks in MVP
- Provide MFA for internal users in MVP (deferred to v2)

---

## 5) Success Criteria (MVP)

This module is considered successful when ALL of the following are true:

- [ ] Authorized internal users can create, view, suspend, and unsuspend Suite organizations
- [ ] Authorized internal users can link Suite organizationId to Core organizationId
- [ ] All org mapping changes are logged immutably with correlation IDs
- [ ] Missing or ambiguous org mappings fail-closed (deny operation, return safe error)
- [ ] Authorized internal users can create and deactivate internal platform users
- [ ] RBAC roles are enforced: `platform_admin`, `developer_ops`, `support`, `viewer`
- [ ] Authorized internal users can trigger "Publish template to Core" using pre-defined templates
- [ ] All administrative actions are logged immutably
- [ ] No Core service token is ever exposed to UI
- [ ] All BFF → Core calls use server-only Core service token
- [ ] All security gates pass (unit, integration, security tests)
- [ ] Module complies with SECURITY_BASELINE.md and ARCHITECTURAL_LAWS.md

---

## 6) Stakeholders & Roles

| Role                     | Responsibility                                                        |
| ------------------------ | --------------------------------------------------------------------- |
| **Governance Authority** | Approve module charter, scope lock, and execution authorization       |
| **Platform Admin**       | Primary user of this module; manages orgs, mappings, users, templates |
| **Developer Ops**        | Secondary user; may have read-only or limited write access            |
| **Support**              | Read-only access to view orgs, mappings, users for troubleshooting    |
| **Viewer**               | Read-only access to all resources (no write permissions)              |

---

## 7) Dependencies

### 7.1 External Dependencies

- **Bassan.os Core**: Required for org mapping and template publishing (black box, accessed via contract)
- **Suite DB**: Required for storing Suite orgs, mappings, internal users, audit logs
- **Suite BFF**: Required as the only integration boundary to Core

### 7.2 Internal Dependencies

- EXECUTION_AUTHORITY.md (repo-level)
- ARCHITECTURAL_LAWS.md (repo-level)
- REPO_GOVERNANCE.md (repo-level)
- SECURITY_BASELINE.md (repo-level)
- INTEGRATION_CONTRACT_CORE.md (repo-level)

---

## 8) Risks & Mitigations

| Risk                                   | Mitigation                                                                 |
| -------------------------------------- | -------------------------------------------------------------------------- |
| Unauthorized access to admin functions | Enforce RBAC, deny-by-default, audit all actions                           |
| Tenant isolation breach                | Fail-closed org mapping, immutable audit logs, security tests              |
| Core token leakage to UI               | Server-only token handling, never expose to client, security linter checks |
| Mapping corruption or ambiguity        | Fail-closed enforcement, immutable audit, break-glass policy               |
| Insider threat (malicious admin)       | Immutable audit logs, correlation IDs, periodic audit reviews              |

---

## 9) Acceptance Criteria (Charter)

This charter is considered ACTIVE and BINDING when ALL of the following are true:

- [ ] All in-scope features are explicitly listed
- [ ] All out-of-scope features are explicitly listed
- [ ] Success criteria are testable and measurable
- [ ] Non-goals are documented
- [ ] Stakeholders and roles are defined
- [ ] Dependencies are identified
- [ ] Risks and mitigations are documented
- [ ] No contradictions exist with repo-level governance
- [ ] Governance Authority has reviewed and approved this charter

---

## 10) Change Control

### 10.1 Scope Changes

Any change to in-scope or out-of-scope features requires:

- Written justification
- Explicit approval from Governance Authority
- Update to MODULE_SCOPE_LOCK.md
- Version increment and git tag

### 10.2 Forbidden Changes

The following changes are FORBIDDEN without escalation:

- Adding customer-facing user management to MVP
- Adding workflow builder to MVP
- Allowing UI → Core direct calls
- Allowing Core token exposure to UI
- Weakening fail-closed org mapping enforcement

---

## 11) Signature

**Approved By**: Governance Authority  
**Date**: 2026-01-26  
**Status**: FINAL — BINDING CHARTER
