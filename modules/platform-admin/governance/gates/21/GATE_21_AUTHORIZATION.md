# Gate 21 — Authorization

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Gate Number    | 21                                      |
| Gate Name      | UI ↔ BFF Integration (Organizations)    |
| Document Title | GATE_21_AUTHORIZATION                   |
| Repo           | Suite (Layer / Product Repo)            |
| Module         | platform-admin                          |
| Status         | ACTIVE — BINDING AUTHORIZATION          |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority                    |
| Effective Date | 2026-02-10                              |

---

## 1) Authorization Status

**STATUS**: ✅ **AUTHORIZED**

**AUTHORITY**:

- `MODULE_SCOPE_LOCK.md` Section 2.1, 2.2
- `RFC_002_UI_FRAMEWORK_SELECTION.md`
- `RFC_003_UI_TOOLING_ALLOWLIST.md`
- `MODULE_SECURITY_LAWS.md` Section 3.5
- `INTEGRATION_CONTRACT_CORE.md` Section 3.1, 5.2

---

## 2) Authorized Scope

The Executor is authorized to implement UI ↔ BFF integration for **Organization Management ONLY**.

### 2.1 File Path Allowlist

**MUST modify ONLY files within**:

- `modules/platform-admin/client/src/**/*.tsx`
- `modules/platform-admin/client/src/**/*.ts`
- `modules/platform-admin/client/src/**/*.css`
- `modules/platform-admin/client/index.html` (if necessary)

**MUST NOT modify**:

- Any file outside `modules/platform-admin/client/`
- `modules/platform-admin/src/**` (BFF source code)
- `modules/platform-admin/prisma/**` (Prisma schema or migrations)
- `package.json` or `package-lock.json` (dependencies)
- Any governance documents

---

### 2.2 API Allowlist

**UI MAY call ONLY these BFF endpoints**:

- `GET /api/platform-admin/organizations`
- `GET /api/platform-admin/organizations/:id`
- `POST /api/platform-admin/organizations`
- `PATCH /api/platform-admin/organizations/:id/suspend`
- `PATCH /api/platform-admin/organizations/:id/unsuspend`

**Evidence**: `MODULE_SCOPE_LOCK.md` Section 2.2

**MUST NOT call**:

- `/api/v1/*` (Core endpoints)
- `/api/platform-admin/org-mappings*`
- `/api/platform-admin/internal-users*`
- `/api/platform-admin/audit-logs*`
- Any endpoint not listed above

---

### 2.3 Allowed UI Features

**MUST implement ONLY**:

- Organization List (READ)
- Organization Detail (READ)
- Organization Create (WRITE)
- Organization Suspend (WRITE)
- Organization Unsuspend (WRITE)

**Evidence**: `MODULE_SCOPE_LOCK.md` Section 2.1

---

### 2.4 Technology Stack (Locked)

**MUST use ONLY**:

- Vite + React + TypeScript (CSR)
- Native `fetch` API for HTTP calls
- Vanilla CSS for styling

**MUST NOT add**:

- Routing libraries (React Router, etc.)
- State management libraries (Redux, Zustand, etc.)
- HTTP client libraries (axios, etc.)
- CSS frameworks (Tailwind, Bootstrap, etc.)
- Any new dependencies

**Evidence**: `RFC_002_UI_FRAMEWORK_SELECTION.md`, `RFC_003_UI_TOOLING_ALLOWLIST.md`

---

## 3) Hard STOP Conditions

**STOP immediately and escalate if ANY of the following occur**:

### 3.1 API Boundary Violations

- UI calls `/api/v1/*` (Core endpoints) directly
- UI calls BFF endpoints for Org Mappings, Internal Users, or Audit Logs
- UI calls any endpoint not listed in Section 2.2

### 3.2 Security Violations

- UI stores JWT or authentication tokens in client-side storage (localStorage, sessionStorage, cookies)
- UI exposes Core tokens or internal error details to users
- UI implements fail-open behavior (e.g., ignoring 401/403 responses)
- UI bypasses authorization checks

### 3.3 Scope Violations

- Code modified outside `modules/platform-admin/client/`
- BFF source code modified (`modules/platform-admin/src/**`)
- Prisma schema or migrations modified
- Dependencies added to `package.json`
- UI features implemented for Org Mappings, Internal Users, or Audit Logs
- Dashboard or Settings screens implemented
- Authentication/Login UI implemented

### 3.4 Technology Stack Violations

- Routing libraries added or implemented
- State management libraries added or implemented
- HTTP client libraries added or implemented
- CSS frameworks added or implemented
- Any dependency added to `package.json`

**Action on STOP**: Halt execution immediately, document violation, escalate to Governance Authority.

---

## 4) Security Requirements (Binding)

**MUST**:

- Fail-closed on 401/403 responses (deny UI action, display safe error message)
- Never store JWT or authentication tokens in client-side storage
- Never expose Core tokens or internal error details to users
- Include correlation ID in all BFF requests (generated client-side, UUID v4)
- Display safe error messages to users (no stack traces, no internal error codes)

**Evidence**: `MODULE_SECURITY_LAWS.md` Section 3.5, `INTEGRATION_CONTRACT_CORE.md` Section 5.2

---

## 5) Deviation Policy

**Any deviation from this authorization requires a new Gate.**

Examples of deviations requiring a new Gate:

- Implementing UI features for Org Mappings, Internal Users, or Audit Logs
- Adding routing libraries or state management libraries
- Calling additional BFF endpoints not listed in Section 2.2
- Modifying BFF source code or Prisma schema
- Adding dependencies to `package.json`

**Action on deviation**: STOP immediately, create new Gate plan, request approval.

---

## 6) Acceptance Criteria

This authorization is considered ACTIVE and BINDING when ALL of the following are true:

- [x] File path allowlist is explicit and enforceable
- [x] API allowlist is explicit and enforceable
- [x] Allowed UI features are explicit and limited to Organizations ONLY
- [x] Technology stack is locked (Vite + React + TypeScript, no new dependencies)
- [x] Hard STOP conditions are explicit and enforceable
- [x] Security requirements are explicit and binding
- [x] Deviation policy is documented
- [x] All evidence links are provided

---

## 7) Signature

**Approved By**: Governance Authority  
**Date**: 2026-02-10  
**Status**: ACTIVE — BINDING AUTHORIZATION
