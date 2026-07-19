# Workspace Consumer Contract — Bassan Workspace (وجهة العميل)

> Layer: **Bassan Workspace** (customer-facing product UI). This document is the contract the Workspace
> codebase MUST consume. The Workspace repo is not built yet; this is the SSOT placeholder so the Workspace
> team starts from the locked boundary.
>
> - Originally authored 2026-07-18 by Hermes Agent.
> - **Updated 2026-07-19 (G4) to align with the finalized G1 gateway spec** —
>   `docs/decisions/ADR-016-customer-gateway-broker-tenant-error.md` and
>   `docs/customer-gateway/SPEC_AUTH_BROKER_TENANT_ERROR.md`.
>   The biggest change vs. the 2026-07-18 version: the **standardized error envelope + `CUSTOMER_*` taxonomy**
>   (ADR-016 D3) and a precise **auth-broker flow** description are now part of the contract.

## Golden rule (Contract B §3.1)
**The Workspace calls ONLY `https://<suite-host>/api/customer/v1/*`.**
It MUST NOT call Bassan Kernel directly. It MUST NOT hold or see any Kernel token.
It MUST NOT call Suite operator endpoints (`/api/v1/organizations`, `/api/v2/admin/*`).

## Base URL
```
<SUITE_BASE_URL>/api/customer/v1
```

---

## Authentication & Auth-Broker Flow

### Two tokens — never confused
The Workspace only ever sees **one** of these. The other stays server-side in the Suite and is never exposed.

| Token | Issuer | Held where | Sent to Workspace? |
|-------|---------|------------|-------------------|
| **Session JWT** (HS256, Suite-issued) | Bassan Suite (`CUSTOMER_SESSION_SECRET`) | Workspace (client) — sent as `Bearer` | **YES** |
| **Broker Kernel JWT** = Core user-scoped `accessToken` (RS256, Contract A §5.1 Model A) | Bassan Core | Suite **server-side only**, in-memory, keyed by `jti` | **NEVER** |

> The Suite **never mints a Kernel JWT**. At login it obtains the Core-issued user-scoped token and holds it on
> the Workspace user's behalf. The Workspace never receives, stores, or forwards it (Contract B §3.1, §5.3).

### Login flow (Kernel-brokered)
```
Workspace                  Suite (CustomerModule)                 Bassan Core
POST /auth/session  ─▶  CustomerAuthController.login
{email,password}          CustomerSessionService.login
                              │
                              └▶ CustomerKernelBroker.loginUser(email,password)
                                    POST /api/v1/auth/login ─▶  returns user-scoped accessToken
                              decodeUnsafe(accessToken).organizationId
                              if !organizationId → 401 (fail-closed)
                              sessions.set(jti, {userId,email,organizationId,kernelToken})
                              signSession({sub,email,organizationId,jti})  ← Suite Session JWT
                           ◀─ { accessToken: <SessionJWT>, tokenType:"Bearer", expiresIn:900 }
```
- The Core token is stored under `jti`; `getKernelToken(jti)` is the **only** accessor and is **never** returned to the client.
- **Session TTL = 900s (15 min).** `refresh` rotates `jti` (old token invalidated). `logout` deletes the record (idempotent).

### Session verification (every `/api/customer/*` request)
1. Workspace sends `Authorization: Bearer *** (cookie optional, not yet implemented).
2. The Suite verifies the Session JWT → 401 if invalid / expired / server-side record missing.
3. The Suite sets `req.user = { sub, email, organizationId }` and `req.customerJti = claims.jti`.
4. **Tenant (`organizationId`) is derived from the claim ONLY** — never from a client header.

### How the Workspace uses auth
1. `POST /api/customer/v1/auth/session` with `{ email, password }`.
2. Response: `{ accessToken, tokenType: "Bearer", expiresIn: 900 }` — this is the **Suite Session JWT**.
3. Send it as `Authorization: Bearer *** on every subsequent request.
4. `POST /api/customer/v1/auth/refresh` to rotate before expiry (recommended: refresh ~1 min before `expiresIn`).
5. `POST /api/customer/v1/auth/logout` to invalidate (idempotent — calling it twice is safe).

---

## Authorized endpoints (v1)
| Method | Endpoint | Purpose | Auth |
| ------ | -------- | ------- | ---- |
| POST | `/auth/session` | Login → Session JWT | public |
| POST | `/auth/refresh` | Rotate Session JWT | Session |
| POST | `/auth/logout` | Invalidate session | Session |
| GET | `/me` | Current user + org context | Session |
| GET | `/crm/contacts` | List contacts (your org only) | Session |
| POST | `/crm/contacts` | Create contact | Session |

### Request / response shapes (v1)
**POST `/auth/session`** → `200`:
```json
{ "accessToken": "<Suite Session JWT>", "tokenType": "Bearer", "expiresIn": 900 }
```
Errors: `400` (bad DTO), `401` (Core 401/403 → "Invalid credentials"), `502` (Core 5xx/network).

**POST `/auth/refresh`** (header `Authorization: Bearer ***`) → `200`: same shape as above (new `accessToken`, `jti` rotated).

**POST `/auth/logout`** → `200`: `{ "success": true }`.

**GET `/me`** → `200`:
```json
{ "id": "<sub>", "email": "user@org.com", "organizationId": "<orgId>" }
```

**GET `/crm/contacts`** → `200`:
```json
{ "items": [ { "id": "<uuid>", "name": "...", "email": "...", "phone": "..." } ], "total": 12 }
```
Tenant filter is applied **server-side** from `req.user.organizationId`.

