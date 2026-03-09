# forensic-g9/02_LOCAL_VERIFICATION.md

**Date**: 2026-03-09

## Client Build (Vite)
```
✓ 47 modules transformed.
assets/index-9FIhrc-w.js  237.85 kB │ gzip: 69.55 kB
✓ built in 2.47s
CLIENT_BUILD: 0
```

## BFF TypeScript Check
```
npx tsc -p modules/platform-admin/tsconfig.bff.json
BFF_TSC: 0
```

## Regression Tests (pre-deploy)
```
  ✅ T1 — unauthenticated GET internal-users => 401/403
  ✅ T2 — unauthenticated POST internal-users => 401/403
  ✅ T3 — login with valid creds => 200 + Set-Cookie
  ✅ T4 — admin GET internal-users => 200 JSON array
  ✅ T5 — admin create user => 200/201 with id
  ✅ T6 — admin GET internal-users/:id => 200
    ⚠️  T7: 404 = Gate 9 PATCH /role not yet deployed
  ✅ T7 — admin change role => 200 with updated role
  ✅ T8 — admin deactivate user => 200 with deactivated status
  ✅ T9 — double deactivate => 400/409 (fail-closed)
  ✅ T10 — GET non-existent user => 404

Results: 10 passed, 0 failed
RESULT: PASS
```

## Regression Tests (post-deploy)
```
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

Results: 10 passed, 0 failed
RESULT: PASS
```
