# LIVE DEPLOY STATE

**Date:** 2026-02-28T06:48Z
**Triggered:** Force redeploy (empty commit `f026086`) pushed to `suite-shavi` master

---

## Services + Domains

| Service          | Domain                                       | Builder                   | Running Commit     | Running Binary                                                      |
| ---------------- | -------------------------------------------- | ------------------------- | ------------------ | ------------------------------------------------------------------- |
| Suite BFF (web)  | `web-production-6f02f6.up.railway.app`       | DOCKERFILE (railway.json) | `f026086` (pushed) | ⚠️ Old: pre-PR-1 Nixpacks (ETag `dgpxmdj4av4099`, 2026-02-27 17:48) |
| Core Admin Mount | `core-admin-mount-production.up.railway.app` | DOCKERFILE                | `40e5266` (pushed) | ⚠️ Old: pre-40e5266 (no /health)                                    |
| Core Workflow    | `core-workflow-production.up.railway.app`    | DOCKERFILE                | `40e5266` (pushed) | ⚠️ Old: pre-40e5266                                                 |
| JWKS Server      | `jwks-server-production.up.railway.app`      | DOCKERFILE                | (unchanged)        | ✅ Running correctly                                                |

---

## Railway Context

```
railway whoami: eslam abdelshafi (eslam.abdelshafi41@gmail.com)
Suite project:  d107e5cc-24d2-4a4c-98cc-cb672570e8a4
Core project:   e56fd682-ed5c-449b-b109-9ad7feb888a5
```

---

## Git Commit Chain (Suite)

```
f026086 chore(deploy): force Railway Docker rebuild  ← LATEST (build in progress)
1da8fa5 docs(verify): live integration verification pack
339e834 docs(audit): 13_EVIDENCE_ADDENDUM
06bdc43 fix(cors): CORS_ALLOWED_ORIGINS env var fix
8229398 docs(audit): Phase 2 evidence pack
bb0ad8f docs(audit): forensic audit Phase 1 v2
3eebe0f fix(docker): F1+F2+F3 — Vite build, 0.0.0.0, DOCKERFILE builder ← KEY FIX
```

---

## Dockerfile Verified (Current Code)

```
FROM node:20-alpine AS base
RUN npm ci --ignore-scripts         ← deps
RUN npx tsc -p ...tsconfig.bff.json ← BFF compile
RUN npx vite build --config ...     ← SPA compile (F2)
EXPOSE 4000
CMD ["sh", "-c", "npx prisma migrate deploy ... && node dist/.../main.js"]
```

**railway.json**: `builder: DOCKERFILE` ✅ (no NIXPACKS)

---

## Build Status

Railway Docker build in progress. ETag will change from `dgpxmdj4av4099` when new binary deploys.
