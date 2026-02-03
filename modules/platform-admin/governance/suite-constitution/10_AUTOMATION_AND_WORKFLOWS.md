# ULTRA SPEC PART 2 — 10 AUTOMATION & WORKFLOWS (Deep · Execution Canonical)

**Last Updated:** 2026-02-01  
**Status:** CANONICAL (Workflow Engine + Approvals + Safety)  
**Depends on:** `01_SCHEMAS.md`, `03_PERMISSIONS_MATRIX.md`, `05_WORKERS_AND_JOBS.md`, `06_EVENTS_AND_OBSERVABILITY.md`

> **🔴 SCOPE NOTICE:** This describes **SUITE-LAYER** automation (future). Core v1 has basic workflow engine (NOT Suite automation). See: `backend/governance/core-contract/CORE_CONTRACT_V1_EXTRACT.md`

> **Meaning:** This file defines the Automation subsystem:
>
> - Triggers (event-driven)
> - Conditions (filters)
> - Actions (side-effects)
> - Workflow execution engine (async)
> - Approvals and safety policies
> - Rate limits, quotas, guardrails
>
> Automation must be powerful but _never dangerous_.
> It must be tenant-isolated, permission-aware, idempotent, observable, and fail-closed.

---

# 0) Automation Principles (Non-Negotiable)

## 0.1 Event-Driven

Automation triggers are driven by events defined in `06_EVENTS_AND_OBSERVABILITY.md`.
No polling-based workflows unless explicitly authorized (future).

## 0.2 Safe-by-Design

Automation cannot bypass permissions.
Workflows execute with constraints:

- within tenant
- within allowed action catalog
- within quotas and limits
- approvals required for sensitive operations

## 0.3 Idempotency

Automation engine is at-least-once:

- runs may restart
- actions may be retried
  Therefore each step must be deduped.

## 0.4 Isolation

Workflows belong to a tenant and cannot act on other tenants.

## 0.5 Observability

Every run and step emits events, metrics, logs.

---

# 1) Core Concepts

## 1.1 Workflow

A workflow is a directed graph:
Trigger → Conditions → Actions (steps)

Stored as:

- definition (graph)
- status (draft/active/paused/archived)
- owner (actorCoreUserId)
- safety settings

## 1.2 Trigger

Trigger defines:

- `triggerKey` mapping to an eventName
- scope (entity type)
- optional schedule (future)

Example triggerKey:

- `crm.lead.stage.moved`
- `omni.message.failed`
- `ai.chat.completed`

## 1.3 Conditions (Filters)

Conditions filter on:

- event data
- entity attributes
- tenant policy flags
- time windows

Examples:

- leadStage == "Hot"
- message.channel == "wa"
- only during business hours
- contact has consent

## 1.4 Actions

Actions are safe, pre-defined operations:

- create task/activity
- assign lead/deal
- send message (restricted)
- add tag
- call webhook
- notify user
- create export (restricted)
- create approval request

No arbitrary code execution in v1.

---

# 2) Workflow Definition Schema (Canonical)

```json
{
  "workflowId":"uuid",
  "name":"Follow-up on hot lead",
  "status":"draft|active|paused|archived",
  "trigger": { "eventName":"crm.lead.stage.moved", "version":1 },
  "conditions":[
    { "field":"data.newStage", "op":"eq", "value":"Hot" }
  ],
  "steps":[
    { "id":"s1", "type":"crm.create_activity", "params":{...} },
    { "id":"s2", "type":"omni.send_message", "params":{...}, "requiresApproval": true }
  ],
  "limits":{
    "maxRunsPerDay": 500,
    "maxConcurrentRuns": 10,
    "maxActionsPerRun": 20
  },
  "createdBy":"coreUserId",
  "createdAt":"iso"
}
```

---

# 3) Action Catalog (Canonical Baseline)

> Only actions listed here are allowed.

## 3.1 CRM Actions

- `crm.create_activity`
- `crm.assign_lead`
- `crm.move_lead_stage`
- `crm.assign_deal`
- `crm.add_contact_tag`
- `crm.remove_contact_tag`

## 3.2 Omnichannel Actions (Restricted)

- `omni.send_message` _(restricted, often approval required)_
- `omni.assign_conversation`
- `omni.close_conversation`

## 3.3 Integrations Actions

- `integrations.call_webhook` _(restricted URL validation)_
- `integrations.enqueue_dlq_retry` _(admin)_

## 3.4 Analytics Actions (Restricted)

- `analytics.run_report`
- `analytics.generate_export` _(restricted)_

## 3.5 AI Actions (Restricted)

