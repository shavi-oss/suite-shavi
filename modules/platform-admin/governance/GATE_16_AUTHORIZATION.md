# Gate 16 — Host App / Console Definition (DOCS-ONLY) — Authorization

## 1. Docs-Only Authorization

This gate is strictly **DOCS-ONLY**.
Implementation of any kind (TypeScript, HTML, CSS, Database, npm install) is strictly **PROHIBITED**.

## 2. Explicit Allowlist (Create Only)

The ONLY authorized files for creation during this execution are:

1.  `modules/platform-admin/governance/GATE_16_PLAN.md`
2.  `modules/platform-admin/governance/GATE_16_AUTHORIZATION.md`
3.  `modules/platform-admin/governance/GATE_16_EXECUTION_REPORT.md`
4.  `modules/platform-admin/governance/GATE_16_VERIFICATION_EVIDENCE.md`
5.  `modules/platform-admin/governance/HOST_APP_CONSOLE_DEFINITION.md`

## 3. Explicit Forbidden Actions

- ❌ Do NOT modify any existing source file (`src/**`).
- ❌ Do NOT modify `package.json` or `package-lock.json`.
- ❌ Do NOT touch Core (Bassan.os).
- ❌ Do NOT touch any existing governance files (Gate 1 - Gate 14).
- ❌ Do NOT invent any feature not specified.
- ❌ Do NOT make assumptions about future client needs.
- ❌ Do NOT attempt to build or deploy.

## 4. Sources of Truth

1.  `ARCHITECTURAL_LAWS.md`
2.  `EXECUTION_AUTHORITY.md`
3.  `REPO_GOVERNANCE.md`
4.  `SECURITY_BASELINE.md`
5.  `OWNERSHIP_AND_RIGHTS.md`
6.  `modules/platform-admin/governance/core-contract/CORE_CONTRACT_V1_EXTRACT.md`
7.  `modules/platform-admin/governance/core-contract/CORE_CONTRACT_V1_LOCK_DECLARATION.md`
8.  `modules/platform-admin/governance/core-contract/CORE_V1_INTEGRATION_LOCK.md`

## 5. Acceptance Criteria (Gate Closure)

Gate 16 closes ONLY when all 5 files exist, adhere strictly to the rules, and no unauthorized modifications have occurred.
Verification steps:

- [ ] `GATE_16_PLAN.md` exists.
- [ ] `GATE_16_AUTHORIZATION.md` exists.
- [ ] `HOST_APP_CONSOLE_DEFINITION.md` exists and defines Shell/Console without code or technical assumptions.
- [ ] `GATE_16_VERIFICATION_EVIDENCE.md` confirms "NO CODE".
- [ ] `GATE_16_EXECUTION_REPORT.md` summarizes the execution.
