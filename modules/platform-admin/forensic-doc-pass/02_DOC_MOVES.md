# 02_DOC_MOVES.md — Documentation Governance Pass

**Date**: 2026-03-08

## Move Decision

**Decision**: NO MOVES PERFORMED.

### Rationale

The existing documentation structure in suite-shavi is well-established across 50+ gate artifacts spanning `modules/platform-admin/forensic-*/` and `modules/platform-admin/governance/`. Moving these files would:

1. Break existing cross-references within docs
2. Invalidate commit history traceability
3. Provide no functional or safety improvement
4. Introduce massive diff noise with zero product value

The aspirational `/docs/<type>/` layout from the gate spec is documented as the **future target** in `01_DOC_STRUCTURE_PLAN.md`. The current structure is documented as canonical and correct.

### What Was Done Instead

All untracked documentation files were added to git (see `03_GIT_TRACKING_STATUS.md`).

### Files NOT Moved (Correct Current Location)

| File / Folder           | Current Location                             | Decision                           |
| ----------------------- | -------------------------------------------- | ---------------------------------- |
| ARCHITECTURAL_LAWS.md   | repo root                                    | KEEP — established root convention |
| SECURITY_BASELINE.md    | repo root                                    | KEEP                               |
| REPO_GOVERNANCE.md      | repo root                                    | KEEP                               |
| OWNERSHIP_AND_RIGHTS.md | repo root                                    | KEEP                               |
| forensic-cred/          | modules/platform-admin/forensic-cred/        | KEEP                               |
| forensic-g5/            | modules/platform-admin/forensic-g5/          | KEEP                               |
| forensic-g5-rotation/   | modules/platform-admin/forensic-g5-rotation/ | KEEP                               |
| forensic-g6/            | modules/platform-admin/forensic-g6/          | KEEP                               |
| forensic-g7/            | modules/platform-admin/forensic-g7/          | KEEP                               |
| forensic-g7-live/       | modules/platform-admin/forensic-g7-live/     | KEEP                               |
| governance/gates/       | modules/platform-admin/governance/gates/     | KEEP                               |
| governance/laws/        | modules/platform-admin/governance/laws/      | KEEP                               |
| governance/reports/     | modules/platform-admin/governance/reports/   | KEEP                               |
| docs-pack/              | docs-pack/                                   | KEEP                               |
