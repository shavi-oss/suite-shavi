# Forbidden Data Matrix — platform-admin

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Module Name    | platform-admin                          |
| Document Title | FORBIDDEN_DATA_MATRIX                   |
| Repo           | Suite (Layer / Product Repo)            |
| Status         | FINAL — CORE V1 ALIGNED                 |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-02-04                              |

---

## 1) Purpose

This document defines what data `platform-admin` module is **FORBIDDEN** to store, cache, or access. It establishes clear boundaries to prevent data leakage, security violations, and compliance issues.

---

## 2) Forbidden Data Matrix

| Data Category                    | Owner          | Allowed to Store? | Allowed to Cache? | Max Retention Stance | Reason                                                                      |
| -------------------------------- | -------------- | ----------------- | ----------------- | -------------------- | --------------------------------------------------------------------------- |
| **Core JWT**                     | Core           | ❌ NO             | ❌ NO             | N/A                  | Server-only, in-memory only. NEVER store in DB, logs, or UI.                |
| **Suite UI Token**               | Suite Auth     | ❌ NO             | ❌ NO             | N/A                  | Session-only. NEVER store in Suite DB or forward to Core.                   |
| **Core User Credentials**        | Core           | ❌ NO             | ❌ NO             | N/A                  | Core owns authentication. Suite MUST NOT store passwords, hashes.           |
| **Core Audit Logs**              | Core           | ❌ NO             | ❌ NO             | N/A                  | Core owns audit trail. Suite MUST NOT replicate or cache.                   |
| **Core Workflow Execution Logs** | Core           | ❌ NO             | ❌ NO             | N/A                  | Core owns execution state. Suite MUST NOT store or cache.                   |
| **Core Template Definitions**    | Core           | ❌ NO             | ❌ NO             | N/A                  | Core owns templates. Template publish is DEFERRED in Core v1 (no endpoint). |
| **Core Organization Details**    | Core           | ❌ NO (except ID) | ❌ NO (except ID) | Indefinite (ID only) | Suite stores `coreOrgId` as external reference ONLY. No other fields.       |
| **Customer User PII**            | Core           | ❌ NO             | ❌ NO             | N/A                  | Core owns customer data. Suite MUST NOT store PII.                          |
| **Billing/Subscription Data**    | Future Billing | ❌ NO             | ❌ NO             | N/A                  | Out of scope for platform-admin. Future module owns this.                   |
| **CRM/Omnichannel Data**         | Future CRM     | ❌ NO             | ❌ NO             | N/A                  | Out of scope for platform-admin. Future module owns this.                   |
| **Core Internal State**          | Core           | ❌ NO             | ❌ NO             | N/A                  | Core is black box. Suite MUST NOT assume or store internal state.           |
| **API Keys (Third-Party)**       | Various        | ❌ NO             | ❌ NO             | N/A                  | Secrets MUST NOT be stored in Suite DB or logs.                             |
| **Passwords/Hashes**             | Various        | ❌ NO             | ❌ NO             | N/A                  | Credentials MUST NOT be stored in Suite DB or logs.                         |
| **Internal User Email**          | platform-admin | ✅ YES            | ✅ YES            | Indefinite           | Necessary for internal user management. Soft delete only.                   |
| **Internal User Name**           | platform-admin | ✅ YES            | ✅ YES            | Indefinite           | Necessary for internal user management. Soft delete only.                   |
| **Suite Org Name**               | platform-admin | ✅ YES            | ✅ YES            | Indefinite           | Suite owns organization records. Soft delete only.                          |
| **Suite Org ↔ Core Org Mapping** | platform-admin | ✅ YES            | ✅ YES            | Indefinite           | Suite owns mapping. Immutable (no delete).                                  |
| **Audit Log Metadata**           | platform-admin | ✅ YES            | ✅ YES            | Indefinite           | Append-only. NO SECRETS in metadata.                                        |
| **Correlation IDs**              | platform-admin | ✅ YES            | ✅ YES            | Indefinite           | Necessary for tracing. Stored in audit logs.                                |

---

