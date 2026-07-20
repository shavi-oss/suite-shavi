# Suite — INTEGRATION_CONTRACT_WORKSPACE (v1 — APPROVED)

> **ACTIVE — BINDING INTEGRATION CONTRACT.** Companion to `INTEGRATION_CONTRACT_CORE.md` (Contract A: Bassan Suite ↔ Bassan Kernel S2S). This document defines the **Bassan Workspace ↔ Bassan Suite** boundary via `/api/customer/*`.
> Written by Hermes Agent (Shavi autonomous engineer) after architecture review on 2026-07-18. Approved by Governance Authority on 2026-07-18.
> Supersedes: — . Locks the Phase 0 gate (per `governance/PRODUCT_ARCHITECTURE_MAPPING.md`).

## Document Control

| Attribute      | Value                                            |
| -------------- | ------------------------------------------------ |
| Document Title | INTEGRATION_CONTRACT_WORKSPACE                   |
| Repo           | Suite (Layer / Product Repo)                     |
| Version        | **v1 (APPROVED)**                                |
| Status         | ACTIVE — BINDING INTEGRATION CONTRACT            |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST          |
| Authority      | Governance Authority (Founder)                   |
| Effective Date | 2026-07-18                                       |
| Supersedes     | —                                                |
| Companion      | `INTEGRATION_CONTRACT_CORE.md` (Contract A)      |

---

## 0) Context & Relationship to Contract A

- **Contract A** (APPROVED) locks **Bassan Suite ↔ Bassan Kernel** (S2S, RS256/JWKS).
- **Contract B** (this document) locks **Bassan Workspace ↔ Bassan Suite** via `/api/customer/*`.
- The **Bassan Workspace** is the customer-facing product UI (CRM / ERP / Helpdesk / Automation / AI / Dashboards / Apps / Settings). In Contract A's terminology it is the "UI" — but for the customer product, not the platform-admin console.
- **The Workspace MUST NOT call Bassan Kernel directly.** All Kernel access is brokered by Bassan Suite. The Suite is the ONLY component permitted to hold/use Kernel tokens (user-scoped or S2S).

---

## 1) Purpose & Contract Philosophy

### 1.1 Purpose
Defines the binding contract for how Bassan Workspace integrates with Bassan Suite:
- Allowed interaction patterns (Workspace → Suite `/api/customer/*` only)
- Identity, session, and tenant alignment
- Authentication & authorization (Workspace session → Suite brokers Kernel JWT)
- Data flow boundaries
- Error handling & resilience
- Observability requirements

### 1.2 Contract-First Philosophy
- **MUST**: All Workspace ↔ Suite integration MUST be defined here BEFORE the Workspace build starts (Phase 0 gate).
- **MUST**: Suite is a black box to Workspace; Workspace MUST NOT rely on Suite internals or Kernel internals.
- **MUST**: Any change requires updating this contract + Governance approval.
- **MUST NOT**: Implement Workspace integrations outside this contract.

---

## 2) Definitions

| Term                | Definition                                                                                                                              |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Bassan Workspace** | Customer-facing product UI. Calls ONLY Suite `/api/customer/*`. MUST NOT hold Kernel tokens.                                          |
| **Bassan Suite**     | Control plane / gateway. Owns `/api/customer/*`; brokers Kernel access via Contract A.                                                 |
| **Bassan Kernel**    | Core engine (auth / RBAC / tenant / workflow / event / audit). Black box to Workspace.                                                 |
| **Session JWT**      | JWT issued by Suite to an authenticated Workspace (customer) user. Claims `sub`, `email`, `organizationId`. Verified by Suite.          |
| **Broker Kernel JWT**| Kernel-user-scoped JWT that Suite mints (via Kernel JWT broker, Contract A §5.1) when it must call Kernel on a Workspace request's behalf. NEVER leaves Suite. |
| **Tenant Context**   | `organizationId` derived from the Session JWT claim; never from a raw header the Workspace can spoof.                                  |
| **Correlation ID**   | Unique request id propagated Workspace → Suite → Kernel for tracing (Suite-generated).                                                 |

