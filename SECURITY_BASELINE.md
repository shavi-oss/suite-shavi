# Suite — SECURITY_BASELINE (Minimum Security Invariants)

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Document Title | SECURITY_BASELINE                       |
| Repo           | Suite (Layer / Product Repo)            |
| Status         | FINAL — BINDING SECURITY REQUIREMENTS   |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-01-26                              |

---

## 1) Security Scope

This baseline applies to all components within Suite layer:

- **Suite UI** (web/mobile frontend applications)
- **Suite BFF** (Backend-for-Frontend API layer)
- **Suite DB** (Suite-owned database)
- **Core Integration Boundary** (BFF ↔ Core communication)

**Out of Scope**: Bassan.os Core internal security (Core is responsible for its own security posture).

---

## 2) Threat Model Summary (High-Level)

### 2.1 Tenant Isolation Threats

- Cross-tenant data leakage via improper organizationId scoping
- Tenant confusion due to ambiguous or missing organizationId mapping
- Unauthorized access to another tenant's data via IDOR-like attacks at BFF

### 2.2 Token Leakage & Misuse

- Core service token exposed to UI or client-side code
- UI token forwarded to Core (violates token separation)
- Token replay attacks
- Token stored insecurely (localStorage, logs, error messages)

### 2.3 Injection & Input Validation

- SQL injection via unsanitized inputs to Suite DB
- NoSQL injection (if applicable)
- Command injection via BFF endpoints
- XSS via unsanitized output in UI

### 2.4 Abuse & Rate Limiting

- API abuse via excessive requests to BFF
- Resource exhaustion attacks
- Credential stuffing / brute force attacks on authentication endpoints

### 2.5 IDOR-Like Risks at BFF

- Direct object reference attacks where attacker manipulates IDs to access unauthorized resources
- Missing authorization checks on BFF endpoints

---

## 3) Security Invariants (Non-Negotiable)

### 3.1 Tenant Isolation

**MUST**: Every Suite DB query MUST be scoped to the authenticated user's organizationId.

**MUST**: Any ambiguity in organizationId mapping MUST fail-closed (deny access, return safe error).

**MUST NOT**: Allow cross-tenant data access under any circumstances.

### 3.2 Least Privilege

**MUST**: Each component operates with minimum required permissions.

**MUST**: BFF service account has ONLY the permissions needed to call authorized Core endpoints.

**MUST NOT**: Grant broad or administrative privileges by default.

### 3.3 Server-Only Core Tokens

**MUST**: Core user-scoped JWT tokens are used ONLY on server-side (BFF).

**MUST NOT**: Assume existence of Core-issued service tokens (not available in Core Contract v1).

**MUST NOT**: Core tokens ever reach UI, client-side code, browser storage, or mobile app storage.

**MUST NOT**: Forward UI tokens to Core.

### 3.4 No Secrets in Logs

**MUST**: Logs MUST NOT contain tokens, passwords, API keys, PII, or sensitive business data.

**MUST**: Use correlation IDs for request tracing without exposing sensitive context.

### 3.5 Fail-Closed by Default

**MUST**: On any authorization uncertainty, deny access.

**MUST**: On any tenant mapping ambiguity, deny access.

**MUST**: Return safe, non-revealing error messages to clients.

---

## 4) Controls (Minimum Required)

### 4.1 Authentication & Authorization Model (High-Level)

**Suite UI Authentication**:

- Suite issues its own UI tokens (e.g., JWT) for authenticated users
- UI tokens are scoped to Suite resources only
- UI tokens MUST NOT be accepted by Core

**Suite BFF Authorization**:

- BFF validates UI tokens on every request
- BFF enforces organizationId scoping on all Suite DB operations
- BFF forwards the authenticated user-scoped JWT to Core (server-side only)

**Core Integration Authentication (Core v1 Reality)**:

- Core v1 supports **User-Scoped JWT authentication ONLY**
- Service-to-service authentication is NOT AVAILABLE in Core v1
- No Core-issued service tokens exist in Core Contract v1
- No OAuth2 client-credentials flow
- No refresh token mechanism provided by Core v1

**BFF → Core Authentication Model**:

- BFF forwards the **user-scoped JWT** to Core using:
  `Authorization: Bearer <jwt-token>`
- JWT must contain claim: `organizationId`
- JWT forwarding occurs SERVER-SIDE only
- Browser/UI MUST NEVER see or store Core JWT
- Core JWT MUST NEVER be logged or persisted

