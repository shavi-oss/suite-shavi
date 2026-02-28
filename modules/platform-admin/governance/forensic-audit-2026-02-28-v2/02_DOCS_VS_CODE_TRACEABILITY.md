# 02 — DOCS VS CODE TRACEABILITY

**Legend:** ✅ MATCH | ⚠️ PARTIAL | 🔴 CONTRADICT | 📅 STALE

---

## Suite BFF

| Claim                                             | Doc Source                                         | Code Evidence                                                                                       | Status                                       |
| ------------------------------------------------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| "Health: `/api/platform-admin/health`"            | `railway.json`, `SUITE_RAILWAY_RUNBOOK.md`         | `HealthController` — `@Controller('api/platform-admin')` with `@Get('health')`                      | ✅ MATCH                                     |
| "DenyAllGuard as APP_GUARD (deny-by-default)"     | `MODULE_SECURITY_LAWS.md`, `FAIL_CLOSED_MATRIX.md` | `platform-admin.module.ts` L54-56: `{ provide: APP_GUARD, useClass: DenyAllGuard }`                 | ✅ MATCH                                     |
| "SessionGuard + RbacGuard on org endpoints"       | `SECURITY_BASELINE.md`, `MODULE_SCOPE_LOCK.md`     | `organization.controller.ts` L31: `@UseGuards(SessionGuard, RbacGuard)`                             | ✅ MATCH                                     |
| "CoreJWT server-side only — never to browser"     | `MODULE_SECURITY_LAWS.md` LAW-5                    | `session.guard.ts` → `JwtStorageService.get(userId)`; never in response body                        | ✅ MATCH                                     |
| "CoreClient only calls allowlisted endpoints"     | `CORE_V1_INTEGRATION_LOCK.md`                      | `core.contract.assert.ts` — `ALLOWED_CORE_ENDPOINTS` const + runtime assertion                      | ✅ MATCH                                     |
| "5 allowed Core endpoints"                        | `MODULE_INTEGRATION_PLAN.md`                       | `core.contract.assert.ts` L14-20: GET orgs/:id, POST admin/orgs, PATCH suspend/unsuspend/deactivate | ✅ MATCH                                     |
| "BFF compiled by tsconfig.bff.json"               | `SUITE_DEPLOY_PLAN.md`                             | Dockerfile L30: `npx tsc -p modules/platform-admin/tsconfig.bff.json`                               | ✅ MATCH                                     |
| "Prisma migrate on container start"               | `SUITE_RAILWAY_RUNBOOK.md`                         | Dockerfile CMD L41: `npx prisma migrate deploy ...`                                                 | ✅ MATCH                                     |
| "SPA served via ServeStaticModule"                | `STAGE_6_RUNTIME_STRATEGY.md` (pre-PR-1 claim)     | `main.ts` L31-44: express.static middleware (NOT ServeStaticModule)                                 | ⚠️ PARTIAL — method changed but outcome same |
| "Client build outDir: dist/platform-admin/client" | `vite.config.ts` comment                           | `vite.config.ts` `outDir: '../../../dist/platform-admin/client'`                                    | ✅ MATCH                                     |
| "Vite client build in Dockerfile"                 | `06_DOCKER_RUNTIME_FINAL.md` (PR-1), PR-2 commit   | Dockerfile (post-PR-2) L35-38: `RUN npx vite build --config ...`                                    | ✅ MATCH (post-PR-2)                         |
| "CORS from CORS_ORIGIN env var"                   | `SUITE_DEPLOY_PLAN.md` T-1                         | `main.ts` L17-23                                                                                    | ✅ MATCH                                     |
| "railway.json builder: NIXPACKS"                  | `railway.json` (pre-PR-2)                          | Dockerfile EXISTS → Railway uses Docker (contradiction resolved in PR-2)                            | 🔴 WAS CONTRADICT → Fixed in PR-2            |
| "`app.listen(port)` without 0.0.0.0"              | Not in docs (was implicit)                         | `main.ts` L53 post-PR-2: `app.listen(port, '0.0.0.0')`                                              | ✅ Fixed in PR-2                             |
| "CORS_ORIGIN set on Railway"                      | `SUITE_DEPLOY_PLAN.md`                             | `railway variables`: `CORS_ORIGIN = https://web-production-6f02f6.up.railway.app`                   | ✅ MATCH                                     |

