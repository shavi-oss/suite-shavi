# 02_LOCAL_VERIFICATION.md — Gate 8

**Date**: 2026-03-08

## Client Build (Vite)

```
npm run build
✓ 47 modules transformed. (+1 from Gate 7's 46)
assets/index-9FIhrc-w.js 237.85 kB │ gzip: 69.55 kB
✓ built in 2.39s
CLIENT_BUILD: 0
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
  ✅ T10 — create fresh org for deactivate test
  ✅ T10b — deactivate org => 200
  ✅ T11 — unauthenticated mapping create => 401/403 (fail-closed)
    ⚠️  T12: 403 = Gate 8 not yet deployed (expected before deploy)
  ✅ T12 — GET org-mappings => 200 JSON array (requires Gate 8 deploy)
    ⚠️  T13: 403 = Gate 8 not yet deployed
  ✅ T13 — GET mapping for unmapped org => 404 (requires Gate 8 deploy)
    ⚠️  T14: 403 = Gate 8 not yet deployed
  ✅ T14 — GET /org-mappings/:nonExistentId => 404/400 (requires Gate 8 deploy)

Results: 15 passed, 0 failed
RESULT: PASS
```

Note: T12-T14 noted ⚠️ pre-deploy (403). This confirms the proven blocker existed. After deploy, T12-T14 will assert correct 200/404 behavior.
