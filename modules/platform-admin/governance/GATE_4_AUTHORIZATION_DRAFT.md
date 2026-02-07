# Gate 4 — Authorization & RBAC Draft

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Module Name    | platform-admin                          |
| Document Title | GATE_4_AUTHORIZATION_DRAFT              |
| Repo           | Suite (Layer / Product Repo)            |
| Status         | DRAFT — DOCS-ONLY                       |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-02-07                              |

---

## 1) Authorization Invariants

### Invariant 1: Deny-by-Default

**Statement**: All endpoints deny access by default. Access is granted ONLY when explicitly allowed in RBAC matrix.

**Evidence**: `MODULE_SECURITY_LAWS.md` Section 3.1 (MUST: Deny-by-default authorization)

---

### Invariant 2: Explicit Role Matching

**Statement**: User role MUST exactly match one of the 4 locked roles: `platform_admin`, `developer_ops`, `support`, `viewer`.

**Evidence**: `MODULE_SCOPE_LOCK.md` Section 2.5 (RBAC Roles — Locked)

---

### Invariant 3: No Permission Inference

**Statement**: Permissions are NEVER inferred from role names, role hierarchy, or user attributes. Only explicit RBAC matrix entries grant access.

**Evidence**: `RBAC_SCOPE_MATRIX.md` Section 1 (No implicit allow)

---

### Invariant 4: Write Requires Explicit Allow

**Statement**: All write operations (POST, PATCH, DELETE) are denied unless user role has explicit Allow in RBAC matrix for that endpoint.

**Evidence**: `RBAC_SCOPE_MATRIX.md` Section 4.2 (Write Operations)

---

### Invariant 5: Authentication Precedes Authorization

**Statement**: Authentication MUST succeed before authorization check. Missing or invalid token → Deny access (no RBAC check).

**Evidence**: `IMPLEMENTATION_PLAN_PLATFORM_ADMIN.md` Section 5.3 (Checkpoint 1: Authentication)

---

### Invariant 6: Active User Status Required

**Statement**: User status MUST be `active`. Deactivated users are denied access regardless of role.

**Evidence**: `IMPLEMENTATION_PLAN_PLATFORM_ADMIN.md` Section 4.3 (Fail-Closed Rules)

---

### Invariant 7: Audit All Violations

**Statement**: All authorization violations (role mismatch, write without allow, deactivated user) MUST be logged to `PlatformAdminAuditLog`.

**Evidence**: `AUTHORIZATION_STOP_RULES.md` Section 4.1 (Authorization Violations)

---

## 2) Deny-by-Default Model

### 2.1 Model Definition

**Default State**: Deny access to all endpoints

**Allow Condition**: User is authenticated AND user status is active AND user role has explicit Allow in RBAC matrix for endpoint/action

**Failure Mode**: Deny access (never fail-open)

**Evidence**: `MODULE_SECURITY_LAWS.md` Section 5 (Fail-Closed Enforcement)

---

### 2.2 Decision Flow

```
Request → Authenticate → Check User Status → Check RBAC Matrix → Allow/Deny
            ↓                    ↓                    ↓
          Fail → Deny          Fail → Deny         Fail → Deny
```

**Checkpoints**:

1. **Authentication**: Valid token present and verified
2. **User Status**: User status is `active`
3. **RBAC Matrix**: User role has explicit Allow for endpoint/action

**Failure at any checkpoint**: Deny access, return appropriate HTTP status (401/403), log violation

**Evidence**: `IMPLEMENTATION_PLAN_PLATFORM_ADMIN.md` Section 5.3 (Fail-Closed Checkpoints)

---

### 2.3 No Fallback Logic

**Forbidden**:

- Default-allow behavior
- Fallback to "allow if role exists"
- Catch-all "admin access" logic
- Permission inference from role name

**Evidence**: `AUTHORIZATION_STOP_RULES.md` STOP Rule 5 (Fallback Logic), STOP Rule 6 (Ambiguous Permission)

---

## 3) RBAC ↔ Fail-Closed Mapping

### 3.1 RBAC Enforcement Points

**Location**: Every BFF endpoint (before business logic execution)

**Mechanism**: Guard/Decorator (implementation detail, NOT defined in this docs-only gate)

**Check**: User role has explicit Allow in RBAC matrix for endpoint/action

