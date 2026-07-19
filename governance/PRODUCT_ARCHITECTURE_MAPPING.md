# Bassan Product Architecture Mapping
**Bassan Kernel · Bassan Suite (Control Plane) · Bassan Workspace (Customer Product) — Parallel Build**

> Status: SSOT v1.0 — approved by Founder 2026-07-18.
> Naming (SETTLED 2026-07-18): **Bassan** = the product/system customers use (Kernel + Suite + Workspace). **Shavi** = the company/brand house that designed and operates Bassan (appears as owner, not a runtime layer).
> Source of truth: Founder directive "HERMES — PRODUCT ARCHITECTURE DIRECTIVE" + canonical architecture (Bassan = product / Experience + Kernel + Suite; Shavi = company; ERPNext = sole Biz Engine).

## 1. Exact Relationship Between the Three Layers

```
Customer (browser)
      │  HTTPS — only ever talks to Bassan Suite
      ▼
┌──────────────────────────────────────────────────┐
│  BASSAN SUITE  (Platform Control Plane / Gateway) │
│  • Platform mgmt: companies, plans, billing       │
│  • Ops / Support / Monitoring / Config             │
│  • Feature Flags · AI Keys (Vault) · Marketplace   │
│  • Customer API gateway  : /api/customer/*         │
│  • Admin API             : /api/platform-admin     │
└──────────────────────────────────────────────────┘
      │  S2S (RS256 / JWKS, contract-enforced)
      ▼
┌──────────────────────────────────────────────────┐
│  BASSAN.os  (Kernel)                              │
│  Auth · Authz · Identity · RBAC · Tenant Isolation│
│  Workflow Engine · Event Backbone · Context       │
│  Audit · Policies                                 │
│  (NO business logic, NO UI)                       │
└──────────────────────────────────────────────────┘
      │  Adapters (Suite-owned)
      ▼
┌──────────────────────────────────────────────────┐
│  ENGINES (OSS, wrapped + rebranded as Bassan)     │
│  ERPNext · Chatwoot · n8n · Evolution · …         │
└──────────────────────────────────────────────────┘
```

- Dependency is **one-way downward**. Bassan Workspace → Bassan Suite → Bassan Kernel → Engines. Nothing below calls upward directly.
- **Bassan Suite is the ONLY gateway** to Bassan Kernel. No Bassan Workspace module may call Bassan Kernel directly.
- **Bassan Workspace is a pure product surface**: renders company screens, consumes Bassan Suite APIs, zero platform-admin knowledge.

## 2. Responsibility Boundaries (no overlap)

| Concern | Bassan (Kernel) | Bassan Suite | Bassan Workspace | Engine |
|---|---|---|---|---|
| Identity / Login / JWT | owns + enforces | brokers to Bassan Workspace | consumes session | — |
| RBAC / Permissions | model + enforce | assigns roles (admin UI) | consumes (own scope) | — |
| Tenant Isolation | owns | passes org context | scoped to its org | per-tenant mount |
| Workflow Engine | owns | triggers via API | compose/view UI | — |
| Event Backbone | owns | subscribes / monitors | emits via Bassan Suite | emits |
| Audit | core audit | platform audit | triggers actions | — |
| Companies / Plans / Billing | tenant record | owns all | billing settings screen | payment (Paymob) |
| Feature Flags / Module toggles | tenant config | owns | reads enabled set | — |
| AI Provider / LLM Keys | — | vault + owns | AI Studio screen | LLM call |
| Engines (ERPNext/Chatwoot/n8n/Evo) | — | adapters + provisioning | renders wrapped UI | owns business data |
| CRM / ERP / Helpdesk UI | — | config / flags | owns UX + render | data |
| Provisioning | creates org+user | orchestrates | ready when provisioned | spun up per tenant |

**Rule:** Bassan Kernel never holds business data. Bassan Suite never holds a company's business records. Bassan Workspace never manages the platform. Engines own business data.

## 3. Data Flow (key paths)

- **Auth:** Bassan login → Bassan Suite `/auth` → Bassan Suite calls Bassan Kernel (issue JWT) → Bassan Suite returns session → Bassan Workspace.
- **Company Creation:** Bassan Suite (admin) → Bassan Kernel (create org + owner + roles) → Bassan Suite provisions Bassan Workspace + spins Engines (ERPNext / Chatwoot / Evolution / n8n per tenant) → status returned to Bassan Suite dashboard.
- **CRM action:** Bassan CRM screen → Bassan Suite (validate perm + tenant) → Bassan Kernel (RBAC check) → Engine (ERPNext CRM) → response up to Bassan Suite → Bassan Workspace renders.
- **Monitoring:** Bassan Kernel + Engines emit events → Bassan Suite collects → Bassan Suite health / monitoring dashboard + alerts.
- **Support:** Bassan "Hermes Customer" → Bassan Suite support / tickets → Bassan Suite audit.

