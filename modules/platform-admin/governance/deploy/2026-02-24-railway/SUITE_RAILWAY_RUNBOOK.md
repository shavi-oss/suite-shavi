# SUITE RAILWAY RUNBOOK

## Human-Safe Operations Guide — platform-admin (BFF + Client)

**Created:** 2026-02-24T20:06 UTC+2  
**Audience:** Developer/Operator performing the Railway staging deployment  
**BFF URL:** `https://web-production-6f02f6.up.railway.app`

> [!CAUTION]
> NEVER paste secret values in Slack, chat, or terminal history. Use Railway Dashboard for all secret vars. NEVER commit `.env` files.

---

## Project Summary

| Resource        | Value                                          |
| --------------- | ---------------------------------------------- |
| Railway Project | `suite-shavi-staging`                          |
| Project ID      | `d107e5cc-24d2-4a4c-98cc-cb672570e8a4`         |
| BFF Service     | `web`                                          |
| BFF Service ID  | `08d3b008-2784-4156-9a6d-1ae712f3d1ff`         |
| BFF Public URL  | `https://web-production-6f02f6.up.railway.app` |
| DB Service      | `Postgres`                                     |
| Environment     | `production`                                   |

---

## Environment Variables — web service

Set in Railway Dashboard → `suite-shavi-staging` → `web` → **Variables** tab.

| Variable Name       | Where to Get Value      | Notes                                                                 |
| ------------------- | ----------------------- | --------------------------------------------------------------------- |
| `DATABASE_URL`      | Railway Postgres plugin | Constructed from PG\* vars with URL-encoded password                  |
| `CORE_API_BASE_URL` | BassanOs staging URL    | BFF **throws on startup** if missing — set before deploy              |
| `ADMIN_JWKS_URL`    | jwks-server Railway URL | `https://jwks-server-production.up.railway.app/.well-known/jwks.json` |
| `CORS_ORIGIN`       | Client Railway URL      | Comma-separated; e.g. `https://suite-client.up.railway.app`           |
| `NODE_ENV`          | Literal                 | `production`                                                          |

`PORT` is set automatically by Railway — do not set manually.

> [!IMPORTANT]
> If `DATABASE_URL` contains special characters in the password (very likely), they MUST be percent-encoded. Use `[System.Uri]::EscapeDataString($password)` in PowerShell before constructing the URL string.

---

## Deployment Steps

### Step 1 — Verify prerequisites

```powershell
railway whoami          # must show your account
railway status          # must show suite-shavi-staging
git log --oneline -n 3  # confirm T-1/T-2 commits are present
```

### Step 2 — Link to web service

```powershell
railway service "web"
# Output: Linked service web
```

### Step 3 — Set environment variables

Set via Railway Dashboard → Variables tab (never via CLI for secrets).

Required variables (names only — values sourced by operator):

- `DATABASE_URL`
- `CORE_API_BASE_URL`
- `ADMIN_JWKS_URL`
- `CORS_ORIGIN`
- `NODE_ENV=production`

### Step 4 — Deploy BFF

```powershell
railway up --detach
# Wait for build (~3-5 min)
railway logs --tail 30
# Look for: "Platform Admin Host listening on http://localhost:PORT"
# Look for: "Prisma migrate deploy" completed (or skipped if already applied)
```

### Step 5 — Smoke Tests

```powershell
$BFF = "https://web-production-6f02f6.up.railway.app"

# Test 1: Health — expect 200
Invoke-WebRequest -Uri "$BFF/platform-admin/health" | Select-Object StatusCode

# Test 2: Session without cookie — expect 401
try { Invoke-WebRequest -Uri "$BFF/platform-admin/auth/session" } catch { $_.Exception.Response.StatusCode }

# Test 3: Protected endpoint without session — expect 401/403
try { Invoke-WebRequest -Uri "$BFF/platform-admin/organizations" } catch { $_.Exception.Response.StatusCode }
```

> [!WARNING]
> If ANY protected endpoint returns 200 without a valid session — **FAIL-OPEN DETECTED**. Stop immediately, roll back, investigate guard wiring.

### Step 6 — Deploy Client (Static Service)

1. Create new Railway service → Empty Service → name `client`
2. Set build variable: `VITE_API_URL=https://web-production-6f02f6.up.railway.app`
3. Build command: `npm ci --prefix modules/platform-admin/client && npm run build --prefix modules/platform-admin/client`
4. Publish directory: `dist/platform-admin/client`
5. Update BFF `CORS_ORIGIN` with the client's Railway URL

### Step 7 — Rollback Procedure

| Event                      | Action                                                                      |
| -------------------------- | --------------------------------------------------------------------------- |
| BFF startup crash          | Check Railway logs; verify all 5 env vars are set                           |
| DATABASE_URL error (P1013) | Re-encode password: `[System.Uri]::EscapeDataString($pass)` and reset       |
| DATABASE_URL empty         | Do NOT use CLI service reference `${{Postgres.DATABASE_URL}}` — set literal |
| CORE_API_BASE_URL missing  | Will throw at startup: set the correct BassanOs URL                         |
| Prisma migration fail      | Check `railway logs`; do NOT run `prisma migrate reset` in staging          |
| Fail-open detected         | IMMEDIATE revert + full stop                                                |

---

## Known Issues During This Deployment

| Issue                        | Root Cause                             | Fix Applied                               |
| ---------------------------- | -------------------------------------- | ----------------------------------------- |
| DATABASE_URL empty (P1012)   | Railway CLI service ref not resolved   | Set literal URL from PG\* vars            |
| DATABASE_URL invalid (P1013) | Special chars in password not encoded  | URL-encode password with EscapeDataString |
| `Cannot find dist/index.js`  | Railway ran `npm start` → `main` field | Added `start` script to `package.json`    |

---

## Known Limitations (Staging Only)

| Limitation           | Impact                              | Future Fix                     |
| -------------------- | ----------------------------------- | ------------------------------ |
| Auth is a stub       | Anyone can log in                   | Proper auth gate (future)      |
| Session is in-memory | Lost on restart; not multi-instance | Redis-backed sessions (future) |
| CORE_API_BASE_URL    | Must be BassanOs staging URL        | Document URL in ops runbook    |
