# ULTRA SPEC PART 2 — 03 PERMISSIONS MATRIX (Deep · Canonical)

**Last Updated:** 2026-02-01  
**Status:** CANONICAL (Single Source of Truth for Authorization Mapping)  
**Depends on:** `02_API_CONTRACTS.md`  
**Applies to:** All Suites (Tenant Admin, CRM, Omnichannel, Integrations, Analytics, Automation, AI, Files, Search, Dev Portal)

> **🔴 SCOPE NOTICE — CRITICAL:**  
> This document describes **SUITE-LAYER PERMISSIONS** (future implementation).  
> **Core Contract v1 does NOT implement permission-based authorization.**
>
> **Core v1 Authorization:**
>
> - JWT authentication only (JwtAuthGuard + TenantGuard)
> - Tenant isolation via CLS
> - NO granular permissions
> - NO PermissionsGuard
>
> Evidence: No `PermissionKey` or `PermissionsGuard` found in Core code.  
> See: `backend/governance/core-contract/CORE_CONTRACT_V1_EXTRACT.md`

> **Meaning:** This file defines:
>
> 1. the canonical permission key catalog (domain.resource.action)
> 2. the endpoint → permission mapping (every endpoint must map)
> 3. default role templates (starter roles) for tenant bootstrap
>
> **Rules**
>
> - Deny-by-default: if an endpoint has no mapping, it MUST return 403.
> - UI must hide actions without permission, but backend is authoritative.
> - Permission evaluation uses tenant Role assignment in `TenantRole.permissionKeys` (see `01_SCHEMAS.md`).
> - Restricted actions additionally require policy gates.
> - Any change here is a security change and requires review.

---

# 0) Permission Key Format

## 0.1 Naming

`<domain>.<resource>.<action>`

- domain: tenant | crm | omni | integrations | analytics | automation | ai | files | search | dev | billing | ops
- resource: plural noun or subsystem: users, roles, contacts, leads, messages, templates, workflows, exports, etc.
- action: read | write | create | update | delete | manage | run | send | approve | rotate | download | admin

## 0.2 Examples

- `crm.contacts.read`
- `crm.contacts.write`
- `omni.messages.send`
- `omni.templates.approve`
- `analytics.exports.create`
- `ai.knowledge.read`
- `integrations.secrets.rotate`
- `dev.api_keys.manage`

## 0.3 Evaluation (Conceptual)

A request is authorized iff:

- user has a Role assigned in tenant
- the role includes the permissionKey
- AND any required policy gate passes (quiet-hours, consent, approvals, budget, restricted scopes)
  Otherwise: 403 permission_denied.

---

# 1) Canonical Permission Catalog (By Suite/Domain)

> This is the full catalog. If you add a new endpoint you MUST pick one existing key or introduce a new key here.

## 1.1 Tenant Domain

- `tenant.users.read`
- `tenant.users.invite`
- `tenant.users.update`
- `tenant.users.suspend`
- `tenant.users.activate`
- `tenant.users.import`
- `tenant.roles.read`
- `tenant.roles.manage`
- `tenant.permissions.read`
- `tenant.settings.read`
- `tenant.settings.update`
- `tenant.audit.read`

## 1.2 CRM Domain

- `crm.contacts.read`
- `crm.contacts.read_sensitive` _(restricted audit)_
- `crm.contacts.write`
- `crm.contacts.merge` _(restricted)_
- `crm.contacts.import` _(restricted async)_
- `crm.contacts.timeline.read`
- `crm.leads.read`
- `crm.leads.write`
- `crm.leads.assign`
- `crm.leads.stage.move`
- `crm.deals.read`
- `crm.deals.write`
- `crm.deals.assign`
- `crm.deals.stage.move`
- `crm.pipelines.manage`
- `crm.activities.read`
- `crm.activities.write`
- `crm.campaigns.manage`
- `crm.custom_fields.manage`

## 1.3 Omnichannel Domain

