# Customer Gateway Spec — Auth Broker, Tenant Resolution & Error Model
**Contract**: `INTEGRATION_CONTRACT_WORKSPACE.md` (Contract B, v1 APPROVED) + `INTEGRATION_CONTRACT_CORE.md` (Contract A, v2).
**ADR**: `docs/decisions/ADR-016-customer-gateway-broker-tenant-error.md`
**Layer**: Bassan Suite (control plane). Owns `/api/customer/v1/*`.
**Status**: DESIGN FINALIZED (2026-07-19). Backend implementation tasks: G2/G3 (see handoff).

---

## 1. Scope
Defines, for the `/api/customer/v1/*` surface, the **exact** contract for:
1. Auth broker (Session JWT verify → server-side Kernel JWT hold).
2. Tenant resolution (claim-only, fail-closed).
3. Standardized error envelope + error-code taxonomy (NEW — not yet in code).
4. DTO validation (NEW — global `ValidationPipe`).

It does **not** define per-screen CRM/ERP/Helpdesk payloads — those live in the Screen Responsibility Matrix (SSOT, Contract B §12). It does **not** define the `crm.*` authorization enforcement (G-SEC-2 / D-16, `crm-claims.ts`) — that is an adjacent security track; §7 notes forward-compatibility only.

---

## 2. Authentication Broker

### 2.1 Token taxonomy (two distinct tokens — never confused)
| Token | Issuer | Held where | Sent to Workspace? | Logged? |
|-------|---------|------------|-------------------|----------|
| **Session JWT** (HS256) | Suite (`customer-jwt.util.signSession`, secret `CUSTOMER_SESSION_SECRET`) | Workspace (client) + server-side record keyed by `jti` | YES (Bearer) | Never the signature/secret |
| **Broker Kernel JWT** = Core user-scoped `accessToken` (RS256, Contract A §5.1 Model A) | Bassan Core (`POST /api/v1/auth/login`) | Suite **server-side only**, in-memory, keyed by `jti` | **NEVER** | **NEVER** |

> The Suite **never mints a Kernel JWT**. "mint… server-side" in the brief means: obtain the Core-issued user-scoped token at login and hold it server-side on the user's behalf (Contract A §5.1, reuse not invent).

### 2.2 Login flow (Kernel-brokered)
```
Workspace                  Suite (CustomerModule)                 Bassan Core
POST /auth/session  ─▶  CustomerAuthController.login
{email,password}          CustomerSessionService.login
                              │
                              └▶ CustomerKernelBroker.loginUser(email,password)
                                    POST /api/v1/auth/login ─▶  returns user-scoped accessToken
                                    (assert endpoint in allowlist; NEVER log token)
                              decodeUnsafe(accessToken).organizationId
                              if !organizationId → 401 (fail-closed)
                              sessions.set(jti, {userId,email,organizationId,kernelToken})
                              signSession({sub,email,organizationId,jti})  ← Suite Session JWT
                           ◀─ { accessToken: <SessionJWT>, tokenType:"Bearer", expiresIn:900 }
```
- `kernelToken` stored under `jti`; `getKernelToken(jti)` is the **only** accessor and is never returned to the client.
- Session TTL = **900s (15 min)**; `refresh` rotates `jti` (old token invalidated). `logout` deletes the record (idempotent).

### 2.3 Downstream Kernel calls (future ERP / Helpdesk / AI / …)
- The broker reuses the stored Core token: `getKernelToken(req.customerJti)`.
- Every Core call MUST pass the **same runtime allowlist assertion** used by `CoreClient` (`core.contract.assert.ts`), as a customer-scoped subset (consolidation per ADR-016 D4).
- The broker MUST throw **typed** `CustomerKernelException` (not bare `Error`) so the error filter maps it to `CUSTOMER_KERNEL_ERROR` (§5).
- Current allowlist (extend only with Governance approval + Contract B version bump):
  - `POST /api/v1/auth/login`
  - `GET /api/v1/organizations/:id`  *(user-scoped; requires the stored Core token)*

> **Governance note**: Contract A §12 does not yet list `POST /api/v1/auth/login` explicitly. Recommend amending Contract A §12 to include it as a customer-broker user-scoped endpoint (it is the Model A token-issuance endpoint). Flagged for Founder sign-off at next Contract A version bump.

