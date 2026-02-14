# Gate 49 — Stop Conditions

## Suite Session Implementation (httpOnly Cookie-Based)

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Gate Number    | 49                                      |
| Gate Name      | Suite Session Implementation            |
| Document Title | GATE_49_STOP_CONDITIONS                 |
| Repo           | Suite (Layer / Product Repo)            |
| Module         | platform-admin                          |
| Status         | FINAL — STOP CONDITIONS (49B)           |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-02-12                              |

---

## Hard Stop List (Gate 49B Execution)

Execution MUST STOP IMMEDIATELY if ANY of the following occurs:

### SC-1: Dependency Drift

**Condition**: Any modification to `package.json` or `package-lock.json`

**Rationale**: Gate 49 does NOT authorize dependency changes. All required dependencies already exist.

**Action**: HALT, revert changes, escalate to Governance Authority

---

### SC-2: Scope Drift Outside Allowlist

**Condition**: Any file created or modified outside the allowed paths (see GATE_49_AUTHORIZATION.md Section 2)

**Rationale**: Fail-closed execution requires strict file allowlist adherence

**Action**: HALT, revert changes, escalate to Governance Authority

---

### SC-3: Core Touch

**Condition**: Any modification to Bassan.os Core files or attempt to call Core endpoints not in INTEGRATION_CONTRACT_CORE.md

**Rationale**: Core is immutable (ARCHITECTURAL_LAWS.md LAW-2)

**Action**: HALT, revert changes, escalate to Governance Authority

---

### SC-4: UI Exposure of Core JWT

**Condition**: Core JWT stored in browser (cookies, localStorage, sessionStorage) or exposed to UI code

**Rationale**: Core JWT MUST be server-only (SECURITY_BASELINE.md 3.3, GATE_48_DEV_AUTH_FLOW_LOCK.md Section 2.2)

**Action**: HALT, revert changes, escalate to Governance Authority

---

### SC-5: localStorage/sessionStorage Usage for Auth Secrets

**Condition**: Suite session token or any auth secret stored in localStorage or sessionStorage

**Rationale**: Forbidden by SECURITY_BASELINE.md 4.2 (line 136), GATE_48_DEV_AUTH_FLOW_LOCK.md Section 2.1

**Action**: HALT, revert changes, escalate to Governance Authority

---

### SC-6: Auth Bypass

**Condition**: Any "dev bypass", "temporary skip", or auth short-circuit implemented

**Examples**:

- `if (process.env.NODE_ENV === 'development') return true;`
- Skipping session validation in dev mode
- Hardcoded test credentials that bypass validation

**Rationale**: Fail-closed discipline prohibits auth bypasses (ARCHITECTURAL_LAWS.md LAW-10)

**Action**: HALT, revert changes, escalate to Governance Authority

---

### SC-7: Weakening of Fail-Closed (401/403 Not Enforced)

**Condition**: Invalid/missing/expired session does NOT return 401 Unauthorized

**Examples**:

- Returning 200 OK with empty data instead of 401
- Allowing access with expired session
- Defaulting to "allow" on validation failure

**Rationale**: Fail-closed requires explicit denial on auth failure (SECURITY_BASELINE.md 5.1)

**Action**: HALT, revert changes, escalate to Governance Authority

---

### SC-8: Logging Secrets/PII

**Condition**: Session IDs, passwords, cookie values, or PII logged in application logs

**Examples**:

- `logger.log('Session ID:', sessionId)`
- `logger.log('Cookie:', req.cookies)`
- `logger.log('User email:', user.email)` (without explicit approval)

**Rationale**: Forbidden by SECURITY_BASELINE.md 4.7, GATE_48_DEV_AUTH_FLOW_LOCK.md Section 6.2

**Action**: HALT, revert changes, escalate to Governance Authority

---

### SC-9: UI → Core Direct Calls

**Condition**: UI code attempts to call Core APIs directly

**Rationale**: Forbidden by ARCHITECTURAL_LAWS.md LAW-3

**Action**: HALT, revert changes, escalate to Governance Authority

---

### SC-10: Implementing Refresh Tokens

**Condition**: Any implementation of refresh tokens or token refresh mechanism

**Rationale**: NOT AVAILABLE in Core v1 (INTEGRATION_CONTRACT_CORE.md 5.1, GATE_48_DEV_AUTH_FLOW_LOCK.md Section 8)

**Action**: HALT, revert changes, escalate to Governance Authority

---

### SC-11: Implementing Service Tokens

**Condition**: Any implementation of service-to-service authentication or Core service tokens

**Rationale**: NOT AVAILABLE in Core v1 (INTEGRATION_CONTRACT_CORE.md 5.1, GATE_48_DEV_AUTH_FLOW_LOCK.md Section 8)

**Action**: HALT, revert changes, escalate to Governance Authority

---

### SC-12: CORS Wildcard Origin

**Condition**: CORS origin set to `*` (wildcard)

**Rationale**: Security risk, must restrict to specific origins (GATE_48_DEV_AUTH_FLOW_LOCK.md Section 5)

**Action**: HALT, revert changes, escalate to Governance Authority

---

### SC-13: Exposing Internal Error Details

**Condition**: Error messages returned to UI contain stack traces, internal paths, or sensitive data

**Examples**:

- Returning full exception stack trace to UI
- Exposing database query errors
- Revealing internal service names or paths

**Rationale**: Safe error messages required (SECURITY_BASELINE.md 5.3, GATE_48_DEV_AUTH_FLOW_LOCK.md Section 7.1)

**Action**: HALT, revert changes, escalate to Governance Authority

---

## Escalation Protocol

**On ANY stop condition trigger**:

1. **HALT** all work immediately
2. **DOCUMENT** violation:
   - Stop condition ID (e.g., SC-5)
   - File(s) involved
   - Timestamp
   - Correlation ID (if applicable)
3. **REVERT** changes made after violation
4. **ESCALATE** to Governance Authority
5. **WAIT** for explicit approval before resuming

**NO EXCEPTIONS**. Stop conditions are non-negotiable.

---

## Signature

**Approved By**: Governance Authority  
**Date**: 2026-02-12  
**Status**: FINAL — STOP CONDITIONS (49B)
