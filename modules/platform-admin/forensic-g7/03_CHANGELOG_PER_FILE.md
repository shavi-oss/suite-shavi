# 03_CHANGELOG_PER_FILE.md — Gate 7

**Date**: 2026-03-08

## Files Modified

### `client/src/components/OrganizationDetail.tsx`

- Added deactivate action button
- Added confirmation dialog for suspend (warns: access blocked)
- Added confirmation dialog for deactivate (warns: permanent/irreversible)
- Added success feedback banner after suspend/unsuspend/deactivate
- Replaced `actionLoading` bool with `ActionState` enum for cleaner state machine
- Fixed error retry wiring — now retries loadOrganization, not the action
- Added `statusBadgeStyle()` helper for 3-state badge (active/suspended/other)
- `deleteOrganization` imported from API client

### `client/src/api/platformAdmin.ts`

- Added `deleteOrganization(id: string)` function calling `DELETE /organizations/:id`

### `tests/org-flows.test.mjs` [NEW]

- 10 regression tests using Node.js built-in assert + fetch (no test runner dependency)
- Covers: health, unauth create (401), login, GET orgs, create (201), incomplete payload, list-after-create, suspend, unsuspend, deactivate

## Files NOT Modified

- `OrganizationCreate.tsx` — already polished in Gate 6
- `OrganizationList.tsx` — read-only; no write actions to polish
- `platformAdmin.ts` — minimal change only (deleteOrganization added)
- Session guard, CoreClient, auth service — unchanged
- No `package.json` changes
- No new dependencies
