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

---

## Layer Evidence Log — G4 (docs) 2026-07-19

| Attribute | Value |
| --------- | ----- |
| Date | 2026-07-19 |
| Author | Hermes Agent — `shavi-docs` (Shavi autonomous docs engineer) |
| Task | G4: update workspace-consumer docs + BUILD_LOG to match gateway spec |
| Layer | **Documentation** (Bassan Workspace consumer-contract docs; Bassan Suite gateway design record) |
| Parent | G1 — finalized gateway spec (ADR-016 + `SPEC_AUTH_BROKER_TENANT_ERROR.md`) |
| Doc rule | All documentation in English, engineer-grade detail (Shavi docs rule, 2026-07-11) |

### What was done
- Rewrote `docs/workspace-consumer/README.md` (the contract the future Bassan Workspace consumes) to align
  with the **finalized G1 spec** (2026-07-19). The previous version (2026-07-18) predated G1 and lacked:
  - The **standardized error envelope** `{error:{code,message,requestId,details}}` + `CUSTOMER_*` taxonomy
    (ADR-016 D3) — now documented as a mandatory client-handling contract, with example 400 + hard rules.
  - A precise **auth-broker flow** (two-token table: Session JWT vs. server-side Broker Kernel JWT; login
    sequence; session verify; 900s TTL; refresh rotates `jti`; idempotent logout).
  - Exact **request/response shapes** for every v1 endpoint (§5 of the spec).
  - **Observability** note (`requestId` `c-<uuid>`, `X-Correlation-Id` propagation).
  - A **Status & ownership** section tying the doc to G1/ADR-016 and Flagged governance items.
- Appended this Layer Evidence Log entry to `docs/CUSTOMER_GATEWAY_BUILD_LOG.md`.

### Why
G1 finalized the `/api/customer/v1/*` design on 2026-07-19 (after the 2026-07-18 scaffold + placeholder consumer
doc). The consumer doc is the SSOT the Workspace team builds against; it had to reflect the finalized contract —
especially the NEW error model and the precise broker/tenant semantics — so the Workspace integrates correctly and
does not invent its own error handling.

### Result
- `docs/workspace-consumer/README.md` is now consistent with `ADR-016` and `SPEC_AUTH_BROKER_TENANT_ERROR.md`
  (auth flow, claim-only tenant, error envelope, endpoint shapes, observability, security Stop Rules).
- No code changed — documentation only. Existing scaffold behavior (broker + claim-only tenant) is ratified, not
  contradicted; the error envelope + `ValidationPipe` are documented as the finalized contract the Workspace must
  consume (Suite-side implementation tracked by G2/G3).

### Verification
- Cross-checked every section against `ADR-016` (D1–D4) and `SPEC_AUTH_BROKER_TENANT_ERROR.md` (§2–§6); no
  contradiction with Contract A §5.1/§7 or Contract B §3.1/§4.2/§10.
- Confirmed no tokens/secrets/PII appear in documented request/response bodies (per CONFLICT_RULES #6).
- Confirmed the two Flagged governance items (Contract A §12 amendment; fold error model into Contract B §7) are
  noted as **not executed** / pending Founder sign-off — not silently adopted.
- `git status` / `git diff` available for Founder review of the two changed files (no commit/push performed).

### Files changed
- `docs/workspace-consumer/README.md` (rewritten to match G1 spec)
- `docs/CUSTOMER_GATEWAY_BUILD_LOG.md` (this Layer Evidence Log entry appended)

### Arch layer
Documentation / contract-consumer layer (Bassan Workspace). References the Bassan Suite control-plane gateway
design (Contract B) and Bassan Core auth (Contract A).

### Handoff
- **To Workspace team / future Workspace build:** consume `docs/workspace-consumer/README.md` as SSOT; implement
  the client to handle the `CUSTOMER_*` error envelope and send only the Suite Session JWT.
- **To `shavi-backend` (G2/G3):** implement the Suite side of the error envelope (`AllExceptionsFilter`), global
  `ValidationPipe`, and allowlist consolidation (ADR-016 D3/D4) so the contract is enforceable end-to-end.
- **To Founder:** two governance sign-offs flagged (Contract A §12; Contract B §7 error-model fold-in).
