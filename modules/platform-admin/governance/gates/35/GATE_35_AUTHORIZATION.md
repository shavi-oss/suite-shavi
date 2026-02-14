# Gate 35 — Authorization

## Document Control

| Attribute      | Value                             |
| -------------- | --------------------------------- |
| Gate Number    | 35                                |
| Gate Name      | Audit Logs UI (Read-Only)         |
| Document Title | GATE_35_AUTHORIZATION             |
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
modules/platform-admin/client/src/components/AuditLogList.tsx (NEW)
modules/platform-admin/client/src/App.tsx (MODIFY)
modules/platform-admin/client/src/components/NavigationRail.tsx (MODIFY)
modules/platform-admin/client/src/api/platformAdmin.ts (MODIFY - add getAuditLogs only)
modules/platform-admin/governance/GATE_35_PLAN.md (NEW)
modules/platform-admin/governance/GATE_35_AUTHORIZATION.md (NEW)
modules/platform-admin/governance/GATE_35_EXECUTION_REPORT.md (NEW)
modules/platform-admin/governance/GATE_35_VERIFICATION_EVIDENCE.md (NEW)
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
modules/platform-admin/client/src/components/InternalUser*.tsx (PRESERVE)
modules/platform-admin/client/src/components/RoleList.tsx (PRESERVE)
modules/platform-admin/client/src/components/Header.tsx (PRESERVE)
modules/platform-admin/client/src/components/WorkspaceContainer.tsx (PRESERVE)
```

**Any modification = STOP.**

---

## 3) Forbidden Actions

Agent MUST NOT:

- Add dependencies
- Modify lockfiles
- Create BFF endpoints
- Add audit log mutation APIs
- Use routing libraries
- Add localStorage/sessionStorage
- Modify Shell structure (Header, WorkspaceContainer)
- Break existing sections (ORG/USR/ROL)

---

## 4) Enforcement Model

### 4.1 Implementation Mode

Agent is implementing **read-only UI** for audit logs with filters.

Agent is NOT:

- Creating audit log endpoints (use existing GET /api/platform-admin/audit-logs)
- Adding audit log mutation capabilities
- Introducing new architecture patterns

---

### 4.2 Preservation Rule

**MUST preserve**:

- All existing Organizations UI components
- All existing Internal Users UI components
- All existing Roles UI component
- All existing Shell components (Header, WorkspaceContainer)
- All existing section navigation patterns

**ONLY add** Audit Logs section with read-only list + filters.

---

## 5) STOP Conditions

**STOP IMMEDIATELY IF**:

- New dependency required
- package.json modified
- BFF endpoints needed (out of scope)
- Existing sections break
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
**Authority**: MODULE_SCOPE_LOCK.md, Gate 34 Authorization
