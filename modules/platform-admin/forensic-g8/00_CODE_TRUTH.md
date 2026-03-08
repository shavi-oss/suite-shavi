# 00_CODE_TRUTH.md — Gate 8

**Date**: 2026-03-08

## 1. Existing org-mapping BFF files

All 4 org-mapping files already exist:

### `org-mapping.controller.ts`

- 3 endpoints: POST (create), GET (list), GET /:suiteOrgId (detail)
- RBAC: `@RequirePermission(Resource.ORG_MAPPINGS, Actor.WRITE/READ)`
- SessionGuard + RbacGuard on controller class
- Reads `req.coreJwt` for validation — **see blocker below**

### `org-mapping.service.ts`

- Validates Suite org exists
- Checks duplicate Suite mapping (fail-closed: ConflictException)
- Checks duplicate Core mapping (fail-closed: ConflictException)
- Calls `coreClient.validateOrganizationExists()` (fail-closed on failure)
- Creates DB + audit log in a single Prisma $transaction → atomic
- `create()`, `findAll()`, `findBySuiteOrgId()` all implemented

### `org-mapping.repository.ts`

- `create`, `findBySuiteOrgId`, `findByCoreOrgId`, `findAll`, `delete`

### DTO

- `CreateOrgMappingDto { suiteOrgId: string; coreOrgId: string }`
- `OrgMappingResponseDto { suiteOrgId, coreOrgId, createdAt, updatedAt, createdBy }`

## 2. Prisma SuiteOrgMapping model

```prisma
model SuiteOrgMapping {
  suiteOrgId String @id @db.Uuid
  coreOrgId  String @unique @db.VarChar(255)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  createdBy  String   @db.Uuid
  suiteOrg   SuiteOrganization @relation(...)
}
```

Fully defined. `suiteOrgId` = PK, `coreOrgId` = unique → both duplicate paths enforced at DB level.

## 3. Allowed Core validation endpoint

```
GET /api/v1/organizations/:id
- Returns 200 if org exists
- Returns 404 if not found
- Returns 401/403 on auth failure
- Returns 5xx on server error
```

Source: `CoreClient.validateOrganizationExists()`, `assertCoreEndpointAllowed()` allowlist.
JWT required: `Authorization: Bearer {coreJwt}`.

## 4. RBAC rules for org mapping

| Role           | ORG_MAPPINGS |
| -------------- | ------------ |
| platform_admin | READ + WRITE |
| developer_ops  | READ + WRITE |
| support        | READ only    |
| viewer         | READ only    |

Source: `permissions.map.ts`

## 5. Audit logging

- `AuditService.logAction()` accepts optional `tx` (Prisma transaction client)
- Immutable — fail throws, wrapping $transaction rolls back
- Used correctly in `org-mapping.service.ts` create method

## 6. Current fail-closed rules

- Missing Suite org → 404 NotFoundException
- Duplicate Suite mapping → 409 ConflictException
- Duplicate Core mapping → 409 ConflictException
- Core validation failure (network/5xx) → 400 BadRequestException
- Core org not found (404) → 404 NotFoundException
- Audit failure → rolled back (transaction)

## 7. KEY BLOCKER — SessionGuard coreJwt minting scope

SessionGuard constant:

```ts
const WRITE_PATH_PATTERN = /^\/api\/platform-admin\/organizations(\\/|$)/i;
```

This ONLY mints coreJwt for `/organizations/*` write routes.
`POST /api/platform-admin/org-mappings` is outside this pattern.
→ `req.coreJwt` will always be `undefined` for org-mapping writes.
→ Controller guard check `if (!coreJwt)` throws generic `Error` (not `UnauthorizedException`) → 500.

**Fix required**: extend pattern to also match `/org-mappings` write routes (minimal surgical change).

## 8. UI Gap

Zero org-mapping UI components in `client/src/components/`.
Zero org-mapping API client functions in `platformAdmin.ts`.
This is the primary missing piece for usable end-to-end flow.