---

## Core API

| Claim                                     | Doc Source                                        | Code Evidence                                                                                   | Status                                                                        |
| ----------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| "Admin routes at `/api/v2/admin`"         | `ARCHITECTURAL_LAWS.md`, audit reports            | `admin.controller.ts` L33: `@Controller('api/v2/admin/organizations')`                          | ✅ MATCH                                                                      |
| "AdminJwtAuthGuard on all admin routes"   | `SECURITY_BASELINE.md`                            | `admin.controller.ts` L34: `@UseGuards(AdminJwtAuthGuard)`                                      | ✅ MATCH                                                                      |
| "organizationId not accepted from client" | Core governance (LAW SEC-02)                      | `admin.controller.ts` L54-61: runtime check + BadRequestException                               | ✅ MATCH                                                                      |
| "Global prefix api/v1, excluding admin"   | Docs + `main.ts` comment                          | `main.ts` L28-30: `app.setGlobalPrefix('api/v1', { exclude: [{path: 'api/v2/admin/:path*'}] })` | ✅ MATCH                                                                      |
| "Port binding 0.0.0.0"                    | Deployment specs                                  | `main.ts` L33: `app.listen(port, '0.0.0.0')`                                                    | ✅ MATCH                                                                      |
| "CORS from CORS_ALLOWED_ORIGINS env"      | Docs                                              | `main.ts` L19-22                                                                                | ✅ MATCH                                                                      |
| "TenantMiddleware on `path: *`"           | Docs (implicit multi-tenant design)               | `app.module.ts` L47-49: `.apply(TenantMiddleware).forRoutes({path:'*',...})`                    | ⚠️ PARTIAL — admin S2S calls may fail if middleware rejects no-tenant JWT     |
| "Core health endpoint"                    | `SUITE_RAILWAY_RUNBOOK.md` references Core health | No `/health` route in Core code found                                                           | 🔴 CONTRADICT — health path undocumented                                      |
| "ADMIN_JWKS_URL env var"                  | Core config / auth guard                          | `admin-jwt.guard.ts` (inferred — references JWKS URL)                                           | ⚠️ PARTIAL — guard confirmed, JWKS URL env not directly verified in code read |

---

## JWKS Server

| Claim                                     | Doc Source                            | Code Evidence                                                                    | Status                               |
| ----------------------------------------- | ------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------ |
| "Serves `/.well-known/jwks.json`"         | `SUITE_RAILWAY_RUNBOOK.md`, JWKS docs | `index.js` L101: `if (req.method==='GET' && req.url==='/.well-known/jwks.json')` | ✅ MATCH                             |
| "Health at `/health`"                     | JWKS Dockerfile comments              | `index.js` L107: `if (req.method==='GET' && req.url==='/health')`                | ✅ MATCH                             |
| "No private keys in response"             | Security docs                         | `index.js` L84-93: hard-fails on private field detection                         | ✅ MATCH                             |
| "ADMIN_JWKS_B64 env var"                  | JWKS README comments                  | `index.js` L43-50: process.exit(1) if missing                                    | ✅ MATCH                             |
| "No npm dependencies"                     | JWKS Dockerfile (no npm install step) | `index.js` L21: only `require('http')`                                           | ✅ MATCH                             |
| "JWKS Dockerfile has no npm install step" | Dockerfile                            | Dockerfile L5-6: COPY and CMD only, NO RUN npm install                           | ✅ MATCH (safe only because no deps) |
