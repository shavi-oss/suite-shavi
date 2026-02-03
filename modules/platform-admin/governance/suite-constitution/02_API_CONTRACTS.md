# ULTRA SPEC PART 2 — 02 API CONTRACTS (Deep · Execution Grade)
**Last Updated:** 2026-02-01  
**Status:** CANONICAL (Single Source of Truth for Suite API Surfaces)  
**Depends on:** `01_SCHEMAS.md`  
**Must not conflict with:** Core Contract lock artifacts under `backend/governance/core-contract/`

> **🔴 SCOPE NOTICE — CRITICAL:**  
> This document describes **SUITE-LAYER APIs** (future implementation).  
> These are **NOT part of Core Contract v1**.  
>  
> **Core Contract v1** (42 endpoints, `/api/v1` prefix) is documented in:  
> `backend/governance/core-contract/CORE_CONTRACT_V1_EXTRACT.md`  
>  
> **Suite APIs** (described below) will use `/api/suites/v1` prefix when implemented.  
> Evidence: Core uses `/api/v1` (backend/src/main.ts:L21), NOT `/api/suites/v1`.

> **Meaning:** This file defines the complete, implementable API surface for all Suites/BFFs.
> Every endpoint MUST:
> - map to permissions (see `03_PERMISSIONS_MATRIX.md`)
> - respect schemas in `01_SCHEMAS.md`)
> - emit events/metrics (see `06_EVENTS_AND_OBSERVABILITY.md`)
> - use workers for heavy work (`05_WORKERS_AND_JOBS.md`)

---

# 0) Global API Standards (Mandatory)

## 0.1 Base Path & Versioning
- Suite APIs are exposed under: `/api/suites/v1`
- Example: `/api/suites/v1/crm/contacts`
- Version increments only on breaking changes.

## 0.2 Auth & Tenant Context
- Requires Core auth (JWT bearer) at the gateway.
- Tenant context is enforced via `organizationId` derived from Core claims / tenant selection.
- Every request includes `X-Request-Id` (generated if missing).

## 0.3 Envelope
Success:
```json
{
  "data": {},
  "meta": { "requestId": "..." },
  "errors": []
}
```
List success:
```json
{
  "data": [],
  "meta": {
    "requestId":"...",
    "page": 1,
    "limit": 25,
    "total": 123,
    "hasNext": true
  },
  "errors": []
}
```
Error:
```json
{
  "data": null,
  "meta": { "requestId":"..." },
  "errors": [
    { "code":"validation_error","message":"...","field":"..." }
  ]
}
```

## 0.4 Pagination / Sorting / Filtering (Lists)
Query params:
- `page` (>=1, default 1)
- `limit` (1..100, default 25)
- `sort` (e.g. `createdAt:desc`)
- `q` optional full-text
- `filters` per resource (resource-specific keys; all validated)

## 0.5 Idempotency
- Side-effect endpoints MUST accept `Idempotency-Key` header.
- Server stores fingerprint + response for TTL (e.g., 24h) to replay safely.
- Applies strongly to:
  - message sends
  - broadcast schedule
  - exports creation
  - workflow activate/pause
  - file upload commit
  - contact merge

## 0.6 Concurrency & ETags
- PATCH endpoints accept `ifMatchVersion` in body or `If-Match` header.
- If version mismatch -> 409 `conflict`.

## 0.7 Standard HTTP Codes
- 200 OK (read/write synchronous)
- 201 Created (create)
- 202 Accepted (async job started)
- 400 validation_error
- 401 unauthorized
- 403 forbidden (permission denied)
- 404 not_found
- 409 conflict (version mismatch, duplicates)
- 429 rate_limited
- 500 internal_error

## 0.8 Standard Error Codes
- `validation_error`
- `permission_denied`
- `not_found`
- `conflict`
- `rate_limited`
- `provider_error`
- `quota_exceeded`
- `policy_blocked` (consent/quiet-hours/safety)
- `stop_condition_triggered`

