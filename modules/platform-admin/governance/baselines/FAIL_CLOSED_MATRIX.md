# Fail-Closed Decision Matrix — platform-admin

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Module Name    | platform-admin                          |
| Document Title | FAIL_CLOSED_MATRIX                      |
| Repo           | Suite (Layer / Product Repo)            |
| Status         | FINAL — GATE 5.3A ALIGNED               |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-02-04                              |

---

## 1. Fail-Closed Philosophy

### 1.1 Definition

Fail-closed is a security and governance principle where the system defaults to DENY when:

- Required context is missing (authentication, authorization, tenant mapping)
- Validation fails (invalid input, unauthorized action)
- Uncertainty exists (ambiguous mapping, unknown state)
- External dependency fails (Core API unavailable, timeout)

The system MUST NOT guess, infer, or create fallback behaviors that broaden access.

### 1.2 Why Fail-Closed is Mandatory for platform-admin

The `platform-admin` module manages critical infrastructure:

- Tenant isolation boundaries (organizationId mapping)
- Internal operator access control (RBAC)
- Core integration (template publishing, org validation)
- Audit trail integrity

Any failure in these areas could result in:

- Cross-tenant data leakage
- Unauthorized administrative actions
- Core contamination
- Audit trail gaps

Therefore, fail-closed is NON-NEGOTIABLE. When in doubt, DENY.

---

## 2. Global STOP Rules

The following rules apply to ALL operations in the `platform-admin` module:

### 2.1 Authentication STOP Rules

**MUST STOP if**:

- Suite UI token is missing
- Suite UI token is expired
- Suite UI token is invalid (signature verification fails)
- Suite UI token is malformed

**System Action**: Deny request. Return 401 Unauthorized. Log attempt with correlation ID.

### 2.2 Authorization STOP Rules

**MUST STOP if**:

- User role is missing from token
- User role is insufficient for requested operation
- User is deactivated
- RBAC check fails for any reason

**System Action**: Deny request. Return 403 Forbidden. Log attempt with correlation ID and user ID.

### 2.3 Tenant Mapping STOP Rules

**MUST STOP if**:

- Suite organizationId has no corresponding Core organizationId in SuiteOrgMapping table
- Mapping is ambiguous (multiple Suite orgs map to same Core org without explicit authorization)
- Mapping resolution fails for any reason

**System Action**: Deny request. Log failure with correlation ID. Return safe error to UI.

### 2.4 Core Integration STOP Rules

**MUST STOP if**:

- Core API returns authentication failure (401)
- Core API returns authorization failure (403)
- Correlation ID cannot be generated or propagated

**System Action**: Deny request. Log failure with correlation ID. Return safe error to UI. Do NOT retry. Token refresh is NOT AVAILABLE.

### 2.5 Audit Logging STOP Rules

**MUST STOP if**:

- Audit log write fails (database unavailable, constraint violation)
- Correlation ID is missing
- Required audit fields are missing (performedBy, entityType, action)

**System Action**: Rollback operation. Deny request. Log failure. Return error to UI.

### 2.6 Data Validation STOP Rules

**MUST STOP if**:

- Required input fields are missing
- Input validation fails (type, length, format)
- Input contains malicious patterns (SQL injection, XSS)

**System Action**: Deny request. Return 400 Bad Request. Log attempt with correlation ID.

---

## 3. Use Case Decision Matrix

