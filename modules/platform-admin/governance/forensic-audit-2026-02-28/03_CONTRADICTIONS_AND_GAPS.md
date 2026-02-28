# 03 — CONTRADICTIONS AND GAPS

## C1 — `railway.json` NIXPACKS vs Dockerfile

| Field         | railway.json           | Dockerfile                | Reality                                                    |
| ------------- | ---------------------- | ------------------------- | ---------------------------------------------------------- |
| Builder       | `NIXPACKS`             | EXISTS (root)             | Railway Dashboard uses **Docker** (overrides railway.json) |
| Start command | custom `node dist/...` | `CMD [...]` in Dockerfile | **Conflict**: which one runs?                              |

**Contradiction:** `railway.json` sets `builder: NIXPACKS` which would IGNORE the Dockerfile. But Railway auto-detects a Dockerfile and the dashboard may show "Using Detected Dockerfile." One of these is overriding the other — and the current behavior in Railway is undefined without checking the dashboard. Evidence: previous sessions mention Railway said "Using Detected Dockerfile."

**Resolution required:** Set `railway.json` `builder: DOCKERFILE` to be explicit.

---

## C2 — Suite PORT binding without `0.0.0.0`

```ts
// main.ts L50 — CURRENT (BROKEN)
await app.listen(port);

// REQUIRED for Railway containers
await app.listen(port, "0.0.0.0");
```

Without `0.0.0.0`, NestJS/Express defaults to `127.0.0.1` in some Node versions. In Railway's containerized environment, this means the server is unreachable from outside the container. However, `@nestjs/platform-express` may default to `0.0.0.0`. **Evidence inconclusive — service is reachable,** but this is a latent risk that must be fixed for portability.

---

## C3 — Client SPA NOT built in Dockerfile

```dockerfile
# Dockerfile L30 — compiles BFF only
RUN npx tsc -p modules/platform-admin/tsconfig.bff.json
# MISSING: RUN npm run build:client (vite build)
```

The `vite.config.ts` sets `outDir: '../../../dist/platform-admin/client'`. The `main.ts` static middleware references `dist/platform-admin/client`. But the Dockerfile does NOT run `vite build`. Therefore, in a fresh Docker deployment, the `dist/platform-admin/client/index.html` does NOT exist — the SPA middleware will serve empty.

**Gap**: The SPA is only present in the current Railway deployment because a previous Nixpacks/pre-Docker build artifact was cached. Any fresh Docker build will break the SPA.

---

## C4 — Old `dist/main.js` deployed (Critical)

**Evidence**: Railway logs show `Last-Modified: Fri, 27 Feb 2026 17:48:54 GMT` and `Etag: dgpxmdj4av4099` for ALL `/api/*` GET responses. This timestamp corresponds to the ORIGINAL client build, NOT the PR-1 express.static middleware fix commit.

**The fix commits (56c8b1c, 74f3a81, d81e7b7) compiled new TypeScript in local `dist/` but `dist/` is gitignored**. Railway Docker builds from source — the Dockerfile runs `npx tsc -p tsconfig.bff.json` during build. So the compiled output should be fresh. However, the live behavior shows pre-fix code running.

**Likely cause:** Railway is still using a cached Docker layer from before the `railway.json` `buildCommand` was added. The dashboard may still be running the Nixpacks-built version.

---

## C5 — JWKS Domain Unknown

The `ADMIN_JWKS_URL` env var must be set in Core to point to the live JWKS server. Multiple probe attempts to find the JWKS domain returned 404. If JWKS is unreachable, Core's `admin-jwt` Passport strategy cannot validate incoming JWTs → all admin S2S calls from Suite to Core will fail with 401.

---

## C6 — railway.json `healthcheckPath` Mismatch with Dockerfile

`railway.json` sets `healthcheckPath: /api/platform-admin/health`. But currently, `GET /api/platform-admin/health` returns `200 HTML` (SPA fallback) instead of `200 JSON`. Railway's healthcheck may pass (200 is 200), but the response type is semantically wrong.

---

## C7 — `tsconfig.bff.json` extends `../../tsconfig.json`

`tsconfig.bff.json` has `"extends": "../../tsconfig.json"`. The root `tsconfig.json` now has `exclude: [modules/platform-admin/client, node_modules, dist]`. This exclude carries through to `tsconfig.bff.json`. Verify that `tsconfig.bff.json`'s own `exclude` doesn't shadow the root's. **Currently safe** — both exclude `client/**/*`.
