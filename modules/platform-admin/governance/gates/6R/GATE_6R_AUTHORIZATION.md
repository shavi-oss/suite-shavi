# Gate 6R Authorization

> **Gate ID**: 6R
> **Type**: Governance Reconciliation (Docs-Only)
> **Status**: AUTHORIZED
> **Date**: 2026-02-14

## 1. Authorization

This gate is authorized to reconcile governance drift and produce an authoritative record of the module's governance state. It is a response to detected discrepancies in Gate 1 artifacts, Gate 5 status, and general naming/placement drift.

## 2. Constraints

- **Mode**: STRICT FAIL-CLOSED + DOCS-ONLY.
- **Forbidden**:
  - Source code modifications.
  - Dependency changes.
  - Core (Bassan.os) modifications.
  - Automated file moves (recommendations only).

## 3. Allowlist

Only the following files may be created or modified:

1. `modules/platform-admin/governance/gates/6R/GATE_6R_AUTHORIZATION.md`
2. `modules/platform-admin/governance/gates/6R/GATE_6R_PLAN.md`
3. `modules/platform-admin/governance/gates/6R/GATE_6R_EXECUTION_REPORT.md`
4. `modules/platform-admin/governance/gates/6R/GATE_6R_VERIFICATION_EVIDENCE.md`
5. `modules/platform-admin/governance/reports/GATE_6R_MASTER_GOVERNANCE_INDEX.md`
6. `modules/platform-admin/governance/reports/GATE_6R_FILE_DOSSIERS_REPORT.md`
7. `modules/platform-admin/governance/reports/GATE_6R_CHANGELOG_AND_EXECUTION_MAP.md`
8. `modules/platform-admin/governance/reports/GATE_6R_DRIFT_AND_CONFLICTS_REPORT.md`
9. `modules/platform-admin/governance/GOVERNANCE_INDEX.md` (Minimal updates)

## 4. Stop Conditions

Stop execution immediately if:

- Code changes are required to fix drift.
- Integrity checks for Gate 6B.2A reveal a fail-open state.
- Unauthorized files are touched.

## 5. Verification

- `git status --porcelain` must be clean (except allowlisted files).
- `git diff --name-only` must match allowlist.
