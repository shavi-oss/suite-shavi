# 06 — DOCKER RUNTIME FINAL

## Suite — Definitive Dockerfile Analysis

### Current Dockerfile (Current Truth)

```dockerfile
FROM node:20-alpine AS base

RUN apk add --no-cache openssl bash

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

COPY . .

RUN npx prisma generate --schema=modules/platform-admin/prisma/schema.prisma

RUN npx tsc -p modules/platform-admin/tsconfig.bff.json

EXPOSE 4000

CMD ["sh", "-c", "npx prisma migrate deploy --schema=modules/platform-admin/prisma/schema.prisma && node dist/modules/platform-admin/host/main.js"]
```

### Gaps in Current Dockerfile

| Gap                             | Description                                                                       | Impact                                              |
| ------------------------------- | --------------------------------------------------------------------------------- | --------------------------------------------------- |
| **Missing Vite build**          | No `vite build` step. `dist/platform-admin/client/` will NOT exist.               | SPA will fail to render in fresh Docker build       |
| **PORT vs EXPOSE mismatch**     | `EXPOSE 4000` is static. Railway injects `$PORT` dynamically — could be any port. | Potential routing issue if Railway assigns non-4000 |
| **`main.ts` missing `0.0.0.0`** | `app.listen(port)` not `app.listen(port, '0.0.0.0')`                              | Latent portability risk                             |

### Required Dockerfile (Fixed)

```dockerfile
FROM node:20-alpine AS base

RUN apk add --no-cache openssl bash

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

COPY . .

RUN npx prisma generate --schema=modules/platform-admin/prisma/schema.prisma

# BFF TypeScript compile
RUN npx tsc -p modules/platform-admin/tsconfig.bff.json

# React SPA client build (Vite)
# outDir: dist/platform-admin/client (per vite.config.ts)
RUN npx vite build --config modules/platform-admin/client/vite.config.ts

EXPOSE 4000

CMD ["sh", "-c", "npx prisma migrate deploy --schema=modules/platform-admin/prisma/schema.prisma && node dist/modules/platform-admin/host/main.js"]
```

### Required main.ts Change

```diff
-  await app.listen(port);
+  await app.listen(port, '0.0.0.0');
```

### dist/ Structure Expected After Fix

```
dist/
├── modules/
│   └── platform-admin/
│       ├── host/
│       │   ├── main.js        ← BFF entrypoint (compiled by tsconfig.bff.json)
│       │   └── app.module.js
│       ├── src/               ← all BFF controllers, services, guards
│       └── platform-admin.module.js
└── platform-admin/
    └── client/
        ├── index.html         ← React SPA (compiled by Vite)
        └── assets/
            └── index-*.js
```

### Path Resolution Verification

```
Runtime __dirname = /app/dist/modules/platform-admin/host
clientPath = join(__dirname, '..', '..', '..', '..', 'dist', 'platform-admin', 'client')
         = /app/dist/modules/platform-admin/host/../../../../dist/platform-admin/client
         = /app/dist/platform-admin/client  ✅
```

## Core API — Docker Runtime

```dockerfile
FROM node:18-alpine
WORKDIR /app
RUN apk add --no-cache openssl openssl-dev libc6-compat
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build          # nest build → dist/src/main.js
EXPOSE 3000
CMD ["node", "dist/src/main"]
```

**Port binding**: `app.listen(port, '0.0.0.0')` ✅ (main.ts L33)
**Status**: Correct. No changes needed.

## JWKS Server — Docker Runtime

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json ./
COPY index.js ./
EXPOSE 3001
CMD ["node", "index.js"]
```

**Missing**: `npm install` step (no RUN npm install!). This means dependencies are NOT installed. However, if `index.js` has no `require()` dependencies (pure Node.js), this is fine.
**Action**: Verify `index.js` has no `require()` calls that need node_modules. If it does → add `RUN npm install --production`.
