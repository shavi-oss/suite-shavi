# BASSAN.OS — ULTRA SPEC PART 2 (DEEP EXECUTION EDITION)
**Date:** 2026-02-01  
**Depends on:** `/governance/SYSTEM_MASTER_BLUEPRINT.md` + `SYSTEM_MASTER_BLUEPRINT_ULTRA.md`  
**Purpose:** This file is the *execution-grade* reference: deep field-level schemas, suite API contracts, worker payloads,
event catalog, permission mapping, workflow graphs, failure modes, idempotency rules, observability requirements.

> **Core Contract Note:** Core endpoints/DTOs are locked in Core governance artifacts. This spec does not rewrite Core.
> It defines the *suite* surface areas and the full system semantics around Core.

---

# 0) Global Conventions (Mandatory)

## 0.1 Data Types
- UUID = RFC4122 string
- timestamptz = ISO 8601 with timezone
- money = integer minor units (e.g., cents), currency separate
- json = structured object, validated by schema
- enum = closed set; unknown values rejected

## 0.2 Tenant Isolation Rules (Hard)
- Every tenant-owned record MUST include `organizationId` (UUID) and it MUST be indexed.
- Every query MUST filter by `organizationId` (and never rely on implicit scoping).
- Cross-tenant operations are forbidden by construction.
- Platform tables have no `organizationId` but are platform-scoped.

## 0.3 Row Lifecycle
All tables follow common lifecycle:
- create: `createdAt`, `createdBy`
- update: `updatedAt`, `updatedBy`
- soft delete: `isDeleted`, `deletedAt`, `deletedBy`

Hard deletes only for:
- DLQ records after retention
- ephemeral caches
- derived indexes (rebuildable)

## 0.4 Optimistic Concurrency
- `version` integer increments on update
- PATCH requests accept `ifMatchVersion` optional
- if mismatch -> 409 conflict (retry with latest)

## 0.5 Audit & Sensitive Access
Sensitive entities must include an audit event when accessed:
- "read_sensitive" actions log: actor, resource, reason (if required), ip, userAgent
Sensitive examples:
- contact PII
- message contents (depending on policy)
- exported files
- AI knowledge documents
- credentials references (never raw secrets)

## 0.6 API Envelope
All suite APIs follow:
```json
{
  "data": "<object|array|null>",
  "meta": {},
  "errors": []
}
```
Error envelope:
```json
{
  "data": null,
  "meta": { "requestId": "..." },
  "errors": [
    { "code": "validation_error", "message": "...", "field": "name" }
  ]
}
```

## 0.7 Pagination
Query:
- `page` (>=1)
- `limit` (1..100 default 25)
- `sort` (field:asc|desc)
- `q` (full-text search, optional)
Response meta:
```json
{
  "page": 1,
  "limit": 25,
  "total": 1234,
  "hasNext": true
}
```

## 0.8 Idempotency
All externally-triggered actions that can be retried MUST support idempotency key:
- header: `Idempotency-Key`
- stored with request fingerprint + TTL
- duplicate returns original response

Mandatory for:
- sending messages
- creating payments/invoices
- running exports
- webhooks registration
- workflow activation

## 0.9 Rate Limiting (Suite Level)
- per tenant
- per user
- per API key (developer portal)
- per channel (omnichannel)

Enforcement mode:
- warn-only (logs + headers)
- hard (429)

