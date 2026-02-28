# 05 — WIRING CHECK (Env Var Names — No Values)

**Date:** 2026-02-28T07:40Z | **Source:** `railway variables` CLI output

---

## Suite Service Env Vars

| Variable               | Status     | Notes                                                      |
| ---------------------- | ---------- | ---------------------------------------------------------- |
| `CORE_API_BASE_URL`    | ✅ PRESENT | Required by CoreClient                                     |
| `CORS_ORIGIN`          | ✅ PRESENT | Read by main.ts CORS config                                |
| `CORS_ALLOWED_ORIGINS` | ❌ ABSENT  | main.ts reads both (CORS_ALLOWED_ORIGINS \|\| CORS_ORIGIN) |
| `DATABASE_URL`         | ✅ PRESENT | Required by Prisma                                         |
| `ADMIN_JWKS_URL`       | ✅ PRESENT | Present (not used by Suite directly)                       |
| `NODE_ENV`             | ✅ PRESENT | Set to production                                          |
| `PORT`                 | ❌ ABSENT  | Railway-injected at runtime — expected                     |

**All 3 required Suite wiring vars present.** ✅

---

## Core Service Env Vars (From User-Provided Railway Data)

| Variable              | Status     | Notes                                                                                              |
| --------------------- | ---------- | -------------------------------------------------------------------------------------------------- |
| `ADMIN_JWKS_URL`      | ✅ PRESENT | `https://jwks-server-production.up.railway.app/.well-known/jwks.json` (confirmed domain reachable) |
| `CORE_API_BASE_URL`   | ✅ PRESENT | Self-referential — used for org validation flow                                                    |
| `DATABASE_PUBLIC_URL` | ✅ PRESENT | Postgres connection                                                                                |

Note: `CORS_ALLOWED_ORIGINS` for Core — not directly confirmed via CLI, but CORS is env-var driven in `main.ts`.

---

## JWKS Wiring Chain

```
Suite → [CORE_API_BASE_URL] → Core
Core → [ADMIN_JWKS_URL] → jwks-server-production.up.railway.app ✅
JWKS → 200 JSON {"keys":[{"alg":"RS256","kid":"admin-key-2","kty":"RSA"}]} ✅
```
