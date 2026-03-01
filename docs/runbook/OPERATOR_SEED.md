# Operator Seed Runbook

## Purpose

`SessionGuard` now performs a fail-closed DB lookup: every request to a protected endpoint
requires the session's email to match an **active** `InternalUser` record.

If no `InternalUser` rows exist, **all authenticated requests will return 401** — correctly.
An authorized operator must seed at least one record before the system is usable.

## When to Run

- First deployment to a new environment
- When a new operator needs access

## Command — Insert First Operator (one-shot)

```powershell
# Step 1: Get the public DB URL
$dbUrl = (railway variables --service web --kv | Select-String "DATABASE_PUBLIC_URL").ToString().Split('=',2)[1].Trim()

# Step 2: Run the seed via psql (requires psql in PATH)
$insertSql = @"
INSERT INTO internal_users (id, email, name, role, status, created_by, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'admin@bassan.io',
  'Platform Admin',
  'platform_admin',
  'active',
  '00000000-0000-0000-0000-000000000000',
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;
"@

psql "$dbUrl" -c $insertSql
```

## Alternative — Node/Prisma seed script

```typescript
// scripts/seed-operator.ts (run with: npx ts-node scripts/seed-operator.ts)
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.internalUser.upsert({
    where: { email: "admin@bassan.io" },
    update: {}, // no-op if exists
    create: {
      email: "admin@bassan.io",
      name: "Platform Admin",
      role: "platform_admin",
      status: "active",
      createdBy: "00000000-0000-0000-0000-000000000000",
    },
  });
  console.log("Operator seeded");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Run: `$env:DATABASE_URL="<DATABASE_PUBLIC_URL>"; npx ts-node scripts/seed-operator.ts`

## STOP Rules

- NEVER auto-seed at container startup.
- NEVER put a seed command in Dockerfile CMD or Railway start command.
- Always verify the inserted row: `psql $dbUrl -c "SELECT id, email, role, status FROM internal_users;"`
- To deactivate an operator: `UPDATE internal_users SET status = 'deactivated' WHERE email = '...';`
