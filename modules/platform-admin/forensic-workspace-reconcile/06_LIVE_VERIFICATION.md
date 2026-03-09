# forensic-workspace-reconcile/06_LIVE_VERIFICATION.md
# Phase 6 — Live / Railway Verification

## Target: https://web-production-6f02f6.up.railway.app
## Date: 2026-03-09T08:00-10:00 UTC

## 1. Railway Deploy Status
Latest deploy: commit 03d867e. Docker build → prisma generate → tsc → vite build → all passed.
Deploy completed successfully. Service healthy.

## 2. Health Check (raw)
```
GET /api/platform-admin/health
Status: 200 OK
Body: {"status":"ok","module":"platform-admin"}
```

## 3. Railway Logs — Startup (recent)
```
[NestResolver] Mapped {/api/platform-admin/auth/login, POST} route
[NestResolver] Mapped {/api/platform-admin/auth/logout, POST} route
[NestResolver] Mapped {/api/platform-admin/auth/session, GET} route
[NestResolver] Mapped {/api/platform-admin/auth/redeem-invite, POST} route
[NestResolver] Mapped {/api/platform-admin/internal-users, POST} route
[NestResolver] Mapped {/api/platform-admin/internal-users, GET} route
[NestResolver] Mapped {/api/platform-admin/internal-users/:id, GET} route
Nest application successfully started
```
No P2022 errors. No crash loop. No unhealthy startup.

## 4. Railway Logs — Live Actions
```
[AuditService] action: 'create',  result: 'success'   (08:06:54 UTC)
[AuditService] action: 'invite',  result: 'success'   (08:06:54 UTC)
[AuditService] action: 'redeem',  result: 'success'   (08:06:55 UTC)
```
Both Gate 10 audit actions (`invite` + `redeem`) fire successfully.

## 5. T1-T17 Live Regression Tests (run 2026-03-09)
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
  ✅ T12 — generate invite => 200/201 with inviteUrl, no hash leaked
  ✅ T13 — unauthenticated invite generation => 401/403
  ✅ T14 — invalid token => 400 generic (no enumeration)
  ✅ T15 — valid token + password => 200 (user activated)
  ✅ T16 — reused token => 400 (one-time use enforced)
  ✅ T17 — bootstrap env admin login preserved

Results: 17 passed, 0 failed
RESULT: PASS
```

## 6. No JWT in Browser Storage / No Secret Leakage

T12 explicitly verifies that invite URL contains only `token` + `uid` (no hash, no password).
Auth tokens are session cookies (httpOnly, not in localStorage/sessionStorage).
No leakage detected.

## Summary
| Live Check | Result |
|---|---|
| Deploy status | healthy |
| Health endpoint | 200 OK ✅ |
| login | works (T3) ✅ |
| Organization flows | covered by prior gate tests |
| Org mapping flows | covered by prior gate tests |
| Internal user flows | T4-T10 PASS ✅ |
| Invite generate | T11-T13 PASS ✅ |
| Invite redeem | T14-T16 PASS ✅ |
| Bootstrap admin login | T17 PASS ✅ |
