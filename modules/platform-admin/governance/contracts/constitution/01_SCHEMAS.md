# ULTRA SPEC PART 2 — 01 SCHEMAS (Deep · Execution Canonical)

**Last Updated:** 2026-02-01  
**Status:** CANONICAL (Single Source of Truth for Suite Data Models)  
**Depends on:** `SYSTEM_MASTER_BLUEPRINT.md` + `SYSTEM_MASTER_BLUEPRINT_ULTRA.md`  
**Must not conflict with:** Core Contract lock artifacts under `backend/governance/core-contract/`

> **🔴 SCOPE NOTICE — CRITICAL:**  
> This document describes **SUITE-LAYER DATA MODELS** (future implementation).  
> **Core Contract v1 has its own minimal schema** (Workflow, User, Organization, Role entities only).
>
> **Core v1 entities are NOT documented here.** Core schema is in Prisma files.  
> This doc describes Suite entities: CRM, Omnichannel, Analytics, AI, etc. (future).
>
> Evidence: Core has no Contact, Message, Template, or other Suite entities.  
> See: `backend/governance/core-contract/CORE_CONTRACT_V1_EXTRACT.md`

> **Meaning:** This file defines the _actual data shapes_ (entities, fields, constraints, indexes, relations, lifecycle) for all suites.
> API contracts, permissions, workflows, and jobs MUST reference these entities exactly.

---

## 0) Global Data Modeling Rules (Non‑Negotiable)

### 0.1 Tenant Isolation Key

- Every tenant-owned record MUST include `organizationId` (UUID) and MUST be indexed.
- Every query MUST include `organizationId` filter (no implicit scoping assumptions).
- Any relation between two tenant records MUST share the same `organizationId` (enforced at app layer + defensive checks).

### 0.2 Common Columns (Tenant Tables)

All tenant tables include the following unless explicitly exempted (logs/caches):

- `id: uuid (pk)`
- `organizationId: uuid (idx)`
- `createdAt: timestamptz`
- `updatedAt: timestamptz`
- `createdByUserId: uuid|null` (actor user reference; do NOT enforce FK to Core directly if cross-repo)
- `updatedByUserId: uuid|null`
- `version: int` (optimistic concurrency, starts at 1)
- `isDeleted: bool` (default false)
- `deletedAt: timestamptz|null`
- `deletedByUserId: uuid|null`

### 0.3 Soft Delete & Visibility

- Default delete = soft delete.
- Hard delete only for:
  - derived indexes (SearchDocument) that can be rebuilt
  - caches
  - DLQ cleanup after retention
  - ephemeral temp artifacts

### 0.4 Optimistic Concurrency

- Every write updates `version = version + 1`.
- PATCH supports `ifMatchVersion`:
  - if mismatch -> `409 conflict`

### 0.5 PII / Sensitive Read Audits

These reads MUST emit audit events (suite audit, not necessarily core):

- Contact PII reads (email/phone/addresses)
- Message body reads (if policy enabled)
- Export download reads
- Knowledge document reads
- Secret reference reads (never raw secrets)

### 0.6 Money & Currency

- Store monetary values in minor units: `valueMinor: int`
- Store currency separately: `currency: string (ISO 4217)`

### 0.7 JSON Fields

Any JSON field must be schema-validated at write time and versioned if shape evolves.

### 0.8 Index Conventions

At minimum:

- `idx_<table>_org` on `organizationId`
- `idx_<table>_org_createdAt` on `(organizationId, createdAt DESC)` for timeline lists
  Add composite indexes for common filters.

### 0.9 Platform-Scoped Tables

Platform tables do NOT include `organizationId` (because they are global). They must include:

- `id`
- `createdAt/updatedAt`
- `version`
- `isDeleted` lifecycle where appropriate

---

## 1) Identity, Tenant Admin & Access Control (Suite-Level)

> Note: Core owns _engine identity_. Suites store _operational profiles_ mapped to core user IDs.

### 1.1 EmployeeProfile

**Purpose:** Operational profile for a tenant user (display info, assignments, teams, preferences).  
**Fields**

