# ULTRA SPEC PART 2 — 04 DATA ACCESS & SECURITY (Deep · Execution Canonical)

**Last Updated:** 2026-02-01  
**Status:** CANONICAL (Security-First Data Access Rules for All Suites)  
**Depends on:** `01_SCHEMAS.md` + `03_PERMISSIONS_MATRIX.md`  
**Must not conflict with:** Core Contract lock artifacts under `backend/governance/core-contract/`

> **🔴 SCOPE NOTICE — CRITICAL:**  
> This document describes **SUITE-LAYER SECURITY RULES** (future implementation).  
> **Core Contract v1 has simpler security:**
>
> - JWT authentication only (no permission system)
> - CLS-based tenant isolation
> - NO PII classification/auditing
> - NO secrets management (beyond JWT_SECRET)
>
> This doc describes Suite-layer security: permissions, PII auditing, secrets rotation, etc.  
> Evidence: No permission guards, no audit events in Core code.  
> See: `backend/governance/core-contract/CORE_CONTRACT_V1_EXTRACT.md`

> **Meaning:** This file defines the _non-negotiable_ security and data-access rules that every suite must implement.
> It covers tenant isolation, PII classification, encryption, secrets, logging, threat model, and stop conditions.

---

# 0) Global Security Posture (Non-Negotiable)

## 0.1 Deny-by-Default

- Every endpoint must map to a permission key in `03_PERMISSIONS_MATRIX.md`.
- If no mapping or permission not present → **403 permission_denied**.
- No “public” endpoints except explicit health endpoints (platform-only, no tenant data).

## 0.2 Fail-Closed Invariants

Any uncertainty must fail-closed:

- missing organization context → 403
- invalid role mapping → 403
- missing required policy config → 403
- provider misconfigured → 409/503 but **never** fallback silently to unsafe behavior
- ambiguous identity match (contact identity collisions) → 409 (unless merge policy explicitly allowed)

## 0.3 Immutable Audit for Security-Sensitive Operations

All security-sensitive operations MUST emit audit events:

- role changes, permission changes
- secret refs created/updated/rotated
- template approvals, AI prompt approvals
- exports created/downloaded
- PII reads (when policy enabled)
- failed auth attempts (optional) at suite gateway

Audit is append-only. No delete; retention policy controls aging out.

## 0.4 Tenant Isolation is Sacred

- No cross-tenant reads or writes.
- Never accept organizationId from client body for tenant-owned resources; always derive from auth context.
- Any attempt to reference an entity from another organization → 404 (do not leak existence).

---

# 1) Tenant Isolation (Data Layer Rules)

## 1.1 Core Isolation Pattern

For every tenant-owned table (see `01_SCHEMAS.md`), every query must include:

- `WHERE organizationId = :orgId`

**NO EXCEPTIONS.**

## 1.2 Foreign Key & Relation Safety

At write time, enforce tenant consistency:

- If inserting a row referencing `contactId`, then referenced contact must belong to same org.
- If referencing `inboxId`, ensure inbox belongs to same org.
- If linking `conversationId → message`, ensure both share org.

Implementation:

- app-layer checks before write (fast path)
- optionally DB check constraints / triggers later (hardening)

## 1.3 Soft Delete & Access Filters

Default list queries must filter out soft-deleted rows:

- `isDeleted = false`
- optionally allow admin to query deleted via `includeDeleted=true` and permission `*.manage`.

## 1.4 “Not Found” vs “Forbidden”

When resource exists but user lacks permission:

- Prefer **404 not_found** for entity-specific reads to reduce enumeration risk, unless UI needs explicit 403.
  When request is clearly blocked by role mapping:
- return 403.

Guideline:

- listing endpoints: 403 is ok
- entity endpoints: 404 if not authorized for that entity type

## 1.5 Row-Level Security (RLS) (Future Hardening)

If Postgres RLS is adopted:

