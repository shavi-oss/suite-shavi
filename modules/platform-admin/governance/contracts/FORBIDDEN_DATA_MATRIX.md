# Forbidden Data Matrix — platform-admin

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Module Name    | platform-admin                          |
| Document Title | FORBIDDEN_DATA_MATRIX                   |
| Repo           | Suite (Layer / Product Repo)            |
| Status         | ACTIVE — DATA POLICY                    |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-01-30                              |

---

## 1) Purpose

This document defines what data `platform-admin` module is **FORBIDDEN** to store, cache, or access. It establishes clear boundaries to prevent data leakage, security violations, and compliance issues.

---

## 2) Forbidden Data Matrix

| Data Category                    | Owner          | Allowed to Store? | Allowed to Cache? | Max Retention Stance | Reason                                                                            |
| -------------------------------- | -------------- | ----------------- | ----------------- | -------------------- | --------------------------------------------------------------------------------- |
| **Core Service Token**           | Core           | ❌ NO             | ❌ NO             | N/A                  | Server-only, in-memory only. NEVER store in DB, logs, or UI.                      |
| **Suite UI Token**               | Suite Auth     | ❌ NO             | ❌ NO             | N/A                  | Session-only. NEVER store in Suite DB or forward to Core.                         |
| **Core User Credentials**        | Core           | ❌ NO             | ❌ NO             | N/A                  | Core owns authentication. Suite MUST NOT store passwords, hashes.                 |
| **Core Audit Logs**              | Core           | ❌ NO             | ❌ NO             | N/A                  | Core owns audit trail. Suite MUST NOT replicate or cache.                         |
| **Core Workflow Execution Logs** | Core           | ❌ NO             | ❌ NO             | N/A                  | Core owns execution state. Suite MUST NOT store or cache.                         |
| **Core Template Definitions**    | Core           | ❌ NO             | ❌ NO             | N/A                  | Core owns templates. Suite template publish is DEFERRED in Core v1 (no endpoint). |
| **Core Organization Details**    | Core           | ❌ NO (except ID) | ❌ NO (except ID) | Indefinite (ID only) | Suite stores `coreOrgId` as external reference ONLY. No other fields.             |
| **Customer User PII**            | Core           | ❌ NO             | ❌ NO             | N/A                  | Core owns customer data. Suite MUST NOT store PII.                                |
| **Billing/Subscription Data**    | Future Billing | ❌ NO             | ❌ NO             | N/A                  | Out of scope for platform-admin. Future module owns this.                         |
| **CRM/Omnichannel Data**         | Future CRM     | ❌ NO             | ❌ NO             | N/A                  | Out of scope for platform-admin. Future module owns this.                         |
| **Core Internal State**          | Core           | ❌ NO             | ❌ NO             | N/A                  | Core is black box. Suite MUST NOT assume or store internal state.                 |
| **API Keys (Third-Party)**       | Various        | ❌ NO             | ❌ NO             | N/A                  | Secrets MUST NOT be stored in Suite DB or logs.                                   |
| **Passwords/Hashes**             | Various        | ❌ NO             | ❌ NO             | N/A                  | Credentials MUST NOT be stored in Suite DB or logs.                               |
| **Internal User Email**          | platform-admin | ✅ YES            | ✅ YES            | Indefinite           | Necessary for internal user management. Soft delete only.                         |
| **Internal User Name**           | platform-admin | ✅ YES            | ✅ YES            | Indefinite           | Necessary for internal user management. Soft delete only.                         |
| **Suite Org Name**               | platform-admin | ✅ YES            | ✅ YES            | Indefinite           | Suite owns organization records. Soft delete only.                                |
| **Suite Org ↔ Core Org Mapping** | platform-admin | ✅ YES            | ✅ YES            | Indefinite           | Suite owns mapping. Immutable (no delete).                                        |
| **Audit Log Metadata**           | platform-admin | ✅ YES            | ✅ YES            | TBD (e.g., 2 years)  | Append-only. NO SECRETS in metadata.                                              |
| **Correlation IDs**              | platform-admin | ✅ YES            | ✅ YES            | TBD (e.g., 2 years)  | Necessary for tracing. Stored in audit logs.                                      |

