# Suite — INTEGRATION_CONTRACT_CORE (v3 — APPROVED)

> **ACTIVE — BINDING INTEGRATION CONTRACT (v3, ratified 2026-07-19).** Supersedes v2 (2026-07-11 APPROVED) and v1 (root 2026-01-26 + 2026-02-06 governance copy).
> Written by Hermes Agent after code verification on 2026-07-11. Approved by Governance Authority on 2026-07-11.

## Document Control

| Attribute      | Value                                            |
| -------------- | ------------------------------------------------ |
| Document Title | INTEGRATION_CONTRACT_CORE                        |
| Repo           | Suite (Layer / Product Repo)                     |
| Version        | **v3 (APPROVED)**                                |
| Status         | ACTIVE — BINDING INTEGRATION CONTRACT            |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST          |
| Authority      | Governance Authority (Layer)                     |
| Effective Date | 2026-07-11                                        |
| Supersedes     | v1 (2026-01-26 root + 2026-02-06 governance copy)|

---

## 0) Revision History — What Changed (v1 → v2)

**Date of change**: 2026-07-11
**Author**: Hermes Agent (Shavi autonomous engineer), after direct code verification of both `suite-shavi` and `Bassan.os` repositories.
**Trigger**: Governance drift — the live code had evolved past the v1 contract, but the contract was never updated.

### Why v2 was needed (what was actually wrong in v1)
The v1 contract (root copy 2026-01-26 + governance copy 2026-02-06) asserted:
- "Core v1 uses User-Scoped JWT authentication ONLY."
- "Service-to-service auth / Core service tokens: NOT AVAILABLE in Core v1 (DEFERRED to Core v2)."
- "Only `GET /api/v1/organizations/:id` is authorized."
- Stop Rule: "BFF attempts to implement service-token flows → STOP."

**Code verification on 2026-07-11 proved all of the above OBSOLETE:**
1. `core.client.ts` already calls `POST /api/v2/admin/organizations` and `PATCH /api/v2/admin/organizations/:id/{suspend,unsuspend,deactivate}`. These **work** because Core `AdminController` guards them with `AdminJwtAuthGuard` (`AdminJwtStrategy`), verifying S2S RS256 tokens via `ADMIN_JWKS_URL` / `ADMIN_JWT_PUBLIC_KEY`. → **v2 + S2S ARE available.**
2. **Bug found (HISTORICAL — RESOLVED 2026-07-12, see §15)**: the org-mapping flow (`POST /api/platform-admin/org-mappings`) minted an S2S token, then `validateOrganizationExists()` forwarded that S2S token to Core `GET /api/v1/organizations/:id`, guarded by `JwtAuthGuard` + `TenantGuard` (requires a USER JWT with `organizationId`). The S2S token has no `orgId` → rejected (401/404). Result: platform-admin org-linking was **broken (fail-closed)** at the time of writing. **Re-verification of the current code (2026-07-12) confirmed the fix is in place**: `validateOrganizationExists()` now calls the correct `GET /api/v2/admin/organizations/:id` (core.client.ts L71/L78) and forwards the S2S token; the allowlist permits it (core.contract.assert.ts L21). The real production blocker was **infrastructure** (missing `ADMIN_JWT_PUBLIC_KEY` + Cloudflare 1010), not this code path — resolved in §15.
3. Two contract copies existed (`suite-shavi/INTEGRATION_CONTRACT_CORE.md` and `modules/platform-admin/governance/contracts/INTEGRATION_CONTRACT_CORE.md`) and had both drifted from the code.

### What changed in v2
- ✅ Removed the obsolete claims "service tokens NOT AVAILABLE / v2 DEFERRED"; both are now available (post PR-101).
- ✅ Added the S2S admin validation endpoint `GET /api/v2/admin/organizations/:id` (the missing piece that fixes the validation bug).
- ✅ Defined **two** explicit auth models: Tenant User-Scoped (Core v1) and Platform-Admin S2S (Core v2).
- ✅ Mandated that platform-admin validation uses the S2S admin endpoint, NOT the tenant `GET /api/v1/organizations/:id`.
- ✅ Revised Stop Rules: removed the wrong "no service-token flows" stop; added a stop for sending the wrong token type to the wrong endpoint class.
- ✅ Designated a single canonical contract file; the duplicate governance copy is deprecated.