- enable RLS on tenant tables
- policy: `organizationId = current_setting('app.current_org')::uuid`
- set `app.current_org` per request using DB session or transaction local setting

RLS is optional but recommended when:

- multiple services share same DB
- high compliance environment
- risk of developer mistakes is high

---

# 2) Data Classification (PII & Sensitive Data)

## 2.1 Classification Levels

- **L0 Public**: non-sensitive metadata (feature flags, public content)
- **L1 Internal**: operational metadata (task titles, counts) without PII
- **L2 PII**: phone, email, names, addresses, conversation transcripts, medical notes (industry vertical)
- **L3 Secrets**: API keys, signing keys, encryption keys, provider tokens
- **L4 Highly Sensitive**: medical records, national IDs, payment instrument details (if ever stored; avoid)

## 2.2 What Counts as PII (L2)

From `01_SCHEMAS.md`:

- Contact: primaryPhone, primaryEmail, names, notesSummary, customFieldValues if contains PII
- ContactIdentity: identity values, consentProofRef
- Conversation/Message: message body, attachments metadata can be sensitive
- EmployeeProfile: phone/email
- Export contents: any dataset with PII

## 2.3 PII Read Auditing

If tenant policy `compliancePolicy.consentRequired` OR `securityPolicy` indicates auditing:

- reading Contact details emits `crm.contact.read_sensitive`
- reading Message bodies emits `omni.message.read_body`
- exports download emits `analytics.export.downloaded`
- knowledge docs read emits `ai.knowledge.read`

Audit includes:

- actor coreUserId
- entityRef
- requestId
- reason (if provided)
- access path (endpoint + query)

## 2.4 Data Minimization & Redaction (Default)

- List endpoints return **minimal** fields.
  - Example: Conversations list returns message preview only if permitted and sanitized.
- Message bodies require explicit permission `omni.messages.read_body`.
- Integrations secrets never returned raw; always redacted:
  - `ref` may be shown, but not the secret itself.

Redaction patterns:

- mask phone numbers (last 3 digits)
- mask emails (first 2 chars + domain)
- redact tokens (show last 4 chars)

---

# 3) Encryption & Key Management

## 3.1 Encryption at Rest

Minimum expectation:

- DB uses encrypted storage (cloud provider managed disks)
- backups encrypted (provider default or KMS)

## 3.2 Field-Level Encryption (Recommended for L3/L4)

For L3 data (even references):

- store as **secret ref** (IntegrationSecretRef) rather than raw.
  If ever storing sensitive text (e.g., medical notes) in vertical suites:
- use application-level envelope encryption:
  - data key per org
  - key stored in KMS/vault
  - rotate keys with re-encryption job

## 3.3 Hashing

- InviteToken.tokenHash: strong hash (bcrypt/argon2) — never store raw token.
- SignedLink.tokenHash: hash the token; store hash only.

## 3.4 Signing Keys & Webhooks

- Each webhook endpoint has signing key reference.
- Incoming webhook verification:
  - validate signature header
  - validate timestamp window (replay prevention)
  - validate payload hash and dedupe by `payloadHash` per endpoint per TTL

---

# 4) Secrets Handling (Non-Negotiable)

## 4.1 Never Store Raw Secrets in DB

Use `IntegrationSecretRef` (provider: vault/env/k8s_secret/internal_encrypted).
DB stores only reference:

- secret name
- provider type
- ref pointer string
- rotatedAt

## 4.2 Secret Rotation Protocol

Rotation action requires:

- permission `integrations.secrets.rotate`
- audit event with reason
- optional step-up auth (future)
  Rotation outcomes:
- immediate activation, old ref retained for rollback TTL (e.g., 24h)
- provider healthcheck must pass after rotation
- if healthcheck fails → auto rollback and incident event

## 4.3 Least Privilege Access

- runtime service reads only secrets it needs.
- separate secrets for:
  - messaging provider
  - email provider
  - AI provider
  - storage provider
  - webhook signing

