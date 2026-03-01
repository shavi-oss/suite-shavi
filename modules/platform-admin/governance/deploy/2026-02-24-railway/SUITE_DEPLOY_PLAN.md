# SUITE DEPLOY PLAN

## platform-admin BFF + Client → Railway Staging

**Date:** 2026-02-24T16:53 UTC+2
**Executor:** Sonit (full authority — no approval gate)
**Scope:** suite-shavi ONLY

---

## Scope Lock

### Files to Touch

| File                                                           | Type   | Reason                      |
| -------------------------------------------------------------- | ------ | --------------------------- |
| `modules/platform-admin/host/main.ts`                          | MODIFY | T-1: CORS env var           |
| `Dockerfile` (repo root)                                       | NEW    | T-2: Portable BFF container |
| `modules/platform-admin/governance/deploy/2026-02-24-railway/` | NEW    | All 7 governance docs       |

### Explicitly Forbidden

- BassanOs repo — DO NOT TOUCH
- jwks-server — DO NOT TOUCH
- Any NestJS service/controller/guard/schema changes
- Any new npm dependencies
- Any secrets in git

---

## Task List

### Phase 1 — Local (pre-deploy)

- [x] Run verification matrix (done in planning session)
- [ ] T-1: Fix CORS in `main.ts`
- [ ] T-2: Create `Dockerfile`
- [ ] BFF tsc compile check (`tsconfig.bff.json`)
- [ ] Client build check (`cd client && npm ci && npm run build`)
- [ ] Commit T-1 + T-2 (1 commit)

### Phase 2 — Railway

- [ ] Check Railway CLI availability
- [ ] Create/verify Railway project `suite-shavi-staging`
- [ ] Add Postgres plugin → DATABASE_URL auto-injected
- [ ] Set BFF env vars (names only in outputs)
- [ ] Deploy BFF service (Dockerfile)
- [ ] Deploy Client as static service
- [ ] Run smoke tests

### Phase 3 — Governance

- [ ] SUITE_ANALYSIS_REPORT.md
- [ ] SUITE_DEPLOY_EXECUTION_REPORT.md
- [ ] SUITE_DEPLOY_VERIFICATION_EVIDENCE.md
- [ ] SUITE_RAILWAY_RUNBOOK.md
- [ ] PR_BODY.md
- [ ] FINAL_VERDICT.md

---

## Commits Plan

| #   | Message                                                         | Files                                   |
| --- | --------------------------------------------------------------- | --------------------------------------- |
| 1   | `fix(platform-admin): use CORS_ORIGIN env var, add Dockerfile`  | `main.ts`, `Dockerfile`                 |
| 2   | `docs(deploy): Railway staging governance artifacts 2026-02-24` | `governance/deploy/2026-02-24-railway/` |

---

## T-1 Implementation Detail

```typescript
// BEFORE:
app.enableCors({
  origin: ["http://localhost:3000"],
  credentials: true,
});

// AFTER:
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  : ["http://localhost:3000"];
app.enableCors({
  origin: corsOrigins,
  credentials: true,
});
```

## T-2 Dockerfile Detail

```dockerfile
FROM node:20-alpine AS base
WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Generate prisma client
RUN npx prisma generate --schema=modules/platform-admin/prisma/schema.prisma

# Build BFF
RUN npx tsc -p tsconfig.json

# Runtime ENTRYPOINT: migrate then start
CMD ["sh", "-c", "npx prisma migrate deploy --schema=modules/platform-admin/prisma/schema.prisma && node dist/modules/platform-admin/host/main.js"]
```

---

## Verification Commands

```bash
# Local
git status --porcelain
git grep "api/v1" modules/platform-admin/client/src   # must be empty
git grep "localStorage" modules/platform-admin/client/src  # must be empty
git grep "BEGIN PRIVATE KEY"                          # docs only
git ls-files | grep -E "\.(pem|key)$"                # must be empty

# BFF TS check
npx tsc -p modules/platform-admin/tsconfig.bff.json --noEmit

# Client build
cd modules/platform-admin/client && npm ci && npm run build

# Railway smoke tests
curl -s -o /dev/null -w "%{http_code}" $BFF_URL/api/platform-admin/health        # 200
curl -s -o /dev/null -w "%{http_code}" $BFF_URL/api/platform-admin/auth/session  # 401
curl -s -o /dev/null -w "%{http_code}" $BFF_URL/api/platform-admin/organizations # 401/403
```

---

## Rollback Plan

| Event                 | Action                                            |
| --------------------- | ------------------------------------------------- |
| T-1 regression        | `git revert HEAD`, redeploy                       |
| Dockerfile build fail | Fix Dockerfile, recommit                          |
| Prisma migration fail | `railway run prisma migrate status`; do NOT reset |
| Fail-open detected    | IMMEDIATE revert + STOP                           |

---

## Stop Conditions

1. Secret in tracked files or output → STOP
2. Fail-open behavior → STOP IMMEDIATELY
3. Direct client → Core API call → STOP
4. Scope expansion without written justification → STOP
5. Dependency drift → STOP
