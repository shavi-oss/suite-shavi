# GATE 13.2 AUTHORIZATION — ROOT PACKAGING FIX

## Scope

- **Target**: Fix packaging entry point failure (`MODULE_NOT_FOUND`).
- **File**: `package.json` (ROOT).
- **Change**: Update `"main"` field from `"index.js"` to `"dist/index.js"`.

## Allowlist (Strict)

1. `package.json` (Root) — "main" field only.
2. Governance Docs (`modules/platform-admin/governance/GATE_13_2_*`).

## STOP Conditions (Hard)

1. `package-lock.json` modification.
2. Dependency changes.
3. Code modification.
4. Core assumptions without contract.

## PASS Criteria

- `npm pack` succeeds.
- `require('suite-shavi')` succeeds in clean environment.
- Zero forbidden diffs.
