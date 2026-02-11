# Gate 37 — Plan

## Document Control

| Attribute      | Value                                  |
| -------------- | -------------------------------------- |
| Gate Number    | 37                                     |
| Gate Name      | UI Hardening Completion (Orgs + Audit) |
| Document Title | GATE_37_PLAN                           |
| Repo           | Suite (Layer / Product Repo)           |
| Module         | platform-admin                         |
| Status         | CODE + DOCS · FAIL-CLOSED              |
| Date           | 2026-02-11                             |

---

## 1) Purpose

Complete UI hardening by normalizing ErrorState canRetry semantics in Organization and Audit components.

**Scope**: Match Gate 36.1 semantics (no new helpers, local classification only).

---

## 2) Error Semantics Rules

### 2.1 Unauthorized (401/403)

- `canRetry={false}`
- No retry action
- Detection: message contains "Unauthorized" or "Forbidden"

### 2.2 Not Found (404)

- `canRetry={false}` (deterministic)
- Detection: message contains "not found" or "Not Found"

### 2.3 Validation (400)

- `canRetry={false}` (deterministic)
- Detection: message contains "Bad Request" or "Validation"

### 2.4 Transient/Network/5xx

- `canRetry={true}`
- Functional onRetry
- Default for unclassified errors

---

## 3) Scope

### 3.1 In Scope (MODIFY)

```
modules/platform-admin/client/src/components/OrganizationList.tsx
modules/platform-admin/client/src/components/OrganizationDetail.tsx
modules/platform-admin/client/src/components/OrganizationCreate.tsx
modules/platform-admin/client/src/components/AuditLogList.tsx
```

### 3.2 Out of Scope (FORBIDDEN)

- api/platformAdmin.ts
- App.tsx, NavigationRail.tsx
- ErrorState.tsx, EmptyState.tsx, LoadingState.tsx
- New helper files
- Dependencies

---

## 4) Implementation Pattern

**Local classification functions** (per file):

```typescript
const isUnauthorized = (msg: string) =>
  msg.includes("Unauthorized") || msg.includes("Forbidden");

const isNotFound = (msg: string) =>
  msg.includes("not found") || msg.includes("Not Found");

const isValidationError = (msg: string) =>
  msg.includes("Bad Request") || msg.includes("Validation");
```

**ErrorState usage**:

```typescript
const canRetry = !isUnauthorized(error) && !isNotFound(error)
<ErrorState
  message={error}
  canRetry={canRetry}
  onRetry={canRetry ? retryFn : async () => {}}
/>
```

---

## 5) Acceptance Criteria

Gate 37 closes when:

- [x] All 4 components have error classification
- [x] canRetry=false for 401/403/404/400
- [x] canRetry=true for transient errors
- [x] No new dependencies
- [x] Build succeeds

---

## 6) Signature

**Planned By**: Platform Architecture Governance  
**Date**: 2026-02-11  
**Status**: CODE + DOCS · FAIL-CLOSED
