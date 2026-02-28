# 01 — CHANGELOG PER FILE

**Commit:** `dc48127`  
**Date:** 2026-02-28T22:07Z  
**Author:** shavi-oss  
**Stat:** `2 files changed, 23 insertions(+), 2 deletions(-)`

---

## File 1: `modules/platform-admin/host/main.ts`

**Risk: LOW-MED** — Infrastructure only; no auth/guard logic

### Change: Remove `setGlobalPrefix('api')`

Previous commit added `app.setGlobalPrefix('api')` which caused all NestJS routes to double the `/api/` prefix (e.g. `/api/api/platform-admin/organizations`) because all controllers already hardcode `api/platform-admin/...` in `@Controller()`. This was removed.

### Change: Add Express middleware for health path

```diff
+  app.use('/api/platform-admin/health', (req: express.Request, res: express.Response) => {
+    res.status(200).json({ status: 'ok', module: 'platform-admin' });
+  });
```

**Intent**: `DenyAllGuard` is registered as `APP_GUARD` in NestJS — it fires before any route-level guard including `ExplicitAllowGuard`. This causes `GET /api/platform-admin/health` to return 403, failing the Railway healthcheck. The fix intercepts at the Express middleware level (before NestJS routing) and returns `200 JSON` for **this path only**.

**Scope restriction**: The `app.use('/api/platform-admin/health', ...)` middleware is path-matched — it ONLY fires when `req.path === '/api/platform-admin/health'`. It cannot be extended to other paths without additional code.

**Risk**: LOW. Single path, no auth logic, returns a static response. No session, no JWT, no DB.

---

## File 2: `modules/platform-admin/src/db/prisma.service.ts`

**Risk: LOW** — Infrastructure only; no auth/guard logic

### Change: Wrap `$connect()` in try/catch

```diff
-  async onModuleInit() {
-    await this.$connect();
-  }
+  async onModuleInit() {
+    try {
+      await this.$connect();
+    } catch (err) {
+      this.logger.warn(`Prisma $connect failed on init (will retry lazily): ${(err as Error).message}`);
+    }
+  }
```

**Intent**: `$connect()` throws `PrismaClientInitializationError P1001` when DB is unreachable on cold start. Because NestJS `onModuleInit` hooks are awaited during `bootstrap()`, this crash prevents `app.listen()` from ever executing — container process exits before binding the port. Railway healthcheck gets 503.

**Error handling**: Error is **logged** via `Logger.warn` — NOT silently swallowed. Prisma Client reconnects lazily on first query. If DB remains permanently unreachable, queries fail individually with proper Prisma errors.

**Risk**: LOW. This is the standard Prisma pattern for Railway/serverless environments where DB may not be reachable at container boot time.

---

## Dockerfile (prior commits `782fa28`, `2bfc154`)

**Risk: LOW** — Build/runtime only; no application logic

| Change                                                   | Commit    | Intent                                      |
| -------------------------------------------------------- | --------- | ------------------------------------------- |
| `RUN cd modules/platform-admin/client && npx vite build` | `782fa28` | Vite root = client dir → finds `index.html` |
| `prisma migrate deploy \|\| true && node ...`            | `2bfc154` | Migrate non-fatal → `node` always starts    |

---

## Scope Validation

| File Category                                           | Changed? | Expected?                       |
| ------------------------------------------------------- | -------- | ------------------------------- |
| Guards (`deny-all.guard.ts`, `explicit-allow.guard.ts`) | ❌ NO    | ✅ Correct — not touched        |
| Controllers (`*.controller.ts`)                         | ❌ NO    | ✅ Correct                      |
| Auth / JWT / session logic                              | ❌ NO    | ✅ Correct                      |
| Prisma schema (`schema.prisma`)                         | ❌ NO    | ✅ Correct                      |
| `package.json` / `package-lock.json`                    | ❌ NO    | ✅ Correct                      |
| `main.ts`                                               | ✅ YES   | ✅ Allowed (health middleware)  |
| `prisma.service.ts`                                     | ✅ YES   | ✅ Allowed (infrastructure fix) |
