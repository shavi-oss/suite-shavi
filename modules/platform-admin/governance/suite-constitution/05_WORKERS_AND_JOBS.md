# ULTRA SPEC PART 2 — 05 WORKERS & JOBS (Deep · Execution Canonical)

**Last Updated:** 2026-02-01  
**Status:** CANONICAL (Async Execution Model for All Suites)  
**Depends on:** `02_API_CONTRACTS.md` + `04_DATA_ACCESS_AND_SECURITY.md`  
**Must not conflict with:** Core Contract lock artifacts under `backend/governance/core-contract/`

> **🔴 SCOPE NOTICE — CRITICAL:**  
> This document describes **SUITE-LAYER JOB/WORKER SYSTEM** (future implementation).  
> **Core Contract v1 does NOT implement job queues or workers.**
>
> Core has background services (Scheduler, Executor) but NO job queue system.  
> This doc describes Suite jobs: message sends, imports, exports, webhooks, etc. (future).
>
> Evidence: No `@Process` decorators, no BullMQ processors in Core code.  
> See: `backend/governance/core-contract/CORE_CONTRACT_V1_EXTRACT.md`

> **Meaning:** This file defines the queue/worker model that powers the Suites safely.
> Any heavy/side-effect work must be executed asynchronously as Jobs.
> This includes messaging sends, imports, exports, indexing, workflow actions, webhook deliveries, and cleanups.

---

# 0) Non-Negotiable Worker Principles

## 0.1 At-Least-Once Processing

Workers are designed for at-least-once delivery:

- Jobs MAY be processed more than once.
- Therefore, every job MUST be idempotent or deduplicated.

## 0.2 Idempotency & Dedupe

Every job must have:

- `idempotencyKey` (derived from request idempotency key or deterministic fingerprint)
- `dedupeKey` (stable per logical action)
- A durable `JobExecution` log with status transitions.

If job with same `dedupeKey` already succeeded:

- return success immediately (no re-run).

## 0.3 Fail-Closed

If a job cannot confirm tenant context, permission context, or required config:

- job must fail-closed and go to DLQ with classification.
  No “best effort” sending outside policy.

## 0.4 Policy Boundaries Persist into Workers

A job must carry:

- `organizationId`
- `actorCoreUserId` (who initiated it)
- `permissionSnapshot` or `roleSnapshotHash` (optional, for long-lived jobs)
- `requestId`
- `source` (api endpoint)

Workers MUST re-check policy gates at execution time when required (consent, quiet-hours, budgets, provider health).

## 0.5 Visibility & Observability

Every job emits:

- lifecycle event (`job.queued`, `job.started`, `job.succeeded`, `job.failed`, `job.dlq`)
- metrics (duration, attempts, queue delay)
- log with requestId + jobId

---

# 1) Queue Topology (Practical, VPS-Friendly)

> Minimum viable deployment uses 3 queues and 1 scheduler, scales later.

## 1.1 Queues

- `q_high` — high priority / user-facing fast jobs (message send, assignment notifications)
- `q_default` — normal tasks (imports parsing, workflow steps)
- `q_low` — heavy tasks (exports, indexing, reindex, large renders)
- `q_webhooks` — outbound webhook deliveries (separate retry behavior)
- `q_dlq` — dead-letter storage (logical state, not necessarily a “queue”)

## 1.2 Worker Pools

- worker-high: concurrency 5–20 (depends on CPU)
- worker-default: concurrency 5–20
- worker-low: concurrency 1–5 (heavy)
- worker-webhooks: concurrency 5–20 (IO bound)
- scheduler: single instance (cron, delayed jobs, recurring)

## 1.3 Scaling Path

- Add more worker replicas per queue
- Split by domain: `q_messaging`, `q_ai`, `q_exports` later when needed
- Add Redis cluster or managed queue later (if using BullMQ/Redis initially)

---

# 2) Job Model (Canonical Schema)

## 2.1 Job Envelope

Every job payload conforms to:

