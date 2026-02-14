# Gate 5.2.1 — Draft Authorization (Hygiene Patch)

Status: DRAFT — AUTHORIZATION REQUIRED BEFORE EXECUTION
Mode: STRICT · FAIL-CLOSED · GOVERNANCE-FIRST · EVIDENCE-DRIVEN

## 1) Purpose

This mini-gate exists because Gate 5.2 is CLOSED/TAGGED and any post-closure changes must be governed.
Goal: Apply hygiene fixes discovered by SUITE_FULL_AUDIT_REPORT without scope creep.

## 2) Allowed Scope (ABSOLUTE)

Allowed paths ONLY:

- modules/platform-admin/src/\*\*
- modules/platform-admin/tests/\*\*
- modules/platform-admin/governance/\*\*
- modules/platform-admin/\*.ts (module root only)

Allowed changes in this gate:
A) Add enforcePolicy calls to repository write methods
B) Move wiring test to Jest-discovered tests path (move, not expand Jest)
C) Documentation drift fixes (checklists/readiness/scope note)

## 3) Forbidden Scope (ABSOLUTE)

- Any file outside modules/platform-admin/\*\*
- Bassan.os (BLACK BOX) — NO TOUCH
- Prisma schema/migrations changes
- Dependencies (package\*.json)
- CI/CD (.github, pipelines)
- Any new controllers/endpoints/services unrelated to hygiene
- Any Core integration client or Core calls

## 4) Entry Criteria

- Current HEAD is Gate 5.2: dd506622a2585699b4216ac419fa5665ad425e40
- Working tree clean except known untracked (.env, planning docs if any)
- Governance docs are present and FINAL

## 5) Exit Criteria

- enforcePolicy present in ALL OrganizationRepository write methods:
  create(), suspend(), unsuspend()
- Wiring test moved to tests/\*\* and still compiles/passes
- Docs drift patched:
  MODULE_GATES_CHECKLIST updated (mark completed gates accurately)
  PLATFORM_ADMIN_READINESS updated (reflect 5.1, 5.2)
  GATE_5_SCOPE_MAP updated with explicit note: Gate 5.1 executed as DB integration skeleton
- Lint/build/tests PASS (or documented non-execution reason if running would modify files)
- Evidence document created and committed:
  modules/platform-admin/governance/GATE_5_2_1_HYGIENE_EVIDENCE.md
- Tag created: suite-platform-admin-gate-5.2.1-hygiene

## 6) Mandatory Verification Commands (Read-only + Safe)

- git status --porcelain
- git diff --name-only
- npm run lint
- npm run build
- npm run test
  If npm commands modify files (lockfiles), STOP and record as "NOT EXECUTED: would modify files".

## 7) STOP CONDITIONS (FAIL-CLOSED)

STOP immediately if ANY occurs:

- Any file outside allowed scope is changed
- Any Prisma schema/migration change is required
- Any dependency/CI change is required
- Any Core call/client is attempted
- Any ambiguity about policy action names (do not invent actions)
- Any tests are “fixed” by skipping/forceExit without justification
