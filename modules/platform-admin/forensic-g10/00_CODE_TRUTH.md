# forensic-g10/00_CODE_TRUTH.md

## 1) InternalUser model fields (current)
| Field | Type | Notes |
|---|---|---|
| id | String (UUID) | PK |
| email | String unique | login identity |
| name | String | display name |
| role | UserRole enum | platform_admin/developer_ops/support/viewer |
| status | UserStatus enum | active/deactivated |
| createdAt | DateTime | timestamp |
| updatedAt | DateTime | auto-update |
| createdBy | String (UUID) | actor ID |

**No passwordHash field. No invite token fields. No invite status.**

## 2) Current auth login flow
`POST /api/platform-admin/auth/login` → `AuthController.login()`
→ `AuthService.validateCredentials(email, password)`
→ reads `OPERATOR_CREDENTIALS` env var (comma-separated `email|salt:hex` entries)
→ uses `scrypt` (Node.js crypto) with timing-safe compare
→ on success: creates in-memory session, returns `sessionId` httpOnly cookie

**InternalUser DB is only consulted to verify `status !== deactivated`. Password is NOT in DB.**

## 3) Operator credential validation source
`OPERATOR_CREDENTIALS` env var (Railway secret). Format: `email|salt:hash,email2|salt2:hash2`.
This is the only auth path today.

## 4) Password hash utility already exists?
Yes — `crypto.scrypt` + `crypto.timingSafeEqual` + `crypto.randomBytes` already used in `auth.service.ts`.
Same approach can be used for DB-stored password hashes.
Format: `salt:hash` (hex-encoded).

## 5) Invite / token primitives already exist?
No. No invite token, no set-password, no credential redemption exists anywhere in Suite.

## 6) Deactivate behavior and impact on invites/login
Current behavior:
- `PATCH /internal-users/:id/deactivate` sets `status = deactivated`
- `AuthService.validateCredentials` refuses `operator.status === deactivated` → 401

Gate 10 plan:
- deactivated users: cannot generate invite, cannot redeem invite, cannot log in
- deactivated check comes FIRST before any credential/token validation

## 7) Audit log model fields available for invite events
```
PlatformAdminAuditLog {
  id, correlationId, entityType (internal_user), entityId, 
  action (create/update/suspend/unsuspend/link/deactivate),
  performedBy, performedAt, result, metadata (JSON)
}
```
**Missing `invite` and `redeem` action types.** Must add to `ActionType` enum.

## 8) Migration strategy
No `prisma/migrations/` directory exists — project uses `prisma db push`.
Gate 10 will add schema fields and run `prisma db push` to apply to live DB.
