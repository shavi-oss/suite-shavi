# Gate 35 — Plan

## Document Control

| Attribute      | Value                             |
| -------------- | --------------------------------- |
| Gate Number    | 35                                |
| Gate Name      | Audit Logs UI (Read-Only)         |
| Document Title | GATE_35_PLAN                      |
| Repo           | Suite (Layer / Product Repo)      |
| Module         | platform-admin                    |
| Status         | CODE + DOCS · FAIL-CLOSED         |
| Execution Mode | IMPLEMENTATION · GOVERNANCE-FIRST |
| Authority      | Platform Architecture Governance  |
| Date           | 2026-02-11                        |

---

## 1) Purpose

Implement read-only Audit Logs viewer UI inside existing Shell.

**Scope**: UI + read-only API client function (no BFF changes).

---

## 2) Scope

### 2.1 In Scope

**UI Components**:

- Audit Logs list/table (read-only)
- Filter controls: entityType, action, performedBy, date range (from/to)
- Apply/Clear filter buttons
- Fail-closed states (loading, error, empty, unauthorized)

**API Client**:

- Add `getAuditLogs(filters)` function to `platformAdmin.ts`
- Follow existing correlation ID and fail-closed pattern
- Query params for filters

**Navigation**:

- Add "Audit Logs" navigation item to NavigationRail ("AUD")
- Section switching: organizations | users | roles | audit

---

### 2.2 Out of Scope (FORBIDDEN)

**MUST NOT**:

- Add write/mutation of audit logs
- Create BFF endpoints (use existing GET /api/platform-admin/audit-logs)
- Add new dependencies
- Add dashboard widgets
- Modify Shell structure (Header, WorkspaceContainer)

---

## 3) Implementation Requirements

### 3.1 Audit Log List

**Requirements**:

- Table with columns: PerformedAt, Action, EntityType, EntityId, PerformedBy, Result
- Optional: CorrelationId (secondary/expandable)
- Filter controls:
  - entityType select (organization, org_mapping, internal_user)
  - action select (create, update, suspend, unsuspend, link, deactivate)
  - performedBy text input
  - date from/to inputs
  - Apply + Clear buttons
- Uses existing LoadingState, EmptyState, ErrorState components
- Fail-closed: 401/403 → unauthorized, empty → empty state

**Authority**: MODULE_SCOPE_LOCK.md Section 2.1 (Audit Logs List)

---

## 4) Technical Constraints

**Stack Lock**:

- Vite + React only
- No new dependencies
- Inline styles (follow existing pattern)
- State-based section switching (no routing library)

**Authority**: Gate 31.1 Authorization (Dependency Allowlist)

---

## 5) Allowed Write Paths

```
modules/platform-admin/client/src/components/AuditLogList.tsx (NEW)
modules/platform-admin/client/src/App.tsx (MODIFY)
modules/platform-admin/client/src/components/NavigationRail.tsx (MODIFY)
modules/platform-admin/client/src/api/platformAdmin.ts (MODIFY - add getAuditLogs)
modules/platform-admin/governance/GATE_35_*.md (4 NEW files)
```

---

## 6) Stop Conditions

**STOP IMMEDIATELY IF**:

- New dependency required
- package.json modified
- BFF endpoints must be created (out of scope)
- Existing sections (ORG/USR/ROL) break

---

## 7) Acceptance Criteria

Gate 35 closes ONLY if:

- [x] Audit Logs list implemented
- [x] Filter controls implemented
- [x] Navigation Rail updated with "AUD" item
- [x] Section switching works (ORG/USR/ROL/AUD)
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
