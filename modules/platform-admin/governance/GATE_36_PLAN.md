# Gate 36 — Plan

## Document Control

| Attribute      | Value                            |
| -------------- | -------------------------------- |
| Gate Number    | 36                               |
| Gate Name      | UI Hardening Pass (Fail-Closed)  |
| Document Title | GATE_36_PLAN                     |
| Repo           | Suite (Layer / Product Repo)     |
| Module         | platform-admin                   |
| Status         | CODE + DOCS · FAIL-CLOSED        |
| Execution Mode | HARDENING · GOVERNANCE-FIRST     |
| Authority      | Platform Architecture Governance |
| Date           | 2026-02-11                       |

---

## 1) Purpose

Unify fail-closed UI behavior across all sections (ORG/USR/ROL/AUD).

**Scope**: UI consistency only (no BFF changes, no new dependencies).

---

## 2) Hardening Rules

### 2.1 Unauthorized (401/403)

- **Must** show ErrorState with `canRetry={false}`
- **Must NOT** offer Retry action
- Message text: consistent phrase across all screens

### 2.2 Not Found (404)

- Detail screens: `canRetry={false}` (deterministic)
- Message: clear "not found" text

### 2.3 Network/5xx Errors

- **Must** show ErrorState with `canRetry={true}`
- **Must** provide functional `onRetry`

### 2.4 Empty State

- Use EmptyState consistently
- CTA allowed: ORG list/create, USR list/create only
- No CTA: ROL, AUD (read-only)
- Text: calm-first, not marketing

### 2.5 TypeScript Correctness

- All ErrorState usages **must** supply required props
- No type weakening

---

## 3) Scope

### 3.1 In Scope

**Review and harden**:

- OrganizationList, OrganizationDetail, OrganizationCreate
- InternalUserList, InternalUserDetail, InternalUserCreate
- RoleList (static, minimal changes)
- AuditLogList
- ErrorState, EmptyState, LoadingState (if needed)

**Ensure**:

- Consistent error messages
- Correct canRetry semantics
- TypeScript compliance

---

### 3.2 Out of Scope (FORBIDDEN)

- New dependencies
- BFF changes
- API layer modifications
- New architecture patterns
- Storage (localStorage/sessionStorage)

---

## 4) Allowed Write Paths

```
modules/platform-admin/client/src/components/OrganizationList.tsx
modules/platform-admin/client/src/components/OrganizationDetail.tsx
modules/platform-admin/client/src/components/OrganizationCreate.tsx
modules/platform-admin/client/src/components/InternalUserList.tsx
modules/platform-admin/client/src/components/InternalUserDetail.tsx
modules/platform-admin/client/src/components/InternalUserCreate.tsx
modules/platform-admin/client/src/components/RoleList.tsx
modules/platform-admin/client/src/components/AuditLogList.tsx
modules/platform-admin/governance/GATE_36_*.md (4 NEW files)
```

---

## 5) Stop Conditions

**STOP IMMEDIATELY IF**:

- New dependency required
- package.json modified
- BFF changes needed
- Files outside allowlist must be touched

---

## 6) Acceptance Criteria

Gate 36 closes ONLY if:

- [x] All ErrorState usages have canRetry prop
- [x] Unauthorized errors use canRetry={false}
- [x] Network errors use canRetry={true}
- [x] Error messages consistent
- [x] Empty states consistent
- [x] No new dependencies
- [x] Build succeeds

---

## 7) Signature

**Planned By**: Platform Architecture Governance  
**Date**: 2026-02-11  
**Status**: CODE + DOCS · FAIL-CLOSED  
**Authority**: MODULE_SCOPE_LOCK.md, MODULE_SECURITY_LAWS.md
