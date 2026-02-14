# Audit STOP Rules — platform-admin

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Module Name    | platform-admin                          |
| Document Title | AUDIT_STOP_RULES                        |
| Repo           | Suite (Layer / Product Repo)            |
| Status         | DRAFT — DOCS-ONLY                       |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-02-07                              |

---

## 1) Purpose

This document defines **explicit STOP rules** for audit and traceability violations in the `platform-admin` module.

Execution MUST STOP IMMEDIATELY if any of these rules are violated.

**Evidence**: `MODULE_SECURITY_LAWS.md` Section 3.4 (Audit Log Integrity)

---

## 2) Audit STOP Rules

### STOP Rule 1: Missing Correlation ID

**Trigger**: Correlation ID is missing when required for audit log creation

**Expected Behavior**:

- STOP → Reject operation → Return 500 Internal Server Error (safe message)
- Do NOT proceed without correlationId (fail-closed for traceability)

**Evidence**: `CORRELATION_ID_POLICY.md` Section 5.2

---

### STOP Rule 2: Audit Write Skipped Silently

**Trigger**: Code path skips audit log creation without explicit justification

**Expected Behavior**:

- STOP → Code review failure → Reject implementation
- All administrative actions MUST create audit logs

**Evidence**: `MODULE_SECURITY_LAWS.md` Section 3.4

---

### STOP Rule 3: Audit Schema Missing Required Fields

**Trigger**: Audit record created without required fields (correlationId, entityType, action, performedBy, result)

**Expected Behavior**:

- STOP → Database constraint violation → Fail operation
- Do NOT create incomplete audit records

**Evidence**: `AUDIT_INVARIANTS.md` Invariant 3

---

### STOP Rule 4: Audit Payload Contains Forbidden Data

**Trigger**: Audit record contains secrets, tokens, passwords, or PII

**Expected Behavior**:

- STOP → Code review failure → Reject implementation
- Audit logs MUST NOT store forbidden content

**Evidence**: `AUDIT_INVARIANTS.md` Invariant 4

---

### STOP Rule 5: Fail-Open Due to Audit Failure

**Trigger**: Authorization violation occurs, audit write fails, but access is granted anyway

**Expected Behavior**:

- STOP → Code review failure → Reject implementation
- Access MUST be denied even if audit fails (fail-closed)

**Evidence**: `AUDIT_INVARIANTS.md` Invariant 10

---

### STOP Rule 6: Correlation ID Mismatch Across Layers

**Trigger**: Different correlationIds used for the same request across controller → service → audit

**Expected Behavior**:

- STOP → Code review failure → Reject implementation
- CorrelationId MUST be consistent across all layers

**Evidence**: `AUDIT_INVARIANTS.md` Invariant 12

---

### STOP Rule 7: Audit Record Update or Delete

**Trigger**: Code attempts to update or delete audit records

**Expected Behavior**:

- STOP → Code review failure → Reject implementation
- Audit logs are append-only and immutable

**Evidence**: `AUDIT_INVARIANTS.md` Invariant 1 + Invariant 2

---

### STOP Rule 8: Authorization Violation Not Audited

**Trigger**: RBAC violation (STOP Rule 2/3/4/9) occurs but no audit log created

**Expected Behavior**:

- STOP → Code review failure → Reject implementation
- Authorization violations MUST be audited (best-effort)

**Evidence**: `AUTHORIZATION_STOP_RULES.md` Section 4.1

---

### STOP Rule 9: Audit Failure Leaks Details to Client

**Trigger**: Audit write failure exposes internal error details in HTTP response

**Expected Behavior**:

- STOP → Code review failure → Reject implementation
- Error messages MUST be safe (no secrets, no stack traces)

**Evidence**: `AUDIT_INVARIANTS.md` Invariant 7

---

### STOP Rule 10: Metadata Contains Secrets

**Trigger**: Audit metadata includes forbidden keys (token, password, secret, dbUrl)