| Use Case                                     | Preconditions                                                                                                                | Validation Performed                                                                                                                                                          | Failure Condition                                                                                                                                                 | System Action                                                                                                                                          |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Create Suite Organization**                | Valid Suite UI token; User role = platform_admin OR developer_ops                                                            | Validate token; Check RBAC; Validate organization name (non-empty, unique); Generate correlation ID                                                                           | Token invalid; Insufficient role; Name validation fails; Audit log write fails                                                                                    | DENY. Return 401/403/400. Log failure. Do NOT create organization.                                                                                     |
| **Suspend / Unsuspend Organization**         | Valid Suite UI token; User role = platform_admin OR developer_ops; Organization exists in Suite DB                           | Validate token; Check RBAC; Validate organization exists; Validate organization is not already in target state; Generate correlation ID                                       | Token invalid; Insufficient role; Organization not found; Already suspended/unsuspended; Audit log write fails                                                    | DENY. Return 401/403/404/400. Log failure. Do NOT update organization.                                                                                 |
| **Create OrgId Mapping**                     | Valid Suite UI token; User role = platform_admin OR developer_ops; Suite organizationId exists; Core organizationId provided | Validate token; Check RBAC; Validate Suite org exists; Call Core API to validate Core org exists; Validate mapping does not already exist; Generate correlation ID            | Token invalid; Insufficient role; Suite org not found; Core org validation fails (Core API timeout, 404, 401, 403); Mapping already exists; Audit log write fails | DENY. Return 401/403/404/400/502. Log failure. Do NOT create mapping. If Core API fails, return safe error (no Core internal details).                 |
| **Resolve OrgId Mapping (before Core call)** | Suite organizationId provided                                                                                                | Query SuiteOrgMapping table for Suite org → Core org mapping                                                                                                                  | Mapping not found; Mapping is ambiguous (multiple results); Database query fails                                                                                  | DENY. Log failure with correlation ID. Return safe error to UI. Do NOT proceed with Core API call. Do NOT guess or use default Core org.               |
| **Create Internal User**                     | Valid Suite UI token; User role = platform_admin OR developer_ops                                                            | Validate token; Check RBAC; Validate email (non-empty, valid format, unique); Validate role (one of: platform_admin, developer_ops, support, viewer); Generate correlation ID | Token invalid; Insufficient role; Email validation fails; Role validation fails; Email already exists; Audit log write fails                                      | DENY. Return 401/403/400. Log failure. Do NOT create user.                                                                                             |
| **Deactivate Internal User**                 | Valid Suite UI token; User role = platform_admin OR developer_ops; User exists in Suite DB                                   | Validate token; Check RBAC; Validate user exists; Validate user is not already deactivated; Generate correlation ID                                                           | Token invalid; Insufficient role; User not found; User already deactivated; Audit log write fails                                                                 | DENY. Return 401/403/404/400. Log failure. Do NOT update user.                                                                                         |
| **Publish Predefined Template**              | Valid Suite UI token; User role = platform_admin OR developer_ops; Template ID provided; Suite organizationId provided       | Validate token; Check RBAC; Validate template exists in Suite codebase; Resolve Suite org → Core org mapping.                                                                 | Token invalid; Insufficient role; Template not found; Mapping resolution fails; Feature Access Attempt                                                            | **DEFERRED / BLOCKED**. Template Publishing is **NOT AVAILABLE** in Core v1. Return 501 Not Implemented or 403 Forbidden. Do NOT attempt to call Core. |
| **Read Audit Logs**                          | Valid Suite UI token; User role = any (platform_admin, developer_ops, support, viewer)                                       | Validate token; Check user is not deactivated; Validate query parameters (date range, entity type, action)                                                                    | Token invalid; User deactivated; Query parameter validation fails                                                                                                 | DENY. Return 401/403/400. Log attempt. Do NOT return audit logs.                                                                                       |

---

## 4. Non-Recoverable Failures

The following failures MUST NEVER be retried automatically:

### 4.1 Authentication Failures (401)

- Core API returns 401 Unauthorized
- Suite UI token is invalid

**Rationale**: Authentication failure indicates missing or invalid credentials. Retry will not succeed without corrective action (token refresh, re-authentication).

**System Action**: Log failure. Return error to UI. Do NOT retry. Token refresh is NOT AVAILABLE.

### 4.2 Authorization Failures (403)

- Core API returns 403 Forbidden
- RBAC check fails (insufficient role)

**Rationale**: Authorization failure indicates insufficient permissions. Retry will not succeed without permission change.

**System Action**: Log failure. Return error to UI. Do NOT retry.

### 4.3 Client Errors (4xx)

- Core API returns 400 Bad Request
- Core API returns 404 Not Found
- Input validation fails

**Rationale**: Client errors indicate invalid request. Retry will not succeed without request correction.

**System Action**: Log failure. Return error to UI. Do NOT retry.

### 4.4 Mapping Resolution Failures

- Suite organizationId has no corresponding Core organizationId
- Mapping is ambiguous

**Rationale**: Missing or ambiguous mapping indicates configuration error. Retry will not succeed without manual mapping creation or correction.

**System Action**: Log failure. Return safe error to UI. Do NOT retry. Do NOT guess or use default mapping.

### 4.5 Audit Log Write Failures

- Database unavailable
- Constraint violation
- Required fields missing

**Rationale**: Audit logging is mandatory. If audit log write fails, the operation MUST NOT proceed.

**System Action**: Rollback operation. Log failure. Return error to UI. Do NOT retry operation without resolving audit log issue.

### 4.6 Idempotency Violations (Principle — Not Applicable in Core v1 MVP)

