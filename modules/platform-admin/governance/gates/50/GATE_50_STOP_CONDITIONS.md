# Gate 50 — Stop Conditions

## BFF → Core JWT Forwarding (Server-Side Only)

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Gate Number    | 50                                      |
| Gate Name      | BFF → Core JWT Forwarding               |
| Document Title | GATE_50_STOP_CONDITIONS                 |
| Repo           | Suite (Layer / Product Repo)            |
| Module         | platform-admin                          |
| Status         | FINAL — STOP CONDITIONS (50B)           |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-02-12                              |

---

## Hard Stop List (Gate 50B Execution)

Execution MUST STOP IMMEDIATELY if ANY of the following occurs:

### SC-1: Dependency Drift

**Condition**: Any modification to `package.json` or `package-lock.json`

**Rationale**: Gate 50 does NOT authorize dependency changes. All required dependencies already exist.

**Action**: HALT, revert changes, escalate to Governance Authority

---

### SC-2: Scope Drift Outside Allowlist

**Condition**: Any file created or modified outside the allowed paths (see GATE_50_AUTHORIZATION.md Section 2)

**Rationale**: Fail-closed execution requires strict file allowlist adherence

**Action**: HALT, revert changes, escalate to Governance Authority

---

### SC-3: Core Touch

**Condition**: Any modification to Bassan.os Core files or attempt to call Core endpoints not in INTEGRATION_CONTRACT_CORE.md

**Rationale**: Core is immutable (ARCHITECTURAL_LAWS.md LAW-2)

**Action**: HALT, revert changes, escalate to Governance Authority

---

### SC-4: UI Exposure of Core JWT

**Condition**: Core JWT stored in browser (cookies, localStorage, sessionStorage) or exposed to UI code (response body, headers)

**Rationale**: Core JWT MUST be server-only (SECURITY_BASELINE.md 3.3, INTEGRATION_CONTRACT_CORE.md 5.2)

**Action**: HALT, revert changes, escalate to Governance Authority

---

### SC-5: Refresh Token Implementation

**Condition**: Any implementation of refresh tokens or token refresh mechanism

**Rationale**: NOT AVAILABLE in Core v1 (INTEGRATION_CONTRACT_CORE.md 5.1)

**Action**: HALT, revert changes, escalate to Governance Authority

---

### SC-6: Service Token Implementation

**Condition**: Any implementation of service-to-service authentication or Core service tokens

**Rationale**: NOT AVAILABLE in Core v1 (INTEGRATION_CONTRACT_CORE.md 5.1)

**Action**: HALT, revert changes, escalate to Governance Authority

---

### SC-7: Retry on 401/403

**Condition**: Any retry logic on 401/403 responses from Core

**Examples**:

- `if (response.status === 401) { retry(); }`
- Exponential backoff on auth failures
- Automatic token refresh attempt on 401

**Rationale**: Forbidden by INTEGRATION_CONTRACT_CORE.md 5.1 line 137 ("401/403 from Core: DENY immediately (fail-closed). No retry. No refresh.")

**Action**: HALT, revert changes, escalate to Governance Authority

---

### SC-8: Token Logging

**Condition**: Core JWT value logged in application logs

**Examples**:

- `logger.log('JWT:', coreJwt)`
- `logger.log('Authorization header:', authHeader)`
- Logging full request headers containing JWT

**Rationale**: Forbidden by SECURITY_BASELINE.md 4.7, INTEGRATION_CONTRACT_CORE.md 5.2

**Action**: HALT, revert changes, escalate to Governance Authority

---

### SC-9: Weakening Fail-Closed (401/403 Not Enforced)

**Condition**: 401/403 from Core does NOT result in immediate 401/403 to UI

**Examples**:

- Returning 200 OK with empty data instead of 401
- Allowing access despite Core auth failure
- Defaulting to "allow" on validation failure

**Rationale**: Fail-closed requires explicit denial on auth failure (INTEGRATION_CONTRACT_CORE.md 5.1)

**Action**: HALT, revert changes, escalate to Governance Authority

---

### SC-10: Correlation ID Removal

**Condition**: Existing correlation ID logic removed or not propagated to Core API calls

**Rationale**: Correlation ID is required for debugging (INTEGRATION_CONTRACT_CORE.md 8.1)

**Action**: HALT, revert changes, escalate to Governance Authority

---

### SC-11: Silent Fallback on Auth Failures

**Condition**: Any silent fallback behavior on missing/invalid Core JWT

**Examples**:

- Proceeding without JWT if missing
- Using default/placeholder JWT
- Skipping Core validation if JWT unavailable

**Rationale**: Fail-closed prohibits silent fallbacks (ARCHITECTURAL_LAWS.md LAW-10)

**Action**: HALT, revert changes, escalate to Governance Authority

---

### SC-12: Exposing Internal Error Details

**Condition**: Error messages returned to UI contain Core JWT, stack traces, or internal paths

**Examples**:

- Returning full exception stack trace to UI
- Exposing Core API error details
- Revealing JWT in error messages

**Rationale**: Safe error messages required (SECURITY_BASELINE.md 5.3, INTEGRATION_CONTRACT_CORE.md 5.2)

**Action**: HALT, revert changes, escalate to Governance Authority

---

## Escalation Protocol

**On ANY stop condition trigger**:

1. **HALT** all work immediately
2. **DOCUMENT** violation:
   - Stop condition ID (e.g., SC-7)
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
**Status**: FINAL — STOP CONDITIONS (50B)