- `omni.inboxes.read`
- `omni.inboxes.manage`
- `omni.conversations.read`
- `omni.conversations.assign`
- `omni.conversations.close`
- `omni.conversations.tags.manage`
- `omni.messages.read_metadata`
- `omni.messages.read_body` _(restricted audit)_
- `omni.messages.send`
- `omni.messages.retry`
- `omni.delivery_logs.read` _(admin/restricted)_
- `omni.routing.manage`
- `omni.sla.manage`
- `omni.sla.breaches.read`
- `omni.templates.read`
- `omni.templates.write`
- `omni.templates.submit_approval`
- `omni.templates.approve` _(restricted)_
- `omni.broadcasts.manage` _(restricted)_
- `omni.sequences.manage` _(restricted)_
- `omni.consent.manage` _(restricted)_

## 1.4 Integrations Domain

- `integrations.catalog.read`
- `integrations.configs.read`
- `integrations.configs.manage`
- `integrations.configs.test`
- `integrations.secrets.read` _(very restricted; returns redacted)_
- `integrations.secrets.rotate` _(restricted)_
- `integrations.webhooks.read`
- `integrations.webhooks.manage`
- `integrations.webhooks.deliveries.read`
- `integrations.webhooks.deliveries.retry`
- `integrations.dlq.read`
- `integrations.dlq.retry`
- `integrations.dlq.resolve`

## 1.5 Analytics Domain

- `analytics.datasets.read`
- `analytics.reports.read`
- `analytics.reports.manage`
- `analytics.runs.create`
- `analytics.runs.read`
- `analytics.exports.create` _(restricted)_
- `analytics.exports.read`
- `analytics.exports.download` _(restricted audit)_

## 1.6 Automation Domain

- `automation.triggers.read`
- `automation.actions.read`
- `automation.workflows.read`
- `automation.workflows.manage` _(restricted)_
- `automation.workflows.activate` _(restricted)_
- `automation.runs.read`
- `automation.approvals.read`
- `automation.approvals.decide` _(restricted)_

## 1.7 AI Domain

- `ai.providers.read`
- `ai.providers.manage` _(restricted)_
- `ai.prompts.read`
- `ai.prompts.manage` _(restricted)_
- `ai.prompts.approve` _(restricted)_
- `ai.knowledge.read` _(restricted audit)_
- `ai.knowledge.manage` _(restricted)_
- `ai.chat.use`
- `ai.budgets.read`
- `ai.budgets.manage` _(restricted)_
- `ai.usage.read` _(restricted)_

## 1.8 Files & Docs Domain

- `files.list`
- `files.read_metadata`
- `files.download` _(restricted audit)_
- `files.upload.create`
- `files.upload.commit`
- `files.delete`
- `docs.templates.read`
- `docs.templates.manage` _(restricted)_
- `docs.render.create` _(restricted async)_

## 1.9 Search Domain

- `search.query`
- `search.admin.indexes.read` _(restricted)_
- `search.admin.reindex` _(restricted)_
- `search.admin.jobs.read` _(restricted)_

## 1.10 Developer Domain

- `dev.api_keys.read`
- `dev.api_keys.manage` _(restricted)_
- `dev.rate_limits.read`
- `dev.rate_limits.manage` _(restricted)_
- `dev.webhooks.read`
- `dev.logs.read` _(very restricted)_

---

# 2) Endpoint → Permission Mapping (Complete)

> If you add/edit endpoints in `02_API_CONTRACTS.md`, you MUST update this mapping.

## 2.1 Tenant Admin Endpoints

- GET `/api/suites/v1/tenant/users` → `tenant.users.read`
- GET `/api/suites/v1/tenant/users/{id}` → `tenant.users.read`
- POST `/api/suites/v1/tenant/users/invite` → `tenant.users.invite`
- POST `/api/suites/v1/tenant/users/{id}/suspend` → `tenant.users.suspend`
- POST `/api/suites/v1/tenant/users/{id}/activate` → `tenant.users.activate`
- PATCH `/api/suites/v1/tenant/users/{id}` → `tenant.users.update`
- POST `/api/suites/v1/tenant/users/import` → `tenant.users.import`

