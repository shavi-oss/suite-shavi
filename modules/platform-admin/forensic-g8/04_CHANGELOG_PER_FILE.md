# 04_CHANGELOG_PER_FILE.md — Gate 8

**Date**: 2026-03-08

## Files Modified

### `src/auth/session.guard.ts`

- Extended `WRITE_PATH_PATTERN` regex to also match `/org-mappings` write routes
- Allows SessionGuard to mint coreJwt for `POST /api/platform-admin/org-mappings`
- This was a proven blocker: without this, `req.coreJwt` was always undefined → endpoint always 500

### `src/org-mapping/org-mapping.controller.ts`

- Added `UnauthorizedException` import from `@nestjs/common`
- Added `ExplicitAllow` import and `@ExplicitAllow()` decorator (required for DenyAllGuard reflector pattern, consistent with OrganizationController)
- Changed `throw new Error(...)` → `throw new UnauthorizedException(...)` for missing coreJwt (HTTP 401 not 500)

### `client/src/api/platformAdmin.ts`

- Added `OrgMapping` interface
- Added `CreateOrgMappingDto` interface
- Added `getOrgMappings()` function — GET /org-mappings
- Added `getOrgMapping(suiteOrgId)` function — GET /org-mappings/:id (returns null on 404)
- Added `createOrgMapping(dto)` function — POST /org-mappings with safe error surfacing

### `client/src/components/OrgMappingSection.tsx` [NEW]

- Loads existing mapping for the given suiteOrgId on mount
- Shows existing mapping (coreOrgId, createdAt) if present
- Shows create form (coreOrgId input + "Link to Core Org" button) if not mapped
- Success banner on create
- Error feedback (safe messages)
- Pending state protection (button disabled during "Linking...")
- Fail-closed on auth errors (silently hides, doesn't 500)

### `client/src/components/OrganizationDetail.tsx`

- Added import for `OrgMappingSection`
- Added `<OrgMappingSection suiteOrgId={organizationId} />` below the lifecycle actions block

### `tests/org-flows.test.mjs`

- Refactored T10 to create a fresh org (so createdOrgId remains for org-mapping tests)
- Added T11: unauthenticated POST /org-mappings → 401 (fail-closed)
- Added T12: authenticated GET /org-mappings → 200 JSON array
- Added T13: GET /org-mappings/:id for unmapped org → 404
- Added T14: GET /org-mappings/:nonExistentId (fake UUID) → 404 or 400

## Files NOT Modified

- Prisma schema (SuiteOrgMapping model already fully defined)
- CoreClient (validateOrganizationExists already correct)
- RBAC permissions (already correct)
- AuditService (already correct with tx support)
- org-mapping.service.ts (already complete)
- org-mapping.repository.ts (already complete)
