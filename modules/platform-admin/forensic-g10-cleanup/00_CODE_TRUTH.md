# forensic-g10-cleanup/00_CODE_TRUTH.md

## 1. Prisma InternalUser Schema (Current Truth)

```prisma
model InternalUser {
  id               String       @id @default(uuid()) @db.Uuid
  email            String       @unique @db.VarChar(255)
  name             String       @db.VarChar(255)
  role             UserRole
  status           UserStatus   @default(active)
  createdAt        DateTime     @default(now()) @db.Timestamptz
  updatedAt        DateTime     @updatedAt @db.Timestamptz
  createdBy        String       @db.Uuid
  passwordHash     String?      @db.VarChar(255)
  inviteTokenHash  String?      @db.VarChar(255)
  inviteExpiresAt  DateTime?    @db.Timestamptz
  inviteStatus     InviteStatus @default(pending)
}

enum InviteStatus { pending | invited | active | expired }
```

Schema is correct and complete. All Gate 10 fields present.

## 2. Does @prisma/client expose InviteStatus?

YES. `npx prisma generate` exits 0. InviteStatus is exported from @prisma/client.
Confirmed: `internal-user.service.ts` imports `InviteStatus` from `@prisma/client` without error (tsc exit 0).

## 3. Are generated Prisma types stale locally or in repo?

NOT stale locally. `prisma generate` exits 0. BFF tsc exits 0.
InviteStatus, passwordHash, inviteTokenHash, inviteExpiresAt, inviteStatus all available in generated types.

## 4. Exact current login flow in AuthService

Dual-path `validateCredentials`:
1. `findByEmail(email)` — always queries DB first
2. If not found or deactivated → `dummyVerify()` + generic 401
3. Parse `OPERATOR_CREDENTIALS` env var → email|salt:hash map
4. If email in env map → scrypt verify against stored hash → Path 1 (bootstrap admin)
5. Else if `operator.passwordHash` exists → scrypt verify → Path 2 (DB-backed invited user)
6. Else → `dummyVerify()` + 401 (invite not yet redeemed)
7. All failures: generic "Unauthorized" 401, constant-time via scrypt/dummyVerify

CORRECT. No logic bugs found.

## 5. How redeem-invite works

`POST /api/platform-admin/auth/redeem-invite` (AuthController) →
- Validates dto (uid, token, password present; passwords match; length ≥ 12)
- Delegates to `InternalUserService.redeemInvite(uid, rawToken, password, correlationId)`
- Service checks: user exists + active, inviteTokenHash present, not expired
- Timing-safe scrypt verify against stored hash
- Hash new password with fresh salt → store in `passwordHash`
- Clear `inviteTokenHash`, `inviteExpiresAt` → set `inviteStatus=active`
- Audit log (ActionType.redeem)
- Returns 200 `{ message: 'Password set successfully. You may now log in.' }`
- One-time use enforced (token cleared after redemption)

CORRECT. No logic bugs found.

## 6. ExplicitAllow invariant

**Before Gate 10**: @ExplicitAllow() on 3 methods in AuthController + 1 on HealthController = 4 total
**After Gate 10**: @ExplicitAllow() at class level on AuthController + 1 on HealthController = 2 total

COUNT WENT DOWN from 4 to 2. NOT widened.
The governance comment in auth.controller.ts explicitly documents this change.

Public surface:
- HealthController: GET /health (always was public)
- AuthController class: login + logout + getSession + redeem-invite (4 routes, 1 @ExplicitAllow() usage)

Note: logout and getSession were already public before Gate 10 (they had @ExplicitAllow() method-level).
redeem-invite added as 4th route under same class-level decorator.
Net new public surface: only `/auth/redeem-invite` (expected and intentional).

## 7. Controller inventory and guard allowlist

Controllers: HealthController, InternalUserController, OrgMappingController, OrganizationController, AuditController, AuthController (6 total)
APP_GUARD: DenyAllGuard (fail-closed)
SessionGuard: used on protected routes

NO new controllers introduced in Gate 10. Controller count unchanged from Gate 9.

## 8. Schema rollout method

Gate 10 used `prisma db push --accept-data-loss` in Railway startup via:
- `railway.json` → `"startCommand"`: runs `prisma db push ... --accept-data-loss && node dist/.../main.js`
- Also set in `Dockerfile CMD` (redundant, railway.json takes precedence)

The `--accept-data-loss` flag was necessary for adding the `InviteStatus` enum type.
This is the established project pattern (project was initialized with db push, no migration history exists).
This does NOT cause actual data loss — all changes are additive (new nullable columns + new enum).

ISSUE: `--accept-data-loss` is a footgun flag that permanently allows data-destructive operations to happen silently in future pushes if schema changes are ever non-additive. Needs hardening.

## 9. Where are current TypeScript errors?

**Client tsc exit 2** — 9 errors across 4 files:

1. `InternalUserCreate.tsx:2` — `CreateInternalUserDto` not exported from platformAdmin.ts
2. `InternalUserDetail.tsx:2` — `InternalUser` not exported from platformAdmin.ts
3. `InternalUserList.tsx:2` — `InternalUser` not exported from platformAdmin.ts
4. `OrgMappingSection.tsx:156,161,164,168,172` — state type comparison errors (pre-existing, not Gate 10)
5. `SetPasswordPage.tsx:1` — `useEffect` imported but never used (unused import)

**BFF tsc exit 0** — ZERO errors.

## 10. Which errors are stale/local-only vs actual repo issues?

ALL reported errors are real repo issues (not local-only):
- `InternalUser` and `CreateInternalUserDto` not exported = structural gap in platformAdmin.ts interface visibility
- `OrgMappingSection.tsx` state errors = pre-existing from before Gate 10, NOT introduced by Gate 10
- `useEffect` unused = trivial cleanup

NONE are stale generated-type issues. The Prisma generated client is correct.
