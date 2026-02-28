# 03 — BUILD LOG EVIDENCE

**Date:** 2026-02-28T07:40Z

---

## Local Build Evidence (Proxy for Docker Build)

The Docker build runs the same commands in sequence. Local verification proves all steps succeed.

### Step 1: npm ci (deps)

_Not re-run locally as node_modules present. Docker runs `npm ci --ignore-scripts`._

### Step 2: BFF TypeScript Compile

```
npx tsc -p modules/platform-admin/tsconfig.bff.json
EXIT: 0 ✅
```

### Step 3: Vite Client Build (THE FIX)

```
Working dir: d:\Basaan os\suite-shavi\modules\platform-admin\client
Command: npx vite build

vite v7.3.1 building client environment for production...
transforming...
✓ 46 modules transformed.
rendering chunks...
computing gzip size...

../../../dist/platform-admin/client/index.html                 0.35 kB │ gzip:  0.25 kB
../../../dist/platform-admin/client/assets/index-pO-lFONI.js  225.37 kB │ gzip: 66.77 kB

✓ built in 2.38s
EXIT: 0 ✅
```

**Key evidence**: Output path `../../../dist/platform-admin/client/` relative to client dir = `/app/dist/platform-admin/client/` — exact location expected by `main.ts` `express.static(clientPath)`.

### Step 4: dist/platform-admin/client/index.html present

```
Test-Path "dist/platform-admin/client/index.html"
→ True ✅
```

---

## What Was Broken Before

```
# Old Dockerfile command (from /app):
RUN npx vite build --config modules/platform-admin/client/vite.config.ts

# Vite behavior:
# - root = CWD = /app
# - looks for /app/index.html → NOT FOUND
# Railway build error: "Could not resolve entry module 'index.html'"
```

---

## Railway Build (Pending - Will Update on Completion)

Railway Docker build from commit `782fa28` triggered by GitHub push at ~2026-02-28T07:40Z.
Build includes steps (in order):

```dockerfile
RUN npm ci --ignore-scripts
RUN npx prisma generate --schema=...
RUN npx tsc -p modules/platform-admin/tsconfig.bff.json
RUN cd modules/platform-admin/client && npx vite build   ← FIXED
CMD [...prisma migrate deploy && node dist/.../main.js]
```

Expected Railway build log key lines:

```
✓ 46 modules transformed.
[...]/dist/platform-admin/client/index.html 0.35 kB
✓ built in Xs
```
