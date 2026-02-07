# RBAC Scope Matrix — platform-admin

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Module Name    | platform-admin                          |
| Document Title | RBAC_SCOPE_MATRIX                       |
| Repo           | Suite (Layer / Product Repo)            |
| Status         | DRAFT — DOCS-ONLY                       |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-02-07                              |

---

## 1) Purpose

This document defines the **strict role-to-permission mapping** for all `platform-admin` endpoints.

**Authorization Model**:

- **Deny-by-default**: All Write operations are denied unless explicitly allowed
- **Read-only where proven**: Read operations allowed only where explicitly documented
- **No implicit allow**: Every permission must be backed by evidence
- **No shortcuts**: Every endpoint × role combination explicitly defined

**Evidence**: `MODULE_SECURITY_LAWS.md` Section 3.2 (RBAC Enforcement)

---

## 2) RBAC Matrix

### 2.1 Organization Management

| Endpoint                                                | Action | platform_admin | developer_ops | support  | viewer   |
| ------------------------------------------------------- | ------ | -------------- | ------------- | -------- | -------- |
| `POST /api/platform-admin/organizations`                | Write  | ✅ Allow       | ✅ Allow      | ❌ Deny  | ❌ Deny  |
| `GET /api/platform-admin/organizations`                 | Read   | ✅ Allow       | ✅ Allow      | ✅ Allow | ✅ Allow |
| `GET /api/platform-admin/organizations/:id`             | Read   | ✅ Allow       | ✅ Allow      | ✅ Allow | ✅ Allow |
| `PATCH /api/platform-admin/organizations/:id/suspend`   | Write  | ✅ Allow       | ✅ Allow      | ❌ Deny  | ❌ Deny  |
| `PATCH /api/platform-admin/organizations/:id/unsuspend` | Write  | ✅ Allow       | ✅ Allow      | ❌ Deny  | ❌ Deny  |

**Evidence**: `MODULE_SECURITY_LAWS.md` Section 3.2, `MODULE_SCOPE_LOCK.md` Section 2.2

---

### 2.2 Org Mapping Management

| Endpoint                                           | Action | platform_admin | developer_ops | support  | viewer   |
| -------------------------------------------------- | ------ | -------------- | ------------- | -------- | -------- |
| `POST /api/platform-admin/org-mappings`            | Write  | ✅ Allow       | ✅ Allow      | ❌ Deny  | ❌ Deny  |
| `GET /api/platform-admin/org-mappings`             | Read   | ✅ Allow       | ✅ Allow      | ✅ Allow | ✅ Allow |
| `GET /api/platform-admin/org-mappings/:suiteOrgId` | Read   | ✅ Allow       | ✅ Allow      | ✅ Allow | ✅ Allow |

**Evidence**: `MODULE_SECURITY_LAWS.md` Section 3.2, `MODULE_SCOPE_LOCK.md` Section 2.2

---

### 2.3 Internal User Management

| Endpoint                                                  | Action | platform_admin | developer_ops | support  | viewer   |
| --------------------------------------------------------- | ------ | -------------- | ------------- | -------- | -------- |
| `POST /api/platform-admin/internal-users`                 | Write  | ✅ Allow       | ❌ Deny       | ❌ Deny  | ❌ Deny  |
| `GET /api/platform-admin/internal-users`                  | Read   | ✅ Allow       | ✅ Allow      | ✅ Allow | ✅ Allow |
| `GET /api/platform-admin/internal-users/:id`              | Read   | ✅ Allow       | ✅ Allow      | ✅ Allow | ✅ Allow |
| `PATCH /api/platform-admin/internal-users/:id/deactivate` | Write  | ✅ Allow       | ❌ Deny       | ❌ Deny  | ❌ Deny  |

**Evidence**: `MODULE_SECURITY_LAWS.md` Section 3.2, `MODULE_SCOPE_LOCK.md` Section 2.2

---

### 2.4 Audit Logs

| Endpoint                             | Action | platform_admin | developer_ops | support  | viewer   |
| ------------------------------------ | ------ | -------------- | ------------- | -------- | -------- |
| `GET /api/platform-admin/audit-logs` | Read   | ✅ Allow       | ✅ Allow      | ✅ Allow | ✅ Allow |

