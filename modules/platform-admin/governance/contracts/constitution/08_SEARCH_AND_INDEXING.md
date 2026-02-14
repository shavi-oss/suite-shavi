# ULTRA SPEC PART 2 — 08 SEARCH & INDEXING (Deep · Execution Canonical)

**Last Updated:** 2026-02-01  
**Status:** CANONICAL (Unified Search Layer Across Suites)  
**Depends on:** `01_SCHEMAS.md`, `05_WORKERS_AND_JOBS.md`, `06_EVENTS_AND_OBSERVABILITY.md`, `07_STORAGE_AND_FILES.md`

> **🔴 SCOPE NOTICE:** This describes **SUITE-LAYER** search/indexing (future). Core v1 has NO search system. See: `backend/governance/core-contract/CORE_CONTRACT_V1_EXTRACT.md`

> **Meaning:** This file defines the Search subsystem (query API, indexing model, relevance, security, and operations).
> Search must be fast, tenant-isolated, permission-aware, and resilient.
> The same architecture supports:
>
> - CRM search (contacts/leads/deals)
> - Omnichannel search (conversations/messages)
> - Docs/templates search
> - AI knowledge doc retrieval (metadata search)
> - Admin search jobs (reindex)

---

# 0) Search Principles (Non-Negotiable)

## 0.1 Tenant Isolation

Every index document MUST include `organizationId`, and every query MUST filter by it.
No cross-tenant search results. No leakage.

## 0.2 Permission-Aware Results

Search results must be filtered by permission _after_ tenant filtering.

- If user lacks permission to read entity type → exclude it.
- If entity has sensitive fields (message body, contact sensitive) → return redacted or omit fields.

## 0.3 No PII Leakage in Search Snippets

Search response MUST NOT include:

- full phone/email unless permission permits and policy allows
- message bodies unless `omni.messages.read_body`
- secret references or tokens
  Default snippets are sanitized.

## 0.4 Indexing is Eventually Consistent

Writes update the DB first, then indexing catches up via jobs/events.
Search is not the source of truth.

---

# 1) Search Components (Architecture)

## 1.1 Components

- **Search API** (endpoint: `GET /api/suites/v1/search`)
- **SearchDocument builder** (per entity type)
- **Indexer workers** (from `05_WORKERS_AND_JOBS.md`)
- **Index storage**:
  - Option A: Postgres FTS (MVP, simplest)
  - Option B: Meilisearch (fast, simple ops, VPS-friendly)
  - Option C: Elasticsearch/OpenSearch (heavy, enterprise scale)

Canonical design supports switching engines via adapter.

## 1.2 Recommended Engine Path

- MVP + early production: **Postgres FTS** or **Meilisearch**
- Later (very large scale): **OpenSearch/Elasticsearch**

Why:

- Postgres: zero extra infra, acceptable for early scale
- Meilisearch: better relevance and speed, still easy to host
- ES: powerful but operationally heavier

---

# 2) Search API Contract (Canonical)

## 2.1 Query Endpoint

`GET /api/suites/v1/search` → permission `search.query` (see `03_PERMISSIONS_MATRIX.md`)

Query params:

- `q` (string) — required
- `types` (csv) — optional; e.g. `contact,lead,conversation,message,template,doc`
- `limit` (int) — default 20, max 50
- `cursor` (string) — pagination token
- `from` / `to` (date) — optional time filter (for messages/events)
- `sort` — `relevance|recent` (default relevance)
- `includeSnippets` — boolean (default true but sanitized)
- `includeHighlights` — boolean (default false)

Response:

```json
{
  "q": "...",
  "results": [
    {
      "type": "contact",
      "id": "uuid",
      "title": "...",
      "subtitle": "...",
      "snippet": "...",
      "highlights": {},
      "score": 12.3,
      "updatedAt": "iso"
    }
  ],
  "nextCursor": "...|null"
}
```

## 2.2 Admin Endpoints

- `GET /api/suites/v1/search/admin/indexes` → `search.admin.indexes.read`
- `POST /api/suites/v1/search/admin/reindex` → `search.admin.reindex`
- `GET /api/suites/v1/search/admin/jobs` → `search.admin.jobs.read`

---

# 3) SearchDocument Model (Canonical)

## 3.1 Minimal Fields (Always)

Every SearchDocument contains:

- `docId` (uuid)
- `organizationId`
- `type` (entity type)
- `entityId`
- `title`
- `keywords` (array)
- `text` (normalized searchable text)
- `createdAt`
- `updatedAt`
- `visibility` (public|restricted|sensitive)
- `refs` (links to parent entities: e.g., conversationId for message)

## 3.2 Visibility Levels

- `public` — safe metadata (still tenant-isolated)
- `restricted` — requires entity permission
- `sensitive` — requires dedicated sensitive permission (e.g. message body)

Visibility influences:

- indexing of fields (some fields not indexed or stored)
- search snippets returned (redacted by default)

---

# 4) Entity Index Definitions (Complete Baseline)

> For each entity: define title/subtitle, indexed fields, stored fields, and access rules.

## 4.1 CRM: Contact

Type: `contact`
Title:

- `displayName` or fallback to primary identity redacted
  Subtitle:
- tags, stage, owner
  Indexed fields:
- normalized name
- phone/email (tokenized + hashed variants)
- tags
- company/name fields
  Stored fields:
- contactId, updatedAt, ownerId, tagIds
  Access rules:
- require `crm.contacts.read`
- snippet returns masked phone/email by default
  Sensitive:
- deep profile fields require `crm.contacts.read_sensitive`

## 4.2 CRM: Lead

Type: `lead`
Indexed:

- lead title, source, stage
  Access:
- `crm.leads.read`

## 4.3 CRM: Deal

Type: `deal`
Indexed:

- deal name, pipeline stage, amount bucket keywords
  Access:
- `crm.deals.read`

## 4.4 Omnichannel: Conversation

Type: `conversation`
Indexed:

- subject/title
- participant identities (masked)
- tags
  Stored:
- conversationId, inboxId, status, lastMessageAt
  Access:
- `omni.conversations.read`

## 4.5 Omnichannel: Message (Metadata vs Body)

Type: `message`
Two-level index strategy:

- **metadata index** (always): sender, channel, timestamps, template name
- **body index** (optional): only if policy allows & permission exists

Indexed (metadata):

- channel, direction, delivery status
  Stored:
- messageId, conversationId, createdAt
  Access:
- metadata requires `omni.messages.read_metadata`
- body requires `omni.messages.read_body`
  Snippets:
- default is metadata snippet unless body permitted

## 4.6 Templates (Docs/Omni)

Type: `template`
Indexed:

- name, category, tags
  Access:
- `omni.templates.read` or `docs.templates.read` depending on source

## 4.7 Docs Rendered & Files Metadata

Type: `doc`
Indexed:

- document title, metadata, tags
  Body indexing:
- optional; if enabled, use extracted text with redaction controls
  Access:
- `files.read_metadata` for metadata
- file content search requires restricted policy + permission (future `docs.content.search`)

## 4.8 AI Knowledge Docs (Metadata Search)

Type: `kb_doc`
Indexed:

- filename, tags, kb name, source
  Access:
- `ai.knowledge.read` (restricted)
  Note:
- semantic retrieval for AI is separate (embeddings). This is metadata search only.

---

# 5) Indexing Pipeline (Event → Job → Document)

## 5.1 Trigger Sources

Index updates triggered by:

- domain writes (create/update/delete)
- events (see `06_EVENTS_AND_OBSERVABILITY.md`)
- scheduled reindex

Canonical:

- emit domain event → enqueue `search.index_entity` job.

## 5.2 Jobs

Defined in `05_WORKERS_AND_JOBS.md`:

- `search.index_entity` (DEFAULT)
- `search.reindex_full` (LOW)

## 5.3 Index Entity Job Steps

1. Validate tenant context
2. Load entity (DB)
3. Apply permission/visibility classification
4. Build SearchDocument
5. Upsert into search index
6. Emit event `search.index.entity.completed`

Delete behavior:

- on soft delete → remove from index or mark `isDeleted`
- on hard delete → delete doc

## 5.4 Reindex Full Job Steps

1. For each entity type, iterate in chunks (e.g. 1k)
2. Enqueue index jobs per chunk
3. Track progress in `ReindexJob` table
4. Support resume
5. Enforce rate limits & time windows

---

# 6) Relevance, Ranking & Tokenization

## 6.1 Ranking Signals (Baseline)

- text match score
- recency boost (updatedAt)
- entity type boost (contacts/conversations > messages)
- tag match boost
- exact match boost (email/phone)

## 6.2 Tokenization & Normalization

- lowercase
- remove diacritics where relevant
- normalize Arabic variants (if Arabic UI later):
  - ا/أ/إ/آ normalization
  - ة/ه optional
  - ي/ى normalization
- normalize phone formats (+20, 0 prefix variations)

## 6.3 Sensitive Token Handling

Do not store raw sensitive tokens if unnecessary:

- store hashed variants for phone/email to support exact match without exposure
- store masked strings for display

---

# 7) Security & Compliance Controls

## 7.1 Search Rate Limiting

- apply per-user and per-org rate limits
- block abusive wildcard queries
- restrict expensive queries (very short q length)

## 7.2 Audit

If tenant compliance requires:

- audit `search.query` calls (store q hashed, not raw)
  Audit record fields:
- actor, org, timestamp, types, result counts

## 7.3 Stop Conditions

- any cross-tenant result detected → stop_condition_triggered
- any snippet contains unmasked PII without permission → stop_condition_triggered

---

# 8) Operational Considerations

## 8.1 Index Health Monitoring

Expose:

- total documents per type
- last indexed timestamp per type
- indexing error rates
- queue delay for indexing jobs

## 8.2 Backfill & Repair

If index corrupted:

- run `search.admin.reindex`
- keep service operational (search may degrade but system must function)

## 8.3 VPS-Friendly Defaults

If using Meilisearch:

- run on same VPS or dedicated small instance
- snapshot backups daily
  If using Postgres FTS:
- maintain GIN indexes
- vacuum/analyze schedules
- avoid huge text fields in a single row; store as separate search table

---

# 9) Implementation Checklist (Must Pass)

- [ ] Search API filters by organizationId always.
- [ ] Results filtered by permissions and visibility.
- [ ] Snippets redacted by default.
- [ ] Indexing jobs are idempotent.
- [ ] Reindex supports resume and rate limits.
- [ ] Monitoring exists for indexing lag.
- [ ] Stop conditions tested (tenant leak, PII leak).

**END — 08 SEARCH & INDEXING**