## 0.9 Audit Requirements
Audit events MUST be emitted for:
- PII reads (contacts)
- message body reads (if policy enabled)
- exports generation + download
- secret ref changes
- role/permission changes
- workflow activation changes
- template approvals
- AI prompt changes and KB access

Audit record includes:
- actor coreUserId
- organizationId
- action key
- entityRef
- requestId
- ip/userAgent where available

## 0.10 Rate Limiting Headers (If enabled)
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

---

# 1) Tenant Admin Suite API (`/tenant/*`)

Base: `/api/suites/v1/tenant`

## 1.1 Users (Operational Profiles)

### GET `/users`
List tenant users (EmployeeProfile).  
Filters: `status`, `teamId`, `departmentId`, `q` (email/name).

### GET `/users/{id}`
Returns full EmployeeProfile.

### POST `/users/invite`
Creates InviteToken (+ optional provisional EmployeeProfile in `invited` status).  
Headers: `Idempotency-Key` **required**

Body:
```json
{
  "email": "user@company.com",
  "displayName": "Optional name",
  "roleIds": ["..."],
  "teamIds": ["..."],
  "departmentId": null
}
```
Response:
```json
{ "data": { "inviteId":"...", "expiresAt":"..." }, "meta": {}, "errors": [] }
```

Errors:
- 409 conflict: email already exists
- 403 permission_denied: lacks `tenant.users.invite`

Audit: `tenant.user.invited`

### POST `/users/{id}/suspend`
Body: `{ "reason":"optional" }`  
Audit: `tenant.user.status.changed`

### POST `/users/{id}/activate`
Audit: `tenant.user.status.changed`

### PATCH `/users/{id}`
Updates: displayName, phone, teamIds, departmentId, title, locale, timezone, quietHoursPolicyId.  
Concurrency required:
```json
{ "ifMatchVersion": 3, "patch": { "title":"Senior Agent" } }
```

## 1.2 Roles & Permissions
### GET `/roles`
### POST `/roles`
Header `Idempotency-Key` recommended.
```json
{ "name":"Sales Agent", "description":"...", "permissionKeys":[ "crm.contacts.read", "omni.messages.send" ] }
```
### PATCH `/roles/{id}` (ifMatchVersion required)
### DELETE `/roles/{id}`
Constraints: cannot delete system roles; cannot delete if assigned unless forced with migration.

### GET `/permissions/catalog`
Returns all supported permission keys and descriptions.

## 1.3 Settings
### GET `/settings`
### PATCH `/settings` (validated partial updates)
Audit: `tenant.settings.updated`

## 1.4 Audit Log
### GET `/audit`
Filters: actionKey, actorCoreUserId, from/to, entityType, entityId.

---

# 2) CRM Suite API (`/crm/*`)

Base: `/api/suites/v1/crm`

## 2.1 Contacts
### GET `/contacts`
Filters: status, tag, ownerCoreUserId, q.  
Sort: lastInteractionAt, createdAt.

### POST `/contacts`
Headers: `Idempotency-Key` recommended
```json
{
  "displayName":"",
  "firstName": null,
  "lastName": null,
  "primaryPhone": "+2010...",
  "primaryEmail": "x@y.com",
  "tags": ["vip"],
  "ownerCoreUserId": null,
  "source": "walkin",
  "customFieldValues": {}
}
```
Optional: `mergePolicy` = `reject|merge|link_identity` (default reject)

### GET `/contacts/{id}`
PII read may be audited depending on tenant policy.

### PATCH `/contacts/{id}`
Concurrency required: `ifMatchVersion`.

### POST `/contacts/{id}/merge`
Headers: `Idempotency-Key` required
```json
{
  "sourceContactId": "...",
  "strategy": "prefer_target|prefer_source|manual",
  "fieldOverrides": { "primaryPhone":"+20..." }
}
```
Effects: identities unioned, source soft-deleted.  
Audit: `crm.contact.merged`

