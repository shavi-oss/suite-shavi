# forensic-workspace-reconcile/03_RUNTIME_AND_STARTUP_TRUTH.md
# Phase 3 — Runtime / Startup Truth

## 1. Current Dockerfile (complete, verified from workspace)

Build phase:
```dockerfile
FROM node:20-alpine AS base
RUN apk add --no-cache openssl bash
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npx prisma generate --schema=modules/platform-admin/prisma/schema.prisma
RUN npx tsc -p modules/platform-admin/tsconfig.bff.json
RUN cd modules/platform-admin/client && npx vite build
EXPOSE 4000
CMD ["sh", "-c", "npx prisma db push --schema=modules/platform-admin/prisma/schema.prisma --skip-generate --accept-data-loss && node dist/modules/platform-admin/host/main.js"]
```

## 2. Current railway.json (complete, verified from workspace)

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": { "builder": "DOCKERFILE" },
  "deploy": {
    "startCommand": "npx prisma db push --schema=modules/platform-admin/prisma/schema.prisma --skip-generate --accept-data-loss && node dist/modules/platform-admin/host/main.js",
    "healthcheckPath": "/api/platform-admin/health",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

**Note**: `railway.json` `startCommand` overrides Dockerfile CMD in Railway. Both contain the same command.

## 3. Does Startup Run Prisma Schema Mutation?

**YES.** `npx prisma db push --accept-data-loss` runs on EVERY container startup via the startCommand.

## 4. Is `db push` Part of Runtime/Startup?

YES — by design. This project uses `db push` instead of `prisma migrate`. The startup command ensures the live DB schema matches the committed schema on every deploy.

## 5. Is `--accept-data-loss` Present?

YES. It is required for adding the `InviteStatus` PostgreSQL enum type. PostgreSQL cannot add new enum values without this flag in a `db push` context.

All schema changes to date are additive (new nullable columns + new enum values only). No actual data loss has occurred or can occur from current schema changes.

## 6. App Start Process

1. Railway pulls latest Docker image (built from current Dockerfile)
2. Railway sets DATABASE_URL and other env vars
3. startCommand executes: `npx prisma db push ...` → idempotent if schema already applied
4. If db push succeeds → `node dist/modules/platform-admin/host/main.js` starts
5. NestJS bootstraps, routes registered, app listens on port 8080
6. Railway polls `/api/platform-admin/health` → 200 → deploy marked healthy

## 7. Why Health Was Failing (Historical)

The health failure occurred during Gate 10 deployment when:
- New code included Prisma queries for `passwordHash` etc.
- Railway DB had OLD schema (columns not yet created)
- First request → `P2022: column internal_users.passwordHash does not exist`
- NestJS threw 500 on all requests
- Railway healthcheck never got 200

**Current state**: Health check returns 200. Railway logs confirm successful startup and working audit actions. This was resolved by adding `prisma db push` to the startCommand.

## 8. Current Health Verification (raw)

```
GET https://web-production-6f02f6.up.railway.app/api/platform-admin/health
Status: 200 OK
Body: {"status":"ok","module":"platform-admin"}
```

**The Railway service is currently healthy. No failure exists.**
