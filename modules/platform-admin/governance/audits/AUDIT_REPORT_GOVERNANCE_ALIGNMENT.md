# Audit Report: Governance Alignment (Core Contract v1)

**Auditor**: Principal Software Architect & Governance Authority  
**Date**: 2026-02-02  
**Scope**: `modules/platform-admin/governance/**`  
**Reference**: Core Contract v1 Lock (`CORE_V1_INTEGRATION_LOCK.md`)  
**Status**: **FAIL — CRITICAL DRIFT DETECTED**

---

# PHASE 1 — FULL AUDIT

## 1. Executive Summary

**Verdict**: **FAIL**

The governance documentation suite is **NOT ALIGNED** with Core Contract v1. While the explicit contracts (`contracts/*.md`) and adapter specs (`INTEGRATION_ADAPTER_SPEC.md`) have been patched to align with Core v1, the foundational "Law" documents (`STACK_BOUNDARIES`, `MODULE_SECURITY_LAWS`, `FAIL_CLOSED_MATRIX`) retain "phantom" requirements for features that do not exist (Service Tokens, Token Refresh, Template Publishing). This creates a dangerous "Legislative Conflict" where complying with the Law means violating the Reality of the Core.

## 2. Global Drift Themes

| Theme                      | Category          | Violation Description                                                                                                        | Impact                                                                                                         |
| -------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| **Phantom Service Tokens** | **AUTH DRIFT**    | `STACK_BOUNDARIES` and `MODULE_SECURITY_LAWS` mandate the storage, rotation, and usage of "Core Service Tokens".             | Forces engineers to implement security controls for non-existent credentials.                                  |
| **Refresh Logic**          | **FAILURE DRIFT** | `FAIL_CLOSED_MATRIX` explicitly instructs to "Refresh Token and Retry ONCE" on 401 errors.                                   | **CRITICAL SECURITY RISK.** Violates fail-closed. Guarantees runtime loops as Core/v1 has no refresh endpoint. |
| **Deferred Features**      | **SCOPE DRIFT**   | `MODULE_DATA_OWNERSHIP` and `MODULE_SECURITY_LAWS` imply Template Publishing is an active feature with rate limits and RBAC. | Authorizes implementation of a feature explicitly DEFERRED in the contract.                                    |
| **Residual Observability** | **FAILURE DRIFT** | `CORE_FAILURE_SEMANTICS` includes logging/metrics requirements for "Token Refresh" even though the behavior is banned.       | Creates observability noise and confusing requirements.                                                        |

## 3. File-by-File Analysis

| File                                        | Status    | Drift Category   | Exact Evidence of Drift                                                                                                            |
| ------------------------------------------- | --------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `STACK_BOUNDARIES.md`                       | **DRIFT** | AUTH, FAILURE    | "Obtain Core service token independently", "Handle Core service token expiry... refresh token", "Store Core service token"         |
| `MODULE_DATA_OWNERSHIP.md`                  | **DRIFT** | TEMPLATE         | Section 3.2 Access Method: "Core API (TBD...)" (Should be DEFERRED/NONE)                                                           |
| `MODULE_SECURITY_LAWS.md`                   | **DRIFT** | AUTH, GOVERNANCE | "MUST: Rotate Core token", "Publish 5/min per user", "Secrets Management... Rotate Core token periodically"                        |
| `FAIL_CLOSED_MATRIX.md`                     | **DRIFT** | FAILURE, REFRESH | "If Core service token is expired, BFF MAY refresh token and retry ONCE", "Publish Predefined Template... with Core service token" |
| `contracts/CORE_FAILURE_SEMANTICS.md`       | **DRIFT** | RESIDUAL         | "Token refresh events", "Token refresh frequency" (in Observability/Metrics)                                                       |
| `contracts/CORE_COMMAND_CONTRACTS.md`       | **OK**    | -                | Clean (Explicit WARNING banners present).                                                                                          |
| `contracts/CORE_IDENTITY_SCOPE_CONTRACT.md` | **OK**    | -                | Clean (Explicitly marks S2S as Not Available).                                                                                     |
| `INTEGRATION_ADAPTER_SPEC.md`               | **OK**    | -                | Clean (Aligns with Core v1 Reality).                                                                                               |
| `MODULE_INTEGRATION_PLAN.md`                | **OK**    | -                | Clean (Aligns with Core v1 Reality).                                                                                               |
| `contracts/CORE_DATA_CONTRACTS.md`          | **OK**    | -                | Clean (Explicitly marks Template as Deferred).                                                                                     |

