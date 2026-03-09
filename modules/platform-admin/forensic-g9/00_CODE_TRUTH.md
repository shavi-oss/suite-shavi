# forensic-g9/00_CODE_TRUTH.md

## BFF State Before Gate 9

### Existing (complete)
- `internal-user.controller.ts` — 4 endpoints (POST create, GET list, GET :id, PATCH :id/deactivate)
- `internal-user.service.ts` — create, findAll, findById, deactivate
- `internal-user.repository.ts` — create, findAll, findById, findByEmail, updateStatus
- `dto/create-internal-user.dto.ts` — CreateInternalUserDto, InternalUserResponseDto
- `@ExplicitAllow()` + `SessionGuard` + `RbacGuard` — all in place

### Missing (Gate 9 gaps)
| File | Gap |
|---|---|
| `dto` | No `UpdateRoleDto` |
| `repository` | No `updateRole()` method |
| `service` | No `changeRole()` method |
| `controller` | No `PATCH :id/role` endpoint |

## Client State Before Gate 9

### Existing (complete)
- `InternalUserList.tsx` — list table with View Details
- `InternalUserCreate.tsx` — create form (name/email/role)
- `InternalUserDetail.tsx` — detail + deactivate button
- `App.tsx` — fully wired USR section (list/detail/create views)

### Missing
| File | Gap |
|---|---|
| `platformAdmin.ts` | No `updateInternalUserRole()` function |

Note: `getInternalUsers`, `createInternalUser`, `getInternalUser`, `deactivateInternalUser` and `InternalUser`/`CreateInternalUserDto` interfaces already existed at lines 102-245.

## Prisma Schema
`InternalUser` model — fully defined with: id, email, name, role (UserRole enum), status (UserStatus enum), createdAt, updatedAt, createdBy.

## RBAC Matrix (unchanged)
- `platform_admin`: WRITE on INTERNAL_USERS → create, deactivate, change role
- `developer_ops`: WRITE on INTERNAL_USERS → create, deactivate, change role (cannot assign platform_admin)
- `support`: READ on INTERNAL_USERS
- `viewer`: READ on INTERNAL_USERS

## Audit Actions
- create → `ActionType.create` + `EntityType.internal_user`
- deactivate → `ActionType.deactivate` + `EntityType.internal_user`
- changeRole → `ActionType.update` + `EntityType.internal_user` (Gate 9 added)