---

## 1) Purpose & Contract Philosophy

### 1.1 Purpose
Defines the binding contract for how Suite integrates with Bassan.os Core:
- Allowed interaction patterns
- Identity and tenant alignment rules
- Authentication and authorization model (**TWO models**: tenant user-scoped + platform-admin S2S)
- Data flow boundaries
- Error handling and resilience
- Observability requirements

### 1.2 Contract-First Philosophy
- **MUST**: All Suite ↔ Core integration MUST be defined here BEFORE implementation.
- **MUST**: Core is a black box; Suite MUST NOT rely on Core internals.
- **MUST**: Any change requires updating this contract + Governance approval.
- **MUST NOT**: Implement temporary/experimental Core integrations outside this contract.

---

## 2) Definitions

| Term                | Definition                                                                                              |
| ------------------- | ------------------------------------------------------------------------------------------------------- |
| **User-Scoped JWT** | JWT issued by Core for user auth; claims `sub`, `email`, `organizationId`. Verified by JwtAuthGuard + TenantGuard. |
| **S2S JWT**         | Service-to-Service JWT: RS256, `type:'s2s'`, `sub=operatorId`, NO `orgId`. Minted by Suite SessionGuard. Verified by Core `AdminJwtStrategy` via `ADMIN_JWKS_URL` / `ADMIN_JWT_PUBLIC_KEY`. Used for platform-admin operations. |
| **Org Alignment**   | Mapping Suite `orgId` ↔ Core `orgId`; stored in Suite DB only.                                          |
| **Correlation ID**  | Unique request id propagated UI → BFF → Core for tracing (Suite-only).                                 |
| **BFF**             | Backend-for-Frontend; the ONLY Suite component allowed to call Core.                                    |
| **UI**              | Suite frontend; MUST NOT call Core directly or hold Core tokens.                                        |

---

## 3) Allowed Interaction Patterns (Strict)

### 3.1 UI → BFF Only
- **MUST**: All UI requests go to Suite BFF.
- **MUST NOT**: UI calls Core APIs directly.
- **MUST NOT**: UI possesses/uses Core tokens (user or S2S).

### 3.2 BFF → Core Only
- **MUST**: Suite BFF is the ONLY component allowed to call Core.
- **Core v1 (tenant) auth = User-Scoped JWT.** **Core v2 (admin) auth = S2S JWT.** Both are **NOW AVAILABLE** (post PR-101). The v1 contract's claim that "service tokens / v2 are NOT AVAILABLE / DEFERRED" is **OBSOLETE** and removed in v2.
- **MUST**: BFF uses HTTPS/TLS for all Core calls.

### 3.3 No Core DB Access Ever
- **MUST NOT**: Suite accesses Core DB directly. All data via Core APIs.

---

## 4) Identity & Tenant Alignment

### 4.1 OrganizationId Mapping Rules
- Suite stores `SuiteOrganizationMapping { suiteOrgId (PK), coreOrgId, createdAt, updatedAt }`.
- Mapping created ONLY when a Suite org is linked to a Core org, after validation succeeds.

### 4.2 Fail-Closed Rules
- Missing/ambiguous mapping → BFF DENIES (safe error).
- **MUST**: Mapping creation MUST validate the target Core org exists (via the S2S admin validation endpoint, §12) BEFORE writing the mapping. Fail-closed on 404/401/5xx.
- **MUST NOT**: BFF guesses/infers/auto-creates mappings.

### 4.3 Tenant Context
- Tenant (user-scoped) endpoints: `organizationId` derived from JWT claim ONLY.
- S2S (admin) endpoints: NO `orgId` in token by design; target org is the `:id` in the path, validated server-side by Core. No `X-Organization-Id` / `X-Tenant-Id` headers.

---

