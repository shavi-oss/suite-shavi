# Suite-Shavi Platform Admin — Staging Deploy Preparation

## Summary

This PR prepares `suite-shavi` for a portable Railway staging deployment of the platform-admin BFF (NestJS) + Client (Vite/React).

**Minimal diff policy:** 2 targeted code changes + governance docs only.

---

## Changes

### 1 — `modules/platform-admin/host/main.ts` _(T-1)_

- CORS `origin` changed from hardcoded `['http://localhost:3000']` to `process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000']`
- This is required for the BFF to function correctly in production staging

### 2 — `Dockerfile` (new) _(T-2)_

- Portable, standard `node:20-alpine` multi-stage build
- Stages: install → build BFF → generate Prisma client → ENTRYPOINT runs `prisma migrate deploy` then starts server
- No Railway-specific buildpack dependencies
- Fully env-driven

### 3 — Governance docs (new)

- `governance/deploy/SUITE_DEPLOY_PLAN.md` — Approved plan
- `governance/deploy/SUITE_ANALYSIS_REPORT.md` — Full architecture analysis
- `governance/deploy/SUITE_DEPLOY_EXECUTION_REPORT.md` — Raw command outputs
- `governance/deploy/SUITE_DEPLOY_VERIFICATION_EVIDENCE.md` — Smoke test evidence
- `governance/deploy/SUITE_RAILWAY_RUNBOOK.md` — Human-safe operations guide
- `governance/deploy/PR_BODY.md` — this file

---

## Verification

| Check                                | Result                                         |
| ------------------------------------ | ---------------------------------------------- |
| `git grep "api/v1" client/src`       | EXIT:1 ✅ No direct Core calls                 |
| `git grep "localStorage" client/src` | EXIT:1 ✅ No localStorage                      |
| `git grep "BEGIN PRIVATE KEY"`       | EXIT:1 ✅ No private keys                      |
| `git ls-files \| grep .pem/.key`     | Exit:1 ✅ No key files                         |
| BFF DenyAllGuard                     | ✅ Fail-closed — all routes blocked by default |
| ExplicitAllowGuard                   | ✅ Only Health + Auth routes opt-in            |
| Smoke test — health                  | 200 ✅                                         |
| Smoke test — session (no cookie)     | 401 ✅                                         |
| Smoke test — orgs (no session)       | 401/403 ✅                                     |

---

## Human Steps Required After Merge

See `SUITE_RAILWAY_RUNBOOK.md` for full steps. Summary:

1. Create Railway project `suite-shavi-staging`
2. Add Postgres plugin
3. Set env vars: `CORE_API_BASE_URL`, `ADMIN_JWKS_URL`, `CORS_ORIGIN`, `NODE_ENV=production`
4. Deploy via `railway up`
5. Run smoke tests

---

## Limitations (Staging Only — Out of Scope)

- Auth is a stub (any credentials accepted)
- Sessions are in-memory (not persistent across restarts)
- No horizontal scaling until session persistence is added

---

## Scope

- ✅ suite-shavi ONLY
- ❌ No BassanOs changes
- ❌ No jwks-server changes
- ❌ No dependency additions
- ❌ No secrets in git
