# Gate 6.0 — Evidence Proof

## Platform Admin Module

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Gate Number    | 6.0                                     |
| Gate Name      | Evidence Proof + Doc Corrections        |
| Document Title | GATE_6_0_EVIDENCE_PROOF                 |
| Repo           | Suite (Layer / Product Repo)            |
| Module         | platform-admin                          |
| Status         | FINAL — EVIDENCE LOCKED                 |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-02-13                              |

---

## 1) Evidence Sources (Canonical)

The following sources were read and treated as authoritative:

1. `CORE_CONTRACT_V1_EXTRACT.md` (Source-Derived)
2. `CORE_CONTRACT_EVIDENCE_TABLE.md` (Evidence Map)
3. `CORE_V1_INTEGRATION_LOCK.md` (Integration Contract)
4. `INTEGRATION_CONTRACT_CORE.md` (Suite Contract)

---

## 2) JWT Claims Proof

**Status**: ✅ PROVEN

**Source**: `modules/auth/strategies/jwt.strategy.ts` (Core)

**Evidence**: `CORE_CONTRACT_EVIDENCE_TABLE.md`, Section 5 (Authentication Mechanism)

| Claim            | Proven? | Source Line (Core) | Notes                                   |
| ---------------- | ------- | ------------------ | --------------------------------------- |
| `sub`            | ✅ YES  | L29-L33            | User ID                                 |
| `email`          | ✅ YES  | L29-L33            | User Email                              |
| `organizationId` | ✅ YES  | L29-L33            | Tenant ID                               |
| `roles`          | ❌ NO   | -                  | **NOT FOUND** in JWT payload definition |
| `permissions`    | ❌ NO   | -                  | **NOT FOUND** in JWT payload definition |

**Mapping to `request.user`**:
The Core strategy maps these claims to `req.user`:

- `id` (from `sub`)
- `email`
- `organizationId`

**Conclusion**:
Gate 6B (Auth Context Wiring) can proceed using **ONLY** `id`, `email`, and `organizationId`.

---

## 3) Role Structure Proof

**Status**: ❌ NOT PROVEN (BLOCKED)

**Analysis**:

- Searched `CORE_CONTRACT_V1_EXTRACT.md` for "roles" in JWT context.
- Searched `CORE_CONTRACT_EVIDENCE_TABLE.md` for "roles" in Authentication Mechanism.
- Result: Roles are NOT part of the JWT payload in Core v1.

**Impact**:

- **Stateless RBAC** (authorized via JWT claims) is **IMPOSSIBLE** with Core v1.
- **Stage 6C (RBAC Activation)** relying on JWT roles is **BLOCKED**.
- Any implementation of RBAC would require a secondary lookup (e.g., `GET /api/v1/auth/me`), which changes the architecture from "Stateless Guard" to "Stateful Guard" or "User Profile Guard".
- **DECISION**: Gate 6C is **NO-GO** under current strategy.

---

## 4) Decision Section

**Verdict**: **Option B — CLAIMS PARTIAL / ROLE STRUCTURE NOT PROVEN (BLOCKED)**

Based on Core Contract evidence:

1. **Gate 6B (Auth Context Wiring)**: **ALLOWED** (Limited Scope)
   - **Allowed Claims**: `sub` (mapped to `userId`), `email`, `organizationId`.
   - **Forbidden Claims**: `roles`, `permissions`, `scope`.
   - **Condition**: Use only proven claims.

2. **Gate 6C (RBAC Activation)**: **BLOCKED**
   - **Dependency**: Requires JWT role claims.
   - **Evidence**: Claims DO NOT EXIST.
   - **Action**: STOP. Do NOT execute Gate 6C.
   - **Remediation**: Re-plan Stage 6C to use `GET /api/v1/users/:id` or `GET /api/v1/auth/me` (if authorized) OR defer RBAC to Core v2.

3. **fail-closed Architecture**: **PRESERVED**
   - No assumptions made.
   - No unproven claims used.
   - Security posture remains intact.

---

## 5) Signature

**Approved By**: Governance Authority  
**Date**: 2026-02-13  
**Status**: FINAL — EVIDENCE LOCKED