### 2.4 Session verification (every `/api/customer/*` request)
`CustomerSessionGuard.canActivate`:
1. Read `Authorization: Bearer <token>` (cookie optional, not yet implemented).
2. `sessionService.verify(token)` → 401 if invalid/expired/**server-side record missing**.
3. Set `req.user = { sub, email, organizationId }` and `req.customerJti = claims.jti`.
4. **Tenant from claim ONLY** — never from `X-Organization-Id` / `X-Tenant-Id`.

Route reachability: every customer route is opted-in via `@ExplicitAllow()` so the global `DenyAllGuard` (APP_GUARD) permits it; `CustomerSessionGuard` then enforces the session (fail-closed).

---

## 3. Tenant Resolution (fail-closed)
| Case | Behavior |
|------|-----------|
| No `Authorization` header / malformed | 401 `CUSTOMER_UNAUTHORIZED` ("Missing customer session token") |
| Session JWT signature/secret invalid | 401 `CUSTOMER_UNAUTHORIZED` ("invalid signature") |
| Session JWT expired | 401 `CUSTOMER_UNAUTHORIZED` ("expired token") |
| Server-side record gone (logout/expiry) | 401 `CUSTOMER_UNAUTHORIZED` ("Session invalidated") |
| Kernel login returned no `organizationId` | 401 `CUSTOMER_UNAUTHORIZED` ("User has no organization context") |
| Any `X-Organization-Id` / `X-Tenant-Id` header present | **IGNORED** — tenant is claim-derived; header has zero effect |
| Ambiguous tenant | **Never** inferred/guessed → 401 (fail-closed, Contract B §4.2/§10) |

---

## 4. Standardized Error Envelope (NEW — implement in G2/G3)

### 4.1 Shape (all errors, all customer controllers)
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
- `requestId`: Suite-generated UUID prefix `c-`, also logged (never the token). Propagate as `X-Correlation-Id` to Core.
- `details`: structured field errors for `CUSTOMER_BAD_REQUEST` (see §4.3); `null` otherwise.

### 4.2 Error-code taxonomy
| Code | HTTP | Thrown by / cause | Safe message example |
|------|------|-------------------|----------------------|
| `CUSTOMER_UNAUTHORIZED` | 401 | `UnauthorizedException` (session missing/invalid/expired/invalidated; no org) | "Missing customer session token" |
| `CUSTOMER_FORBIDDEN` | 403 | future: `crm.*` scope missing (D-16) | "Insufficient permission" |
| `CUSTOMER_BAD_REQUEST` | 400 | `ValidationPipe` DTO failure | "Validation failed" (+ `details`) |
| `CUSTOMER_NOT_FOUND` | 404 | resource missing (e.g., contact id) | "Resource not found" |
| `CUSTOMER_CONFLICT` | 409 | duplicate (e.g., contact email) | "Resource already exists" |
| `CUSTOMER_KERNEL_ERROR` | 502 | `CustomerKernelException` (Core 5xx/network) | "Upstream service unavailable" |
| `CUSTOMER_INTERNAL` | 500 | unexpected `Error` | "Internal error" |

**Hard rules** (CONFLICT_RULES #6, Contract B Stop Rules, Contract A §5.3):
- Response body and logs MUST NOT contain: tokens, secrets, raw upstream `error.message`, or stack traces.
- `CUSTOMER_KERNEL_ERROR` / `CUSTOMER_INTERNAL` use **generic** messages only; the specific cause stays server-side in the safe log (`errorCode` + `requestId` + non-sensitive fields).

### 4.3 Validation (NEW — global `ValidationPipe`)
- Enable `app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidUnknownValues: true }))`.
- All customer DTOs gain `class-validator` decorators, e.g.:
  - `LoginDto`: `email` → `@IsEmail()`, `password` → `@IsString() @MinLength(8)`.
  - `CreateContactDto`: `name` → `@IsString() @MinLength(1)`, `email` → `@IsOptional() @IsEmail()`, `phone` → `@IsOptional() @IsString()`.
- On failure → 400 `CUSTOMER_BAD_REQUEST` with `details`:
  ```json
  { "error": { "code": "CUSTOMER_BAD_REQUEST", "message": "Validation failed",
    "requestId": "c-...", "details": [ { "field": "email", "message": "must be an email" } ] } }
  ```

### 4.4 Filter mapping (pseudo)
```
catch e:
  if e instanceof UnauthorizedException → 401 CUSTOMER_UNAUTHORIZED (e.message, safe)
  if e instanceof ForbiddenException   → 403 CUSTOMER_FORBIDDEN
  if e instanceof BadRequestException (ValidationPipe) → 400 CUSTOMER_BAD_REQUEST (e.details)
  if e instanceof NotFoundException  → 404 CUSTOMER_NOT_FOUND
  if e instanceof ConflictException  → 409 CUSTOMER_CONFLICT
  if e instanceof CustomerKernelException → 502 CUSTOMER_KERNEL_ERROR (generic)
  else → 500 CUSTOMER_INTERNAL (generic)   // NEVER forward e.message/token/stack
always attach requestId; log safe fields only.
```

---

## 5. Endpoint Request / Response Shapes (v1)

### 5.1 POST `/api/customer/v1/auth/session`  (public)
Request:
```json
{ "email": "user@org.com", "password": "********" }
```
Success `200`:
```json
{ "accessToken": "<Suite Session JWT>", "tokenType": "Bearer", "expiresIn": 900 }
```
Errors: 400 (bad DTO), 401 (Core 401/403 → "Invalid credentials"), 502 (Core 5xx/network).

### 5.2 POST `/api/customer/v1/auth/refresh`  (Session)
Headers: `Authorization: Bearer <SessionJWT>`.
Success `200`: same shape as §5.1 (new `accessToken`, `jti` rotated).

### 5.3 POST `/api/customer/v1/auth/logout`  (Session)
Success `200`: `{ "success": true }`. Idempotent.

### 5.4 GET `/api/customer/v1/me`  (Session)
Success `200`:
```json
{ "id": "<sub>", "email": "user@org.com", "organizationId": "<orgId>" }
```
*(Future: `roles` / `permissions` may be added from Bassan `crm.*` claims — see §7.)*

### 5.5 GET `/api/customer/v1/crm/contacts`  (Session, tenant-scoped)
Success `200`:
```json
{ "items": [ { "id": "<uuid>", "name": "...", "email": "...", "phone": "..." } ], "total": 12 }
```
Tenant filter applied server-side from `req.user.organizationId` (Suite-owned `customer_contacts` table, separate Prisma schema).

### 5.6 POST `/api/customer/v1/crm/contacts`  (Session, tenant-scoped)
Request:
```json
{ "name": "Jane", "email": "jane@org.com", "phone": "+1..." }
```
Success `201`:
```json
{ "id": "<uuid>", "name": "Jane", "email": "jane@org.com", "phone": "+1...", "organizationId": "<orgId>", "createdAt": "2026-07-19T..." }
```
Errors: 400 (bad DTO), 409 (duplicate).

> TBD endpoints (`erp/*`, `helpdesk/*`, `automation/*`, `ai/*`, `dashboards/*`, `apps/*`, `settings/*`) are **not implemented** — blocked by `DenyAllGuard` until the SSOT enumerates payloads + Governance approval + Contract B version bump.

---

## 6. Observability
- `requestId` (`c-<uuid>`) generated Suite-side; logged with `endpoint`, `method`, `status`, `durationMs`, `orgId`(claim). **NEVER** token/PII (Contract B §8).
- `X-Correlation-Id` propagated to Core on broker calls.
- Circuit breaker: 5 consecutive Core failures → open 60s (reuse `CoreClient` pattern, Contract A §7).

---

## 7. Forward-Compatibility with `crm.*` Authorization (D-16 / G-SEC-2)
- `crm-claims.ts` defines the Bassan-issued `crm.*` namespace (`crm.leads|tasks : read|write`) verified+enforced claims-derived (ADR-013, no local rows).
- The auth flow here is **unchanged** by that track. When CRM enforcement lands, the broker/guard MAY surface the Bassan `crm.*` `scope`/role on `req.user` for CRM routes; the Session JWT / tenant resolution are unaffected.
- This spec's error envelope already reserves `CUSTOMER_FORBIDDEN` (403) for that enforcement.

---

## 8. Acceptance Criteria (for G2/G3 implementation)
- [ ] Global `AllExceptionsFilter` returns the §4.1 envelope for **every** customer controller error path.
- [ ] Error-code taxonomy (§4.2) implemented; no token/PII/stack in body or logs (verify via `tests/security/customer/fail-closed.spec.js` + new log-leak test).
- [ ] Global `ValidationPipe` (whitelist+transform) enabled; all customer DTOs validated.
- [ ] Broker throws `CustomerKernelException`; allowlist consolidated into `core.contract.assert` (customer subset).
- [ ] All §5 endpoint shapes match exactly.
- [ ] Tenant claim-only, fail-closed (existing tests pass + extended).
- [ ] Contract A §12 amended to list `POST /api/v1/auth/login` (Founder sign-off).

## 9. Source of Truth
- Canonical contracts: `INTEGRATION_CONTRACT_WORKSPACE.md` (B), `INTEGRATION_CONTRACT_CORE.md` (A).
- This spec + `docs/decisions/ADR-016-...` are the G1 design record.
- Scaffold: `modules/platform-admin/src/customer/**`.