### 4.2 Token Handling Rules

**UI Tokens**:

- Issued by Suite authentication service
- Storage requirements (STRICT):
  - **Web**: MUST use httpOnly cookies for Suite UI session tokens
  - **Mobile**: MUST use OS secure storage (iOS Keychain, Android Keystore)
  - **FORBIDDEN**: Using localStorage or sessionStorage for authentication tokens is FORBIDDEN
  - Any exception requires explicit written approval under governance change control; unapproved exceptions = STOP
- Short-lived (TODO: define TTL, e.g., 15 minutes)
- Refreshed via secure refresh token flow (TODO: define refresh token storage and rotation)

**Core Authentication Tokens (Core v1)**:

- Core v1 does NOT issue service tokens
- Core authentication relies on user-scoped JWT only
- BFF must forward user-scoped JWT to Core
- No token minting or refresh mechanism exists in Core v1
**MUST NOT**:

- Store Core tokens in UI
- Forward UI tokens to Core
- Log any token value
- Include tokens in URLs or query parameters

### 4.3 Input Validation & Output Shaping

**Input Validation**:

- All BFF endpoints MUST validate inputs against expected schema (type, length, format)
- Use allowlist validation where possible (reject unknown fields)
- Sanitize inputs before passing to Suite DB or Core APIs
- Reject malformed or suspicious inputs with safe error messages

**Output Shaping**:

- BFF MUST shape responses to expose only necessary data to UI
- Do not expose raw Core responses to UI (transform/filter as needed)
- Do not expose internal error details, stack traces, or DB schema information to clients

### 4.4 Rate Limiting & Anti-Abuse

**MUST**: Implement rate limiting on BFF endpoints to prevent abuse.

**TODO**: Define specific rate limits per endpoint category (e.g., 100 req/min for read, 10 req/min for write).

**MUST**: Implement account lockout or CAPTCHA on authentication endpoints after repeated failures.

**MUST**: Log and alert on suspicious patterns (e.g., rapid failed login attempts, unusual request volumes).

### 4.5 Secrets Management

**Principles**:

- All secrets (DB credentials, API keys) MUST be stored in environment variables...
- Secrets MUST NOT be hardcoded in source code
- Secrets MUST NOT be committed to version control
- Secrets MUST be rotated periodically (TODO: define rotation schedule)

**TODO**: Select secret management tool (e.g., environment variables, cloud secret manager, vault) based on deployment environment.

### 4.6 Data Protection

**Encryption in Transit**:

- All communication between UI ↔ BFF MUST use TLS 1.2 or higher
- All communication between BFF ↔ Core MUST use TLS 1.2 or higher

**Encryption at Rest**:

- Suite DB MUST encrypt sensitive data at rest (TODO: define which fields require encryption, e.g., PII)
- Encryption keys MUST be managed securely (TODO: define key management strategy)

**Backups**:

- Suite DB backups MUST be encrypted
- Backups MUST be stored securely with access controls
- Backup retention policy MUST be defined (TODO: define retention period)

**Data Classification**:

- Suite MUST classify data as: Public, Internal, Confidential, Restricted
- Confidential and Restricted data MUST have additional access controls and encryption

### 4.7 Logging & Audit

**MUST Log**:

- Authentication events (login, logout, token refresh)
- Authorization failures
- Tenant context for every request (organizationId)
- Correlation IDs for request tracing
- BFF → Core API calls (endpoint, status, duration)
- Security-relevant events (rate limit exceeded, suspicious activity)

**MUST NOT Log**:

- Tokens (UI or Core)
- Passwords or credentials
- PII unless explicitly required and approved
- Sensitive business data (e.g., financial records, health data)

**Correlation IDs**:

- Every request MUST have a unique correlation ID
- Correlation ID MUST be propagated from UI → BFF → Core
- Correlation ID MUST be included in all log entries for that request

---

## 5) Secure Defaults & Failure Modes

### 5.1 Deny by Default

- Authorization checks default to DENY unless explicitly granted
- Tenant scoping defaults to DENY if organizationId is missing or ambiguous
- Unknown endpoints return 404, not 403 (to avoid information disclosure)

### 5.2 Bounded Retries