- id: uuid (pk)
- organizationId: uuid (idx)
- coreUserId: uuid (reference)
- email: string (lowercased, idx, unique per org)
- displayName: string (1..120)
- phone: string|null (E.164, idx, unique per org where not null)
- status: enum('active','invited','suspended','archived')
- roleIds: uuid[] (tenant Role ids)
- teamIds: uuid[]
- departmentId: uuid|null
- title: string|null
- locale: string (default 'ar-EG')
- timezone: string (IANA, default tenant setting)
- avatarFileObjectId: uuid|null
- quietHoursPolicyId: uuid|null
- lastLoginAt: timestamptz|null
- metadata: json|null (safe internal metadata; not for PII)
  **Indexes**
- unique(organizationId, email)
- unique(organizationId, phone) where phone not null
- idx(organizationId, status)
  **Relations**
- team membership (by teamIds or join table if many-to-many required later)
- assignments (Omnichannel Assignment)
- ownership (Contacts/Leads/Deals)

### 1.2 Team

- id, organizationId
- name: string (1..120) unique per org
- description: string|null
- managerCoreUserId: uuid|null
- defaultInboxId: uuid|null (Omnichannel)
- metadata: json|null

### 1.3 Department

- id, organizationId
- name: string unique per org
- parentDepartmentId: uuid|null (tree)
- metadata: json|null

### 1.4 TenantSettings

**Purpose:** Configuration root for tenant (suites enabled, retention, security posture).

- id, organizationId (unique)
- enabledSuites: string[] (keys)
- securityPolicy: json
  - require2FA: bool (future)
  - allowedIpCidrs: string[]
  - sessionMaxAgeMinutes: int
  - deviceLimit: int|null
- retentionPolicy: json
  - messageRetentionMonths: int (default 24)
  - auditRetentionMonths: int (default 36)
  - exportTtlDays: int (default 30)
  - aiCacheDays: int (default 7)
- compliancePolicy: json
  - consentRequired: bool
  - quietHoursEnabled: bool
- billingPolicy: json
  - enforcementMode: enum('warn','hard')
- defaults: json
  - defaultLocale: string
  - defaultTimezone: string

### 1.5 TenantRole (Suite Role)

**Purpose:** Tenant-defined roles (separate from Core engine roles if needed).

- id, organizationId
- name: string unique per org
- description: string|null
- isSystemRole: bool
- permissionKeys: string[] (normalized permissions)
- metadata: json|null

### 1.6 InviteToken

- id, organizationId
- email: string idx
- tokenHash: string
- expiresAt: timestamptz
- invitedByCoreUserId: uuid
- acceptedAt: timestamptz|null
- acceptedByCoreUserId: uuid|null
- status: enum('pending','accepted','expired','revoked')
  Indexes:
- idx(organizationId, email, status)

---

## 2) Workspace (Tasks, Approvals, Notifications Shell)

### 2.1 Task

- id, organizationId
- title: string (1..200)
- description: text|null
- status: enum('open','in_progress','blocked','done','archived')
- priority: enum('low','normal','high','urgent')
- dueAt: timestamptz|null
- assignedToCoreUserId: uuid|null
- createdFrom: json|null (source: conversation/lead/deal/workflow)
- tags: string[]
  Indexes:
- idx(organizationId, status, dueAt)
- idx(organizationId, assignedToCoreUserId, status)

### 2.2 ApprovalRequest

- id, organizationId
- kind: enum('template_approval','ai_send_approval','workflow_approval','data_export_approval')
- status: enum('pending','approved','rejected','expired','cancelled')
- requestedByCoreUserId: uuid
- assignedApproverRoleId: uuid|null
- assignedApproverCoreUserId: uuid|null
- subjectRef: json (entityType/entityId)
- reason: text|null
- decidedAt: timestamptz|null
- decisionByCoreUserId: uuid|null
- decisionNote: text|null
  Indexes:
- idx(organizationId, status)
- idx(organizationId, assignedApproverCoreUserId, status)

### 2.3 Comment (Internal Notes / Mentions)

- id, organizationId
- parentRef: json (entityType/entityId)
- body: text
- mentions: uuid[] (coreUserIds)
- visibility: enum('internal','restricted') # restricted hides from most roles
  Indexes:
- idx(organizationId, createdAt desc)

---

## 3) CRM Framework (Industry-Agnostic Canon)

### 3.1 Contact

- id, organizationId
- displayName: string
- firstName: string|null
- lastName: string|null
- primaryPhone: string|null (E.164, idx)
- primaryEmail: string|null (idx)
- language: string|null
- tags: string[]
- status: enum('active','archived','blocked')
- ownerCoreUserId: uuid|null
- source: string|null
- lastInteractionAt: timestamptz|null
- notesSummary: text|null
- customFieldValues: json (validated)
  Indexes:
- idx(organizationId, primaryPhone)
- idx(organizationId, primaryEmail)
- idx(organizationId, status, lastInteractionAt desc)

### 3.2 ContactIdentity

- id, organizationId
- contactId: uuid
- channel: enum('phone','email','wa','sms','webchat','fb','ig')
- value: string (normalized)
- providerRef: string|null
- isPrimary: bool
- verifiedAt: timestamptz|null
- consentStatus: enum('unknown','opted_in','opted_out')
- consentProofRef: string|null
  Indexes:
- unique(organizationId, channel, value)
- idx(organizationId, contactId)

### 3.3 Account (Company)

- id, organizationId
- name: string
- industry: string|null
- website: string|null
- primaryContactId: uuid|null
- tags: string[]
- status: enum('active','archived')
  Indexes:
- idx(organizationId, name)

### 3.4 Pipeline

- id, organizationId
- type: enum('lead','deal')
- name: string
- isDefault: bool
- stageOrder: uuid[]
  Indexes:
- unique(organizationId, type, name)

### 3.5 PipelineStage

- id, organizationId
- pipelineId: uuid
- name: string
- orderIndex: int
- isTerminal: bool
- terminalOutcome: enum('won','lost')|null
- metadata: json|null
  Indexes:
- unique(organizationId, pipelineId, orderIndex)

### 3.6 Lead

- id, organizationId
- contactId: uuid
- accountId: uuid|null
- pipelineId: uuid
- stageId: uuid
- title: string|null
- source: string|null
- campaignId: uuid|null
- score: int (0..100)
- assignedCoreUserId: uuid|null
- nextActionAt: timestamptz|null
- status: enum('open','won','lost','archived')
- valueEstimateMinor: int|null
- currency: string|null
- lastStageChangedAt: timestamptz
- stageHistory: json (append-only)
  Indexes:
- idx(organizationId, stageId, status)
- idx(organizationId, assignedCoreUserId, status)
- idx(organizationId, nextActionAt)

### 3.7 Deal

- id, organizationId
- contactId: uuid
- accountId: uuid|null
- pipelineId: uuid
- stageId: uuid
- name: string
- valueMinor: int|null
- currency: string|null
- probability: int (0..100)
- expectedCloseAt: timestamptz|null
- assignedCoreUserId: uuid|null
- status: enum('open','won','lost','archived')
- stageHistory: json
  Indexes similar to Lead

### 3.8 Activity

- id, organizationId
- contactId: uuid|null
- leadId: uuid|null
- dealId: uuid|null
- type: enum('call','meeting','note','email','message','task')
- subject: string|null
- body: text|null
- outcome: string|null
- scheduledAt: timestamptz|null
- completedAt: timestamptz|null
- actorCoreUserId: uuid
- attachmentFileIds: uuid[]
  Indexes:
- idx(organizationId, actorCoreUserId, createdAt desc)
- idx(organizationId, contactId, createdAt desc)

### 3.9 Campaign

- id, organizationId
- name: string
- channel: enum('fb','ig','tiktok','google','offline','referral','other')
- costMinor: int|null
- currency: string|null
- startAt: timestamptz|null
- endAt: timestamptz|null
- metadata: json
  Indexes:
- unique(organizationId, name)

### 3.10 AttributionEvent

- id, organizationId
- contactId: uuid
- campaignId: uuid|null
- source: string|null
- medium: string|null
- content: string|null
- occurredAt: timestamptz
- metadata: json
  Indexes:
- idx(organizationId, occurredAt desc)
- idx(organizationId, contactId, occurredAt desc)

### 3.11 CustomFieldDefinition

- id, organizationId
- domain: enum('contact','lead','deal','conversation')
- key: string (snake_case)
- label: string
- type: enum('text','number','boolean','date','enum','multi_enum')
- options: string[]|null
- required: bool
- visibility: enum('all','admin_only','restricted')
  Indexes:
- unique(organizationId, domain, key)

---

## 4) Omnichannel (Messaging, Routing, SLA, Compliance)

### 4.1 ChannelAccountConfig