- GET `/api/suites/v1/tenant/roles` → `tenant.roles.read`
- POST `/api/suites/v1/tenant/roles` → `tenant.roles.manage`
- PATCH `/api/suites/v1/tenant/roles/{id}` → `tenant.roles.manage`
- DELETE `/api/suites/v1/tenant/roles/{id}` → `tenant.roles.manage`

- GET `/api/suites/v1/tenant/permissions/catalog` → `tenant.permissions.read`

- GET `/api/suites/v1/tenant/settings` → `tenant.settings.read`
- PATCH `/api/suites/v1/tenant/settings` → `tenant.settings.update`

- GET `/api/suites/v1/tenant/audit` → `tenant.audit.read`

## 2.2 CRM Endpoints

Contacts:

- GET `/api/suites/v1/crm/contacts` → `crm.contacts.read`
- POST `/api/suites/v1/crm/contacts` → `crm.contacts.write`
- GET `/api/suites/v1/crm/contacts/{id}` → `crm.contacts.read_sensitive`
- PATCH `/api/suites/v1/crm/contacts/{id}` → `crm.contacts.write`
- POST `/api/suites/v1/crm/contacts/{id}/merge` → `crm.contacts.merge`
- POST `/api/suites/v1/crm/contacts/import` → `crm.contacts.import`
- GET `/api/suites/v1/crm/contacts/{id}/timeline` → `crm.contacts.timeline.read`

Leads:

- GET `/api/suites/v1/crm/leads` → `crm.leads.read`
- POST `/api/suites/v1/crm/leads` → `crm.leads.write`
- GET `/api/suites/v1/crm/leads/{id}` → `crm.leads.read`
- PATCH `/api/suites/v1/crm/leads/{id}` → `crm.leads.write`
- POST `/api/suites/v1/crm/leads/{id}/moveStage` → `crm.leads.stage.move`
- POST `/api/suites/v1/crm/leads/{id}/assign` → `crm.leads.assign`
- POST `/api/suites/v1/crm/leads/{id}/archive` → `crm.leads.write`

Deals:

- GET `/api/suites/v1/crm/deals` → `crm.deals.read`
- POST `/api/suites/v1/crm/deals` → `crm.deals.write`
- GET `/api/suites/v1/crm/deals/{id}` → `crm.deals.read`
- PATCH `/api/suites/v1/crm/deals/{id}` → `crm.deals.write`
- POST `/api/suites/v1/crm/deals/{id}/moveStage` → `crm.deals.stage.move`
- POST `/api/suites/v1/crm/deals/{id}/assign` → `crm.deals.assign`

Pipelines & Activities:

- GET `/api/suites/v1/crm/pipelines` → `crm.pipelines.manage`
- POST `/api/suites/v1/crm/pipelines` → `crm.pipelines.manage`
- PATCH `/api/suites/v1/crm/pipelines/{id}` → `crm.pipelines.manage`
- POST `/api/suites/v1/crm/pipelines/{id}/stages` → `crm.pipelines.manage`
- PATCH `/api/suites/v1/crm/stages/{id}` → `crm.pipelines.manage`
- GET `/api/suites/v1/crm/activities` → `crm.activities.read`
- POST `/api/suites/v1/crm/activities` → `crm.activities.write`

## 2.3 Omnichannel Endpoints

Inboxes:

- GET `/api/suites/v1/omni/inboxes` → `omni.inboxes.read`
- POST `/api/suites/v1/omni/inboxes` → `omni.inboxes.manage`
- PATCH `/api/suites/v1/omni/inboxes/{id}` → `omni.inboxes.manage`

Conversations:

- GET `/api/suites/v1/omni/conversations` → `omni.conversations.read`
- GET `/api/suites/v1/omni/conversations/{id}` → `omni.conversations.read`
- POST `/api/suites/v1/omni/conversations/{id}/assign` → `omni.conversations.assign`
- POST `/api/suites/v1/omni/conversations/{id}/close` → `omni.conversations.close`
- POST `/api/suites/v1/omni/conversations/{id}/reopen` → `omni.conversations.close`
- POST `/api/suites/v1/omni/conversations/{id}/tags` → `omni.conversations.tags.manage`
- GET `/api/suites/v1/omni/conversations/{id}/messages` → `omni.messages.read_body`