---

## 3) Detailed Forbidden Data Rules

### 3.1 Core Service Token

**Owner**: Core  
**Allowed to Store?**: ❌ NO  
**Allowed to Cache?**: ❌ NO  
**Max Retention Stance**: N/A

**Rules**:

- MUST be stored **server-side in-memory ONLY** (or secure secret store)
- MUST NOT be stored in Suite DB
- MUST NOT be logged
- MUST NOT be included in error messages
- MUST NOT be exposed to UI or client-side code

**Reason**: Security. Token exposure = full Core access compromise.

---

### 3.2 Suite UI Token

**Owner**: Suite Auth  
**Allowed to Store?**: ❌ NO  
**Allowed to Cache?**: ❌ NO  
**Max Retention Stance**: N/A

**Rules**:

- MUST be stored **client-side (browser/mobile) for session duration ONLY**
- MUST NOT be stored in Suite DB
- MUST NOT be forwarded to Core
- MUST NOT be logged

**Reason**: Security. UI token is Suite-scoped only, not for Core.

---

### 3.3 Core User Credentials

**Owner**: Core  
**Allowed to Store?**: ❌ NO  
**Allowed to Cache?**: ❌ NO  
**Max Retention Stance**: N/A

**Rules**:

- MUST NOT store customer user passwords, hashes, or authentication data
- Core owns customer authentication
- Suite MUST NOT replicate or cache

**Reason**: Security and compliance. Core is source of truth for customer auth.

---

### 3.4 Core Audit Logs

**Owner**: Core  
**Allowed to Store?**: ❌ NO  
**Allowed to Cache?**: ❌ NO  
**Max Retention Stance**: N/A

**Rules**:

- MUST NOT replicate Core audit logs in Suite DB
- Core owns audit trail for customer actions
- Suite maintains its own audit log for **platform-admin actions only**

**Reason**: Data ownership. Core owns customer audit trail.

---

### 3.5 Core Workflow Execution Logs

**Owner**: Core  
**Allowed to Store?**: ❌ NO  
**Allowed to Cache?**: ❌ NO  
**Max Retention Stance**: N/A

**Rules**:

- MUST NOT store workflow execution state, logs, or history
- Core owns workflow execution
- Suite only triggers template publish, no execution tracking

**Reason**: Data ownership. Core owns workflow execution state.

---

### 3.6 Core Template Definitions

**Owner**: Core  
**Allowed to Store?**: ❌ NO  
**Allowed to Cache?**: ❌ NO  
**Max Retention Stance**: N/A

**Rules**:

- MUST NOT store template definitions, steps, or configurations
- Suite template publish capability is DEFERRED in Core v1 (no endpoint exists)
- Core owns template data

**Reason**: Data ownership. Core owns template definitions. Template publish is DEFERRED until Core v2.

---

### 3.7 Core Organization Details

**Owner**: Core  
**Allowed to Store?**: ❌ NO (except `coreOrgId`)  
**Allowed to Cache?**: ❌ NO (except `coreOrgId`)  
**Max Retention Stance**: Indefinite (`coreOrgId` as external reference only)

**Rules**:

- MUST store `coreOrgId` ONLY (as external reference in `SuiteOrgMapping`)
- MUST NOT store Core org name, metadata, configuration, or any other fields
- Core is source of truth for org details

**Reason**: Data minimization. Suite only needs `coreOrgId` for mapping.

---

### 3.8 Customer User PII

**Owner**: Core  
**Allowed to Store?**: ❌ NO  
**Allowed to Cache?**: ❌ NO  
**Max Retention Stance**: N/A

**Rules**:

- MUST NOT store customer user PII (names, emails, phone numbers, addresses)
- Core owns customer data
- Suite stores **internal user** data only (platform admins, developers, support)

**Reason**: Compliance and data ownership. Core owns customer PII.

---

### 3.9 Billing/Subscription Data

**Owner**: Future Billing Module  
**Allowed to Store?**: ❌ NO  
**Allowed to Cache?**: ❌ NO  
**Max Retention Stance**: N/A

**Rules**:

- MUST NOT store billing, subscription, or payment data
- Out of scope for platform-admin
- Future billing module will own this data