## 5) Authentication & Authorization Model (TWO MODELS)

### 5.1 Model A — Tenant / User-Scoped (Core v1)
- **Used for**: `GET /api/v1/organizations/:id` (tenant reads own org).
- JWT claims: `sub`, `email`, `organizationId`.
- Verified by `JwtAuthGuard` + `TenantGuard`.
- 401/403 → DENY immediately (fail-closed). No retry, no refresh.

### 5.2 Model B — Platform-Admin S2S (Core v2)
- **Used for**: validation, create, lifecycle on `/api/v2/admin/organizations/*`.
- RS256 JWT, `type:'s2s'`, `sub=operatorId`, `jti`, `iat`, `exp` (TTL 300s).
- Minted by Suite `SessionGuard` on admin routes (POST/PATCH/DELETE on `/organizations`, `/org-mappings`).
- Verified by Core `AdminJwtAuthGuard` (`AdminJwtStrategy`) via `ADMIN_JWKS_URL` / `ADMIN_JWT_PUBLIC_KEY`.
- **MUST NOT**: be sent to UI or logged.

### 5.3 Never Expose to Clients
- S2S token MUST NEVER reach the UI. Auth tokens MUST NEVER appear in logs or error messages.

---

## 6) Data Flow Rules

### 6.1 Cacheable in Suite DB
- Org mapping (Suite ↔ Core), non-sensitive reference data explicitly authorized.

### 6.2 Source of Truth
- **Core**: user auth, org records, audit logs.
- **Suite**: CRM, omnichannel, Suite config, org mapping.
- Suite MUST NOT modify Core-owned data.

---

## 7) Error Handling & Resilience
- Bounded retries (max 3, exp backoff 1s/2s/4s) on **5xx / network only**. **NEVER** retry 4xx/401/403.
- Timeouts: GET 10s, write 30s.
- Circuit breaker: 5 consecutive failures → open 60s. Log state changes.

---

## 8) Observability
- Correlation ID generated BFF-side, propagated via `X-Correlation-Id`. Core v1 does NOT guarantee echo/logging.
- Log: endpoint, method, status, duration, coreOrgId. **NEVER** log tokens/PII.

---

## 9) Versioning Strategy
- Versioned via git tags (`suite-integration-contract-v2`).
- Endpoint/auth change → new version + written justification + Governance approval.
- Core API prefixes: `/api/v1` (tenant, user-scoped) and `/api/v2/admin` (platform-admin, S2S).

---

## 10) Stop Rules (REVISED)
Execution MUST STOP if:
- UI calls Core directly or holds a Core token.
- BFF accesses Core DB.
- BFF calls a Core endpoint NOT listed in §12.
- Tenant mapping ambiguity handled fail-open.
- Core call without correct auth context (user JWT for tenant endpoints; S2S for admin endpoints).
- **BFF sends S2S token to a tenant (user-scoped) endpoint, or user JWT to an admin (S2S) endpoint.** ← the exact bug this v2 fixes.
- Auth tokens logged or in error messages.
- Suite stores Core-owned sensitive data without authorization.
- **REMOVED** (was wrong in v1): "BFF implements service-token flows → STOP". S2S flows ARE authorized for the §12 admin endpoints.

---

## 11) Acceptance Criteria
Contract is ACTIVE/BINDING when ALL true:
- [ ] Two auth models defined (user-scoped + S2S).
- [ ] v2 admin endpoints authorized (create, lifecycle, **validation**).
- [ ] S2S verification path defined (ADMIN_JWKS_URL / PUBLIC_KEY).
- [ ] Org-mapping creation validates org via S2S before persisting.
- [ ] Single canonical contract file; duplicate deprecated.
- [ ] No contradictions with EXECUTION_AUTHORITY.md, ARCHITECTURAL_LAWS.md, SECURITY_BASELINE.md.
- [ ] Governance Authority reviewed + approved.

---

## 12) Authorized Core Endpoints (v2)

