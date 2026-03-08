# 05_CHANGELOG_PER_FILE.md — Gate 6

**Date**: 2026-03-08

## Files Modified

### `modules/platform-admin/client/src/components/OrganizationCreate.tsx`

- Added 4 missing form fields: `adminFirstName`, `adminLastName`, `adminEmail`, `adminPassword`
- Added client-side validation before submit (all fields required, valid email format)
- Added form reset on success (EMPTY_FORM state)
- Consistent field styling, proper `autocomplete` attributes, 2-column grid for name fields
- `submit()` and `onRetry` wiring unchanged

### `modules/platform-admin/client/src/api/platformAdmin.ts`

- Extended `CreateOrganizationDto` with 4 fields: `adminEmail`, `adminPassword`, `adminFirstName`, `adminLastName`
- `createOrganization()`: improved error handling — status 400 reads server message, other statuses use generic fallback

## Files NOT Modified

- `session.guard.ts` — JWT minting unchanged
- `core.client.ts` — CoreClient unchanged
- `organization.service.ts` — BFF service unchanged
- `auth.service.ts` — Login unchanged
- All other client components unchanged
- No `package.json` changes
- No dependency changes