## 4. Parallel Build Strategy

Two workstreams, zero conflict — boundaries are contract-locked first.

- **Contract A (locked):** Bassan Suite ↔ Bassan Kernel S2S — defined in `INTEGRATION_CONTRACT_CORE.md` + `core.client.ts` (allowlisted endpoints, RS256/JWKS).
- **Contract B (defined in Phase 0):** Bassan Workspace ↔ Bassan Suite `/api/customer/*` — request/response shape, auth (session → Bassan Kernel JWT broker), tenant header, error model. Reuses Bassan Suite `UI_FETCH_CONTRACT.md` patterns.
- **Screen Responsibility Matrix (§5) = SSOT.** Every feature = { Bassan Workspace part, Bassan Suite part (if any), Bassan Kernel link, Engine link }.
- **Bassan Suite workstream:** completes Bassan Suite UI from existing `governance/design` system (configure, don't redesign); adds `/api/customer/*` gateway; builds platform modules.
- **Bassan Workspace workstream:** builds shell + screens strictly against Contract B.
- Both share TypeScript contract types → no drift.

## 5. Bassan Screen ↔ Bassan Suite Counterpart Mapping

| Bassan Screen | Bassan Suite Counterpart (control) | Bassan Kernel | Engine |
|---|---|---|---|
| CRM | Module enable / Feature Flag | RBAC (CRM perm) | ERPNext CRM |
| ERP | Module enable / Feature Flag | RBAC | ERPNext |
| Helpdesk | Channel config (WA / Evolution) | RBAC | Chatwoot + Evolution |
| Automation | n8n connection + creds (Vault) | Workflow Engine | n8n |
| AI Studio | AI Provider / LLM Keys (Vault) | Context + Audit | LLM |
| Dashboards | Usage + Monitoring config | Audit / metrics | — |
| Marketplace | Plugin mgmt + Licenses | Feature Flags | — |
| Apps | App catalog + enabled modules | Tenant app config | — |
| Settings | Company / Branding / White-label / Domain | Tenant config | — |
| Hermes Customer | Support tickets / CS config | Audit | — |
| Billing (Settings) | Plans / Subscription / Invoices | Tenant + enforcement | Paymob |

## 6. Engine Embedding Strategy (DECIDED: Hybrid)

Open-source engines are NOT rebuilt. They run as servers and are surfaced inside Bassan Workspace, rebranded as Bassan.

- **iframe (wrapped in Bassan shell + theming)** for complex engines: full ERPNext module, Chatwoot inbox. Fast, full functionality day one; internal engine chrome partially visible (themed).
- **API proxy (pull data, render Bassan-styled)** for simple surfaces: dashboards, quick widgets, summary cards. Full Bassan look; more build effort.
- **Why Hybrid:** fastest path to a complete product while keeping a consistent Bassan feel where it matters most.
- Bassan Suite owns the bridge (adapters + Vault): provisions per-tenant engine instances, injects credentials securely, toggles via Feature Flags.

## 7. Execution Plan

- **Phase 0 — Lock contracts (this doc + Contract B).** Screen Responsibility Matrix is SSOT. No screen built before its Bassan Suite counterpart + Bassan Kernel/Engine deps are declared.
- **Phase 1 — Parallel build:**
  - *Bassan Suite:* finish Bassan Suite UI from `governance/design` (configure, no redesign); add `/api/customer/*` gateway; build platform modules (billing / flags / AI keys / infra / marketplace); build engine adapters + provisioning.
  - *Bassan Workspace:* build shell + screens against Contract B; embed engines via §6 Hybrid.
- **Phase 2 — Vertical feature slices:** each feature shipped with Bassan Suite part + Bassan Workspace part + Bassan Kernel link tested together.
- **Phase 3 — Brand alignment:** design assets already branded `BASSAN` (the product name) — keep as-is. Add **Shavi** as the company/owner brand where appropriate (footer, legal, about, marketing site `shavi-MINS-suite`). No token/logo redesign needed.

## 8. Open Items

- **Brand (SETTLED by Founder 2026-07-18):** product/system name = **Bassan** (customers use Bassan; design assets `bassan-*.png` are correct as the product brand). **Shavi** = the company/brand house that designed and operates Bassan — appears as owner (footer, legal, marketing site `shavi-MINS-suite`), not as a runtime layer.
- **Contract B detail:** full `/api/customer/*` request/response schema to be specified before Bassan Workspace build starts (depends on Phase 0 sign-off).
- **RLS:** DB-level tenant isolation (PostgreSQL RLS) planned in security phase (M10) as defense-in-depth on top of app-level `organizationId`.
