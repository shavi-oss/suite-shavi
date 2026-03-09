# forensic-repair-g10/03_LIVE_VERIFICATION.md
# Gate 10 Repair — Live Verification

## Target: https://web-production-6f02f6.up.railway.app

## 1. Railway Deploy
Most recent deploy: successful (tag suite-gate10.1-stable at commit 63f59a0)
Build: Docker build → prisma generate → tsc → vite build → all pass

## 2. Health Check
```
GET /api/platform-admin/health
Status: 200 OK
Body: {"status":"ok","module":"platform-admin"}
```

## 3. T1-T17 Live Regression Tests (run at Gate 10.1 completion)
```
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
  ✅ T11 — new user has inviteStatus=pending
  ✅ T12 — generate invite returns inviteUrl + no hash leakage
  ✅ T13 — unauthenticated invite generation => 401/403
  ✅ T14 — invalid token => 400 generic (no enumeration)
  ✅ T15 — valid token + password => 200 (user activated)
  ✅ T16 — reused token => 400 (one-time use enforced)
  ✅ T17 — bootstrap env admin login preserved

Results: 17 passed, 0 failed
```

## 4. Railway Logs — Invite/Redeem Confirmed
From Railway logs (03/09/2026 06:52 UTC):
```
[AuditService] action: 'invite', result: 'success'
[AuditService] action: 'redeem', result: 'success'
```
Both audit actions fire correctly — confirming invite generation and redemption work end-to-end.

## 5. Startup Log (Most Recent Container)
```
Mapped {/api/platform-admin/auth/redeem-invite, POST} route
Nest application successfully started
Platform Admin Host listening on http://localhost:8080
```
No P2022 errors. No startup loops. No healthcheck failures.

## 6. Startup Schema Command Outcome
`prisma db push --accept-data-loss` ran on startup and applied Gate 10 schema changes.
Since then, re-runs are idempotent (no-op: schema already matches DB).

## Summary
All reported symptoms are absent from current live deployment.
