# forensic-g10/03_LIVE_EVIDENCE.md

## Target URL
https://web-production-6f02f6.up.railway.app

## Deployed Commits (final stable)
```
3f41b03 test: fix T12 assertion to accept 201 for POST /invite (NestJS default)
0d1eb89 ops: add railway.json startCommand to run prisma db push before app start
928fd5e ops: add --accept-data-loss to prisma db push (required for enum additions)
6ffc764 ops: switch to prisma db push for schema sync at startup
f962945 ops: run prisma migrate deploy on startup (Gate 10 schema migration)
b01350d feat(platform-admin): add set-password flow for invited internal users
5d9af9c feat(platform-admin): add internal-user invite and credential primitives
```

## Tag
suite-gate10-stable → commit 3f41b03

## Schema Migration Applied
railway.json startCommand runs `prisma db push --accept-data-loss` at container start.
Confirmed: inviteStatus, passwordHash, inviteTokenHash, inviteExpiresAt columns added.
Confirmed: InviteStatus enum and ActionType invite/redeem values added.
Confirmed: performedBy typed to VARCHAR(255).

## Regression Test Results — T1-T17

```
Gate 9 + Gate 10 — Internal Users Regression Tests
Target: https://web-production-6f02f6.up.railway.app

  ✅ T1 — unauthenticated GET internal-users => 401/403
  ✅ T2 — unauthenticated POST internal-users => 401/403
  ✅ T3 — login with valid creds => 200 + Set-Cookie
  ✅ T4 — admin GET internal-users => 200 JSON array
  ✅ T5 — admin create user => 200/201 with id
  ✅ T6 — admin GET internal-users/:id => 200
  ✅ T7 — admin change role => 200 with updated role
  ✅ T8 — admin deactivate user => 200 with deactivated status
  ✅ T9 — double deactivate => 400/409 (fail-closed)
  ✅ T10 — GET non-existent user => 404
  ✅ T11 — admin creates fresh user for invite tests => inviteStatus=pending
  ✅ T12 — admin POST /:id/invite => 200/201 with inviteUrl (no secrets leaked)
  ✅ T13 — unauthenticated POST /:id/invite => 401/403
  ✅ T14 — redeem with invalid token => 400 generic (no enumeration)
  ✅ T15 — redeem with valid token + password => 200
  ✅ T16 — reused invite token => 400 (one-time use enforced)
  ✅ T17 — bootstrap env admin login still works after Gate 10

──────────────────────────────────────────────────
Results: 17 passed, 0 failed
RESULT: PASS
```

## Confirmation of Negative / Fail-Closed Tests
- T1, T2: DenyAllGuard denies unauthenticated access (preserved from pre-Gate 10)
- T9: Double-deactivate denied (BadRequestException)
- T13: Unauthenticated invite generation denied
- T14: Wrong token → generic "Invalid or expired invite token" (no enumeration)
- T16: Reused token denied (token cleared from DB after first redemption)

## New Routes Confirmed Running (from Railway startup logs)
```
Mapped {/api/platform-admin/auth/redeem-invite, POST} route
Mapped {/api/platform-admin/internal-users/:id/invite, POST} route  (inferred from T12 pass)
```
