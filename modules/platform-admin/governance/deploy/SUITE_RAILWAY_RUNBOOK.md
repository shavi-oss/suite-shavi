# SUITE RAILWAY RUNBOOK

## Human-Safe Operations Guide — platform-admin (BFF + Client)

**Created:** 2026-02-24T16:26 UTC+2  
**Audience:** Developer/Operator performing the Railway staging deployment

> [!CAUTION]
> NEVER paste secret values in Slack, chat, or terminal history. Use Railway Dashboard for all secret vars. NEVER commit `.env` files.

---

## Pre-Conditions Before Starting

- [ ] `SUITE_DEPLOY_PLAN.md` has been approved
- [ ] Code changes (T-1 CORS fix, T-2 Dockerfile) are committed and pushed
- [ ] Railway CLI installed: `npm install -g @railway/cli` or via brew/winget
- [ ] Authenticated: `railway login`
- [ ] BassanOs core API staging URL is known (needed for CORE_API_BASE_URL)
- [ ] jwks-server URL is known (needed for ADMIN_JWKS_URL)

---

## Step 1 — Create Railway Project

```bash
railway init
# Name: suite-shavi-staging
# Choose: Empty project
```

Or via Railway Dashboard → New Project → Empty Project → name it `suite-shavi-staging`.

---

## Step 2 — Add PostgreSQL Database

**Via Railway Dashboard:**

1. Inside `suite-shavi-staging` project → click **+ New**
2. Select **Database** → **PostgreSQL**
3. Name: `suite-db`
4. Railway will automatically provision `DATABASE_URL` and inject it into services in the same project.

> [!IMPORTANT]
> Do NOT copy `DATABASE_URL` into any file or paste it anywhere. It will be injected automatically via Railway service references.

---

## Step 3 — Set Required Environment Variables

Go to Railway Dashboard → `suite-shavi-staging` project → `web` service → **Variables** tab.

Set the following variables (names only — values are YOUR responsibility):

| Variable Name       | Where to Get Value    | Notes                                                                     |
| ------------------- | --------------------- | ------------------------------------------------------------------------- |
| `CORE_API_BASE_URL` | BassanOs staging URL  | e.g. `https://core-api.up.railway.app` — NO trailing slash                |
| `ADMIN_JWKS_URL`    | jwks-server URL       | `https://jwks-server-production.up.railway.app/.well-known/jwks.json`     |
| `CORS_ORIGIN`       | Your suite client URL | e.g. `https://suite-client.up.railway.app` — or `*` for open staging only |
| `NODE_ENV`          | Literal string        | `production`                                                              |

`DATABASE_URL` is set automatically by Railway Postgres plugin — do not set manually.

`PORT` is set automatically by Railway — do not set manually.

---

## Step 4 — Deploy BFF Service

```bash
# From suite-shavi repo root
railway up --service web
```

or link via GitHub integration in Railway → point to `suite-shavi` repo → set root directory if needed.

**Verify build logs in Railway Dashboard:**

- Look for: `Prisma migrate deploy` exit 0
- Look for: `Platform Admin Host listening on http://localhost:<PORT>`
- Look for: `[PlatformAdminHost] Loaded 1 key(s)...` (if JWKS validation at startup)

---

## Step 5 — Run Migrations (if not in Dockerfile ENTRYPOINT)

If entrypoint doesn't auto-run migrations:

```bash
railway run --service web -- npx prisma migrate deploy --schema=modules/platform-admin/prisma/schema.prisma
```

---

## Step 6 — Deploy Client (Vite)

The Vite client is a static build. Options:

**Option A (same Railway service — BFF serves static files):**

- Add static file serving to BFF `main.ts` (future gate, out of scope now)

**Option B (separate Railway service):**

- Create a new Railway service → Static Site
- Build command: `cd modules/platform-admin/client && npm ci && npm run build`
- Publish directory: `dist/platform-admin/client`
- Set: `VITE_API_URL=https://<your-bff-railway-url>` (must be set BEFORE build)

**Option C (Railway nixpacks, if configured):**

```bash
railway up --service client
```

> [!IMPORTANT]
> `VITE_API_URL` must be set in the environment **before the build runs**. It is baked into the JS bundle. Changing it after build has no effect — you must rebuild.

---

## Step 7 — Smoke Tests (Post-Deploy)

Run from your local terminal. No secrets will be printed.

```bash
BFF_URL=https://<your-bff-railway-url>

# Health check (expect 200)
curl -s -o /dev/null -w "Health: %{http_code}\n" $BFF_URL/api/platform-admin/health

# Session check without cookie (expect 401)
curl -s -o /dev/null -w "Session (no cookie): %{http_code}\n" $BFF_URL/api/platform-admin/auth/session

# Protected endpoint without session (expect 401/403 via DenyAllGuard)
curl -s -o /dev/null -w "Orgs (no session): %{http_code}\n" $BFF_URL/api/platform-admin/organizations

# Login (stub — any credentials accepted in current version)
curl -s -o /dev/null -w "Login: %{http_code}\n" \
  -X POST $BFF_URL/api/platform-admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"any"}'
```

**Expected results:**

| Test                       | Expected | Fail Condition                         |
| -------------------------- | -------- | -------------------------------------- |
| Health                     | 200      | Any non-200                            |
| Session (no cookie)        | 401      | **200 = FAIL-OPEN — STOP IMMEDIATELY** |
| Organizations (no session) | 401/403  | **200 = FAIL-OPEN — STOP IMMEDIATELY** |
| Login                      | 200      | Any 5xx                                |

---

## Step 8 — Verify Logs (no secret leakage)

In Railway Dashboard → `web` service → Logs:

- ✅ Confirm: correlation IDs appear in request logs
- ✅ Confirm: no JWT strings in logs (BearerToken, eyJ... patterns)
- ✅ Confirm: no DATABASE_URL or connection string in logs
- ✅ Confirm: `DenyAllGuard` blocking unauthenticated requests

---

## Known Limitations (Staging Only)

| Limitation           | Impact                             | Future Fix                      |
| -------------------- | ---------------------------------- | ------------------------------- |
| Auth is a stub       | Anyone can log in                  | Proper auth gate (future)       |
| Session is in-memory | Lost on restart; no multi-instance | Replace with DB-backed sessions |
| Session persistence  | Not horizontally scalable          | Redis-backed sessions (future)  |
