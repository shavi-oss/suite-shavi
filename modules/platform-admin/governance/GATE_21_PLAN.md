# Gate 21 — UI ↔ BFF Integration (Organizations ONLY) — Plan

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Gate Number    | 21                                      |
| Gate Name      | UI ↔ BFF Integration (Organizations)    |
| Document Title | GATE_21_PLAN                            |
| Repo           | Suite (Layer / Product Repo)            |
| Module         | platform-admin                          |
| Status         | ACTIVE — AWAITING EXECUTION             |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | GATE_21_AUTHORIZATION.md                |
| Effective Date | 2026-02-10                              |

---

## 1) Purpose

Implement UI ↔ BFF integration for **Organization Management ONLY**. This gate connects the existing Vite + React UI scaffold to the existing BFF endpoints for Organizations.

**In-Scope**: Organizations (List, Detail, Create, Suspend/Unsuspend)  
**Out-of-Scope**: All other entities (Org Mappings, Internal Users, Audit Logs)

---

## 2) Explicit In-Scope

### 2.1 UI Features (Organizations ONLY)

**MUST implement ONLY these UI features**:

- Organization List (READ) — Display all Suite organizations
- Organization Detail (READ) — Display single organization details
- Organization Create (WRITE) — Form to create new Suite organization
- Organization Suspend (WRITE) — Action to suspend organization
- Organization Unsuspend (WRITE) — Action to unsuspend organization

### 2.2 BFF Endpoints (Organizations ONLY)

**UI MAY call ONLY these BFF endpoints**:

- `GET /api/platform-admin/organizations` — List all organizations
- `GET /api/platform-admin/organizations/:id` — Get single organization
- `POST /api/platform-admin/organizations` — Create organization
- `PATCH /api/platform-admin/organizations/:id/suspend` — Suspend organization
- `PATCH /api/platform-admin/organizations/:id/unsuspend` — Unsuspend organization

**Evidence**: `MODULE_SCOPE_LOCK.md` Section 2.2

### 2.3 Allowed UI Modifications

**File Path Allowlist** (client/\*\* ONLY):

- `modules/platform-admin/client/src/**/*.tsx`
- `modules/platform-admin/client/src/**/*.ts`
- `modules/platform-admin/client/src/**/*.css`
- `modules/platform-admin/client/index.html` (if necessary)

**MUST NOT modify**:

- Any file outside `modules/platform-admin/client/`
- BFF source code (`modules/platform-admin/src/**`)
- Prisma schema or migrations
- Dependencies or lock files

### 2.4 Allowed UI Interactions

**MUST**:

- Use `fetch` or native browser APIs for HTTP calls
- Call ONLY `/api/platform-admin/*` endpoints
- Handle 401/403 responses with fail-closed behavior (deny UI action)
- Display safe error messages to users (no internal error details)
- Include correlation ID in requests (generated client-side)

**MUST NOT**:

- Call `/api/v1/*` (Core endpoints) directly
- Store JWT or authentication tokens in client-side storage
- Expose Core tokens or internal error details to users
- Implement authentication/login UI
- Implement routing libraries or navigation frameworks
- Add new dependencies

---

## 3) Explicit Out-of-Scope

**MUST NOT implement** (DEFERRED to future gates):

- Org Mapping Management UI
- Internal User Management UI
- Audit Log Viewer UI
- Dashboard or Settings screens
- Authentication/Login UI
- Routing libraries (React Router, etc.)
- State management libraries (Redux, Zustand, etc.)
- HTTP client libraries (axios, etc.)
- Any UI feature not listed in Section 2.1

---

## 4) Forbidden Behaviors (STOP Conditions)

**STOP immediately if**:

- UI calls `/api/v1/*` (Core endpoints) directly
- UI stores or exposes JWT/Core tokens
- UI implements fail-open behavior (e.g., ignoring 401/403)
- Code is added outside `modules/platform-admin/client/`
- Dependencies are added to `package.json`
- BFF source code is modified
- Prisma schema or migrations are modified
- UI features for Org Mappings, Internal Users, or Audit Logs are implemented
- Dashboard or Settings screens are implemented
- Routing libraries are added or implemented

