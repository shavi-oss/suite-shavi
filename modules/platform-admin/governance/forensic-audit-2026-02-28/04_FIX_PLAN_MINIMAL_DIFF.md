# 04 — FIX PLAN (MINIMAL DIFF)

## Fix Priority Order

| #   | Fix                                         | File                | Diff Size | Stop Condition                    |
| --- | ------------------------------------------- | ------------------- | --------- | --------------------------------- |
| F1  | Fix PORT binding: add `'0.0.0.0'`           | `main.ts`           | 1 line    | STOP if any guard changes         |
| F2  | Fix Dockerfile: add Vite client build step  | `Dockerfile`        | 2-3 lines | STOP if touching any `.ts` source |
| F3  | Fix railway.json: set `builder: DOCKERFILE` | `railway.json`      | 1 line    | STOP if touching env vars         |
| F4  | Verify JWKS domain in Core                  | Manual verification | 0 lines   | STOP if key material touched      |

---

## F1 — Fix PORT Binding (`main.ts`)

```diff
-  await app.listen(port);
+  await app.listen(port, '0.0.0.0');
```

**Scope Lock**: Only `modules/platform-admin/host/main.ts` L50. No other changes.
**Stop Condition**: If change touches CORS, guards, or any middleware.

---

## F2 — Fix Dockerfile (Add Vite Client Build)

```diff
 # ── BFF TypeScript compile
 RUN npx tsc -p modules/platform-admin/tsconfig.bff.json

+# ── React SPA client build (Vite)
+# outDir: dist/platform-admin/client (per vite.config.ts)
+RUN npm run build:client || RUN npx vite build modules/platform-admin/client/vite.config.ts
```

**Prerequisite**: Verify `package.json` has a `build:client` script, or add it:

```json
"build:client": "vite build --config modules/platform-admin/client/vite.config.ts"
```

**Scope Lock**: Only `Dockerfile` and optionally `package.json` scripts section. No source changes.
**Stop Condition**: If Vite build produces errors in `--noEmit` simulation.

---

## F3 — Fix railway.json Builder

```diff
 "build": {
-   "builder": "NIXPACKS",
+   "builder": "DOCKERFILE",
    "buildCommand": "npm install && npm run build:platform-admin"
 }
```

Note: When `builder: DOCKERFILE` is set, `buildCommand` is IGNORED (Docker controls the build). Remove `buildCommand` when switching to `DOCKERFILE`.

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE"
  },
  "deploy": {
    "healthcheckPath": "/api/platform-admin/health",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

**Scope Lock**: Only `railway.json`. No source changes.
**Stop Condition**: Never.

---

## F4 — Verify JWKS Domain

Manual check required:

1. In Railway Dashboard → BassanOs project → jwks-server service → copy public domain.
2. Curl `https://<domain>/.well-known/jwks.json` → must return 200 with `{"keys": [...]}`.
3. Confirm `ADMIN_JWKS_URL` env var in Core service is set to this exact URL.

**Stop Condition**: STOP if key material appears in response (private keys must never be in JWKS response).

---

## Execution Order

```
F3 (railway.json) → commit + push
F2 (Dockerfile Vite step) → commit + push
F1 (main.ts 0.0.0.0) → commit + push
F4 (Manual JWKS verify) → Railway Dashboard
```
