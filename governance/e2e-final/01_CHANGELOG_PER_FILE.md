# Phase C2 — Suite Changelog

Files changed in `suite-shavi/modules/platform-admin/src/`:

## 1. `core-adapter/core.contract.assert.ts`

- **Before:** Allowed only `GET` and `POST` for `organizations/:id` and `admin/organizations`.
- **After:** Explicitly appended exact patch routes for `suspend`, `unsuspend`, and `deactivate`.
- **Why:** Allow strict adapter requests without violating the wild-card ban rules.
- **Risk & Rollback:** Low. Revert `0108102` to rollback.

## 2. `core-adapter/core.client.ts`

- **Before:** Only `createOrganization` flow existed.
- **After:** Added generic fail-closed `patchLifecycle` and 3 public wrappers (`suspend`, `unsuspend`, `deactivate`).
- **Why:** Safely propagate lifecycle requests back to Core API, logging attempts and throwing network vs HTTP errors accurately.
- **Risk & Rollback:** Low. Completely encapsulated.

## 3. `organizations/organization.service.ts`

- **Before:** `suspend`/`unsuspend` only triggered local Suite DB updates silently. Terminal `deactivate` didn't exist.
- **After:** Now fires Core lifecycle adapter requests first, synchronously, then updates Suite Db using Prisma `$transaction`. Added `deactivate` mapping to Core deactivated state.
- **Why:** Maintain E2E synchronization of organization status bridging both DBs.
- **Risk & Rollback:** Low. If Core call fails, transaction is aborted gracefully via thrown error.

## 4. `organizations/organization.controller.ts`

- **Before:** Extracts `req.user.id` but not `req.coreJwt`.
- **After:** Extracts `req.coreJwt`, fast-fails, and passes down to service methods. Adds `@Delete` mapping for deactivate flow.
- **Why:** Secures the Core cross-service call by using the logged-in operator's SessionGuard-derived S2S token.
- **Risk & Rollback:** Low. Fails closed safely.
