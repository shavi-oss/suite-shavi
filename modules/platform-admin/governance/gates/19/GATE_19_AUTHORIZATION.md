# Gate 19 — Authorization

## 1. Authorization Status

**STATUS**: ✅ **RE-AUTHORIZED (DOCS-ONLY)**
**AUTHORITY**: `RFC_002_UI_FRAMEWORK_SELECTION.md` & `RFC_003_UI_TOOLING_ALLOWLIST.md`

## 2. Authorized Scope (For Gate 20+)

The Executor is authorized to perform the following actions **in a future gate (Gate 20)**:

### 2.1 Allowed Dependencies (Values are Binding)

**Runtime Dependencies:**

- `vite`
- `react`
- `react-dom`

**Dev Dependencies:**

- `typescript`
- `@types/react`
- `@types/react-dom`
- `@vitejs/plugin-react`

**STOP CONDITION**: Installation of ANY other dependency (e.g., `redux`, `axios`, `tailwindcss`, `next`) provided in the future gate is **FORBIDDEN** and will trigger an immediate STOP.

### 2.2 Authorized Architecture

- **Type**: Client-Side Rendering (CSR)
- **Path**: `modules/platform-admin/client/`
- **Communication**: UI → BFF (`/api/platform-admin/*`) ONLY.

## 3. Explicit Prohibitions

- ❌ **NO Server-Side Rendering (SSR)**.
- ❌ **NO Direct Core Access** (`/api/v1` forbidden).
- ❌ **NO Core Tokens** in UI.
- ❌ **NO Dashboard/Settings** implementation.

## 4. Requirement

Gate 20 must strictly adhere to the `GATE_19_EXECUTION_RULES.md` defined here.
