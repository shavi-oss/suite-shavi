# RFC 003 — UI Tooling Allowlist

## 1. Status & Scope

**Status**: ✅ **SELECTED (BINDING)**
**Scope**: Docs-Only · platform-admin module
**Authority**: Governance Authority
**Date**: 2026-02-10

## 2. Decision Context

RFC 002 authorized the `Vite + React (TypeScript)` stack.
Gate 19 execution authorized the core dependencies (`vite`, `react`, `react-dom`, `typescript`, `@types/react`).
This RFC authorizes strictly necessary _dev-dependencies_ required for the Vite+React build chain to function correctly.
These additions are **BINDING** and **EXCLUSIVE**.

## 3. Authorized Dev-Dependencies (Allowlist Additions)

The following packages are explicitly **AUTHORIZED** as `devDependencies` ONLY:

1.  `@vitejs/plugin-react` (Required for Vite React support)
2.  `@types/react-dom` (Required for TypeScript compilation)

## 4. Binding Constraints

1.  **Strict Limits**: NO other dependency is authorized by this RFC.
2.  **Dev Only**: These must be installed as `devDependencies` (`-D`).
3.  **Governance Chain**: This authorization is an extension of `RFC_002_UI_FRAMEWORK_SELECTION.md` and `GATE_19_AUTHORIZATION.md`.

## 5. Immutable Invariants (Restated)

- **UI → BFF Only**: UI must communicate ONLY with `/api/platform-admin/*`.
- **No Core Access**: References to `/api/v1` or Core base URLs are **FORBIDDEN**.
- **No Core Tokens**: Core JWTs/service tokens must NEVER be accessible to the UI.
- **Deferred Areas**: Dashboard and Settings components remain **DEFERRED** and **UNAUTHORIZED**.

## 6. STOP CONDITIONS (BINDING)

Execution MUST STOP IMMEDIATELY if any of the following occurs:

1.  **Unauthorized Dep**: Installation of any package not listed in RFC 002 or RFC 003.
2.  **Runtime Dep**: Installation of these tools as runtime `dependencies` instead of `devDependencies`.
3.  **Scope Creep**: Creation of UI code outside `modules/platform-admin/client/`.
4.  **Security Violation**: Exposure of Core secrets or tokens in client code.
