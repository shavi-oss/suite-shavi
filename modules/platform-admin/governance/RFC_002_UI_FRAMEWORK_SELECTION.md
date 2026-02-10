# RFC 002 — UI Framework Selection

## 1. Status & Scope

**Status**: ✅ **SELECTED (BINDING)**
**Scope**: Docs-Only · platform-admin module
**Authority**: Governance Authority
**Date**: 2026-02-09

## 2. Decision Context

The execution of Gate 19 was stopped due to the lack of a mandated frontend framework.
RFC_001 deferred this decision to ensure compliance with `ARCHITECTURAL_LAWS.md`, as defined by its binding principles
 (fail-closed execution, strict boundary separation, and identity isolation).
This RFC formally selects a single technology stack to enforce clear architectural separation and unblock Gate 19 execution.
The selection must prioritize the strict "UI → BFF → Core" isolation model defined in `STACK_BOUNDARIES.md`.

## 3. Options Considered

### Option A: React (Vite) + TypeScript

- **Description**: Single Page Application (SPA) architecture, built with Vite.
- **Fit**: Perfectly aligns with `STACK_BOUNDARIES.md`. The UI runs entirely in the browser, enforcing a physical separation from the backend.
- **Risks**: Requires robust client-side state management.

### Option B: Next.js (App Router)

- **Description**: React framework with Server Components and Server Actions.
- **Fit**: High risk of violating the binding principles in `ARCHITECTURAL_LAWS.md`
by blurring the line between UI and BFF logic
 (e.g., accidental DB access or secret leakage in Server Components).
- **Risks**: Severe architectural drift risk.

### Option C: Angular

- **Description**: Strict, opinionated framework.
- **Fit**: Valid separation, but high complexity overhead for the Platform Admin scope.
- **Risks**: Slower iteration cycles.

## 4. Decision

**Vite + React (TypeScript)** is **SELECTED**.

All other frameworks (including Next.js, Vue, Angular, Svelte) are **EXPLICITLY FORBIDDEN**.
This decision binds the `platform-admin` UI to a pure Client-Side Rendering (CSR) model, consuming the BFF API.

## 5. Binding Constraints

1.  **UI → Core Forbidden**: The UI must NEVER call Core APIs directly as defined by the binding principles in ARCHITECTURAL_LAWS.md(fail-closed execution, strict boundary separation, and identity isolation).
2.  **No Core Tokens**: Core JWTs/service tokens must NEVER be accessible to the UI as defined by the binding principles in ARCHITECTURAL_LAWS.md(fail-closed execution, strict boundary separation, and identity isolation).
3.  **Strict BFF Usage**: The UI must communicate ONLY with the `platform-admin` BFF endpoints defined in `MODULE_SCOPE_LOCK.md`.
4.  **Deferred Components**: Dashboard and Settings components remain **DEFERRED** and MUST NOT be implemented.

## 6. Consequences

### Dependency Allowlist (EXACT)

The following dependencies are the ONLY ones permitted when Gate 19 is reopened:

- vite
- react
- react-dom
- @types/react
- typescript

Any additional dependency (including routers, state libraries, UI kits,
linting tools, or build plugins) is FORBIDDEN and triggers an immediate STOP.

### Allowed Actions (Gate 19 Re-Open)

- Installation of `vite`, `react`, `react-dom`, and `@types/react`.
- Creation of UI source files is permitted ONLY within:
`modules/platform-admin/client/`

Any UI-related file or directory created outside this path
results in an immediate STOP.


### Forbidden Actions

- Installation of any framework other than Vite+React.
- Usage of Server-Side Rendering (SSR) frameworks that mix backend logic.
- Direct database access from UI code.

## 7. STOP CONDITIONS (BINDING)

Execution MUST STOP IMMEDIATELY if any of the following occurs:

1.  **Unauthorized Framework**: `package.json` contains dependencies other than the selected stack.
2.  **BFF Bypass**: UI code contains `fetch` calls to endpoints other than `/api/platform-admin/*`.
3.  **Core Leakage**: Core tokens or secrets are found in client-side code or storage.
4.  **Dashboard/Settings**: Any artifact related to prohibited components is created.
5. Core API Reference:
   Any reference to `/api/v1`, Core base URLs,
   or Core endpoint patterns inside UI code
   results in an immediate STOP.

## 8. Approval & Next Steps

Gate 19 may be **REOPENED** immediately using this RFC as the authorization authority.
The implementation plan must strictly follow the `Vite + React` constraint.

This RFC is the ONLY authority that allows reopening Gate 19.
Any UI execution without an explicit Gate 19 re-authorization
based on this RFC is forbidden.