## 3) Detailed Forbidden Data Rules

### 3.1 Core JWT

**NOT AVAILABLE** (Core v1 — Service-to-Service Auth)

Service-to-Service Authentication is NOT supported by Core v1.

**Evidence**: `CORE_V1_INTEGRATION_LOCK.md` Section 5.1

---

**SUITE-ONLY** — Rules for User-Scoped JWT:

- MUST be forwarded **as-is** to Core (no minting/constructing)
- MUST NOT be stored in Suite DB
- MUST NOT be logged
- MUST NOT be included in error messages
- MUST NOT be exposed to UI or client-side code

**Reason**: Security. JWT exposure = authentication compromise.

**Evidence**: `ARCHITECTURAL_LAWS.md` LAW-5 (Token & Identity Separation)

---

### 3.2 Suite UI Token

**SUITE-ONLY**

**Rules**:

- MUST be stored **client-side (browser/mobile) for session duration ONLY**
- MUST NOT be stored in Suite DB
- MUST NOT be forwarded to Core
- MUST NOT be logged

**Reason**: Security. UI token is Suite-scoped only, not for Core.

**Evidence**: `ARCHITECTURAL_LAWS.md` LAW-5 (Token & Identity Separation)

---

### 3.3 Core User Credentials

**SUITE-ONLY**

**Rules**:

- MUST NOT store customer user passwords, hashes, or authentication data
- Core owns customer authentication
- Suite MUST NOT replicate or cache

**Reason**: Security and compliance. Core is source of truth for customer auth.

**Evidence**: `ARCHITECTURAL_LAWS.md` LAW-6 (Database Separation)

---

### 3.4 Core Template Definitions

**DEFERRED (Core v2+)**

Template publishing is NOT available in Core v1.

**Evidence**: `CORE_V1_INTEGRATION_LOCK.md` Section 4.1

---

**SUITE-ONLY** — Rules:

- MUST NOT store template definitions, steps, or configurations
- Core owns template data (when available)

**Reason**: Data ownership. Core owns template definitions.

---

### 3.5 Core Organization Details

**CONFIRMED (Core v1)**

Core provides organization data via `GET /api/v1/organizations/:id`.

**Evidence**: `CORE_CONTRACT_V1_EXTRACT.md` Section B.8

---

**SUITE-ONLY** — Rules:

- MUST store `coreOrgId` ONLY (as external reference in `SuiteOrgMapping`)
- MUST NOT store Core org name, metadata, configuration, or any other fields
- Core is source of truth for org details

**Reason**: Data minimization. Suite only needs `coreOrgId` for mapping.

**Evidence**: `ARCHITECTURAL_LAWS.md` LAW-6 (Database Separation), LAW-8 (Module Ownership)

---

## 4) Stop Rules

**SUITE-ONLY**

Execution MUST STOP IMMEDIATELY if:

- platform-admin stores Core JWT in Suite DB
- platform-admin stores Core user credentials or PII
- platform-admin stores Core audit logs or workflow execution logs
- platform-admin stores Core template definitions
- platform-admin stores Core organization details (beyond `coreOrgId`)
- platform-admin stores API keys, passwords, or secrets in Suite DB or logs
- platform-admin forwards UI token to Core
- platform-admin exposes Core JWT to UI
- platform-admin mints or constructs Core JWTs

**Action on STOP**: Halt all work, document violation, escalate to Governance Authority.

---

## 5) Acceptance Criteria

This forbidden data matrix is ACTIVE and BINDING when:

- [x] All forbidden data categories are explicitly listed with reasons
- [x] All allowed data categories are explicitly listed with retention stance
- [x] Service-to-service auth marked NOT AVAILABLE (Core v1)
- [x] Template publishing marked DEFERRED (Core v1)
- [x] Core Organization endpoint confirmed (Core v1)
- [x] Stop rules are explicit and enforceable
- [x] All CONFIRMED claims have evidence links

---

## 6) Signature

**Approved By**: Governance Authority  
**Date**: 2026-02-04  
**Status**: FINAL — CORE V1 ALIGNED