| Capability               | Method | Endpoint                                      | Auth | Purpose                                  |
| ------------------------ | ------ | --------------------------------------------- | ---- | ---------------------------------------- |
| **Org validation (admin)** | GET    | `/api/v2/admin/organizations/:id`             | S2S  | Validate org exists before mapping **(NEW — fixes validation bug)** |
| Org read (tenant)        | GET    | `/api/v1/organizations/:id`                   | User JWT | Tenant reads own org                |
| Org create               | POST   | `/api/v2/admin/organizations`                 | S2S  | Provision org (PR-101)                   |
| Org lifecycle — suspend  | PATCH  | `/api/v2/admin/organizations/:id/suspend`     | S2S  | Suspend org                              |
| Org lifecycle — unsuspend | PATCH | `/api/v2/admin/organizations/:id/unsuspend`   | S2S  | Unsuspend org                            |
| Org lifecycle — deactivate | PATCH | `/api/v2/admin/organizations/:id/deactivate`  | S2S  | Deactivate org                           |
| **Audit event emit (NEW — v3)** | POST | `/api/v2/admin/audit/events`              | S2S  | Emit Suite→Kernel audit event (crm.* auth decisions) — **ratified 2026-07-19 (see §16)** |

> **CRITICAL**: Platform-admin validation MUST use `GET /api/v2/admin/organizations/:id` (S2S). The tenant endpoint `GET /api/v1/organizations/:id` MUST NOT be used for platform-admin validation — it requires a user JWT with `orgId` and would reject the S2S token (the bug described in §0, resolved 2026-07-12 — current code already uses the v2/admin endpoint per §15).

---

## 13) Governance — Single Source of Truth
- **Canonical file**: `suite-shavi/INTEGRATION_CONTRACT_CORE.md` (this v2 content).
- The duplicate at `modules/platform-admin/governance/contracts/INTEGRATION_CONTRACT_CORE.md` is **DEPRECATED** — MUST be removed or replaced by a pointer to the canonical file to prevent future drift.
- All changes go through the canonical file + version bump + Governance approval.
> **APPROVED ADDENDUM (ratified 2026-07-19 by Governance Authority):** §16 defines the **Suite → Kernel central audit emission contract** for `crm.*` authorization decisions (G-SEC-2, gate `t_9d8689f9` criterion 4). Ratified as proposed; Contract A bumped to **v3 (APPROVED)**. The `POST /api/v2/admin/audit/events` row above is now binding.

---

## 14) Signature
- **Approved By**: Governance Authority (Eslam Abdelshafi)
- **Date**: 2026-07-11
- **Status**: ACTIVE — BINDING INTEGRATION CONTRACT

## 15) Amendment Record — Infrastructure Fix (2026-07-12)

**Author**: Hermes Agent (Shavi autonomous engineer). **Approved by**: Governance Authority (Eslam Abdelshafi).

The §0 narrative documents an org-mapping **code bug**. Re-verification of the **current** code (2026-07-12) proved it is **already resolved** — `validateOrganizationExists()` (core.client.ts L71/L78) correctly calls `GET /api/v2/admin/organizations/:id` and forwards the S2S token; the allowlist permits it (core.contract.assert.ts L21); bassan-core `AdminController.getOrganization()` exists and is `AdminJwtAuthGuard`-protected (admin.controller.ts L35/L81).

The real production outage was **infrastructure**, now fixed:
1. **bassan-core startup crash** — `ADMIN_JWT_PUBLIC_KEY` was unset. Fixed: set the PEM (derived from JWKS `kid=admin-key-3`) on the **Production** Coolify app `b8c7zymvxxcm2srwplhq20uf`; emptied `ADMIN_JWKS_URL`; restarted deployment `iqtbjh3rxah7y48exowjfy7n` (finished OK).
2. **Cloudflare Bot Fight Mode (HTTP 1010)** blocked automated JWKS/login. Fixed: Bot Fight Mode confirmed OFF (JWKS + shavi-suite login return 200 / non-1010 from a `curl` UA). bassan-core now verifies locally from the PEM, so it is immune regardless.

