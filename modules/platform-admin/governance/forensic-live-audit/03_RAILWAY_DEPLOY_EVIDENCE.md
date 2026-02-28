# 03 — RAILWAY DEPLOY EVIDENCE

**Date:** 2026-02-28T22:32Z

---

## Service Identity

```
Project:  d107e5cc-24d2-4a4c-98cc-cb672570e8a4 (suite-shavi-staging)
Service:  web
Domain:   web-production-6f02f6.up.railway.app
Region:   us-west1
Builder:  DOCKERFILE (detected)
```

---

## Deploy Confirmation

### ETag Comparison

| Binary                          | ETag                                 | Significance                      |
| ------------------------------- | ------------------------------------ | --------------------------------- |
| Old (pre-fix) Nixpacks binary   | `"dgpxmdj4av4099"`                   | All past failed probes            |
| **New (dc48127) Docker binary** | `W/"29-zmRbQiQJP94KG54GtGDpWj1h6So"` | ✅ Different — new image deployed |

The ETag `W/"29-..."` is a weak ETag from NestJS/Express (Content-Length: 41 = `{"status":"ok","module":"platform-admin"}`). This is dynamic JSON — not a static file. Confirmed new runtime.

### `/` ETag

```
ETag: W/"14d-19ca5de47f0"
Content-Type: text/html; charset=utf-8
```

This is the Vite-built `index.html` (333 bytes → `14d` hex = 333). Confirms Vite build step produced correct output.

---

## Runtime Startup Log (from `railway logs`)

Timestamp: **2026-02-28T20:09:55Z** (container started ~2 minutes after dc48127 push)

```
[Nest] 1 - 02/28/2026, 8:09:55 PM LOG [RouterExplorer] Mapped {/api/platform-admin/organizations, GET}
[Nest] 1 - 02/28/2026, 8:09:55 PM LOG [RouterExplorer] Mapped {/api/platform-admin/organizations/:id, GET}
[Nest] 1 - 02/28/2026, 8:09:55 PM LOG [RouterExplorer] Mapped {/api/platform-admin/org-mappings/:suiteOrgId, GET}
[Nest] 1 - 02/28/2026, 8:09:55 PM LOG [RouterExplorer] Mapped {/api/platform-admin/internal-users/:id/deactivate, PATCH}
[Nest] 1 - 02/28/2026, 8:09:55 PM LOG [RoutesResolver]  OrgMappingController {/api/platform-admin/org-mappings}:
[Nest] 1 - 02/28/2026, 8:09:55 PM LOG [RouterExplorer] Mapped {/api/platform-admin/org-mappings, POST}
[Nest] 1 - 02/28/2026, 8:09:55 PM LOG [PlatformAdminHost] Platform Admin Host listening on http://localhost:8080
[Nest] 1 - 02/28/2026, 8:09:55 PM LOG [RouterExplorer] Mapped {/api/platform-admin/organizations/:id/unsuspend, PATCH}
[Nest] 1 - 02/28/2026, 8:09:55 PM LOG [RouterExplorer] Mapped {/api/platform-admin/organizations/:id, DELETE}
[Nest] 1 - 02/28/2026, 8:09:55 PM LOG [RoutesResolver]  AuditController {/api/platform-admin/audit-logs}:
[Nest] 1 - 02/28/2026, 8:09:55 PM LOG [RouterExplorer] Mapped {/api/platform-admin/audit-logs, GET}
[Nest] 1 - 02/28/2026, 8:09:55 PM LOG [RoutesResolver]  AuthController {/api/platform-admin/auth}:
[Nest] 1 - 02/28/2026, 8:09:55 PM LOG [RouterExplorer] Mapped {/api/platform-admin/auth/login, POST}
[Nest] 1 - 02/28/2026, 8:09:55 PM LOG [RouterExplorer] Mapped {/api/platform-admin/auth/logout, POST}
[Nest] 1 - 02/28/2026, 8:09:55 PM LOG [RouterExplorer] Mapped {/api/platform-admin/auth/session, GET}
[Nest] 1 - 02/28/2026, 8:09:55 PM LOG [NestApplication] Nest application successfully started +95ms
Starting Container
```

**Key evidence:**

- PID 1 confirmed (Docker container process)
- Listening on `http://localhost:8080` (Railway injects PORT=8080)
- Route map shows `api/platform-admin/...` prefix correctly (no double `/api/api/`)
- `Nest application successfully started` — no crash
- No Prisma `$connect` error in this log — database was reachable at startup

---

## Response Headers (Suite — 2026-02-28T20:33Z)

### GET /api/platform-admin/health

```
HTTP/1.1 200 OK
Content-Length: 41
Content-Type: application/json; charset=utf-8
ETag: W/"29-zmRbQiQJP94KG54GtGDpWj1h6So"
X-Powered-By: Express
Access-Control-Allow-Credentials: true
Vary: Origin
Server: railway-edge
```

### GET /

```
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
ETag: W/"14d-19ca5de47f0"
```
