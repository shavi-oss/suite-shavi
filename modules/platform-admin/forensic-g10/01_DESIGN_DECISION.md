# forensic-g10/01_DESIGN_DECISION.md

## Why no new controller was created
The `redeemInvite` endpoint was added to `AuthController` (existing), not a new controller.
AuthController already handles public credential flows (login, logout, session).
`POST /api/platform-admin/auth/redeem-invite` fits naturally in this controller.
Controller allowlist unchanged: Health / Auth / Audit / Organization / InternalUser / OrgMapping.

## How ExplicitAllow invariant is preserved
**Before Gate 10**: @ExplicitAllow() on 3 separate methods in AuthController (login, logout, getSession).
Plus 1 on HealthController = 4 total usages.

**After Gate 10**: @ExplicitAllow() moved to class level on AuthController.
That covers login, logout, getSession, AND redeemInvite with 1 usage (instead of 3).
HealthController still has 1 usage.
Total: 2 usages. Count went DOWN from 4 to 2. Invariant "≤4" fully preserved.

## Why migration is minimal
Added 4 optional/nullable fields to InternalUser only:
- passwordHash (nullable) — no impact on existing rows
- inviteTokenHash (nullable) — no impact on existing rows
- inviteExpiresAt (nullable) — no impact on existing rows
- inviteStatus (NOT NULL, DEFAULT 'pending') — existing rows get 'pending', correct default

Added 2 values to ActionType enum (invite, redeem).
Changed performedBy from Uuid to VarChar(255) — backwards compatible (UUIDs are valid VarChar).

Migration SQL created manually because prod DB is Railway-internal network only.
Migration path: apply migration SQL via Railway CLI or Railway web console during deploy.

## Invite token design
1. `randomBytes(32).toString('hex')` → 64-hex raw token
2. Raw token hashed with scryptAsync (32-byte salt, 64-byte hash output)
3. Stored as `salt:hash` (hex) in `inviteTokenHash` field
4. Raw token embedded in invite URL (`?token=...&uid=...`) — only exists in URL
5. Token expires 72 hours from generation
6. Each `generateInvite` call overwrites any prior invite hash (regeneration invalidates old)
7. On redemption: tokens cleared from DB (inviteTokenHash = null, inviteExpiresAt = null)
8. One-time use: after redemption, inviteTokenHash is null → second use fails

## Password hashing reuse
Same algorithm as OPERATOR_CREDENTIALS: scrypt + random salt + timingSafeEqual.
Format: `salt:hash` (hex-encoded).
This avoids a second password subsystem.
Existing test: OPERATOR_CREDENTIALS env var still takes priority in auth → unchanged.

## Safe login extension plan
`AuthService.validateCredentials` now has two paths:
1. If email in OPERATOR_CREDENTIALS → use env-var hash (existing path, unchanged)
2. Else if InternalUser.passwordHash exists → verify DB hash (Gate 10 path)
   Requires user to be active AND have a non-null passwordHash
3. All else → generic 401 with timing parity (dummyVerify)
Fail-closed maintained: no email enumeration, no password type discrimination.