- BFF → Core API calls MUST use bounded retries (e.g., max 3 retries with exponential backoff)
- Retries MUST respect idempotency (do not retry non-idempotent operations without safeguards)
- Circuit breaker pattern SHOULD be used to prevent cascading failures (TODO: define circuit breaker thresholds)

### 5.3 Safe Error Messages

- Client-facing errors MUST NOT reveal internal implementation details
- Use generic error messages (e.g., "Access denied", "Invalid request") for security failures
- Log detailed error information server-side with correlation ID for debugging

---

## 6) Minimum Verification Requirements (Docs-Level)

Before releasing any module, the following MUST exist and pass:

### 6.1 Unit Tests

- Test tenant isolation logic (verify organizationId scoping)
- Test input validation (reject invalid inputs)
- Test authorization checks (deny unauthorized access)

### 6.2 Integration Tests

- Test BFF → Core integration with valid and invalid tokens
- Test tenant mapping resolution (valid, missing, ambiguous cases)
- Test error handling and safe error messages

### 6.3 Security Tests

- Test for IDOR vulnerabilities (attempt to access other tenant's data)
- Test for injection vulnerabilities (SQL, NoSQL, command injection)
- Test rate limiting enforcement
- Test token handling (verify Core tokens never reach UI)
- Test fail-closed behavior (missing organizationId, invalid token, etc.)

**TODO**: Define specific security testing tools and frequency (e.g., SAST, DAST, penetration testing).

---

## 7) Stop Rules

Execution MUST STOP IMMEDIATELY if any of the following occurs:

- Core service token found in UI code, browser storage, or client-side logs
- UI token forwarded to Core
- Suite DB query executed without organizationId scoping
- Tenant mapping ambiguity handled with fail-open behavior
- Secrets hardcoded in source code or committed to version control
- TLS disabled or downgraded for any communication
- PII or tokens logged in application logs
- Authorization check bypassed or defaulted to ALLOW
- Security test failures ignored or deferred

**Action on STOP**: Halt all work, document the violation, escalate to Governance Authority.

---

## 8) Change Control

### 8.1 Required Approvals

Changes to this security baseline require:

- Written justification explaining security impact
- Explicit approval from Governance Authority
- Security review (if weakening controls)
- Version increment and git tag

### 8.2 Forbidden Changes

The following changes are FORBIDDEN without escalation:

- Weakening tenant isolation controls
- Allowing Core tokens in UI
- Allowing UI → Core direct calls
- Removing fail-closed defaults
- Disabling logging of security events
- Reducing encryption requirements

---

## 9) Acceptance Criteria

This security baseline is considered ACTIVE and BINDING when ALL of the following are true:

- [ ] All security invariants are documented and enforceable
- [ ] Token handling rules are explicit and prohibit Core tokens in UI
- [ ] Tenant isolation controls are defined and fail-closed
- [ ] Input validation and output shaping requirements are specified
- [ ] Rate limiting and anti-abuse controls are defined (even if TODO for specific thresholds)
- [ ] Secrets management principles are documented
- [ ] Data protection requirements (encryption, backups, classification) are defined
- [ ] Logging and audit requirements are specified with explicit exclusions (no tokens, no PII)
- [ ] Minimum verification requirements (unit, integration, security tests) are documented
- [ ] Stop rules are explicit and enforceable
- [ ] Change control process is documented
- [ ] No contradictions exist with EXECUTION_AUTHORITY.md or ARCHITECTURAL_LAWS.md
- [ ] Governance Authority has reviewed and approved this document

---

## 10) TODO Appendix

The following items require further definition before implementation:

1. **UI Token TTL**: Define exact time-to-live for UI tokens (e.g., 15 minutes)
2. **Refresh Token Policy**: Define refresh token storage, rotation, and expiry
4. **Rate Limits**: Define specific rate limits per endpoint category
5. **Secret Management Tool**: Select tool based on deployment environment
6. **Data Encryption Scope**: Define which Suite DB fields require encryption at rest
7. **Key Management Strategy**: Define how encryption keys are generated, stored, and rotated
8. **Backup Retention Policy**: Define backup retention period (e.g., 30 days)
9. **Circuit Breaker Thresholds**: Define failure thresholds and recovery timeouts
10. **Security Testing Tools**: Define SAST, DAST, and penetration testing tools and frequency

---

## 11) Signature

**Approved By**: Governance Authority  
**Date**: 2026-01-26  
**Status**: FINAL — BINDING SECURITY REQUIREMENTS
