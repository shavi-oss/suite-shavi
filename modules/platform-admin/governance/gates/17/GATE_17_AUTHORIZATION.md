# Gate 17 — UI Structure Spec (Docs-Only) — Authorization

## 1. Authorization Scope

This document authorizes the **Alignment Patch** for Gate 17.
The Executor is permitted to modify **ONLY** the 4 specific governance files listed below to ensure compliance with `MODULE_SCOPE_LOCK`.

> [!IMPORTANT]
> **DOCS-ONLY EXECUTION.**
> No code files (`.tsx`, `.ts`, `.js`, etc.) are authorized.
> No dependency changes are authorized.
> The previous authorization for "Skeleton UI Code" is **REVOKED**.

## 2. Explicit Allowlist (Docs Only)

The ONLY authorized files for modification are:

1.  `modules/platform-admin/governance/GATE_17_PLAN.md`
2.  `modules/platform-admin/governance/GATE_17_AUTHORIZATION.md`
3.  `modules/platform-admin/governance/GATE_17_EXECUTION_REPORT.md`
4.  `modules/platform-admin/governance/GATE_17_VERIFICATION_EVIDENCE.md`

## 3. Explicit Denylist (STOP IMMEDIATE)

- ❌ **ANY Code File**: `src/**`, `.tsx`, `.ts`, `.html`, `.css`.
- ❌ **ANY Dependency Change**: `package.json`, `package-lock.json`.
- ❌ **ANY Other Governance File**: Do not touch `MODULE_SCOPE_LOCK.md`, `GATE_16_*.md`, etc.
- ❌ **Dashboard / Settings**: Do not define or mention as in-scope.

## 4. Sources of Truth

1.  `ARCHITECTURAL_LAWS.md`
2.  `SECURITY_BASELINE.md` (Stop Conditions)
3.  `modules/platform-admin/governance/MODULE_SCOPE_LOCK.md` (Primary Alignment Target)
4.  `modules/platform-admin/governance/core-contract/CORE_CONTRACT_V1_EXTRACT.md`
5.  `modules/platform-admin/governance/core-contract/CORE_CONTRACT_V1_LOCK_DECLARATION.md`
6.  `modules/platform-admin/governance/core-contract/CORE_V1_INTEGRATION_LOCK.md`

## 5. Acceptance Criteria

- [ ] Only the 4 allowlisted files are modified.
- [ ] No `src/` directory created or modified.
- [ ] `MODULE_SCOPE_LOCK` is respected (No Dashboard, No Settings).
- [ ] Docs explicitly state "NO CODE IMPLEMENTATION".
