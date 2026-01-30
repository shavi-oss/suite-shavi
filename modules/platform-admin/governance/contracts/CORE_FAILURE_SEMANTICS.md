# Core Failure Semantics — platform-admin

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Module Name    | platform-admin                          |
| Document Title | CORE_FAILURE_SEMANTICS                  |
| Repo           | Suite (Layer / Product Repo)            |
| Status         | ACTIVE — FAILURE CONTRACT               |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-01-30                              |

---

## 1) Purpose

This document defines how Suite `platform-admin` module handles failures from Bassan.os Core. It establishes:

- Error classes (4xx, 5xx, timeouts, network errors)
- BFF behavior per error class (deny, retry policy, circuit breaker)
- Safe error messages for UI
- Observability requirements (what to log, what NOT to log)

---

## 2) Error Classes

### 2.1 Authentication Errors (401 Unauthorized)

**Meaning**: Core service token is invalid, expired, or missing

**BFF Behavior**:

- **DENY** the request immediately (no retry)
- Attempt to refresh Core service token (if refresh mechanism is available)
- If token refresh fails, return safe error to UI
- Log failure with correlation ID

**Retry Policy**: **NO RETRY** (non-transient error)

**Safe Error Message**: `"Service authentication failed. Please try again later."`

**Observability**:

- Log: `"Core authentication failed (401)"`
- Log: Correlation ID, endpoint, timestamp
- **MUST NOT** log: Core service token value

---

### 2.2 Authorization Errors (403 Forbidden)

**Meaning**: Core service token is valid but lacks permission for requested operation

**BFF Behavior**:

- **DENY** the request immediately (no retry)
- Return safe error to UI
- Log failure with correlation ID

**Retry Policy**: **NO RETRY** (non-transient error)

**Safe Error Message**: `"Operation not authorized. Please contact support."`

**Observability**:

- Log: `"Core authorization failed (403)"`
- Log: Correlation ID, endpoint, `coreOrgId`, timestamp
- **MUST NOT** log: Core internal error details

---

### 2.3 Not Found Errors (404 Not Found)

**Meaning**: Requested Core resource does not exist (e.g., org, template)

**BFF Behavior**:

- **DENY** the request immediately (no retry)
- Return safe error to UI (context-specific)
- Log failure with correlation ID

**Retry Policy**: **NO RETRY** (non-transient error)

**Safe Error Messages** (context-specific):

- Org validation: `"Core organization not found. Please verify mapping."`
- Template publish: `"Template not found. Please contact support."`

**Observability**:

- Log: `"Core resource not found (404)"`
- Log: Correlation ID, endpoint, `coreOrgId`, resource ID, timestamp

---

### 2.4 Conflict Errors (409 Conflict)

**Meaning**: Resource already exists or operation conflicts with current state

**BFF Behavior**:

- **DENY** the request immediately (no retry)
- Return safe error to UI
- Log failure with correlation ID

**Retry Policy**: **NO RETRY** (non-transient error)

**Safe Error Message**: `"Operation conflicts with existing data. Please contact support."`

**Observability**:

- Log: `"Core conflict error (409)"`
- Log: Correlation ID, endpoint, `coreOrgId`, timestamp

---

### 2.5 Validation Errors (422 Unprocessable Entity)

**Meaning**: Request payload is invalid or violates Core business rules

**BFF Behavior**:

- **DENY** the request immediately (no retry)
- Return safe error to UI (sanitize Core error details)
- Log failure with correlation ID

**Retry Policy**: **NO RETRY** (non-transient error)

**Safe Error Message**: `"Invalid request. Please verify input and try again."`

**Observability**:

- Log: `"Core validation error (422)"`
- Log: Correlation ID, endpoint, sanitized error details, timestamp
- **MUST NOT** log: Core internal validation details (sanitize first)

---

### 2.6 Rate Limiting Errors (429 Too Many Requests)

**Meaning**: Core is rate-limiting requests from BFF

**BFF Behavior**:

- **DENY** the request immediately (no retry within same request)
- Return safe error to UI
- Log failure with correlation ID
- **Consider**: Implement client-side rate limiting to prevent hitting Core limits

**Retry Policy**: **NO RETRY** (within same request; backoff for future requests)

**Safe Error Message**: `"Service is busy. Please try again later."`

**Observability**:

- Log: `"Core rate limit exceeded (429)"`
- Log: Correlation ID, endpoint, timestamp
- **Alert**: If rate limiting occurs frequently, alert operations team

---

### 2.7 Server Errors (5xx)

**Meaning**: Core internal server error (transient or persistent)

**BFF Behavior**:

- **RETRY** with bounded backoff (max retries depend on operation type)
- If all retries fail, **DENY** the request
- Return safe error to UI
- Log failure with correlation ID

**Retry Policy**:

- **Read Operations**: Max 3 retries, exponential backoff (1s, 2s, 4s)
- **Write Operations**: Max 2 retries, exponential backoff (1s, 2s), **WITH idempotency key**

**Safe Error Message**: `"Service temporarily unavailable. Please try again later."`

**Observability**:

- Log: `"Core server error (5xx)"`
- Log: Correlation ID, endpoint, status code, retry count, timestamp
- **Alert**: If 5xx errors persist, alert operations team

---

### 2.8 Timeout Errors

**Meaning**: Core API did not respond within timeout duration

**BFF Behavior**:

- **RETRY** with bounded backoff (max retries depend on operation type)
- If all retries fail, **DENY** the request
- Return safe error to UI
- Log failure with correlation ID

**Retry Policy**:

- **Read Operations**: Max 3 retries, exponential backoff (1s, 2s, 4s)
- **Write Operations**: Max 2 retries, exponential backoff (1s, 2s), **WITH idempotency key**

**Timeout Durations**:

- **Read Operations** (GET): 10 seconds
- **Write Operations** (POST, PATCH): 20 seconds

**Safe Error Message**: `"Request timed out. Please try again later."`

**Observability**:

- Log: `"Core request timeout"`
- Log: Correlation ID, endpoint, timeout duration, retry count, timestamp
- **Alert**: If timeouts persist, alert operations team

---

### 2.9 Network Errors

**Meaning**: Network connection to Core failed (DNS, connection refused, etc.)

**BFF Behavior**:

- **RETRY** with bounded backoff (max retries depend on operation type)
- If all retries fail, **DENY** the request
- Return safe error to UI
- Log failure with correlation ID

**Retry Policy**:

- **Read Operations**: Max 3 retries, exponential backoff (1s, 2s, 4s)
- **Write Operations**: Max 2 retries, exponential backoff (1s, 2s), **WITH idempotency key**

**Safe Error Message**: `"Network error. Please try again later."`

**Observability**:

- Log: `"Core network error"`
- Log: Correlation ID, endpoint, error type, retry count, timestamp
- **Alert**: If network errors persist, alert operations team

---

## 3) BFF Behavior Summary

| Error Class | HTTP Status | Retry? | Max Retries | Backoff     | Safe Message                                      |
| ----------- | ----------- | ------ | ----------- | ----------- | ------------------------------------------------- |
| Auth        | 401         | No     | 0           | N/A         | "Service authentication failed. Try again later." |
| Authz       | 403         | No     | 0           | N/A         | "Operation not authorized. Contact support."      |
| Not Found   | 404         | No     | 0           | N/A         | "Resource not found. Verify mapping."             |
| Conflict    | 409         | No     | 0           | N/A         | "Operation conflicts. Contact support."           |
| Validation  | 422         | No     | 0           | N/A         | "Invalid request. Verify input."                  |
| Rate Limit  | 429         | No     | 0           | N/A         | "Service is busy. Try again later."               |
| Server      | 5xx         | Yes    | 2-3         | Exponential | "Service temporarily unavailable."                |
| Timeout     | N/A         | Yes    | 2-3         | Exponential | "Request timed out. Try again later."             |
| Network     | N/A         | Yes    | 2-3         | Exponential | "Network error. Try again later."                 |

