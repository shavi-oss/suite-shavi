# Implementation Structure — platform-admin (Gate 3)

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Module Name    | platform-admin                          |
| Document Title | IMPLEMENTATION_STRUCTURE                |
| Repo           | Suite (Layer / Product Repo)            |
| Status         | DRAFT — GATE 3 STRUCTURE                |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-01-27                              |

---

## 1. Structure Objectives

### 1.1 What This Structure Enforces

This structure enforces the following governance objectives:

**Boundary Enforcement**:

- Physical separation between UI, BFF, and Data layers
- Isolation of Core integration within adapter boundary
- Prevention of cross-layer violations via directory structure

**Fail-Closed by Default**:

- Mandatory validation checkpoints at layer boundaries
- Explicit authorization checks before data access
- Forced audit logging via structural hooks

**Token Separation**:

- User-Scoped JWT ONLY.
- Service Tokens **NOT AVAILABLE** in Core v1.
- No Core service token handling.

**Mapping Enforcement**:

- Dedicated mapping directory for orgId resolution
- Fail-closed mapping lookup before Core interactions
- No bypass paths for mapping validation

**Audit Immutability**:

- Dedicated audit directory with append-only semantics
- No update or delete operations structurally possible
- Mandatory audit hooks at domain service boundaries

### 1.2 Why Structure is a Control Mechanism, Not Convenience

Structure serves as a **governance control**, not a code organization convenience:

**Control Mechanism**:

- Structure MUST prevent forbidden patterns (UI → Core, token leaks)
- Structure MUST enforce required patterns (fail-closed, audit, RBAC)
- Structure MUST make violations visible and difficult

**Not Convenience**:

- Structure is NOT optimized for developer ergonomics
- Structure is NOT flexible or adaptable without governance approval
- Structure is NOT subject to refactoring without authorization

**Enforcement Principle**: If a violation is structurally impossible, it cannot occur. If a requirement is structurally mandatory, it cannot be omitted.

---

## 2. Module Boundary Map

### 2.1 UI Boundary (What It Can/Cannot Do)

**Allowed**:

- Display data received from BFF
- Capture user input and send to BFF
- Maintain Suite UI authentication token (session)
- Generate user-facing error messages from BFF responses

**Forbidden**:

- Direct calls to Core API
- Access to Core service token
- Direct database access (Suite or Core)
- Business logic execution (validation, RBAC, mapping)
- Audit log writes

**Enforcement**: UI code is out of scope for Gate 3. When implemented, UI MUST NOT have import paths to adapter, repositories, or Core integration code.

### 2.2 BFF Boundary (What It Owns)

**Owned Responsibilities**:

- Suite UI token validation (authentication)
- Correlation ID generation (UUID v4 at entry point)
- RBAC enforcement (role-based authorization)
- Domain service orchestration
- Fail-closed validation coordination
- Audit log write coordination
- Error response formatting

**Forbidden**:

- Core service token exposure to UI
- Database access (must delegate to repositories)
- Direct Core API calls (must delegate to adapter)
- Bypass of RBAC or validation

**Enforcement**: BFF layer MUST delegate all data access to repositories and all Core interactions to adapter. No direct database or Core API calls allowed.

### 2.3 Adapter Boundary (Core Isolation)

**Owned Responsibilities**:

- User-Scoped JWT propagation only (No Service Tokens)
- Core API request construction (headers, body, timeout)
- Correlation ID propagation (`X-Correlation-Id` header)
- Idempotency key generation and inclusion (`Idempotency-Key` header)
- Retry logic execution (max 2 retries, network/5xx only)
- Core response parsing and error mapping

**Forbidden**:

- Token exposure to UI or BFF (token value MUST remain in adapter)
- Bypass of timeout or retry policies
- Core API calls without correlation ID
- Core API calls without mapping resolution

**Enforcement**: Adapter MUST be the ONLY code path to Core. No other layer may import Core client libraries or construct Core API requests.

### 2.4 Data Boundary (Suite DB Ownership)

**Owned Responsibilities**:

- Suite database connection management
- CRUD operations on Suite tables (organizations, mappings, users, audit logs)
- Query construction and execution
- Transaction management

**Forbidden**:

- Core database access
- Service Tokens (NOT AVAILABLE)
- Shared database access
- Direct SQL execution without repository abstraction
- Audit log updates or deletes

**Enforcement**: Repositories MUST be the ONLY code path to Suite DB. No other layer may import database client libraries or construct queries.

---

## 3. Proposed Folder Structure (NO CODE)