- `ai.generate_summary` _(safe transform only)_
- `ai.classify_intent` _(safe transform only)_
- `ai.suggest_reply` _(must be approved before send if outbound)_

## 3.6 Tenant Ops Actions (Admin)

- `tenant.notify_user`
- `tenant.create_approval_request`

---

# 4) Permissions & Authorization Rules

## 4.1 Create/Manage Workflows

Endpoints:

- `GET /automation/workflows` → `automation.workflows.read`
- `POST/PATCH /automation/workflows` → `automation.workflows.manage`
- activate/pause → `automation.workflows.activate`

## 4.2 Action Permission Binding

Every action maps to permission keys:

- `crm.assign_lead` → `crm.leads.assign`
- `omni.send_message` → `omni.messages.send` + policy gates
- `analytics.generate_export` → `analytics.exports.create`
- `integrations.call_webhook` → `integrations.webhooks.manage` (or a dedicated key in future)

At activation time:

- validate creator has all required permissions OR explicitly bind workflow to a service role (future).

At run time:

- re-check key policies (consent, quiet-hours, quotas, budgets).

## 4.3 Approval Binding

Actions marked `requiresApproval` MUST create ApprovalRequest and pause until decision.

Approval decision requires:

- `automation.approvals.decide`

---

# 5) Execution Engine (Async Model)

## 5.1 Execution Flow

1. event arrives (EventLog)
2. `automation.workflow_event_ingest` job runs
3. matches workflows by triggerKey
4. creates WorkflowRun record per match
5. enqueue `automation.workflow_step_execute` for first step
6. each step enqueue next step until completion

## 5.2 Step Execution Semantics

Each step:

- loads WorkflowRun + workflow definition snapshot
- evaluates conditions (if conditional step)
- executes action using safe adapter
- records StepExecution state
- emits events

## 5.3 WorkflowRun States

- `queued`
- `running`
- `waiting_approval`
- `succeeded`
- `failed`
- `cancelled`

Step states:

- `pending`
- `running`
- `succeeded`
- `failed_retryable`
- `failed_permanent`

---

# 6) Approvals System

## 6.1 ApprovalRequest Fields

- approvalId
- orgId
- requestedBy (workflow creator or system)
- actionType
- entityRef
- payloadPreview (redacted)
- status (pending/approved/rejected/expired)
- decidedBy
- decidedAt
- expiresAt

## 6.2 Approval UX Requirements

- show reason and preview
- allow approve/reject
- show audit trail

## 6.3 Expiry Rules

Default expiry: 24–72h.
On expiry:

- action cancelled
- workflowRun may fail or continue (depending on step config).

---

# 7) Safety Limits & Guardrails (Non-Negotiable)

## 7.1 Per-Workflow Limits

- max actions per run
- max runs per day
- max concurrent runs
- max sends per hour (for messaging actions)

## 7.2 Global Tenant Limits

Tenant policy defines:

- max outbound messages per minute
- max exports per day
- max AI tokens per day

## 7.3 Loop Protection

Workflows cannot trigger themselves endlessly.
Mechanisms:

- event dedupe by eventId
- run dedupe by `dedupeKey = workflowId + eventId`
- maximum recursion depth (if workflows emit events)

## 7.4 URL Safety for Webhook Action

- only https
- block internal IP ranges
- allowlist domains (tenant-configurable)
- timeout strict (e.g. 5s)
- payload size limit

---

# 8) Failure Handling & DLQ

## 8.1 Retry Policies

- step retries on transient failures
- permanent failures go to workflow DLQ

## 8.2 Workflow DLQ

Stores:

- workflowRunId
- stepId
- classification
- lastError
- safeRetryAllowed

Admin can:

- retry step
- mark resolved
- cancel run

---

# 9) Observability

Events emitted:

- `automation.run.started`
- `automation.run.step.started`
- `automation.run.step.completed`
- `automation.run.step.failed`
- `automation.run.completed`
- `automation.approval.requested`

Metrics:

- runs/success/failure
- step duration
- approval pending count
- loop blocks

---

# 10) Stop Conditions

- tenant scope violation
- missing permission mapping
- attempt to send message without consent gate
- webhook URL violates safety rules
- runaway workflow detected

Return: `stop_condition_triggered` or `policy_blocked`.

---

# 11) Implementation Checklist

- [ ] event ingest job matches workflows correctly
- [ ] runs are idempotent
- [ ] step actions use allowlisted adapters
- [ ] approvals block sensitive steps
- [ ] guardrails enforced (limits, loop protection)
- [ ] DLQ for failed runs implemented
- [ ] observability complete

**END — 10 AUTOMATION & WORKFLOWS**