**Reason**: Scope boundary. platform-admin is not responsible for billing.

---

### 3.10 CRM/Omnichannel Data

**Owner**: Future CRM/Omnichannel Modules  
**Allowed to Store?**: ❌ NO  
**Allowed to Cache?**: ❌ NO  
**Max Retention Stance**: N/A

**Rules**:

- MUST NOT store CRM contacts, deals, activities, or omnichannel messages
- Out of scope for platform-admin
- Future modules will own this data

**Reason**: Scope boundary. platform-admin is not responsible for CRM/Omnichannel.

---

### 3.11 Core Internal State

**Owner**: Core  
**Allowed to Store?**: ❌ NO  
**Allowed to Cache?**: ❌ NO  
**Max Retention Stance**: N/A

**Rules**:

- MUST NOT assume or store Core internal state, configuration, or implementation details
- Core is black box
- Suite MUST NOT rely on Core internals

**Reason**: Architectural boundary. Core is immutable black box.

---

### 3.12 API Keys (Third-Party)

**Owner**: Various  
**Allowed to Store?**: ❌ NO  
**Allowed to Cache?**: ❌ NO  
**Max Retention Stance**: N/A

**Rules**:

- MUST NOT store API keys, secrets, or credentials in Suite DB
- MUST use secure secret store (environment variables, secret manager)
- MUST NOT log API keys

**Reason**: Security. Secrets MUST NOT be in DB or logs.

---

### 3.13 Passwords/Hashes

**Owner**: Various  
**Allowed to Store?**: ❌ NO  
**Allowed to Cache?**: ❌ NO  
**Max Retention Stance**: N/A

**Rules**:

- MUST NOT store passwords, password hashes, or authentication credentials
- Authentication is handled by Core (customer users) or Suite Auth (internal users)
- platform-admin MUST NOT store credentials

**Reason**: Security. Credentials MUST NOT be in Suite DB.

---

## 4) Allowed Data (For Reference)

| Data Category                    | Owner          | Allowed to Store? | Allowed to Cache? | Max Retention Stance | Reason                                       |
| -------------------------------- | -------------- | ----------------- | ----------------- | -------------------- | -------------------------------------------- |
| **Internal User Email**          | platform-admin | ✅ YES            | ✅ YES            | Indefinite           | Necessary for internal user management.      |
| **Internal User Name**           | platform-admin | ✅ YES            | ✅ YES            | Indefinite           | Necessary for internal user management.      |
| **Suite Org Name**               | platform-admin | ✅ YES            | ✅ YES            | Indefinite           | Suite owns organization records.             |
| **Suite Org ↔ Core Org Mapping** | platform-admin | ✅ YES            | ✅ YES            | Indefinite           | Suite owns mapping. Immutable (no delete).   |
| **Audit Log Metadata**           | platform-admin | ✅ YES            | ✅ YES            | TBD (e.g., 2 years)  | Append-only. NO SECRETS in metadata.         |
| **Correlation IDs**              | platform-admin | ✅ YES            | ✅ YES            | TBD (e.g., 2 years)  | Necessary for tracing. Stored in audit logs. |

---

## 5) Stop Rules

Execution MUST STOP IMMEDIATELY if:

- platform-admin stores Core service token in Suite DB
- platform-admin stores Core user credentials or PII
- platform-admin stores Core audit logs or workflow execution logs
- platform-admin stores Core template definitions
- platform-admin stores Core organization details (beyond `coreOrgId`)
- platform-admin stores API keys, passwords, or secrets in Suite DB or logs
- platform-admin forwards UI token to Core
- platform-admin exposes Core service token to UI

**Action on STOP**: Halt all work, document violation, escalate to Governance Authority.

---

## 6) Acceptance Criteria

This forbidden data matrix is ACTIVE and BINDING when:

- [x] All forbidden data categories are explicitly listed with reasons
- [x] All allowed data categories are explicitly listed with retention stance
- [x] Stop rules are explicit and enforceable
- [x] No contradictions exist with MODULE_DATA_OWNERSHIP.md or repo-level governance

---

## 7) Signature

**Approved By**: Governance Authority  
**Date**: 2026-01-30  
**Status**: ACTIVE — DATA POLICY