**Expected Behavior**:

- STOP → Code review failure → Reject implementation
- Metadata MUST use only allowed keys

**Evidence**: `AUDIT_INVARIANTS.md` Invariant 14

---

### STOP Rule 11: Administrative Action Without Audit

**Trigger**: Administrative action (create org, suspend org, deactivate user) completes without audit log

**Expected Behavior**:

- STOP → Fail operation → Return error
- Administrative actions MUST create audit logs (fail-closed)

**Evidence**: `AUDIT_INVARIANTS.md` Invariant 8

---

### STOP Rule 12: Correlation ID Contains Secrets or PII

**Trigger**: Correlation ID includes tokens, passwords, user emails, or other sensitive data

**Expected Behavior**:

- STOP → Reject request → Return 400 Bad Request
- CorrelationId MUST be opaque and safe

**Evidence**: `CORRELATION_ID_POLICY.md` Section 6.2

---

## 3) Enforcement Checkpoints

### Checkpoint 1: Request Entry

**Location**: Controller entry point (before business logic)

**Check**: CorrelationId present and valid

**Failure**: STOP Rule 1 (Missing Correlation ID) or STOP Rule 12 (Secrets in CorrelationId)

**Evidence**: `CORRELATION_ID_POLICY.md` Section 3

---

### Checkpoint 2: Audit Write

**Location**: Before committing administrative action

**Check**: Audit record created with all required fields

**Failure**: STOP Rule 3 (Missing Required Fields) or STOP Rule 11 (Administrative Action Without Audit)

**Evidence**: `AUDIT_INVARIANTS.md` Invariant 3

---

### Checkpoint 3: Authorization Violation

**Location**: RBAC guard denial path

**Check**: Audit log created for STOP Rule 2/3/4/9 violations

**Failure**: STOP Rule 8 (Authorization Violation Not Audited)

**Evidence**: `AUTHORIZATION_STOP_RULES.md` Section 4.1

---

## 4) Relationship to Authorization STOP Rules

**Cross-Reference**: `AUTHORIZATION_STOP_RULES.md`

Authorization STOP Rules that require audit logging:

- STOP Rule 2 (Invalid Role) → Audit required
- STOP Rule 3 (Role Mismatch) → Audit required
- STOP Rule 4 (Write Without Explicit Allow) → Audit required
- STOP Rule 9 (Deactivated User Access) → Audit required

**Evidence**: `AUTHORIZATION_STOP_RULES.md` Section 4.1

---

## 5) Code Review Violations

**MUST reject** during code review:

- STOP Rule 2 (Audit Write Skipped Silently)
- STOP Rule 4 (Audit Payload Contains Forbidden Data)
- STOP Rule 5 (Fail-Open Due to Audit Failure)
- STOP Rule 6 (Correlation ID Mismatch Across Layers)
- STOP Rule 7 (Audit Record Update or Delete)
- STOP Rule 8 (Authorization Violation Not Audited)
- STOP Rule 9 (Audit Failure Leaks Details to Client)
- STOP Rule 10 (Metadata Contains Secrets)

**Action**: Reject PR, request remediation, document violation in review comments

**Evidence**: `MODULE_SECURITY_LAWS.md` Section 7 (Stop Rules)

---

## 6) Runtime Violations

**MUST fail** at runtime:

- STOP Rule 1 (Missing Correlation ID)
- STOP Rule 3 (Audit Schema Missing Required Fields)
- STOP Rule 11 (Administrative Action Without Audit)
- STOP Rule 12 (Correlation ID Contains Secrets or PII)

**Action**: Reject request, return safe error, log failure server-side

**Evidence**: `ARCHITECTURAL_LAWS.md` LAW-10 (Fail-Closed By Default)

---

## 7) Signature

**Approved By**: Governance Authority  
**Date**: 2026-02-07  
**Status**: DRAFT — DOCS-ONLY
