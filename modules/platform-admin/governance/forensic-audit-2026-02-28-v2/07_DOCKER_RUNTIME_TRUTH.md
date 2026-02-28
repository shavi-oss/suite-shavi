# 07 — DOCKER RUNTIME TRUTH

---

## Suite BFF — `suite-shavi/Dockerfile`

```dockerfile
FROM node:20-alpine AS base
RUN apk add --no-cache openssl bash
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npx prisma generate --schema=modules/platform-admin/prisma/schema.prisma
RUN npx tsc -p modules/platform-admin/tsconfig.bff.json        # BFF compile
RUN npx vite build --config modules/platform-admin/client/vite.config.ts  # SPA compile (PR-2)
EXPOSE 4000
CMD ["sh", "-c", "npx prisma migrate deploy --schema=... && node dist/modules/platform-admin/host/main.js"]
```

| Aspect                 | Value                                                                                             |
| ---------------------- | ------------------------------------------------------------------------------------------------- |
| **Base image**         | `node:20-alpine`                                                                                  |
| **Build**              | `npm ci --ignore-scripts` → `prisma generate` → `npx tsc -p tsconfig.bff.json` → `npx vite build` |
| **BFF compile**        | `tsconfig.bff.json` → `outDir: "../../dist/modules/platform-admin"`                               |
| **SPA compile**        | `vite.config.ts` → `outDir: '../../../dist/platform-admin/client'`                                |
| **Runtime entrypoint** | `dist/modules/platform-admin/host/main.js`                                                        |
| **PORT**               | `process.env.PORT \|\| 4000` + `app.listen(port, '0.0.0.0')`                                      |
| **EXPOSE**             | 4000 (Railway injects actual `$PORT` dynamically — may differ)                                    |
| **Migration**          | `npx prisma migrate deploy` on every start (idempotent)                                           |

### Risks

| Risk                         | Description                                                                                                                                                                    | Severity   |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- |
| **Single-stage build**       | `node_modules`, `src`, `dist` all in one layer. Large image size. Not a security issue for dev, but not production-hardened.                                                   | LOW        |
| **EXPOSE 4000 vs $PORT**     | Railway injects a different `$PORT`. `app.listen(process.env.PORT)` picks it up correctly. `EXPOSE 4000` is informational only — does not restrict binding.                    | LOW (safe) |
| **npm ci --ignore-scripts**  | Skips lifecycle scripts. Correct for security. Vite and @vitejs/plugin-react don't require postinstall scripts.                                                                | ✅ SAFE    |
| **Vite in production image** | `vite` is a devDependency but runs during build. Only needed at build time. Since it's a single-stage build, it stays in the image. Consider multi-stage to reduce image size. | LOW        |

### dist Structure Expected

```
/app/dist/
├── modules/
│   └── platform-admin/
│       ├── host/
│       │   └── main.js          ← NestJS BFF entrypoint
│       ├── src/                 ← all controllers, services, guards
│       ├── controllers/
│       ├── guards/
│       └── platform-admin.module.js
└── platform-admin/
    └── client/
        ├── index.html           ← React SPA root
        └── assets/
            ├── index-*.js       ← Vite-bundled JS
            └── index-*.css
```

### Path Resolution from main.js

```
__dirname = /app/dist/modules/platform-admin/host
clientPath = join(__dirname, '..','..','..','..', 'dist','platform-admin','client')
           = /app/dist/modules/platform-admin/host/../../../../dist/platform-admin/client
           = /app/dist/platform-admin/client  ✅
```

---

## Core API — `backend/Dockerfile`

```dockerfile
FROM node:18-alpine
WORKDIR /app
RUN apk add --no-cache openssl openssl-dev libc6-compat
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build     # ← nest build → dist/src/main.js
EXPOSE 3000
CMD ["node", "dist/src/main"]
```

| Aspect                 | Value                                                                           |
| ---------------------- | ------------------------------------------------------------------------------- |
| **Base image**         | `node:18-alpine`                                                                |
| **Build**              | `npm ci` → `prisma generate` → `npm run build` (nest build)                     |
| **Runtime entrypoint** | `dist/src/main.js` (NestJS entry)                                               |
| **PORT**               | `parseInt(process.env.PORT \|\| '3000', 10)` + `app.listen(port, '0.0.0.0')` ✅ |
| **EXPOSE**             | 3000                                                                            |

### Risks

| Risk                           | Description                                                                                                                  | Severity                                     |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| **Node 18 vs Node 20**         | Suite uses Node 20; Core uses Node 18. Minor inconsistency. Node 18 is LTS.                                                  | LOW                                          |
| **No `--ignore-scripts`**      | `npm ci` runs lifecycle scripts. If any dependency has a malicious postinstall, it runs.                                     | LOW (audit dep list)                         |
| **No Prisma migrate on start** | Docker CMD only runs `node dist/src/main` — no migrate. Migrations must be applied separately or via Railway deploy command. | MEDIUM — first-deploy DB may not be migrated |

---

## JWKS Server — `backend/tools/jwks-server/Dockerfile`

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json ./
COPY index.js ./
EXPOSE 3001
CMD ["node", "index.js"]
```

| Aspect                 | Value                                                              |
| ---------------------- | ------------------------------------------------------------------ |
| **Base image**         | `node:18-alpine`                                                   |
| **Build**              | None (pure JS — no compile)                                        |
| **Runtime entrypoint** | `index.js`                                                         |
| **PORT**               | `process.env.PORT \|\| 3001` + `server.listen(PORT, '0.0.0.0')` ✅ |
| **EXPOSE**             | 3001                                                               |
| **Dependencies**       | NONE — only Node built-in `http` module                            |

### Risks

| Risk                         | Description                                                                                                                               | Severity              |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| **No `npm install`**         | `package.json` is COPYed but `npm install` is never run. SAFE only because `index.js` has zero npm dependencies (`require('http')` only). | LOW (currently safe)  |
| **If deps ever added**       | If a dev adds a `require('express')` or similar, the container will break immediately at runtime.                                         | LATENT                |
| **ADMIN_JWKS_B64 hard-fail** | If env var missing or malformed → `process.exit(1)`. Container will restart-loop. Detectable in Railway logs immediately.                 | ✅ GOOD (fail-closed) |