**Evidence**: `MODULE_SECURITY_LAWS.md` Section 3.2, `MODULE_SCOPE_LOCK.md` Section 2.2

---

## 3) Permission Summary by Role

### 3.1 platform_admin

**Allowed**:

- **Organizations**: Read/Write (create, suspend, unsuspend, list, retrieve)
- **Org Mappings**: Read/Write (link, list, retrieve)
- **Internal Users**: Read/Write (create, deactivate, list, retrieve)
- **Audit Logs**: Read (list, filter)

**Denied**: None (full access to all platform-admin features)

**Evidence**: `MODULE_SECURITY_LAWS.md` Section 3.2

---

### 3.2 developer_ops

**Allowed**:

- **Organizations**: Read/Write (create, suspend, unsuspend, list, retrieve)
- **Org Mappings**: Read/Write (link, list, retrieve)
- **Internal Users**: Read-only (list, retrieve)
- **Audit Logs**: Read (list, filter)

**Denied**:

- Internal user creation
- Internal user deactivation

**Evidence**: `MODULE_SECURITY_LAWS.md` Section 3.2

---

### 3.3 support

**Allowed**:

- **Organizations**: Read-only (list, retrieve)
- **Org Mappings**: Read-only (list, retrieve)
- **Internal Users**: Read-only (list, retrieve)
- **Audit Logs**: Read (list, filter)

**Denied**:

- All write operations (create, update, suspend, unsuspend, deactivate, link)

**Evidence**: `MODULE_SECURITY_LAWS.md` Section 3.2

---

### 3.4 viewer

**Allowed**:

- **Organizations**: Read-only (list, retrieve)
- **Org Mappings**: Read-only (list, retrieve)
- **Internal Users**: Read-only (list, retrieve)
- **Audit Logs**: Read (list, filter)

**Denied**:

- All write operations (create, update, suspend, unsuspend, deactivate, link)

**Evidence**: `MODULE_SECURITY_LAWS.md` Section 3.2

> [!NOTE]
> `support` and `viewer` roles have identical permissions in MVP v1.0. Future differentiation is planned for v2+.

---

## 4) Enforcement Rules

### 4.1 Deny-by-Default

**Rule**: All endpoints deny access by default unless explicitly allowed in this matrix.

**Evidence**: `MODULE_SECURITY_LAWS.md` Section 3.1 (Authentication & Authorization)

---

### 4.2 Write Operations

**Rule**: All write operations (POST, PATCH, DELETE) are denied unless:

1. User is authenticated
2. User role is explicitly allowed in matrix
3. RBAC check passes

**Evidence**: `IMPLEMENTATION_PLAN_PLATFORM_ADMIN.md` Section 5.3 (Fail-Closed Checkpoints)

---

### 4.3 Read Operations

**Rule**: All read operations (GET) are denied unless:

1. User is authenticated
2. User role is explicitly allowed in matrix

**Evidence**: `MODULE_SECURITY_LAWS.md` Section 3.1

---

### 4.4 Missing Role

**Rule**: If user role is missing or invalid → Deny access, return 401 Unauthorized

**Evidence**: `MODULE_SECURITY_LAWS.md` Section 5 (Fail-Closed Enforcement)

---

### 4.5 Role Mismatch

**Rule**: If user role exists but is not allowed for endpoint → Deny access, return 403 Forbidden, log attempt

**Evidence**: `IMPLEMENTATION_PLAN_PLATFORM_ADMIN.md` Section 5.3 (Checkpoint 2: RBAC)

---

## 5) Non-Goals

The following are **NOT** part of the RBAC model:

❌ **Dynamic Permissions**: No runtime permission calculation  
❌ **Permission Inference**: No implicit allow based on role hierarchy  
❌ **Granular Permissions**: No per-field or per-resource permissions beyond role-based matrix  
❌ **Customer-Facing Roles**: No roles for end-users (only internal operators)  
❌ **External Identity Providers**: No SSO or SAML integration (deferred to v2)

**Evidence**: `MODULE_SCOPE_LOCK.md` Section 2.5 (RBAC Roles — Locked)

---

## 6) Signature

**Approved By**: Governance Authority  
**Date**: 2026-02-07  
**Status**: DRAFT — DOCS-ONLY
