# GATE 13.1 AUTHORIZATION — PACKAGING FIX

## Scope

- **Target**: Fix packaging entry point failure (`MODULE_NOT_FOUND`).
- **File**: `modules/platform-admin/package.json` (Target).
- **Change**: Update `"main"` field from `"index.js"` to `"dist/index.js"`.

## Allowlist (Strict)

1. `modules/platform-admin/package.json` (Modification ONLY).
2. Governance Docs (`GATE_13_1_*`).

## STOP Conditions (Hard)

1. `package-lock.json` modification.
2. Dependency changes.
3. Code modification (src/tests).
4. **Scope Violation**: Reading/Modifying files outside `modules/platform-admin/**`.
5. **Assumption**: Assuming Core behavior without contract.

## PASS Criteria

- `npm pack` succeeds.
- `require('suite-shavi')` succeeds in clean environment.
- Zero allowlist violations.
