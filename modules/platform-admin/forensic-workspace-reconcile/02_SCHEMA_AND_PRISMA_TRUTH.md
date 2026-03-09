# forensic-workspace-reconcile/02_SCHEMA_AND_PRISMA_TRUTH.md
# Phase 2 — Schema / Prisma / Type Truth

## 1. Current InternalUser Model in schema.prisma

File: `modules/platform-admin/prisma/schema.prisma` (verified from workspace)

```prisma
model InternalUser {
  id               String       @id @default(uuid()) @db.Uuid
  email            String       @unique @db.VarChar(255)
  name             String       @db.VarChar(255)
  role             UserRole
  status           UserStatus   @default(active)
  createdAt        DateTime     @default(now()) @db.Timestamptz
  updatedAt        DateTime     @updatedAt @db.Timestamptz
  createdBy        String       @db.Uuid
  passwordHash     String?      @db.VarChar(255)     ← PRESENT
  inviteTokenHash  String?      @db.VarChar(255)     ← PRESENT
  inviteExpiresAt  DateTime?    @db.Timestamptz      ← PRESENT
  inviteStatus     InviteStatus @default(pending)    ← PRESENT
}
```

## 2. Gate 10 Fields in Schema

| Field | In schema? |
|---|---|
| `passwordHash` | ✅ YES |
| `inviteTokenHash` | ✅ YES |
| `inviteExpiresAt` | ✅ YES |
| `inviteStatus` | ✅ YES |

## 3. InviteStatus Enum in Schema

```prisma
enum InviteStatus {
  pending   // user created, no invite generated yet
  invited   // invite generated and active
  active    // invite redeemed, password set, user can log in
  expired   // invite generated but expired without redemption
}
```
**YES — present in schema.**

## 4. Generated Prisma Client Exposes Fields/Types

`prisma generate` exit 0. InviteStatus and all invite fields are in generated `.prisma/client`.
BFF tsc exit 0 confirms all fields are accessible from TypeScript code.

## 5. Why ANY Mismatch? (Historical)

The mismatch described in the brief was historical — it occurred during initial Gate 10 Railway deployment BEFORE `prisma db push` had been run against the live Railway database. The code was ahead of the live DB schema at that point. After the railway.json `startCommand` fix (commit `0d1eb89`), the DB schema was applied on the next deploy.

**Current state**: NO mismatch. Schema, generated client, and app code are fully aligned.

## 6. Mismatch Root Cause (Historical)

At the time of the original symptom report:
- Code (schema.prisma) had the new fields
- Generated client had the new fields (prisma generate had run in docker build)
- BUT the live Railway PostgreSQL DB did NOT have the columns yet
- First login attempt → Prisma query selected `passwordHash` → `P2022: column does not exist`
- This caused a 500 on login → Railway healthcheck failed

Fix: `prisma db push` added to startup via railway.json startCommand.
Current state: resolved.

## 7. ActionType / Audit Enums

Current schema.prisma ActionType enum:
```prisma
enum ActionType {
  create
  update
  suspend
  unsuspend
  link
  deactivate
  invite     // Gate 10
  redeem     // Gate 10
}
```

`invite` and `redeem` are PRESENT in current schema.

## 8. Service Files vs Schema

No discrepancy. Service files (`internal-user.service.ts`) import `InviteStatus`, `ActionType.invite`, `ActionType.redeem` from `@prisma/client`. All are present in current generated client. BFF tsc exit 0 confirms.
