# PR-1.1 Agent Prompt (English, Ultra-Strict)

You are an execution agent inside an IDE workspace.

Repo root: D:\Basaan os\suite-shavi
Module: modules\platform-admin

Mission: PR-1.1 — Fix org-mapping unit tests after PR-1 JWT boundary change.

STRICT MODE:
- Tests-only. No production code changes.
- One file only.
- If scope expands, STOP and report.

AUTHORITATIVE SOURCES (read first):
- SUITE_PR1_1_CHECKLIST_PLAN.md
- SUITE_PR1_1_AGENT_GOVERNANCE_RULES.md
- SUITE_PR1_1_TEST_FIX_GUIDE.md
- SUITE_PR1_1_EXECUTION_REPORT_TEMPLATE.md

HARD SCOPE LOCK:
Allowed file to modify (ONLY):
- modules/platform-admin/tests/unit/controllers/org-mapping.controller.spec.ts

Forbidden:
- any src/** changes
- dependencies/config changes
- any other tests

WORKFLOW:
PHASE 1 — Plan (no edits):
1) Open the target spec file and identify the exact places it mocks headers.authorization and expects header-based extraction.
2) Confirm SessionGuard dependencies (SessionService, JwtStorageService) and RbacGuard dependency (Reflector).
3) Present a short task plan (numbered) + the exact verification commands to run.
WAIT for approval.

PHASE 2 — Execute (after approval):
1) Pre-flight:
   - git status --porcelain
   - git rev-parse HEAD
2) Apply minimal edits per SUITE_PR1_1_TEST_FIX_GUIDE.md:
   - Provide mocks for SessionService + JwtStorageService
   - Provide Reflector
   - Register SessionGuard + RbacGuard as providers
   - Change req mocks to use req.coreJwt (remove headers.authorization)
   - Update test names accordingly
3) Diff sanity:
   - git diff --name-only  (must show ONLY the spec file)
4) Verification:
   - cd modules/platform-admin
   - npx jest --no-coverage
5) Documentation:
   - Create: modules/platform-admin/governance/pr/pr1 sute panel fix/PR_1_1_EXECUTION_REPORT.md
   - Use the template and include raw outputs.

COMMIT (only after user says GO):
- git add modules/platform-admin/tests/unit/controllers/org-mapping.controller.spec.ts
- git add modules/platform-admin/governance/pr/pr1 sute panel fix/PR_1_1_EXECUTION_REPORT.md
- git diff --cached --name-only
- git commit -m "platform-admin: fix org-mapping controller tests for req.coreJwt"

STOP CONDITIONS:
- Any file outside scope appears in git diff
- Jest fails for reasons beyond this spec file
- Any temptation to edit src/**

END