---

## 3) Allowed Interaction Patterns (Strict)

### 3.1 Workspace → Suite `/api/customer/*` ONLY
- **MUST**: All Workspace requests go to Suite `/api/customer/*`.
- **MUST NOT**: Workspace calls Bassan Kernel APIs directly.
- **MUST NOT**: Workspace possesses/uses Kernel tokens (user or S2S).
- **MUST NOT**: Workspace calls Suite operator/platform-admin endpoints (`/api/v1/organizations`, `/api/v2/admin/*`) — those are operator-only (Contract A).

### 3.2 Suite → Kernel (broker only)
- Suite uses Contract A (S2S or user-scoped Kernel JWT) to reach Kernel on a Workspace request's behalf. Workspace never sees these tokens.

### 3.3 No Kernel DB Access
- **MUST NOT**: Workspace or Suite accesses Kernel DB directly. All data via Kernel APIs through Suite.

---

## 4) Identity, Session & Tenant Alignment

### 4.1 Session & Tenant Rules
- Workspace user authenticates to Suite; Suite issues a **Session JWT** scoped to `organizationId`.
- `organizationId` is taken from the **Session JWT claim ONLY**. No `X-Organization-Id` / `X-Tenant-Id` headers trusted from Workspace.
- Suite maps Suite `orgId` ↔ Kernel `orgId` (per Contract A §4); Workspace is unaware of Kernel org ids.

### 4.2 Fail-Closed Rules
- Missing/ambiguous session or tenant → Suite DENIES (safe error).
- **MUST NOT**: Suite guesses/infers tenant for a Workspace request.
- **MUST**: Suite validates session + tenant before any Kernel broker call.

---

## 5) Authentication & Authorization Model

### 5.1 Workspace → Suite (Session JWT)
- Workspace sends Session JWT (Bearer) or session cookie to `/api/customer/*`.
- Verified by Suite `SessionGuard`. 401/403 → DENY immediately (fail-closed). No retry/refresh loop that leaks tokens.

### 5.2 Suite → Kernel Broker (Kernel JWT)
- When a Workspace request needs Kernel data, Suite mints a Kernel-user-scoped JWT via the **Kernel JWT broker** (Contract A §5.1), scoped to the verified `organizationId`.
- The Broker Kernel JWT **MUST NEVER** reach Workspace or logs.

### 5.3 Never Expose to Workspace
- Kernel tokens (user or S2S) MUST NEVER reach Workspace. Auth tokens MUST NEVER appear in logs/error messages.

---

## 6) Data Flow Rules

### 6.1 Cacheable in Workspace/Suite
- Non-sensitive reference data explicitly authorized; customer session state.

### 6.2 Source of Truth
- **Kernel**: user auth, org records, audit, domain data.
- **Suite**: customer API surface, org mapping, product config.
- **Workspace**: presentation state only; MUST NOT store Kernel-owned sensitive data.

---

## 7) Error Handling & Resilience
Reuse Contract A §7:
- Bounded retries (max 3, exp backoff 1s/2s/4s) on **5xx / network ONLY**. **NEVER** retry 4xx/401/403.
- Timeouts: GET 10s, write 30s.
- Circuit breaker: 5 consecutive failures → open 60s. Log state changes.

---

## 8) Observability
- Correlation ID generated Suite-side, propagated via `X-Correlation-Id`.
- Log: endpoint, method, status, duration, `orgId`. **NEVER** log tokens/PII.

---

## 9) Versioning Strategy
- Versioned via git tags (`workspace-integration-contract-v1`).
- Endpoint/auth change → new version + written justification + Governance approval.
- Customer API prefix: `/api/customer/v1`.

---