---

# 5) Logging, Observability, and Sensitive Data Controls

## 5.1 Logging Rules

- No PII in logs by default.
- All logs must include requestId.
- Log levels:
  - info: lifecycle events (created, queued, sent)
  - warn: policy blocks, provider errors (redacted)
  - error: internal errors (redacted, with trace id)

## 5.2 Correlation & Traceability

- `X-Request-Id` propagated to workers.
- Each job has `jobId`, includes original requestId.

## 5.3 Metrics (Minimum)

- request latency per endpoint
- errors per endpoint (by error code)
- outbound message throughput + failure rates
- webhook delivery success rate
- job queue delay
- AI token usage + cost

---

# 6) Threat Model by Suite (Actionable)

## 6.1 Tenant Admin

Threats:

- privilege escalation via role edits
- mass invites/spam
  Controls:
- strict `tenant.roles.manage`
- audit everything
- rate limit invites
- prevent deleting role in use

## 6.2 CRM

Threats:

- contact enumeration
- identity collision leading to data leaks
  Controls:
- 404 for unauthorized entity reads
- unique identity constraints per org
- merge restricted + idempotent + audited

## 6.3 Omnichannel

Threats:

- sending messages without consent
- reading message bodies without authorization
- provider webhook forgery
  Controls:
- consent + quiet-hours gates
- `omni.messages.read_body` required for body
- webhook signature verification + replay protection
- message send is async with idempotency-key

## 6.4 Integrations

Threats:

- secrets exfiltration
- SSRF via webhook URLs
  Controls:
- never return raw secrets
- validate URLs (allowlist protocols, block internal IP ranges)
- rotate secrets with healthcheck

## 6.5 Analytics

Threats:

- exporting PII broadly
  Controls:
- export creation restricted
- export TTL + signed links
- audit downloads

## 6.6 Automation

Threats:

- runaway workflow spam
- privilege escalation by workflow actions
  Controls:
- workflow actions executed with _workflow service identity_ but authorized against creator’s permissions at activation time
- concurrency limits
- approvals for sensitive actions (send, export, secret changes)

## 6.7 AI

Threats:

- prompt injection
- data exfiltration from KB
- uncontrolled cost
  Controls:
- tool allowlist per policy key
- KB access policy enforcement
- redaction rules applied to outputs
- budget enforcement (AIBudget) + hard caps
- require approval for sending AI-generated outbound messages (tenant policy)

---

# 7) Stop Conditions (Hard HALT Triggers)

If any of the following occurs, the system MUST halt execution of the current operation and return `stop_condition_triggered` (or fail-closed equivalent):

## 7.1 Tenant Scope Violation

- request attempts to access entity with different organizationId

## 7.2 Permission Mapping Missing

- endpoint invoked without permission mapping in `03_PERMISSIONS_MATRIX.md`

## 7.3 Secrets Exposure Attempt

- code path attempts to return raw secrets or logs secret values

## 7.4 Consent/Policy Bypass Attempt

- detected attempt to send messages ignoring consent gate or quiet hours without explicit override capability

## 7.5 Webhook Signature Failure

- invalid signature or replay detected (reject request and optionally disable endpoint after threshold)

## 7.6 AI Safety Policy Violation

- generation blocked category; return `policy_blocked` and log audit

---

# 8) Implementation Checklist (Must Pass Before Shipping)

- [ ] All handlers enforce orgId scoping in every query.
- [ ] All endpoints mapped to permissions.
- [ ] Sensitive reads audited when policy enabled.
- [ ] Secrets stored as refs only; rotation path audited.
- [ ] Webhook verification + replay prevention implemented.
- [ ] Logs redacted; no PII in logs by default.
- [ ] Idempotency enforced for side-effect endpoints.
- [ ] Stop conditions implemented and tested.

**END — 04 DATA ACCESS & SECURITY**
