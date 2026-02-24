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
# tsconfig.bff.json → outDir: dist/modules/platform-admin
RUN npx tsc -p modules/platform-admin/tsconfig.bff.json

# ── Runtime stage ────────────────────────────────────────────────────────────
# Same image (no separate runtime stage to keep size manageable)
# All env vars injected at runtime — never baked in

EXPOSE 4000

# Entrypoint:
#  1) prisma migrate deploy (idempotent — safe to run on every start)
#  2) Start BFF
CMD ["sh", "-c", "npx prisma migrate deploy --schema=modules/platform-admin/prisma/schema.prisma && node dist/modules/platform-admin/host/main.js"]