## 4. Canonical Rules Violated

The following **Core Contract v1** rules are currently violated by the Governance Laws:

1.  **NO Service-to-Service Auth**: `STACK_BOUNDARIES.md` mandates obtaining/refreshing Service Tokens.
2.  **NO Token Refresh**: `FAIL_CLOSED_MATRIX.md` mandates retrying on 401 after refresh.
3.  **Fail-Closed**: The instruction to "Retry ONCE" on 401 breaks the strict Fail-Closed Fail-Fast rule for auth errors in v1.
4.  **DEFERRED Capability**: `MODULE_SECURITY_LAWS` defines rate limits for Template Publishing, which is a prohibited feature.

## 5. Files Statement

### Files SAFE (No Changes Needed)

- `contracts/CORE_COMMAND_CONTRACTS.md`
- `contracts/CORE_IDENTITY_SCOPE_CONTRACT.md`
- `contracts/CORE_DATA_CONTRACTS.md`
- `contracts/FORBIDDEN_DATA_MATRIX.md`
- `INTEGRATION_ADAPTER_SPEC.md`
- `MODULE_INTEGRATION_PLAN.md`

### Files REQUIRING CHANGES

1.  `STACK_BOUNDARIES.md`
2.  `MODULE_DATA_OWNERSHIP.md`
3.  `MODULE_SECURITY_LAWS.md`
4.  `FAIL_CLOSED_MATRIX.md`
5.  `contracts/CORE_FAILURE_SEMANTICS.md`

---

# PHASE 2 — PROPOSED FIX PLAN

## 1. Remediation Strategy

The remediation will be **SUBTRACTIVE**. We will remove violations and replace them with explicit "NOT AVAILABLE" or "DEFERRED" markers, matching the pattern established in the Contracts and Adapter Spec. We will NOT invent new behaviors.

## 2. File-Specific Fixes

### A) `STACK_BOUNDARIES.md`

- **Target**: Section 3.1, 3.3, 3.5, 5.1 (Invalid Flows).
- **Change**:
  - **REMOVE**: Requirement to "Obtain Core service token independently".
  - **REMOVE**: Requirement to "Rotate Core service token".
  - **REMOVE**: Requirement to "refresh token and retry" on 401.
  - **REPLACE WITH**: "Core Service Token: **NOT AVAILABLE** in Core v1. BFF MUST use User-Scoped JWT only."
  - **UPDATE**: Section 3.4 (Correlation) to remove "DECISION REQUIRED" and explicitly state "Suite-Only Header".

### B) `MODULE_SECURITY_LAWS.md`

- **Target**: Section 3.5 (Core Service Token Protection), Section 4.3 (Rate Limits), Section 4.5 (Secrets).
- **Change**:
  - **MARK AS NOT AVAILABLE**: "Core Service Token Protection" — Add banner "NOT AVAILABLE IN CORE V1".
  - **REMOVE**: "Rotate token per Core policy" requirement.
  - **UPDATE**: Rate limits to mark "Publish" as "DEFERRED (NOT AVAILABLE)".

### C) `FAIL_CLOSED_MATRIX.md`

- **Target**: Section 4.1 (Auth Failures), Use Case Table ("Publish Predefined Template").
- **Change**:
  - **CRITICAL FIX**: Change Section 4.1 System Action from "...refresh token and retry ONCE" to "**DENY** immediately. Do NOT retry. Token refresh is NOT AVAILABLE."
  - **UPDATE**: "Publish Predefined Template" row to mark as "**DEFERRED**" or explicitly note it cannot proceed in Core v1 context if strictly interpreted (though the command contract allows existing logic to handle the "Deferred" state safely, the Matrix assumes it works). We will mark the Use Case as "DEFERRED / BLOCKED".
  - **REMOVE**: "Core service token missing" as a specific failure condition (as it doesn't exist).

### D) `MODULE_DATA_OWNERSHIP.md`

- **Target**: Section 3.2 (Core Template Data).
- **Change**:
  - **UPDATE**: Access Method from "Core API (TBD...)" to "**NONE** (Template Publish DEFERRED in Core v1)".
  - **UPDATE**: "What platform-admin Reads" to explicit "NONE".

### E) `contracts/CORE_FAILURE_SEMANTICS.md`

- **Target**: Section 6 (Observability).
- **Change**:
  - **REMOVE/UPDATE**: References to "Token refresh events" and "Token refresh frequency". Mark them as "N/A in Core v1".

---

# PHASE 3 — WAIT STATE

No files were modified in this step.
Awaiting explicit Governance Approval to apply changes.
