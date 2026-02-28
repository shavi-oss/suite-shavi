# 03 — CONTRADICTIONS AND GAPS

---

## C1 — Suite: Old `dist/main.js` Deployed (CRITICAL)

**Symptom**: `GET /api/platform-admin/organizations` returns `200 text/html` (SPA fallback). Railway logs show `ETag: "dgpxmdj4av4099"` and `Last-Modified: Fri, 27 Feb 2026 17:48:54 GMT` for every `/api/*` GET response.

**Root cause (proved)**:

1. `dist/` is gitignored in suite-shavi repo.
2. Before PR-2 (`3eebe0f`), `railway.json` set `builder: NIXPACKS` — Railway built with Nixpacks (ignores Dockerfile).
3. The Nixpacks build ran `npm run build:platform-admin` = `npx tsc -p tsconfig.json` — but this was failing with JSX errors before `74f3a81` added the `exclude` array to `tsconfig.json`. The compiled `main.js` was therefore the OLD version (pre-PR-1 express.static code).
4. After PR-2, `builder: DOCKERFILE` — Railway now uses the Dockerfile and runs `npx tsc -p tsconfig.bff.json` correctly.

**Blast radius**: All GET requests to `/api/*` bypass NestJS guards. DenyAllGuard + SessionGuard + RbacGuard are NOT intercepting GET requests.

**Fix**: PR-2 (`3eebe0f`) fixes this. Verify post-deploy.

---

## C2 — Suite Dockerfile Missing Vite Build (CRITICAL)

**Symptom**: Fresh Docker build has no `dist/platform-admin/client/` directory → `expressStaticMiddleware` serves nothing → `sendFile(index.html)` fallback fires for ALL routes including `/api/*`.

**Root cause**: Original Dockerfile compiled BFF only (`npx tsc -p tsconfig.bff.json`). No `vite build` was included. The SPA was present in the live deployment only because a prior Nixpacks build cached it in Railway.

**Fix**: PR-2 (`3eebe0f`) adds `RUN npx vite build --config modules/platform-admin/client/vite.config.ts` to the Dockerfile.

---

## C3 — railway.json NIXPACKS vs Dockerfile (HIGH)

**Symptom**: `railway.json` specified `builder: NIXPACKS`, but a `Dockerfile` exists in the repo root. Railway Dashboard shows "Using Detected Dockerfile." This creates ambiguity — Railway may honor the Dashboard setting (Docker) or the committed `railway.json` (Nixpacks).

**Root cause**: `railway.json` `build.builder` field was added as NIXPACKS by convention but overridden in Railway Dashboard when Dockerfile was detected.

**Fix**: PR-2 changes to `builder: DOCKERFILE`, removing `buildCommand` and `startCommand` (both superseded by Dockerfile).

---

## C4 — main.ts Without `0.0.0.0` (HIGH)

**Symptom**: `app.listen(port)` in NestJS/Express may bind to `127.0.0.1` in some environments.

**Root cause**: NestJS default. In most Node versions, Express defaults to `0.0.0.0`, but for container portability and Railway reliability, explicit binding is required.

**Fix**: PR-2 changes to `app.listen(port, '0.0.0.0')`.

---

## C5 — Suite DELETE /:id maps to Core PATCH /deactivate (LOW)

**Symptom**: Suite `OrganizationController` uses `@Delete(':id')` for deactivation. Core `AdminController` uses `@Patch(':id/deactivate')`. Symmetric method semantics differ.

**Root cause**: Design decision — Suite uses HTTP DELETE (semantics of "remove"), Core uses PATCH (semantics of "state transition"). The translation happens in `OrganizationService.deactivate()` → `CoreClient.deactivateOrganization()` → `PATCH /api/v2/admin/organizations/:id/deactivate`.

**Blast radius**: None — this is intentional and correctly implemented. No fix needed. Document as deliberate.

---

## C6 — Core: No `/health` Endpoint (MEDIUM)

**Symptom**: No `@Controller` or `@Get('health')` found in Core codebase after scanning `app.module.ts` and known controllers.

**Root cause**: Health endpoint was never added to Core. Railway may use its own TCP health check, or a different path.

**Blast radius**: Railway healthcheck for Core service may be failing silently. External monitoring that probes `/health` will get a 404.

**Fix candidate**: Add minimal `HealthController` to Core with `@Get('/health')` returning `{ status: 'ok' }`. Or configure Railway healthcheck to use an existing endpoint.

---

## C7 — TenantMiddleware Applied to ALL Core Routes (MEDIUM)

**Symptom**: `TenantMiddleware` is applied to `path: '*'` in `app.module.ts`. This means it runs on `/api/v2/admin/*` routes as well.

**Root cause**: Middleware was added globally for tenant resolution without explicitly excluding admin routes.

**Blast radius**: S2S admin calls from Suite BFF may lack tenant headers. If `TenantMiddleware` extracts `organizationId` from headers and the admin JWT doesn't carry them, middleware may reject or corrupt the request context. Must be verified by inspecting `TenantMiddleware` implementation.

---

## C8 — JWKS Domain Unknown (MEDIUM)

**Symptom**: All probed JWKS domain variants returned 404. The `ADMIN_JWKS_URL` env var required by Core `AdminJwtAuthGuard` points to an unknown domain.

**Root cause**: JWKS URL was never documented in shared governance docs. The Railway-assigned domain for the JWKS service is not tracked in code.

**Blast radius**: If `ADMIN_JWKS_URL` is wrong or the service is down, ALL Suite→Core admin S2S calls fail (JWT validation fails → 401 from Core).

**Fix**: Manual verification via Railway Dashboard → jwks-server service → copy public URL → verify it responds at `/.well-known/jwks.json`.