```json
{
  "jobId": "uuid",
  "type": "omni.send_outbound_message",
  "organizationId": "uuid",
  "actorCoreUserId": "uuid",
  "requestId": "string",
  "idempotencyKey": "string",
  "dedupeKey": "string",
  "priority": "high|default|low",
  "runAt": "iso",
  "attempt": 1,
  "maxAttempts": 8,
  "backoff": { "strategy": "exp", "baseMs": 2000, "maxMs": 3600000 },
  "payload": {}
}
```

## 2.2 Job State Machine

States:

- `queued`
- `started`
- `succeeded`
- `failed_retryable`
- `failed_permanent`
- `dlq`

Transition rules:

- queued → started
- started → succeeded
- started → failed_retryable → queued (delayed)
- started → failed_permanent → dlq

## 2.3 Failure Classification (Mandatory)

- `policy_blocked` (consent/quiet-hours/safety)
- `quota_exceeded`
- `provider_error_retryable`
- `provider_error_permanent`
- `validation_error`
- `not_found`
- `permission_denied`
- `tenant_scope_violation` (stop condition)
- `internal_error`

DLQ items MUST store:

- classification
- last error message (redacted)
- stack trace id (not raw trace by default)
- payload fingerprint
- next recommended action

---

# 3) Retry & Backoff Rules (Per Queue Type)

## 3.1 Messaging Sends (`q_high`)

- maxAttempts: 6
- backoff: exp, base 2s, max 10m
- retry on: transient provider errors, timeouts, rate limits
- do NOT retry on: policy_blocked, invalid number, permanently rejected template

## 3.2 Webhooks (`q_webhooks`)

- maxAttempts: 10
- backoff: exp + jitter, max 12h
- retry on: 5xx, timeouts
- do NOT retry on: 4xx (except 429)
- delivery window: 72h max; after that DLQ with classification `expired`

## 3.3 Exports / Indexing (`q_low`)

- maxAttempts: 3 (heavy)
- backoff: linear, base 60s, max 15m
- retry on: transient DB errors, temp storage errors
- do NOT retry on: invalid query params, permission issues

## 3.4 Imports (`q_default`)

- maxAttempts: 5
- backoff: exp base 5s max 30m
- partial failures handled via row-level error report; overall job may succeed with warnings.

---

# 4) Domain Job Catalog (Complete Baseline)

> Every async endpoint in `02_API_CONTRACTS.md` MUST create one of these jobs (or a new type added here).

## 4.1 Omnichannel Jobs

### 4.1.1 `omni.send_outbound_message` (HIGH)

Triggered by:

- POST `/omni/conversations/{id}/messages`
  Payload:
- conversationId, messageId
- channel, templateId/body, attachments
- providerConfigId
- policy snapshot: consent status, quiet-hours decision
  Idempotency:
- dedupeKey = `org:{orgId}:sendmsg:{messageId}`

Steps:

1. Load message + conversation (tenant check)
2. Validate policy (consent/quiet-hours) at execution time
3. Preflight provider config health
4. Send to provider
5. Persist providerMessageId + receipts
6. Emit events: `omni.message.sent|failed`

Stop conditions:

- tenant mismatch
- missing permission context (if required by policy)

### 4.1.2 `omni.retry_message_send` (HIGH)

Triggered by:

- POST `/omni/messages/{id}/retry`
  Rules:
- only if last status=failed and within retry window

### 4.1.3 `omni.broadcast_run_execute` (LOW)

Triggered by:

- schedule broadcast
  Payload:
- broadcastId, runId
- selection query fingerprint
- throttling policy
  Steps:
- compute audience snapshot (frozen)
- enqueue `omni.broadcast_send_batch` per chunk
  Idempotency:
- runId is unique, dedupeKey uses runId

### 4.1.4 `omni.broadcast_send_batch` (DEFAULT/HIGH)

Payload:

- runId, batchId, contactIds
  Steps:
- for each contact -> create message record + enqueue send job
- enforce throttling and quotas

### 4.1.5 `omni.sequence_tick` (SCHEDULED)

Runs periodically to progress sequences.
Constraints:

- max messages per minute per org
- do not run if policy blocks

