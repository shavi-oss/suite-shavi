# Audit Specification — Suite / platform-admin (Gate 2)

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Module Name    | platform-admin                          |
| Document Title | AUDIT_SPEC_SUITE                        |
| Repo           | Suite (Layer / Product Repo)            |
| Status         | FINAL — GATE 2                          |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-01-27                              |

---

## 1. Audit Philosophy

### 1.1 Why Audit is Mandatory for platform-admin

Audit logging is mandatory for the `platform-admin` module because:

- **Accountability**: Every administrative action must be traceable to a specific internal operator
- **Security**: Audit trails enable detection of unauthorized access attempts and policy violations
- **Compliance**: Regulatory requirements may mandate audit trails for tenant management and access control
- **Incident Response**: Audit logs provide forensic evidence for investigating security incidents or operational failures
- **Governance**: Audit trails enforce the fail-closed principle by making all STOP conditions visible

Without comprehensive audit logging, the `platform-admin` module cannot fulfill its governance and security obligations.

### 1.2 Audit as a Governance Control (Not Optional Logging)

Audit logging is a GOVERNANCE CONTROL, not optional application logging:

- Audit log write failure is a STOP condition (operation MUST NOT proceed)
- Audit logs MUST be immutable within Suite scope (no updates or deletes)
- Audit logs MUST include correlation IDs for request tracing
- Audit logs MUST sanitize sensitive data (no tokens, no credentials)
- Audit logs MUST be retained according to policy (DECISION REQUIRED)

Audit logging is NON-NEGOTIABLE. Any attempt to bypass or disable audit logging is a STOP condition.

---

## 2. Audit Event Types

### 2.1 Enumerate Event Categories and Event Names

The `platform-admin` module MUST log the following audit event types:

**Company Events**:

- `ORGANIZATION_CREATED`: Suite organization created
- `ORGANIZATION_SUSPENDED`: Suite organization suspended
- `ORGANIZATION_UNSUSPENDED`: Suite organization unsuspended

**Mapping Events**:

- `ORG_MAPPING_CREATED`: Suite organizationId ↔ Core organizationId mapping created
- `ORG_MAPPING_VALIDATION_FAILED`: Core organizationId validation failed during mapping creation

**Operator Events**:

- `INTERNAL_USER_CREATED`: Internal operator user created
- `INTERNAL_USER_DEACTIVATED`: Internal operator user deactivated

**Template Publish Events**:

- `TEMPLATE_PUBLISH_INITIATED`: Template publish operation initiated
- `TEMPLATE_PUBLISH_SUCCESS`: Template successfully published to Core
- `TEMPLATE_PUBLISH_FAILED`: Template publish failed (Core API error, timeout, validation failure)

**Failure / STOP Events**:

- `AUTHENTICATION_FAILURE`: Suite UI token validation failed
- `AUTHORIZATION_FAILURE`: RBAC check failed (insufficient role)
- `MAPPING_RESOLUTION_FAILURE`: Suite org → Core org mapping resolution failed
- `CORE_API_FAILURE`: Core API call failed (timeout, 5xx, authentication failure)
- `AUDIT_LOG_WRITE_FAILURE`: Audit log write failed (database unavailable, constraint violation)
- `VALIDATION_FAILURE`: Input validation failed

**MUST NOT log**:

- Events not listed above without explicit authorization via governance change control
- Events containing sensitive data (tokens, credentials, PII)

---

## 3. Mandatory Fields

### 3.1 Define the Required Audit Fields

Every audit log entry MUST include the following fields:

**Primary Fields**:

- `id`: Unique identifier for audit log entry (UUID)
- `correlationId`: Correlation ID for request tracing (propagated from BFF)
- `entityType`: Type of entity affected (organization, org_mapping, internal_user, template_publish)
- `entityId`: ID of affected entity (if available; NULL if entity does not exist or operation failed before entity creation)
- `action`: Action performed or attempted (create, update, suspend, unsuspend, link, deactivate, publish)
- `result`: Result of operation (SUCCESS, FAILURE)
- `performedBy`: Internal user ID who performed or attempted action (if authenticated; NULL if authentication failed)
- `performedAt`: Timestamp of action (ISO 8601 format, UTC)
- `metadata`: Additional context (JSONB, see Section 3.4)

