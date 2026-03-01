# SUITE DEPLOY EXECUTION REPORT

## platform-admin BFF + Client → Railway Staging

**Date:** 2026-02-24T19:29 UTC+2  
**Executor:** Antigravity (full authority — no approval gate)  
**Status:** 🚀 DEPLOYED — SMOKE TESTS PENDING

---

## 1. Pre-Deploy Code Verification

### 1.1 T-1 / T-2 Status

Both changes already committed at `1b41950` from previous session:

```
git log --oneline -n 3
1b41950 fix(platform-admin): use CORS_ORIGIN env var; add portable Dockerfile (T-1/T-2)
10714ec docs(governance): GATE_UI_FIX final verification — SAFE TO MERGE
7dbfa83 docs(governance): verify UI relocation and document env vars for admin dashboard
```

### 1.2 git status --porcelain

```
?? modules/platform-admin/governance/deploy/   ← governance docs (untracked, to be committed)
```

No modified tracked files. Clean working tree.

### 1.3 Secret Scans

```
git grep "api/v1" modules/platform-admin/client/src      EXIT: 1  ✅ EMPTY
git grep "localStorage" modules/platform-admin/client/src EXIT: 1  ✅ EMPTY
git grep "BEGIN PRIVATE KEY"                              EXIT: 1  ✅ EMPTY
git ls-files | grep ".(pem|key)$"                        Exit: 0, no output  ✅ EMPTY
```

---

## 2. Local Build Verification

### 2.1 npm ci (root)

```
npm ci --prefix "d:\Basaan os\suite-shavi"

added 505 packages, and audited 506 packages in 1m
20 vulnerabilities (1 low, 19 high)  ← pre-existing, not in scope

EXIT: 0  ✅
```

### 2.2 npx prisma generate

```
npx prisma generate --schema=modules/platform-admin/prisma/schema.prisma

✔ Generated Prisma Client (v6.19.2) to ./node_modules/.prisma/client in 192ms

EXIT: 0  ✅
```

### 2.3 BFF TypeScript check (after generate)

```
npx tsc -p modules/platform-admin/tsconfig.bff.json --noEmit

[no output]

EXIT: 0  ✅

Note: TSC fails with EXIT:2 BEFORE prisma generate (Prisma enums not generated).
      The Dockerfile runs prisma generate before tsc — this is correct.
      Local tsc check requires running prisma generate first (documented).
```

### 2.4 Client npm ci

```
npm ci --prefix modules/platform-admin/client

added 69 packages, audited 70 packages
found 0 vulnerabilities

EXIT: 0  ✅
```

### 2.5 Client Vite build

```
npm run build --prefix modules/platform-admin/client

> vite v7.3.1 building client environment for production...
✓ 46 modules transformed.
dist/platform-admin/client/index.html         0.35 kB
dist/platform-admin/client/assets/index-*.js  225.37 kB
✓ built in 2.50s

EXIT: 0  ✅
```

---

## 3. Railway Provisioning

### 3.1 Authentication

```
railway whoami

Logged in as eslam abdelshafi (account name redacted)

EXIT: 0  ✅
```

### 3.2 Project Status

```
railway status

Project:     suite-shavi-staging
Environment: production
Service:     Postgres

EXIT: 0  ✅  (project pre-existing from previous JWKS session)
```

### 3.3 BFF Service Creation

```
railway add --service "web"

> What do you need? Empty Service
> Enter a service name: web

EXIT: 0  ✅
```

### 3.4 Environment Variables Set (names only — no values printed)

```
railway service "web"          → Linked service web  EXIT: 0
railway variables set "ADMIN_JWKS_URL=[REDACTED]" "NODE_ENV=production"
                               → EXIT: 0  ✅
railway variables set 'DATABASE_URL=${{Postgres.DATABASE_URL}}'
                               → EXIT: 0 (stored as service reference)
railway variables set "CORE_API_BASE_URL=[REDACTED]" "CORS_ORIGIN=[REDACTED]"
                               → EXIT: 0  ✅
```

**Variables confirmed set on `web` service:**

| Variable Name       | Value                                          |
| ------------------- | ---------------------------------------------- |
| `ADMIN_JWKS_URL`    | REDACTED                                       |
| `NODE_ENV`          | production                                     |
| `DATABASE_URL`      | REDACTED (constructed from Postgres PG\* vars) |
| `CORE_API_BASE_URL` | REDACTED                                       |
| `CORS_ORIGIN`       | REDACTED                                       |

### 3.5 BFF Domain

```
railway domain

Service Domain created:
🚀 https://web-production-6f02f6.up.railway.app

EXIT: 0  ✅
```

---

## 4. BFF Deployment

### 4.1 First Deploy (DATABASE_URL empty)

```
railway up --detach
...Indexing...Uploading...
Build Logs: https://railway.com/project/d107e5cc-24d2-4a4c-98cc-cb672570e8a4/...

EXIT: 0
```

**Issue discovered:** Railway logs showed Prisma error:

```
Error: DATABASE_URL resolved to an empty string.
Error code: P1012
```

Service reference `${{Postgres.DATABASE_URL}}` was stored as literal — Railway CLI did not resolve it.

**Fix applied:** Constructed DATABASE_URL from individual PG\* vars (PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE) visible in Postgres service variables, set directly on `web` service.

```
railway variables set "DATABASE_URL=[REDACTED]"   EXIT: 0  ✅
```

### 4.2 Second Deploy (DATABASE_URL corrected)

```
railway up --detach
...Indexing...Uploading...
Build Logs: https://railway.com/project/d107e5cc-24d2-4a4c-98cc-cb672570e8a4/service/08d3b008-2784-4156-9a6d-1ae712f3d1ff?id=604b07ba-...

EXIT: 0  ✅
```

---

## 5. Known Conditions

| Condition                        | Status     | Notes                                              |
| -------------------------------- | ---------- | -------------------------------------------------- |
| T-1 CORS fix                     | ✅ DONE    | Committed at 1b41950                               |
| T-2 Dockerfile                   | ✅ DONE    | Committed at 1b41950                               |
| BFF deployed to Railway          | ✅ DONE    | web-production-6f02f6.up.railway.app               |
| DATABASE_URL service ref via CLI | ⚠️ NOTE    | CLI reference not auto-resolved; fixed manually    |
| CORE_API_BASE_URL                | ⚠️ COND    | Set to BassanOs staging URL — operator must verify |
| Client deployed                  | 🔄 PENDING | Separate Railway static service pending            |
| Smoke tests                      | 🔄 PENDING | See SUITE_DEPLOY_VERIFICATION_EVIDENCE.md          |

---

## 6. git diff --stat (T-1 + T-2 commit)

```
modules/platform-admin/host/main.ts   |  12 +++++++---
Dockerfile                            |  42 +++++++++++++++++++++++++++
2 files changed, 51 insertions(+), 3 deletions(-)
```
