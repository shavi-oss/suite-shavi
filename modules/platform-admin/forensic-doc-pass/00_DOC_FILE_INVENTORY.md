# 00_DOC_FILE_INVENTORY.md — Documentation Governance Pass

**Date**: 2026-03-08  
**Scan method**: PowerShell Get-ChildItem -Recurse -Filter "\*.md", exclude node_modules

## Root-Level Governance Docs (Suite repo root)

| File                         | Current Location | Expected Location          | Action                                    |
| ---------------------------- | ---------------- | -------------------------- | ----------------------------------------- |
| ARCHITECTURAL_LAWS.md        | `/`              | `/` — root governance      | **KEEP**                                  |
| BASSAN_EXECUTION_BOARD.md    | `/`              | `/`                        | **KEEP**                                  |
| EXECUTION_AUTHORITY.md       | `/`              | `/`                        | **KEEP**                                  |
| INTEGRATION_CONTRACT_CORE.md | `/`              | `/`                        | **KEEP**                                  |
| OWNERSHIP_AND_RIGHTS.md      | `/`              | `/`                        | **KEEP**                                  |
| REPO_GOVERNANCE.md           | `/`              | `/`                        | **KEEP**                                  |
| SECURITY_BASELINE.md         | `/`              | `/security` (aspirational) | **KEEP in root** — established convention |

## docs-pack/ (Docs audit folder)

| File                                      | Tracked          | Action         |
| ----------------------------------------- | ---------------- | -------------- |
| docs-pack/00_DOCS_INVENTORY_SUITE.md      | ✅               | KEEP           |
| docs-pack/01_SCOPE_COMPLIANCE_SUITE.md    | ✅               | KEEP           |
| docs-pack/02_DOCS_STRUCTURE_SUITE.md      | ✅               | KEEP           |
| docs-pack/03_COMMIT_PLAN_SUITE.md         | ✅               | KEEP           |
| docs-pack/04_VERIFICATION_MATRIX_SUITE.md | ❌ **untracked** | **ADD to git** |
| docs-pack/05_FINAL_DOCS_VERDICT_SUITE.md  | ❌ **untracked** | **ADD to git** |

## modules/platform-admin/ — Forensic Gate Artifacts (established convention)

All tracked — correct location:

- `forensic-cred/` — Gate 4 credential forensics ✅
- `forensic-g5/` — Gate 5 JWKS discovery ✅
- `forensic-g5-rotation/` — Gate 5 rotation evidence ✅
- `forensic-g6/` — Gate 6 create org fix ✅
- `forensic-g7/` — Gate 7 org UX polish ✅
- `forensic-g7-live/` — Gate 7 live deploy verification ✅

## modules/platform-admin/governance/ — Governance Documents

Extensive existing structure under `governance/` — all tracked.

| Subfolder      | Contents                                                                                | Tracked |
| -------------- | --------------------------------------------------------------------------------------- | ------- |
| gates/         | Gate plans, authorizations, execution reports, verification                             | ✅      |
| laws/          | Architectural, security, module laws                                                    | ✅      |
| reports/       | Maps, plans, specs, release, runtime                                                    | ✅      |
| forensic-cred/ | Appears in untracked scan but directory is EMPTY (real forensic-cred is at module root) | N/A     |
| repair-pack/   | Appears in untracked scan — checking content                                            | TBD     |

## Temp Files (should be gitignored, NOT tracked)

- `node_error*.txt`, `node_output*.txt`, `variables.txt` — transient test artifacts

## Summary: Items Requiring Action

1. **docs-pack/04, 05** — add to git
2. **governance/repair-pack/** — add to git if populated
3. **Create tags**: gate6-complete, gate7-ux-polish, suite-gate7-stable
4. **Add .gitignore entry** for temp node_output/error txt files (optional hardening)
