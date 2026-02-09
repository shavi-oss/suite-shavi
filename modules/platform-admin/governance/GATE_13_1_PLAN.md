# GATE 13.1 EXECUTION PLAN — PACKAGING FIX

## Phase A: Preflight

1. **Git Status**: Verify clean working tree (`git status --porcelain`).
2. **Target Verification**: Confirm existence of `modules/platform-admin/package.json`.
3. **Artifact Verification**: Confirm existence of `dist/index.js`.

## Phase B: Single-Line Fix

4. **Modify**: `modules/platform-admin/package.json`
   - Change `"main": "index.js"` to `"main": "dist/index.js"`.

## Phase C: Verification (Lockfile-Safe)

5. **Pack**: `npm pack` (in `modules/platform-admin`).
6. **Temp Install**: Install generated tarball in temp directory.
7. **Import Test**: `node -e "require('suite-shavi')"` (Validate resolution).

## Phase D: Diff Gate

8. **Diff Check**: Verify ONLY `package.json` changed.
9. **Lockfile Check**: Verify `package-lock.json` UNCHANGED.
