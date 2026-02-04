# Module Security Laws — platform-admin

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Module Name    | platform-admin                          |
| Document Title | MODULE_SECURITY_LAWS                    |
| Repo           | Suite (Layer / Product Repo)            |
| Status         | FINAL — CORE V1 ALIGNED                 |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-02-04                              |

---

## 1) Purpose

This document establishes module-specific security laws for `platform-admin`. These laws are binding and complement the repo-level governance.

**Evidence**: `ARCHITECTURAL_LAWS.md` LAW-10 (Fail-Closed By Default)

---

## 2) Threat Model

**SUITE-ONLY**

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
- JWT leakage
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

**SUITE-ONLY**

**MUST**: Authenticate and authorize every platform-admin endpoint.

**MUST**: Deny-by-default authorization.

**MUST NOT**: Allow unauthenticated access.

**Evidence**: `ARCHITECTURAL_LAWS.md` LAW-10 (Fail-Closed By Default)

---

### 3.2 RBAC Enforcement

**SUITE-ONLY**

| Role           | Organizations | Org Mappings | Internal Users | Audit Logs |
| -------------- | ------------- | ------------ | -------------- | ---------- |
| platform_admin | Read/Write    | Read/Write   | Read/Write     | Read       |
| developer_ops  | Read/Write    | Read/Write   | Read-only      | Read       |
| support        | Read-only     | Read-only    | Read-only      | Read       |
| viewer         | Read-only     | Read-only    | Read-only      | Read       |

**MUST**: Enforce these permissions on every endpoint.

---

### 3.3 Tenant Isolation

**SUITE-ONLY**

**MUST**: Validate coreOrgId exists in Core before creating mapping.

**MUST**: Fail-closed if validation fails.

**MUST**: Prevent duplicate and ambiguous mappings.

**Evidence**: `ARCHITECTURAL_LAWS.md` LAW-7 (Tenant Boundary — Org Alignment Only)

---

### 3.4 Audit Log Integrity

**SUITE-ONLY**

**MUST**: Create immutable audit log for every administrative action.

**MUST**: Append-only (no updates or deletes).

**MUST**: Include correlationId, entityType, entityId, action, performedBy, performedAt, metadata.

**MUST NOT**: Store secrets in audit logs.

---

### 3.5 JWT Protection

**CONFIRMED (Core v1)**

Core uses JWT-based authentication for user-scoped operations.

**Evidence**: `CORE_V1_INTEGRATION_LOCK.md` Section 3.2

---

**SUITE-ONLY** — JWT Handling:

**MUST**: Forward validated Core JWT as-is to Core.

**MUST NOT**: Store JWT in Suite DB or logs.

**MUST NOT**: Expose JWT to UI.

**MUST NOT**: Mint or construct Core JWTs.

**Evidence**: `ARCHITECTURAL_LAWS.md` LAW-5 (Token & Identity Separation)

---

**NOT AVAILABLE** (Core v1):

Service-to-Service Authentication is NOT supported by Core v1.

**Evidence**: `CORE_V1_INTEGRATION_LOCK.md` Section 5.1

---

## 4) Security Controls

### 4.1 Input Validation

**SUITE-ONLY**

**MUST**: Validate all inputs (org name, email, role, IDs).

**MUST**: Reject invalid inputs with safe errors.

**MUST**: Sanitize inputs before DB/API calls.

---

### 4.2 Output Shaping

**SUITE-ONLY**

**MUST**: Shape responses to expose only necessary data.

**MUST NOT**: Expose raw Core responses or internal errors.

---

### 4.3 Rate Limiting

**SUITE-ONLY**

**MUST**: Implement rate limiting.

**Limits**: To be defined during testing and finalized before Gate 5.

> [!NOTE]
> Specific rate limit values are DEFERRED per `MODULE_EXECUTION_AUTHORIZATION.md` Section 5.

---

### 4.4 Session Management

**SUITE-ONLY**

**MUST**: Expire sessions after inactivity and absolute timeout.

**Timeouts**: Inactivity 30 min, Absolute 8 hours (finalized values).

> [!NOTE]
> Session transport/storage mechanism (cookies, tokens, etc.) is an implementation detail to be defined during UI design.

---

### 4.5 Secrets Management

**SUITE-ONLY**

**MUST**: Store credentials in env vars or secret store.

**MUST NOT**: Hardcode or commit credentials.

---

## 5) Fail-Closed Enforcement

**SUITE-ONLY**

- Missing/invalid role → Deny, return "Unauthorized"
- Missing org mapping → Deny, return safe error
- Core validation failure → Deny mapping creation
- Audit log write failure → Rollback action, alert

**Evidence**: `ARCHITECTURAL_LAWS.md` LAW-10 (Fail-Closed By Default)

---

## 6) Security Testing Requirements

**SUITE-ONLY**

**Unit Tests**: RBAC, input validation, fail-closed, audit logs.

**Integration Tests**: BFF→Core with valid/invalid JWTs, org mapping validation, correlation IDs.

**Security Tests**: IDOR, privilege escalation, injection, rate limiting, JWT protection, audit immutability.

---

## 7) Stop Rules

**SUITE-ONLY**

STOP if: Core JWT in UI/logs, audit log deleted, RBAC bypassed, mapping without validation, fail-open behavior, hardcoded secrets, ignored security test failures, JWT minting/constructing.

---

## 8) Acceptance Criteria

This security laws document is ACTIVE and BINDING when:

- [x] Threat model documented
- [x] Security invariants explicit
- [x] RBAC matrix defined
- [x] Input/output controls documented
- [x] Rate limiting defined
- [x] Session management defined
- [x] Secrets management documented
- [x] Fail-closed rules explicit
- [x] Security testing requirements defined
- [x] Stop rules explicit
- [x] All CONFIRMED claims have evidence links
- [x] Service-to-service auth marked NOT AVAILABLE (Core v1)

---

## 9) Signature

**Approved By**: Governance Authority  
**Date**: 2026-02-04  
**Status**: FINAL — CORE V1 ALIGNED