**Verification**: bassan-core up; `GET /api/v2/admin/organizations/:id` (no token) → 401 (guard active, PEM loaded); JWKS → 200. Full record: `docs/runbooks/S2S_INFRA_FIX_RUNBOOK.md`.

**Conclusion**: Suite ↔ Core S2S integration is correct in code and operational in production as of 2026-07-12. No code change was required for org-mapping. This is amendment v2.1 of the binding contract.

---

## 16) Audit Emission Contract (Suite → Kernel central audit) — APPROVED (ratified 2026-07-19, v3)

> ✅ **STATUS: APPROVED (v3).** Ratified by the Governance Authority (Founder) on 2026-07-19. This section is now **BINDING** as Contract A v3. Deliverable of kanban **t_c94bd2c1** (G-SEC-2, security gate **t_9d8689f9** criterion 4). Backend (t_7cc0bbe7) may now wire `CrmScopeGuard` to the central audit sink per this contract.
> Source: SHAVI `CrmScopeGuard` (`modules/platform-admin/src/customer/auth/bassan-crm/crm-scope.guard.ts`) currently emits NO audit — by design, until this contract lands. Remediation **t_bd05896c** explicitly forbids faking central audit with the SHAVI-local `AuditService` (`modules/platform-admin/src/audit/*`).

### 16.1 Purpose
Every `crm.*` authorization decision made by SHAVI `CrmScopeGuard` — **allow / 403 deny / Admin scope-bypass** — MUST be emitted as an immutable audit event to **Bassan Kernel central audit** (the Kernel-owned audit sink, "black box" per §6.2 / `INTEGRATION_CONTRACT_WORKSPACE.md` §6.2). It MUST NOT be emitted to the SHAVI-local `AuditService`. This closes G-SEC-2 gate `t_9d8689f9` criterion 4.

