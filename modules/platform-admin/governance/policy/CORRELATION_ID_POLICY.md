# Correlation ID Policy — platform-admin

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Module Name    | platform-admin                          |
| Document Title | CORRELATION_ID_POLICY                   |
| Repo           | Suite (Layer / Product Repo)            |
| Status         | DRAFT — DOCS-ONLY                       |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-02-07                              |

---

## 1) Purpose

This document defines the **correlation ID policy** for request tracing in the platform-admin module.

**Evidence**: `MODULE_SECURITY_LAWS.md` Section 3.4 (Audit Log Integrity)

---

## 2) Definition

**Correlation ID**: A unique identifier that traces a single request across all layers (UI → BFF → Core → DB → Audit).

**Purpose**:

- Enable end-to-end request tracing
- Support incident investigation
- Link audit events to originating requests
- Facilitate debugging and troubleshooting

---

## 3) Allowed Sources

### 3.1 Preferred Source: Request Header

**Header Name**: `x-correlation-id`

**Behavior**:

- If present and valid: use as-is
- If present but invalid: reject request (fail-closed)
- If missing: generate server-side (fallback allowed)

**Evidence**: Existing controller implementations use `req.headers['x-correlation-id']`

---

### 3.2 Fallback: Server-Generated

**When**: Request header `x-correlation-id` is missing

**Generation**: Use cryptographically random UUID v4

**Evidence**: Existing controllers use `randomUUID()` from Node.js crypto module

---

## 4) Propagation Rules

### 4.1 Invariant: Correlation ID MUST Be Present

**At every layer**:

- Controller → Service → Repository → Audit
- Controller → Core Adapter → Core API
- All audit log entries
- All internal logs (safe)

**Failure Mode**: If correlationId is missing at any checkpoint, STOP and reject operation (fail-closed)

---

### 4.2 Propagation Path

```
UI Request (x-correlation-id header)
  ↓
BFF Controller (extract or generate)
  ↓
Service Layer (pass through)
  ↓
Repository / Core Adapter (include in calls)
  ↓
Audit Log (required field)
```

**Evidence**: `IMPLEMENTATION_PLAN_PLATFORM_ADMIN.md` Section 2.1 (Audit Logging)

---

## 5) Missing Correlation ID Behavior

### 5.1 Request Header Missing

**Behavior**: Generate server-side using `randomUUID()`

**Rationale**: Fail-closed for traceability (do not proceed without correlation ID)

**Evidence**: Existing controller pattern

---

### 5.2 Correlation ID Lost Mid-Request

**Behavior**: STOP → Reject operation → Return 500 Internal Server Error (safe message)

**Rationale**: Losing correlationId mid-request indicates a critical traceability failure

**Evidence**: `ARCHITECTURAL_LAWS.md` LAW-10 (Fail-Closed By Default)

---

## 6) Format Rules

### 6.1 Allowed Format

**Type**: String

**Charset**: Alphanumeric + hyphens (UUID-like format preferred)

**Length**: 1-128 characters

**Validation**: Implementation-defined (MUST reject obviously malformed values)

**Evidence**: NOT AVAILABLE (no explicit format specification in binding sources)

---

### 6.2 Forbidden Content

**MUST NOT contain**:

- Secrets, tokens, passwords
- PII (user names, emails, phone numbers)
- SQL injection attempts
- Path traversal sequences
- Control characters

**Evidence**: `SECURITY_BASELINE.md`

---

## 7) Security Requirements

### 7.1 No Secrets

**MUST NOT**: Use correlation ID to transmit secrets or authentication tokens

**MUST NOT**: Include correlation ID in JWT claims

**Evidence**: `MODULE_SECURITY_LAWS.md` Section 3.5 (JWT Protection)

---

### 7.2 No PII

**MUST NOT**: Include user-identifiable information in correlation ID

**MUST**: Use opaque, random identifiers only

**Evidence**: `SECURITY_BASELINE.md`

---

### 7.3 Safe Logging

**MAY**: Log correlation ID in server-side logs (safe)

**MUST NOT**: Log correlation ID alongside secrets or tokens

**Evidence**: `MODULE_SECURITY_LAWS.md` Section 3.4

---

## 8) Examples

### Example 1: Valid Request (Header Present)

**Request**:

```
GET /api/platform-admin/organizations
Headers:
  x-correlation-id: 550e8400-e29b-41d4-a716-446655440000
  Authorization: Bearer <suite-jwt>
```

**Behavior**: Use `550e8400-e29b-41d4-a716-446655440000` as correlationId

**Audit Log**:

```json
{
  "correlationId": "550e8400-e29b-41d4-a716-446655440000",
  "entityType": "organization",
  "action": "read",
  "result": "success"
}
```

---

### Example 2: Missing Header (Fallback)

**Request**:

```
GET /api/platform-admin/organizations
Headers:
  Authorization: Bearer <suite-jwt>
```

**Behavior**: Generate server-side correlationId (e.g., `7c9e6679-7425-40de-944b-e07fc1f90ae7`)

**Audit Log**:

```json
{
  "correlationId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "entityType": "organization",
  "action": "read",
  "result": "success"
}
```

---

### Example 3: Malformed Header (Reject)

**Request**:

```
GET /api/platform-admin/organizations
Headers:
  x-correlation-id: <script>alert('xss')</script>
  Authorization: Bearer <suite-jwt>
```

**Behavior**: Reject request → 400 Bad Request

**Response**:

```json
{
  "error": "Bad Request",
  "message": "Invalid correlation ID format"
}
```

**Audit Log**: NOT CREATED (request rejected before processing)

---

## 9) Relationship to Audit STOP Rules

**Cross-Reference**: `AUDIT_STOP_RULES.md`

- STOP Rule 1: Missing correlationId when required
- STOP Rule 6: CorrelationId mismatch across layers

**Evidence**: Gate 6 specifications

---

## 10) Signature

**Approved By**: Governance Authority  
**Date**: 2026-02-07  
**Status**: DRAFT — DOCS-ONLY
