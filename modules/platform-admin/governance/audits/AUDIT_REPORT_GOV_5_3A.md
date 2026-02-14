# Audit Report — Governance Gate 5.3A

**Auditor**: Principal Software Architect & Governance Authority  
**Date**: 2026-02-02  
**Scope**: `modules/platform-admin/governance/**`  
**Reference**: Core Contract v1 Lock (`CORE_V1_INTEGRATION_LOCK.md`)  
**Status**: **FAIL — CRITICAL DRIFT DETECTED**

---

## 1. Executive Summary

**Verdict**: **FAIL**

The governance documentation suite is **NOT ALIGNED** with Core Contract v1. While `core-contract` and `contracts` directories have been partially patched, the fundamental "Law" documents (`STACK_BOUNDARIES`, `MODULE_SECURITY_LAWS`, `FAIL_CLOSED_MATRIX`, `MODULE_DATA_OWNERSHIP`) retain forbidden assumptions about Core capabilities.

**Critical Issues**:

- **Service Tokens**: Multiple files enforce storage, rotation, and usage of "Core Service Tokens" which do not exist in Core v1.
- **Token Refresh**: "Refresh and Retry" logic persists in failure matrices, violating the Fail-Closed/No-Refresh reality of Core v1.
- **Template Publishing**: Access control rules and data ownership docs imply Template Publish is an active capability, contradicting its **DEFERRED** status.

**Conclusion**: Gate 5.3A cannot pass until these foundational contradictions are resolved.

---

## 2. Global Drift Themes

| Theme                      | Violation                                                                           | Impact                                                                             |
| -------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **Phantom Service Tokens** | Documents enforce management of "Core Service Tokens" (storage, rotation, S2S auth) | Governance requires implementing non-existent security controls.                   |
| **Refresh Logic**          | Failure handling instructs "Refresh Token and Retry ONCE" on 401                    | Direct violation of Core v1 Fail-Closed reality; guarantees runtime failure loops. |
| **Deferred Capabilities**  | RBAC and allowed data sections include "Template Publishing"                        | Authorizes implementation of features that are explicitly DEFERRED.                |
| **Tenant Propagation**     | TBD markers or "Header" options persist in older planning/law docs                  | Ambiguity in standardizing on `organizationId` JWT claim.                          |

---

## 3. File-by-File Drift Analysis

| File                                        | Status    | Drift Type                  | Evidence                                                                        |
| ------------------------------------------- | --------- | --------------------------- | ------------------------------------------------------------------------------- |
| `STACK_BOUNDARIES.md`                       | **DRIFT** | Service Token, Refresh, S2S | "Obtain Core service token independently", "Refresh token and retry ONCE"       |
| `MODULE_DATA_OWNERSHIP.md`                  | **DRIFT** | Template Publish            | "Access Method: Core API (TBD...)" (Should be DEFERRED)                         |
| `MODULE_SECURITY_LAWS.md`                   | **DRIFT** | Service Token, Template     | "MUST: Rotate Core token", "Publish 5/min per user"                             |
| `FAIL_CLOSED_MATRIX.md`                     | **DRIFT** | Refresh Policy              | "BFF MAY refresh token and retry ONCE"                                          |
| `contracts/CORE_FAILURE_SEMANTICS.md`       | **DRIFT** | Residual Refresh            | "Token refresh events", "Token refresh frequency" (in logging/metrics sections) |
| `contracts/CORE_COMMAND_CONTRACTS.md`       | **OK**    | -                           | Clean (Patched in Hotfix 5.3A-ALIGN.1)                                          |
| `contracts/CORE_IDENTITY_SCOPE_CONTRACT.md` | **OK**    | -                           | Clean (Partially patched, verified)                                             |
| `INTEGRATION_ADAPTER_SPEC.md`               | **OK**    | -                           | Clean (Patched in Hotfix 5.3A-ALIGN.1)                                          |
| `MODULE_INTEGRATION_PLAN.md`                | **OK**    | -                           | Clean (Aligned in previous gate)                                                |

_(Note: Planning documents in `_planning/` also contain drift but are non-binding historical artifacts.)_

---

## 4. Canonical Rules Violated

The following **Core Contract v1** rules are currently violated by the Governance Suite:

1.  **NO Service-to-Service Auth**: `STACK_BOUNDARIES.md` explicitly mandates obtaining and using Core Service Tokens.
2.  **NO Token Refresh**: `FAIL_CLOSED_MATRIX.md` explicitly mandates refreshing tokens on 401.
3.  **DEFERRED Template Publish**: `MODULE_SECURITY_LAWS.md` defines rate limits and RBAC for Template Publishing.
4.  **Fail-Closed Integrity**: The "Retry on 401" instruction undermines the strict fail-closed security posture.

---

## 5. Remediation Plan

### Files SAFE (No Changes Needed)

- `contracts/CORE_COMMAND_CONTRACTS.md`
- `contracts/CORE_IDENTITY_SCOPE_CONTRACT.md`
- `contracts/CORE_DATA_CONTRACTS.md`
- `contracts/FORBIDDEN_DATA_MATRIX.md` (Updated in 5.3A-ALIGN)
- `INTEGRATION_ADAPTER_SPEC.md`
- `MODULE_INTEGRATION_PLAN.md`

### Files REQUIRING CHANGES

1.  **`STACK_BOUNDARIES.md`**: Remove all Service Token acquisition/storage/rotation logic. Update 401 handling to Fail-Closed.
2.  **`MODULE_SECURITY_LAWS.md`**: Remove Service Token protection/rotation laws. Mark Template Publish RBAC/Limits as DEFERRED.
3.  **`FAIL_CLOSED_MATRIX.md`**: Update 401 handling to strictly DENY/NO-RETRY. Remove "Service Token Missing" stop rules.
4.  **`MODULE_DATA_OWNERSHIP.md`**: Mark Core Template Access Method as DEFERRED.
5.  **`contracts/CORE_FAILURE_SEMANTICS.md`**: Remove residual logging/metric references to "Token Refresh".

---

## 6. Stop Statement

> [!CAUTION]
> **AUDIT FAILED**
>
> No changes executed. Awaiting approval to proceed with **Phase 2: Remediation**.
>
> **Required Action**: Execute `5.3A-ALIGN.2` (Remediation) to patch the 5 identified files.

---

**Auditor Signature**:
_Principal Software Architect & Governance Authority_
