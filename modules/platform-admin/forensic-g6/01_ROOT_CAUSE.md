# 01_ROOT_CAUSE.md — Gate 6

**Date**: 2026-03-08

## Confirmed Root Causes

### Root Cause A — UI form is incomplete ✅

`OrganizationCreate.tsx` only renders ONE input field (`name`).
It sends `{ name: name.trim() }` only.

### Root Cause B — API client payload is incomplete ✅

`CreateOrganizationDto` in `platformAdmin.ts` only has `{ name: string }`.
Even if the UI collected all fields, the DTO type would block them.

### Root Cause C — Response parsing mismatch ❌ (does NOT apply at client level)

The Suite BFF `OrganizationController` returns `OrganizationResponseDto` (flat shape).
The client reads `response.json()` as `Organization` — this is correct.
The `data.organization.id` mismatch was a BFF→Core layer issue, already fixed in Gate 5.2.

## Root Cause D — Compound

**D applies: Both A and B are confirmed.**  
The create flow fails because:

1. UI only collects `name` → user cannot enter required fields
2. `createOrganization()` DTO type only accepts `{ name }` → even if UI collected more, it would be blocked

## Additional Finding (not a root cause)

Error handling in `createOrganization()` throws a generic `Error('Failed to create organization')` regardless of HTTP status (400 validation vs 500 server). This causes a poor UX when Core returns a 400 (email already taken). This should be improved (Phase 2.4).
