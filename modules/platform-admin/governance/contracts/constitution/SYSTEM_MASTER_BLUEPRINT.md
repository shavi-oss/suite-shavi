# BASSAN.OS — SYSTEM MASTER BLUEPRINT (ULTRA-DETAILED)
**Execution Model:** STRICT · FAIL-CLOSED · IMMUTABLE · GOVERNANCE-FIRST  
**Architecture:** CORE ENGINE ONLY + External Layers/Suites (No business/vertical logic inside Core)  
**Audience Load Profile:** Primarily employee/staff-driven workload (dashboards, workflows, queues, DB-heavy)  
**Document Role:** Single master reference for *everything* (core → layers → suites → pages → models → tools → ops → governance).  
**This document is industry-agnostic.** Client/vertical blueprints are separate overlays built from this master.

> **Source-of-truth note (Core Contract):** Exact endpoint lists/DTOs/guards for Core are locked in governance artifacts under  
`backend/governance/core-contract/` (e.g., contract extract + evidence + lock declaration).  
This master blueprint references that lock and defines all surrounding system architecture, modules, pages, models, and operating rules.

---

## Table of Contents
1. Principles & Non‑Negotiables  
2. Repository & Package Topology  
3. Core Engine Specification (Boundaries, Invariants, Minimal Model)  
4. Full Layer Stack (L0–L9)  
5. System‑Wide Security Model (Auth, Tenant, RBAC, Policies, Audits)  
6. Suites Catalog (All Modules)  
7. Omnichannel Suite (Full Spec)  
8. CRM Foundation Suite (Full Spec)  
9. Automation & Workflow Engine Suite (Full Spec)  
10. Analytics & Reporting Suite (Full Spec)  
11. Integrations Hub Suite (Full Spec)  
12. AI Suite (Provider Abstraction, RAG, Agents, Safety, Budgeting)  
13. Files/Media & Documents (Uploads, Access, Retention)  
14. Search & Indexing (Permission‑Aware Search)  
15. Developer Portal & API Access (Keys, OAuth, Rate Limits, Webhooks)  
16. Notifications System (In‑app, Email/SMS/WA, Preferences)  
17. Billing/Plans/Quotas (Framework + Enforcement)  
18. Client Apps (Web/Mobile) & UX Constraints  
19. Data Ownership Map (Who owns what, references, boundaries)  
20. Cross‑Suite End‑to‑End Workflows  
21. Performance Rules (DB, queues, dashboards, exports)  
22. Observability (Logs, Metrics, Alerts, Tracing)  
23. Deployment, Environments, Release & Migration Policy  
24. Backups, DR, Retention, Compliance  
25. Governance Runtime (Gates, Evidence, Stop Conditions, Tagging)  
26. Definition of Done (DoD) for Modules and Releases  
27. Future Extensions & Vertical Overlay Process

---

# 1) Principles & Non‑Negotiables (Binding)

## 1.1 Core Purity Rule
**Core is the engine.** It must remain:
- minimal
- stable
- governed
- contract-locked

**Core MUST NOT contain:**
- UI/BFF endpoints for dashboards
- Omnichannel logic (routing, templates, inboxes)
- CRM business workflows (pipelines, campaigns)
- Analytics/reporting builders
- Automation workflows and triggers
- AI prompts, KBs, embeddings, agents
- Any vertical model (medical/retail/etc.)
- Any provider‑specific integrations (WhatsApp vendor, SMS vendor, payment gateways)

**Everything above belongs to external suites.**

## 1.2 Fail‑Closed by Default
If any required context is missing or ambiguous:
- deny access
- reject request
- produce structured error
- log audit event for security‑critical failures (rate limited to prevent log floods)

## 1.3 Governance‑First & Immutable History
- Every change is staged and gated.
- Every gated change has:
  - Authorization (scope)
  - Plan (commands + evidence)
  - Evidence (what changed, why, proof)
  - Stop Conditions (hard fails)
  - Tagging (immutable anchor)
- No “fix tests to pass” if authorization does not allow it.
- Patches must be strictly isolated where required (deps-only allowlists, etc.)

