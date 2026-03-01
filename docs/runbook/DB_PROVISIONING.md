# DB Provisioning Runbook

## Purpose

The container does NOT run any schema migration at startup (fail-closed).
Schema must be provisioned once per new environment by an authorized operator.

## When to Run

- First deployment to a new Railway environment (or new Postgres database)
- After a Prisma schema change (add/rename columns) — run explicitly as an operator action

## Prerequisites

- Railway CLI installed and linked to the correct project/environment
- `DATABASE_PUBLIC_URL` is available from `railway variables --service web --kv`

## Command (one-shot, operator must run manually)

```powershell
# Step 1: Confirm the public DB URL
railway variables --service web --kv | Select-String "DATABASE_PUBLIC_URL"

# Step 2: Set it locally and run prisma migrate dev (creates migrations/)
# OR if schema is already in sync and you just want to push the current state:
$env:DATABASE_URL = "<DATABASE_PUBLIC_URL value from step 1>"
npx prisma db push --schema=modules/platform-admin/prisma/schema.prisma
# NOTE: Do NOT use --accept-data-loss in production. If data loss would occur, stop and
# create a proper Prisma migration instead (npx prisma migrate dev --name <name>).
```

## Proper Migration Workflow (preferred for production changes)

```bash
# 1. Create migration from schema diff (local dev DB required):
npx prisma migrate dev --schema=modules/platform-admin/prisma/schema.prisma --name <descriptive-name>

# 2. Commit the generated migrations/ folder to the repository

# 3. From that point onward, Dockerfile CMD can use:
#    CMD ["sh", "-c", "npx prisma migrate deploy --schema=modules/platform-admin/prisma/schema.prisma && node dist/modules/platform-admin/host/main.js"]
#    (fail-closed: if migrate deploy fails, node never starts)
```

## Current State (2026-03-01)

- No `migrations/` folder exists.
- Tables were provisioned on 2026-03-01 via a manual `prisma db push` against `DATABASE_PUBLIC_URL`.
- Schema is in sync. No further provisioning is needed unless the schema changes.

## STOP Rules

- NEVER run `prisma db push --accept-data-loss` in production.
- NEVER add `|| true` around DB operations — failures must surface explicitly.
- If `prisma migrate deploy` fails, the container must NOT start (fail-closed).
