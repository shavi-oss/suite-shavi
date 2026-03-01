# 02 — SUITE CODE TRUTH (BFF)

## A. Modules & Controllers Topology

All business logic is isolated in `src/`.

- `HealthController` (`@UseGuards(ExplicitAllowGuard)`)
- `OrganizationController` (`@UseGuards(SessionGuard, RbacGuard)`)
- `OrgMappingController` (`@UseGuards(SessionGuard, RbacGuard)`)
- `InternalUserController` (`@UseGuards(RbacGuard)`)
- `AuditController` (`@UseGuards(RbacGuard)`)
- `AuthController` (`@UseGuards(ExplicitAllowGuard)`)

## B. Guard Architecture

- **Global:** `DenyAllGuard` is applied as `APP_GUARD` in `platform-admin.module.ts`. Every endpoint is locked implicitly.
- **Session:** `SessionGuard` explicitly retrieves the user's cookie, validates the session, then retrieves the server-side `coreJwt` from `JwtStorageService`. Fails closed (`401`) rigidly.
- **Roles:** `RbacGuard` maps to `security/roles.enum.ts`.

## C. Core Wiring (`core.client.ts`)

- Configured exactly to `CORE_API_BASE_URL` env var.
- Asserts strict list of allowed endpoints (`ALLOWED_CORE_ENDPOINTS` in `core.contract.assert.ts`), which accurately maps:
  - `GET /api/v1/organizations/:id`
  - `POST /api/v2/admin/organizations`
  - `PATCH /api/v2/admin/organizations/:id/suspend`
  - `PATCH /api/v2/admin/organizations/:id/unsuspend`
  - `PATCH /api/v2/admin/organizations/:id/deactivate`
- All cross-calls append the `Authorization: Bearer <coreJwt>` and `x-correlation-id` headers. Uncaught HTTP exceptions are safely caught and re-thrown to fail the Prisma `$transaction`.

## D. Database Models (`schema.prisma`)

- `SuiteOrganization`
- `SuiteOrgMapping`
- `InternalUser`
- `PlatformAdminAuditLog`
- Minimalist, exact matches to the `MODULE_SCOPE_LOCK.md`. No workflow, customer, or template tables exist.

## E. E2E Blockers Found

1. **The React UI (Client) is completely disconnected in production.** The `main.ts` file boots the NestJS backend on the configured port, but no middleware (e.g., `@nestjs/serve-static`) exists to serve the built `dist/platform-admin/client/index.html` file. Navigating to `/` falls into the backend API routing map and returns a generic 404.
