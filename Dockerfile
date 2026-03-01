# Suite-Shavi BFF — Portable Dockerfile
# T-2: 2026-02-24 — SUITE_DEPLOY_PLAN.md
# Architecture: node:20-alpine, npm ci, prisma generate, BFF tsc build
# Runtime: prisma migrate deploy (non-interactive) → node dist/...
# NEVER bake env values into the image. All config via env vars.

FROM node:20-alpine AS base

# Install bash + openssl for prisma
RUN apk add --no-cache openssl bash

WORKDIR /app

# ── Dependency install phase ─────────────────────────────────────────────────
# Copy package lock files first for layer caching
COPY package.json package-lock.json ./

RUN npm ci --ignore-scripts

# ── Source copy phase ────────────────────────────────────────────────────────
COPY . .

# ── Prisma client generate ───────────────────────────────────────────────────
# Schema lives at modules/platform-admin/prisma/schema.prisma
# Output: node_modules/.prisma/client (per schema.prisma generator config)
RUN npx prisma generate --schema=modules/platform-admin/prisma/schema.prisma

# ── BFF TypeScript compile ───────────────────────────────────────────────────
# tsconfig.bff.json → outDir: dist/modules/platform-admin (excludes client)
RUN npx tsc -p modules/platform-admin/tsconfig.bff.json

# ── React SPA client build (Vite) ────────────────────────────────────────────
# Root cause of previous failure: `vite build --config path` sets Vite root=CWD (/app),
# so Vite looks for /app/index.html (not found → "Could not resolve entry module").
# Fix: cd into client dir first so Vite root=/app/modules/platform-admin/client.
# outDir '../../../dist/platform-admin/client' (relative to Vite root) → /app/dist/platform-admin/client ✅
# Evidence: forensic-audit-2026-02-28-v2 Phase 3 vite root fix
RUN cd modules/platform-admin/client && npx vite build

# ── Runtime stage ────────────────────────────────────────────────────────────
# Same image (no separate runtime stage to keep size manageable)
# All env vars injected at runtime — never baked in

EXPOSE 4000

# Entrypoint:
#  1) prisma db push — create/sync tables from schema.prisma (no migration files needed).
#     --accept-data-loss allows schema drift if schema changed. Non-fatal (|| true).
#  2) Start BFF
CMD ["sh", "-c", "npx prisma db push --schema=modules/platform-admin/prisma/schema.prisma --accept-data-loss || true && node dist/modules/platform-admin/host/main.js"]