> [!NOTE]
> Core v1 MVP uses read-only Core endpoint (`GET /api/v1/organizations/:id`).
> Idempotency requirements apply only if write operations are introduced in future Core versions.

**Principle** (for future write operations):

- Non-idempotent operation without idempotency key → Do NOT retry
- Duplicate request detected → Return error

**Rationale**: Retrying non-idempotent operations may result in duplicate resources or inconsistent state.

**System Action** (if applicable): Log failure. Return error to UI. Do NOT retry without idempotency safeguards.

---

## 5. Audit Requirements on Failure

### 5.1 What MUST Be Logged

Every failure MUST be logged to `PlatformAdminAuditLog` with the following fields:

**Mandatory Fields**:

- `correlationId`: Unique identifier for request tracing
- `entityType`: Type of entity affected (organization, org_mapping, internal_user, template_publish)
- `entityId`: ID of affected entity (if available; NULL if entity does not exist)
- `action`: Action attempted (create, update, suspend, unsuspend, link, deactivate, publish)
- `performedBy`: Internal user ID who attempted action (if authenticated; NULL if authentication failed)
- `performedAt`: Timestamp of failure
- `metadata`: JSONB containing:
  - `result`: "FAILURE"
  - `failureReason`: Safe error message (no sensitive details, no stack traces)
  - `failureType`: One of: AUTHENTICATION_FAILURE, AUTHORIZATION_FAILURE, VALIDATION_FAILURE, MAPPING_FAILURE, CORE_API_FAILURE, AUDIT_LOG_FAILURE, DATABASE_FAILURE
  - `httpStatusCode`: HTTP status code returned to UI (401, 403, 400, 404, 502, 500)

**MUST NOT Log**:

- Core JWTs (NOT AVAILABLE: service tokens in Core v1)
- Suite UI tokens
- Passwords or credentials
- Sensitive business data
- Stack traces or internal error details
- Core internal error messages (sanitize before logging)

### 5.2 Correlation Requirements

**MUST**:

- Generate correlation ID at BFF entry point (first request handler)
- Propagate correlation ID to all downstream operations (database queries, Core API calls, audit logs)
- Include correlation ID in all log entries for that request
- Return correlation ID to UI in error responses for debugging

**MUST NOT**:

- Proceed with operation if correlation ID generation fails
- Omit correlation ID from audit logs
- Reuse correlation IDs across multiple requests

### 5.3 Failure Logging Exceptions

If audit log write fails (database unavailable), the system MUST:

1. Rollback the operation (do NOT proceed)
2. Log failure to application logs (not audit log)
3. Return error to UI with correlation ID
4. Escalate to Governance Authority

Audit log write failure is a STOP condition. The operation MUST NOT succeed if audit logging fails.

---

## 6) Acceptance Criteria

This fail-closed matrix is considered ACTIVE and BINDING when ALL of the following are true:

- [ ] Fail-closed philosophy is defined and justified
- [ ] Global STOP rules are explicit and enforceable
- [ ] Use case decision matrix covers all critical operations
- [ ] Non-recoverable failures are explicitly listed
- [ ] Audit requirements on failure are defined
- [ ] Correlation ID requirements are explicit
- [ ] No contradictions exist with EXECUTION_AUTHORITY.md, ARCHITECTURAL_LAWS.md, SECURITY_BASELINE.md, or STACK_BOUNDARIES.md
- [ ] Governance Authority has reviewed and approved this document

---

## 7) Change Control

### 7.1 Required Approvals

Changes to this fail-closed matrix require:

- Written justification explaining why change is needed
- Explicit approval from Governance Authority
- Version increment and git tag
- Update to related governance documents (if applicable)

### 7.2 Forbidden Changes

The following changes are FORBIDDEN without escalation:

- Weakening fail-closed rules
- Allowing retry of non-recoverable failures
- Removing STOP conditions
- Allowing operations to proceed when audit logging fails
- Allowing operations to proceed when mapping resolution fails
- Defaulting to ALLOW when context is missing or ambiguous

---

## 8) Signature

**Prepared By**: Governance Authority  
**Date**: 2026-02-04  
**Status**: FINAL — CORE V1 ALIGNED

---

## 9) Changelog (Gate 5.3A)

- **UPDATED**: Section 2.4 to remove Core service token checks and add explicit "No Refresh" rule.
- **UPDATED**: Section 3 (Publish Predefined Template) to mark as DEFERRED / BLOCKED.
- **CRITICAL FIX**: Section 4.1 to REMOVE "refresh and retry ONCE" logic. Now strictly DENY.
- **UPDATED**: Document status to GATE 5.3A ALIGNED.
