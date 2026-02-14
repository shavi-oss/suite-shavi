# ULTRA SPEC PART 2 — 06 EVENTS & OBSERVABILITY (Deep · Execution Canonical)

**Last Updated:** 2026-02-01  
**Status:** CANONICAL (Event Model + Telemetry for Suites)  
**Depends on:** `01_SCHEMAS.md` + `05_WORKERS_AND_JOBS.md`  
**Must not conflict with:** Core Contract lock artifacts under `backend/governance/core-contract/`

> **🔴 SCOPE NOTICE — CRITICAL:**  
> This document describes **SUITE-LAYER OBSERVABILITY** (future implementation).  
> **Core Contract v1 does NOT implement:**
>
> - Event emission system
> - Correlation ID tracking
> - Job/worker metrics
> - Structured event logging
> - EventLog table writes
>
> **Core v1 uses standard NestJS logging only.**  
> Evidence: No EventEmitter, no `@Process` decorators in Core code.  
> See: `backend/governance/core-contract/CORE_CONTRACT_V1_EXTRACT.md`

> **Meaning:** This file defines the unified Event Catalog and Observability requirements (logs/metrics/traces/alerts).
> Events are the backbone for Automation, Analytics, Integrations Webhooks, and operational diagnosis.
> Everything important must be observable and attributable to a tenant and request.

---

# 0) Observability Goals (Non-Negotiable)

## 0.1 Requirements

- Every API request MUST be traceable end-to-end: API → DB → Job → Provider → Webhook.
- No PII in logs by default.
- Every job MUST emit lifecycle events.
- Every outbound provider call MUST emit structured telemetry.
- Every error MUST be classified (see `05_WORKERS_AND_JOBS.md`).

## 0.2 Core Identifiers (Always Present)

All telemetry artifacts (events/logs/traces/metrics tags) must include:

- `organizationId`
- `requestId`
- `actorCoreUserId` (if available)
- `jobId` (if async)
- `correlationId` (optional, derived; may equal requestId)
- `environment` (dev/stage/prod)
- `service` (suite name)

---

# 1) Unified Event Envelope (Canonical)

## 1.1 Event Schema

```json
{
  "eventId": "uuid",
  "eventName": "omni.message.sent",
  "eventVersion": 1,
  "occurredAt": "iso",
  "organizationId": "uuid",
  "actorCoreUserId": "uuid|null",
  "requestId": "string|null",
  "jobId": "uuid|null",
  "source": {
    "service": "omni-suite",
    "host": "instance-id",
    "ip": "redacted|optional"
  },
  "entity": {
    "type": "message",
    "id": "uuid"
  },
  "data": {},
  "meta": {
    "traceId": "string|null",
    "spanId": "string|null",
    "dedupeKey": "string|null",
    "tags": ["..."]
  }
}
```

## 1.2 Versioning Rules

- Backwards compatible additions → keep `eventVersion` the same; prefer additive fields.
- Breaking change (rename/remove) → MUST bump version and publish migration notes.
- If both versions are required: emit both versions for a transition window.

## 1.3 Event Storage (EventLog Table)

- Store in `EventLog` (see `01_SCHEMAS.md`) or an event bus later.
- Minimal retention: 30–90 days (configurable).
- Sensitive payloads should be minimized; store references where possible.

---

# 2) Event Channels / Sinks

## 2.1 Internal Consumers

- Automation triggers
- Analytics pipelines
- Integrations outbound webhooks
- Alerting system
- Operational dashboards

## 2.2 External Sinks (Optional)

- outbound webhooks (customer integrations)
- SIEM export (enterprise)
- data warehouse (BI)

## 2.3 Delivery Guarantees

- at-least-once event delivery is acceptable
- consumers must dedupe via `eventId`
- if event emission fails, the originating operation should still succeed when safe, but must record a local fallback and retry emission job (fail-open **only for telemetry**, never for policy).

---

