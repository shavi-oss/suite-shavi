# 04 — CORE CAPABILITIES INVENTORY (`BassanOs`)

## A. Admin API Endpoints (`/api/v2/admin/organizations`)

This is the definitive list of endpoints exposed by the Core for the Suite to consume regarding Organization Lifecycle:

1. `POST /api/v2/admin/organizations`
   - **Action:** Creates a new tenant organization in Core DB.
2. `PATCH /api/v2/admin/organizations/:id/suspend`
   - **Action:** Sets `isActive: false` on the target organization.
3. `PATCH /api/v2/admin/organizations/:id/unsuspend`
   - **Action:** Sets `isActive: true` on the target organization.
4. `PATCH /api/v2/admin/organizations/:id/deactivate`
   - **Action:** Sets `isActive: false` (terminal conceptual state) on the target organization.

_Note: All 4 operations trigger mandatory pre- and post-operation fail-closed audit logging (`AdminAuditService`)._

## B. Core Identity Constraints

- **Guards:** All endpoints under the `admin` router are governed by `AdminJwtAuthGuard` mapping to the `admin-jwt` Passport strategy.
- **Key Location:** The JWKS server provides the public key via `ADMIN_JWKS_URL`. The JWT must contain the expected `kid` (admin-key-2). Fails completely (HttpStatus 401) on key mismatch, signature failure, or missing token payload.

## C. Network Isolation Constraints

- **CORS Protection:** `CORS_ALLOWED_ORIGINS` is configured exclusively to `https://web-production-6f02f6.up.railway.app` in the live environment.
- Any request originating from outside this boundary is unceremoniously dropped by standard CORS pre-flight logic (no `Access-Control-Allow-Origin` headers emitted for evil origins).
