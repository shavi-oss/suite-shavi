# UI Correlation ID Policy — platform-admin

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Module Name    | platform-admin                          |
| Document Title | UI_CORRELATION_ID_POLICY                |
| Repo           | Suite (Layer / Product Repo)            |
| Status         | FINAL — BINDING CORRELATION ID POLICY   |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-02-10                              |

---

## 1) Purpose

Define the policy for correlation ID generation, propagation, and usage in the platform-admin UI. Correlation IDs enable request tracing and debugging without exposing sensitive information to users.

---

## 2) Why Correlation ID Exists

### 2.1 Purpose

**Correlation ID enables**:

- Request tracing across UI → BFF → Core (where applicable)
- Debugging failed requests without exposing sensitive details
- Linking client-side errors to server-side logs
- Support troubleshooting with safe reference identifier

---

### 2.2 Non-Goals

**Correlation ID is NOT**:

- A security token or authentication mechanism
- A session identifier
- A user identifier
- A replacement for proper error handling
- Visible to end users in error messages

---

## 3) Generation Rules

### 3.1 Client-Side Generation

**MUST**:

- Generate correlation ID on client-side (UI)
- Generate new correlation ID for each request
- Use UUID v4 format

**MUST NOT**:

- Reuse correlation IDs across requests
- Use sequential or predictable IDs
- Include user information or session data in correlation ID

---

### 3.2 Implementation

**MUST use**:

- Native `crypto.randomUUID()` if available
- Fallback to manual UUID v4 implementation if `crypto.randomUUID()` unavailable

**MUST NOT**:

- Add external dependencies for UUID generation
- Use non-standard ID formats

**Evidence**: Gate 21 implementation (`src/utils/correlation.ts`)

---

## 4) Propagation Rules

### 4.1 HTTP Header

**MUST**:

- Include correlation ID in `X-Correlation-Id` header on every BFF request
- Use exact header name: `X-Correlation-Id` (case-sensitive)

**MUST NOT**:

- Use alternative header names
- Omit correlation ID from any request

**Evidence**: `INTEGRATION_CONTRACT_CORE.md` Section 8.1

---

### 4.2 Request Scope

**MUST include correlation ID in**:

- All GET requests
- All POST requests
- All PATCH requests
- All DELETE requests (if applicable)

**MUST NOT**:

- Include correlation ID in URL or query parameters
- Include correlation ID in request body

---

## 5) Forbidden Practices

### 5.1 User Exposure

**MUST NOT**:

- Display correlation ID in error messages to users
- Show correlation ID in UI (except in debug mode, if explicitly authorized)
- Include correlation ID in user-facing logs or alerts

**Rationale**: Correlation ID is for server-side debugging only. Exposing it to users adds no value and may cause confusion.

---

### 5.2 Security Misuse

**MUST NOT**:

- Use correlation ID as authentication token
- Use correlation ID as session identifier
- Use correlation ID for authorization decisions
- Include sensitive data in correlation ID

---

### 5.3 Logging Misuse

**MUST NOT**:

- Log correlation ID on client-side (console.log, etc.) in production
- Include correlation ID in client-side error tracking (unless explicitly authorized)

**MUST**:

- Log correlation ID on server-side (BFF) for all requests

**Evidence**: `SECURITY_BASELINE.md` Section 4.7

---

## 6) Server-Side Expectations

### 6.1 BFF Behavior

**BFF MUST**:

- Extract `X-Correlation-Id` header from incoming request
- Include correlation ID in all server-side logs for that request
- Propagate correlation ID to Core (if calling Core APIs)

**BFF MUST NOT**:

- Reject requests missing correlation ID (generate one if missing)
- Expose correlation ID in error responses to UI (log server-side only)

---

### 6.2 Core Behavior (Black Box)

**Core behavior is NOT GUARANTEED**:

- Core may or may not log correlation ID
- Core may or may not propagate correlation ID internally
- Correlation ID is for Suite-side tracing only

**Evidence**: `INTEGRATION_CONTRACT_CORE.md` Section 12.4

---

## 7) Non-Goals

**Correlation ID is NOT for**:

- End-to-end tracing across all systems (Core is black box)
- User-facing error identification (use safe error messages instead)
- Session management or authentication
- Rate limiting or abuse detection

---

## 8) Acceptance Criteria

This correlation ID policy is considered ACTIVE and BINDING when ALL of the following are true:

- [x] Purpose and non-goals are explicit
- [x] Generation rules are explicit (client-side, UUID v4)
- [x] Propagation rules are explicit (X-Correlation-Id header)
- [x] Forbidden practices are explicit (no user exposure, no security misuse)
- [x] Server-side expectations are documented
- [x] All evidence links are provided

---

## 9) Signature

**Approved By**: Governance Authority  
**Date**: 2026-02-10  
**Status**: FINAL — BINDING CORRELATION ID POLICY
