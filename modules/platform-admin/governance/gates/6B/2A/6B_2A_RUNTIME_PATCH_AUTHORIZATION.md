# Gate 6B.2A — Runtime Fail-Closed Router Patch Authorization

> [!CAUTION]
> **CORRECTION NOTICE (2026-02-14)**: Execution **FAILED** or was **REVERTED**.
> See `reports/GATE_6B_2A_CORRECTION_DRIFT_RESOLUTION_REPORT.md` for details.

## 1. Background

During the execution of Gate 6B, it was discovered that the existing `DenyAllGuard` was configured as a "hard fail-closed" guard, returning `false` unconditionally for every request. This behavior, while secure, was overly restrictive for a module-level global guard (`APP_GUARD`), as it prevented subsequent guards (specifically `SessionGuard` and `RbacGuard`) from ever executing.

This resulted in all requests—even those to protected routes—receiving an HTTP 403 Forbidden response immediately, rather than the expected HTTP 401 Unauthorized from `SessionGuard` when credentials were missing.

## 2. Justification

This patch authorized the conversion of `DenyAllGuard` into a **Fail-Closed Router**. This was a necessary runtime wiring correction to enable the intended security chain:

1.  **Check for Guards**: If a route has explicit guards (Opt-In), allowing the request to proceed to those guards.
2.  **Default Deny**: If a route has NO guards, maintaining the unconditional `false` return (Fail-Closed).

**Safety & Compliance Confirmation:**

- **No New Features**: This change only enables the existing guard chain to function as designed.
- **Fail-Closed Preserved**: Unguarded routes are still blocked by default.
- **Contract Adherence**: Does not violate Core contract or JWT assumptions.
- **Zero Drift**: No modification to dependencies, controllers, or route surface area.

## 3. Scope of Change

The following files were authorized for modification under this patch:

1.  `modules/platform-admin/guards/deny-all.guard.ts` (Implementation of Router Logic)
2.  `modules/platform-admin/tests/unit/guards/deny-all.guard.spec.ts` (Unit Tests)
3.  `modules/platform-admin/tests/security/fail-closed.spec.ts` (Test Wiring Fix)

## 4. Governance Compliance

This patch strictly adhered to the following constraints:

- **[CONFIRMED]** No dependency changes (`package.json` untouched).
- **[CONFIRMED]** No controller modifications.
- **[CONFIRMED]** No route surface expansion.
- **[CONFIRMED]** `ExplicitAllowGuard` remains unchanged (no metadata added).
- **[CONFIRMED]** Core contract remains untouched.

## 5. Verification Evidence

The patch was verified against the strict acceptance criteria:

- **TypeScript Compilation**: Passed (`npx tsc`).
- **Test Suite**: Passed 26 test suites (221 tests) via `npm run test:platform-admin`.
- **Clean State**: `package.json` and `package-lock.json` remained identical to the previous state.

**Status**: AUTHORIZED & EXECUTED
**Date**: 2026-02-14
