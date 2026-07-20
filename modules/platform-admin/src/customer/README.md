# Customer Gateway Module — Bassan Suite (البانل)

> Layer: **Bassan Suite** (control plane / gateway). Implements the **Bassan Workspace ↔ Bassan Suite** boundary defined in `INTEGRATION_CONTRACT_WORKSPACE.md` (Contract B, v1 APPROVED, 2026-07-18).

## Purpose
Owns `/api/customer/v1/*` — the ONLY surface the Bassan Workspace (customer UI) is allowed to call (Contract B §3.1). The Workspace MUST NOT call Bassan Kernel directly; all Kernel access is brokered here.

## Files
```
src/customer/
├── customer.module.ts                 # NestJS module (registered in platform-admin.module.ts)
├── auth/
│   ├── customer-jwt.util.ts           # HS256 sign/verify/decode (Suite Session JWT)
│   ├── customer-session.service.ts    # issue / rotate / invalidate Session JWT + server-side Core token store
│   ├── customer-session.guard.ts      # verifies Session JWT, resolves tenant from claim ONLY
│   ├── customer-auth.controller.ts    # POST /api/customer/v1/auth/{session,refresh,logout}
│   └── dto/{login,session-response}.dto.ts
├── me/
│   └── customer-me.controller.ts      # GET /api/customer/v1/me
├── crm/
│   ├── customer-crm.controller.ts     # GET/POST /api/customer/v1/crm/contacts
│   ├── customer-crm.service.ts
│   ├── customer-crm.repository.ts
│   └── dto/create-contact.dto.ts
├── kernel/
│   └── customer-kernel-broker.service.ts  # ONLY component calling Core on Workspace's behalf
└── prisma/
    ├── schema.prisma                  # SEPARATE scoped schema (customer_contacts) — respects MODULE_SCOPE_LOCK
    └── customer.prisma.service.ts     # isolated Prisma client
```

## Authentication Flow (Kernel-brokered — approved by Governance Authority)
1. Workspace `POST /api/customer/v1/auth/session` `{email, password}`.
2. Suite forwards credentials to **Core** `POST /api/v1/auth/login` (Core owns user auth — Contract A §6.2).
3. Core returns a user-scoped `accessToken` with claims `sub`, `email`, `organizationId`.
4. Suite stores the Core token **server-side** (in-memory, keyed by `jti`). **It is NEVER returned to the client and NEVER logged.**
5. Suite mints its OWN **Session JWT** (HS256, secret `CUSTOMER_SESSION_SECRET`) with claims `{ sub, email, organizationId, jti }` and returns it to the Workspace.
6. Workspace sends the Session JWT as `Bearer` on every `/api/customer/*` request.
7. `CustomerSessionGuard` verifies the Session JWT; `organizationId` is taken from the JWT **claim ONLY**.

## Fail-Closed Rules (Contract B §4.2 / §10)
- Missing / invalid / expired Session JWT → **401 DENY**.
- Missing server-side session record (logout or expiry) → **401 DENY**.
- Tenant (`organizationId`) resolved from JWT claim ONLY. `X-Organization-Id` / `X-Tenant-Id` headers are **NOT trusted**.
- Core token is **NEVER** returned to the client or written to logs.
- Every route is opted-in via `@ExplicitAllow()` so the global `DenyAllGuard` (APP_GUARD) permits it, then `CustomerSessionGuard` enforces the session.

## Authorized Endpoints (v1)
| Method | Endpoint | Auth | Purpose |
| ------ | -------- | ---- | ------- |
| POST | `/api/customer/v1/auth/session` | public | Kernel-brokered login → Session JWT |
| POST | `/api/customer/v1/auth/refresh` | Session | Rotate Session JWT |
| POST | `/api/customer/v1/auth/logout` | Session | Invalidate session |
| GET | `/api/customer/v1/me` | Session | Current user + org context |
| GET | `/api/customer/v1/crm/contacts` | Session | List contacts (tenant-scoped) |
| POST | `/api/customer/v1/crm/contacts` | Session | Create contact |

## TBD Endpoints (Contract B §12)
`erp/*`, `helpdesk/*`, `automation/*`, `ai/*`, `dashboards/*`, `apps/*`, `settings/*` — intentionally **not implemented**. They are blocked by the global `DenyAllGuard` until the Screen Responsibility Matrix (SSOT) enumerates their payloads. Adding them requires Governance approval + a new contract version.

## Environment Variables
| Var | Status | Notes |
| --- | ------ | ----- |
| `CUSTOMER_SESSION_SECRET` | **NEW** | HS256 secret for the Suite Session JWT. Set in Coolify by operator. |
| `CORE_API_BASE_URL` | existing | Used by `CustomerKernelBrokerService`. |
| `DATABASE_URL` | existing | Shared Postgres; customer tables isolated in the separate schema. |

## Build & Test
```bash
# Generate the isolated customer Prisma client (no DB change)
npx prisma generate --schema=modules/platform-admin/src/customer/prisma/schema.prisma
# Build
npm run build:platform-admin
# Customer tests
npx jest -c jest.config.cjs tests/unit/customer tests/security/customer
```

## Database Migration (operator-approved — touches DB)
The `customer_contacts` table is created via the separate customer schema:
```bash
npx prisma migrate deploy --schema=modules/platform-admin/src/customer/prisma/schema.prisma
```
This is kept separate from the scope-locked platform-admin schema (MODULE_SCOPE_LOCK.md — 4 tables only).

## Source of Truth
- Canonical contract: `suite-shavi/INTEGRATION_CONTRACT_WORKSPACE.md` (Contract B).
- Companion: `suite-shavi/INTEGRATION_CONTRACT_CORE.md` (Contract A).