### 4.1.6 `omni.template_sync_status` (LOW)

Optional: sync template approval status with provider.

## 4.2 CRM Jobs

### 4.2.1 `crm.import_contacts_parse` (DEFAULT)

Triggered by:

- POST `/crm/contacts/import`
  Payload:
- fileObjectId, mapping, importId
  Steps:

1. download file from storage
2. parse rows
3. validate + normalize
4. write staging rows
5. enqueue commit job

### 4.2.2 `crm.import_contacts_commit` (DEFAULT)

Steps:

- upsert contacts/identities per policy
- produce ImportReport (row errors)
- emit `crm.contacts.import.completed`

### 4.2.3 `crm.recompute_contact_scores` (LOW)

AI/analytics optional; recompute segmentation fields.

### 4.2.4 `crm.merge_contacts_finalize` (DEFAULT)

If merge is heavy (many relations), do async finalization with idempotency.

## 4.3 Integrations Jobs

### 4.3.1 `integrations.healthcheck_run` (DEFAULT)

Triggered by:

- POST `/integrations/configs/{id}/test`
  Steps:
- ping provider API
- validate required scopes
- write IntegrationHealthcheckResult

### 4.3.2 `integrations.webhook_delivery_attempt` (WEBHOOKS)

Triggered by:

- event → outbound webhook fanout
  Payload:
- webhookId, deliveryId, eventName, payload
  Steps:
- sign + POST
- record receipt
- retry policy as configured

### 4.3.3 `integrations.dlq_retry` (DEFAULT)

Triggered by:

- POST `/integrations/dlq/{id}/retry`
  Loads DLQ item, re-enqueues original job if safe.

## 4.4 Analytics Jobs

### 4.4.1 `analytics.report_run_execute` (LOW)

Triggered by:

- POST `/analytics/reports/{id}/run`
  Payload:
- reportId, runId, params, queryFingerprint
  Steps:
- execute query (bounded)
- write reportRun result set metadata
- store result in temp table or object storage if large

### 4.4.2 `analytics.export_generate` (LOW)

Triggered by:

- POST `/analytics/report-runs/{runId}/export`
  Steps:
- fetch result dataset
- generate CSV file
- store in storage as FileObject
- create ExportArtifact with signed link capabilities
- audit on download later

## 4.5 Automation Jobs

### 4.5.1 `automation.workflow_event_ingest` (DEFAULT)

Triggered by:

- any domain event
  Steps:
- match workflows by triggerKey
- create WorkflowRun records
- enqueue `workflow_step_execute` jobs

### 4.5.2 `automation.workflow_step_execute` (DEFAULT)

Payload:

- workflowRunId, stepId
  Rules:
- execute step with safe allowlist
- enforce concurrencyLimit per workflow
- if step requires approval -> create ApprovalRequest and pause run

### 4.5.3 `automation.workflow_run_resume` (DEFAULT)

Triggered by approval decision or manual resume.

## 4.6 AI Jobs

### 4.6.1 `ai.index_document` (LOW)

Triggered by:

- POST `/ai/knowledge-bases/{id}/documents`
  Steps:
- download file
- extract text (safe)
- chunk + embed
- store embeddings + index metadata
- emit `ai.kb.document.indexed`

### 4.6.2 `ai.chat_completion` (DEFAULT/HIGH)

Triggered by:

- POST `/ai/chat/{conversationId}/messages`
  Rules:
- enforce budget
- enforce safety redaction
- enforce tool allowlist
- store response + usage

### 4.6.3 `ai.prompt_evaluation` (LOW)

Optional: regression tests for prompts before approve.

## 4.7 Files/Docs Jobs

### 4.7.1 `files.virus_scan` (LOW)

Triggered by upload commit (optional depending on policy).
Blocks availability until pass.

### 4.7.2 `docs.render_template` (LOW)

Triggered by:

- POST `/docs/render`
  Steps:
- render to PDF
- store as FileObject
- return job result + link generation endpoint

## 4.8 Search Jobs

### 4.8.1 `search.reindex_full` (LOW)

Triggered by admin reindex.
Steps:

- iterate entities
- generate SearchDocuments
- bulk write index
  Guardrails:
- rate limited, chunked, resumable

### 4.8.2 `search.index_entity` (DEFAULT)

Triggered by domain events (create/update).

## 4.9 Cleanup Jobs

### 4.9.1 `ops.cleanup_signed_links` (LOW)

Deletes expired SignedLinks.

### 4.9.2 `ops.cleanup_exports` (LOW)

Deletes expired ExportArtifact and files.

### 4.9.3 `ops.cleanup_audit_retention` (LOW)

Compacts/archives audit per retention.

---

# 5) Scheduling (Cron) & Safety Limits

## 5.1 Scheduler Responsibilities

- run delayed retries
- run recurring tasks (sequence tick, cleanup)
- enforce per-org limits
- avoid overlapping runs (distributed lock)

## 5.2 Cron Table (Baseline)

- `*/1 * * * *` → workflow event housekeeping
- `*/1 * * * *` → omni.sequence_tick (if any active)
- `0 */6 * * *` → integrations healthcheck refresh (optional)
- `0 3 * * *` → cleanup expired links/exports (daily)
- `0 2 * * 0` → weekly index optimization (optional)

## 5.3 Safety: Distributed Locks

For recurring jobs:

- lock key = `cron:{jobType}`
- TTL slightly > expected runtime
  If lock exists: skip (do not double-run)

---

# 6) Deduplication Strategy (Canonical)

## 6.1 Dedupe Keys (Examples)

- send message: `org:{orgId}:msg:{messageId}`
- broadcast run: `org:{orgId}:broadcastRun:{runId}`
- export generate: `org:{orgId}:export:{exportId}`
- render: `org:{orgId}:render:{renderJobId}`
- index doc: `org:{orgId}:kbdoc:{docId}`

## 6.2 Idempotency Store

Implementation options:

- DB table `JobIdempotency` (orgId, key, status, responseRef, expiresAt)
- Redis with persistence (acceptable if durable enough; prefer DB for correctness)

Policy:

- store idempotency result for 24h for API-driven actions
- store longer for exports/render (until artifact TTL)

---

# 7) DLQ (Dead Letter Queue) Operations

## 7.1 DLQ Item Contents

- original job envelope (redacted where needed)
- classification
- last error
- attempts
- createdAt / lastAttemptAt
- safeRetryAllowed boolean

## 7.2 DLQ Admin Endpoints

(From `02_API_CONTRACTS.md`)

- GET `/integrations/dlq`
- POST `/integrations/dlq/{id}/retry`
- POST `/integrations/dlq/{id}/resolve`

## 7.3 DLQ Retry Rules

Retry allowed only if:

- classification is retryable OR operator explicitly forces
- policy still allows it
- dedupeKey not already succeeded

Resolve options:

- `ignored` (won't retry)
- `fixed` (after config change)
- `manual` (external action done)

---

# 8) VPS Deployment Notes (Practical Default)

## 8.1 Minimum Process Layout

- API server (suites gateway + suites services)
- worker-high
- worker-default
- worker-low
- worker-webhooks
- scheduler
- redis (if using BullMQ) or DB-only job engine

## 8.2 Resource Guidance (Non-binding)

- messaging is IO-heavy
- exports/indexing is CPU + IO heavy
- AI indexing can be expensive; throttle carefully

## 8.3 Crash Safety

- workers should restart automatically (systemd/pm2/docker restart policy)
- job lock renewal to prevent double processing
- graceful shutdown waits for in-flight jobs or marks as retryable

---

# 9) Worker Security Checklist

- [ ] Jobs always include organizationId; enforced before any DB access.
- [ ] Workers re-check policy gates at execution time (where required).
- [ ] Deduplication prevents duplicates under retries.
- [ ] DLQ captures sufficient info for remediation without leaking PII.
- [ ] Logs are redacted; no message bodies in logs by default.
- [ ] Scheduler uses distributed locks to prevent double cron execution.
- [ ] Retry policies are bounded and safe.

**END — 05 WORKERS & JOBS**
