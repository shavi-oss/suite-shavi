# Core Contract v1 Integration Lock — Suite Governance

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Module Name    | platform-admin                          |
| Document Title | CORE_V1_INTEGRATION_LOCK                |
| Repo           | Suite (Layer / Product Repo)            |
| Status         | FINAL — INTEGRATION LOCK                |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-02-02                              |

---

## 1) Purpose

This document formalizes the integration contract between Suite `platform-admin` module and Bassan.os Core Contract v1. It establishes:

- **Source of Truth**: Canonical Core Contract v1 (core-contract-v1-lock tag in Bassan.os)
- **Available Capabilities**: What Core v1 provides and Suite may use
- **Deferred Capabilities**: What is planned but NOT in Core v1
- **Not Available Capabilities**: What does NOT exist in Core v1
- **Suite-Only Features**: What Suite implements independently
- **Fail-Closed Rule**: New Core dependencies require new contract version + governance gate

---

## 2) Source of Truth

**Canonical Source**: Bassan.os Core Contract v1 (tagged `core-contract-v1-lock`)

**Suite Mirror Location**: `modules/platform-admin/governance/core-contract/`

**Mirror Files** (READ-ONLY):

- `CORE_CONTRACT_V1_EXTRACT.md` (42 endpoints, 9 controllers)
- `CORE_CONTRACT_EVIDENCE_TABLE.md`
- `CORE_CONTRACT_GO_NO_GO_DECISION.md`
- `CORE_CONTRACT_V1_LOCK_DECLARATION.md`
- `SPEC_DRIFT_NOTICE.md`

**Modification Rule**: Core contract files are READ-ONLY. Changes require new Core Contract version + new governance gate.

---

## 3) Available in Core v1

### 3.1 Endpoints

**Total**: 42 endpoints across 9 controllers

**Controllers**:

- Auth (2 endpoints)
- Workflows (13 endpoints)
- Workflow Instances (4 endpoints)
- Workflow Triggers (6 endpoints)
- Scheduled Triggers (5 endpoints)
- Deferred Execution (4 endpoints)
- Users (2 endpoints)
- Organizations (2 endpoints)
- Roles (4 endpoints)

**Evidence**: See `CORE_CONTRACT_V1_EXTRACT.md` for complete endpoint list with line-level source references.

---

### 3.2 Authentication

**Mechanism**: JWT-based authentication

**Token Type**: Bearer token

**Header**: `Authorization: Bearer <jwt-token>`

**JWT Claims** (confirmed from Core source):

- `sub` (User ID)
- `email` (User email)
- `organizationId` (Tenant/Organization ID)

**Guards**:

- `JwtAuthGuard` (JWT validation)
- `TenantGuard` (CLS context + request sanitization)

**Evidence**: `CORE_CONTRACT_V1_EXTRACT.md` Section D.1

---

### 3.3 Tenant Context

**Mechanism**: JWT claim `organizationId`

**Propagation**:

- Client → Core: JWT claim in `Authorization` header
- Core extracts `organizationId` from JWT payload
- Core sets CLS context (`orgId`, `userId`)

**NOT USED**:

- ❌ `X-Organization-Id` header
- ❌ `X-Tenant-Id` header
- ❌ Query parameter `?organizationId=`

**Evidence**: `CORE_CONTRACT_V1_EXTRACT.md` Section D.2

---

### 3.4 API Versioning

**Global Prefix**: `/api/v1`

**Versioning Strategy**: URL prefix (not header-based)

**Evidence**: `CORE_CONTRACT_V1_EXTRACT.md` Section D.3

---

### 3.5 Validation Pipeline

**Global Validation**: ValidationPipe enabled

**Features**:

- Whitelist (strip unknown properties)
- Transform (auto-transform types)
- ForbidNonWhitelisted (reject unknown properties)

**Evidence**: `CORE_CONTRACT_V1_EXTRACT.md` Line 46

---

## 4) Deferred (Not in Core v1)

### 4.1 Template Publish

**Status**: ❌ DEFERRED

**Reason**: No template publish endpoint found in Core v1 controllers

**Evidence**: `CORE_CONTRACT_V1_EXTRACT.md` Section A (Exclusions, Line 29)

**Impact on Suite**:

- Suite MUST NOT implement template publish in Gate 5.3 or later
- Suite MUST NOT call non-existent Core template endpoints
- Suite MUST mark all template publish flows as DEFERRED

**Future**: Template publish may be added in Core v2 (requires new contract lock)

---

## 5) Not Available (Not in Core v1)

### 5.1 Service-to-Service Authentication

**Status**: ❌ NOT AVAILABLE

**Reason**: No service token contract, no OAuth2 client credentials flow, no service account endpoints found in Core v1

**Evidence**: `CORE_CONTRACT_V1_EXTRACT.md` (no auth endpoints beyond login/me)

**Impact on Suite**:

- Suite MUST NOT implement service token acquisition
- Suite MUST NOT assume Core service token refresh mechanism
- Suite uses JWT-based authentication for user-scoped operations only

**Future**: S2S auth may be added in Core v2 (requires new contract lock)

---

### 5.2 Token Refresh

**Status**: ❌ NOT AVAILABLE

**Reason**: No refresh token endpoint found in Core v1 auth controller

**Evidence**: `CORE_CONTRACT_V1_EXTRACT.md` Section A (Exclusions, Line 30)

**Impact on Suite**:

- Suite MUST NOT implement token refresh logic
- 401 responses from Core result in fail-closed behavior (deny request, return safe error to UI)
- Suite MUST NOT retry after 401 (no refresh mechanism available)

---

### 5.3 Correlation ID Middleware

**Status**: ❌ NOT AVAILABLE (Core does not guarantee support)

**Reason**: No correlation ID middleware/interceptor found in Core v1 source

**Evidence**: `CORE_CONTRACT_V1_EXTRACT.md` Section A (Exclusions, Line 28), Section D.4

**Impact on Suite**:

- Correlation ID is **SUITE-ONLY** feature
- Suite generates correlation ID for tracing
- Suite includes `X-Correlation-Id` header in outbound requests to Core
- **Core echo/logging is NOT REQUIRED** (Core may ignore correlation ID)
- Suite logs correlation ID for Suite-side tracing only

---

## 6) Suite-Only Features

### 6.1 Correlation ID Tracing

**Owner**: Suite

**Implementation**:

- Suite BFF generates UUID v4 correlation ID for every request
- Suite includes `X-Correlation-Id` header in all Core API calls
- Suite logs correlation ID in all BFF log entries
- **Core echo is NOT guaranteed** (Core v1 has no correlation middleware)

**Purpose**: Suite-side request tracing and debugging

---

### 6.2 Suite → Core Organization Mapping

**Owner**: Suite

**Storage**: Suite DB (`SuiteOrgMapping` table)

**Purpose**: Map Suite organizationId to Core organizationId

**Validation**: Suite MUST validate Core org exists before creating mapping (via `GET /api/v1/organizations/:id`)

---

## 7) Fail-Closed Rule

**Rule**: Any new dependency on unconfirmed Core capability requires:

1. New Core Contract version (e.g., Core v2)
2. New governance gate in Suite
3. Explicit approval from Governance Authority

**Examples of Forbidden Dependencies**:

- Assuming Core supports template publish (DEFERRED)
- Assuming Core supports service token refresh (NOT AVAILABLE)
- Assuming Core echoes correlation IDs (NOT GUARANTEED)
- Inventing new Core endpoints not in contract

**Action on Violation**: STOP immediately, escalate to Governance Authority

---

## 8) Integration Constraints

### 8.1 Allowed Core API Calls

**Organization Validation**:

- Endpoint: `GET /api/v1/organizations/:id`
- Purpose: Validate Core org exists before creating Suite mapping
- Auth: JWT Bearer token
- Tenant Context: JWT claim `organizationId`

**All Other Endpoints**: Available per `CORE_CONTRACT_V1_EXTRACT.md` Section B

---

### 8.2 Forbidden Core API Calls

**Template Publish** (DEFERRED):

- ❌ `POST /api/v1/templates/publish` (does not exist)
- ❌ Any template-related write operations

**Service Token** (NOT AVAILABLE):

- ❌ `POST /auth/service-token` (does not exist)
- ❌ `POST /auth/refresh` (does not exist)

---

## 9) Acceptance Criteria

This integration lock is ACTIVE and BINDING when:

- [x] Source of truth is documented (Bassan.os core-contract-v1-lock)
- [x] Available capabilities are explicitly listed (42 endpoints, JWT auth, tenant via JWT claim, /api/v1)
- [x] Deferred capabilities are explicitly listed (Template Publish)
- [x] Not Available capabilities are explicitly listed (S2S auth, token refresh, correlation middleware)
- [x] Suite-only features are explicitly listed (Correlation ID tracing, Suite → Core mapping)
- [x] Fail-closed rule is explicit (new dependencies require new contract version)
- [x] Integration constraints are explicit (allowed vs forbidden Core API calls)

---

## 10) Change Control

### 10.1 Required Approvals

Changes to this integration lock require:

- Written justification explaining why change is needed
- Explicit approval from Governance Authority
- New Core Contract version (if Core capabilities change)
- Version increment and git tag

### 10.2 Forbidden Changes

The following changes are FORBIDDEN without escalation:

- Adding Core capabilities not confirmed in Core Contract v1
- Removing deferred/not-available markings without Core v2 contract
- Weakening fail-closed rule
- Inventing Core endpoints

---

## 11) Signature

**Approved By**: Governance Authority  
**Date**: 2026-02-02  
**Status**: FINAL — INTEGRATION LOCK
