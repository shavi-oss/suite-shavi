# Gate 20 — UI Implementation (Scaffold) — Plan

## 1. Objective

Implement the MINIMAL UI scaffold for `platform-admin` using the **Vite + React (TypeScript)** stack authorized in RFC 002.

## 2. Authorized Scope

- **Framework**: Vite + React + TypeScript (CSR Only).
- **Location**: `modules/platform-admin/client/` ONLY.
- **Dependencies**:
  - `react`, `react-dom`
  - `vite`, `typescript`, `@types/react`
  - **Note**: No other dependencies are permitted.

## 3. Strict Prohibitions

- **NO Routing**: Implement static nav list only.
- **NO Login/Auth**: Do not implement.
- **NO SSR**: Client-side rendering only.
- **NO Dashboard/Settings**: Forbidden components.
- **NO Core Calls**: Using `/api/v1` is forbidden.
- **NO Secrets**: No `process.env` in client code.

## 4. Execution Steps

1.  **Dependencies**: Install authorized packages.
2.  **Scaffold**: Create `vite.config.ts`, `tsconfig.json`, `index.html`.
3.  **Source**: Create `main.tsx` and a minimal `App.tsx` shell.
4.  **Verification**: Confirm no forbidden dependencies or code patterns.

## 5. Verification Commands

- `npm ls --depth=0` (Check allowed deps)
- `git diff --name-only` (Check allowed paths)
- `grep -r "/api/v1" modules/platform-admin/client` (Check no Core calls)
- `grep -r "Dashboard\|Settings" modules/platform-admin/client` (Check forbidden components)
