# forensic-g9/04_CHANGELOG_PER_FILE.md

## Files Modified

### `src/internal-users/dto/create-internal-user.dto.ts`
- Added `UpdateRoleDto` class (role field) for PATCH /role endpoint

### `src/internal-users/internal-user.repository.ts`
- Added `updateRole(id, role)` method using Prisma `internalUser.update`

### `src/internal-users/internal-user.service.ts`
- Added `ForbiddenException` to NestJS imports
- Added `changeRole(id, newRole, actorRole, userId, correlationId)` method:
  - Fail-closed: throws `ForbiddenException` if non-platform_admin tries to assign platform_admin role
  - Throws `NotFoundException` if user not found
  - Atomic Prisma transaction: `internalUser.update` + `auditService.logAction` (ActionType.update)

### `src/internal-users/internal-user.controller.ts`
- Added `UpdateRoleDto` to import
- Added `PATCH :id/role` endpoint (`changeRole` method):
  - `@RequirePermission(Resource.INTERNAL_USERS, Action.WRITE)` 
  - Reads `actorRole` from `req.user.role` for RBAC enforcement
  - Passes to `internalUserService.changeRole()`

### `client/src/api/platformAdmin.ts`
- Added `updateInternalUserRole(id, role)` API client function
  (getInternalUsers/createInternalUser/getInternalUser/deactivateInternalUser already existed)
- Removed phantom duplicate InternalUser block (bug introduced during initial Gate 9 edit)

### `tests/internal-users.test.mjs` [NEW]
- T1: unauthenticated GET → 401/403
- T2: unauthenticated POST → 401/403
- T3: login → 200 + cookie
- T4: admin list users → 200 array
- T5: admin create user → 200/201 with id
- T6: admin get user by id → 200
- T7: admin change role → 200 (graceful skip pre-deploy)
- T8: admin deactivate → 200 with status=deactivated
- T9: double-deactivate → 400/409 fail-closed
- T10: get non-existent → 404/400

## Files NOT Modified (confirmed clean)
- Prisma schema (InternalUser model already fully defined)
- AuditService (already has tx support)
- RBAC permissions.map.ts (already has INTERNAL_USERS resource)
- SessionGuard (no changes needed — /internal-users not a Core write path)
- App.tsx (already fully wired for USR section)
- InternalUserList/Create/Detail components (already complete)
