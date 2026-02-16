# Suite PR-1 — Execution Documentation Template (What to record)
Use this file to document exactly what was done so governance stays accurate.

---

## 1) PR Metadata
- PR Title:
- Branch:
- Date:
- Repo:
- Module:
- Executor:
- Reviewer:

---

## 2) Objective
One sentence:
- “Remove UI dependency on Core JWT for org-mapping; source JWT from SessionGuard server-side.”

---

## 3) Files Changed (must be exact)
Output of:
```bash
git diff --name-only
```
Paste here:

---

## 4) What Changed (bullet list)
- Added `SessionGuard` import to org-mapping controller
- Enforced `@UseGuards(SessionGuard, RbacGuard)` on controller
- Switched `coreJwt` source from header parsing to `req.coreJwt`

---

## 5) Why This Is Correct (boundary explanation)
- UI should never possess Core JWT.
- SessionGuard already attaches `coreJwt` server-side.
- This preserves fail-closed behavior and reduces exposure risk.

---

## 6) Verification Evidence
### 6.1 Pre-flight
Paste:
- `git status --porcelain` BEFORE
- `git rev-parse HEAD` BEFORE

### 6.2 Build / Types
Commands run + results:
- `npx tsc --noEmit` → PASS/FAIL
- `npm run build` → PASS/FAIL

### 6.3 Tests
Commands run + results:
- `npm test` (or module tests) → PASS/FAIL

### 6.4 Smoke Test
Describe exact request:
- Endpoint:
- Headers:
- Cookie/session:
- Expected:
- Actual:

---

## 7) Diff Sanity Note
Paste:
- `git diff --cached` (or summarize)
Confirm:
- Only intended lines changed
- No extra whitespace/refactors

---

## 8) Risks / Follow-ups (if any)
- Any behavior change noticed?
- Any next PR needed (e.g., Core Contract v2 exists endpoint)?

---

END
