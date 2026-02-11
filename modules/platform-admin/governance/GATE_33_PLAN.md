# Gate 33 — Plan

## Document Control

| Attribute      | Value                             |
| -------------- | --------------------------------- |
| Gate Number    | 33                                |
| Gate Name      | Internal Users UI Implementation  |
| Document Title | GATE_33_PLAN                      |
| Repo           | Suite (Layer / Product Repo)      |
| Module         | platform-admin                    |
| Status         | CODE + DOCS · FAIL-CLOSED         |
| Execution Mode | IMPLEMENTATION · GOVERNANCE-FIRST |
| Authority      | Platform Architecture Governance  |
| Date           | 2026-02-11                        |

---

## 1) Purpose

Implement Internal Users UI screens inside existing Shell (Header + Navigation Rail + Workspace Container).

**Scope**: UI ONLY (no new BFF endpoints in this gate).

---

## 2) Scope

### 2.1 In Scope

**UI Components**:

- Internal User List (table view)
- Internal User Detail (view single user, deactivate action)
- Create Internal User Form (name, email, role)
- Fail-closed UI states (loading, error, empty, unauthorized)

**Navigation**:

- Add "Users" navigation item to NavigationRail
- Section switching between Organizations and Users

**API Client**:

- Add Internal Users API functions to `platformAdmin.ts`
- Follow existing correlation ID and fail-closed pattern

---

### 2.2 Out of Scope (FORBIDDEN)

**MUST NOT**:

- Add new dependencies
- Modify package.json or package-lock.json
- Create new BFF endpoints (use existing pattern)
- Add routing library
- Introduce dashboard UI
- Modify Header or Shell structure (except adding nav item)
- Call Core APIs directly

---

## 3) Implementation Requirements

### 3.1 Internal User List

**Requirements**:

- Table with columns: Name, Email, Role, Status, Created Date, Actions
- "Create User" button
- "View Details" action per row
- Uses existing LoadingState, EmptyState, ErrorState components
- Fail-closed: 401/403 → error, empty → empty state

**Authority**: MODULE_SCOPE_LOCK.md Section 2.1 (Internal User List)

---

### 3.2 Internal User Detail

**Requirements**:

- Display: name, email, role, status, createdAt, updatedAt, createdBy
- "Deactivate" button (only if status = active)
- "Back to List" button
- Fail-closed: 404 → error, 401/403 → unauthorized

**Authority**: MODULE_SCOPE_LOCK.md Section 2.1 (User Detail)

---

### 3.3 Create Internal User Form

**Requirements**:

- Fields: name (text), email (email), role (select)
- Role options: platform_admin, developer_ops, support, viewer
- "Create" and "Cancel" buttons
- Validation: all fields required
- Fail-closed: API error → show error, no optimistic updates

**Authority**: MODULE_SCOPE_LOCK.md Section 2.1 (Create Internal User Form)

---

## 4) Technical Constraints

**Stack Lock**:

- Vite + React only
- No new dependencies
- Inline styles (follow existing pattern)
- State-based view switching (no routing library)

**Authority**: Gate 31.1 Authorization (Dependency Allowlist)

---

## 5) Allowed Write Paths

```
modules/platform-admin/client/src/components/InternalUserList.tsx (NEW)
modules/platform-admin/client/src/components/InternalUserDetail.tsx (NEW)
modules/platform-admin/client/src/components/InternalUserCreate.tsx (NEW)
modules/platform-admin/client/src/App.tsx (MODIFY)
modules/platform-admin/client/src/components/NavigationRail.tsx (MODIFY)
modules/platform-admin/client/src/api/platformAdmin.ts (MODIFY)
modules/platform-admin/governance/GATE_33_*.md (4 NEW files)
```

---

## 6) Stop Conditions

**STOP IMMEDIATELY IF**:

- New dependency required
- package.json modified
- Routing library needed
- BFF endpoints must be created (out of scope)
- Existing Organizations functionality breaks

---

## 7) Acceptance Criteria

Gate 33 closes ONLY if:

- [x] Internal User List implemented
- [x] Internal User Detail implemented
- [x] Create Internal User Form implemented
- [x] Navigation Rail updated with Users item
- [x] Section switching works (Organizations ↔ Users)
- [x] All fail-closed states implemented
- [x] No new dependencies
- [x] package.json unchanged
- [x] Build succeeds

---

## 8) Signature

**Planned By**: Platform Architecture Governance  
**Date**: 2026-02-11  
**Status**: CODE + DOCS · FAIL-CLOSED  
**Authority**: MODULE_SCOPE_LOCK.md, MODULE_SECURITY_LAWS.md
