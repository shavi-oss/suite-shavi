# 00 — EXECUTIVE SUMMARY

**Date:** 2026-02-28 **Audit Mode:** Docker-Truth · Fail-Closed · Evidence-Only

## What Is True Today

| System                          | Is It Running? | Evidence                                                    |
| ------------------------------- | -------------- | ----------------------------------------------------------- |
| **Suite BFF (web)**             | ✅ Running     | `GET /` → 200 HTML, `<title>Platform Admin Console</title>` |
| **Core API (core-admin-mount)** | ✅ Running     | `GET /api/v1/auth/me` → 401 JSON (guard active)             |
| **JWKS Server**                 | ⚠️ Unknown     | Multiple domain attempts returned 404                       |

## What Is Broken

| #   | Issue                                                                                                                                                                                                            | Severity             |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| 1   | **Suite: Old `dist/main.js` running** — All `GET /api/*` routes return SPA HTML because the compiled `dist/modules/platform-admin/host/main.js` is the pre-PR-1 version without the express.static `/api` guard. | **CRITICAL BLOCKER** |
| 2   | **railway.json sets `builder: NIXPACKS`** but a `Dockerfile` exists in the repo. Railway Dashboard auto-detected and used Docker (correct), making `railway.json` misleading/inconsistent.                       | HIGH                 |
| 3   | **Suite `main.ts` binds without `0.0.0.0`**: `app.listen(port)` should be `app.listen(port, '0.0.0.0')` for Railway container compatibility.                                                                     | HIGH                 |
| 4   | **Suite `EXPOSE 4000`** in Dockerfile, but `railway.json` start command runs a server binding to `process.env.PORT`. Railway injects a different $PORT. These must match.                                        | MEDIUM               |
| 5   | **JWKS domain unresolved** — The JWKS server domain used in `ADMIN_JWKS_URL` could not be verified responsive via probe.                                                                                         | MEDIUM               |
| 6   | **Client React SPA not built in Dockerfile** — `tsconfig.bff.json` only compiles BFF. Vite client build (`npm run build:client`) is NOT in the Dockerfile CMD.                                                   | MEDIUM               |

## Fix Plan (Minimal Diff)

1. Fix `main.ts` PORT bind: Add `'0.0.0.0'` as second arg to `app.listen()`.
2. Fix `Dockerfile` CMD: Add `npm run build:client` (or Vite build) before the prisma/node steps — OR document that client is pre-served from a separate static host.
3. Fix `railway.json`: Remove `builder: NIXPACKS` or change to `builder: DOCKERFILE`.
4. Verify JWKS domain is alive and `ADMIN_JWKS_URL` env var is correct.
5. Force Railway to rebuild from source (push commit with correct `Dockerfile`).

## Final Verdict

**STOP — 2 Critical Issues Must Be Fixed Before Approval.**
