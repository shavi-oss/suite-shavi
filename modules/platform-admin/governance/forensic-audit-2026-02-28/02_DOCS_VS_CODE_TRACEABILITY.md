# 02 — DOCS VS CODE TRACEABILITY

## Suite

| Governance Claim                                  | Evidence File                                              | Code Symbol                                                           | Status                                 |
| ------------------------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------- | -------------------------------------- |
| "Host listens on PORT env var"                    | `SUITE_DEPLOY_PLAN.md`, `STAGE_6_RUNTIME_STRATEGY.md`      | `main.ts` L49: `process.env.PORT \|\| 4000`                           | ✅ MATCH (but missing `'0.0.0.0'`)     |
| "BFF compiled by tsconfig.bff.json"               | `SUITE_DEPLOY_PLAN.md`                                     | Dockerfile L30: `npx tsc -p modules/platform-admin/tsconfig.bff.json` | ✅ MATCH                               |
| "Prisma migrate deploy on start"                  | `SUITE_RAILWAY_RUNBOOK.md`                                 | Dockerfile L41, CMD                                                   | ✅ MATCH                               |
| "Health: `/api/platform-admin/health`"            | `railway.json`, `SUITE_DEPLOY_VERIFICATION_EVIDENCE.md`    | `HealthController` at `@Controller('api/platform-admin')`             | ✅ MATCH                               |
| "DenyAllGuard as APP_GUARD"                       | `MODULE_SECURITY_LAWS.md`, `FAIL_CLOSED_MATRIX.md`         | `platform-admin.module.ts` L54-56                                     | ✅ MATCH                               |
| "CoreJWT never exposed to browser"                | `MODULE_SECURITY_LAWS.md`, `SECURITY_BASELINE.md`          | `session.guard.ts` — injects `coreJwt` server-side                    | ✅ MATCH                               |
| "Client SPA served via NestJS"                    | `STAGE_6_RUNTIME_STRATEGY.md`, `03_CLIENT_UI_INVENTORY.md` | Dockerfile: **NO Vite build step**                                    | 🔴 BROKEN                              |
| "Client build outDir: dist/platform-admin/client" | `vite.config.ts`                                           | `vite.config.ts` L9: `outDir: '../../../dist/platform-admin/client'`  | ✅ MATCH (but build not run in Docker) |
| "express.static middleware in main.ts /api guard" | `PR1_02_EXECUTION_REPORT.md`                               | `main.ts` L31-44                                                      | ⚠️ NOT DEPLOYED (old dist running)     |
| "CORS from CORS_ORIGIN env var"                   | `SUITE_DEPLOY_PLAN.md` T-1                                 | `main.ts` L17                                                         | ✅ MATCH                               |

## Core

| Governance Claim                              | Evidence File                               | Code Symbol                                           | Status   |
| --------------------------------------------- | ------------------------------------------- | ----------------------------------------------------- | -------- |
| "Admin endpoints under /api/v2/admin"         | `ARCHITECTURAL_LAWS.md`, audit reports      | `admin.controller.ts`                                 | ✅ MATCH |
| "`AdminJwtAuthGuard` guards all admin routes" | `SECURITY_BASELINE.md`, audit               | `admin.controller.ts` `@UseGuards(AdminJwtAuthGuard)` | ✅ MATCH |
| "CORS controlled by CORS_ALLOWED_ORIGINS"     | `CORS_ALLOWED_ORIGINS` env var in `main.ts` | `main.ts` L18-22                                      | ✅ MATCH |
| "Global prefix api/v1 excludes admin"         | Core `EXECUTION_READINESS_MATRIX.md`        | `main.ts` L28-30                                      | ✅ MATCH |
| "Port binding 0.0.0.0"                        | Deployment specs                            | `main.ts` L33 `app.listen(port, '0.0.0.0')`           | ✅ MATCH |
