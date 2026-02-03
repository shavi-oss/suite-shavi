# ULTRA SPEC PART 2 — 09 OMNICHANNEL PROVIDER LAYER (Deep · Execution Canonical)

**Last Updated:** 2026-02-01  
**Status:** CANONICAL (Messaging Provider Abstraction & Execution Layer)  
**Depends on:** `02_API_CONTRACTS.md`, `03_PERMISSIONS_MATRIX.md`, `05_WORKERS_AND_JOBS.md`, `06_EVENTS_AND_OBSERVABILITY.md`

> **🔴 SCOPE NOTICE:** This describes **SUITE-LAYER** omnichannel/messaging (future). Core v1 has NO messaging system. See: `backend/governance/core-contract/CORE_CONTRACT_V1_EXTRACT.md`

> **Meaning:** This document defines how all communication providers are integrated behind a unified abstraction layer.
> The goal is to allow Bassan Suites to support multiple messaging channels and providers without leaking provider complexity into business logic.

Supported domains:

- WhatsApp
- SMS
- Email
- Instagram DM
- Facebook Messenger
- Future channels (Telegram, in-app, etc.)

---

# 0) Non‑Negotiable Principles

## 0.1 Provider Abstraction

Suites must not call providers directly.

Flow:
Suite → Omni Service → Provider Adapter → Provider API

Switching provider must not require business logic changes.

## 0.2 Tenant Isolation

Provider configs belong to a tenant organization.
No config sharing across tenants.

## 0.3 Provider Independence

Each inbox/channel instance binds to one provider config but system can support multiple per org.

## 0.4 Fail‑Closed

If provider config invalid or degraded:

- message send fails safely
- jobs retried or DLQ
  Never silently drop messages.

---

# 1) Provider Configuration Model

## 1.1 ProviderConfig Entity

Contains:

- id
- organizationId
- providerType (twilio, meta, sendgrid, etc.)
- channel (sms, wa, email, ig, fb)
- credentialsRef (secret ref)
- sender identity info
- rate limits
- health status
- lastHealthCheckAt

Credentials stored via secret reference, never raw.

## 1.2 Config Lifecycle

States:

- created
- active
- degraded
- disabled

Transitions:

- healthcheck failure → degraded
- manual disable → disabled
- successful healthcheck → active

---

# 2) Provider Adapter Interface

## 2.1 Required Adapter Methods

Each adapter implements:

sendMessage(payload)
fetchDeliveryStatus(messageId)
validateWebhook(signature, payload)
mapInboundMessage(payload)
healthcheck(config)
uploadMedia(fileRef)

## 2.2 Standardized Send Payload

Internal payload normalized:
{
conversationId,
messageId,
channel,
from,
to,
body,
templateId,
attachments[]
}

Adapter converts to provider format.

---

# 3) Message Send Execution Flow

1. API request creates message record
2. Job enqueued: omni.send_outbound_message
3. Worker loads provider config
4. Adapter sends message
5. Provider response persisted
6. Event emitted: omni.message.sent or failed

Failures classified per job rules.

---

# 4) Template Lifecycle

## 4.1 Template States

draft → submitted → approved → rejected → synced

## 4.2 Approval Flow

Some providers require external approval.
System must:

- submit template
- poll status or receive webhook
- sync local status

## 4.3 Versioning

Templates immutable after approval.
New edit → new version.

---

# 5) Webhook Ingestion Layer

## 5.1 Webhook Flow

Provider → Webhook endpoint → validation → job enqueue → processing

## 5.2 Security

- signature validation mandatory
- timestamp validation
- replay protection using payload hash

## 5.3 Events Produced

- inbound message received
- delivery status update
- read receipts

Mapped into unified event model.

---

# 6) Rate Limits, Quotas & Throttling

## 6.1 Provider Rate Limits

Adapters must respect:

- per-second limits
- per-number/channel limits

## 6.2 Tenant Throttling

System applies tenant quotas:

- messages per minute
- broadcast throttling
- sequence pacing

## 6.3 Backoff Strategy

If rate limited:

- retry using exponential backoff
- avoid flooding provider.

---

# 7) Message State Machine

queued → sending → sent → delivered → read → failed

Retries:
failed → retrying → sent OR DLQ

States stored in Message table.

---

# 8) Healthcheck System

## 8.1 Healthcheck Job

Periodic job:

- validate credentials
- ping provider endpoint
- send lightweight test

## 8.2 Status Impact

If degraded:

- new sends blocked or limited
- admins alerted
- fallback provider possible (future).

---

# 9) Multi‑Provider Strategy

## 9.1 Current Model

One provider per inbox/channel.

## 9.2 Future Model

Allow fallback routing:
primary → fallback provider.

Requires compatibility rules.

---

# 10) Security Considerations

- credentials never logged
- webhook secrets rotated periodically
- inbound payload sanitized
- attachments validated

---

# 11) Observability Hooks

Emit events:

- omni.provider.send.started
- omni.provider.send.completed
- omni.provider.send.failed
- omni.provider.webhook.received
- omni.provider.health.degraded

Metrics:

- send latency
- provider errors
- rate limit blocks

---

# 12) Implementation Checklist

- [ ] Provider abstraction implemented
- [ ] Credentials stored as secret refs
- [ ] Send jobs idempotent
- [ ] Webhook validation active
- [ ] Template sync implemented
- [ ] Healthchecks scheduled
- [ ] Provider metrics exposed

**END — 09 OMNICHANNEL PROVIDER LAYER**