## 10) Stop Rules
Execution MUST STOP if:
- Workspace calls Kernel directly or holds a Kernel token.
- Workspace calls Suite operator endpoints (`/api/v2/admin/*`, `/api/v1/organizations`).
- Suite sends a Kernel token to Workspace.
- Suite trusts a tenant header from Workspace (`X-Organization-Id` / `X-Tenant-Id`).
- Tenant ambiguity handled fail-open.
- Auth tokens logged or in error messages.
- Workspace stores Kernel-owned sensitive data without authorization.

---

## 11) Acceptance Criteria
Contract is ACTIVE/BINDING when ALL true:
- [x] Workspace → Suite `/api/customer/*` only defined.
- [x] Session auth model defined; tenant from JWT claim only.
- [x] Broker Kernel JWT model defined (Suite-only, never to Workspace).
- [x] Fail-closed rules for session/tenant.
- [x] Error/resilience/observability reuse Contract A.
- [x] No contradictions with Contract A, `EXECUTION_AUTHORITY.md`, `ARCHITECTURAL_LAWS.md`, `SECURITY_BASELINE.md`.
- [x] Governance Authority reviewed + approved.

---

## 12) Authorized Customer Endpoints (v1 — initial catalog)

> The full request/response schema per capability is specified in the **Screen Responsibility Matrix (SSOT, `governance/PRODUCT_ARCHITECTURE_MAPPING.md` §5)** before the Bassan Workspace build starts (Phase 0 sign-off). This contract locks the boundary, auth, tenant, and error model; the Matrix enumerates per-screen payloads.

| Capability              | Method | Endpoint                                  | Auth    | Purpose                                  |
| ----------------------- | ------ | ----------------------------------------- | ------- | ---------------------------------------- |
| Auth — session login    | POST   | `/api/customer/v1/auth/session`           | —       | Workspace user login → Session JWT       |
| Auth — session refresh  | POST   | `/api/customer/v1/auth/refresh`           | Session | Rotate Session JWT                       |
| Auth — logout           | POST   | `/api/customer/v1/auth/logout`            | Session | Invalidate session                       |
| Profile / me            | GET    | `/api/customer/v1/me`                     | Session | Current user + org context              |
| CRM — list contacts     | GET    | `/api/customer/v1/crm/contacts`           | Session | List contacts (tenant-scoped)            |
| CRM — create contact    | POST   | `/api/customer/v1/crm/contacts`           | Session | Create contact                           |
| ERP — *                  | (TBD per Screen Matrix) | `/api/customer/v1/erp/*`          | Session | enumerated in SSOT                       |
| Helpdesk — *            | (TBD per Screen Matrix) | `/api/customer/v1/helpdesk/*`      | Session | enumerated in SSOT                       |
| Automation — *          | (TBD per Screen Matrix) | `/api/customer/v1/automation/*`    | Session | enumerated in SSOT                       |
| AI — *                  | (TBD per Screen Matrix) | `/api/customer/v1/ai/*`            | Session | enumerated in SSOT                       |
| Dashboards — *          | (TBD per Screen Matrix) | `/api/customer/v1/dashboards/*`    | Session | enumerated in SSOT                       |
| Apps — *                | (TBD per Screen Matrix) | `/api/customer/v1/apps/*`          | Session | enumerated in SSOT                       |
| Settings — *            | (TBD per Screen Matrix) | `/api/customer/v1/settings/*`      | Session | enumerated in SSOT                       |

---

## 13) Governance — Single Source of Truth
- **Canonical file**: `suite-shavi/INTEGRATION_CONTRACT_WORKSPACE.md` (this content).
- **Companion / authority**: `INTEGRATION_CONTRACT_CORE.md` (Contract A).
- All changes go through the canonical file + version bump + Governance approval.
- Per-feature payloads live in the Screen Responsibility Matrix (SSOT), not here.

---

## 14) Signature
- **Approved By**: Governance Authority (Eslam Abdelshafi)
- **Date**: 2026-07-18
- **Status**: ACTIVE — BINDING INTEGRATION CONTRACT