```
modules/platform-admin/
├── src/
│   ├── adapters/
│   │   └── core/
│   │       ├── core-integration.adapter.ts
│   │       └── core-error.mapper.ts
│   │
│   ├── domain/
│   │   ├── organizations/
│   │   │   └── organization.service.ts
│   │   ├── mappings/
│   │   │   └── mapping.service.ts
│   │   ├── users/
│   │   │   └── internal-user.service.ts
│   │   └── templates/
│   │       └── template-publish.service.ts
│   │
│   ├── repositories/
│   │   ├── organization.repository.ts
│   │   ├── mapping.repository.ts
│   │   ├── internal-user.repository.ts
│   │   └── audit.repository.ts
│   │
│   ├── audit/
│   │   ├── audit.service.ts
│   │   ├── audit-event.types.ts
│   │   └── audit-sanitizer.ts
│   │
│   ├── rbac/
│   │   ├── rbac.service.ts
│   │   ├── role.definitions.ts
│   │   └── permission.checker.ts
│   │
│   ├── mapping/
│   │   ├── mapping-resolver.service.ts
│   │   └── mapping-validator.ts
│   │
│   ├── validation/
│   │   ├── fail-closed.validator.ts
│   │   ├── input.validator.ts
│   │   └── precondition.checker.ts
│   │
│   ├── correlation/
│   │   ├── correlation.service.ts
│   │   └── correlation.middleware.ts
│   │
│   └── errors/
│       ├── error.types.ts
│       └── error.formatter.ts
│
└── tests/
    ├── unit/
    │   ├── adapters/
    │   ├── domain/
    │   ├── repositories/
    │   ├── audit/
    │   ├── rbac/
    │   ├── mapping/
    │   └── validation/
    │
    ├── integration/
    │   ├── fail-closed-scenarios/
    │   ├── core-integration/
    │   ├── audit-logging/
    │   └── rbac-enforcement/
    │
    └── security/
        ├── token-separation.spec.ts
        ├── mapping-enforcement.spec.ts
        └── audit-immutability.spec.ts
```

---

## 4. Responsibility Allocation

### 4.1 What Each Folder/Layer is Responsible For

