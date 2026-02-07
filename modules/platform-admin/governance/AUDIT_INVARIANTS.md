# Audit Invariants — platform-admin

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Module Name    | platform-admin                          |
| Document Title | AUDIT_INVARIANTS                        |
| Repo           | Suite (Layer / Product Repo)            |
| Status         | DRAFT — DOCS-ONLY                       |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-02-07                              |

---

## 1) Purpose

This document defines **immutable audit invariants** for the platform-admin module.

These invariants are binding and MUST be enforced in all audit implementations.

**Evidence**: `MODULE_SECURITY_LAWS.md` Section 3.4 (Audit Log Integrity)

---

## 2) Core Invariants

### Invariant 1: Append-Only

**MUST**: Audit logs are append-only (write-only)

**MUST NOT**: Update or delete audit records

**MUST NOT**: Provide update or delete endpoints for audit logs

**Evidence**: `MODULE_SECURITY_LAWS.md` Section 3.4

---

### Invariant 2: Immutable Records

**MUST**: Audit records are immutable after creation

**MUST NOT**: Modify audit record fields after write

**MUST**: Use database constraints to enforce immutability (if supported)

**Evidence**: `MODULE_SECURITY_LAWS.md` Section 3.4

---

### Invariant 3: Required Fields

**MUST**: Every audit record includes:

- `correlationId` (request trace identifier)
- `entityType` (resource type: organization, org_mapping, internal_user, authorization_violation)
- `entityId` (resource identifier or user ID)
- `action` (operation: create, update, suspend, unsuspend, link, deactivate, deny_access)
- `performedBy` (user ID or "system")
- `performedAt` (ISO 8601 timestamp)
- `result` (success | failure)
- `metadata` (JSON object with additional context)

**Evidence**: `AUTHORIZATION_STOP_RULES.md` Section 4.1

---

### Invariant 4: No Secrets

**MUST NOT**: Store in audit logs:

- JWT tokens (Suite or Core)
- Passwords or password hashes
- API keys or secrets
- Database connection strings or credentials
- Raw stack traces containing secrets
- Full request bodies (may contain tokens)
- Message content (may contain PII)

**Evidence**: `MODULE_SECURITY_LAWS.md` Section 3.4 + Section 3.5 (JWT Protection)

---

### Invariant 5: Minimal PII

**MUST**: Minimize PII in audit logs

**MUST**: Store user IDs (opaque identifiers) instead of names/emails

**MUST**: Use hashes for sensitive identifiers (if binding allows; else NOT AVAILABLE)

**Evidence**: `SECURITY_BASELINE.md`

---

## 3) Failure Handling

### Invariant 6: Fail-Closed for Security Decisions

**MUST**: If audit log creation fails during authorization violation, access MUST still be denied

**MUST NOT**: Allow access if audit write fails

**Rationale**: Audit is for traceability, not authorization enforcement

**Evidence**: `ARCHITECTURAL_LAWS.md` LAW-10 (Fail-Closed By Default)

---

### Invariant 7: Safe Error Messages

**MUST**: If audit write fails, do NOT expose failure details to client

**MUST**: Return safe error message (e.g., "Internal Server Error")

**MUST**: Log audit failure server-side (safe, no secrets)

**Evidence**: `SECURITY_BASELINE.md`

---

### Invariant 8: Best-Effort Audit for Non-Security Operations

**MUST**: For administrative actions (create org, suspend org), audit write failure MUST fail the operation

**Rationale**: Administrative actions require traceability

**Evidence**: `MODULE_SECURITY_LAWS.md` Section 3.4

---

## 4) Authorization Violation Audit

### Invariant 9: RBAC Violations MUST Be Audited

**MUST**: Audit authorization violations for:

- STOP Rule 2 (Invalid Role)
- STOP Rule 3 (Role Mismatch)
- STOP Rule 4 (Write Without Explicit Allow)
- STOP Rule 9 (Deactivated User Access)

**MUST**: Include in metadata:

- `rule` (STOP_RULE_X)
- `endpoint` (HTTP method + path)
- `role` (user role if available)
- `reason` (generic description, no secrets)

**Evidence**: `AUTHORIZATION_STOP_RULES.md` Section 4.1

---

### Invariant 10: Audit Failure Does Not Prevent Denial

**MUST**: If audit write fails during authorization violation, access MUST still be denied

**MUST NOT**: Fail-open due to audit failure

**Evidence**: `ARCHITECTURAL_LAWS.md` LAW-10 (Fail-Closed By Default)

---

## 5) Correlation ID Propagation

### Invariant 11: Correlation ID Required

**MUST**: Every audit record includes a valid correlationId

**MUST**: Use correlationId from request header `x-correlation-id` (if present)

**MUST**: Generate server-side correlationId if header missing

**Evidence**: `CORRELATION_ID_POLICY.md` Section 3

---

### Invariant 12: Correlation ID Consistency

**MUST**: Use the same correlationId across all audit events for a single request

**MUST NOT**: Generate multiple correlationIds for the same request

**Evidence**: `CORRELATION_ID_POLICY.md` Section 4

---

## 6) Metadata Rules

### Invariant 13: Metadata is JSON

**MUST**: Store metadata as JSON object

**MUST**: Use flat key-value structure (no deep nesting)

**MUST**: Limit metadata size (implementation-defined, e.g., 4KB)

**Evidence**: `AUTHORIZATION_STOP_RULES.md` Section 4.1

---

### Invariant 14: Allowed Metadata Keys

**MUST**: Use only safe metadata keys:

- `rule` (STOP rule identifier)
- `endpoint` (HTTP method + path)
- `method` (HTTP method)
- `role` (user role)
- `resource` (RBAC resource)
- `requiredAction` (RBAC action)
- `reason` (generic description)
- `coreOrgId` (Core organization ID)
- `suiteOrgId` (Suite organization ID)

**MUST NOT**: Include in metadata:

- `token`, `jwt`, `authorization`
- `password`, `secret`, `apiKey`
- `dbUrl`, `connectionString`
- `stackTrace` (if contains secrets)

**Evidence**: `MODULE_SECURITY_LAWS.md` Section 3.4

---

## 7) Read Access Control

### Invariant 15: Read-Only Audit Viewer

**MUST**: Provide read-only audit log viewer UI

**MUST**: Enforce RBAC for audit log reads (all roles have READ permission)

**MUST NOT**: Provide update or delete operations

**Evidence**: `MODULE_SECURITY_LAWS.md` Section 3.2 (RBAC Enforcement)

---

### Invariant 16: No Analysis in Module

**MUST NOT**: Perform audit log analysis or alerting in platform-admin module

**Rationale**: Audit analysis is out-of-scope for platform-admin

**Evidence**: `MODULE_SCOPE_LOCK.md`

---

## 8) Retention Policy

### Invariant 17: Indefinite Retention

**MUST**: Retain audit logs indefinitely (no automatic deletion)

**MUST**: Enforce retention via database constraints or application logic

**Evidence**: `IMPLEMENTATION_PLAN_PLATFORM_ADMIN.md` Section 2.1 (Audit Logging)

---

## 9) Signature

**Approved By**: Governance Authority  
**Date**: 2026-02-07  
**Status**: DRAFT — DOCS-ONLY
