# Audit Event Schema — platform-admin

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Module Name    | platform-admin                          |
| Document Title | AUDIT_EVENT_SCHEMA                      |
| Repo           | Suite (Layer / Product Repo)            |
| Status         | DRAFT — DOCS-ONLY                       |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-02-07                              |

---

## 1) Purpose

This document defines the **canonical audit event schema** for the platform-admin module.

All audit log implementations MUST conform to this schema.

**Evidence**: `MODULE_SECURITY_LAWS.md` Section 3.4 (Audit Log Integrity)

---

## 2) Field Definitions

### 2.1 Required Fields

| Field           | Type      | Description                           | Example                                |
| --------------- | --------- | ------------------------------------- | -------------------------------------- |
| `id`            | UUID      | Unique audit record identifier        | `a1b2c3d4-e5f6-7890-abcd-ef1234567890` |
| `correlationId` | String    | Request trace identifier              | `550e8400-e29b-41d4-a716-446655440000` |
| `entityType`    | Enum      | Resource type (see Section 3.1)       | `organization`                         |
| `entityId`      | String    | Resource identifier or user ID        | `org-123`                              |
| `action`        | Enum      | Operation performed (see Section 3.2) | `create`                               |
| `performedBy`   | String    | User ID or "system"                   | `user-456`                             |
| `performedAt`   | Timestamp | ISO 8601 timestamp                    | `2026-02-07T02:44:00Z`                 |
| `result`        | Enum      | Outcome (see Section 3.3)             | `success`                              |
| `metadata`      | JSON      | Additional context (see Section 4)    | `{"coreOrgId": "core-789"}`            |

**Evidence**: `AUTHORIZATION_STOP_RULES.md` Section 4.1

---

### 2.2 Optional Fields

| Field       | Type      | Description                        | Example                    |
| ----------- | --------- | ---------------------------------- | -------------------------- |
| `createdAt` | Timestamp | Database record creation timestamp | `2026-02-07T02:44:00.123Z` |

---

## 3) Enumerations

### 3.1 Entity Type

**Allowed Values**:

- `organization` — Suite organization
- `org_mapping` — Suite ↔ Core organization mapping
- `internal_user` — Platform admin operator user
- `authorization_violation` — RBAC denial event

**Evidence**: `MODULE_SCOPE_LOCK.md` Section 2.2 (Endpoints)

---

### 3.2 Action Type

**Allowed Values**:

- `create` — Resource creation
- `update` — Resource modification (NOT USED for audit records)
- `suspend` — Organization suspension
- `unsuspend` — Organization unsuspension
- `link` — Org mapping creation
- `deactivate` — Internal user deactivation
- `deny_access` — Authorization violation (RBAC denial)
- `read` — Read operation (optional audit; implementation-defined)

**Evidence**: `AUTHORIZATION_STOP_RULES.md` Section 4.1

---

### 3.3 Result Type

**Allowed Values**:

- `success` — Operation completed successfully
- `failure` — Operation failed or was denied

**Evidence**: `AUTHORIZATION_STOP_RULES.md` Section 4.1

---

## 4) Metadata Object Rules

### 4.1 Structure

**Type**: JSON object (flat key-value pairs)

**Max Size**: 4KB (implementation-defined)

**Nesting**: Flat structure preferred (no deep nesting)

---

### 4.2 Allowed Metadata Keys

**For Authorization Violations**:

- `rule` (String) — STOP rule identifier (e.g., `STOP_RULE_2`)
- `endpoint` (String) — HTTP method + path (e.g., `POST /api/platform-admin/organizations`)
- `method` (String) — HTTP method (e.g., `POST`)
- `role` (String) — User role if available (e.g., `viewer`)
- `resource` (String) — RBAC resource (e.g., `organizations`)
- `requiredAction` (String) — RBAC action (e.g., `write`)
- `reason` (String) — Generic description (e.g., `Insufficient permissions`)

**For Administrative Actions**:

- `coreOrgId` (String) — Core organization ID (if applicable)
- `suiteOrgId` (String) — Suite organization ID (if applicable)
- `previousStatus` (String) — Previous resource status (e.g., `active`)
- `newStatus` (String) — New resource status (e.g., `suspended`)

**Evidence**: `AUTHORIZATION_STOP_RULES.md` Section 4.1

---

### 4.3 Forbidden Metadata Keys

**MUST NOT include**:

- `token`, `jwt`, `authorization`
- `password`, `secret`, `apiKey`
- `dbUrl`, `connectionString`
- `stackTrace` (if contains secrets)
- `requestBody` (may contain tokens)
- `responseBody` (may contain secrets)

**Evidence**: `AUDIT_INVARIANTS.md` Invariant 14

---

## 5) Example Events

### Example 1: Authorization Violation (403 Forbidden)

**Scenario**: VIEWER attempts WRITE on organizations (STOP Rule 4)

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000",
  "entityType": "authorization_violation",
  "entityId": "user-456",
  "action": "deny_access",
  "performedBy": "user-456",
  "performedAt": "2026-02-07T02:44:00Z",
  "result": "failure",
  "metadata": {
    "rule": "STOP_RULE_4",
    "endpoint": "POST /api/platform-admin/organizations",
    "method": "POST",
    "role": "viewer",
    "resource": "organizations",
    "requiredAction": "write",
    "reason": "Insufficient permissions"
  }
}
```

**Evidence**: `AUTHORIZATION_STOP_RULES.md` STOP Rule 4

---

### Example 2: Deactivated User Access (401 Unauthorized)

**Scenario**: Deactivated user attempts access (STOP Rule 9)

```json
{
  "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "correlationId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "entityType": "authorization_violation",
  "entityId": "user-789",
  "action": "deny_access",
  "performedBy": "user-789",
  "performedAt": "2026-02-07T02:45:00Z",
  "result": "failure",
  "metadata": {
    "rule": "STOP_RULE_9",
    "endpoint": "GET /api/platform-admin/organizations",
    "method": "GET",
    "role": "platform_admin",
    "reason": "User is deactivated"
  }
}
```

**Evidence**: `AUTHORIZATION_STOP_RULES.md` STOP Rule 9

---

### Example 3: Successful Organization Creation

**Scenario**: PLATFORM_ADMIN creates Suite organization

```json
{
  "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
  "correlationId": "8d0f7780-8536-51ef-a55c-f18ad2a01bf8",
  "entityType": "organization",
  "entityId": "org-123",
  "action": "create",
  "performedBy": "user-456",
  "performedAt": "2026-02-07T02:46:00Z",
  "result": "success",
  "metadata": {
    "suiteOrgId": "org-123"
  }
}
```

**Evidence**: `MODULE_SCOPE_LOCK.md` Section 2.2 (Organization Management)

---

### Example 4: Successful Org Mapping Link

**Scenario**: DEVELOPER_OPS links Suite org to Core org

```json
{
  "id": "d4e5f6a7-b8c9-0123-def1-234567890123",
  "correlationId": "9e1f8891-9647-62f0-b66d-g29be3b12cg9",
  "entityType": "org_mapping",
  "entityId": "mapping-456",
  "action": "link",
  "performedBy": "user-789",
  "performedAt": "2026-02-07T02:47:00Z",
  "result": "success",
  "metadata": {
    "suiteOrgId": "org-123",
    "coreOrgId": "core-789"
  }
}
```

**Evidence**: `MODULE_SCOPE_LOCK.md` Section 2.2 (Org Mapping Management)

---

### Example 5: Successful Read Operation (Optional Audit)

**Scenario**: VIEWER reads organizations list

```json
{
  "id": "e5f6a7b8-c9d0-1234-ef12-345678901234",
  "correlationId": "af2g9902-a758-73g1-c77e-h3acf4c23dha",
  "entityType": "organization",
  "entityId": "all",
  "action": "read",
  "performedBy": "user-101",
  "performedAt": "2026-02-07T02:48:00Z",
  "result": "success",
  "metadata": {}
}
```

**Note**: Read operation audit is optional (implementation-defined)

**Evidence**: `MODULE_SECURITY_LAWS.md` Section 3.4

---

## 6) Schema Validation

### 6.1 Database Constraints

**MUST**: Enforce required fields via NOT NULL constraints

**MUST**: Enforce enum values via CHECK constraints or application validation

**MUST**: Prevent updates/deletes via database triggers or application logic

**Evidence**: `AUDIT_INVARIANTS.md` Invariant 1 + Invariant 2

---

### 6.2 Application Validation

**MUST**: Validate correlationId format before audit write

**MUST**: Validate metadata does not contain forbidden keys

**MUST**: Validate metadata size does not exceed limit

**Evidence**: `AUDIT_STOP_RULES.md` STOP Rule 10

---

## 7) Signature

**Approved By**: Governance Authority  
**Date**: 2026-02-07  
**Status**: DRAFT — DOCS-ONLY