- id, organizationId
- channel: enum('wa','sms','email','webchat','fb','ig')
- providerKey: string (e.g., meta, twilio, sendgrid)
- status: enum('active','disabled','error')
- config: json (validated per provider)
- secretRefId: uuid|null (IntegrationSecretRef reference)
- lastHealthCheckAt: timestamptz|null
- lastErrorSummary: text|null
  Indexes:
- unique(organizationId, channel, providerKey)

### 4.2 Inbox

- id, organizationId
- name: string
- teamId: uuid|null
- channelsEnabled: string[]
- businessHoursPolicyId: uuid|null
- slaConfigId: uuid|null
- routingRuleSetId: uuid|null
- defaultAssigneeCoreUserId: uuid|null
- status: enum('active','archived')
  Indexes:
- unique(organizationId, name)

### 4.3 Conversation

- id, organizationId
- inboxId: uuid
- contactId: uuid
- primaryChannel: enum('wa','sms','email','webchat','fb','ig')
- status: enum('open','pending','closed')
- priority: enum('low','normal','high','urgent')
- assignedCoreUserId: uuid|null
- lastMessageAt: timestamptz|null
- lastInboundAt: timestamptz|null
- lastOutboundAt: timestamptz|null
- slaDeadlineAt: timestamptz|null
- tags: string[]
- attributes: json (language, campaign, etc.)
  Indexes:
- idx(organizationId, inboxId, status, lastMessageAt desc)
- idx(organizationId, assignedCoreUserId, status, lastMessageAt desc)
- idx(organizationId, contactId, lastMessageAt desc)

### 4.4 Message

- id, organizationId
- conversationId: uuid
- direction: enum('inbound','outbound','system')
- channel: enum('wa','sms','email','webchat','fb','ig')
- providerKey: string
- providerMessageId: string|null
- fromIdentityId: uuid|null
- toIdentityId: uuid|null
- subject: string|null
- body: text|null
- attachments: json|null (FileObject refs)
- templateId: uuid|null
- status: enum('queued','sent','delivered','read','failed')
- errorCode: string|null
- errorMessage: text|null
- sentAt: timestamptz|null
- deliveredAt: timestamptz|null
- readAt: timestamptz|null
- metadata: json|null
  Indexes:
- idx(organizationId, conversationId, createdAt)
- unique(organizationId, providerKey, providerMessageId) where providerMessageId not null

### 4.5 MessageDeliveryReceipt

- id, organizationId
- messageId: uuid
- providerStatus: string
- providerPayload: json
- receivedAt: timestamptz
  Indexes:
- idx(organizationId, messageId, receivedAt desc)

### 4.6 RoutingRuleSet

- id, organizationId
- inboxId: uuid
- rules: json (ordered list)
- fallback: json
- version, updatedAt
  Indexes:
- unique(organizationId, inboxId)

### 4.7 Assignment

- id, organizationId
- conversationId: uuid
- assignedToCoreUserId: uuid
- assignedByCoreUserId: uuid
- reason: string|null
- assignedAt: timestamptz
  Indexes:
- idx(organizationId, assignedToCoreUserId, assignedAt desc)

### 4.8 SLAConfig

- id, organizationId
- inboxId: uuid
- firstResponseMinutes: int
- nextResponseMinutes: int
- escalationPolicyId: uuid|null
- active: bool
  Indexes:
- unique(organizationId, inboxId)

### 4.9 SLABreach

- id, organizationId
- conversationId: uuid
- breachType: enum('first_response','next_response')
- breachedAt: timestamptz
- resolvedAt: timestamptz|null
- resolutionNote: text|null

### 4.10 Template + TemplateVersion

Template:

- id, organizationId
- channel: enum('wa','sms','email')
- name: string
- language: string
- content: text
- variablesSchema: json
- status: enum('draft','pending_approval','approved','rejected','archived')
- providerTemplateId: string|null
  TemplateVersion:
- id, organizationId
- templateId
- versionNumber: int
- content
- variablesSchema
- createdAt, createdByUserId
  Indexes:
- unique(organizationId, channel, name, language)

### 4.11 TemplateApproval

- id, organizationId
- templateId
- status: enum('pending','approved','rejected')
- requestedByCoreUserId
- decidedByCoreUserId|null
- decidedAt|null
- note|null

### 4.12 Broadcast + BroadcastRun

Broadcast:

- id, organizationId
- name
- channel
- segmentDefinition: json
- templateId
- scheduleAt
- throttlingPolicy: json
- status: enum('draft','scheduled','running','completed','cancelled')
  BroadcastRun:
- id, organizationId
- broadcastId
- startedAt, finishedAt
- totals: json (sent, failed, opted_out, delivered, read)

### 4.13 Sequence + SequenceStep

Sequence:

- id, organizationId
- name
- status: enum('active','paused','archived')
- segmentDefinition: json
  SequenceStep:
- id, organizationId, sequenceId
- orderIndex: int
- delayMinutes: int
- templateId: uuid
- throttlingPolicy: json
  Indexes:
- unique(organizationId, sequenceId, orderIndex)

### 4.14 ConsentRecord / OptOutRecord

ConsentRecord:

- id, organizationId
- contactIdentityId: uuid
- status: enum('opted_in','opted_out')
- proofRef: string|null
- updatedAt
  OptOutRecord:
- id, organizationId
- contactIdentityId: uuid
- channel: enum('wa','sms','email')
- reason: string|null
- createdAt

---

## 5) Integrations Hub (Configs, Secrets, Webhooks, DLQ)

### 5.1 IntegrationConfig

- id, organizationId
- integrationKey: string (e.g., 'whatsapp.meta','sms.twilio','email.sendgrid')
- status: enum('active','disabled')
- config: json (validated)
- secretRefId: uuid|null
- lastTestAt: timestamptz|null
- lastTestResult: json|null
  Indexes:
- unique(organizationId, integrationKey)

### 5.2 IntegrationSecretRef

**Never store raw secrets.**

- id, organizationId
- name: string
- provider: enum('env','vault','k8s_secret','internal_encrypted')
- ref: string
- rotatedAt: timestamptz|null
- createdAt
  Indexes:
- unique(organizationId, name)

### 5.3 WebhookEndpoint

- id, organizationId
- direction: enum('inbound','outbound')
- url: string
- signingKeyId: uuid|null
- status: enum('active','disabled')
- eventFilters: string[]
- retryPolicy: json
  Indexes:
- idx(organizationId, status)

### 5.4 WebhookSigningKey

- id, organizationId
- name: string
- keyRef: string (secret ref)
- active: bool
- rotatedAt: timestamptz|null

### 5.5 WebhookDelivery

- id, organizationId
- endpointId: uuid
- eventKey: string
- payloadHash: string
- status: enum('queued','sent','failed')
- attempts: int
- lastError: json|null
- createdAt
- lastAttemptAt: timestamptz|null
  Indexes:
- idx(organizationId, endpointId, createdAt desc)
- idx(organizationId, status)

### 5.6 DLQRecord

- id, organizationId
- domain: enum('messaging','webhooks','exports','automation','sync','ai')
- refType: string
- refId: string
- payload: json
- errorSummary: text
- firstFailedAt
- lastFailedAt
- attempts
- status: enum('open','retried','ignored','resolved')
- resolvedAt|null
  Indexes:
- idx(organizationId, domain, status)

---

## 6) Automation Engine (Triggers, Workflows, Runs)

### 6.1 TriggerDefinition

- id, organizationId
- key: string (namespaced: 'omni.message.received')
- description: text
- payloadSchema: json
- enabled: bool
  Indexes:
- unique(organizationId, key)

### 6.2 ActionDefinition

- id, organizationId
- key: string (namespaced: 'crm.lead.assign')
- description
- inputSchema: json
- outputSchema: json
- enabled: bool

### 6.3 WorkflowDefinition

- id, organizationId
- name
- description
- status: enum('draft','active','paused','archived')
- triggerKey: string
- graph: json (nodes/edges, validated)
- concurrencyLimit: int
- version, updatedAt

### 6.4 WorkflowVersion

- id, organizationId
- workflowId
- versionNumber: int
- graph
- createdAt, createdByUserId

### 6.5 WorkflowRun

- id, organizationId
- workflowId
- workflowVersionId
- triggerEventId: string
- status: enum('running','failed','completed','cancelled')
- startedAt, finishedAt
- context: json
- errorSummary: text|null

### 6.6 WorkflowStepRun

- id, organizationId
- workflowRunId
- nodeId: string
- status: enum('running','failed','completed','skipped')
- attempts: int
- startedAt, finishedAt
- lastError: json|null
- output: json|null

### 6.7 ApprovalQueueItem