### POST `/contacts/import`
Async (202) job creation with file mapping.

### GET `/contacts/{id}/timeline`
Combined Activities + Conversation summaries + stage changes.

## 2.2 Leads
- GET `/leads`
- POST `/leads` (Idempotency-Key required)
- GET `/leads/{id}`
- PATCH `/leads/{id}` (ifMatchVersion required)
- POST `/leads/{id}/moveStage`
- POST `/leads/{id}/assign`
- POST `/leads/{id}/archive`

## 2.3 Deals
- GET `/deals`
- POST `/deals` (Idempotency-Key required)
- GET `/deals/{id}`
- PATCH `/deals/{id}`
- POST `/deals/{id}/moveStage`
- POST `/deals/{id}/assign`

## 2.4 Pipelines & Stages
- GET `/pipelines?type=lead|deal`
- POST `/pipelines`
- PATCH `/pipelines/{id}`
- POST `/pipelines/{id}/stages`
- PATCH `/stages/{id}`

## 2.5 Activities
- GET `/activities`
- POST `/activities`

---

# 3) Omnichannel Suite API (`/omni/*`)

Base: `/api/suites/v1/omni`

## 3.1 Inboxes
- GET `/inboxes`
- POST `/inboxes`
- PATCH `/inboxes/{id}` (ifMatchVersion required)

## 3.2 Conversations
- GET `/conversations`
- GET `/conversations/{id}`
- POST `/conversations/{id}/assign`
- POST `/conversations/{id}/close`
- POST `/conversations/{id}/reopen`
- POST `/conversations/{id}/tags`
- GET `/conversations/{id}/messages`

## 3.3 Messages
### POST `/conversations/{id}/messages`
Send outbound message.  
Headers: `Idempotency-Key` required
```json
{
  "channel":"wa",
  "templateId": null,
  "templateVariables": {},
  "body":"مرحبا",
  "attachments":[{"fileObjectId":"..."}],
  "policy": { "allowOutsideBusinessHours": false }
}
```
Rules: consent + quiet hours + throttling enforced; creates Message queued then enqueues job; returns 202.

- POST `/messages/{id}/retry` (Idempotency-Key required)
- GET `/delivery-logs` (admin)

## 3.4 Routing & SLA
- GET `/routing-rulesets`
- PATCH `/routing-rulesets/{id}`
- GET `/sla-configs`
- PATCH `/sla-configs/{id}`
- GET `/sla-breaches`

## 3.5 Templates
- GET `/templates`
- POST `/templates`
- PATCH `/templates/{id}`
- POST `/templates/{id}/submit-approval`
- POST `/templates/{id}/approve`
- POST `/templates/{id}/reject`

## 3.6 Broadcasts & Sequences
- GET `/broadcasts`
- POST `/broadcasts`
- POST `/broadcasts/{id}/schedule` (Idempotency-Key required)
- POST `/broadcasts/{id}/cancel`
- GET `/broadcasts/{id}/runs`
- GET `/sequences`
- POST `/sequences`
- POST `/sequences/{id}/pause`
- POST `/sequences/{id}/resume`
- GET `/sequences/{id}/runs`

---

# 4) Integrations Hub Suite API (`/integrations/*`)

Base: `/api/suites/v1/integrations`

- GET `/catalog`
- GET `/configs`
- POST `/configs`
- PATCH `/configs/{id}`
- POST `/configs/{id}/test`
- POST `/secrets/rotate` (restricted)
- GET `/webhooks`
- POST `/webhooks`
- PATCH `/webhooks/{id}`
- GET `/webhooks/{id}/deliveries`
- POST `/webhooks/deliveries/{deliveryId}/retry`
- GET `/dlq`
- POST `/dlq/{id}/retry`
- POST `/dlq/{id}/resolve`

---

