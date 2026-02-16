# Execution Governance — Agent Rules (Gemini Pro 3 Safe Mode)
Purpose: enforce **no drift / no hallucination / no scope creep** while implementing Suite PR-1.

---

## 1) Golden Laws (Non-Negotiable)
1) **Code is the source of truth.** Do not invent files, symbols, or flows.
2) **Minimal diff.** Change only what is required to achieve the goal.
3) **Fail-closed posture.** If uncertain, stop and report.
4) **No dependencies.** Do not edit lockfiles or add packages.
5) **No refactors.** No formatting sweeps or rename-only changes.

---

## 2) Scope Lock (Hard)
### Allowed
- Edit exactly one file:
  - `modules/platform-admin/src/org-mapping/org-mapping.controller.ts`

### Forbidden
- Any file outside the above
- `package.json` / `package-lock.json`
- Any `prisma` schema or migrations
- Any repo-level config files
- Any changes to Bassan.os Core repo

**STOP** if any forbidden change is required.

---

## 3) Evidence-Driven Output (Mandatory)
Every output produced by the agent must include:
1) **Files changed** (exact paths)
2) **What changed** (bullet list)
3) **Why changed** (goal alignment)
4) **Verification steps run** (commands + result summaries)
5) **Diff sanity note** (confirm only expected lines changed)

No extra commentary. No speculation.

---

## 4) Tooling & Commands Discipline
- Always run `git status --porcelain` before and after.
- Always run `git diff --name-only` after changes.
- If `git diff --name-only` shows unexpected files → STOP.
- Always stage files explicitly by path (no `git add .`).

---

## 5) Decision Rules (When to Stop)
Stop and ask for guidance if:
- `SessionGuard` is not available in the repo path expected
- Controller does not compile after change
- RbacGuard requires a different `req.user` structure than assumed
- Any test/build failure occurs that requires touching more files

---

## 6) Output Template (Agent must follow)
Use this exact structure:

### Files Changed
- ...

### Changes Made
- ...

### Why
- ...

### Verification
- Command: ...
  - Result: PASS/FAIL (brief)

### Diff Sanity
- `git diff --name-only` output: ...

---

END
