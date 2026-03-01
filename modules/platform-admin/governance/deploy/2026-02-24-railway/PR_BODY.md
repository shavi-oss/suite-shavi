# PR_BODY — Suite-Shavi Platform Admin Railway Deploy

## Summary

This PR deploys the `platform-admin` BFF (NestJS) + client (Vite/React) to Railway staging.

**Commits:** 2 code commits + 1 documented deployment-blocker fix + governance docs.

---

## Code Changes

### T-1 — `modules/platform-admin/host/main.ts`

- CORS `origin` replaced from hardcoded `['http://localhost:3000']` to env-driven:
  ```typescript
  const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : ["http://localhost:3000"];
  ```
- Required for production staging — commit `1b41950`

### T-2 — `Dockerfile` (new, repo root)

- `node:20-alpine`, `npm ci --ignore-scripts`, `prisma generate`, BFF `tsc` build
- Runtime CMD: `prisma migrate deploy && node dist/modules/platform-admin/host/main.js`
- Fully env-driven — no values baked in — commit `1b41950`

### T-3 — `package.json` (deployment blocker fix)

- Added `start` script: `npx prisma migrate deploy ... && node dist/modules/platform-admin/host/main.js`
- **Justification (deployment blocker):** Railway ran `node dist/index.js` (from `"main"` field in package.json) instead of Dockerfile CMD. This caused `MODULE_NOT_FOUND` crash on every deploy attempt. Adding `start` script is the minimal fix per CRITICAL LAWS policy.
- Commit: `72a6f69`

### Governance Docs (new)

```
modules/platform-admin/governance/deploy/2026-02-24-railway/
  SUITE_DEPLOY_PLAN.md
  SUITE_ANALYSIS_REPORT.md
  SUITE_DEPLOY_EXECUTION_REPORT.md
  SUITE_DEPLOY_VERIFICATION_EVIDENCE.md
  SUITE_RAILWAY_RUNBOOK.md
  PR_BODY.md
  FINAL_VERDICT.md
```

---

## Verification

| Check                                | Result                                            |
| ------------------------------------ | ------------------------------------------------- |
| `git grep "api/v1" client/src`       | EXIT:1 ✅ No direct Core calls                    |
| `git grep "localStorage" client/src` | EXIT:1 ✅ No localStorage                         |
| `git grep "BEGIN PRIVATE KEY"`       | EXIT:1 ✅ No private keys                         |
| `git ls-files \| grep .pem/.key`     | Empty ✅ No key files                             |
| `npm ci`                             | EXIT:0 ✅ 505 packages                            |
| `prisma generate`                    | EXIT:0 ✅ Prisma Client v6.19.2                   |
| `tsc --noEmit (tsconfig.bff.json)`   | EXIT:0 ✅ After generate                          |
| `client npm ci`                      | EXIT:0 ✅ 70 packages, 0 vulns                    |
| `client vite build`                  | EXIT:0 ✅ 46 modules, 2.50s                       |
| BFF DenyAllGuard                     | ✅ Fail-closed — all routes blocked by default    |
| ExplicitAllowGuard                   | ✅ Health + Auth routes opt-in only               |
| Railway BFF deployed                 | ✅ `https://web-production-6f02f6.up.railway.app` |

---

## Deployment Blockers Found + Fixed

| Blocker                    | Cause                                                     | Fix (minimal diff)                 |
| -------------------------- | --------------------------------------------------------- | ---------------------------------- |
| DATABASE_URL empty         | CLI service ref `${{Postgres.DATABASE_URL}}` not resolved | Set literal from PG\* vars         |
| DATABASE_URL invalid P1013 | Special chars in PGPASSWORD not URL-encoded               | URL-encode via EscapeDataString    |
| `dist/index.js` not found  | Railway ran npm start using package.json `main`           | Add `start` script to package.json |

---

## Scope

- ✅ suite-shavi ONLY
- ❌ No BassanOs changes
- ❌ No jwks-server changes
- ❌ No dependency additions
- ❌ No secrets in git

---

## Post-Merge Steps

See `SUITE_RAILWAY_RUNBOOK.md` for full ops guide.

1. Verify `CORE_API_BASE_URL` is set to actual BassanOs staging URL
2. Deploy client as separate Railway static service with `VITE_API_URL` set
3. Update `CORS_ORIGIN` with actual client URL
4. Run smoke tests from runbook Step 5
