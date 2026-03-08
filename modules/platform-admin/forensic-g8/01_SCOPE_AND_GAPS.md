# 01_SCOPE_AND_GAPS.md — Gate 8

**Date**: 2026-03-08

## What Exists (BFF — complete)

- ✅ `org-mapping.controller.ts` — 3 endpoints
- ✅ `org-mapping.service.ts` — full business logic
- ✅ `org-mapping.repository.ts` — full CRUD
- ✅ `org-mapping.dto.ts` — request/response types
- ✅ `prisma/schema.prisma` — SuiteOrgMapping model
- ✅ `CoreClient.validateOrganizationExists()` — GET /api/v1/organizations/:id
- ✅ RBAC permissions defined
- ✅ Audit logging wired

## What is Missing / Broken

### 1. SessionGuard write path pattern (BLOCKER — minimal fix)

`WRITE_PATH_PATTERN` only matches `/organizations/*`. Needs to also match `POST /org-mappings`.
**Fix**: extend the regex OR mint coreJwt for all write routes (safer, simpler).

### 2. Controller fail-closed error type (minor)

Line 54: `throw new Error(...)` for missing coreJwt → 500 instead of 401.
**Fix**: throw `UnauthorizedException`.

### 3. UI — Fully Missing (primary gap)

- No `OrgMappingList.tsx` component
- No `OrgMappingCreate.tsx` component
- No `getOrgMappings()`, `createOrgMapping()` functions in `platformAdmin.ts`
- No entry point in app navigation/routing to reach mapping flow

### 4. Regression tests for org-mapping flow (missing)

- `tests/org-flows.test.mjs` covers orgs but not mappings

## Root Cause Of Missing UI

The BFF was implemented but the matching UI was deferred.

## Implementation Plan

1. Fix SessionGuard: extend WRITE_PATH_PATTERN to include `/org-mappings`
2. Fix controller: `UnauthorizedException` instead of `Error`
3. Add API client functions: `getOrgMappings()`, `getOrgMapping()`, `createOrgMapping()`
4. Add UI: `OrgMappingCreate.tsx`, integrate into `OrganizationDetail.tsx` as a mapping section
5. Add regression tests to `org-flows.test.mjs`
