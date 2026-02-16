# Suite PR-1.1 — Checklist + Verification + Plan (Test Stabilization)
Repo: `shavi-oss/suite-shavi`  
Module: `modules/platform-admin`  
Change type: **Tests only** (follow-up to PR-1)  
Goal: Make unit tests pass after PR-1 changed JWT sourcing and added SessionGuard on controller routes.

---

## 0) Background (code-sourced)
PR-1 changed org-mapping controller behavior to source `coreJwt` from `req.coreJwt` (server-side) rather than from `req.headers.authorization`. The existing unit test still mocks the header and expects JWT extraction from it fileciteturn36file0L39-L53.

Additionally, because the controller now has `@UseGuards(SessionGuard, RbacGuard)`, the Nest testing module attempts to resolve guard dependencies. `SessionGuard` requires `SessionService` + `JwtStorageService` fileciteturn36file2L9-L12, and `RbacGuard` requires `Reflector` fileciteturn37file0L44-L45.

---

## 1) Outcome (Definition of Done)
- Jest test suite passes (no failures).
- Tests assert `req.coreJwt` usage (not `authorization` header).
- Test module compiles by providing mocks for guard dependencies.
- No production code changes.

---

## 2) Scope Lock
### ✅ Allowed changes
- `modules/platform-admin/tests/unit/controllers/org-mapping.controller.spec.ts`

### 🚫 Forbidden changes
- Any `src/**` files
- Dependencies (`package.json`, lockfiles)
- Config (`tsconfig`, jest config)
- Any other tests

Stop immediately if scope expands.

---

## 3) Implementation Plan
### Step A — Pre-flight
```bash
git status --porcelain
git rev-parse HEAD
```

### Step B — Update test module providers (compile fix)
In `beforeEach`, add providers for:
- `SessionGuard` + mocks for `SessionService` and `JwtStorageService` fileciteturn36file2L9-L12
- `RbacGuard` + `Reflector` fileciteturn37file0L44-L45

### Step C — Update request mocks (behavior fix)
Replace `headers.authorization` mocks with `coreJwt` on request object, e.g.
- from: `headers: { authorization: 'Bearer ...' }` fileciteturn36file0L40-L43
- to: `coreJwt: 'jwt-token-123'`

Update expectations:
- from `... 'jwt-token-123' ...` extracted from header fileciteturn36file0L51-L53
- to `... 'jwt-token-123' ...` directly read from `req.coreJwt`

Update test title text accordingly (remove “from Authorization header”).

### Step D — Verification
```bash
cd modules/platform-admin
npx jest --no-coverage
```

### Step E — Diff sanity
```bash
git diff --name-only
# expected: modules/platform-admin/tests/unit/controllers/org-mapping.controller.spec.ts ONLY
```

---

## 4) Staging + Commit
Stage only the test file:
```bash
git add modules/platform-admin/tests/unit/controllers/org-mapping.controller.spec.ts
git diff --cached --name-only
git diff --cached
```

Commit message (format: area: action description):
```bash
git commit -m "platform-admin: fix org-mapping controller tests for req.coreJwt"
```

---

## 5) Anti-Drift Checklist
- [ ] Only 1 file changed (spec file)
- [ ] No src/ changes
- [ ] Jest passes
- [ ] No header-based JWT assumptions remain

---

END