# 3) Canonical Event Catalog (Baseline)

> This list is intentionally comprehensive for v1. Add events only through governance.

## 3.1 Tenant Events

- `tenant.user.invited`
- `tenant.user.status.changed`
- `tenant.user.updated`
- `tenant.role.created`
- `tenant.role.updated`
- `tenant.role.deleted`
- `tenant.settings.updated`

## 3.2 CRM Events

Contacts:

- `crm.contact.created`
- `crm.contact.updated`
- `crm.contact.merged`
- `crm.contact.deleted` _(soft delete)_
- `crm.contact.identity.added`
- `crm.contact.identity.removed`
- `crm.contact.import.started`
- `crm.contact.import.completed`
- `crm.contact.import.failed`

Leads:

- `crm.lead.created`
- `crm.lead.updated`
- `crm.lead.stage.moved`
- `crm.lead.assigned`
- `crm.lead.archived`

Deals:

- `crm.deal.created`
- `crm.deal.updated`
- `crm.deal.stage.moved`
- `crm.deal.assigned`

Activities:

- `crm.activity.created`
- `crm.activity.completed`
- `crm.activity.updated`

## 3.3 Omnichannel Events

Inboxes:

- `omni.inbox.created`
- `omni.inbox.updated`

Conversations:

- `omni.conversation.created`
- `omni.conversation.assigned`
- `omni.conversation.closed`
- `omni.conversation.reopened`
- `omni.conversation.tagged`

Messages:

- `omni.message.queued`
- `omni.message.sent`
- `omni.message.delivered`
- `omni.message.read`
- `omni.message.failed`
- `omni.message.retry.scheduled`
- `omni.message.retry.exhausted`

Templates:

- `omni.template.created`
- `omni.template.updated`
- `omni.template.submitted`
- `omni.template.approved`
- `omni.template.rejected`
- `omni.template.synced`

Broadcasts:

- `omni.broadcast.created`
- `omni.broadcast.updated`
- `omni.broadcast.scheduled`
- `omni.broadcast.run.started`
- `omni.broadcast.run.progress`
- `omni.broadcast.run.completed`
- `omni.broadcast.run.failed`
- `omni.broadcast.cancelled`

Sequences:

- `omni.sequence.created`
- `omni.sequence.updated`
- `omni.sequence.paused`
- `omni.sequence.resumed`
- `omni.sequence.run.started`
- `omni.sequence.run.completed`
- `omni.sequence.run.failed`

Policy:

- `omni.policy.blocked` _(consent/quiet-hours)_

## 3.4 Integrations Events

- `integrations.config.created`
- `integrations.config.updated`
- `integrations.config.tested`
- `integrations.health.degraded`
- `integrations.webhook.created`
- `integrations.webhook.updated`
- `integrations.webhook.delivery.attempted`
- `integrations.webhook.delivery.succeeded`
- `integrations.webhook.delivery.failed`
- `integrations.dlq.item.created`
- `integrations.dlq.item.resolved`
- `integrations.secret.rotated`

## 3.5 Analytics Events

- `analytics.report.created`
- `analytics.report.updated`
- `analytics.report.run.started`
- `analytics.report.run.completed`
- `analytics.report.run.failed`
- `analytics.export.requested`
- `analytics.export.generated`
- `analytics.export.failed`
- `analytics.export.downloaded`

## 3.6 Automation Events

- `automation.workflow.created`
- `automation.workflow.updated`
- `automation.workflow.activated`
- `automation.workflow.paused`
- `automation.workflow.archived`
- `automation.run.started`
- `automation.run.step.started`
- `automation.run.step.completed`
- `automation.run.step.failed`
- `automation.run.completed`
- `automation.run.failed`
- `automation.approval.requested`
- `automation.approval.approved`
- `automation.approval.rejected`

## 3.7 AI Events

