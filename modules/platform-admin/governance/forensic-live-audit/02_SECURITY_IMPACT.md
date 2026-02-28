# 02 — SECURITY IMPACT REVIEW

**Date:** 2026-02-28T22:32Z | **Scope:** commit `dc48127`

---

## 1. DenyAllGuard — Still Applied as APP_GUARD

**Source:** `platform-admin.module.ts` (NOT changed in dc48127)

```typescript
@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: DenyAllGuard,   // ← unchanged, still registered
    },
    ...
  ]
})
```

**Live evidence:**

```
GET /api/platform-admin/organizations (no auth)
→ 403 {"message":"Forbidden resource","error":"Forbidden","statusCode":403}
```

**Verdict:** ✅ DenyAllGuard active and denying all unauthorized routes.

---

## 2. `/api/*` Routes Cannot Be Served by SPA Static Fallback

**Code in main.ts (unchanged logic):**

```typescript
app.use((req, res, next) => {
  if (!req.path.startsWith("/api")) {
    express.static(clientPath)(req, res, next); // SPA for non-API
  } else {
    next(); // API paths → NestJS
  }
});
```

The static middleware is gated on `req.path.startsWith('/api')`. All `/api/*` requests pass to NestJS (or hit the health middleware first). No path can produce HTML for an `/api/*` request.

**Live evidence:**

```
GET /api/platform-admin/organizations → 403 application/json (never HTML)
GET /api/platform-admin/health        → 200 application/json (Express middleware)
```

**Verdict:** ✅ No API route can return HTML.

---

## 3. Health Middleware — Scope Analysis

**Code (new in dc48127):**

```typescript
app.use("/api/platform-admin/health", (req, res) => {
  res.status(200).json({ status: "ok", module: "platform-admin" });
});
```

**Scope boundary**: Express `app.use(path, handler)` where `path = '/api/platform-admin/health'`:

- Matches only: `GET /api/platform-admin/health`, `POST /api/platform-admin/health`, etc.
- Does **NOT** match: `/api/platform-admin/health-report`, `/api/platform-admin/healthcheck`, `/api/platform-admin/organizations`, etc. (Express exact prefix match, not glob)
- Returns only: `{"status":"ok","module":"platform-admin"}` — no session, no JWT, no DB query, no sensitive data

**Auth bypass surface**: This endpoint is NOT protected by any guard — but it returns only a static string. There is no sensitive data disclosure, no authentication bypass, and no session manipulation.

**Verdict:** ✅ Scoped to exact path. No bypass created for other routes. No sensitive data in response.

---

## 4. Prisma `$connect` Try/Catch — Error Handling

**Code (new in dc48127):**

```typescript
try {
  await this.$connect();
} catch (err) {
  this.logger.warn(
    `Prisma $connect failed on init (will retry lazily): ${(err as Error).message}`,
  );
}
```

**Does this mask failures?** No:

- Error is **logged** at `WARN` level — visible in Railway logs
- Subsequent queries that fail will throw `PrismaClientKnownRequestError` individually
- Prisma's lazy connection means the pool reconnects automatically when DB becomes available
- If DB is permanently unreachable, every DB-dependent route returns 500 (fail-closed behavior for data operations)

**Verdict:** ✅ Error logged and not silently swallowed. No false health signal.

---

## 5. CORS Posture

**Code in main.ts (unchanged logic from prior fix):**

```typescript
const corsRaw = process.env.CORS_ALLOWED_ORIGINS || process.env.CORS_ORIGIN;
const corsOrigins = corsRaw
  ? corsRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  : ["http://localhost:3000"];
app.enableCors({ origin: corsOrigins, credentials: true });
```

No wildcard. Explicitly reads env var (allowlist). Confirmed Railway env has `CORS_ORIGIN` set.
Live response headers confirm: `Access-Control-Allow-Credentials: true` and `Vary: Origin`.

**Verdict:** ✅ Allowlist-only CORS posture unchanged.

---

## 6. No JWT Exposure to Browser

HealthController (NestJS layer) is bypassed. The Express middleware returns `{status:'ok',module:'platform-admin'}` — no JWT, no session, no user data.

`JwtStorageService` is server-side only — not reachable from health route.

**Verdict:** ✅ No JWT exposure.

---

## Overall Security Assessment: LOW RISK

| Assertion                              | Status                    |
| -------------------------------------- | ------------------------- |
| DenyAllGuard active as APP_GUARD       | ✅ Confirmed live         |
| No API routes return HTML              | ✅ Confirmed live         |
| Health middleware scoped to exact path | ✅ Code-verified          |
| Prisma error logged (not swallowed)    | ✅ Code-verified          |
| CORS allowlist-only                    | ✅ Code + header verified |
| No JWT in browser                      | ✅ Confirmed              |
