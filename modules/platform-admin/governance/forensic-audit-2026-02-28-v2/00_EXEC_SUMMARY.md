# 00 — EXECUTIVE SUMMARY

**Audit:** Bassan Platform Full Forensic Audit — Phase 1
**Date:** 2026-02-28T05:15Z
**Scope:** Core (shavi-oss/Bassan.os) + Suite (shavi-oss/suite-shavi) + Railway live state
**Method:** Code-first evidence → docs comparison → live CLI/curl verification

---

## What Is True (From Code)

### Suite BFF (platform-admin)

- **Host**: NestJS 11 + Express, compiles via `tsconfig.bff.json` → `dist/modules/platform-admin/host/main.js`
- **Security**: `DenyAllGuard` as `APP_GUARD` (deny-by-default). `SessionGuard` + `RbacGuard` on all org/user endpoints. `ExplicitAllowGuard` on health. `coreJwt` is server-side only — never in response.
- **Routes**: 5 controllers: `HealthController`, `OrganizationController`, `InternalUserController`, `OrgMappingController`, `AuditController`, `AuthController`
- **Core Integration**: `CoreClient` calls 5 allowlisted Core endpoints. `assertCoreEndpointAllowed()` is a runtime guard.
- **SPA Model**: `express.static(clientPath)` + `sendFile(index.html)` fallback in `main.ts`. **Guard: `if (!req.path.startsWith('/api'))`** before serving HTML.
- **Dockerfile**: `node:20-alpine`, BFF compiled, Vite client build added (PR-2), `server.listen(PORT, '0.0.0.0')`

### Core API (core-admin-mount)

- **Host**: NestJS 10 + Express, `nest build` → `dist/src/main.js`
- **Routes**: Global prefix `api/v1` (excl. `api/v2/admin/*`). Admin routes at `/api/v2/admin/organizations` (4 routes: POST create, PATCH suspend/unsuspend/deactivate).
- **Guard**: `AdminJwtAuthGuard` on all `/api/v2/admin/*`. JWKS-based JWT validation.
- **Modules**: Auth, Organizations, Users, Roles, Workflows, WorkflowInstances, Admin, Executor, Scheduler + more.

### JWKS Server

- **Host**: Vanilla Node.js `http.createServer`, no npm deps, `server.listen(PORT, '0.0.0.0')`
- **Routes**: `GET /.well-known/jwks.json` (JWKS), `GET /health` (healthcheck), else 404
- **Env**: Requires `ADMIN_JWKS_B64` (base64-encoded JWKS JSON). Hard-fails if missing or contains private keys.

---

## What Is Currently Broken

| #   | Issue                                                                                     | Where                   | Severity    |
| --- | ----------------------------------------------------------------------------------------- | ----------------------- | ----------- |
| 1   | **Suite: Old dist/main.js running** — API GET routes return SPA HTML                      | Live Railway            | 🔴 CRITICAL |
| 2   | **Suite Dockerfile missing Vite build** (pre-PR-2) — fresh Docker build has no SPA assets | Docker                  | 🔴 CRITICAL |
| 3   | **railway.json was NIXPACKS** (conflicts with Dockerfile)                                 | railway.json (pre-PR-2) | 🟠 HIGH     |
| 4   | **main.ts `app.listen(port)` without `'0.0.0.0'`** (pre-PR-2)                             | main.ts                 | 🟠 HIGH     |
| 5   | **JWKS domain unknown** — no live-verified JWKS endpoint                                  | Railway                 | 🟡 MEDIUM   |
| 6   | **Suite DELETE/:id maps to Core PATCH /deactivate** — asymmetric method semantics         | Code                    | 🟡 LOW      |

_Note: Issues 2-4 are fixed in commit `3eebe0f` (PR-2, pushed 2026-02-28T03:xx). Railway rebuilding now._

---

## Top 5 Risks

1. **Old binary serving HTML for `/api/*`** — DenyAllGuard bypassed for GET requests. Authenticated sessions would receive SPA HTML instead of JSON for all organization GET routes.
2. **JWKS reachability** — If `ADMIN_JWKS_URL` in Core points to a dead domain, all Suite→Core admin S2S calls fail (JWT validation at Core fails → all lifecycle ops return 401).
3. **Single-image Docker** — No multi-stage build. `node_modules` + `src` + `dist` all in one layer. Image is large. No security scanning. Acceptable for dev, needs hardening for prod scale.
4. **No `/api` health JSON** — `GET /api/platform-admin/health` returns HTML in current live state. Railway healthcheck passes (200 is 200), but monitoring that expects JSON will fail.
5. **TenantMiddleware on all Core routes** — `TenantMiddleware` is applied to `path: "*"` including `/api/v2/admin/*`. This could interfere with S2S admin calls if the admin JWT doesn't carry tenant headers. Must be verified.

---

## Recommended Path (Minimal)

1. **Confirm PR-2 Railway rebuild succeeded** (verify `/api/platform-admin/health` returns JSON, not HTML).
2. **Verify JWKS domain** from Railway Dashboard → confirm `ADMIN_JWKS_URL` env var in Core.
3. **Test Suite→Core integration end-to-end** (create org → verify coreOrgId returned).
4. **No further code changes** unless the above verification fails.
