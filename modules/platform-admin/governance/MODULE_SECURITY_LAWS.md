# Module Security Laws — platform-admin

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Module Name    | platform-admin                          |
| Document Title | MODULE_SECURITY_LAWS                    |
| Repo           | Suite (Layer / Product Repo)            |
| Status         | FINAL — BINDING SECURITY LAWS           |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-01-26                              |

---

## 1) Purpose

This document establishes module-specific security laws for `platform-admin`. These laws are binding and complement the repo-level SECURITY_BASELINE.md.

---

## 2) Threat Model

### 2.1 Threat Actors

- External Attacker: Unauthorized access attempts
- Malicious Internal User: Privilege abuse
- Compromised Internal User: Account takeover
- Insider Threat: Data leakage

### 2.2 Attack Vectors

- Unauthorized access bypass
- Privilege escalation
- Org mapping corruption
- Audit log tampering
- Token leakage
- IDOR attacks
- Injection attacks

### 2.3 Impact Scenarios

- Tenant isolation breach
- Service disruption
- Data loss
- Compliance violation

---

## 3) Security Invariants

### 3.1 Authentication & Authorization

**MUST**: Authenticate and authorize every platform-admin endpoint.

**MUST**: Deny-by-default authorization.

**MUST NOT**: Allow unauthenticated access.

### 3.2 RBAC Enforcement

| Role           | Organizations | Org Mappings | Internal Users | Templates | Audit Logs |
| -------------- | ------------- | ------------ | -------------- | --------- | ---------- |
| platform_admin | Read/Write    | Read/Write   | Read/Write     | Publish   | Read       |
| developer_ops  | Read/Write    | Read/Write   | Read-only      | Publish   | Read       |
| support        | Read-only     | Read-only    | Read-only      | No access | Read       |
| viewer         | Read-only     | Read-only    | Read-only      | No access | Read       |

**MUST**: Enforce these permissions on every endpoint.

### 3.3 Tenant Isolation

**MUST**: Validate coreOrgId exists in Core before creating mapping.

**MUST**: Fail-closed if validation fails.

**MUST**: Prevent duplicate and ambiguous mappings.

### 3.4 Audit Log Integrity

**MUST**: Create immutable audit log for every administrative action.

**MUST**: Append-only (no updates or deletes).

**MUST**: Include correlationId, entityType, entityId, action, performedBy, performedAt, metadata.

**MUST NOT**: Store secrets in audit logs.

### 3.5 Core Service Token Protection

**MUST**: Store Core service token server-side only.

**MUST NOT**: Send token to UI, log it, or include in error messages.

**MUST**: Rotate token per Core policy (TBD).

---

## 4) Security Controls

### 4.1 Input Validation

**MUST**: Validate all inputs (org name, email, role, IDs).

**MUST**: Reject invalid inputs with safe errors.

**MUST**: Sanitize inputs before DB/API calls.

### 4.2 Output Shaping

**MUST**: Shape responses to expose only necessary data.

**MUST NOT**: Expose raw Core responses or internal errors.

### 4.3 Rate Limiting

**MUST**: Implement rate limiting.

**Limits** (TBD): Read 100/min, Write 10/min, Publish 5/min per user.

### 4.4 Session Management

**MUST**: Expire sessions after inactivity (TBD: 30 min) and absolute timeout (TBD: 8 hours).

**MUST**: Use httpOnly cookies for web.

### 4.5 Secrets Management

**MUST**: Store credentials in env vars or secret store.

**MUST NOT**: Hardcode or commit credentials.

**MUST**: Rotate Core token periodically (TBD).

---

## 5) Fail-Closed Enforcement

- Missing/invalid role → Deny, return "Unauthorized"
- Missing org mapping → Deny, return safe error
- Core validation failure → Deny mapping creation
- Audit log write failure → Rollback action, alert

---

## 6) Break-Glass Policy

**Allowed**: Update SuiteOrgMapping.coreOrgId with written justification and approval.

**Forbidden**: Delete mappings, bulk updates without approvals.

**TODO**: Define approvers and workflow.

---

## 7) Security Testing Requirements

**Unit Tests**: RBAC, input validation, fail-closed, audit logs.

**Integration Tests**: BFF→Core with valid/invalid tokens, org mapping validation, correlation IDs.

**Security Tests**: IDOR, privilege escalation, injection, rate limiting, token protection, audit immutability.

**TODO**: Define testing tools and frequency.

---

## 8) Stop Rules

STOP if: Core token in UI/logs, audit log deleted, RBAC bypassed, mapping without validation, fail-open behavior, hardcoded secrets, ignored security test failures.

---

## 9) Acceptance Criteria

- [ ] Threat model documented
- [ ] Security invariants explicit
- [ ] RBAC matrix defined
- [ ] Input/output controls documented
- [ ] Rate limiting defined
- [ ] Session management defined
- [ ] Secrets management documented
- [ ] Fail-closed rules explicit
- [ ] Break-glass policy documented
- [ ] Security testing requirements defined
- [ ] Stop rules explicit
- [ ] No contradictions with repo governance
- [ ] Governance Authority approved

---

## 10) Change Control

Changes require written justification, approval, security review, version increment, and git tag.

Forbidden: Weakening RBAC, allowing Core token in UI, removing audit immutability, fail-open behavior, disabling security tests.

---

## 11) Signature

**Approved By**: Governance Authority  
**Date**: 2026-01-26  
**Status**: FINAL — BINDING SECURITY LAWS