## 1.4 Separation of Ownership
- Core owns identity + tenant isolation primitives only.
- Suites own everything business/ops.
- Suites reference Core IDs only (organizationId, userId) and never duplicate engine truth.

## 1.5 “No Work Without CTA”
Every step must end with:
- a command to run
- expected output
- captured evidence (log excerpt, diff summary, screenshots, etc.)
- explicit “GO/NO‑GO”

---

# 2) Repository & Package Topology

## 2.1 Repos
### A) Core Repo (Engine)
- `backend/src/**` — core engine code
- `backend/governance/**` — gates, locks, evidence, policies, patch rules
- `prisma/**` — schema/migrations (governed)

### B) Suite Repo (All applications/modules)
Recommended structure:
```
/governance/
  SYSTEM_MASTER_BLUEPRINT.md  (this file)
  RELEASE_POLICY.md
  ENVIRONMENT_STRATEGY.md

/modules/
  platform-admin/
  tenant-admin/
  workspace/
  crm/
  omnichannel/
  integrations-hub/
  analytics/
  automation/
  ai/
  developer-portal/
  files-media/
  search/
  notifications/
  billing/
  ops-support/
  governance-center/

 /shared/
  ui-kit/
  sdk/
  types/
  policy/
```

### C) Infra (optional repo/folder)
- Docker/Compose
- CI pipelines
- monitoring configs
- backups scripts
- secrets bootstrap scripts

## 2.2 Contract Boundary
- Suites communicate with Core via locked contract (HTTP or generated SDK).
- Core never imports suite modules.
- Suites are allowed to evolve independently, but must respect:
  - Core contract lock
  - tenant isolation
  - policy and permission enforcement

---

# 3) Core Engine Specification (Boundaries, Invariants, Minimal Model)

## 3.1 Core Responsibilities (Engine‑Only)
1) Authentication validation
2) Tenant context establishment
3) Policy enforcement (fail‑closed)
4) Contract-locked endpoints (Core Contract V1)
5) Minimal engine audits (security‑critical)
6) Stage governance enforcement and security linter rules

## 3.2 Core Non‑Goals (Explicit)
- No CRM pipelines
- No omnichannel inbox
- No campaign logic
- No analytics dashboards
- No workflow builder
- No AI features
- No vertical entities

## 3.3 Core Data Model (Minimal, Engine‑Owned)
### Organization (Tenant)
- id (uuid)
- name
- status (active/suspended/locked)
- createdAt, updatedAt

### CoreUser
- id (uuid)
- organizationId (fk)
- email
- status
- createdAt, updatedAt

### Role
- id
- organizationId
- name
- isSystemRole (bool)
- createdAt

### Permission
- key (string)
- description
- category

### RolePermission
- roleId
- permissionKey

### CoreAuditLog (engine-level)
- id
- organizationId
- actorUserId
- actionKey
- targetType/targetId
- ip, userAgent
- createdAt

> Note: Any additional fields must be justified by core necessity and governed.

## 3.4 Core Invariants (Must Always Hold)
- Any request touching tenant data must have orgId set in tenant context.
- Any write action must pass enforcePolicy / permission checks.
- Any endpoint outside locked contract is forbidden unless new gate authorizes it.
- Cross-tenant reads/writes must be impossible by construction.

## 3.5 Core Contract Lock (How to reference)
- `CORE_CONTRACT_V1_LOCK_DECLARATION.md`
- `CORE_CONTRACT_V1_EXTRACT.md` (endpoints, DTOs, guards evidence)
- `CORE_CONTRACT_EVIDENCE_TABLE.md`
- `SPEC_DRIFT_NOTICE.md`
- `GO_NO_GO_DECISION.md`

This blueprint assumes:
- `/api/v1` prefix (as extracted)
- JWT bearer auth and tenant context as per evidence

---

# 4) Full Layer Stack (L0–L9)

## L0 — Edge & Delivery
**Components**
- DNS
- CDN (static assets)
- WAF basic rules
- DDoS mitigation
- TLS termination (edge)
- Rate limiting (edge optional)

