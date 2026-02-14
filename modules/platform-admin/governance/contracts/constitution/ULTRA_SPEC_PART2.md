# BASSAN.OS — ULTRA SPEC PART 2
## Detailed Schemas · API Contracts · Workflow Graphs

This document extends SYSTEM_MASTER_BLUEPRINT and SYSTEM_MASTER_BLUEPRINT_ULTRA
by defining deeper execution-level details:

- Field-level entity schemas
- Suite API/BFF contracts
- Workflow execution graphs
- Event catalog
- Permission enforcement mapping
- Worker payload contracts

This document is implementation-oriented and intended for engineering execution.

---

# 1) DETAILED DATA SCHEMAS

## 1.1 Contact (CRM)
id: UUID (PK)
organizationId: UUID (indexed)
firstName: string
lastName: string
primaryPhone: string (indexed)
primaryEmail: string (indexed)
tags: string[]
status: enum(active, archived, blocked)
ownerUserId: UUID
createdAt, updatedAt
isDeleted, deletedAt

Relations:
- identities (ContactIdentity)
- activities
- leads
- conversations

Indexes:
(orgId, primaryPhone)
(orgId, primaryEmail)

---

## 1.2 Lead
id: UUID
organizationId: UUID
contactId: UUID
pipelineId: UUID
stageId: UUID
source: string
score: number
assignedUserId: UUID
nextActionAt: timestamp
createdAt, updatedAt

---

## 1.3 Conversation (Omnichannel)
id: UUID
organizationId: UUID
contactId: UUID
inboxId: UUID
assignedUserId: UUID
status: enum(open, pending, closed)
lastMessageAt: timestamp
slaDeadlineAt: timestamp
createdAt, updatedAt

Indexes:
(orgId, inboxId, status)
(orgId, assignedUserId, status)

---

## 1.4 Message
id: UUID
organizationId: UUID
conversationId: UUID
direction: enum(inbound, outbound)
channel: enum(wa, sms, email, webchat)
providerMessageId: string
body: text
attachments: json
deliveryStatus: enum(sent, delivered, failed)
createdAt

---

# 2) SUITE API CONTRACT GUIDELINES

## 2.1 CRM BFF Endpoints
GET   /crm/contacts
POST  /crm/contacts
GET   /crm/contacts/{id}
PATCH /crm/contacts/{id}
DELETE /crm/contacts/{id}

Query:
?page=1&limit=25&search=...&tags=...

Response:
{
  "data": [],
  "meta": { "page": 1, "total": 100 }
}

---

## 2.2 Omnichannel Endpoints
GET /omnichannel/conversations
POST /omnichannel/conversations/{id}/assign
POST /omnichannel/conversations/{id}/messages
POST /omnichannel/messages/{id}/retry

---

## 2.3 Automation Endpoints
GET /automation/workflows
POST /automation/workflows
POST /automation/workflows/{id}/activate
POST /automation/workflows/{id}/deactivate

---

# 3) WORKFLOW EXECUTION GRAPH MODEL

Workflow execution is represented as:

Trigger -> Conditions -> Actions -> Optional Approvals -> Completion

Example:
Inbound Message
  -> Check Contact Exists
    -> If not: Create Contact
      -> Assign Conversation
        -> Notify Agent
          -> Log Analytics Event

Workflow nodes must support:
- retry
- timeout
- manual override
- audit trail

---

# 4) EVENT CATALOG (SYSTEM-WIDE)

Core Events:
user.created
tenant.created
role.updated

CRM Events:
contact.created
lead.stage.changed
deal.closed

Omnichannel Events:
message.received
conversation.assigned
sla.breached

Automation Events:
workflow.started
workflow.step.failed
workflow.completed

AI Events:
ai.request.started
ai.response.generated
ai.cost.logged

Analytics Events:
report.generated
export.completed

---

# 5) PERMISSION ENFORCEMENT MAP

Example:

crm.contacts.read
  -> GET /crm/contacts
  -> Search results
  -> Workspace quick access

crm.contacts.write
  -> POST/PATCH contacts
  -> bulk imports

omnichannel.reply
  -> send outbound message

analytics.export
  -> generate export jobs

ai.chat.use
  -> start AI chat session

---

# 6) WORKER PAYLOAD CONTRACTS

## Messaging Worker
payload:
{
  conversationId,
  messageBody,
  channel,
  templateId?
}

## Export Worker
payload:
{
  reportId,
  filters,
  requestedBy
}

## Index Worker
payload:
{
  entityType,
  entityId,
  orgId
}

Workers must:
- be idempotent
- support retries
- log job metrics
- produce audit events

---

# 7) ENGINEERING EXECUTION RULE

Before implementing a module:
1. Schema approved
2. APIs defined
3. Permissions mapped
4. Workflow graph documented
5. Jobs defined
6. Monitoring metrics defined

Only then implementation begins.

---

END — ULTRA SPEC PART 2
