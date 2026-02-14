# ULTRA SPEC PART 2 — 13 BILLING, QUOTAS & USAGE CONTROL (Deep · Execution Canonical)

**Last Updated:** 2026-02-01  
**Status:** CANONICAL (Usage Metering, Quotas, Plans & Billing Controls)  
**Depends on:** `01_SCHEMAS.md`, `05_WORKERS_AND_JOBS.md`, `06_EVENTS_AND_OBSERVABILITY.md`, `11_AI_LAYER_AND_GOVERNANCE.md`, `12_ANALYTICS_AND_REPORTING_ENGINE.md`

> **🔴 SCOPE NOTICE:** This describes **SUITE-LAYER** billing/quotas (future). Core v1 has NO billing or quota system. See: `backend/governance/core-contract/CORE_CONTRACT_V1_EXTRACT.md`

> **Meaning:** This document defines how system usage is measured, limited, billed, and enforced across all Suites.
> It ensures fair usage, protects infrastructure, and enables commercial plans and future monetization.

Subsystem responsibilities:

- usage metering
- quota enforcement
- plan definition
- billing integration readiness
- overuse prevention
- tenant usage visibility

---

# 0) Billing & Usage Principles (Non-Negotiable)

## 0.1 Tenant-Level Enforcement

All quotas and billing enforcement apply at:

```
organizationId
```

No usage mixing between tenants.

## 0.2 Fail-Closed on Limits

If quota or hard limit exceeded:

- new operations must be blocked safely
- no silent overuse allowed

## 0.3 Meter First, Bill Later

Usage tracking must work even before billing integration exists.

## 0.4 Separation of Concerns

Usage engine ≠ payment processor.
System must function with:

- internal billing
- external billing provider
- manual billing

---

# 1) Core Concepts

## 1.1 Plan

A plan defines limits and features.

Examples:

- Free
- Starter
- Growth
- Enterprise

Plan attributes:

- included quotas
- feature flags
- support level
- billing interval (future)

## 1.2 Subscription

Tenant subscription links organization to plan.

Fields:

- planId
- startAt
- endAt
- status (active, suspended, cancelled, trial)

## 1.3 Usage Meter

Records actual consumption per feature.

---

# 2) Usage Categories (Baseline)

## 2.1 Messaging Usage

Measured:

- outbound messages
- inbound messages processed
- broadcast volume

Limits:

- per minute/hour/day/month

## 2.2 CRM Usage

Measured:

- contacts count
- leads count
- deals count
- storage usage

## 2.3 Automation Usage

Measured:

- workflow runs
- steps executed

## 2.4 AI Usage

Measured:

- tokens consumed
- requests count
- model usage cost estimation

## 2.5 Storage Usage

Measured:

- file storage size
- number of stored objects
- exports generated

## 2.6 Analytics Usage

Measured:

- report executions
- export volume
- dashboard queries

---

# 3) Usage Recording Pipeline

Flow:
Operation → emit usage event → aggregation job → usage counters updated.

Usage events examples:

- message.sent
- ai.tokens.used
- export.generated
- workflow.run.completed

Counters stored aggregated per:

- tenant
- day/month
- usage category

---

# 4) Quota Enforcement

## 4.1 Enforcement Points

Before executing heavy operations:

- message sending
- AI generation
- exports
- automation runs

System checks:

```
currentUsage + plannedUsage <= quota
```

If false:

- block operation
- return quota exceeded error

## 4.2 Soft vs Hard Limits

Soft:

- allow temporary overage with warning.

Hard:

- strict block.

Policy configurable per plan.

---

# 5) Plan Definition Model

Example structure:

```json
{
  "plan": "starter",
  "limits": {
    "messagesPerMonth": 5000,
    "contacts": 2000,
    "aiTokens": 1000000,
    "storageGB": 5
  },
  "features": ["automation.basic", "analytics.standard", "ai.assistant"]
}
```

Plans versioned and immutable once active.

---

# 6) Feature Flag Integration

Plans enable features:
Examples:

- advanced analytics
- AI assistant
- automation builder
- export features

Feature gating checked at API layer.

---

# 7) Billing Integration Layer

System prepares for:

- Stripe
- Paddle
- manual invoicing
- enterprise contracts

Integration responsibilities:

- subscription sync
- payment status updates
- suspension triggers

Core system continues functioning even if billing provider unavailable.

---

# 8) Suspension & Grace Policies

## 8.1 Suspension States

- grace_period
- restricted_usage
- suspended

## 8.2 Grace Period

Allow continued operation for limited time after payment failure.

## 8.3 Suspension Impact

May block:

- message sending
- exports
- automation runs
  But allow:
- login
- data export
- billing resolution

---

# 9) Usage Visibility

Tenant admins can see:

- monthly usage
- quota consumption
- forecast usage

Dashboards use analytics aggregates.

---

# 10) Security & Abuse Prevention

Controls:

- detect abnormal spikes
- rate-limit abusive tenants
- automated alerts for runaway usage

Abuse events logged.

---

# 11) Observability

Metrics:

- quota blocks count
- usage growth
- plan distribution

Events:

- billing.subscription.changed
- quota.exceeded
- tenant.suspended

---

# 12) Stop Conditions

- usage counter corruption
- cross-tenant usage leak
- billing bypass attempts

Return:
stop_condition_triggered

---

# 13) Implementation Checklist

- [ ] usage events emitted
- [ ] quotas enforced pre-operation
- [ ] plan limits configurable
- [ ] feature flags integrated
- [ ] suspension flows implemented
- [ ] tenant usage dashboards available

**END — 13 BILLING, QUOTAS & USAGE CONTROL**
