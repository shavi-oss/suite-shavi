# 01_DOC_STRUCTURE_PLAN.md — Documentation Governance Pass

**Date**: 2026-03-08

## Canonical Documentation Structure (suite-shavi)

The suite-shavi repository uses an established documentation convention.
This plan documents the **existing canonical structure** as authoritative.

### Root Level — Cross-Repo Governance

```
/ARCHITECTURAL_LAWS.md           ← suite-level architecture law
/BASSAN_EXECUTION_BOARD.md       ← platform governance board doc
/EXECUTION_AUTHORITY.md          ← execution authority definition
/INTEGRATION_CONTRACT_CORE.md    ← Suite ↔ Core integration contract
/OWNERSHIP_AND_RIGHTS.md         ← ownership definitions
/REPO_GOVERNANCE.md              ← repo-level governance
/SECURITY_BASELINE.md            ← security baseline (shared)
```

### /docs-pack/ — Documentation Audit Artifacts

```
/docs-pack/
  00_DOCS_INVENTORY_SUITE.md
  01_SCOPE_COMPLIANCE_SUITE.md
  02_DOCS_STRUCTURE_SUITE.md
  03_COMMIT_PLAN_SUITE.md
  04_VERIFICATION_MATRIX_SUITE.md    ← must be tracked
  05_FINAL_DOCS_VERDICT_SUITE.md     ← must be tracked
```

### /modules/platform-admin/ — Module Documentation

```
/modules/platform-admin/
  forensic-cred/      ← Gate 4: credential forensic evidence
  forensic-g5/        ← Gate 5: JWKS discovery baseline
  forensic-g5-rotation/ ← Gate 5: JWKS rotation + JWT minting
  forensic-g6/        ← Gate 6: create org payload fix
  forensic-g7/        ← Gate 7: org UX polish + regression
  forensic-g7-live/   ← Gate 7: live deploy verification
  forensic-doc-pass/  ← THIS GOVERNANCE PASS (current)
  governance/
    gates/            ← Gate plans, auth, execution, verification
    laws/             ← Architectural, module, security laws
    reports/          ← Maps, specs, release, runtime reports
    repair-pack/      ← Repair gate evidence (must be tracked)
```

### /tests/ — Regression Tests

```
/modules/platform-admin/tests/
  org-flows.test.mjs  ← Gate 7 API regression test
```

## Structure Decision

The `/docs/` layout proposed in the gate spec (with `/docs/architecture`, `/docs/security`, etc.)
represents an aspirational future structure. The existing `modules/platform-admin/governance/`
convention is well-established across 50+ gate artifacts. **Moving the existing docs would create
massive history drift with no functional improvement.**

Decision: **Document the current structure as canonical. Keep all existing docs in place.**
Only action: ensure all docs are tracked in git.