---

## 4) Circuit Breaker Principle

**Purpose**: Prevent cascading failures by temporarily stopping calls to failing Core endpoints

**Thresholds** (TBD):

- **Failure Count to Open Circuit**: 5 consecutive failures
- **Timeout in Open State**: 60 seconds
- **Recovery Strategy**: Half-open state, single test request

**Behavior**:

- **Closed State**: Normal operation, all requests proceed
- **Open State**: All requests fail immediately (no Core API calls), return safe error to UI
- **Half-Open State**: Single test request to Core; if successful, close circuit; if failed, reopen circuit

**Observability**:

- Log circuit breaker state changes (open, half-open, closed)
- Include correlation ID, endpoint, timestamp

**TODO (BLOCKED)**:

- [ ] Implement circuit breaker pattern if Core integration proves unstable during testing
- [ ] Define exact thresholds based on Core SLA

---

## 5) Safe Error Messages

**Principles**:

- **MUST** return user-friendly, actionable messages
- **MUST NOT** expose Core internal error details
- **MUST** include correlation ID in error response (for support debugging)

**Examples**:

- `"Organization mapping not found. Please link this organization to Core first."`
- `"Service temporarily unavailable. Please try again later."`
- `"Invalid template. Please contact support."`
- `"Core organization not found. Please verify mapping."`

**Error Response Format** (JSON):

```json
{
  "error": {
    "code": "MAPPING_NOT_FOUND",
    "message": "Organization mapping not found. Please link this organization to Core first.",
    "correlationId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

---

## 6) Observability Requirements

### 6.1 What to Log

**MUST Log**:

- Correlation ID (every log entry)
- Core API call (endpoint, method, status code, duration)
- Tenant context (`coreOrgId` when applicable)
- Error class and retry count
- Token refresh events (WITHOUT token value)
- Circuit breaker state changes

**Log Levels**:

- **INFO**: Successful Core API calls, token refresh
- **WARN**: Retries, circuit breaker state changes
- **ERROR**: Final failures (after retries), authentication/authorization errors

---

### 6.2 What NOT to Log

**MUST NOT Log**:

- Core service token value
- UI token value
- API keys, passwords, credentials
- Core internal error details (sanitize first)
- PII or confidential business data

---

### 6.3 Metrics (TBD)

**TODO**: Define metrics to track:

- Core API latency (p50, p95, p99)
- Core API error rate (by error class)
- Retry count (by operation type)
- Circuit breaker state duration
- Token refresh frequency

---

### 6.4 Alerts (TBD)

**TODO**: Define alerts for critical failures:

- Core API down (5xx errors persist for >5 minutes)
- Token refresh failure (repeated 401 errors)
- Circuit breaker open (for >5 minutes)
- Rate limiting (429 errors persist)

---

## 7) Stop Rules

Execution MUST STOP IMMEDIATELY if:

- BFF retries 4xx errors (client errors)
- BFF retries without idempotency key for write operations
- BFF exposes Core internal error details to UI
- BFF logs Core service token value
- BFF proceeds with operation after all retries fail (without denying request)

**Action on STOP**: Halt all work, document violation, escalate to Governance Authority.

---

## 8) Acceptance Criteria

This failure semantics contract is ACTIVE and BINDING when:

- [x] All error classes are explicitly defined with BFF behavior
- [x] Retry policies are explicit and bounded
- [x] Safe error messages are defined
- [x] Circuit breaker principle is documented (or marked TBD)
- [x] Observability requirements are explicit (what to log, what NOT to log)
- [x] TODO list documents unknown metrics/alerts
- [ ] Core team has confirmed error codes and meanings (BLOCKED)

---

## 9) Signature

**Approved By**: Governance Authority  
**Date**: 2026-01-30  
**Status**: ACTIVE — FAILURE CONTRACT
