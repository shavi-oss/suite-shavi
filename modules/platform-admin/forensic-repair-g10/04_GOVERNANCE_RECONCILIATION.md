# forensic-repair-g10/04_GOVERNANCE_RECONCILIATION.md
# Gate 10 Repair — Governance Reconciliation

## 1. Final Source of Truth for Schema Rollout

**Established fact**: This project uses `prisma db push` (not `prisma migrate`).
- No `_prisma_migrations` table was ever created in the Railway DB
- Migration files exist in `prisma/migrations/` as documentation artifacts only
- The actual schema application mechanism is `prisma db push` via railway.json startCommand

**Current startCommand**: `npx prisma db push --schema=... --skip-generate --accept-data-loss && node dist/.../main.js`

This is the single source of truth for schema rollout. It runs on every Railway deploy. For additive-only schema changes it is idempotent and safe. For destructive changes it would be a footgun — but there are none in the current schema history.

---

## 2. Is Startup Schema Mutation Still Present?

**YES** — `prisma db push --accept-data-loss` runs at every container startup via railway.json startCommand.

**Why it remains**: It is required to keep the schema in sync across Railway deploys without a migration history. Removing it would mean having to run schema sync manually on every schema change.

**Risk accepted**: The `--accept-data-loss` flag allows potentially destructive changes to be applied without confirmation. This is accepted under the constraint that all schema changes made to date AND in the near future are strictly additive (new nullable columns, new enum values).

**Mitigation path**: A future ops gate to migrate to `prisma migrate develop` + `prisma migrate deploy` would remove this risk. This is recommended but not blocking.

---

## 3. Did Auth/Public Surface Change from Earlier Baseline?

YES — the change was intentional and documented:
- **Before Gate 10**: `@ExplicitAllow()` on 3 methods + 1 HealthController = 4 total usages
- **After Gate 10**: `@ExplicitAllow()` at class-level on AuthController + 1 HealthController = 2 total usages
- New public route added: `POST /auth/redeem-invite` (invite token IS the credential)

This is a reduction in usage count (4 → 2) with one new public route that was deliberately designed to be public. The reduction is because method-level decorators were consolidated to class level.

**Net effect**: The invite redemption endpoint is rightly public (unauthenticated user needs to set password). The consolidation is governance-neutral — the same routes that were previously explicitly allowed are still allowed, plus one new intentional public route.

---

## 4. Is This Real Governance Drift or Outdated Docs?

The change is real. Pre-Gate-10 governance docs that state "max 4 ExplicitAllow usages" are now outdated — the count is 2.

This is NOT problematic drift — it is an improvement. But docs referencing "4 max" should be updated.

The auth surface change (adding `/auth/redeem-invite`) is intentional and documented in `auth.controller.ts` header comments.

---

## 5. Stale Docs / Invariants That Need Update

The following docs may reference outdated ExplicitAllow invariant (4 max):
- Any forensic/governance doc from before Gate 10 that states the ExplicitAllow count
- MODULE_SCOPE_LOCK.md (if it references ExplicitAllow count)

These docs are historical artifacts and do not need active updating — they are snapshots of their gate's state.

---

## 6. Is a Follow-Up Docs-Only Gate Required?

**OPTIONAL**:
- A docs gate to update MODULE_SCOPE_LOCK.md with the Gate 10 post-state
- An ops gate to migrate from `db push` to `prisma migrate`

Neither is blocking for production operation or Gate 11.