**POST `/crm/contacts`** → `201`:
```json
{ "id": "<uuid>", "name": "Jane", "email": "jane@org.com", "phone": "+1...", "organizationId": "<orgId>", "createdAt": "2026-07-19T..." }
```
Request body: `{ "name": "Jane", "email": "jane@org.com", "phone": "+1..." }` (name required; email/phone optional).
Errors: `400` (bad DTO), `409` (duplicate email).

> TBD endpoints (`erp/*`, `helpdesk/*`, `automation/*`, `ai/*`, `dashboards/*`, `apps/*`, `settings/*`) are **not
> implemented**. They remain blocked by `DenyAllGuard` until the Screen Responsibility Matrix (SSOT) enumerates
> payloads + Governance approval + Contract B version bump.

---

## Tenant isolation (fail-closed)
You will **only ever see data for your own organization**. The `organizationId` is assigned by the Suite from the
Session JWT **claim only**.

- Do NOT send `X-Organization-Id` / `X-Tenant-Id` headers — they are **ignored** by the Suite (fail-closed).
- Any ambiguous/empty tenant resolves to `401`; the Suite never guesses or infers a tenant.

---

## Standardized Error Model (NEW — part of finalized G1 contract, ADR-016 D3)

Every customer endpoint returns errors in **one** envelope:

```json
{
  "error": {
    "code": "CUSTOMER_UNAUTHORIZED",
    "message": "Missing customer session token",
    "requestId": "c-9f2c1b4-...",
    "details": null
  }
}
```

- `requestId`: Suite-generated UUID with a `c-` prefix; also logged (never the token). It is propagated to Core as
  `X-Correlation-Id`. The Workspace SHOULD log `requestId` on errors to help with support/debugging.
- `details`: structured field errors for `CUSTOMER_BAD_REQUEST`; `null` otherwise.

### Error-code taxonomy
| Code | HTTP | Cause | Example safe message |
|------|------|-------|----------------------|
| `CUSTOMER_UNAUTHORIZED` | 401 | Session missing/invalid/expired/invalidated; no org | "Missing customer session token" |
| `CUSTOMER_FORBIDDEN` | 403 | Future `crm.*` scope missing (D-16) | "Insufficient permission" |
| `CUSTOMER_BAD_REQUEST` | 400 | `ValidationPipe` DTO failure | "Validation failed" (+ `details`) |
| `CUSTOMER_NOT_FOUND` | 404 | Resource missing (e.g. contact id) | "Resource not found" |
| `CUSTOMER_CONFLICT` | 409 | Duplicate (e.g. contact email) | "Resource already exists" |
| `CUSTOMER_KERNEL_ERROR` | 502 | Core 5xx / network (typed `CustomerKernelException`) | "Upstream service unavailable" |
| `CUSTOMER_INTERNAL` | 500 | Unexpected error | "Internal error" |

### Example — validation failure (400)
```json
{ "error": { "code": "CUSTOMER_BAD_REQUEST", "message": "Validation failed",
  "requestId": "c-...", "details": [ { "field": "email", "message": "must be an email" } ] } }
```

### Hard rules (CONFLICT_RULES #6, Contract B Stop Rules, Contract A §5.3)
- Response bodies and Suite logs **MUST NOT** contain: tokens, secrets, raw upstream `error.message`, or stack traces.
- `CUSTOMER_KERNEL_ERROR` / `CUSTOMER_INTERNAL` use **generic** messages only — the specific cause stays server-side.

### How the Workspace client should handle errors
1. Parse `response.error.code` (not just HTTP status) to branch UI logic.
2. On `401` / `403` → go to login (clear local session; do NOT loop-retry in a way that leaks the token).
3. On `400` → surface `details[].message` per field.
4. On `502` / `500` → show the generic `message`; include `requestId` in any bug report.
5. Never log the Session JWT; never forward it to third parties.

---

## Observability
- Every Suite response carries a `requestId` (`c-<uuid>`); log it client-side on failures.
- The Suite logs `endpoint`, `method`, `status`, `durationMs`, `orgId` (claim) — **never** token/PII (Contract B §8).
- `X-Correlation-Id` is propagated to Core on broker calls for end-to-end tracing.

---

## Security non-negotiables (Stop Rules, Contract B §10)
- Never call Kernel directly.
- Never log or store the Session JWT in a way that leaks it.
- Treat 401/403 as "go to login" — do NOT retry in a loop that leaks tokens.
- Never send `X-Organization-Id` / `X-Tenant-Id` expecting tenant switching — they are ignored (fail-closed).

---

## Status & ownership
- This contract was **finalized by G1 (2026-07-19)** via ADR-016 + the detailed spec.
- The auth-broker + claim-only tenant logic were already implemented in the Suite scaffold
  (`modules/platform-admin/src/customer/**`, built 2026-07-18) and ratified by ADR-016 D1/D2.
- The **standardized error envelope + global `ValidationPipe`** (ADR-016 D3) and **allowlist consolidation** (D4)
  are part of the finalized contract; the Workspace client MUST be built to consume them. Suite-side implementation
  is tracked by the backend tasks G2/G3.
- Two governance items from G1 are flagged for Founder sign-off (not yet executed): amending Contract A §12 to list
  `POST /api/v1/auth/login`, and folding the error model into Contract B §7.

## Source of Truth
- Canonical contracts: `suite-shavi/INTEGRATION_CONTRACT_WORKSPACE.md` (Contract B, v1 APPROVED),
  `suite-shavi/INTEGRATION_CONTRACT_CORE.md` (Contract A, v2 APPROVED).
- G1 design record: `docs/decisions/ADR-016-customer-gateway-broker-tenant-error.md` and
  `docs/customer-gateway/SPEC_AUTH_BROKER_TENANT_ERROR.md`.
- Build log: `docs/CUSTOMER_GATEWAY_BUILD_LOG.md`.
- Suite implementation: `modules/platform-admin/src/customer/README.md`.
