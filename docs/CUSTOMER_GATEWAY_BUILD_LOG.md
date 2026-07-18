# Build Log — Customer Gateway (Bassan Suite)

| Attribute | Value |
| --------- | ----- |
| Date | 2026-07-18 |
| Author | Hermes Agent (Shavi autonomous engineer) |
| Layer | Bassan Suite (البانل) |
| Trigger | Governance decision: prepare `/api/customer/*` gateway BEFORE building Bassan Workspace (وجهة العميل) |
| Auth model | **Kernel-brokered** (approved by Governance Authority) |
| Contract | Implements `INTEGRATION_CONTRACT_WORKSPACE.md` (Contract B, v1 APPROVED) |
| Build status | Code + docs complete; unit/security tests written; manual `prisma migrate` pending operator approval |

## What was built
A new `CustomerModule` inside the Bassan Suite that owns the Bassan Workspace ↔ Suite boundary:

1. **Session auth (HS256, Suite-issued)** — `customer-session.service.ts` + `customer-jwt.util.ts`.
   Login is brokered to Core `POST /api/v1/auth/login`; the Core user-scoped token is stored
   server-side (keyed by `jti`) and NEVER exposed. Suite issues its own Session JWT.
2. **Session guard** — `customer-session.guard.ts` verifies the Session JWT and resolves the tenant
   (`organizationId`) from the JWT **claim ONLY** (fail-closed; no client header trust).
3. **Endpoints** — `auth/session|refresh|logout`, `me`, `crm/contacts` (GET/POST).
4. **Kernel broker** — `customer-kernel-broker.service.ts`, the ONLY component calling Core on the
   Workspace's behalf, with runtime endpoint assertions + safe (token-free) logging.
5. **CRM storage** — a **SEPARATE** Prisma schema (`customer_contacts`) so the scope-locked
   platform-admin schema (MODULE_SCOPE_LOCK.md) is not violated.

## Why these decisions
- **Kernel-brokered auth**: Core owns user auth (Contract A §6.2). Re-using Core login avoids
  duplicating credential storage in the Suite.
- **Separate Prisma schema**: the platform-admin schema is hard-locked to 4 tables. CRM is Suite-owned
  but must live elsewhere to respect the lock.
- **Server-side Core token store**: Contract B §5.2 forbids the Kernel token from reaching the Workspace;
  keeping it server-side (keyed by session `jti`) satisfies this and makes logout effective.

## Files added (Suite layer)
- `modules/platform-admin/src/customer/**` (module, auth, me, crm, kernel broker, prisma)
- `modules/platform-admin/platform-admin.module.ts` (registered `CustomerModule`)
- `modules/platform-admin/src/customer/README.md` (this module's docs)

## Files added (Kernel layer — documentation only, NO code change)
- `Bassan.os/backend/docs/customer-auth-contract.md` — documents the Core login endpoint consumed.

## Files added (Workspace layer — contract consumer doc; repo not yet built)
- `docs/workspace-consumer/README.md` — the contract the future Workspace consumes.

## Pending operator actions (require approval — NOT executed by agent)
1. Set `CUSTOMER_SESSION_SECRET` in Coolify (Suite app).
2. Run `npx prisma migrate deploy --schema=modules/platform-admin/src/customer/prisma/schema.prisma`
   to create `customer_contacts`.
3. Commit + (on approval) push the changes.

## Verification done
- Code follows existing Suite patterns (DenyAllGuard opt-in, CoreClient safe-logging, Prisma service).
- Unit + security tests written under `tests/unit/customer` and `tests/security/customer`.
- `npm run build:platform-admin` (tsc) pending Prisma client generation.