Messages:

- POST `/api/suites/v1/omni/conversations/{id}/messages` → `omni.messages.send`
- POST `/api/suites/v1/omni/messages/{id}/retry` → `omni.messages.retry`
- GET `/api/suites/v1/omni/delivery-logs` → `omni.delivery_logs.read`

Routing & SLA:

- GET `/api/suites/v1/omni/routing-rulesets` → `omni.routing.manage`
- PATCH `/api/suites/v1/omni/routing-rulesets/{id}` → `omni.routing.manage`
- GET `/api/suites/v1/omni/sla-configs` → `omni.sla.manage`
- PATCH `/api/suites/v1/omni/sla-configs/{id}` → `omni.sla.manage`
- GET `/api/suites/v1/omni/sla-breaches` → `omni.sla.breaches.read`

Templates:

- GET `/api/suites/v1/omni/templates` → `omni.templates.read`
- POST `/api/suites/v1/omni/templates` → `omni.templates.write`
- PATCH `/api/suites/v1/omni/templates/{id}` → `omni.templates.write`
- POST `/api/suites/v1/omni/templates/{id}/submit-approval` → `omni.templates.submit_approval`
- POST `/api/suites/v1/omni/templates/{id}/approve` → `omni.templates.approve`
- POST `/api/suites/v1/omni/templates/{id}/reject` → `omni.templates.approve`

Broadcasts/Sequences:

- GET `/api/suites/v1/omni/broadcasts` → `omni.broadcasts.manage`
- POST `/api/suites/v1/omni/broadcasts` → `omni.broadcasts.manage`
- POST `/api/suites/v1/omni/broadcasts/{id}/schedule` → `omni.broadcasts.manage`
- POST `/api/suites/v1/omni/broadcasts/{id}/cancel` → `omni.broadcasts.manage`
- GET `/api/suites/v1/omni/broadcasts/{id}/runs` → `omni.broadcasts.manage`

- GET `/api/suites/v1/omni/sequences` → `omni.sequences.manage`
- POST `/api/suites/v1/omni/sequences` → `omni.sequences.manage`
- POST `/api/suites/v1/omni/sequences/{id}/pause` → `omni.sequences.manage`
- POST `/api/suites/v1/omni/sequences/{id}/resume` → `omni.sequences.manage`
- GET `/api/suites/v1/omni/sequences/{id}/runs` → `omni.sequences.manage`

## 2.4 Integrations Endpoints

- GET `/api/suites/v1/integrations/catalog` → `integrations.catalog.read`
- GET `/api/suites/v1/integrations/configs` → `integrations.configs.read`
- POST `/api/suites/v1/integrations/configs` → `integrations.configs.manage`
- PATCH `/api/suites/v1/integrations/configs/{id}` → `integrations.configs.manage`
- POST `/api/suites/v1/integrations/configs/{id}/test` → `integrations.configs.test`
- POST `/api/suites/v1/integrations/secrets/rotate` → `integrations.secrets.rotate`
- GET `/api/suites/v1/integrations/webhooks` → `integrations.webhooks.read`
- POST `/api/suites/v1/integrations/webhooks` → `integrations.webhooks.manage`
- PATCH `/api/suites/v1/integrations/webhooks/{id}` → `integrations.webhooks.manage`
- GET `/api/suites/v1/integrations/webhooks/{id}/deliveries` → `integrations.webhooks.deliveries.read`
- POST `/api/suites/v1/integrations/webhooks/deliveries/{deliveryId}/retry` → `integrations.webhooks.deliveries.retry`
- GET `/api/suites/v1/integrations/dlq` → `integrations.dlq.read`
- POST `/api/suites/v1/integrations/dlq/{id}/retry` → `integrations.dlq.retry`
- POST `/api/suites/v1/integrations/dlq/{id}/resolve` → `integrations.dlq.resolve`

## 2.5 Analytics Endpoints