## 0.10 Security Headers
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Content-Security-Policy` (web apps)
- `Referrer-Policy: no-referrer`
- `Permissions-Policy` as needed

---

# 1) Entity Schemas (Field-Level, All Suites)

This section lists the canonical schemas for each domain entity.
Unless stated: all tenant entities include `organizationId`, `createdAt`, `updatedAt`, `createdBy`, `updatedBy`, `version`, `isDeleted`, `deletedAt`, `deletedBy`.

## 1.1 Tenant Administration Domain

### 1.1.1 EmployeeProfile
- id: UUID (PK)
- organizationId: UUID (IDX)
- coreUserId: UUID (FK to CoreUser by ID reference)
- displayName: string (1..120)
- email: string (lowercased, indexed)
- phone: string (E.164, indexed, nullable)
- status: enum(active, suspended, invited, archived)
- roleIds: UUID[] (tenant roles references)
- teamIds: UUID[]
- departmentId: UUID|null
- title: string|null
- locale: string (e.g., "ar-EG", "en-US")
- timezone: string (IANA tz)
- quietHoursPolicyId: UUID|null
- lastLoginAt: timestamptz|null
Indexes:
- (organizationId, email) unique
- (organizationId, phone) unique where phone not null

### 1.1.2 Team
- id: UUID
- organizationId: UUID
- name: string (1..120)
- description: string|null
- managerUserId: UUID|null
- omnichannelInboxId: UUID|null
Indexes: (organizationId, name) unique

### 1.1.3 Department
- id: UUID
- organizationId: UUID
- name: string
- parentDepartmentId: UUID|null (tree)
Indexes: (organizationId, name) unique

### 1.1.4 TenantSettings
- id: UUID
- organizationId: UUID (unique)
- enabledSuites: string[] (e.g., ["crm","omnichannel","analytics","automation","ai"])
- securityPolicy:
  - require2FA: bool
  - allowedIpCidrs: string[]
  - sessionMaxAgeMinutes: int
  - deviceLimit: int|null
- dataPolicy:
  - exportsEnabled: bool
  - exportTtlDays: int (default 30)
  - messageRetentionMonths: int (default 24)
  - auditRetentionMonths: int (default 36)
- compliancePolicy:
  - consentRequired: bool
  - quietHoursEnabled: bool
- billingPolicy:
  - enforcementMode: enum(warn, hard)
- createdAt, updatedAt, version

### 1.1.5 InviteToken
- id: UUID
- organizationId: UUID
- email: string (indexed)
- tokenHash: string (never store raw)
- expiresAt: timestamptz
- invitedByUserId: UUID
- acceptedAt: timestamptz|null
- acceptedByUserId: UUID|null
Indexes:
- (organizationId, email, acceptedAt)

---

## 1.2 CRM Domain (Industry-Agnostic)

### 1.2.1 Contact
- id: UUID
- organizationId: UUID
- primaryIdentityId: UUID|null (FK ContactIdentity)
- firstName: string|null
- lastName: string|null
- displayName: string (computed or explicit)
- primaryPhone: string|null (E.164)
- primaryEmail: string|null
- language: string|null
- tags: string[]
- status: enum(active, archived, blocked)
- ownerUserId: UUID|null
- source: string|null (e.g., "facebook", "walkin", "referral")
- lastInteractionAt: timestamptz|null
- notesSummary: string|null
- customFields: json (validated against CustomFieldDefinition)
Indexes:
- (organizationId, primaryPhone)
- (organizationId, primaryEmail)
- (organizationId, status, lastInteractionAt desc)

### 1.2.2 ContactIdentity
- id: UUID
- organizationId: UUID
- contactId: UUID
- channel: enum(phone, email, wa, sms, webchat, fb, ig)
- value: string (normalized, indexed)  # e.g., phone E.164, email lower, wa_id
- providerRef: string|null             # provider-specific id
- isPrimary: bool
- verifiedAt: timestamptz|null
- consentStatus: enum(unknown, opted_in, opted_out)
- consentProofRef: string|null
Indexes:
- (organizationId, channel, value) unique
- (organizationId, contactId)

### 1.2.3 Pipeline
- id: UUID
- organizationId: UUID
- type: enum(lead, deal)
- name: string
- isDefault: bool
- stageOrder: UUID[] (ordered stage ids)
Indexes: (organizationId, type, name) unique

### 1.2.4 PipelineStage
- id: UUID
- organizationId: UUID
- pipelineId: UUID
- name: string
- color: string|null
- orderIndex: int
- isTerminal: bool
- terminalOutcome: enum(won, lost)|null
Indexes:
- (organizationId, pipelineId, orderIndex) unique

### 1.2.5 Lead
- id: UUID
- organizationId: UUID
- contactId: UUID
- pipelineId: UUID
- stageId: UUID
- title: string|null
- source: string|null
- campaignId: UUID|null
- score: int (0..100, default 0)
- assignedUserId: UUID|null
- nextActionAt: timestamptz|null
- status: enum(open, won, lost, archived)
- valueEstimateMinor: int|null
- currency: string|null
- lastStageChangedAt: timestamptz
- stageHistory: json (append-only items)
Indexes:
- (organizationId, stageId, status)
- (organizationId, assignedUserId, status)
- (organizationId, nextActionAt)

### 1.2.6 Deal
- id: UUID
- organizationId: UUID
- contactId: UUID
- pipelineId: UUID
- stageId: UUID
- name: string
- valueMinor: int|null
- currency: string|null
- probability: int (0..100)
- expectedCloseAt: timestamptz|null
- assignedUserId: UUID|null
- status: enum(open, won, lost, archived)
- stageHistory: json

### 1.2.7 Activity
- id: UUID
- organizationId: UUID
- contactId: UUID|null
- leadId: UUID|null
- dealId: UUID|null
- type: enum(call, meeting, note, email, message, task)
- subject: string|null
- body: text|null
- outcome: string|null
- scheduledAt: timestamptz|null
- completedAt: timestamptz|null
- actorUserId: UUID
- attachments: UUID[] (FileObject ids)
Indexes:
- (organizationId, actorUserId, createdAt desc)
- (organizationId, contactId, createdAt desc)

### 1.2.8 Campaign
- id: UUID
- organizationId: UUID
- name: string
- channel: enum(fb, ig, tiktok, google, offline, referral, other)
- costMinor: int|null
- currency: string|null
- startAt: timestamptz|null
- endAt: timestamptz|null
- metadata: json
Indexes: (organizationId, name) unique

### 1.2.9 CustomFieldDefinition
- id: UUID
- organizationId: UUID
- domain: enum(contact, lead, deal, conversation)
- key: string (snake_case, unique per domain+org)
- label: string
- type: enum(text, number, boolean, date, enum, multi_enum)
- options: string[]|null
- required: bool
- visibility: enum(all, admin_only, restricted)
Indexes: (organizationId, domain, key) unique

---

## 1.3 Omnichannel Domain (Core entities)
(Full schemas continue in the same format for Inbox, Conversation, Message, Receipts, Routing, SLA, Template, Broadcast/Sequence, Consent.)

---

# 2) Suite API Contracts (Full Surface)

## 2.1 Tenant Admin API
- GET /tenant/users
- POST /tenant/users/invite
- POST /tenant/users/{id}/activate
- POST /tenant/users/{id}/suspend
- PATCH /tenant/users/{id}
- POST /tenant/users/import

## 2.2 CRM API
- GET /crm/contacts
- POST /crm/contacts
- GET /crm/contacts/{id}
- PATCH /crm/contacts/{id}
- POST /crm/contacts/{id}/merge
- POST /crm/contacts/import
- GET /crm/contacts/{id}/timeline
- GET /crm/leads
- POST /crm/leads
- POST /crm/leads/{id}/moveStage
- POST /crm/leads/{id}/assign
- GET /crm/deals
- POST /crm/deals
- POST /crm/deals/{id}/moveStage

## 2.3 Omnichannel API
- GET /omni/inboxes
- POST /omni/inboxes
- PATCH /omni/inboxes/{id}
- GET /omni/conversations
- GET /omni/conversations/{id}
- POST /omni/conversations/{id}/assign
- POST /omni/conversations/{id}/close
- POST /omni/conversations/{id}/reopen
- POST /omni/conversations/{id}/tags
- GET /omni/conversations/{id}/messages
- POST /omni/conversations/{id}/messages
- POST /omni/messages/{id}/retry

## 2.4 Integrations Hub API
- GET /integrations/catalog
- GET /integrations/configs
- POST /integrations/configs
- PATCH /integrations/configs/{id}
- POST /integrations/configs/{id}/test
- GET /integrations/webhooks
- POST /integrations/webhooks
- PATCH /integrations/webhooks/{id}
- GET /integrations/webhooks/{id}/deliveries
- POST /integrations/webhooks/{deliveryId}/retry
- GET /integrations/dlq
- POST /integrations/dlq/{id}/retry
- POST /integrations/secrets/rotate

---

# 3) Permission Matrix, 4) Workflow Graphs, 5) Worker Payloads, 6) Event Catalog, 7) Failure Modes, 8) Observability
(See remaining sections in the full file.)