- id, organizationId
- workflowRunId
- stepRunId
- requestedByCoreUserId
- assignedApproverRoleId|null
- assignedApproverCoreUserId|null
- status: enum('pending','approved','rejected','expired')
- createdAt, decidedAt|null
- decisionNote|null

---

## 7) Analytics & Reporting (Datasets, Reports, Exports)

### 7.1 DatasetDefinition

- id, organizationId
- key: string (e.g., 'crm.leads')
- description
- allowedDimensions: string[]
- allowedMeasures: string[]
- rowLimitDefault: int
- cachingPolicy: json
  Indexes:
- unique(organizationId, key)

### 7.2 ReportDefinition

- id, organizationId
- name
- datasetKey
- querySpec: json (filters, groupBy, measures)
- visibility: enum('private','team','org')
- ownerCoreUserId: uuid
- version, updatedAt
  Indexes:
- idx(organizationId, datasetKey)

### 7.3 ReportRun

- id, organizationId
- reportId
- requestedByCoreUserId
- status: enum('running','failed','completed')
- startedAt, finishedAt
- resultRef: json|null
- errorSummary: text|null

### 7.4 ExportJob

- id, organizationId
- reportRunId
- format: enum('csv','xlsx','pdf')
- status: enum('queued','running','failed','completed','expired')
- fileObjectId: uuid|null
- ttlExpiresAt: timestamptz
- createdAt
  Indexes:
- idx(organizationId, status, createdAt desc)

---

## 8) AI Suite (Providers, Prompts, KB, Usage, Safety)

### 8.1 AIProviderConfig

- id, organizationId
- providerKey: string ('openai','anthropic', etc.)
- mode: enum('primary','fallback')
- model: string
- secretRefId: uuid
- limits: json (rpm,tpm,maxTokens)
- enabled: bool
- createdAt, updatedAt
  Indexes:
- unique(organizationId, providerKey, mode)

### 8.2 ModelPolicy

- id, organizationId
- policyKey: string (e.g., 'reply_drafting')
- allowedModels: string[]
- maxTokens: int
- temperature: float
- toolAllowlist: string[]
- updatedAt

### 8.3 PromptTemplate

- id, organizationId
- name
- purpose
- template: text
- variablesSchema: json
- status: enum('draft','approved','archived')
- version, updatedAt
  Indexes:
- unique(organizationId, name)

### 8.4 KnowledgeBase

- id, organizationId
- name
- description
- accessPolicy: json (roles/users/teams)
- indexRef: string|null (vector store ref)
- createdAt, updatedAt

### 8.5 KnowledgeDocument

- id, organizationId
- knowledgeBaseId
- fileObjectId
- title
- tags: string[]
- status: enum('queued','indexing','indexed','failed')
- indexedAt|null
- errorSummary|null

### 8.6 AIConversation / AIMessage

AIConversation:

- id, organizationId
- scope: enum('internal','crm','omni','analytics')
- relatedEntityType: string|null
- relatedEntityId: string|null
- createdByCoreUserId
- createdAt
  AIMessage:
- id, organizationId
- conversationId
- role: enum('user','assistant','system','tool')
- content: text
- tokenCount: int|null
- providerMeta: json
- createdAt

### 8.7 AISafetyPolicy

- id, organizationId
- name
- redactionRules: json
- blockedCategories: string[]
- requireApprovalForSend: bool
- updatedAt

### 8.8 AIBudget + AIUsageLog

AIBudget:

- id, organizationId
- period: enum('monthly')
- limitMinor: int
- currency: string
- usedMinor: int
- resetAt: timestamptz
  AIUsageLog:
- id, organizationId
- providerKey, model
- userCoreUserId
- requestTokens, responseTokens
- costMinor
- createdAt

---

## 9) Files/Media & Documents

### 9.1 FileObject

- id, organizationId
- bucket: string
- objectKey: string
- contentType: string
- sizeBytes: bigint
- checksumSha256: string
- status: enum('uploading','available','quarantined','deleted')
- visibility: enum('private','org','public_link')
- createdAt, createdByUserId
  Indexes:
- idx(organizationId, createdAt desc)

### 9.2 FileUploadSession

- id, organizationId
- initiatedByCoreUserId
- contentType, sizeBytes, checksumSha256
- uploadUrl: string (short-lived)
- status: enum('created','uploaded','committed','expired')
- expiresAt: timestamptz

### 9.3 FileAccessGrant

