# Authorization Stop Rules — platform-admin

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Module Name    | platform-admin                          |
| Document Title | AUTHORIZATION_STOP_RULES                |
| Repo           | Suite (Layer / Product Repo)            |
| Status         | DRAFT — DOCS-ONLY                       |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-02-07                              |

---

## 1) Purpose

This document defines **explicit STOP rules** for authorization violations in the `platform-admin` module.

Execution MUST STOP IMMEDIATELY if any of these rules are violated.

**Evidence**: `MODULE_SECURITY_LAWS.md` Section 7 (Stop Rules)

---

## 2) Authorization STOP Rules

### STOP Rule 1: Missing Role

**Condition**: User authentication succeeds but role claim is missing from token

**Action**: STOP → Deny access → Return 401 Unauthorized → Log violation

**Evidence**: `MODULE_SECURITY_LAWS.md` Section 5 (Fail-Closed Enforcement)

---

### STOP Rule 2: Invalid Role

**Condition**: User role is not one of: `platform_admin`, `developer_ops`, `support`, `viewer`

**Action**: STOP → Deny access → Return 403 Forbidden → Log violation

**Evidence**: `MODULE_SCOPE_LOCK.md` Section 2.5 (RBAC Roles — Locked)

---

### STOP Rule 3: Role Mismatch

**Condition**: User role exists but is not allowed for the requested endpoint/action per RBAC matrix

**Action**: STOP → Deny access → Return 403 Forbidden → Log attempt

**Evidence**: `RBAC_SCOPE_MATRIX.md` Section 4.5 (Role Mismatch)

---

### STOP Rule 4: Write Without Explicit Allow

**Condition**: Write operation (POST, PATCH, DELETE) attempted without explicit Allow in RBAC matrix

**Action**: STOP → Deny access → Return 403 Forbidden → Log attempt

**Evidence**: `RBAC_SCOPE_MATRIX.md` Section 4.2 (Write Operations)

---

### STOP Rule 5: Fallback Logic

**Condition**: Authorization logic contains fallback or default-allow behavior (e.g., `if (role) { allow } else { allow }`)

**Action**: STOP → Code review failure → Reject implementation

**Evidence**: `MODULE_SECURITY_LAWS.md` Section 3.1 (Deny-by-default authorization)

---

### STOP Rule 6: Ambiguous Permission

**Condition**: Permission check logic is ambiguous or relies on inference (e.g., "admin-like roles get access")

**Action**: STOP → Code review failure → Reject implementation

**Evidence**: `RBAC_SCOPE_MATRIX.md` Section 1 (No implicit allow)

---

### STOP Rule 7: Fail-Open Behavior

**Condition**: Authorization check fails but request proceeds anyway (e.g., catch block allows access)

**Action**: STOP → Code review failure → Reject implementation

**Evidence**: `MODULE_SECURITY_LAWS.md` Section 5 (Fail-Closed Enforcement)

---

### STOP Rule 8: RBAC Bypass

**Condition**: Endpoint accessible without RBAC check (e.g., missing guard, decorator not applied)

**Action**: STOP → Code review failure → Reject implementation

**Evidence**: `MODULE_SECURITY_LAWS.md` Section 7 (Stop Rules)

---

### STOP Rule 9: Deactivated User Access

**Condition**: User with `status: deactivated` attempts to access any endpoint

**Action**: STOP → Deny access → Return 401 Unauthorized → Log attempt

**Evidence**: `IMPLEMENTATION_PLAN_PLATFORM_ADMIN.md` Section 4.3 (Operators & RBAC)

---

### STOP Rule 10: Missing Authentication

**Condition**: Request to any `/api/platform-admin/*` endpoint without valid authentication token

**Action**: STOP → Deny access → Return 401 Unauthorized

**Evidence**: `MODULE_SECURITY_LAWS.md` Section 3.1 (Authentication & Authorization)

---

### STOP Rule 11: Dynamic Role Creation

**Condition**: Code attempts to create, infer, or calculate roles beyond the locked set of 4 roles

**Action**: STOP → Code review failure → Reject implementation

