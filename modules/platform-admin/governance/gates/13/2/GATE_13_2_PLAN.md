# GATE 13.2 EXECUTION PLAN — ROOT PACKAGING FIX

## Phase A: Preflight

1. **Git Status**: Verify clean working tree (`git status --porcelain`).
2. **Target Verification**: Confirm `package.json` (ROOT) exists and reads `"main": "index.js"`.
3. **Artifact Verification**: Confirm `dist/index.js` exists.

## Phase B: Single-Line Fix

4. **Modify**: `package.json` (ROOT)
   - Change `"main": "index.js"` to `"main": "dist/index.js"`.

## Phase C: Verification (Lockfile-Safe)

5. **Pack**: `npm pack` (in root).
6. **Temp Install**: Install generated tarball in temp directory.
7. **Import Test**: `node -e "require('suite-shavi')"` (Validate resolution).

## Phase D: Diff Gate

8. **Diff Check**: Verify ONLY `package.json` changed.
9. **Lockfile Check**: Verify `package-lock.json` UNCHANGED.
