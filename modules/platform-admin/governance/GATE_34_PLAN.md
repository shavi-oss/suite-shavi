# Gate 34 — Plan

## Document Control

| Attribute      | Value                               |
| -------------- | ----------------------------------- |
| Gate Number    | 34                                  |
| Gate Name      | RBAC UI Surface (Read-Only, Static) |
| Document Title | GATE_34_PLAN                        |
| Repo           | Suite (Layer / Product Repo)        |
| Module         | platform-admin                      |
| Status         | CODE + DOCS · FAIL-CLOSED           |
| Execution Mode | IMPLEMENTATION · GOVERNANCE-FIRST   |
| Authority      | Platform Architecture Governance    |
| Date           | 2026-02-11                          |

---

## 1) Purpose

Add read-only Roles screen displaying the 4 LOCKED roles as STATIC data (no API calls, no editing).

**Scope**: UI ONLY (no BFF endpoints, no database changes).

---

## 2) Scope

### 2.1 In Scope

**UI Components**:

- Roles screen (read-only, static data)
- Display 4 locked roles: platform_admin, developer_ops, support, viewer
- For each role: name, description, access summary

**Navigation**:

- Add "Roles" navigation item to NavigationRail ("ROL")
- Section switching: organizations | users | roles

**Data**:

- Static hardcoded role data (no API calls)
- Role definitions from MODULE_SECURITY_LAWS.md

---

### 2.2 Out of Scope (FORBIDDEN)

**MUST NOT**:

- Add role editing UI
- Add permission matrix UI
- Add mutation actions
- Create BFF endpoints
- Add API calls for roles
- Modify dependencies
- Redesign Shell/Header/WorkspaceContainer

---

## 3) Implementation Requirements

### 3.1 Roles Screen

**Requirements**:

- Display 4 roles as cards or table
- Static data (hardcoded)
- Role information:
  - **platform_admin**: Full access to all platform-admin features
  - **developer_ops**: Read/write orgs & mappings; read-only users; read-only audit
  - **support**: Read-only across resources; read-only audit
  - **viewer**: Read-only across resources; read-only audit
- No network calls
- No editing capabilities
- Calm-first UI (no dashboard widgets)

**Authority**: MODULE_SECURITY_LAWS.md Section 3.2 (RBAC Enforcement)

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
modules/platform-admin/client/src/components/RoleList.tsx (NEW)
modules/platform-admin/client/src/App.tsx (MODIFY)
modules/platform-admin/client/src/components/NavigationRail.tsx (MODIFY)
modules/platform-admin/governance/GATE_34_*.md (4 NEW files)
```

---

## 6) Stop Conditions

**STOP IMMEDIATELY IF**:

- New dependency required
- package.json modified
- API calls needed for roles
- BFF endpoints must be created
- Organizations or Users functionality breaks

---

## 7) Acceptance Criteria

Gate 34 closes ONLY if:

- [x] Roles screen implemented (static data)
- [x] 4 roles displayed with descriptions
- [x] Navigation Rail updated with "ROL" item
- [x] Section switching works (ORG/USR/ROL)
- [x] No new dependencies
- [x] package.json unchanged
- [x] Build succeeds
- [x] Organizations and Users preserved

---

## 8) Signature

**Planned By**: Platform Architecture Governance  
**Date**: 2026-02-11  
**Status**: CODE + DOCS · FAIL-CLOSED  
**Authority**: MODULE_SCOPE_LOCK.md, MODULE_SECURITY_LAWS.md