- `ai.provider.created`
- `ai.provider.updated`
- `ai.prompt.created`
- `ai.prompt.updated`
- `ai.prompt.approved`
- `ai.knowledge_base.created`
- `ai.knowledge_base.updated`
- `ai.kb.document.ingest.started`
- `ai.kb.document.ingest.completed`
- `ai.kb.document.ingest.failed`
- `ai.chat.started`
- `ai.chat.completed`
- `ai.chat.blocked`
- `ai.budget.updated`
- `ai.usage.recorded`

## 3.8 Files/Docs Events

- `files.upload.session.created`
- `files.upload.committed`
- `files.virus_scan.started`
- `files.virus_scan.passed`
- `files.virus_scan.failed`
- `files.signed_url.issued`
- `files.deleted`
- `docs.template.created`
- `docs.template.updated`
- `docs.render.started`
- `docs.render.completed`
- `docs.render.failed`

## 3.9 Search Events

- `search.index.entity.queued`
- `search.index.entity.completed`
- `search.reindex.started`
- `search.reindex.progress`
- `search.reindex.completed`
- `search.reindex.failed`

## 3.10 Ops Events

- `ops.cleanup.started`
- `ops.cleanup.completed`
- `ops.cleanup.failed`
- `ops.job.dlq`

---

# 4) Event Data Contracts (Key Payloads)

> Not every event needs heavy payload. Store references. Below are “must-have fields” for critical events.

## 4.1 `omni.message.sent`

```json
{
  "messageId": "uuid",
  "conversationId": "uuid",
  "channel": "wa|sms|email|ig|fb",
  "providerConfigId": "uuid",
  "providerMessageId": "string",
  "toIdentity": "string-redacted",
  "templateId": "uuid|null",
  "throttleBucket": "string|null"
}
```

## 4.2 `omni.message.failed`

```json
{
  "messageId": "uuid",
  "conversationId": "uuid",
  "channel": "wa|sms|email",
  "classification": "provider_error_retryable|provider_error_permanent|policy_blocked|quota_exceeded",
  "providerErrorCode": "string|null",
  "providerErrorMessage": "redacted"
}
```

## 4.3 `crm.contact.merged`

```json
{
  "targetContactId": "uuid",
  "sourceContactId": "uuid",
  "strategy": "prefer_target|prefer_source|manual",
  "fieldsOverridden": ["primaryPhone", "primaryEmail"]
}
```

## 4.4 `analytics.export.generated`

```json
{
  "exportId": "uuid",
  "reportRunId": "uuid",
  "fileObjectId": "uuid",
  "format": "csv",
  "rowCount": 1234,
  "ttlHours": 72
}
```

## 4.5 `automation.approval.requested`

```json
{
  "approvalId": "uuid",
  "workflowRunId": "uuid",
  "scope": "omni.send|analytics.export|ai.prompt.approve",
  "entityType": "message|export|prompt",
  "entityId": "uuid"
}
```

## 4.6 `ai.chat.completed`

```json
{
  "conversationId": "uuid",
  "messageId": "uuid",
  "provider": "openai|anthropic|local",
  "model": "string",
  "tokensIn": 1200,
  "tokensOut": 800,
  "costUsd": 0.0123,
  "budgetId": "uuid|null"
}
```

---

# 5) Logs (Structured) — Rules & Schema

## 5.1 Rules

- Do not log: message bodies, full phone numbers, full emails, secrets, raw prompts (unless explicit debug mode with policy and redaction)
- Always log: requestId, orgId, actorId (if any), route, status, latency
- Errors include classification + error code

## 5.2 Recommended Log Shape

```json
{
  "level": "info|warn|error",
  "timestamp": "iso",
  "service": "crm-suite",
  "requestId": "...",
  "organizationId": "...",
  "actorCoreUserId": "...",
  "route": "GET /crm/contacts",
  "status": 200,
  "latencyMs": 34,
  "msg": "request.completed",
  "error": null
}
```

---

# 6) Tracing (OpenTelemetry Style)

