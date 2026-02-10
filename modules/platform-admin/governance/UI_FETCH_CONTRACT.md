# UI Fetch Contract — platform-admin

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Module Name    | platform-admin                          |
| Document Title | UI_FETCH_CONTRACT                       |
| Repo           | Suite (Layer / Product Repo)            |
| Status         | FINAL — BINDING FETCH BEHAVIOR          |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-02-10                              |

---

## 1) Purpose

Define the contract for HTTP fetch behavior in the platform-admin UI. This contract ensures consistent request handling, timeout enforcement, and fail-closed security behavior.

---

## 2) Technology Constraint

**MUST use**: Native `fetch` API only

**MUST NOT use**: axios, superagent, or any other HTTP client library

**Evidence**: `RFC_003_UI_TOOLING_ALLOWLIST.md`

---

## 3) Request Lifecycle

### 3.1 Request Preparation

**MUST**:

- Generate correlation ID (see `UI_CORRELATION_ID_POLICY.md`)
- Set `Content-Type: application/json` header for POST/PATCH requests
- Include `X-Correlation-Id` header in all requests
- Construct full URL with base path `/api/platform-admin`

**MUST NOT**:

- Include authentication tokens in URL or query parameters
- Hardcode endpoint URLs (use constants or configuration)
- Include sensitive data in headers (except correlation ID)

---

### 3.2 Request Execution

**MUST**:

- Use native `fetch` API
- Set explicit timeout (see Section 4)
- Handle network errors gracefully

**MUST NOT**:

- Execute requests without timeout
- Ignore network errors
- Retry automatically (see Section 5)

---

### 3.3 Response Handling

**MUST**:

- Check `response.ok` before parsing body
- Handle HTTP status codes explicitly (200, 201, 400, 401, 403, 404, 500)
- Normalize errors to safe messages (see `UI_ERROR_LOADING_CONVENTIONS.md`)

**MUST NOT**:

- Assume successful response without checking status
- Expose raw error responses to users
- Parse response body on error without validation

---

## 4) Timeout Rules

### 4.1 Timeout Values

**MUST enforce timeouts**:

| Operation Type | Timeout    |
| -------------- | ---------- |
| GET (read)     | 10 seconds |
| POST (create)  | 30 seconds |
| PATCH (update) | 30 seconds |

**Evidence**: `INTEGRATION_CONTRACT_CORE.md` Section 7.3

---

### 4.2 Timeout Implementation

**MUST**:

- Use `AbortController` with `setTimeout` to enforce timeout
- Throw timeout error if request exceeds timeout value
- Normalize timeout error to safe message (see `UI_ERROR_LOADING_CONVENTIONS.md`)

**MUST NOT**:

- Allow requests to run indefinitely
- Ignore timeout errors
- Retry on timeout (user-driven retry only)

---

### 4.3 Timeout Error Handling

**MUST**:

- Display safe error message: "Request timed out. Please try again."
- Provide user-driven retry option
- Log timeout with correlation ID (server-side, not client-side)

**MUST NOT**:

- Expose timeout duration to user
- Retry automatically on timeout

---

## 5) Retry Policy

### 5.1 No Automatic Retries

**MUST NOT**:

- Implement automatic retries on client-side
- Retry on any HTTP status code (including 5xx)
- Retry on network errors or timeouts

**Rationale**: Client-side retries can cause duplicate requests, increase load, and complicate error handling. User-driven retry is safer and more transparent.

**Evidence**: `INTEGRATION_CONTRACT_CORE.md` Section 7.1

---

### 5.2 User-Driven Retry Only

**MUST**:

- Provide "Retry" button on error state
- Allow user to manually retry failed operation

**MUST NOT**:

- Retry on 401/403 (authorization failures are not retriable)

**Evidence**: `UI_ERROR_LOADING_CONVENTIONS.md` Section 6

---

## 6) Error Normalization

### 6.1 HTTP Status Code Handling

**MUST normalize errors to safe messages**:

| HTTP Status | Safe Message                                              |
| ----------- | --------------------------------------------------------- |
| 400         | "Invalid request. Please check your input."               |
| 401         | "Unauthorized access. Please contact your administrator." |
| 403         | "Unauthorized access. Please contact your administrator." |
| 404         | "Resource not found."                                     |
| 500         | "An error occurred. Please try again."                    |
| Network     | "Network error. Please check your connection."            |
| Timeout     | "Request timed out. Please try again."                    |

**Evidence**: `UI_ERROR_LOADING_CONVENTIONS.md` Section 4.3

---

### 6.2 Fail-Closed on 401/403

**MUST on 401/403**:

- Throw error immediately (do not retry)
- Display safe error message
- Deny UI action

**MUST NOT on 401/403**:

- Retry automatically
- Expose reason for denial
- Allow fail-open behavior

**Evidence**: `SECURITY_BASELINE.md` Section 3.5

---

## 7) Header Rules

### 7.1 Required Headers

**MUST include in all requests**:

- `X-Correlation-Id: <uuid>` (see `UI_CORRELATION_ID_POLICY.md`)
- `Content-Type: application/json` (for POST/PATCH with body)

**MUST NOT include**:

- Authentication tokens (handled by browser/HTTP-only cookies)
- Custom headers not explicitly authorized

---

### 7.2 Forbidden Headers

**MUST NOT include**:

- `Authorization: Bearer <token>` (UI does not possess Core tokens)
- `X-Organization-Id` or `X-Tenant-Id` (tenant context derived from session)
- Any header exposing internal implementation details

**Evidence**: `INTEGRATION_CONTRACT_CORE.md` Section 5.2

---

## 8) Forbidden Behaviors

**MUST NOT**:

- Use HTTP client libraries other than native `fetch`
- Execute requests without timeout
- Implement automatic retries
- Retry on 401/403
- Expose raw error responses to users
- Include authentication tokens in URL or query parameters
- Allow requests to run indefinitely
- Ignore network errors or timeouts

**Action on violation**: STOP immediately, escalate to Governance Authority.

---

## 9) Acceptance Criteria

This fetch contract is considered ACTIVE and BINDING when ALL of the following are true:

- [x] Technology constraint is explicit (native fetch only)
- [x] Request lifecycle is documented (preparation, execution, response handling)
- [x] Timeout rules are explicit with values
- [x] Retry policy is explicit (no automatic retries)
- [x] Error normalization is explicit with safe messages
- [x] Header rules are explicit (required and forbidden)
- [x] Forbidden behaviors are explicit
- [x] All evidence links are provided

---

## 10) Signature

**Approved By**: Governance Authority  
**Date**: 2026-02-10  
**Status**: FINAL — BINDING FETCH BEHAVIOR
