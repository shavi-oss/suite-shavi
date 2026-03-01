# UI_SCREEN_INVENTORY.md

**Date:** 2026-02-28T23:11Z | **Repo:** suite-shavi | **Read-only**

---

## ORG Screen — OrganizationList

| Field             | Value                                                                                                                                                                                               |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| Component         | `client/src/components/OrganizationList.tsx`                                                                                                                                                        |
| App.tsx mount     | `section === 'organizations' && orgView === 'list'`                                                                                                                                                 |
| API call          | `getOrganizations()` → `fetchWithCorrelation('/api/platform-admin/organizations')`                                                                                                                  |
| Method            | `GET`                                                                                                                                                                                               |
| Expected response | `Organization[]` `{id, name, status:'active'                                                                                                                                                        | 'suspended', createdAt, updatedAt, createdBy}` |
| Error path        | `fetchWithCorrelation` throws on 401/403 → `normalizeError` maps to `isAuthError:true, canRetry:false` → `ErrorState` renders: **`Error: Unauthorized access. Please contact your administrator.`** |

---

## USR Screen — InternalUserList

| Field             | Value                                                                                    |
| ----------------- | ---------------------------------------------------------------------------------------- |
| Component         | `client/src/components/InternalUserList.tsx`                                             |
| App.tsx mount     | `section === 'users' && userView === 'list'`                                             |
| API call          | `getInternalUsers()` → `fetchWithCorrelation('/api/platform-admin/internal-users')`      |
| Method            | `GET`                                                                                    |
| Expected response | `InternalUser[]` `{id, email, name, role, status, createdAt, updatedAt, createdBy}`      |
| Error path        | Same as ORG — 403 → **`Error: Unauthorized access. Please contact your administrator.`** |

---

## ROL Screen — RoleList ✅ (Works — Static)

| Field         | Value                                                                                    |
| ------------- | ---------------------------------------------------------------------------------------- |
| Component     | `client/src/components/RoleList.tsx`                                                     |
| App.tsx mount | `section === 'roles'`                                                                    |
| API call      | **NONE** — purely static hardcoded data                                                  |
| Data          | 4 roles: `platform_admin`, `developer_ops`, `support`, `viewer` — hardcoded in component |
| Why it works  | No network fetch = no auth required = always renders                                     |
| Note          | "Role definitions are locked and cannot be modified through this interface."             |

---

## AUD Screen — AuditLogList

| Field             | Value                                                                                                                 |
| ----------------- | --------------------------------------------------------------------------------------------------------------------- |
| Component         | `client/src/components/AuditLogList.tsx`                                                                              |
| App.tsx mount     | `section === 'audit'`                                                                                                 |
| API call          | `getAuditLogs()` → `fetchWithCorrelation('/api/platform-admin/audit-logs')`                                           |
| Method            | `GET` (with optional query params: entityType, action, performedBy, from, to)                                         |
| Expected response | `AuditLog[]` `{id, performedAt, action, entityType, entityId, performedBy, result, correlationId}`                    |
| Error path        | 403 → `isUnauthorized(msg)` → `canRetry:false` → **`Error: Unauthorized access. Please contact your administrator.`** |

---

## Auth Routes (reference — not a UI screen)

| Route                                  | ExplicitAllowGuard? | Status                                                   |
| -------------------------------------- | ------------------- | -------------------------------------------------------- |
| `POST /api/platform-admin/auth/login`  | ✅ Yes              | Accessible — accepts any email/password, creates session |
| `POST /api/platform-admin/auth/logout` | ✅ Yes              | Accessible                                               |
| `GET /api/platform-admin/auth/session` | ✅ Yes              | Accessible — validates sessionId cookie                  |
