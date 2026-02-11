# Gate 31 — Authorization

## Document Control

| Attribute      | Value                             |
| -------------- | --------------------------------- |
| Gate Number    | 31                                |
| Gate Name      | System Shell Implementation       |
| Document Title | GATE_31_AUTHORIZATION             |
| Repo           | Suite (Layer / Product Repo)      |
| Module         | platform-admin                    |
| Status         | BINDING · FAIL-CLOSED             |
| Execution Mode | IMPLEMENTATION · GOVERNANCE-FIRST |
| Authority      | Platform Architecture Governance  |
| Date           | 2026-02-11                        |

---

## 1) Allowed Paths (READ)

Agent MAY read:

```
modules/platform-admin/client/src/**
modules/platform-admin/governance/**
```

---

## 2) Allowed Paths (WRITE)

Agent MAY create/modify:

```
modules/platform-admin/client/src/components/Shell.tsx (NEW)
modules/platform-admin/client/src/components/Header.tsx (NEW)
modules/platform-admin/client/src/components/NavigationRail.tsx (NEW)
modules/platform-admin/client/src/components/WorkspaceContainer.tsx (NEW)
modules/platform-admin/client/src/App.tsx (MODIFY)
modules/platform-admin/governance/GATE_31_PLAN.md (NEW)
modules/platform-admin/governance/GATE_31_AUTHORIZATION.md (NEW)
modules/platform-admin/governance/GATE_31_EXECUTION_REPORT.md (NEW)
modules/platform-admin/governance/GATE_31_VERIFICATION_EVIDENCE.md (NEW)
```

**No other files may be created or modified.**

---

## 3) Forbidden Paths (ABSOLUTE)

Agent MUST NOT modify:

```
modules/platform-admin/package.json
modules/platform-admin/package-lock.json
modules/platform-admin/src/** (BFF)
modules/platform-admin/prisma/**
modules/platform-admin/tests/**
modules/platform-admin/client/src/api/** (PRESERVE)
modules/platform-admin/client/src/utils/** (PRESERVE)
modules/platform-admin/client/src/components/Organization*.tsx (LOGIC PRESERVE)
modules/platform-admin/client/src/components/LoadingState.tsx (PRESERVE)
modules/platform-admin/client/src/components/EmptyState.tsx (PRESERVE)
modules/platform-admin/client/src/components/ErrorState.tsx (PRESERVE)
```

**Any modification = STOP.**

---

## 4) Forbidden Actions

Agent MUST NOT:

- Add dependencies
- Modify lockfiles
- Use routing libraries
- Add localStorage/sessionStorage
- Call Core APIs (`/api/v1`)
- Introduce dashboard UI
- Add charts, KPIs, marketing UI
- Rewrite Organizations component logic
- Add CSS frameworks
- Add design systems

---

## 5) Enforcement Model

### 5.1 Architecture Implementation

Agent is implementing **minimal System Shell** only.

Agent is NOT:

- A designer
- A feature developer
- An optimizer
- A refactor engineer

---

### 5.2 Preservation Rule

**MUST preserve**:

- All existing Organizations UI logic
- All existing error handling
- All existing state management
- All existing API calls
- All existing components (LoadingState, EmptyState, ErrorState)

**ONLY wrap** existing UI in shell structure.

---

## 6) STOP Conditions

**STOP IMMEDIATELY IF**:

- Organization components logic changes
- `package.json` modified
- `/api/v1` usage detected
- localStorage/sessionStorage usage detected
- Dashboard layout introduced
- Multi-shell structure appears
- Existing functionality breaks

**Document and halt. Do NOT proceed.**

---

## 7) Acceptance Criteria

This authorization is considered BINDING when ALL of the following are true:

- [x] Allowed paths explicit (read)
- [x] Allowed paths explicit (write)
- [x] Forbidden paths explicit
- [x] Forbidden actions explicit
- [x] Enforcement model defined
- [x] STOP conditions explicit
- [x] Preservation rule defined

---

## 8) Signature

**Authorized By**: Platform Architecture Governance  
**Date**: 2026-02-11  
**Status**: BINDING · FAIL-CLOSED  
**Authority**: Gate 29.5 System DNA, Gate 30 Root Drift
