# Gate 33 — Authorization

## Document Control

| Attribute      | Value                             |
| -------------- | --------------------------------- |
| Gate Number    | 33                                |
| Gate Name      | Internal Users UI Implementation  |
| Document Title | GATE_33_AUTHORIZATION             |
| Repo           | Suite (Layer / Product Repo)      |
| Module         | platform-admin                    |
| Status         | BINDING · FAIL-CLOSED             |
| Execution Mode | IMPLEMENTATION · GOVERNANCE-FIRST |
| Authority      | Platform Architecture Governance  |
| Date           | 2026-02-11                        |

---

## 1) Allowed Paths (WRITE)

Agent MAY create/modify:

```
modules/platform-admin/client/src/components/InternalUserList.tsx (NEW)
modules/platform-admin/client/src/components/InternalUserDetail.tsx (NEW)
modules/platform-admin/client/src/components/InternalUserCreate.tsx (NEW)
modules/platform-admin/client/src/App.tsx (MODIFY)
modules/platform-admin/client/src/components/NavigationRail.tsx (MODIFY)
modules/platform-admin/client/src/api/platformAdmin.ts (MODIFY)
modules/platform-admin/governance/GATE_33_PLAN.md (NEW)
modules/platform-admin/governance/GATE_33_AUTHORIZATION.md (NEW)
modules/platform-admin/governance/GATE_33_EXECUTION_REPORT.md (NEW)
modules/platform-admin/governance/GATE_33_VERIFICATION_EVIDENCE.md (NEW)
```

**No other files may be created or modified.**

---

## 2) Forbidden Paths (ABSOLUTE)

Agent MUST NOT modify:

```
modules/platform-admin/client/package.json
modules/platform-admin/client/package-lock.json
modules/platform-admin/src/** (BFF - out of scope)
modules/platform-admin/prisma/**
modules/platform-admin/tests/**
modules/platform-admin/client/src/components/Organization*.tsx (PRESERVE)
modules/platform-admin/client/src/components/Header.tsx (PRESERVE)
modules/platform-admin/client/src/components/WorkspaceContainer.tsx (PRESERVE)
modules/platform-admin/client/src/components/LoadingState.tsx (PRESERVE)
modules/platform-admin/client/src/components/EmptyState.tsx (PRESERVE)
modules/platform-admin/client/src/components/ErrorState.tsx (PRESERVE)
```

**Any modification = STOP.**

---

## 3) Forbidden Actions

Agent MUST NOT:

- Add dependencies
- Modify lockfiles
- Create BFF endpoints
- Use routing libraries
- Add localStorage/sessionStorage
- Call Core APIs (`/api/v1`)
- Introduce dashboard UI
- Modify Shell structure (Header, WorkspaceContainer)
- Break Organizations functionality

---

## 4) Enforcement Model

### 4.1 Implementation Mode

Agent is implementing **UI components only**, following existing Organizations pattern.

Agent is NOT:

- Creating BFF endpoints (out of scope)
- Adding new architecture patterns
- Introducing new dependencies

---

### 4.2 Preservation Rule

**MUST preserve**:

- All existing Organizations UI components
- All existing Shell components (Header, WorkspaceContainer)
- All existing error handling
- All existing state management patterns
- All existing API patterns

**ONLY add** Internal Users UI following same patterns.

---

## 5) STOP Conditions

**STOP IMMEDIATELY IF**:

- New dependency required
- package.json modified
- BFF endpoints needed (out of scope for this gate)
- Routing library needed
- Organizations functionality breaks
- Shell structure changes required

**Document and halt. Do NOT proceed.**

---

## 6) Acceptance Criteria

This authorization is considered BINDING when ALL of the following are true:

- [x] Allowed paths explicit (write)
- [x] Forbidden paths explicit
- [x] Forbidden actions explicit
- [x] Enforcement model defined
- [x] STOP conditions explicit
- [x] Preservation rule defined

---

## 7) Signature

**Authorized By**: Platform Architecture Governance  
**Date**: 2026-02-11  
**Status**: BINDING · FAIL-CLOSED  
**Authority**: MODULE_SCOPE_LOCK.md, Gate 31 Authorization
