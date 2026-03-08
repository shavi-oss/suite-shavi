# 01_LOCAL_VERIFICATION.md — Gate 7

**Date**: 2026-03-08

## Client Build (Vite)

```
npm run build
✓ 46 modules transformed.
assets/index-CPwGn-AM.js 234.44 kB │ gzip: 68.71 kB
✓ built in 2.52s
BUILD: 0
```

## BFF TypeScript Check

```
npx tsc -p modules/platform-admin/tsconfig.bff.json
BFF_TSC: 0
```

## Regression Tests

```
node modules/platform-admin/tests/org-flows.test.mjs

Gate 7 — Org Flows Regression Tests
Target: https://web-production-6f02f6.up.railway.app

  ✅ T1 — health returns 200
  ✅ T2 — unauthenticated create => 401
  ✅ T3 — login with valid creds => 200 + Set-Cookie
  ✅ T4 — GET organizations => 200 JSON array
  ✅ T5 — authenticated create with 5 fields => 201 with id
  ✅ T6 — create without adminEmail => non-200 (Core validation)
  ✅ T7 — list after create includes new org
  ✅ T8 — suspend org => 200
  ✅ T9 — unsuspend org => 200
  ✅ T10 — deactivate org => 200

Results: 10 passed, 0 failed
RESULT: PASS
```

All clean.