**Action on STOP**: Halt execution, document violation, escalate to Governance Authority.

---

## 5) Execution Boundaries

### 5.1 Technology Stack (Locked)

**MUST use ONLY**:

- Vite + React + TypeScript (CSR)
- Native `fetch` API for HTTP calls
- Vanilla CSS for styling
- No additional dependencies

**Evidence**: `RFC_002_UI_FRAMEWORK_SELECTION.md`, `RFC_003_UI_TOOLING_ALLOWLIST.md`

### 5.2 Security Requirements

**MUST**:

- Fail-closed on 401/403 responses (deny UI action, show safe error)
- Never store JWT or authentication tokens in client-side storage
- Never expose Core tokens or internal error details to users
- Include correlation ID in all BFF requests

**Evidence**: `MODULE_SECURITY_LAWS.md` Section 3.5, `INTEGRATION_CONTRACT_CORE.md` Section 5.2

### 5.3 API Contract

**MUST**:

- Call ONLY `/api/platform-admin/organizations*` endpoints
- Use correct HTTP methods (GET, POST, PATCH)
- Send JSON payloads for POST/PATCH requests
- Handle HTTP status codes correctly (200, 201, 400, 401, 403, 404, 500)

**Evidence**: `MODULE_SCOPE_LOCK.md` Section 2.2

---

## 6) Verification Checklist

**Before closing Gate 21, verify ALL of the following**:

- [ ] UI displays Organization List (fetches from `GET /api/platform-admin/organizations`)
- [ ] UI displays Organization Detail (fetches from `GET /api/platform-admin/organizations/:id`)
- [ ] UI implements Create Organization form (posts to `POST /api/platform-admin/organizations`)
- [ ] UI implements Suspend action (calls `PATCH /api/platform-admin/organizations/:id/suspend`)
- [ ] UI implements Unsuspend action (calls `PATCH /api/platform-admin/organizations/:id/unsuspend`)
- [ ] UI handles 401/403 with fail-closed behavior (denies action, shows safe error)
- [ ] UI does NOT call `/api/v1/*` (verified via `grep -r "/api/v1" modules/platform-admin/client`)
- [ ] UI does NOT store JWT or tokens (verified via code review)
- [ ] UI does NOT implement Org Mappings, Internal Users, or Audit Logs features
- [ ] UI does NOT implement Dashboard or Settings screens
- [ ] No code changes outside `modules/platform-admin/client/` (verified via `git diff --name-only`)
- [ ] No dependencies added (verified via `git diff package.json`)
- [ ] No BFF source code modified (verified via `git diff modules/platform-admin/src`)
- [ ] No Prisma schema or migrations modified (verified via `git diff modules/platform-admin/prisma`)

---

## 7) Evidence Required to Close Gate 21

**MUST provide ALL of the following evidence**:

1. **Command Output**: `git diff --name-only` (prove only `client/**` files modified)
2. **Command Output**: `git diff package.json` (prove no dependencies added)
3. **Command Output**: `grep -r "/api/v1" modules/platform-admin/client` (prove no Core calls)
4. **Command Output**: `grep -r "Dashboard\|Settings" modules/platform-admin/client` (prove no forbidden components)
5. **Manual Verification**: Screenshots or browser recording showing:
   - Organization List UI
   - Organization Detail UI
   - Create Organization form
   - Suspend/Unsuspend actions
   - 401/403 fail-closed behavior (if testable)
6. **Code Review**: Confirm all UI code adheres to security requirements (no token storage, fail-closed on errors)

---

## 8) Acceptance Criteria

Gate 21 is considered COMPLETE when ALL of the following are true:

- [ ] All in-scope UI features are implemented (Section 2.1)
- [ ] All UI features call ONLY allowed BFF endpoints (Section 2.2)
- [ ] All forbidden behaviors are absent (Section 4)
- [ ] All verification checklist items pass (Section 6)
- [ ] All required evidence is provided (Section 7)
- [ ] No STOP conditions triggered during execution

---

## 9) Signature

**Approved By**: Governance Authority  
**Date**: 2026-02-10  
**Status**: ACTIVE — AWAITING EXECUTION
