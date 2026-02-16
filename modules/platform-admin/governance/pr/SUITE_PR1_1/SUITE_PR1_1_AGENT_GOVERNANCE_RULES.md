# Agent Governance — PR-1.1 (Tests Only, No Drift)
Purpose: Ensure the agent fixes tests precisely for PR-1 fallout, without touching production code.

---

## Golden Rules
1) **Tests-only PR.** Do not modify any file under `modules/platform-admin/src/**`.
2) **Minimal diffs.** Change only what is necessary for tests to reflect PR-1 behavior.
3) **Evidence-first.** Run jest and record results.
4) **No dependency/config changes.**

---

## Allowed File (ONLY)
- `modules/platform-admin/tests/unit/controllers/org-mapping.controller.spec.ts`

## Stop Conditions (must stop immediately)
- Any need to modify additional files
- Jest failures that appear unrelated to org-mapping tests
- Any temptation to “fix” guards or controller logic in src/

---

## Required Output Structure (agent must follow)
### Files Changed
### Changes Made
### Why
### Verification (commands + PASS/FAIL)
### Diff Sanity (`git diff --name-only`)

---

END
