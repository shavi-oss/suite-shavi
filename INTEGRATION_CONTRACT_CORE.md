# Suite — INTEGRATION_CONTRACT_CORE (v2 — APPROVED)

> **ACTIVE — BINDING INTEGRATION CONTRACT.** Supersedes v1 (root 2026-01-26 + 2026-02-06 governance copy).
> Written by Hermes Agent after code verification on 2026-07-11. Approved by Governance Authority on 2026-07-11.

## Document Control

| Attribute      | Value                                            |
| -------------- | ------------------------------------------------ |
| Document Title | INTEGRATION_CONTRACT_CORE                        |
| Repo           | Suite (Layer / Product Repo)                     |
| Version        | **v2 (APPROVED)**                                |
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
2. **Bug found**: the org-mapping flow (`POST /api/platform-admin/org-mappings`) mints an S2S token, then `validateOrganizationExists()` forwards that S2S token to Core `GET /api/v1/organizations/:id`, guarded by `JwtAuthGuard` + `TenantGuard` (requires a USER JWT with `organizationId`). The S2S token has no `orgId` → rejected (401/404). Result: platform-admin org-linking is currently **broken (fail-closed)**.
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

> **CRITICAL**: Platform-admin validation MUST use `GET /api/v2/admin/organizations/:id` (S2S). The tenant endpoint `GET /api/v1/organizations/:id` MUST NOT be used for platform-admin validation — it requires a user JWT with `orgId` and will reject the S2S token (the current bug).

---

## 13) Governance — Single Source of Truth
- **Canonical file**: `suite-shavi/INTEGRATION_CONTRACT_CORE.md` (this v2 content).
- The duplicate at `modules/platform-admin/governance/contracts/INTEGRATION_CONTRACT_CORE.md` is **DEPRECATED** — MUST be removed or replaced by a pointer to the canonical file to prevent future drift.
- All changes go through the canonical file + version bump + Governance approval.

---

## 14) Signature
- **Approved By**: Governance Authority (Eslam Abdelshafi)
- **Date**: 2026-07-11
- **Status**: ACTIVE — BINDING INTEGRATION CONTRACT