- id, organizationId
- fileObjectId
- grantType: enum('user','role','link')
- coreUserId|null
- roleId|null
- signedLinkId|null
- expiresAt|null

### 9.4 SignedLink

- id, organizationId
- fileObjectId
- tokenHash
- expiresAt
- createdAt
- createdByUserId

### 9.5 DocumentTemplate

- id, organizationId
- name
- type: enum('pdf','email','message')
- engine: enum('html','mjml','markdown')
- content: text
- variablesSchema: json
- status: enum('draft','approved','archived')
- version, updatedAt

### 9.6 DocumentRenderJob

- id, organizationId
- templateId
- payload: json
- status: enum('queued','running','failed','completed')
- outputFileObjectId|null
- errorSummary|null
- createdAt

---

## 10) Search & Indexing

### 10.1 SearchIndexConfig

- id, organizationId
- entityType: enum('contact','lead','deal','conversation','message','file','report')
- mapping: json (fields to index)
- enabled: bool
- updatedAt

### 10.2 SearchDocument

- id, organizationId
- entityType
- entityId
- text: text
- fields: json
- permissions: json (roles/users/teams)
- updatedAt
  Indexes:
- unique(organizationId, entityType, entityId)

### 10.3 IndexJob

- id, organizationId
- entityType, entityId
- action: enum('upsert','delete','reindex_all')
- status: enum('queued','running','failed','completed')
- attempts
- errorSummary|null
- createdAt

---

## 11) Notifications

### 11.1 NotificationEvent

- id, organizationId
- typeKey: string (e.g., 'omni.sla.breached')
- targetCoreUserId: uuid
- payload: json
- status: enum('queued','delivered','failed','read')
- createdAt, deliveredAt|null, readAt|null

### 11.2 NotificationPreference

- id, organizationId
- coreUserId
- channelPrefs: json (in_app/email/sms/wa)
- quietHoursPolicyId|null
  Indexes:
- unique(organizationId, coreUserId)

### 11.3 NotificationDelivery

- id, organizationId
- notificationEventId
- channel: enum('in_app','email','sms','wa')
- providerKey: string|null
- providerRef: string|null
- status: enum('queued','sent','failed','delivered','read')
- errorSummary|null
- createdAt

### 11.4 QuietHoursPolicy

- id, organizationId
- name
- timezone: string
- rules: json (days/time windows)
- updatedAt

---

## 12) Billing & Quotas (Framework)

### 12.1 Plan (Platform)

- id: uuid (pk)
- name: string
- limits: json (seats, storageBytes, messagesByChannel, aiBudgetMinor, apiCalls)
- pricing: json|null
- active: bool
- createdAt, updatedAt, version

### 12.2 Subscription

- id, organizationId
- planId
- status: enum('active','trialing','past_due','cancelled')
- startAt, endAt|null
- paymentProviderRef|null
- updatedAt

### 12.3 UsageMeter

- id, organizationId
- periodStart, periodEnd
- seatsUsed: int
- storageBytesUsed: bigint
- messagesSentByChannel: json
- aiCostMinor: int
- apiCalls: int
- updatedAt
  Indexes:
- idx(organizationId, periodStart desc)

### 12.4 QuotaOverride

- id, organizationId
- key: string
- delta: int
- expiresAt: timestamptz
- reason: string
- createdByCoreUserId: uuid

---

## 13) Ops & Support (Optional but Canonical)

### 13.1 Ticket

- id, organizationId
- title
- description
- status: enum('open','pending','resolved','closed')
- priority: enum('low','normal','high','urgent')
- requesterCoreUserId|null
- assignedCoreUserId|null
- createdAt, updatedAt

### 13.2 Incident

- id (platform or tenant based on policy)
- scope: enum('platform','tenant')
- organizationId|null
- title
- status: enum('investigating','mitigating','resolved')
- startedAt, resolvedAt|null
- postmortemRef|null

---

# 14) Schema Completeness Checklist (Must hold)

- [ ] Every suite entity appears here exactly once.
- [ ] Every relation is tenant-safe.
- [ ] Indexes exist for frequent filters.
- [ ] Soft delete is consistent.
- [ ] Sensitive reads emit audit events.
- [ ] JSON fields are schema-validated.
- [ ] Money uses minor units + currency.
- [ ] All enums are closed sets.

**END — 01 SCHEMAS**
