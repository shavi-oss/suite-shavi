# Gate 36 — Authorization

## Document Control

| Attribute      | Value                            |
| -------------- | -------------------------------- |
| Gate Number    | 36                               |
| Gate Name      | UI Hardening Pass (Fail-Closed)  |
| Document Title | GATE_36_AUTHORIZATION            |
| Repo           | Suite (Layer / Product Repo)     |
| Module         | platform-admin                   |
| Status         | BINDING · FAIL-CLOSED            |
| Execution Mode | HARDENING · GOVERNANCE-FIRST     |
| Authority      | Platform Architecture Governance |
| Date           | 2026-02-11                       |

---

## 1) Allowed Paths (WRITE)

Agent MAY modify:

```
modules/platform-admin/client/src/components/OrganizationList.tsx
modules/platform-admin/client/src/components/OrganizationDetail.tsx
modules/platform-admin/client/src/components/OrganizationCreate.tsx
modules/platform-admin/client/src/components/InternalUserList.tsx
modules/platform-admin/client/src/components/InternalUserDetail.tsx
modules/platform-admin/client/src/components/InternalUserCreate.tsx
modules/platform-admin/client/src/components/RoleList.tsx
modules/platform-admin/client/src/components/AuditLogList.tsx
```

Agent MAY create:

```
modules/platform-admin/governance/GATE_36_PLAN.md
modules/platform-admin/governance/GATE_36_AUTHORIZATION.md
modules/platform-admin/governance/GATE_36_EXECUTION_REPORT.md
modules/platform-admin/governance/GATE_36_VERIFICATION_EVIDENCE.md
```

**No other files may be modified or created.**

---

## 2) Forbidden Paths (ABSOLUTE)

Agent MUST NOT modify:

```
modules/platform-admin/client/package.json
modules/platform-admin/client/package-lock.json
modules/platform-admin/client/src/api/**
modules/platform-admin/client/src/App.tsx
modules/platform-admin/client/src/components/NavigationRail.tsx
modules/platform-admin/client/src/components/Header.tsx
modules/platform-admin/client/src/components/WorkspaceContainer.tsx
modules/platform-admin/src/** (BFF)
modules/platform-admin/prisma/**
modules/platform-admin/tests/**
```

**Any modification = STOP.**

---

## 3) Forbidden Actions

Agent MUST NOT:

- Add dependencies
- Modify lockfiles
- Change API layer
- Modify App.tsx or NavigationRail.tsx
- Use routing libraries
- Add localStorage/sessionStorage
- Weaken TypeScript types

---

## 4) Enforcement Model

### 4.1 Hardening Mode

Agent is **hardening existing UI** for fail-closed consistency.

Agent is NOT:

- Adding new features
- Changing architecture
- Modifying API behavior

---

### 4.2 Consistency Rules

**MUST ensure**:

- All ErrorState calls include `canRetry` prop
- Unauthorized (401/403): `canRetry={false}`
- Network errors: `canRetry={true}`
- Error messages consistent across screens
- Empty states use EmptyState component

---

## 5) STOP Conditions

**STOP IMMEDIATELY IF**:

- New dependency required
- package.json modified
- API layer changes needed
- Files outside allowlist must be touched

**Document and halt. Do NOT proceed.**

---

## 6) Signature

**Authorized By**: Platform Architecture Governance  
**Date**: 2026-02-11  
**Status**: BINDING · FAIL-CLOSED  
**Authority**: MODULE_SCOPE_LOCK.md, Gate 35 Authorization
