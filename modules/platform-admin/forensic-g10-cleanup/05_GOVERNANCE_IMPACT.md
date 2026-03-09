# forensic-g10-cleanup/05_GOVERNANCE_IMPACT.md

## 1. Was the ExplicitAllowGuard invariant preserved?

YES. Count went DOWN from 4 to 2.
- Before Gate 10: 3 method-level + 1 HealthController = 4 total
- After Gate 10: 1 class-level (AuthController) + 1 HealthController = 2 total
- Gate 10.1: NO change to ExplicitAllow

No governance drift found. The change was intentional and documented in auth.controller.ts header comment.

## 2. Was controller inventory preserved?

YES. Controller count: 6 (Health, InternalUser, OrgMapping, Organization, Audit, Auth).
No new controller created in Gate 10 or Gate 10.1.
This is within approved inventory.

## 3. Was schema rollout cleaned up?

PARTIALLY. The `--accept-data-loss` flag in railway.json startCommand remains.

**Justification for keeping it:**
- This project used `prisma db push` throughout its history (never migrated to `prisma migrate`)
- No migration history table (`_prisma_migrations`) exists in the live DB
- `--accept-data-loss` is required to add new enum types in PostgreSQL via db push
- All Gate 10 schema changes are ADDITIVE (new nullable columns + new enum) — no actual data loss
- Alternative would be: initialize full Prisma migration history table (breaking change to ops practice)

**Risk acknowledged:**
If a future gate introduces a schema change that would actually cause data loss (e.g. dropping a column, changing a type), the `--accept-data-loss` flag would not prevent it from being applied silently.

**Mitigation:**
All schema changes MUST be reviewed before any `prisma db push` runs.
The flag is safe specifically for this phase of the project (additive-only schema).

Follow-up recommendation (Gate 11 or separate ops gate): Consider migrating to `prisma migrate` with a proper baseline migration to remove reliance on `--accept-data-loss`.

## 4. Was any operational compromise left in place?

The `--accept-data-loss` flag remains in railway.json startCommand.
This is documented, understood, and accepted for this project phase.
It is NOT a silent footgun — it is explicitly declared and visible in the repo config.

## 5. Is a follow-up gate still required?

OPTIONAL: A future ops gate to migrate this project from `prisma db push` to `prisma migrate` would harden the schema rollout process. This is not blocking for Gate 10 or 10.1.

No other follow-up gate required.
