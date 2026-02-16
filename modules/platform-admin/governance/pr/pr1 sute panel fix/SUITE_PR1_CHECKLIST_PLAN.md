# Suite PR-1 — Checklist + Verification + Plan (No Drift)
Repo: `shavi-oss/suite-shavi`  
Module: `modules/platform-admin`  
Change type: **Code** (minimal)  
Goal: **Remove UI dependency on Core JWT**; use server-side `SessionGuard` (`req.coreJwt`) only.

---

## 0) Outcome (Definition of Done)
- UI/Client **does NOT** send Core JWT.
- `OrgMappingController` uses `req.coreJwt` (provided by `SessionGuard`) instead of reading `Authorization` header.
- `SessionGuard` is enforced on org-mapping routes (fail-closed).
- No dependency changes, no Core repo changes, no unrelated refactors.
- Verification commands PASS.

---

## 1) Scope Lock (Allowed / Forbidden)

### ✅ Allowed changes
- Modify **only**:
  - `modules/platform-admin/src/org-mapping/org-mapping.controller.ts`

### 🚫 Forbidden changes (STOP immediately)
- Any file outside `modules/platform-admin/src/org-mapping/org-mapping.controller.ts`
- Any dependency changes (`package.json`, `package-lock.json`)
- Any config changes (tsconfig/jest/vite/etc.)
- Any schema/db/prisma changes
- Any formatting sweep or unrelated refactor
- Any change to Bassan.os Core repo

**Stop condition:** if you feel forced to touch any forbidden item → STOP and report why.

---

## 2) Branch + Commit Discipline
- Create branch:
  - `module/platform-admin/pr-1-no-ui-core-jwt`
- Commit message (exact):
  - `PR-1: source coreJwt from SessionGuard (no UI Authorization)`

---

## 3) Implementation Plan (Step-by-step)

### Step A — Pre-flight checks (before editing)
Run from repo root:

```bash
git status --porcelain
```

**Expected:** clean working tree.

Record current commit SHA:

```bash
git rev-parse HEAD
```

### Step B — Make the code change (single file)
Edit:

- `modules/platform-admin/src/org-mapping/org-mapping.controller.ts`

Changes required:
1) Add import:
   - `SessionGuard` from `../auth/session.guard`
2) Update controller guards:
   - From `@UseGuards(RbacGuard)`
   - To `@UseGuards(SessionGuard, RbacGuard)`
3) Change how `coreJwt` is sourced:
   - From: `req.headers['authorization']?.replace('Bearer ', '')`
   - To: `req.coreJwt`

**Do NOT change** error message text unless strictly necessary.

### Step C — Diff sanity
Run:

```bash
git diff --name-only
```

**Expected output (ONLY):**
- `modules/platform-admin/src/org-mapping/org-mapping.controller.ts`

Run:

```bash
git diff
```

**Expected:** minimal diff showing the 3 changes above only.

### Step D — Verification (build + TS + tests)
From repo root (adjust if your scripts differ):

```bash
cd modules/platform-admin
npx tsc --noEmit
```

Then build (if defined):

```bash
cd modules/platform-admin
npm run build
```

Then tests (if present/configured):

```bash
cd ../../
npm test
# or module-specific if configured:
# cd modules/platform-admin && npm test
```

### Step E — Runtime smoke test (manual)
- Login normally (session cookie exists).
- Call:
  - `POST /api/platform-admin/org-mappings`
- **Do not send Authorization header at all**.
- Expected:
  - Request should proceed past controller’s `coreJwt` check because `req.coreJwt` is set by SessionGuard.
  - If Session is missing or Core JWT missing in server store, SessionGuard should fail-closed (401).

### Step F — Final repo integrity checks (must pass)
From repo root:

```bash
git status --porcelain
git diff --name-only
```

**Expected:** only the modified controller file is staged/modified.

---

## 4) Staging + Commit (minimal)
Stage the single file only:

```bash
git add modules/platform-admin/src/org-mapping/org-mapping.controller.ts
```

Verify staged diff:

```bash
git diff --cached
```

Commit:

```bash
git commit -m "PR-1: source coreJwt from SessionGuard (no UI Authorization)"
```

---

## 5) PR Description (paste-ready)
Title:
- `PR-1: Remove UI dependency on Core JWT (server-side SessionGuard)`

Body:
- **Problem:** org-mapping controller read Core JWT from request Authorization header (implies UI holds Core JWT).
- **Fix:** require SessionGuard and read `req.coreJwt` (server-side) instead.
- **Scope:** single file change (controller).
- **Verification:** `tsc --noEmit`, build, tests (and smoke test: POST without Authorization).

---

## 6) Anti-Drift Checklist (Must be YES)
- [ ] Only 1 file changed
- [ ] No dependency changes
- [ ] No formatting refactor
- [ ] Guards order is `SessionGuard` then `RbacGuard`
- [ ] `coreJwt` sourced only from `req.coreJwt`
- [ ] Verification commands executed and recorded
- [ ] PR body includes evidence commands + results

---

END