### 3.2 CorrelationId Rules

**MUST**:

- Include correlation ID in every audit log entry
- Use correlation ID generated at BFF entry point (propagated from UI → BFF → Core)
- Ensure correlation ID is globally unique (UUID v4 or equivalent)
- Use correlation ID to trace requests across UI, BFF, Core, and audit logs

**MUST NOT**:

- Proceed with audit log write if correlation ID is missing
- Reuse correlation IDs across multiple requests
- Modify correlation ID in audit log (use exact value from BFF)

### 3.3 Actor Rules (performedBy)

**MUST**:

- Include internal user ID in `performedBy` field for all authenticated operations
- Extract user ID from validated Suite UI token
- Set `performedBy` to NULL if authentication failed (no valid user context)

**MUST NOT**:

- Include user email or name in `performedBy` (use user ID only)
- Omit `performedBy` for authenticated operations
- Include sensitive user data in `performedBy`

### 3.4 EntityType/EntityId Rules

**MUST**:

- Set `entityType` to one of: `organization`, `org_mapping`, `internal_user`, `template_publish`
- Set `entityId` to the ID of the affected entity (e.g., Suite organization ID, mapping ID, user ID, template ID)
- Set `entityId` to NULL if entity does not exist (e.g., validation failure before entity creation)

**MUST NOT**:

- Use entityType values not listed above
- Omit `entityId` when entity exists

### 3.5 Metadata Rules + Sanitization

**MUST include in `metadata` (JSONB)**:

For SUCCESS events:

- `eventType`: Event name (e.g., `ORGANIZATION_CREATED`, `TEMPLATE_PUBLISH_SUCCESS`)
- `changes`: Summary of changes made (e.g., `{ "status": "active" }`, `{ "templateId": "template-123", "coreOrgId": "core-org-456" }`)

For FAILURE events:

- `eventType`: Event name (e.g., `AUTHENTICATION_FAILURE`, `CORE_API_FAILURE`)
- `failureReason`: Safe error message (no sensitive details, no stack traces)
- `failureType`: One of: `AUTHENTICATION_FAILURE`, `AUTHORIZATION_FAILURE`, `VALIDATION_FAILURE`, `MAPPING_FAILURE`, `CORE_API_FAILURE`, `AUDIT_LOG_FAILURE`, `DATABASE_FAILURE`
- `httpStatusCode`: HTTP status code returned to UI (401, 403, 400, 404, 502, 500)

**MUST sanitize `metadata`**:

- Remove Core service tokens
- Remove Suite UI tokens
- Remove passwords or credentials
- Remove sensitive business data
- Remove stack traces or internal error details
- Remove Core internal error messages (sanitize before logging)

**MUST NOT include in `metadata`**:

- Tokens (Core service token, Suite UI token)
- Passwords or credentials
- PII (unless explicitly required and approved)
- Sensitive business data (financial records, health data)
- Stack traces
- Core internal error messages

---

## 4. Retention Policy (DECISION REQUIRED)

### 4.1 Storage Retention Duration (Placeholder)

**Audit Log Retention Duration**: 365 days (1 year)

- Rationale: Compliance requirements, security investigation needs, incident response

**MUST**:

- Retain audit logs for at least the minimum duration required by compliance or security policy
- Enforce retention policy automatically (archive or delete old logs)

**MUST NOT**:

- Delete audit logs before retention period expires
- Allow manual deletion of audit logs

### 4.2 Archive vs Delete (Placeholder)

**Archive Strategy**: Archive to cold storage after 365 days

- Archive location: Secure, immutable cloud object storage
- Manual deletion: FORBIDDEN
- Archived logs retain correlation IDs for traceability

**MUST** (if archiving):

- Archive audit logs to secure, immutable storage
- Maintain correlation IDs in archived logs for traceability
- Ensure archived logs are accessible for compliance or security investigations

**MUST NOT**:

- Archive audit logs to insecure or mutable storage
- Lose correlation IDs during archival

### 4.3 Rationale Constraints (Compliance/Security)

**MUST**:

- Define retention policy based on compliance requirements (e.g., GDPR, SOC 2, ISO 27001)
- Define retention policy based on security investigation needs (e.g., incident response, forensic analysis)
- Document rationale for retention duration in governance records

**MUST NOT**:

- Define retention policy arbitrarily without compliance or security justification
- Reduce retention duration below compliance minimum

---

## 5. Access Rules

### 5.1 Who Can Read Audit Logs (RBAC)

**MUST**:

- Enforce RBAC on audit log read operations
- Allow all internal operator roles to read audit logs (platform_admin, developer_ops, support, viewer)
- Validate Suite UI token before returning audit logs
- Deny access to deactivated users

**MUST NOT**:

- Allow unauthenticated access to audit logs
- Allow customer users to read platform-admin audit logs (out of scope)
- Expose audit logs via public endpoints

### 5.2 Export Rules (DECISION REQUIRED if Needed)

**Audit Log Export**: NOT ALLOWED in v1

- Export functionality deferred to v2
- Rationale: Minimize attack surface, enforce read-only audit log viewer in v1

**MUST** (if export is allowed):

- Enforce RBAC on export operations
- Sanitize exported audit logs (remove sensitive data)
- Log export operations to audit log (who exported, when, what filters)

**MUST NOT**:

- Allow export without RBAC check
- Export unsanitized audit logs
- Allow export to bypass retention policy

### 5.3 Tamper-Resistance Expectations (Immutability Within Suite Scope)

**MUST**:

- Treat audit logs as immutable within Suite scope (no updates or deletes)
- Prevent modification of audit log entries after creation
- Prevent deletion of audit log entries before retention period expires

**MUST NOT**:

- Allow updates to audit log entries
- Allow deletion of audit log entries (except via automated retention policy)
- Allow manual tampering with audit logs

**Tamper-Resistance Constraints**:

- Suite DB schema MUST enforce immutability (e.g., no UPDATE or DELETE permissions on audit log table for application users)
- Audit log table MUST use append-only pattern
- Any attempt to modify or delete audit logs MUST be logged and escalated

**Cryptographic Integrity**: Deferred to v2

- v1 relies on database-level immutability (append-only, no UPDATE/DELETE permissions)
- v2 may implement HMAC or digital signatures for enhanced tamper detection

---

## 6) Acceptance Criteria

This audit specification is considered ACTIVE and BINDING when ALL of the following are true:

- [ ] Audit philosophy is defined and justified
- [ ] All audit event types are enumerated (company, mapping, operator, template, failure)
- [ ] All mandatory fields are defined (correlationId, performedBy, entityType, entityId, metadata)
- [ ] Metadata sanitization rules are explicit
- [ ] Retention policy placeholders are documented (DECISION REQUIRED items identified)
- [ ] Access rules are defined (RBAC, export, tamper-resistance)
- [ ] Immutability expectations are explicit
- [ ] No contradictions exist with EXECUTION_AUTHORITY.md, ARCHITECTURAL_LAWS.md, SECURITY_BASELINE.md, or FAIL_CLOSED_MATRIX.md
- [ ] Governance Authority has reviewed and approved this document

---

## 7) Change Control

### 7.1 Required Approvals

Changes to this audit specification require:

- Written justification explaining why change is needed
- Explicit approval from Governance Authority
- Version increment and git tag
- Update to related governance documents (if applicable)

### 7.2 Forbidden Changes

The following changes are FORBIDDEN without escalation:

- Removing mandatory audit fields
- Weakening sanitization rules (allowing tokens, credentials, or PII in logs)
- Allowing audit log updates or deletes
- Reducing retention duration below compliance minimum
- Allowing unauthenticated access to audit logs
- Removing fail-closed enforcement (audit log write failure MUST remain a STOP condition)

---

## 8) Signature

**Prepared By**: Principal Software Architect & Governance Authority  
**Date**: 2026-01-27  
**Status**: FINAL — GATE 2
