# Gate 6B — Verification Commands

## Phase 1: Docs-Only (Draft/Review)

```bash
git status --porcelain
# Must be empty or show untracked docs

git diff --name-only
# Must match Allowlist in GATE_6B_AUTHORIZATION.md (5 files)
```

## Phase 2: Execution (BLOCKED)

_These commands are for reference only and CANNOT be run until dependency blocker is resolved._

```bash
# Verify Dependencies (Currently Fails)
grep "passport-jwt" package.json

# Test Validity
npx tsc -p modules/platform-admin/tsconfig.bff.json --noEmit
npm run test:platform-admin
```
