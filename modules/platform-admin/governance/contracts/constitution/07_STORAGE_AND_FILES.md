# ULTRA SPEC PART 2 — 07 STORAGE AND FILES (Deep · Execution Canonical)

**Last Updated:** 2026-02-01  
**Status:** CANONICAL (File Management for All Suites)  
**Depends on:** `01_SCHEMAS.md` + `04_DATA_ACCESS_AND_SECURITY.md`  
**Must not conflict with:** Core Contract lock artifacts under `backend/governance/core-contract/`

> **🔴 SCOPE NOTICE:** This describes **SUITE-LAYER** file storage (future). Core v1 has NO file storage system. See: `backend/governance/core-contract/CORE_CONTRACT_V1_EXTRACT.md`.

This covers:

- Upload lifecycle
- Storage providers
- Signed URLs
- Virus scanning
- Retention & cleanup
- Integration with CRM, Omni, Docs, AI, Analytics

---

# 0) Storage Principles (Non‑Negotiable)

## 0.1 Object Storage Only

All large binary data MUST be stored in object storage, not DB:
Examples:

- attachments
- exports
- documents
- AI knowledge files
- rendered PDFs
- import files

DB stores metadata only (`FileObject`).

## 0.2 Tenant Isolation

Every file belongs to:

```
organizationId
```

All access checks enforce tenant isolation.

## 0.3 Files Are Immutable

Files are never mutated:

- new version → new FileObject
- old file optionally garbage collected

---

# 1) Storage Provider Strategy

## 1.1 Supported Providers (Priority Order)

Initial VPS-friendly options:

1. S3-compatible storage
   - AWS S3
   - Cloudflare R2
   - MinIO self-hosted
2. Local disk (dev/single-node only)

Production recommendation:

- S3-compatible API for portability.

## 1.2 Storage Key Layout

Canonical path pattern:

```
org/{orgId}/{suite}/{entity}/{yyyy}/{mm}/{fileId}
```

Example:

```
org/123/crm/contact/2026/02/uuid.pdf
```

Benefits:

- partitioned
- easy cleanup
- no collisions

---

# 2) FileObject Model Responsibilities

FileObject contains:

- orgId
- storageProvider
- bucket
- objectKey
- contentType
- sizeBytes
- checksum
- encryption info
- TTL policy
- metadata

FileObject never contains raw data.

---

# 3) Upload Flow (Canonical)

Upload is multi-step for safety.

## 3.1 Step 1 — Create Upload Session

API:

```
POST /files/upload-sessions
```

Creates:

- UploadSession record
- temporary upload credentials or signed upload URL

Returns:

- upload URL
- sessionId

## 3.2 Step 2 — Client Upload

Client uploads directly to storage:

- avoids API bandwidth bottleneck
- supports large files

Supports:

- multipart/chunk upload

## 3.3 Step 3 — Commit Upload

API:

```
POST /files/upload-sessions/{id}/commit
```

Server:

1. verifies object exists
2. computes checksum if needed
3. optionally enqueues virus scan
4. creates FileObject
5. marks session committed

---

# 4) Virus & Safety Scanning

## 4.1 Scan Flow

Job:

```
files.virus_scan
```

Steps:

- download object
- scan using AV engine
- mark status: passed/failed

## 4.2 Enforcement Modes

Tenant policy may specify:

- strict → block file until scan passes
- relaxed → allow use but mark risky

## 4.3 Failure Handling

If infected:

- file flagged
- download disabled
- audit event emitted

---

# 5) File Access & Signed URLs

## 5.1 Direct Access Forbidden

Files are never publicly accessible.

Access only via:

- signed URLs
- proxy endpoint

## 5.2 Signed URL Flow

API:

```
POST /files/{id}/signed-url
```

Server:

- verifies permission
- generates temporary signed link (TTL)
- records SignedLink record

Client downloads directly from storage.

## 5.3 TTL Policy

Default TTL:

- attachments: 1–6 hours
- exports: 24–72 hours
- AI knowledge docs: internal only

Expired links cleaned via cleanup job.

---

# 6) Integration with Suites

## 6.1 CRM

Contacts & activities may reference FileObjects:

- attachments
- contracts
- forms

Deletion rules:

- cannot delete if still referenced.

## 6.2 Omnichannel

Messages attachments:

- stored as FileObjects
- outbound send jobs reference fileId
- provider upload handled by worker.

## 6.3 Analytics Exports

Exports generate FileObjects:

- CSV/Excel/PDF
- TTL enforced
- download audited

## 6.4 Docs Rendering

Template render produces FileObject:

- PDF or document output

## 6.5 AI Knowledge

Knowledge docs ingestion:

- upload file
- indexing job extracts embeddings
- file optionally retained or archived

---

# 7) Lifecycle & Retention

## 7.1 Retention Policies

Per tenant or default:

- exports: auto-delete after N days
- uploads unused after N hours removed
- attachments kept indefinitely unless manual deletion

## 7.2 Cleanup Jobs

Jobs:

- remove expired signed links
- delete expired exports
- purge orphan objects
- compact storage paths

---

# 8) Deduplication & Integrity

## 8.1 Checksum Use

Checksum stored to:

- detect corruption
- deduplicate identical uploads

## 8.2 Optional Deduplication

Same checksum + org:

- reuse existing object reference
- skip storage duplication

---

# 9) Performance & Scaling

## 9.1 Upload Scaling

Direct-to-storage uploads prevent API overload.

## 9.2 Download Scaling

Signed URLs allow CDN acceleration if configured.

## 9.3 Large Files

Chunked uploads recommended for:

- > 50MB files
- unstable connections

---

# 10) Security Checklist

- [ ] Files always scoped by organizationId
- [ ] No public object exposure
- [ ] Signed URLs expire
- [ ] Virus scanning supported
- [ ] Secrets never stored in files
- [ ] Cleanup jobs active

---

# 11) Operational Checklist

- [ ] Storage provider health monitored
- [ ] Bucket lifecycle rules configured
- [ ] Cleanup jobs scheduled
- [ ] Upload failures observable

---

**END — 07 STORAGE & FILES**
