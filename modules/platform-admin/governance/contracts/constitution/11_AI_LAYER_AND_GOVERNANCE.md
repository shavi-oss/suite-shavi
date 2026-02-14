# ULTRA SPEC PART 2 — 11 AI LAYER & GOVERNANCE (Deep · Execution Canonical)

**Last Updated:** 2026-02-01  
**Status:** CANONICAL (AI Integration, Safety & Governance Layer)  
**Depends on:** `01_SCHEMAS.md`, `05_WORKERS_AND_JOBS.md`, `06_EVENTS_AND_OBSERVABILITY.md`, `10_AUTOMATION_AND_WORKFLOWS.md`

> **🔴 SCOPE NOTICE:** This describes **SUITE-LAYER** AI features (future). Core v1 has NO AI integration. See: `backend/governance/core-contract/CORE_CONTRACT_V1_EXTRACT.md`

> **Meaning:** This document defines how AI is safely integrated into Bassan Suites:
>
> - provider abstraction
> - prompt governance
> - budget & cost control
> - safe tool usage
> - knowledge retrieval integration
> - outbound action safety

AI must accelerate users, not introduce risk.

---

# 0) AI Governance Principles (Non-Negotiable)

## 0.1 Human Control

AI may:

- suggest
- summarize
- classify
- draft

AI must NOT:

- autonomously perform irreversible actions
- send outbound messages without approval
- bypass permissions or policy gates

## 0.2 Budget & Cost Safety

AI usage must always respect:

- tenant budgets
- hard caps
- per-feature limits

Exceeded budgets must block execution safely.

## 0.3 Tenant Isolation

AI context and knowledge retrieval must never cross tenant boundaries.

## 0.4 Observability

All AI usage must be logged:

- tokens used
- model used
- cost estimation
- request origin

---

# 1) AI Architecture Overview

Flow:
User/API → AI Gateway → Provider Adapter → Model → Response → Post-processing

Components:

- AI Gateway Service
- Provider adapters
- Prompt manager
- Tool executor
- Knowledge retrieval service
- Budget manager

---

# 2) Provider Abstraction

Supported providers:

- OpenAI
- Anthropic
- Local models
- Future providers

Each adapter implements:

- chatCompletion()
- embeddings()
- moderation()
- healthcheck()

Switching provider must not change suite logic.

---

# 3) Model Routing Strategy

Requests routed by:

- feature type
- cost policy
- latency requirements

Examples:

- summaries → cheap model
- reasoning → advanced model
- embeddings → embedding model

Fallback allowed when provider degraded.

---

# 4) Prompt Governance

## 4.1 Prompt Registry

Prompts stored as versioned records:

- id
- name
- version
- content
- status (draft/approved/deprecated)

## 4.2 Approval Workflow

Sensitive prompts require approval:

- marketing prompts
- automated reply prompts
- customer-facing generation

## 4.3 Prompt Versioning

Editing approved prompt creates new version.

---

# 5) Tool Execution Safety

AI tools limited to allowlist:

- search contacts
- summarize conversation
- create draft response
- classify intent

Tools cannot:

- delete records
- modify billing
- change permissions

Tool calls validated before execution.

---

# 6) Knowledge Base Retrieval

AI knowledge integration:

- documents indexed
- embeddings stored
- retrieval scoped per tenant

Flow:
query → retrieve docs → inject context → model response

Sensitive docs filtered via permissions.

---

# 7) Budget & Usage Control

## 7.1 Budget Types

- per-tenant daily/monthly
- per-feature budgets
- per-user quotas (optional)

## 7.2 Enforcement

Before call:

- estimate tokens
- compare against remaining budget
  If exceeded:
- reject safely

## 7.3 Usage Recording

Store:

- tokens in/out
- model
- cost estimate
- workflow reference if automated

---

# 8) Outbound Safety Rules

AI suggestions for outbound messages must:

- be approved by human OR
- pass automation approval flow

Never auto-send AI-generated outbound messages without governance.

---

# 9) Security & Privacy

Rules:

- redact PII in prompts unless required
- do not send secrets to providers
- avoid storing raw prompts containing sensitive info
- logs store hashed or redacted content

---

# 10) Observability & Metrics

Events:

- ai.chat.started
- ai.chat.completed
- ai.chat.blocked
- ai.usage.recorded

Metrics:

- tokens usage
- latency
- provider errors
- budget exceed events

Dashboards:

- cost by tenant
- usage by feature
- error rate per provider

---

# 11) Failure Handling

If provider fails:

- retry with backoff
- fallback provider if configured
- mark degraded if persistent

If unsafe output detected:

- block output
- log moderation event

---

# 12) Stop Conditions

- tenant isolation violation
- prompt injection detected
- tool misuse attempt
- budget exceeded bypass attempt

Result:
stop_condition_triggered

---

# 13) Implementation Checklist

- [ ] Provider abstraction implemented
- [ ] Budgets enforced before execution
- [ ] Prompts versioned & approved
- [ ] Tool calls validated
- [ ] Knowledge retrieval tenant-safe
- [ ] Usage metrics recorded
- [ ] Unsafe outputs blocked

**END — 11 AI LAYER & GOVERNANCE**
