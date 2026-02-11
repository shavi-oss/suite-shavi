# Gate 37 — Authorization

## Document Control

| Attribute      | Value                                  |
| -------------- | -------------------------------------- |
| Gate Number    | 37                                     |
| Gate Name      | UI Hardening Completion (Orgs + Audit) |
| Document Title | GATE_37_AUTHORIZATION                  |
| Repo           | Suite (Layer / Product Repo)           |
| Module         | platform-admin                         |
| Status         | BINDING · FAIL-CLOSED                  |
| Date           | 2026-02-11                             |

---

## 1) Allowed Paths (WRITE)

Agent MAY modify:

```
modules/platform-admin/client/src/components/OrganizationList.tsx
modules/platform-admin/client/src/components/OrganizationDetail.tsx
modules/platform-admin/client/src/components/OrganizationCreate.tsx
modules/platform-admin/client/src/components/AuditLogList.tsx
```

Agent MAY create:

```
modules/platform-admin/governance/GATE_37_PLAN.md
modules/platform-admin/governance/GATE_37_AUTHORIZATION.md
modules/platform-admin/governance/GATE_37_EXECUTION_REPORT.md
modules/platform-admin/governance/GATE_37_VERIFICATION_EVIDENCE.md
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
modules/platform-admin/client/src/components/ErrorState.tsx
modules/platform-admin/client/src/components/EmptyState.tsx
modules/platform-admin/client/src/components/LoadingState.tsx
modules/platform-admin/client/src/components/InternalUser*.tsx
modules/platform-admin/client/src/components/RoleList.tsx
modules/platform-admin/client/src/utils/**
modules/platform-admin/src/** (BFF)
modules/platform-admin/prisma/**
modules/platform-admin/tests/**
```

---

## 3) Forbidden Actions

Agent MUST NOT:

- Add dependencies
- Modify lockfiles
- Create new helper files
- Change API layer
- Modify shell components
- Weaken TypeScript types

---

## 4) Implementation Constraints

**MUST**:

- Implement error classification locally inside each component
- Use string-based detection (no status code access)
- Keep onRetry prop present (async no-op for canRetry=false)

**MUST NOT**:

- Create shared classification utilities
- Modify normalizeError in utils/errors.ts
- Change ErrorState interface

---

## 5) STOP Conditions

**STOP IMMEDIATELY IF**:

- New dependency required
- Helper file needed
- API layer changes needed
- Files outside allowlist must be touched

---

## 6) Signature

**Authorized By**: Platform Architecture Governance  
**Date**: 2026-02-11  
**Status**: BINDING · FAIL-CLOSED
