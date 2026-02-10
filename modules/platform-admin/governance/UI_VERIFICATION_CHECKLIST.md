# UI Verification Checklist — platform-admin

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Module Name    | platform-admin                          |
| Document Title | UI_VERIFICATION_CHECKLIST               |
| Repo           | Suite (Layer / Product Repo)            |
| Status         | FINAL — REUSABLE VERIFICATION CHECKLIST |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-02-10                              |

---

## 1) Purpose

Provide a reusable verification checklist for all future UI gates in the platform-admin module. This checklist ensures consistent verification of security, scope, and technology stack compliance.

---

## 2) File Path Verification

### 2.1 Allowed Paths Check

**Command**: `git diff --name-only`

**MUST verify**:

- All modified/created files are within `modules/platform-admin/client/`
- No files modified outside `modules/platform-admin/client/`

**STOP if**:

- Any file outside `modules/platform-admin/client/` is modified
- BFF source code (`modules/platform-admin/src/**`) is modified
- Prisma schema or migrations (`modules/platform-admin/prisma/**`) are modified
- Governance documents are modified (unless explicitly authorized)

---

### 2.2 Dependency Check

**Command**: `git diff package.json`

**MUST verify**:

- No changes to `package.json` (output is empty)
- No dependencies added or modified

**STOP if**:

- Any dependency is added to `package.json`
- Any dependency version is changed

---

## 3) Security Verification

### 3.1 Core API Call Check

**Command**: `grep -r "/api/v1" modules/platform-admin/client` (or equivalent)

**MUST verify**:

- No results found (UI does not call Core APIs directly)

**STOP if**:

- Any reference to `/api/v1` is found in client code

---

### 3.2 Token Storage Check

**Commands**:

- `grep -r "localStorage" modules/platform-admin/client`
- `grep -r "sessionStorage" modules/platform-admin/client`

**MUST verify**:

- No results found (UI does not store tokens in client-side storage)

**STOP if**:

- Any reference to `localStorage` or `sessionStorage` is found
- Exception: Non-authentication use cases (e.g., UI preferences) may be allowed with explicit authorization

---

### 3.3 Fail-Closed Behavior Check

**Manual Code Review**:

**MUST verify**:

- 401/403 responses throw error immediately (no retry)
- Error messages are safe (no stack traces, no internal details)
- No fail-open behavior (e.g., showing cached data on auth failure)

**STOP if**:

- Fail-open behavior is detected
- 401/403 responses are retried automatically
- Internal error details are exposed to users

---

### 3.4 Correlation ID Check

**Manual Code Review**:

**MUST verify**:

- Correlation ID is generated for each request
- Correlation ID is included in `X-Correlation-Id` header
- Correlation ID is NOT displayed in user-facing error messages

**STOP if**:

- Correlation ID is missing from requests
- Correlation ID is exposed to users in error messages

---

## 4) Scope Verification

### 4.1 Forbidden Endpoints Check

**Manual Code Review**:

**MUST verify**:

- UI calls ONLY authorized BFF endpoints (per gate authorization)
- No calls to forbidden endpoints (e.g., `/api/platform-admin/org-mappings*` if not authorized)

**STOP if**:

- UI calls endpoints not listed in gate authorization

---

### 4.2 Forbidden Features Check

**Commands**:

- `grep -r "Dashboard" modules/platform-admin/client`
- `grep -r "Settings" modules/platform-admin/client`

**MUST verify**:

- No forbidden features implemented (Dashboard, Settings, Auth/Login UI)

**STOP if**:

- Any forbidden feature is detected

---

## 5) Technology Stack Verification

### 5.1 Routing Library Check

**Commands**:

- `grep -r "react-router" modules/platform-admin/client`
- `grep -r "useNavigate\|useLocation\|useParams" modules/platform-admin/client`

**MUST verify**:

- No routing libraries used
- State-based view switching only

**STOP if**:

- Routing library imports or usage detected

---

### 5.2 State Management Library Check

**Commands**:

- `grep -r "redux\|zustand\|recoil\|jotai" modules/platform-admin/client`

**MUST verify**:

- No state management libraries used
- React state hooks only (`useState`, `useEffect`, etc.)

**STOP if**:

- State management library imports or usage detected

---

### 5.3 HTTP Client Library Check

**Commands**:

- `grep -r "axios\|superagent\|ky" modules/platform-admin/client`

**MUST verify**:

- Native `fetch` API used exclusively
- No HTTP client libraries

**STOP if**:

- HTTP client library imports or usage detected

---

### 5.4 CSS Framework Check

**Commands**:

- `grep -r "tailwind\|bootstrap\|material-ui\|chakra" modules/platform-admin/client`

**MUST verify**:

- Vanilla CSS or inline styles only
- No CSS frameworks

**STOP if**:

- CSS framework imports or usage detected

---

## 6) Behavioral Verification

### 6.1 Loading State Check

**Manual Testing**:

**MUST verify**:

- Loading state displayed during data fetch
- Loading state cleared after response (success or error)
- User actions disabled during loading (e.g., submit button disabled)

---

### 6.2 Error State Check

**Manual Testing**:

**MUST verify**:

- Error state displayed on fetch failure
- Safe error message shown (no internal details)
- Retry button provided (user-driven retry only)

---

### 6.3 Empty State Check

**Manual Testing**:

**MUST verify**:

- Empty state displayed when list returns zero items
- Contextual guidance provided (e.g., "Create Organization" button)

---

## 7) Reusable Checklist Template

**For each UI gate, verify ALL of the following**:

### File Path Compliance

- [ ] `git diff --name-only` shows only `client/**` files
- [ ] `git diff package.json` is empty (no dependencies added)

### Security Compliance

- [ ] `grep -r "/api/v1" modules/platform-admin/client` returns no results
- [ ] `grep -r "localStorage\|sessionStorage" modules/platform-admin/client` returns no results (or authorized exceptions only)
- [ ] Fail-closed behavior on 401/403 verified (code review)
- [ ] Correlation ID included in all requests (code review)
- [ ] Safe error messages verified (code review)

### Scope Compliance

- [ ] UI calls ONLY authorized endpoints (code review)
- [ ] No forbidden features implemented (grep + code review)

### Technology Stack Compliance

- [ ] No routing libraries detected
- [ ] No state management libraries detected
- [ ] No HTTP client libraries detected (native fetch only)
- [ ] No CSS frameworks detected

### Behavioral Compliance

- [ ] Loading states work correctly (manual testing)
- [ ] Error states work correctly (manual testing)
- [ ] Empty states work correctly (manual testing)

---

## 8) Acceptance Criteria

This verification checklist is considered ACTIVE and BINDING when ALL of the following are true:

- [x] File path verification commands are explicit
- [x] Security verification commands are explicit
- [x] Scope verification commands are explicit
- [x] Technology stack verification commands are explicit
- [x] Behavioral verification requirements are explicit
- [x] Reusable checklist template is provided
- [x] STOP conditions are explicit for each check

---

## 9) Signature

**Approved By**: Governance Authority  
**Date**: 2026-02-10  
**Status**: FINAL — REUSABLE VERIFICATION CHECKLIST