# 5) Analytics Suite API (`/analytics/*`)

Base: `/api/suites/v1/analytics`

- GET `/datasets`
- GET `/reports`
- POST `/reports`
- PATCH `/reports/{id}`
- GET `/reports/{id}`
- POST `/reports/{id}/run` (202 for heavy runs)
- GET `/report-runs`
- GET `/report-runs/{runId}`
- POST `/report-runs/{runId}/export` (Idempotency-Key required)
- GET `/exports`
- GET `/exports/{id}`
- POST `/exports/{id}/download-link`

---

# 6) Automation Suite API (`/automation/*`)

Base: `/api/suites/v1/automation`

- GET `/triggers`
- GET `/actions`
- GET `/workflows`
- POST `/workflows`
- PATCH `/workflows/{id}`
- POST `/workflows/{id}/activate` (Idempotency-Key required)
- POST `/workflows/{id}/pause` (Idempotency-Key required)
- POST `/workflows/{id}/archive`
- GET `/workflow-runs`
- GET `/workflow-runs/{id}`
- GET `/approvals`
- POST `/approvals/{id}/approve`
- POST `/approvals/{id}/reject`

---

# 7) AI Suite API (`/ai/*`)

Base: `/api/suites/v1/ai`

- GET `/providers`
- POST `/providers`
- PATCH `/providers/{id}`
- GET `/prompts`
- POST `/prompts`
- PATCH `/prompts/{id}`
- POST `/prompts/{id}/approve`
- GET `/knowledge-bases`
- POST `/knowledge-bases`
- PATCH `/knowledge-bases/{id}`
- POST `/knowledge-bases/{id}/documents` (202)
- POST `/chat`
- POST `/chat/{conversationId}/messages`
- GET `/budgets`
- PATCH `/budgets/{id}`
- GET `/usage`

---

# 8) Files & Documents Suite API (`/files/*`, `/docs/*`)

Base: `/api/suites/v1/files` and `/api/suites/v1/docs`

Files:
- POST `/files/upload-sessions`
- POST `/files/upload-sessions/{id}/commit` (Idempotency-Key required)
- GET `/files`
- GET `/files/{id}`
- POST `/files/{id}/signed-url`
- DELETE `/files/{id}`

Docs:
- GET `/docs/templates`
- POST `/docs/templates`
- PATCH `/docs/templates/{id}`
- POST `/docs/render` (202)

---

# 9) Search Suite API (`/search/*`)

Base: `/api/suites/v1/search`
- GET `/search?q=...&types=...`
Admin:
- GET `/search/admin/indexes`
- POST `/search/admin/reindex`
- GET `/search/admin/jobs`

---

# 10) Developer Portal Suite API (`/dev/*`)

Base: `/api/suites/v1/dev`
- GET `/api-keys`
- POST `/api-keys` (Idempotency-Key required)
- POST `/api-keys/{id}/rotate` (Idempotency-Key required)
- POST `/api-keys/{id}/revoke`
- GET `/rate-limits`
- PATCH `/rate-limits` (restricted)
- GET `/webhooks`
- GET `/logs` (restricted, redacted)

---

# 11) Stop Conditions
If governance stop condition triggers, suites may respond with:
```json
{
  "data": null,
  "meta": { "requestId":"...", "stopCondition":"..." },
  "errors": [ { "code":"stop_condition_triggered", "message":"Execution halted by governance" } ]
}
```

---

# 12) API Completeness Checklist (Must hold)
- [ ] Every endpoint has a permission mapping in `03_PERMISSIONS_MATRIX.md`.
- [ ] Requests/responses reference entities from `01_SCHEMAS.md`.
- [ ] Side-effect endpoints support idempotency.
- [ ] Async operations return 202 and are worker-driven.
- [ ] Sensitive operations emit audits.
- [ ] Errors use standard codes.
- [ ] Pagination/sorting validated and bounded.

**END — 02 API CONTRACTS**