- GET `/api/suites/v1/analytics/datasets` → `analytics.datasets.read`
- GET `/api/suites/v1/analytics/reports` → `analytics.reports.read`
- POST `/api/suites/v1/analytics/reports` → `analytics.reports.manage`
- PATCH `/api/suites/v1/analytics/reports/{id}` → `analytics.reports.manage`
- GET `/api/suites/v1/analytics/reports/{id}` → `analytics.reports.read`
- POST `/api/suites/v1/analytics/reports/{id}/run` → `analytics.runs.create`
- GET `/api/suites/v1/analytics/report-runs` → `analytics.runs.read`
- GET `/api/suites/v1/analytics/report-runs/{runId}` → `analytics.runs.read`
- POST `/api/suites/v1/analytics/report-runs/{runId}/export` → `analytics.exports.create`
- GET `/api/suites/v1/analytics/exports` → `analytics.exports.read`
- GET `/api/suites/v1/analytics/exports/{id}` → `analytics.exports.read`
- POST `/api/suites/v1/analytics/exports/{id}/download-link` → `analytics.exports.download`

## 2.6 Automation Endpoints

- GET `/api/suites/v1/automation/triggers` → `automation.triggers.read`
- GET `/api/suites/v1/automation/actions` → `automation.actions.read`
- GET `/api/suites/v1/automation/workflows` → `automation.workflows.read`
- POST `/api/suites/v1/automation/workflows` → `automation.workflows.manage`
- PATCH `/api/suites/v1/automation/workflows/{id}` → `automation.workflows.manage`
- POST `/api/suites/v1/automation/workflows/{id}/activate` → `automation.workflows.activate`
- POST `/api/suites/v1/automation/workflows/{id}/pause` → `automation.workflows.activate`
- POST `/api/suites/v1/automation/workflows/{id}/archive` → `automation.workflows.manage`
- GET `/api/suites/v1/automation/workflow-runs` → `automation.runs.read`
- GET `/api/suites/v1/automation/workflow-runs/{id}` → `automation.runs.read`
- GET `/api/suites/v1/automation/approvals` → `automation.approvals.read`
- POST `/api/suites/v1/automation/approvals/{id}/approve` → `automation.approvals.decide`
- POST `/api/suites/v1/automation/approvals/{id}/reject` → `automation.approvals.decide`

## 2.7 AI Endpoints

- GET `/api/suites/v1/ai/providers` → `ai.providers.read`
- POST `/api/suites/v1/ai/providers` → `ai.providers.manage`
- PATCH `/api/suites/v1/ai/providers/{id}` → `ai.providers.manage`
- GET `/api/suites/v1/ai/prompts` → `ai.prompts.read`
- POST `/api/suites/v1/ai/prompts` → `ai.prompts.manage`
- PATCH `/api/suites/v1/ai/prompts/{id}` → `ai.prompts.manage`
- POST `/api/suites/v1/ai/prompts/{id}/approve` → `ai.prompts.approve`
- GET `/api/suites/v1/ai/knowledge-bases` → `ai.knowledge.read`
- POST `/api/suites/v1/ai/knowledge-bases` → `ai.knowledge.manage`
- PATCH `/api/suites/v1/ai/knowledge-bases/{id}` → `ai.knowledge.manage`
- POST `/api/suites/v1/ai/knowledge-bases/{id}/documents` → `ai.knowledge.manage`
- POST `/api/suites/v1/ai/chat` → `ai.chat.use`
- POST `/api/suites/v1/ai/chat/{conversationId}/messages` → `ai.chat.use`
- GET `/api/suites/v1/ai/budgets` → `ai.budgets.read`
- PATCH `/api/suites/v1/ai/budgets/{id}` → `ai.budgets.manage`
- GET `/api/suites/v1/ai/usage` → `ai.usage.read`

## 2.8 Files/Docs Endpoints

Files:

- POST `/api/suites/v1/files/upload-sessions` → `files.upload.create`
- POST `/api/suites/v1/files/upload-sessions/{id}/commit` → `files.upload.commit`
- GET `/api/suites/v1/files` → `files.list`
- GET `/api/suites/v1/files/{id}` → `files.read_metadata`
- POST `/api/suites/v1/files/{id}/signed-url` → `files.download`
- DELETE `/api/suites/v1/files/{id}` → `files.delete`

Docs:

- GET `/api/suites/v1/docs/templates` → `docs.templates.read`
- POST `/api/suites/v1/docs/templates` → `docs.templates.manage`
- PATCH `/api/suites/v1/docs/templates/{id}` → `docs.templates.manage`
- POST `/api/suites/v1/docs/render` → `docs.render.create`

## 2.9 Search Endpoints

- GET `/api/suites/v1/search` → `search.query`
  Admin:
- GET `/api/suites/v1/search/admin/indexes` → `search.admin.indexes.read`
- POST `/api/suites/v1/search/admin/reindex` → `search.admin.reindex`
- GET `/api/suites/v1/search/admin/jobs` → `search.admin.jobs.read`

## 2.10 Dev Portal Endpoints

- GET `/api/suites/v1/dev/api-keys` → `dev.api_keys.read`
- POST `/api/suites/v1/dev/api-keys` → `dev.api_keys.manage`
- POST `/api/suites/v1/dev/api-keys/{id}/rotate` → `dev.api_keys.manage`
- POST `/api/suites/v1/dev/api-keys/{id}/revoke` → `dev.api_keys.manage`
- GET `/api/suites/v1/dev/rate-limits` → `dev.rate_limits.read`
- PATCH `/api/suites/v1/dev/rate-limits` → `dev.rate_limits.manage`
- GET `/api/suites/v1/dev/webhooks` → `dev.webhooks.read`
- GET `/api/suites/v1/dev/logs` → `dev.logs.read`

---

# 3) Policy Gates for Restricted Permissions (Mandatory)

Certain permissions are not sufficient alone; they require additional policy gates:

## 3.1 Quiet Hours Gate

Applies to:

- `omni.messages.send`
- `omni.broadcasts.manage`
- `omni.sequences.manage`
  Rule:
- if quiet-hours enabled and outside -> `policy_blocked` unless user has explicit override (future key: `omni.policy.override`).

## 3.2 Consent Gate

Applies to outbound communications:

- Broadcasts/sequences require opt-in for that channel.
- 1:1 messaging respects tenant policy (default: allow if no explicit opt-out).
  Violation -> `policy_blocked`.

## 3.3 Approval Gate

Applies to:

- `omni.templates.approve`
- `docs.render.create` (optional)
- `ai.prompts.approve`
- `automation.approvals.decide`
  Approval flows recorded in ApprovalRequest.

## 3.4 Budget/Quota Gate

Applies to:

- `ai.chat.use` (AIBudget)
- `analytics.exports.create` (export quota)
- outbound messaging quotas
  Violation -> `quota_exceeded`.

## 3.5 Secrets Gate

Applies to:

- `integrations.secrets.rotate`
  Rule:
- always audited
- step-up auth recommended in UI (future)

---

# 4) Default Role Templates (Tenant Bootstrap)

> Tenants can modify roles, but these provide a safe starting point.

## 4.1 Owner (All Access)

Includes ALL permissions.
Notes:

- typically 1–2 users only.
- can manage secrets, rate limits, reindex, budgets.

## 4.2 Admin (Tenant Operations)

Includes:

- full tenant operations (users/roles/settings/audit)
- suite management powers
  Excludes (default):
- `dev.logs.read` (Owner-only)

## 4.3 Manager (Team Lead)

Includes day-to-day management:

- CRM leads/deals pipeline operations (not pipeline schema changes unless granted)
- Omni assignment/close/send
- analytics run/read (export create optional)

## 4.4 Agent (Support/Sales)

Includes:

- CRM contact/lead work
- Omni send/retry
- files upload/download as needed

## 4.5 Viewer / Read-Only

Includes read-only across CRM + analytics + limited omni metadata.

---

# 5) Permissions Completeness Checklist

- [ ] Every endpoint in `02_API_CONTRACTS.md` appears in section 2.
- [ ] Every permission key used in mapping exists in section 1.
- [ ] Restricted operations have policy gates defined.
- [ ] Default roles avoid secret/critical powers by default.
- [ ] Sensitive reads are mapped to dedicated keys where needed.
- [ ] Deny-by-default enforced at runtime.

**END — 03 PERMISSIONS MATRIX**