**Failure**: Deny access, return 403 Forbidden, log violation

**Evidence**: `RBAC_SCOPE_MATRIX.md` Section 4 (Enforcement Rules)

---

### 3.2 Fail-Closed Integration

**RBAC Check Failure = Fail-Closed**:

- Missing role → Deny (STOP Rule 1)
- Invalid role → Deny (STOP Rule 2)
- Role mismatch → Deny (STOP Rule 3)
- Write without allow → Deny (STOP Rule 4)

**Evidence**: `AUTHORIZATION_STOP_RULES.md` Section 2 (Authorization STOP Rules)

---

### 3.3 Audit Integration

**RBAC Check Failure → Audit Log**:

- `correlationId`: Request correlation ID
- `entityType`: `authorization_violation`
- `action`: `deny_access`
- `performedBy`: User ID (if available)
- `result`: `failure`
- `metadata`: Rule violated, endpoint, role, reason

**Evidence**: `AUTHORIZATION_STOP_RULES.md` Section 4.1 (Authorization Violations)

---

## 4) Non-Goals

### 4.1 What Will NOT Be Implemented

❌ **Dynamic Permissions**: No runtime permission calculation or role composition

❌ **Granular Permissions**: No per-field, per-resource, or per-tenant permissions beyond role-based matrix

❌ **Role Hierarchy**: No parent-child role relationships or role inheritance

❌ **External Identity Providers**: No SSO, SAML, OAuth integration (deferred to v2)

❌ **MFA**: No multi-factor authentication for internal users (deferred to v2)

❌ **Customer-Facing Roles**: No roles for end-users (only internal operators)

❌ **Permission Delegation**: No "act as" or "impersonate" functionality

❌ **Time-Based Permissions**: No temporary access grants or expiring permissions

**Evidence**: `MODULE_SCOPE_LOCK.md` Section 3 (Forbidden Scope Expansions), `RBAC_SCOPE_MATRIX.md` Section 5 (Non-Goals)

---

### 4.2 Deferred to Future Gates

**Gate 5+**: Implementation of RBAC guards, decorators, and enforcement logic

**Gate 6+**: Integration tests for RBAC enforcement

**Gate 7+**: Security tests for authorization violations

**Evidence**: `PLATFORM_ADMIN_READINESS.md` Section 3 (What Is Allowed in Future Gates)

---

## 5) Transition Criteria to Gate 5

Gate 4 → Gate 5 transition requires:

### 5.1 Documentation Complete

- [x] `GATE_4_AUTHORIZATION_PLAN.md` created
- [x] `RBAC_SCOPE_MATRIX.md` created
- [x] `AUTHORIZATION_STOP_RULES.md` created
- [x] `GATE_4_AUTHORIZATION_DRAFT.md` created (this file)

---

### 5.2 Evidence Backing

- [x] All claims backed by binding sources (`MODULE_SECURITY_LAWS.md`, `MODULE_SCOPE_LOCK.md`, `IMPLEMENTATION_PLAN_PLATFORM_ADMIN.md`)
- [x] RBAC matrix covers all endpoints from `MODULE_SCOPE_LOCK.md` Section 2.2
- [x] All STOP rules linked to governance sources

---

### 5.3 Scope Compliance

- [x] No code created (guards, decorators, controllers, services, DTOs)
- [x] No Prisma schema changes
- [x] No migrations
- [x] No dependencies added
- [x] No tests created
- [x] No files modified outside `modules/platform-admin/governance/`

---

### 5.4 User Approval

- [ ] User reviews and approves authorization specification
- [ ] User confirms readiness to proceed to Gate 5 (implementation)

---

## 6) Gate 5 Preview

**Gate 5 Scope** (NOT part of Gate 4):

- Implement RBAC guards and decorators
- Wire RBAC enforcement to endpoints
- Implement authentication middleware
- Implement user status check
- Create unit tests for RBAC logic
- Create integration tests for fail-closed scenarios

**Evidence**: `PLATFORM_ADMIN_READINESS.md` Section 3.2 (Gate 4.9+ — Opt-In Endpoints)

---

## 7) Signature

**Approved By**: Governance Authority  
**Date**: 2026-02-07  
**Status**: DRAFT — DOCS-ONLY
