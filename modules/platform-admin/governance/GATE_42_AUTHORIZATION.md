# Gate 42 — Authorization

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Gate Number    | 42                                      |
| Gate Name      | Runtime Safety Remediation (CODE)       |
| Document Title | GATE_42_AUTHORIZATION                   |
| Repo           | Suite (Layer / Product Repo)            |
| Module         | platform-admin                          |
| Status         | AUTHORIZED                              |
| Execution Mode | STRICT · FAIL-CLOSED · ZERO-SCOPE-DRIFT |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-02-12                              |

---

## 1) Explicit Allowlist

**ALLOWED FILES (CREATE)**:

1. `modules/platform-admin/governance/GATE_42_PLAN.md`
2. `modules/platform-admin/governance/GATE_42_AUTHORIZATION.md`
3. `modules/platform-admin/governance/GATE_42_VERIFICATION_EVIDENCE.md`
4. `modules/platform-admin/governance/GATE_42_EXECUTION_REPORT.md`
5. `modules/platform-admin/client/src/components/ErrorBoundary.tsx`

**ALLOWED FILES (MODIFY)**: 6. `modules/platform-admin/client/src/main.tsx`

**Total Allowed**: 6 files

---

## 2) Explicit Forbidden List

**FORBIDDEN FILES**:

- package.json
- package-lock.json
- vite.config.ts
- All files outside allowlist

**FORBIDDEN ACTIONS**:

- Installing dependencies
- Importing new libraries
- Modifying business logic
- Modifying API calls
- Adding logging
- Adding console.log
- Adding console.error
- Adding telemetry
- Refactoring unrelated code
- Touching any surface (Users / Roles / Audit / Organizations)
- Changing styles
- Changing layout
- Performance improvements
- Suggesting remediation
- Suggesting improvements
- Editing previous gates

---

## 3) Fail-Closed Rules

**ErrorBoundary Component**:

- MUST be a class component
- MUST use TypeScript strict typing
- MUST define `static getDerivedStateFromError(error): State`
- MUST define `componentDidCatch(error, errorInfo): void`
- MUST NOT log error
- MUST NOT expose stack trace
- MUST NOT expose error.message directly
- MUST NOT render raw error object
- MUST NOT use console.log
- MUST NOT use console.error
- MUST NOT send telemetry
- MUST NOT mutate global state
- MUST NOT alter props
- MUST reuse existing ErrorState component
- MUST pass a SAFE generic message only (no dynamic error content)
- MUST set canRetry=false
- MUST NOT include technical details in fallback UI

**main.tsx Modifications**:

- MUST import ErrorBoundary
- MUST wrap <App /> with <ErrorBoundary>
- MUST add window.onerror handler
- MUST add window.onunhandledrejection handler
- Handlers MUST NOT log error
- Handlers MUST NOT expose error details
- Handlers MUST NOT access tokens
- Handlers MUST NOT mutate app state
- Handlers MUST trigger fail-closed behavior safely
- Handlers MUST avoid infinite loops
- MUST NOT add any other changes

**Verification**:

- MUST verify TypeScript compilation passes
- MUST verify build succeeds
- MUST verify ONLY 2 src files modified
- MUST verify NO dependencies touched

---

## 4) Signature

**Authorized By**: Governance Authority  
**Date**: 2026-02-12  
**Status**: AUTHORIZED