## 6.1 Trace Propagation

- API gateway sets trace context
- requestId propagated as attribute
- job execution creates child span
- provider calls are spans with tags:
  - provider name
  - endpoint/action
  - response code
  - retry count

## 6.2 Minimum Attributes

- `tenant.org_id`
- `actor.user_id`
- `job.id`
- `job.type`
- `http.route`
- `http.status_code`
- `error.classification`

---

# 7) Metrics (Canonical Set)

## 7.1 API Metrics

- `http_requests_total{route,status}`
- `http_request_duration_ms_bucket{route}`
- `http_errors_total{route,code}`

## 7.2 Job Metrics

- `jobs_queued_total{type,queue}`
- `jobs_duration_ms_bucket{type}`
- `jobs_failed_total{type,classification}`
- `jobs_dlq_total{type}`
- `queue_delay_ms_bucket{queue}`

## 7.3 Messaging Metrics

- `messages_sent_total{channel}`
- `messages_failed_total{channel,classification}`
- `provider_latency_ms_bucket{provider}`
- `throttle_block_total` _(use bucketing; avoid orgId as a metric label in prod)_

## 7.4 Webhook Metrics

- `webhook_deliveries_total{status}`
- `webhook_delivery_latency_ms_bucket`
- `webhook_retries_total`

## 7.5 AI Metrics

- `ai_tokens_in_total{provider,model}`
- `ai_tokens_out_total{provider,model}`
- `ai_cost_usd_total{provider,model}`
- `ai_requests_blocked_total{reason}`
- `ai_budget_exceeded_total`

## 7.6 DB Metrics (If available)

- pool utilization
- slow queries count
- deadlocks count

---

# 8) Dashboards (Operational Views)

## 8.1 NOC Overview

- API latency p50/p95/p99
- error rate
- queue depth per queue
- DLQ size
- provider failures (messaging/webhooks)

## 8.2 Messaging Operations

- send throughput
- failure classification breakdown
- per-channel delivery times
- template approval funnel

## 8.3 Automation Reliability

- runs started/completed/failed
- step failure heatmap
- approvals pending count

## 8.4 AI Cost & Safety

- daily cost
- top orgs by usage
- blocked reasons
- token usage

---

# 9) Alerting Rules (Baseline)

## 9.1 API Alerts

- 5xx rate > 1% for 5 minutes
- p95 latency > 1000ms for 10 minutes
- auth failures spike (if measured)

## 9.2 Queue Alerts

- queue depth rising for 10 minutes
- queue delay p95 > 2 minutes
- DLQ count increased > threshold

## 9.3 Provider Alerts

- messaging provider 5xx spike
- webhook delivery failures spike
- AI provider error rate spike

## 9.4 Data Alerts

- deadlocks detected
- slow query rate spike

---

# 10) Incident Playbooks (Minimal)

## 10.1 Messaging Provider Down

1. confirm provider status
2. pause broadcasts/sequences
3. keep 1:1 sends queued
4. enable exponential backoff
5. communicate status to admins
6. after recovery, drain queue gradually

## 10.2 DLQ Growth

1. categorize DLQ items by classification
2. fix root (policy, config, provider)
3. retry only safe items
4. resolve/ignore invalid permanent items
5. adjust alert thresholds

## 10.3 AI Cost Spike

1. check top orgs
2. enforce budgets/hard caps
3. temporarily restrict expensive models
4. audit prompt changes
5. communicate changes

---

# 11) Observability Checklist (Must Pass)

- [ ] Every job emits lifecycle events.
- [ ] Every critical domain action emits an event.
- [ ] No PII in logs by default.
- [ ] Traces link API → job → provider spans.
- [ ] Dashboards exist for API/jobs/providers.
- [ ] Alerts exist for API errors, queues, DLQ, providers.
- [ ] Incident playbooks documented.

**END — 06 EVENTS & OBSERVABILITY**