**adapters/core/**:

- User-Scoped JWT propagation (Bearer token)
- Core API request execution (timeout, retry, idempotency)
- Correlation ID propagation to Core
- Core error mapping to Suite error types

**domain/**:

- Business capability orchestration (organization, mapping, user, template)
- Domain-level validation (business rules)
- Coordination of repositories, audit, RBAC, mapping
- Transaction boundary definition

**repositories/**:

- Suite database CRUD operations
- Query construction and execution
- Data mapping (DB ↔ domain models)
- Transaction participation

**audit/**:

- Audit log entry construction (event type, metadata, sanitization)
- Audit log write execution (via audit repository)
- Audit log query execution (with RBAC)
- Correlation ID inclusion in all entries

**rbac/**:

- Role definition and permission mapping
- Authorization check execution (user role vs. required permission)
- Fail-closed authorization (deny when role missing or insufficient)

**mapping/**:

- Suite orgId → Core orgId resolution
- Mapping validation (existence, uniqueness)
- Fail-closed mapping lookup (deny when missing or ambiguous)
- Core orgId validation via adapter

**validation/**:

- Input validation (format, type, required fields)
- Precondition validation (authentication, authorization, mapping)
- Fail-closed validation (deny when any check fails)

**correlation/**:

- Correlation ID generation (UUID v4)
- Correlation ID storage (request-scoped context)
- Correlation ID propagation (to adapter, audit, logs)

**errors/**:

- Error type definitions (domain, validation, authorization, integration)
- Error formatting for API responses
- Error sanitization (no tokens, no credentials)

### 4.2 Where Fail-Closed Checks MUST Happen

**BFF Entry Point**:

- MUST validate Suite UI token (authentication)
- MUST generate correlation ID
- MUST check RBAC (authorization)

**Domain Services**:

- MUST validate all inputs (fail-closed on invalid)
- MUST resolve mapping before Core interactions (fail-closed on missing)
- MUST write audit log (fail-closed on write failure)

**Mapping Resolver**:

- MUST deny when Suite orgId has no Core orgId
- MUST deny when mapping is ambiguous (multiple matches)
- MUST validate Core orgId exists via adapter

**Adapter**:

- MUST deny when Core API returns 4xx or 5xx
- MUST deny when Core API times out
- MUST deny when retry limit exceeded

**Audit Service**:

- MUST deny operation when audit log write fails
- MUST include correlation ID in all entries
- MUST sanitize all metadata (no tokens, no credentials)

### 4.3 Where Correlation ID is Generated and Enforced

**Generation**:

- MUST generate at BFF entry point (correlation middleware)
- MUST use UUID v4 format
- MUST store in request-scoped context

**Enforcement**:

- MUST propagate to adapter (include in Core API `X-Correlation-Id` header)
- MUST propagate to audit (include in all audit log entries)
- MUST propagate to error logs (include in all error messages)
- MUST fail-closed when correlation ID missing (deny operation)

### 4.4 Where Audit Hooks MUST Exist

**Domain Service Boundaries**:

- MUST write audit log after every write operation (success or failure)
- MUST include correlation ID, performedBy, entityType, entityId, metadata
- MUST sanitize metadata (no tokens, no credentials)

**Audit Repository**:

- MUST enforce append-only semantics (no update or delete methods)
- MUST fail-closed when write fails (throw error to rollback operation)

---

## 5. Cross-Cutting Concerns

### 5.1 Audit

**How Structure Enforces**:

- Dedicated `audit/` directory isolates audit logic
- Domain services MUST import audit service (structural dependency)
- Audit repository MUST NOT expose update or delete methods (interface-level enforcement)
- Audit service MUST be injected into all domain services (dependency injection enforcement)

**Enforcement Mechanism**: Domain services cannot compile without audit service dependency. Audit repository interface prevents update/delete at type level.

### 5.2 Correlation

**How Structure Enforces**:

- Dedicated `correlation/` directory isolates correlation logic
- Correlation middleware MUST run at BFF entry point (framework-level enforcement)
- Correlation service MUST be injected into adapter and audit (dependency injection enforcement)
- Correlation ID MUST be stored in request-scoped context (no global state)

**Enforcement Mechanism**: Adapter and audit services cannot compile without correlation service dependency. Middleware registration enforces entry-point generation.

### 5.3 RBAC

**How Structure Enforces**:

- Dedicated `rbac/` directory isolates authorization logic
- RBAC service MUST be injected into all domain services (dependency injection enforcement)
- RBAC checks MUST occur before repository or adapter calls (code review enforcement)
- Role definitions MUST be centralized (single source of truth)

**Enforcement Mechanism**: Domain services cannot compile without RBAC service dependency. Code review verifies RBAC check placement.

### 5.4 Validation

**How Structure Enforces**:

- Dedicated `validation/` directory isolates validation logic
- Fail-closed validator MUST be injected into all domain services (dependency injection enforcement)
- Input validation MUST occur before business logic (code review enforcement)
- Precondition checks MUST occur before data access (code review enforcement)

**Enforcement Mechanism**: Domain services cannot compile without validation service dependency. Code review verifies validation placement.

---

## 6. Forbidden Structure Patterns

The following structural patterns are FORBIDDEN and trigger STOP:

### 6.1 Cross-Layer Violations

**FORBIDDEN**:

- UI imports from `adapters/`, `repositories/`, or `domain/`
- Domain services import from UI layer
- Repositories import from `adapters/`
- Adapters import from `repositories/`

**STOP Trigger**: Any import statement that violates layer boundaries.

### 6.2 Token Leaks

**FORBIDDEN**:

- Attempting to use Service Tokens (feature does not exist)

**STOP Trigger**: Any reference to Core service token outside adapter directory.

### 6.3 Bypass Paths

**FORBIDDEN**:

- Direct database client imports outside `repositories/`
- Direct Core API client imports outside `adapters/core/`
- Domain services with direct database or Core API calls
- BFF with direct database or Core API calls

**STOP Trigger**: Any import of database client or Core API client outside designated directories.

### 6.4 Audit Violations

**FORBIDDEN**:

- Audit repository with update or delete methods
- Domain services without audit service dependency
- Audit log writes without correlation ID
- Audit log writes with unsanitized metadata (tokens, credentials)

**STOP Trigger**: Any audit repository method signature for update/delete, any domain service without audit dependency, any audit entry missing correlation ID.

### 6.5 Mapping Bypass

**FORBIDDEN**:

- Core API calls without mapping resolution
- Hardcoded Core orgId values
- Default or fallback Core orgId when mapping missing
- Cached mapping results without expiry

**STOP Trigger**: Any adapter call without mapping resolver dependency, any hardcoded Core orgId literal.

### 6.6 Fail-Open Patterns

**FORBIDDEN**:

- Default to ALLOW when authentication fails
- Default to ALLOW when authorization fails
- Default to ALLOW when mapping resolution fails
- Default to ALLOW when validation fails
- Proceed with operation when audit log write fails

**STOP Trigger**: Any conditional logic that proceeds with operation when precondition check fails.

### 6.7 Shared State

**FORBIDDEN**:

- Global variables for correlation ID, user context, or tokens
- Singleton services with mutable state
- Static methods that access shared state
- Thread-local storage (use request-scoped context only)

**STOP Trigger**: Any global variable, singleton with mutable state, or static method accessing shared state.

### 6.8 Scope Expansion

**FORBIDDEN**:

- Directories for workflow builder, customer users, billing, CRM
- Files implementing forbidden capabilities (see GATE_3_AUTHORIZATION.md Section 1.2)
- Tables not listed in MODULE_SCOPE_LOCK.md
- Core interactions not listed in INTEGRATION_ADAPTER_SPEC.md

**STOP Trigger**: Any directory or file implementing forbidden capability, any database table not in scope, any Core API call not in spec.

---

## 7. Signature

**Prepared By**: Principal Software Architect & Governance Authority  
**Date**: 2026-01-27  
**Status**: DRAFT — GATE 3 STRUCTURE

---

## Changelog

- **2026-02-02**: Removed residual Core v2 assumptions (core-token.service.ts file reference from proposed structure).
- **2026-02-02**: Aligned strictly to Core Contract v1 + Gate 5.3A Decision A.
