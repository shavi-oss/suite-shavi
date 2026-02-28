# 01 — SERVICE TRUTH MAP

## Suite — `web` (suite-shavi-staging)

| Field                    | Value                                                                                                 | Source                           |
| ------------------------ | ----------------------------------------------------------------------------------------------------- | -------------------------------- |
| **Repo**                 | shavi-oss/suite-shavi                                                                                 | Railway dashboard                |
| **Project**              | suite-shavi-staging                                                                                   | `railway status`                 |
| **Service name**         | web                                                                                                   | `railway status`                 |
| **Railway runtime**      | Docker (Dockerfile detected)                                                                          | User context / Railway dashboard |
| **railway.json builder** | NIXPACKS (**inconsistent — ignored by Railway**)                                                      | `railway.json` L4                |
| **Dockerfile**           | `d:/Basaan os/suite-shavi/Dockerfile`                                                                 | Repo root                        |
| **Build steps**          | `npm ci --ignore-scripts` → `prisma generate` → `npx tsc -p modules/platform-admin/tsconfig.bff.json` | Dockerfile L18, L26, L30         |
| **EXPOSE port**          | 4000                                                                                                  | Dockerfile L36                   |
| **CMD**                  | `sh -c "npx prisma migrate deploy ... && node dist/modules/platform-admin/host/main.js"`              | Dockerfile L41                   |
| **main.ts entrypoint**   | `dist/modules/platform-admin/host/main.js`                                                            | tsconfig.bff.json outDir         |
| **Port binding**         | `process.env.PORT \|\| 4000` — **missing `'0.0.0.0'`**                                                | `main.ts` L49-L50                |
| **Health path**          | `/api/platform-admin/health`                                                                          | `railway.json` L9                |
| **Public domain**        | `https://web-production-6f02f6.up.railway.app`                                                        | Live probe                       |
| **ENV vars required**    | `PORT`, `DATABASE_URL`, `CORE_API_BASE_URL`, `CORS_ORIGIN`                                            | `railway variables` output       |
| **Client SPA build**     | **NOT in Dockerfile** — BFF compiles only                                                             | Dockerfile (no vite build step)  |

---

## Core API — `core-admin-mount`

| Field             | Value                                                       | Source                        |
| ----------------- | ----------------------------------------------------------- | ----------------------------- |
| **Repo**          | shavi-oss/Bassan.os                                         | Known                         |
| **Root**          | `/backend`                                                  | Railway config (service root) |
| **Dockerfile**    | `backend/Dockerfile`                                        | Repo                          |
| **Build**         | `npm ci` → `prisma generate` → `npm run build` (nest build) | Dockerfile L10-15             |
| **EXPOSE port**   | 3000                                                        | Dockerfile L18                |
| **CMD**           | `node dist/src/main`                                        | Dockerfile L20                |
| **Port binding**  | `app.listen(port, '0.0.0.0')` ✅                            | main.ts L33                   |
| **Public domain** | `https://core-admin-mount-production.up.railway.app`        | Live probe (401 confirmed)    |
| **Health path**   | Unknown (not set in governance docs)                        | —                             |
| **Global prefix** | `api/v1` (excludes `/api/v2/admin/*`)                       | main.ts L28-30                |
| **CORS**          | `CORS_ALLOWED_ORIGINS` env var                              | main.ts L19                   |

---

## JWKS Server

| Field           | Value                                  | Source         |
| --------------- | -------------------------------------- | -------------- |
| **Repo**        | shavi-oss/Bassan.os                    | Known          |
| **Root**        | `/backend/tools/jwks-server`           | Railway config |
| **Dockerfile**  | `backend/tools/jwks-server/Dockerfile` | Repo           |
| **Build**       | (none — runs index.js directly)        | Dockerfile L6  |
| **EXPOSE**      | 3001                                   | Dockerfile L10 |
| **CMD**         | `node index.js`                        | Dockerfile L11 |
| **Health path** | `/.well-known/jwks.json` (expected)    | Standard       |
| **Domain**      | ⚠️ UNRESOLVED (probes returned 404)    | Live probe     |
