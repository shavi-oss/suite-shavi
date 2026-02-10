# Gate 19 — Execution Rules

## 1. Repository Boundaries (Binding for Gate 20+)

### 1.1 UI Surface Path (Strict)

All UI source code, assets, and configurations MUST be contained within:
`modules/platform-admin/client/`

**STOP CONDITION**: Creation of any file outside this directory (e.g., `src/ui`, `client/`, `root`) is **FORBIDDEN**.

### 1.2 Tooling Restrictions (RFC 003)

- **Allowed Tooling**: ONLY dependencies listed in `GATE_19_AUTHORIZATION.md` are permitted.
- **Forbidden**: Any additional linters, formatters, CSS processors, or state libraries are **EXPLICITLY FORBIDDEN**.

### 1.3 API Interaction Rules

- **ALLOWED**: `fetch('/api/platform-admin/...')`
- **FORBIDDEN**: `fetch('/api/v1/...')`
- **FORBIDDEN**: Any reference to `Bassan.os` or `Core` base URLs.

## 2. Token & Security Rules

- **No Core Secrets**: `process.env` in the UI schema must NOT contain Core secrets.
- **No Forwarding**: UI code must NEVER attempt to read or forward Core JWTs.
- **Fail-Closed**: UI must handle 401/403 responses by clearing state and redirecting to the host app login.

## 3. Component Restrictions

- **Dashboard**: No file may be named `*Dashboard*`.
- **Settings**: No file may be named `*Settings*`.

## 4. Verification Commands (For Gate 20)

```bash
# Verify strictly allowed dependencies (Runtime + Dev)
cat package.json | grep -E "vite|react|typescript|@vitejs/plugin-react|@types/react-dom"
# Verify no forbidden API calls
grep -r "/api/v1" modules/platform-admin/client
```