### 16.2 Transport — RATIFIED: (a) HTTPS/S2S POST
- **Transport**: `HTTPS POST` to a new Core endpoint **`POST /api/v2/admin/audit/events`**.
- **Why not Kafka / event-bus (option b)**: No Kafka/topic/event-bus infrastructure exists in Suite↔Kernel today (verified: no producer, no bus; existing Kernel calls use native `fetch()`). Reusing the proven `fetch()` S2S broker (`CoreClient`, Contract A §5.2) is the only option that adds **zero new dependencies** and mirrors the org-admin pattern.
- **Implementation**: native `fetch()` (Node 18+ built-in). **NO new npm dependency** (Node `crypto` only, same as `SessionGuard`).
- **Headers** (identical to `CoreClient`):
  - `Authorization: Bearer <token>``
  - `X-Correlation-Id: ${correlationId}`
  - `Content-Type: application/json`
- **Timeout**: fire-and-forget, `AbortSignal.timeout(10000)` (10s) — per Contract A §7 GET cap; MUST NOT exceed the auth-path budget.
- **Allowlist**: backend MUST add `'POST /api/v2/admin/audit/events'` to `core.contract.assert.ts` `ALLOWED_CORE_ENDPOINTS` so the runtime drift assertion enforces it (mirrors §0 fix).

### 16.3 Auth — S2S RS256 (reuse Model B)
- The audit sink mints a **Suite S2S JWT** using the EXISTING `PLATFORM_ADMIN_JWT_PRIVATE_KEY_PEM_B64` (the same key Suite uses for all Kernel S2S), with claims identical to `SessionGuard.mintAdminJwt`:
  - `sub`: a dedicated **service identity**, e.g. `shavi-audit-sink` (NOT an operator id; a fixed emitter principal).
  - `type: 's2s'`, `jti` (replay defense), `iat`, `exp` (TTL 300s).
  - `kid`: `PLATFORM_ADMIN_JWT_KID`.
- Verified by Core `AdminJwtAuthGuard` (`AdminJwtStrategy`) via `ADMIN_JWKS_URL` / `ADMIN_JWT_PUBLIC_KEY` — the **SAME verification path** as every other §12 S2S call.
- **MUST NOT** use the incoming Bassan `crm.*` JWT, the Workspace session, or any user token to authenticate the emit. This is an outbound S2S call from the Suite, not a user action; `actor.subject` (the audited party) is carried in the **payload** (§16.4), not as the outbound auth identity.
- Minting MUST reuse `SessionGuard.mintAdminJwt` logic (extract to a shared `S2sTokenService`, or a thin copy) — **NO new key material, NO new dependency**.

### 16.4 Payload Schema (crm.* decision event)
`POST /api/v2/admin/audit/events` request body (JSON). **All fields NON-PII.** The Bassan `crm.*` token `sub` is an opaque identifier, not SHAVI PII; even so, only the opaque `sub` and org id may be carried — **NEVER** email / name / phone / address.

```json
{
  "eventType": "authorization.decision",
  "domain": "crm",
  "decision": "allow" | "deny_403" | "admin_bypass",
  "outcome": "allowed" | "forbidden" | "unauthorized" | "bypass_granted",
  "requiredPermission": "crm.leads:read",
  "granted": true,
  "source": "shavi:crm-scope-guard",
  "policyVersion": "core-audit-emission-v1",
  "correlationId": "<X-Correlation-Id>",
  "actor": {
    "subject": "<bassan crm token sub — opaque id only>",
    "orgId": "<tenant organizationId if derivable — opaque id only>",
    "isAdminBypass": false
  },
  "resource": "POST /api/customer/v1/crm/contacts",
  "emittedAt": "2026-07-19T12:00:00.000Z",
  "metadata": {
    "rule": "CRM_SCOPE_MISSING | CRM_TOKEN_MISSING | CRM_SCOPE_DENIED | CRM_ADMIN_BYPASS",
    "bypassReason": "crm-admin-superuser-parity"
  }
}
```

Field notes:
- `decision` = normalized verdict (`allow` / `deny_403` / `admin_bypass`); `outcome` = resulting HTTP state. Both sent for clarity (Kernel MAY collapse to one).
- `requiredPermission` uses the **ratified colon form** (`crm.leads:read`, `crm.leads:write`, `crm.tasks:read`, `crm.tasks:write`) — see `crm-claims.ts` `CrmPermission`. The `crm.*` shorthand in the task maps to the `crm.leads` / `crm.tasks` × `read` / `write` namespace.
- `admin_bypass` = the `CrmScopeGuard` Admin/superuser scope-bypass parity (`isCrmAdmin()` in `crm-claims.ts`, mirroring Bassan `permissions.guard.ts` L72-74). Auth is never bypassed — only the scope check.
- `actor.subject` = the verified Bassan `crm.*` JWT `sub` (opaque). If unavailable (missing token → 401), `actor.subject = "anonymous"` and `decision = deny_403` / `outcome = unauthorized`.
- `metadata` is OPTIONAL and MUST remain PII-free; only non-sensitive fields (`rule`, `bypassReason`) allowed.

### 16.5 Fail-Closed Semantics (MANDATORY — mirror `rbac.guard.ts` `auditViolation`)
The authorization decision is computed FIRST and is **INDEPENDENT** of audit delivery. Audit is strictly best-effort:
1. The guard finalizes its decision (allow → `return true`; deny → `throw 401/403`) and emits the audit event as a **fire-and-forget** call: `void this.audit.emitCrmDecision(event).catch(() => { /* logged inside sink */ })`. The guard **NEVER awaits** the emit for the auth response.
2. A transient audit failure (network error, timeout, Kernel 5xx, **or Kernel returning 401/403 on the audit endpoint itself**) MUST NEVER:
   - flip a `deny` → `allow`,
   - add latency that opens/weakens the auth path,
   - surface an error to the client,
   - throw from the guard.
3. On audit failure the sink logs server-side only: `logger.error({ message: 'CRM audit emit failed (fail-closed maintained)', correlationId, errorCode: 'CRM_AUDIT_EMIT_FAILED' })` — **NO JWT, NO PII, NO error-object dump** (mirror `redactSensitiveData` in `CoreClient`).
4. If the Suite S2S signing material is missing (env unset), the sink skips emission + logs a warn; the guard's own decision is **UNCHANGED** (the crm guard's decision is claims-derived locally and does not depend on Kernel).
5. **NO retry loop** that could leak or hang the request. An optional bounded background retry (max 2, 250ms/1s, hard total ≤ 5s) is permitted ONLY as fire-and-forget durability; it MUST NOT be awaited by the guard and MUST NOT affect the auth decision.
6. The audit endpoint is S2S-protected; if Core rejects the emit with 401/403, that is an **audit-pipeline fault, NOT an auth fault** — silently logged, never propagated to the crm decision.

### 16.6 Sink Client Location (SHAVI)
- **File**: `modules/platform-admin/src/customer/auth/bassan-crm/bassan-crm-audit.ts`.
- **Class**: `BassanCrmAuditSink` (`@Injectable()`), exposing `emitCrmDecision(event: CrmAuditEvent): Promise<void>`.
- **Instantiated ONLY after this contract is ratified AND the Kernel endpoint exists.** Until then, the guard emits NOTHING (current behavior by design).
- **Dependencies**: `CORE_API_BASE_URL` env, `PLATFORM_ADMIN_JWT_PRIVATE_KEY_PEM_B64` + `PLATFORM_ADMIN_JWT_KID` env (existing), native `fetch`, `crypto`. **NO new npm dependency.**
- MUST call `assertCoreEndpointAllowed('POST', '/api/v2/admin/audit/events')` before the fetch (drift guard).

### 16.7 Constraints (from remediation — MUST HOLD)
- No Bassan/Kernel code touched by SHAVI (Kernel implements the endpoint per this contract).
- No new npm dependency (Node `crypto` + native `fetch` only).
- Delegation pattern preserved: **NO local `crm.leads` / `crm.tasks` permission rows** created by the sink; the event is derived purely from verified claims.
- MUST NOT emit to SHAVI-local `AuditService`.

### 16.8 Stop Rules (additive)
Execution MUST STOP if:
- The crm audit emit targets any endpoint other than `POST /api/v2/admin/audit/events` (allowlist assertion).
- The emit uses the Bassan `crm.*` JWT or a user/session token for outbound auth (must use Suite S2S).
- Audit failure is allowed to flip a `deny` → `allow` or is propagated to the client.
- The sink writes local `crm.*` permission rows.
- PII is placed in the audit payload.

---

## 17) Amendment Record — Audit Emission (APPROVED, ratified 2026-07-19)

**Author**: Hermes Agent — shavi-architecture (Shavi autonomous engineer). **Date**: 2026-07-19.
**Trigger**: G-SEC-2 remediation **t_bd05896c** / security gate **t_9d8689f9** criterion 4 — `CrmScopeGuard` must emit every `crm.*` decision to Bassan Kernel central audit (not the SHAVI-local `AuditService`). Verified gap: no Bassan audit sink/transport/client existed anywhere in `suite-shavi`; contracts named Kernel as audit owner ("black box") but defined no emission path.
**Change (APPROVED — ratified 2026-07-19)**:
- New authorized Core endpoint `POST /api/v2/admin/audit/events` (S2S) — §12 row + §16.
- Full Suite→Kernel audit emission contract: transport (HTTPS/S2S POST), auth (reuse S2S Model B, dedicated emitter principal), payload schema (NON-PII crm.* decision event), fail-closed semantics (mirror `rbac.guard.ts`), sink location (`bassan-crm-audit.ts`).
- No frozen-architecture change: extends Contract A within the existing S2S Model B; requires only a Contract A version bump (v2 → v3) + Governance approval — no ADR-013/014/015 freeze exception needed.
**Status**: ✅ **RATIFIED by Governance Authority (Founder) on 2026-07-19.** Binding as Contract A **v3 (APPROVED)**. §12/§16/§17 PROPOSED markers flipped to active; version bumped v2 → v3. Backend (t_7cc0bbe7) may now wire `CrmScopeGuard` → central audit sink; security gate **t_9d8689f9** criterion 4 may proceed after wiring.