**Responsibilities**
- protect origin
- cache static assets
- route traffic to gateway/proxy

**Artifacts**
- DNS records
- TLS cert strategy
- cache rules (static vs dynamic)

## L1 — Reverse Proxy / Gateway
**Components**
- Nginx/Traefik
- health checks
- path routing

**Responsibilities**
- route /core/* vs /suite/* (or subdomains)
- header normalization
- request size limits
- gzip/brotli for supported assets
- security headers baseline

**Artifacts**
- proxy config
- allow/deny lists (optional)
- maintenance mode switches

## L2 — Application Runtime
**Components**
- Core API service
- Suite APIs (BFFs)
- Background workers
- Schedulers

**Responsibilities**
- run business logic (suites)
- enforce permissions and tenant boundaries
- async processing via queues

**Artifacts**
- docker images
- compose files
- runtime env vars (refs)

## L3 — Data Layer
**Components**
- PostgreSQL
- Redis
- Object storage (S3 compatible)
- (Optional) search store, vector store

**Responsibilities**
- durable storage
- caching
- job queue durability and scheduling

**Artifacts**
- DB schema ownership mapping
- backup policy
- retention policy

## L4 — Observability Layer
**Components**
- logs (structured)
- metrics (system + app)
- tracing (optional)
- alerting

**Responsibilities**
- diagnose outages
- detect drift
- measure SLAs

**Artifacts**
- dashboards
- alert rules
- incident runbooks

## L5 — Integration Layer
**Components**
- provider adapters
- webhooks in/out
- delivery and sync logs
- retries + DLQ

**Responsibilities**
- isolate provider weirdness
- make delivery reliable
- protect core from external failures

## L6 — Automation Layer
**Components**
- trigger/event ingestion
- workflow engine
- rule engine
- approvals integration

**Responsibilities**
- reduce manual operations
- make omnichannel + CRM + analytics actionable

## L7 — Omnichannel Layer
**Components**
- unified inbox
- routing/assignment
- templates & approvals
- broadcasts & sequences
- consent/opt-out enforcement

## L8 — AI Layer
**Components**
- provider abstraction
- RAG knowledge bases
- agents/tool calling
- safety and budgets

## L9 — Governance Runtime
**Components**
- gate registry
- evidence capture
- stop conditions monitoring
- tags mirror/verification

---

# 5) System‑Wide Security Model

## 5.1 Authentication
- JWT bearer
- token verification and claim parsing at Core boundary
- suites use verified identity context

## 5.2 Tenant Isolation
- tenant context (orgId/userId) mandatory
- every suite DB query must include orgId filter

## 5.3 Authorization (RBAC + Policies)
- roles contain permissions
- permissions map to suite capabilities
- policies can add additional enforcement (e.g., write methods, sensitive actions)

## 5.4 Sensitive Data Controls
- field-level redaction (e.g., PII) for certain roles
- export restrictions and audit for data exfiltration risk
- “view sensitive record” requires audit entry with reason (optional but recommended)

## 5.5 Audit Taxonomy
**Engine audit (Core)**
- auth failures
- tenant context failures
- permission/policy denies
- critical configuration changes

**Admin audit (Suites)**
- role changes
- settings changes
- integration key rotations

**Business audit (Suites)**
- conversation access
- message sends
- lead updates
- exports and downloads

---

# 6) Suites Catalog (All Modules)
This section defines every suite in the system and everything inside it:
- scope
- pages (all)
- tools and bulk actions
- data model (entities)
- permissions
- workflows
- background jobs
- operational metrics

---

## SUITE A — Platform Admin
### Purpose
Operate the platform globally across tenants.

### Pages
1) **Platform Dashboard**
   - KPIs: tenants, active users, message volume, export volume, AI usage, error rate
   - health tiles: DB, Redis, queue, provider status
   - governance summary: latest tags, open stop conditions

2) **Tenants Registry**
   - list tenants with filters (status, plan, region)
   - create tenant (manual)
   - suspend/lock/unlock tenant
   - view tenant lifecycle timeline

3) **Tenant Details**
   - plan/limits/features
   - tenant metadata (region, created date)
   - usage charts
   - audit summary
   - emergency tools (disable outbound messages, disable exports)

4) **Plans & Quotas**
   - plan definitions: seats, storage, messages, AI budget, API keys
   - enforcement mode: warn vs hard-limit
   - upgrade/downgrade rules

5) **Global Feature Flags**
   - kill switch per suite
   - staged rollout to tenant allowlist/percentage

6) **Global Audit**
   - filters: tenant, actor, action, date
   - export (restricted)

7) **Incidents & Maintenance**
   - incident create/update
   - attach postmortem
   - maintenance announcements to tenants

8) **Provider Status Center**
   - WhatsApp/SMS/Email providers health
   - payment gateway health
   - webhook delivery error spikes

9) **Governance Status**
   - gate registry summary
   - tag mirror verification
   - drift alerts

### Tools
- tenant provisioning tool
- kill switches (per suite/module)
- impersonation (optional, strongly governed)
- quota override (time-limited)
- emergency export disable

### Data Model (Platform-owned)
- PlatformTenantProfile
- PlatformPlan
- PlatformQuotaOverride
- PlatformFeatureFlag
- PlatformIncident
- ProviderStatusSnapshot
- PlatformSupportCase

### Permissions
- platform.*
- governance.read
- platform.audit.read (restricted)
- platform.tenants.manage

---

## SUITE B — Tenant Admin
### Purpose
Configure tenant/company and manage employees, permissions, integrations, and suites.

### Pages
1) **Tenant First-Run Wizard**
   - company profile
   - timezone/currency
   - default roles creation
   - invite first users
   - enable suites
   - connect providers (optional)
   - verification checklist

2) **Company Profile & Branding**
   - name/logo/colors
   - legal info
   - addresses/branches (generic)
   - business hours

3) **Users & Employees**
   - invite user
   - assign role
   - deactivate/reactivate
   - reset access
   - bulk import (CSV)

4) **Teams & Departments**
   - create teams/departments
   - assign employees
   - team inbox mapping (for omnichannel)

5) **Roles & Permissions**
   - role editor
   - permission matrix
   - audit changes
   - permission simulator (tool)

6) **Tenant Settings**
   - module toggles
   - retention policies
   - security policies (2FA/SSO later)
   - export policies

7) **Integrations Settings**
   - channel configs (WA/SMS/Email)
   - payments
   - webhooks
   - API keys

8) **Usage & Budgets**
   - seats usage
   - storage usage
   - message usage by channel
   - AI budgets

9) **Tenant Audit Log**
   - filter by actor/action/module
   - export (restricted)

### Tools
- invitation manager
- CSV importer with mapping and validation
- role permission simulator
- provider test ping (send test message)
- webhooks test delivery

### Data Model
- EmployeeProfile
- Team
- Department
- TenantSettings
- InviteToken
- TenantUsageSnapshot

### Permissions
- tenant.users.*
- tenant.roles.*
- tenant.settings.*
- integrations.config.*
- audit.read

---

## SUITE C — Workspace (Employee)
### Purpose
Day-to-day operational workspace for employees across all suites.

### Pages
1) Home
2) Unified Work Inbox (tasks/approvals/mentions/escalations)
3) Tasks (create/assign/prioritize)
4) Approvals Center
5) Notifications Center
6) Global Search UI
7) Profile & Preferences (quiet hours, language)
8) Saved Views (filters and dashboards shortcuts)

### Tools
- bulk actions (where authorized)
- quick create (task, note, lead, conversation)
- keyboard shortcuts (optional)
- internal notes/mentions

### Data Model
- Task
- ApprovalRequest
- Notification
- SavedView
- Comment
- AttachmentRef

### Permissions
- workspace.*
- tasks.*
- approvals.*

---

## SUITE D — CRM Foundation (Industry-agnostic)
### Purpose
Generic CRM domains for leads, deals, contacts, activities, campaigns.

### Pages
1) CRM Setup
   - pipelines, stages
   - custom fields
   - lead sources
   - scoring rules

2) Contacts
   - list, filters, segments
   - import/export
   - dedupe
   - contact profile (timeline + identities)

3) Accounts/Companies
   - account list
   - account profile (contacts, deals)

4) Leads
   - pipeline board
   - lead profile
   - assignment & routing
   - tasks & next actions

5) Deals/Opportunities
   - pipeline board
   - deal profile
   - stage history

6) Activities
   - calls log
   - meetings
   - notes
   - follow-ups

7) Campaigns
   - campaign definition
   - attribution settings
   - ROI tracking fields

8) CRM Analytics
   - conversion rate
   - pipeline velocity
   - agent performance

### Tools
- importer + field mapping
- duplicate detection & merge
- lead assignment rules engine (automation hook)
- SLA for lead response time

### Data Model
- Contact
- ContactIdentity
- Account
- Lead
- Deal
- Pipeline
- PipelineStage
- Activity
- Note
- Campaign
- AttributionEvent
- CustomFieldDefinition
- CustomFieldValue

### Permissions
- crm.contacts.*
- crm.leads.*
- crm.deals.*
- crm.campaigns.*
- crm.analytics.read

---

## SUITE E — Omnichannel (Industry-agnostic)
### Purpose
Unified inbox and messaging layer across WA/SMS/Email/Webchat and optionally social messaging.

### Channels Supported (Design)
- WhatsApp
- SMS
- Email
- Webchat (widget)
- Facebook/Instagram messaging (connector)
- Voice call log (connector, optional)

### Core Concepts
- Inbox (team-level)
- Conversation (thread)
- Message (in/out)
- Delivery receipts
- Contact identity resolution
- Routing rules
- Assignment and ownership
- SLA policies and breaches
- Templates and approvals
- Broadcasts and sequences
- Consent/opt-out compliance
- Quiet hours + throttling
- Provider failover and retries

### Pages
1) Omnichannel Setup Wizard
   - connect providers
   - create inboxes (per team/department)
   - define routing rules
   - define SLA policies
   - define templates and approval rules
   - define consent and opt-out rules

2) Unified Inbox
   - conversation list
   - filters: channel, status, assigned, SLA, tags
   - bulk assign/close
   - priority queue view

3) Conversation View
   - timeline (messages + events)
   - internal notes
   - contact sidebar (CRM link)
   - quick actions: create lead, task, deal
   - escalation controls
   - message compose with templates
   - attachments sending
   - delivery status display

4) Contact Resolver
   - merge identities
   - split (rare) with audit
   - identity history

5) Routing Rules
   - by channel
   - by language
   - by campaign/source
   - by business hours
   - overflow queues

6) SLA & Escalations
   - SLA configs
   - breach logs
   - escalation matrix

7) Templates Library
   - templates by channel
   - variables and personalization tokens
   - approval workflow
   - template versioning

8) Broadcasts & Sequences
   - segments selection
   - scheduling
   - throttling rules
   - quiet hours enforcement
   - opt-out compliance
   - A/B testing hooks (optional later)

9) Delivery Logs
   - per message delivery receipt
   - errors + retries
   - DLQ view

10) Omnichannel Analytics
   - response time
   - SLA compliance
   - agent performance
   - delivery success rate
   - opt-out rates

### Tools
- template variable inspector
- compliance checker (consent/opt-out)
- throttling configuration
- quiet hours editor
- retry failed deliveries
- provider status monitor

### Data Model
- Inbox
- Conversation
- Message
- MessageDeliveryReceipt
- ChannelAccountConfig
- ContactIdentity (shared with CRM)
- RoutingRule
- Assignment
- SLAConfig
- SLABreach
- Template
- TemplateApproval
- TemplateVersion
- Broadcast
- BroadcastRun
- Sequence
- SequenceStep
- OptOutRecord
- ConsentRecord
- ProviderStatusSnapshot
- DLQRecord

### Permissions
- omnichannel.inbox.read
- omnichannel.conversation.*
- omnichannel.templates.*
- omnichannel.broadcasts.*
- omnichannel.config.*

---

## SUITE F — Integrations Hub
### Purpose
Centralize all integrations (channels, payments, webhooks, external systems).

### Pages
1) Integrations Catalog
2) Provider Configs (WA/SMS/Email/Payments)
3) Webhooks Manager (in/out)
4) Delivery & Sync Logs
5) Secrets Reference Manager (rotate keys)
6) Health Checks & Status
7) DLQ Viewer (retry tools)

### Tools
- send test message
- test webhook
- rotate secret
- retry DLQ items
- export logs (restricted)

### Data Model
- Integration
- IntegrationConfig
- IntegrationSecretRef
- WebhookEndpoint
- WebhookSubscription
- WebhookDelivery
- SyncJob
- SyncRun
- DLQRecord
- HealthCheckResult

### Permissions
- integrations.*
- secrets.manage (restricted)
- webhooks.*

---

## SUITE G — Analytics & Reporting
### Purpose
Dashboards and reporting across CRM, omnichannel, automation, billing, ops.

### Pages
1) Analytics Home (KPI cards)
2) Dashboards (built-in + custom)
3) Reports Catalog
4) Report Builder (controlled, safe)
5) Scheduled Reports
6) Exports Center
7) Data Health
8) Performance Monitor (slow queries)

### Tools
- dataset selector
- guardrails (mandatory date range, row limits)
- background exports
- caching controls
- snapshot manager (optional)

### Data Model
- DatasetDefinition
- ReportDefinition
- ReportRun
- ReportSchedule
- ExportJob
- KPIConfig
- AnalyticsSnapshot

### Permissions
- analytics.read
- analytics.reports.*
- analytics.exports.*

---

## SUITE H — Automation & Workflows
### Purpose
Event-driven workflows with approvals and retries.

### Pages
1) Automation Setup
2) Trigger Catalog
3) Workflow Builder
4) Action Catalog
5) Workflow Runs (history + failures)
6) Approval Queues
7) Automation Audit & Versioning

### Triggers (examples)
- new inbound message
- new lead created
- deal stage changed
- SLA breach
- payment received
- export completed
- AI classification completed

### Actions (examples)
- send message
- create task
- assign conversation
- update CRM fields
- call webhook
- notify manager
- create report export
- request approval

### Tools
- dry run simulator
- rollback policy (best-effort)
- concurrency limits
- workflow kill switch

### Data Model
- TriggerDefinition
- WorkflowDefinition
- WorkflowVersion
- WorkflowRun
- WorkflowStepRun
- ActionDefinition
- ApprovalQueueItem
- AutomationAuditEvent

### Permissions
- automation.*
- approvals.*

---

## SUITE I — AI Suite
### Purpose
AI capabilities as modular features with safety and budgets.

### Pages
1) Provider Setup
2) AI Chat (role-based assistants)
3) Prompt Templates (approval flow)
4) Knowledge Bases (RAG)
5) AI Workflows (summarize/classify/draft)
6) Budget & Cost Control
7) Safety Policies & Redaction
8) AI Audit & Feedback (quality)

### Tools
- provider fallback configuration
- caching policy editor
- prompt evaluator (offline test)
- PII redaction rules editor
- budget alerts & kill switch

### Data Model
- AIProviderConfig
- ModelPolicy
- PromptTemplate
- PromptApproval
- AIConversation
- AIMessage
- KnowledgeBase
- KnowledgeDocument
- VectorIndexRef
- AIBudget
- AIUsageLog
- AICacheEntry
- AISafetyPolicy
- AIFeedback

### Permissions
- ai.*
- ai.kb.*
- ai.prompts.*
- ai.budget.manage (restricted)

---

## SUITE J — Files/Media & Documents
### Purpose
Centralize uploads, attachments, document templates, retention and access control.

### Pages
1) Storage Overview
2) Upload Policies
3) File Browser (tenant-scoped, permission-aware)
4) Document Templates (PDF/email/WA templates)
5) Retention Policies
6) Virus Scan Status (optional)
7) Signed URL Audit

### Tools
- signed URL generator
- retention simulator
- bulk delete (restricted + audited)
- quarantine manager (optional)

### Data Model
- FileObject
- FileAccessGrant
- FileUploadSession
- DocumentTemplate
- DocumentRenderJob
- RetentionPolicy
- FileAuditEvent

### Permissions
- files.read
- files.upload
- files.delete (restricted)
- docs.templates.*

---

## SUITE K — Search & Indexing
### Purpose
Global search across permitted objects with indexing pipelines.

### Pages
1) Search Admin
2) Index Status Dashboard
3) Index Sources (CRM, Omnichannel, Files, Analytics)
4) Reindex Jobs
5) Query Logs (restricted)
6) Search UI (integrated into Workspace)

### Tools
- reindex trigger
- schema mapping editor
- permission filter tester

### Data Model
- SearchIndexConfig
- SearchDocument
- IndexJob
- IndexRun
- SearchQueryLog (restricted)

### Permissions
- search.admin
- search.read

---

## SUITE L — Developer Portal & API Access
### Purpose
Tenant developers manage API keys, webhooks, SDK settings, and rate limits.

### Pages
1) API Keys
2) OAuth Clients (optional)
3) Webhooks Subscriptions
4) Rate Limits & Quotas
5) API Logs (restricted)
6) SDK Downloads/Docs (optional)

### Tools
- key rotation
- revoke tokens
- webhook signing keys
- sandbox vs prod configs

### Data Model
- ApiKey
- ApiKeyUsage
- OAuthClient
- OAuthToken
- WebhookSigningKey
- RateLimitPolicy
- DeveloperAuditEvent

### Permissions
- developer.*
- api.keys.manage

---

## SUITE M — Notifications
### Purpose
Unified notifications across in-app + email + SMS + WhatsApp, with preferences.

### Pages
1) Notification Center (user)
2) Preferences (user)
3) Notification Admin (tenant)
4) Templates (shared with omnichannel/docs)
5) Delivery Logs
6) Quiet Hours

### Tools
- preference simulator
- template preview
- resend notifications (restricted)

### Data Model
- NotificationEvent
- NotificationPreference
- NotificationDelivery
- NotificationTemplate
- QuietHoursPolicy

### Permissions
- notifications.*
- templates.read

---

## SUITE N — Billing & Quotas (Framework)
### Purpose
Plans, billing records, quotas, enforcement and alerts.

### Pages
1) Plans (tenant view)
2) Usage & Limits
3) Invoices/Receipts (optional)
4) Payment Methods (optional)
5) Quota Alerts
6) Billing Admin (platform)

### Tools
- quota override (time-limited)
- plan upgrade/downgrade
- enforcement mode (warn/hard)

### Data Model
- Plan
- Subscription
- Quota
- UsageMeter
- Invoice (optional)
- PaymentMethodRef (optional)
- QuotaOverride
- BillingAuditEvent

### Permissions
- billing.*
- quotas.manage (restricted)

---

## SUITE O — Ops & Support
### Purpose
Tickets, incidents, SLAs, runbooks and operational communication.

### Pages
- Tickets list
- Ticket details
- Incident management
- SLA dashboards
- Runbooks library
- Maintenance announcements

### Data Model
- Ticket
- TicketComment
- Incident
- SLARecord
- RunbookLink

### Permissions
- ops.*
- support.*

---

## SUITE P — Governance Center
### Purpose
Governance UI aligned with your gate/tag discipline.

### Pages
- Gate registry
- Authorization library
- Evidence bundles viewer
- Stop conditions monitor
- Tag verification mirror
- Patch tracker

### Data Model
- GovernanceGate
- AuthorizationDocIndex
- EvidenceBundleIndex
- StopConditionEvent
- TagRegistryMirror

### Permissions
- governance.*
- governance.audit.read

---

# 7) Data Ownership Map (Authoritative)
## 7.1 Core-owned
Organization, CoreUser, Role, Permission, RolePermission, CoreAuditLog

## 7.2 Platform-owned
PlatformTenantProfile, PlatformPlan, PlatformFeatureFlag, PlatformIncident, ProviderStatusSnapshot

## 7.3 Tenant-owned (Admin + Suites)
EmployeeProfile, TenantSettings, Teams, Departments

## 7.4 CRM-owned
Contacts, Leads, Deals, Pipelines, Campaigns, Activities

## 7.5 Omnichannel-owned
Inboxes, Conversations, Messages, Templates, Routing, SLA, Consent/Opt-out

## 7.6 Integrations-owned
Provider configs, secrets refs, webhooks, delivery logs, DLQ

## 7.7 Analytics-owned
Datasets, reports, exports, snapshots

## 7.8 Automation-owned
Workflows, triggers, runs, approvals

## 7.9 AI-owned
Provider configs, KBs, prompts, usage logs, safety policies

## 7.10 Files/Search/Notifications/Billing owned
As defined in their suites.

---

# 8) Cross‑Suite End‑to‑End Workflows (System Canon)
## 8.1 Tenant onboarding
Platform Admin → Tenant Admin wizard → enable suites → connect integrations → verify permissions → go live

## 8.2 Omnichannel inbound → CRM
Inbound message → identity resolve → conversation created → routed/assigned → reply using template → create lead/deal → tasks → analytics

## 8.3 SLA breach escalation
SLA policy triggers → automation escalates → manager notified → incident optional → analytics updated

## 8.4 Broadcast compliance workflow
Segment → consent check → broadcast send (throttled) → receipts → opt-out enforcement → ROI tracking

## 8.5 Export governance
User requests export → permission check + audit → background export job → notify user → retention policy deletes export after TTL

## 8.6 AI-assisted workflows
AI drafts reply → requires approval (optional) → send via omnichannel → log usage & cost → feedback recorded

---

# 9) Performance Rules (Non‑Negotiable)
- All list endpoints paginated.
- All dashboards have default date range and index-friendly filters.
- Exports are background jobs only.
- Messaging uses queues with retries and DLQ.
- Report builder has guardrails (max rows, timeout, caching).
- Search results permission-filtered at query time.
- Any heavy processing must be on workers, never blocking request threads.

---

# 10) Observability (What MUST exist)
## 10.1 Logs
- request logs (sampled)
- error logs (all)
- audit logs (all sensitive)
- delivery logs (integrations)
- workflow run logs
- AI usage logs

## 10.2 Metrics
- latency p50/p95/p99
- error rate
- queue depth
- DB connections, slow queries
- message send success rate
- SLA compliance rate
- export duration
- AI token usage per tenant

## 10.3 Alerts
- DB saturation
- queue backlog
- provider outage
- SLA breach spikes
- auth/policy deny spikes (possible attack)
- disk space
- backup failures

---

# 11) Deployment, Environments, Releases
## 11.1 Environments
- dev
- staging
- production

## 11.2 Release Flow
dev → staging → production with:
- migration policy
- feature flags
- rollback playbook

## 11.3 Migration Policy
- forward-only migrations by default
- rollback requires explicit plan
- schema changes governed (core more strict than suites)

---

# 12) Backups, DR, Retention
- daily backups
- offsite storage
- restore drills (monthly)
- retention policies per data type
- GDPR-like deletion flows (if required later)

---

# 13) Governance Runtime (Do not drift)
- every change has authorization + evidence + tag
- stop conditions enforced
- patch rules enforced
- tag verification mirrored in Governance Center suite

---

# 14) Definition of Done (Module)
A module is not done unless:
- permissions exist and enforced
- audits exist for sensitive actions
- performance guardrails implemented
- backup/restore tested for its data
- monitoring and alerts defined
- governance artifacts updated where required

---

# 15) Vertical Overlay Process (Next Step After This Master)
Client/vertical blueprint must specify:
- enabled suites
- extra models and pages for the vertical
- workflows and roles
- data retention and compliance
- integrations required
- AI assistants and prompts
- KPI dashboards specific to vertical

END.
