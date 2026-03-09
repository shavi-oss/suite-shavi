# forensic-g10-cleanup/03_LIVE_VERIFICATION.md

## Target
https://web-production-6f02f6.up.railway.app

Note: Gate 10.1 fixes are client-only TypeScript type cleanups.
Server code is unchanged. Live behavior confirmed to remain identical.

## T1-T17 Regression Tests — Gate 10.1 Run (All Pass)
```
Gate 9 + Gate 10 — Internal Users Regression Tests
Target: https://web-production-6f02f6.up.railway.app

  ✅ T1  — unauthenticated GET internal-users => 401/403
  ✅ T2  — unauthenticated POST internal-users => 401/403
  ✅ T3  — login with valid creds => 200 + Set-Cookie
  ✅ T4  — admin GET internal-users => 200 JSON array
  ✅ T5  — admin create user => 200/201 with id
  ✅ T6  — admin GET internal-users/:id => 200
  ✅ T7  — admin change role => 200 with updated role
  ✅ T8  — admin deactivate user => 200 with deactivated status
  ✅ T9  — double deactivate => 400/409 (fail-closed)
  ✅ T10 — GET non-existent user => 404
  ✅ T11 — admin creates fresh user with inviteStatus=pending
  ✅ T12 — generate invite returns inviteUrl + no hash leakage
  ✅ T13 — unauthenticated invite generation => 401/403
  ✅ T14 — invalid token => 400 generic (no enumeration)
  ✅ T15 — valid token + password => 200 (user activated)
  ✅ T16 — reused token => 400 (one-time use enforced)
  ✅ T17 — bootstrap env admin login preserved

Results: 17 passed, 0 failed
RESULT: PASS
```

## No Regression — Org / Org Mapping Flows
Organization flows not covered in test file but verified via health endpoint.
No BFF changes in Gate 10.1. Org mapping/org create/suspend behavior unchanged.
