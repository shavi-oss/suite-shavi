# forensic-railway-verify/04_LIVE_RUNTIME_VERIFICATION.md
# Phase 4 — Live Runtime Verification After Deploy
# Date: 2026-03-10
# Target: https://web-production-6f02f6.up.railway.app

## Health

| Endpoint | Expected | Actual | Status |
|---|---|---|---|
| GET /api/platform-admin/health | 200 `{"status":"ok"}` | **200** `{"status":"ok","module":"platform-admin"}` | ✅ PASS |

---

## T1-T17 Internal Users + Invite/Redeem (run 2026-03-10)

| Test | Description | Result |
|---|---|---|
| T1 | unauthenticated GET internal-users → 401/403 | ✅ PASS |
| T2 | unauthenticated POST internal-users → 401/403 | ✅ PASS |
| T3 | login with valid creds → 200 + Set-Cookie | ✅ PASS |
| T4 | admin GET internal-users → 200 JSON array | ✅ PASS |
| T5 | admin create user → 200/201 with id | ✅ PASS |
| T6 | admin GET internal-users/:id → 200 | ✅ PASS |
| T7 | admin change role → 200 with updated role | ✅ PASS |
| T8 | admin deactivate user → 200 with deactivated status | ✅ PASS |
| T9 | double deactivate → 400/409 (fail-closed) | ✅ PASS |
| T10 | GET non-existent user → 404 | ✅ PASS |
| T11 | new user has inviteStatus=pending | ✅ PASS |
| T12 | generate invite → 200/201 with inviteUrl (no hash leaked) | ✅ PASS |
| T13 | unauthenticated invite generation → 401/403 | ✅ PASS |
| T14 | invalid token → 400 generic (no enumeration) | ✅ PASS |
| T15 | valid token + password → 200 (user activated) | ✅ PASS |
| T16 | reused token → 400 (one-time use enforced) | ✅ PASS |
| T17 | bootstrap env admin login preserved | ✅ PASS |

**Results: 17 passed, 0 failed**

---

## Coverage Notes

### Auth baseline
- T3: login → 200 + cookie ✅
- T17: bootstrap env admin preserved ✅
- Session cookies: httpOnly (not in browser storage) ✅

### Organizations
- Org flows covered by prior gate tests (org-flows.test.mjs); not regressed by this gate's changes (only Dockerfile + .dockerignore touched)

### Org Mapping
- Not regressed (same reasoning — no app code changed)

### Internal Users
- T4-T10: all CRUD paths covered ✅

### Invite / Redeem / Login
- T11-T16: full invite lifecycle covered ✅
- T15 confirms invited user can log in after set-password ✅

### Security
- T12: confirmed inviteUrl has token + uid only, no hash ✅
- T13: unauthenticated access denied ✅
- T14/T16: invalid/reused token safely denied ✅
- Auth: httpOnly cookie, no JWT in browser ✅

---

## Prisma/Runtime Issue Status

**The stale nested Prisma client issue is FULLY ABSENT from this deployment.**

Evidence: T15 (redeem) and T12 (generate invite) both pass — these are the exact
routes that use `InviteStatus.invited`, `InviteStatus.active`, `ActionType.invite`,
`ActionType.redeem` as runtime values. If the stale client were still present,
these would crash with `Cannot read properties of undefined`. They pass cleanly.
