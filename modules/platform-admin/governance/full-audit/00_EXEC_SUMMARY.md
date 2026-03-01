# BASSAN FULL STACK AUDIT — EXECUTIVE SUMMARY

**Date:** 2026-02-27
**Scope:** Core (`BassanOs`) ↔ Suite (`suite-shavi`) Integration & Governance Integrity
**Execution Mode:** STRICT · FAIL-CLOSED · READ-ONLY

## 1. The Core Truth (What is Implemented Today)

- **Suite UI (`/`) Empty Blank Page Diagnosed:** The `suite-shavi` Vite React application builds successfully to `dist/platform-admin/client`, but the NestJS BFF (`host/main.ts` & `platform-admin.module.ts`) **does not use `ServeStaticModule`**. The production startup script `node dist/modules/platform-admin/host/main.js` only boots the API. As a result, navigating to the Railway domain root returns _Not Found_.
- **Suite BFF (API) Topology:** Explicit fail-closed routing via global `DenyAllGuard`. Opt-in `ExplicitAllowGuard`, strict `RbacGuard`, and a highly secure `SessionGuard` which parses browser cookies and securely injects a server-side `coreJwt` block (never exposing tokens to the client).
- **Core API Capabilities:** The Core codebase exposes strict lifecycle endpoints (`POST`, `PATCH /suspend`, `PATCH /unsuspend`, `PATCH /deactivate`) under `/api/v2/admin/organizations`. These are tightly shielded by `AdminJwtAuthGuard` and a strict `CORS_ALLOWED_ORIGINS` matrix.

## 2. Integration & Gap Analysis

The actual integration wiring from Suite BFF → Core API is solid via the `CoreClient` adapter which threads the `coreJwt` and fail-closed audit states correctly.
**However**, there is a severe gap in the Governance Docs: `MODULE_SCOPE_LOCK.md` does not list the 3 newly added Phase C Core proxy mappings (suspend, unsuspend, deactivate), rendering the governance state stale compared to actual deployed code truth.

## 3. Fail-Closed Posture

**PASS.** Both systems exhibit extreme fail-closed behavior. Core rejects malformed/missing headers outright with `401 Unauthorized`. Suite BFF kills operations immediately if audit logging fails or network calls to Core drop during transaction lifecycles.

## 4. Recommended Action Path

**APPROVE WITH CONDITIONS (A/B Path)**

- **Path A (Code fix):** Add `ServeStaticModule.forRoot({ rootPath: join(__dirname, '../../client') })` to `platform-admin.module.ts` to finally serve the React UI.
- **Path B (Gov fix):** Update `MODULE_SCOPE_LOCK.md` to legally authorize the 3 newly added lifecycle endpoints.