**Evidence**: `MODULE_SCOPE_LOCK.md` Section 2.5 (MUST implement ONLY these roles)

---

### STOP Rule 12: Permission Inference

**Condition**: Code attempts to infer permissions based on role hierarchy or role name patterns

**Action**: STOP → Code review failure → Reject implementation

**Evidence**: `RBAC_SCOPE_MATRIX.md` Section 5 (Non-Goals — No permission inference)

---

## 3) Enforcement Checkpoints

### Checkpoint 1: Authentication

**Location**: Every BFF request entry point

**Check**: Valid Suite UI token present and verified

**Failure**: STOP Rule 10 (Missing Authentication)

**Evidence**: `IMPLEMENTATION_PLAN_PLATFORM_ADMIN.md` Section 5.3 (Checkpoint 1: Authentication)

---

### Checkpoint 2: RBAC

**Location**: Every write operation, before business logic execution

**Check**: User role explicitly allowed in RBAC matrix for endpoint/action

**Failure**: STOP Rule 3 (Role Mismatch) or STOP Rule 4 (Write Without Explicit Allow)

**Evidence**: `IMPLEMENTATION_PLAN_PLATFORM_ADMIN.md` Section 5.3 (Checkpoint 2: RBAC)

---

### Checkpoint 3: User Status

**Location**: After authentication, before RBAC check

**Check**: User status is `active` (not `deactivated`)

**Failure**: STOP Rule 9 (Deactivated User Access)

**Evidence**: `IMPLEMENTATION_PLAN_PLATFORM_ADMIN.md` Section 4.3 (Fail-Closed Rules)

---

## 4) Audit Requirements

### 4.1 Authorization Violations

**MUST log** to `PlatformAdminAuditLog`:

- STOP Rule 2 (Invalid Role)
- STOP Rule 3 (Role Mismatch)
- STOP Rule 4 (Write Without Explicit Allow)
- STOP Rule 9 (Deactivated User Access)

**Log Fields**:

- `correlationId`: Request correlation ID
- `entityType`: `authorization_violation`
- `action`: `deny_access`
- `performedBy`: User ID (if available)
- `performedAt`: Timestamp
- `result`: `failure`
- `metadata`: `{ "rule": "STOP_RULE_X", "endpoint": "...", "role": "...", "reason": "..." }`

**Evidence**: `MODULE_SECURITY_LAWS.md` Section 3.4 (Audit Log Integrity)

---

### 4.2 Code Review Violations

**MUST reject** during code review:

- STOP Rule 5 (Fallback Logic)
- STOP Rule 6 (Ambiguous Permission)
- STOP Rule 7 (Fail-Open Behavior)
- STOP Rule 8 (RBAC Bypass)
- STOP Rule 11 (Dynamic Role Creation)
- STOP Rule 12 (Permission Inference)

**Action**: Reject PR, request remediation, document violation in review comments

**Evidence**: `MODULE_SECURITY_LAWS.md` Section 7 (Stop Rules)

---

## 5) Relationship to Fail-Closed Matrix

All STOP rules enforce the **deny-by-default** model:

- **Default State**: Deny access
- **Allow Condition**: Explicit match in RBAC matrix
- **Failure Mode**: Deny access (never allow)

**Evidence**: `MODULE_SECURITY_LAWS.md` Section 3.1 (Deny-by-default authorization)

---

## 6) Non-Goals

The following are **NOT** covered by authorization STOP rules:

❌ **Business Logic Errors**: Validation failures, data integrity errors (separate concern)  
❌ **Core Integration Failures**: Core API errors, timeout, circuit breaker (separate concern)  
❌ **Org Mapping Failures**: Missing/ambiguous mapping (covered by separate STOP rules)  
❌ **Audit Log Failures**: Audit write failures (covered by separate STOP rules)

**Evidence**: `IMPLEMENTATION_PLAN_PLATFORM_ADMIN.md` Section 5.3 (Fail-Closed Checkpoints)

---

## 7) Signature

**Approved By**: Governance Authority  
**Date**: 2026-02-07  
**Status**: DRAFT — DOCS-ONLY
