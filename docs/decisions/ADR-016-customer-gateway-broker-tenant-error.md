# ADR-016: Customer Gateway (`/api/customer/*`) — Auth Broker, Tenant Resolution & Standardized Error Model

## Status
Accepted (ratifies the already-approved `INTEGRATION_CONTRACT_WORKSPACE.md` v1, 2026-07-18; Founder authority per CONFLICT_RULES #8).
The error-model standard defined here is proposed to be folded into Contract B §7 at the next contract version bump (Founder sign-off required for the amendment).

## Date
2026-07-19

## Author
shavi-architecture (Hermes Agent, Shavi autonomous engineer)

## Context
The Bassan Workspace ↔ Bassan Suite boundary (`/api/customer/v1/*`, Contract B) needs a finalized design capturing three concerns the existing scaffold implements only partially:

1. **Auth broker** — verify the Suite-issued Session JWT, then obtain/hold a Kernel (Bassan Core) user-scoped JWT **server-side only**, never exposed to the Workspace client.
2. **Tenant resolution** — derive `organizationId` from the verified Session JWT claim **only**, fail-closed (reject unknown/empty).
3. **Standardized error model** — a single, consistent error envelope + error-code taxonomy across every customer controller (currently missing: the module has no global exception filter and returns raw NestJS default bodies).

Constraints from the brief:
- Reuse Contract A (Suite ↔ Kernel S2S / user-scoped) patterns; **do NOT invent a new auth path**.
- All Kernel access is brokered by the Suite; the Workspace MUST NOT hold Kernel tokens (Contract B §3.1, §5.3, Stop Rules).

The existing scaffold (`modules/platform-admin/src/customer/**`, built 2026-07-18) already implements the broker and tenant logic correctly and is faithful to Contract A/B. This ADR ratifies that design and **adds** the standardized error model + request-validation as mandatory, currently-unbuilt items.

## Decision

### D1 — Auth broker: "Kernel JWT" = Core user-scoped token held server-side
- Login is **Kernel-brokered**: the Suite calls Core `POST /api/v1/auth/login` (Core owns user auth, Contract A §6.2). Core returns a user-scoped `accessToken` (the "Broker Kernel JWT"), claims `sub`, `email`, `organizationId`.
- The Suite stores that Core token **server-side, in-memory, keyed by the Session JWT `jti`**. It is **NEVER** returned to the client and **NEVER** logged.
- The Suite mints its **own Session JWT** (HS256, `CUSTOMER_SESSION_SECRET`) with claims `{ sub, email, organizationId, jti }` and returns that to the Workspace.
- For downstream Kernel calls (ERP / Helpdesk / AI / …), the broker reuses the stored Core token via `getKernelToken(jti)` and forwards it only to **allowlisted** Core endpoints — mirroring the Contract A `CoreClient` + `core.contract.assert` pattern (allowlist assertion, safe logging, 10s/30s timeouts, no token in logs).
- **No new auth path is invented.** The Kernel JWT is Core-issued (Contract A §5.1 Model A); the Suite never mints a Kernel JWT itself.

### D2 — Tenant resolution: claim-only, fail-closed
- `organizationId` is taken **exclusively** from the Session JWT claim. `X-Organization-Id` / `X-Tenant-Id` (or any client header) is **never** trusted.
- Missing / invalid / expired Session JWT → 401 DENY.
- Missing server-side session record (logout / expiry) → 401 DENY.
- Empty / absent `organizationId` on the Kernel login response → 401 DENY (a Workspace user MUST have an org context).
- The `CustomerSessionGuard` sets `req.user = { sub, email, organizationId }`; controllers read tenant from `req.user.organizationId` only.

### D3 — Standardized error model (NEW — requires backend implementation)
- Introduce a **global `AllExceptionsFilter`** scoped to the `CustomerModule` (or app-wide) that serializes every thrown error into one envelope:
  ```json
  { "error": { "code": "CUSTOMER_*", "message": "<safe, human-readable>", "requestId": "c-<uuid>", "details": null | object } }
  ```
- Introduce a **global `ValidationPipe`** (`whitelist: true, transform: true, forbidUnknownValues: true`) so DTOs are validated before handlers run (currently DTOs like `LoginDto` carry no validation and are unvalidated).
- Define a single error-code taxonomy (`CUSTOMER_UNAUTHORIZED`, `CUSTOMER_FORBIDDEN`, `CUSTOMER_BAD_REQUEST`, `CUSTOMER_NOT_FOUND`, `CUSTOMER_CONFLICT`, `CUSTOMER_KERNEL_ERROR`, `CUSTOMER_INTERNAL`) mapped from internal exceptions. **No token, stack trace, or raw upstream `error.message` may appear in the response body or logs.**
- The broker MUST throw **typed** errors (e.g., `CustomerKernelException`) rather than bare `Error`, so the filter maps them to `CUSTOMER_KERNEL_ERROR` (502) with a generic message.

### D4 — Allowlist consolidation (drift fix)
- The customer broker currently maintains its own `CUSTOMER_ALLOWED_ENDPOINTS` list. To honor "reuse Contract A patterns" and prevent drift, the customer broker's allowed Core endpoints MUST be registered in the **same canonical allowlist/assert module** used by `CoreClient` (`core.contract.assert.ts`), as a customer-scoped subset, with a runtime assertion on every Core call.

## Alternatives Considered

### A) Suite mints its own Kernel JWT (new signing path)
- Pros: Suite fully controls token lifetime/scope.
- Cons: **Violates Contract A §5.1** (Core is the sole issuer of user-scoped JWTs) and the brief's "do NOT invent a new auth path". Rejected.

### B) Return the Core token to the Workspace (token passthrough)
- Pros: simpler client caching.
- Cons: **Direct violation of Contract B Stop Rules** (Suite sends a Kernel token to Workspace) and CONFLICT_RULES #6 (secrets hygiene). Rejected.

### C) Trust `X-Organization-Id` header for tenant
- Pros: simpler multi-tenant routing.
- Cons: **Spoofable**; violates Contract B §4.1 / §10 fail-closed. Rejected.

### D) Keep raw NestJS error bodies (no envelope)
- Pros: zero new code.
- Cons: violates the task requirement for a "standardized error model (consistent codes/bodies across all controllers)" and breaks Workspace client error handling. Rejected — D3 is mandatory.

## Consequences
- The Workspace integrates only against `/api/customer/v1/*`; all Kernel access is brokered and token-free to the client (Contract B satisfied).
- A single, predictable error contract for the Workspace; safer failure modes (no token/PII leakage).
- Backend must implement D3 + D4 (new work; see handoff child task). The broker/tenant logic (D1/D2) is already implemented and only needs to be reconciled with the new error envelope.
- Forward-compatible with the `crm.*` authorization layer (G-SEC-2 / D-16, `crm-claims.ts`): the broker/guard can later surface Bassan-issued `crm.*` scope claims on `req.user` for CRM endpoints without changing the auth flow.

## References
- Contract B: `suite-shavi/INTEGRATION_CONTRACT_WORKSPACE.md` (v1, APPROVED 2026-07-18) — boundary, auth, tenant, error reuse.
- Contract A: `suite-shavi/INTEGRATION_CONTRACT_CORE.md` (v2, APPROVED 2026-07-11) — §5.1 Model A (user-scoped JWT), §7 error/resilience, `CoreClient` + `core.contract.assert` patterns.
- Scaffold: `modules/platform-admin/src/customer/**` (session service/guard, jwt util, kernel broker).
- Authorization boundary (adjacent): `modules/platform-admin/src/customer/auth/bassan-crm/crm-claims.ts` (G-SEC-2 / D-16, ADR-013).
- Detailed spec: `docs/customer-gateway/SPEC_AUTH_BROKER_TENANT_ERROR.md`.

## Verification
- Code review (shavi-architecture), QA (shavi-qa), Security (shavi-security) gates per ROUTING_RULES.md before any DEPLOYED transition.
- Spec acceptance: every customer endpoint returns the standard envelope on error; no token/PII in body or logs; tenant resolved from claim only (covered by `tests/security/customer/fail-closed.spec.js`).
