# UI Error and Loading Conventions — platform-admin

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Module Name    | platform-admin                          |
| Document Title | UI_ERROR_LOADING_CONVENTIONS            |
| Repo           | Suite (Layer / Product Repo)            |
| Status         | FINAL — BINDING UI CONVENTIONS          |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-02-10                              |

---

## 1) Purpose

Define standard conventions for error states, loading states, and empty states in the platform-admin UI. These conventions ensure consistent user experience and enforce fail-closed security behavior.

---

## 2) Loading States

### 2.1 When to Show Loading State

**MUST show loading state**:

- During initial data fetch (before first response)
- During action execution (create, update, delete)
- While waiting for BFF response

**MUST NOT show loading state**:

- After data has loaded (use cached data if available)
- During background refresh (unless explicitly designed as full-page refresh)

---

### 2.2 Loading State Content

**MUST display**:

- Clear indication that operation is in progress
- Context-appropriate message (e.g., "Loading organizations...", "Creating organization...")

**MUST NOT display**:

- Spinner without context
- Technical details (endpoint URLs, request IDs)
- Estimated time remaining (unless accurately calculated)

---

### 2.3 Loading State Behavior

**MUST**:

- Disable user actions that would conflict with in-progress operation
- Prevent duplicate submissions (disable submit button during create/update)

**MUST NOT**:

- Block entire UI for partial operations
- Show loading state indefinitely (enforce timeout, see `UI_FETCH_CONTRACT.md`)

---

## 3) Empty States

### 3.1 When to Show Empty State

**MUST show empty state**:

- When list fetch returns zero items (e.g., no organizations exist)
- When search/filter returns zero results

**MUST NOT show empty state**:

- During loading (show loading state instead)
- On error (show error state instead)

---

### 3.2 Empty State Content

**MUST display**:

- Clear message indicating no data exists
- Contextual guidance (e.g., "No organizations found. Create one to get started.")
- Action to resolve empty state (e.g., "Create Organization" button)

**MUST NOT display**:

- Technical error messages
- Suggestions to contact support (unless truly exceptional)

---

## 4) Error States

### 4.1 When to Show Error State

**MUST show error state**:

- On HTTP error response (4xx, 5xx)
- On network failure (timeout, connection refused)
- On unexpected response format (JSON parse error)

**MUST NOT show error state**:

- On successful response with zero items (show empty state instead)

---

### 4.2 Error State Content (Safe Messages)

**MUST display safe error messages**:

- Generic, user-friendly message (e.g., "Failed to load organizations")
- Actionable guidance (e.g., "Please try again" with retry button)

**MUST NOT display**:

- Stack traces
- Internal error codes
- Endpoint URLs or request details
- Database error messages
- Core API error details
- Correlation IDs (used for server-side debugging only)
- Authentication tokens or credentials

---

### 4.3 Error Normalization

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

**Evidence**: `SECURITY_BASELINE.md` Section 3.5, 5.3

---

## 5) Fail-Closed Behavior (401/403)

### 5.1 Authorization Failures

**MUST on 401/403**:

- Deny UI action immediately
- Display safe error message (see Section 4.3)
- Disable retry for authorization failures (user cannot fix by retrying)

**MUST NOT on 401/403**:

- Retry automatically
- Expose reason for denial
- Suggest workarounds
- Allow fail-open behavior (e.g., showing cached data)

**Evidence**: `SECURITY_BASELINE.md` Section 3.5

---

### 5.2 Fail-Closed Principle

**MUST**:

- Default to denying access on any authorization uncertainty
- Show safe error message on any security failure
- Log detailed error server-side with correlation ID (not client-side)

**MUST NOT**:

- Fail-open (allow access on error)
- Expose internal error details to user

---

## 6) Retry Behavior

### 6.1 User-Driven Retry Only

**MUST**:

- Provide "Retry" button on error state
- Allow user to manually retry failed operation

**MUST NOT**:

- Implement automatic retries on client-side
- Retry on 401/403 (authorization failures are not retriable)
- Retry indefinitely

**Evidence**: `UI_FETCH_CONTRACT.md` Section 4

---

### 6.2 Retry Button Behavior

**MUST**:

- Re-execute original fetch operation
- Show loading state during retry
- Handle retry failure same as original failure (show error state)

**MUST NOT**:

- Retry with modified parameters (unless user explicitly changed input)
- Implement exponential backoff on client-side (not needed for user-driven retry)

---

## 7) Forbidden Behaviors

**MUST NOT**:

- Show stack traces or internal error details to users
- Display correlation IDs in UI (used for server-side debugging only)
- Expose endpoint URLs or request details
- Show database error messages
- Display Core API error details
- Implement fail-open behavior on authorization failures
- Retry automatically on client-side
- Show loading state indefinitely without timeout

**Action on violation**: STOP immediately, escalate to Governance Authority.

---

## 8) Acceptance Criteria

This conventions document is considered ACTIVE and BINDING when ALL of the following are true:

- [x] Loading state conventions are explicit
- [x] Empty state conventions are explicit
- [x] Error state conventions are explicit with safe message normalization
- [x] Fail-closed behavior on 401/403 is explicit
- [x] Retry behavior is explicit (user-driven only)
- [x] Forbidden behaviors are explicit
- [x] All evidence links are provided

---

## 9) Signature

**Approved By**: Governance Authority  
**Date**: 2026-02-10  
**Status**: FINAL — BINDING UI CONVENTIONS
