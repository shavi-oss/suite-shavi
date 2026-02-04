# Gate 5.3A — Draft Authorization (Core Contract Lock)

## Document Control

| Attribute      | Value                            |
| -------------- | -------------------------------- |
| Module Name    | platform-admin                   |
| Gate Name      | Gate 5.3A — Core Contract Lock   |
| Document Title | GATE_5_3A_DRAFT_AUTHORIZATION    |
| Repo           | Suite (Layer / Product Repo)     |
| Status         | DRAFT — AUTHORIZATION REQUIRED   |
| Execution Mode | DOCS-ONLY · STRICT · FAIL-CLOSED |
| Authority      | Governance Authority (Layer)     |
| Effective Date | 2026-01-31                       |

---

## 1) Purpose

**Why This Mini-Gate Exists**:

Gate 5.3 (Template Publishing) cannot execute without a locked Core integration contract. Section 12 of `INTEGRATION_CONTRACT_CORE.md` contains TODOs for Core endpoints, authentication flow, tenant context propagation, and retry policy. These TODOs represent unresolved ambiguities that violate the fail-closed principle and block implementation.

Gate 5.3A exists to resolve these TODOs by locking the Core integration contract details in governance documents ONLY, without writing any code.

**Why Gate 5.3 Execution Is Blocked Without It**:

- ARCHITECTURAL_LAWS.md LAW-3 forbids UI → Core direct calls; BFF must mediate
- INTEGRATION_CONTRACT_CORE.md Section 12 has TODOs for Core endpoints, auth headers, tenant context, retry policy
- MODULE_INTEGRATION_PLAN.md references Core template publish endpoint but lacks binding specification
- Without locked contract details, any implementation would be speculative and violate governance-first execution

**Explicit Statement**: This gate is DOCS-ONLY. No code, tests, configs, or Core API calls are allowed. All changes are confined to governance documentation.

---

## 2) Allowed Scope (ABSOLUTE)

**Allowed Files** (documentation only):

- `INTEGRATION_CONTRACT_CORE.md` (Section 12 TODOs resolution)
- `modules/platform-admin/governance/MODULE_INTEGRATION_PLAN.md` (Core endpoint binding)
- `modules/platform-admin/governance/_planning/GATE_5_3_RISKS.md` (planning alignment; no code)

**Allowed Changes**:

Allowed Changes (Docs-Only, Gate 5.3A):
- Remove residual Core v2 assumptions (service tokens, refresh, invented publish endpoints)
- Lock Core v1 integration semantics: **User-scoped JWT only**, forwarded as `Authorization: Bearer <jwt-token>`
- Mark Template Publish as **DEFERRED / NOT AVAILABLE in Core v1**
- Fix spec drift and contract wording drift only
- Remove all TODOs from Section 12 of `INTEGRATION_CONTRACT_CORE.md`

**Allowed Actions**:

- Documentation edits only
- Governance review and approval
- Evidence document creation (after execution)

---

## 3) Forbidden Scope (ABSOLUTE)

**Forbidden Files**:

- Any `src/**` or `tests/**` files
- Any Prisma schema or migrations
- Any `package.json` or `package-lock.json`
- Any CI/CD configs (`.github/**`, pipelines)
- Any controllers, services, DTOs, or HTTP routes

**Forbidden Actions**:

- Writing code or tests
- Making Core API calls
- Creating Core API client stubs
- Modifying Jest config
- Installing dependencies
- Making assumptions about Core implementation details
- Using placeholders or "TBD" values in contract definitions

**Forbidden Patterns**:

- Speculative endpoint definitions (must be based on Core documentation or confirmed API contract)
- Hardcoded secrets or tokens in docs
- Ambiguous retry logic (must be deterministic)
- Undefined error handling (must specify all failure modes)

---

## 4) Objectives (What MUST Be Locked in This Gate)

### 4.1) Core Template Publish Endpoint

**Required Definitions**:

- Endpoint URL pattern (to be defined in INTEGRATION_CONTRACT_CORE.md)
- HTTP method (to be defined in INTEGRATION_CONTRACT_CORE.md)
- Request schema (JSON structure, required fields, validation rules)
- Response schema (success response, error response formats)
- HTTP status codes (success and error codes to be enumerated)

### 4.2) Authentication & Authorization

**Required Definitions**:

- Core service token header name (to be defined in INTEGRATION_CONTRACT_CORE.md)
- Token format (to be defined in INTEGRATION_CONTRACT_CORE.md)
- Token lifecycle (rotation policy, expiration, revocation)
- Server-only enforcement (never in UI, logs, or errors)
- Authorization model (service-to-service, no user context)

### 4.3) Tenant Context Propagation

**Required Definitions**:

- Suite organizationId → Core organizationId mapping mechanism
- Tenant context header name (to be defined in INTEGRATION_CONTRACT_CORE.md)
- Header format (to be defined in INTEGRATION_CONTRACT_CORE.md)
- Validation rules (required, optional, default behavior)
- Failure mode (missing tenant context = deny request)

### 4.4) Retry & Idempotency Semantics

**Required Definitions**:

- Max retry attempts (e.g., 3)
- Backoff strategy (exponential, linear, fixed)
- Retry-eligible status codes (e.g., 429, 500, 502, 503, 504)
- Non-retryable status codes (e.g., 400, 401, 403, 404)
- Idempotency key header (if required by Core)
- Idempotency key format and generation rules
- Duplicate request handling (Core guarantees, Suite enforcement)

### 4.5) Timeouts

**Required Definitions**:

- Read timeout (e.g., 5000ms for template publish)
- Write timeout (e.g., 10000ms for template publish)
- Connection timeout (e.g., 3000ms)
- Timeout failure mode (treat as retryable or non-retryable)

### 4.6) Correlation ID Propagation

**Required Definitions**:

- Correlation ID header name (to be defined in INTEGRATION_CONTRACT_CORE.md)
- Format (to be defined in INTEGRATION_CONTRACT_CORE.md)
- Generation rules (UI generates, BFF propagates)
- Logging requirements (include in all logs, errors, audit trail)
- Core propagation guarantee (Core must echo or generate if missing)

---

## 5) Entry Criteria

**Gate Baseline**:

- Gate 5.2 CLOSED and tagged (`suite-platform-admin-gate-5.2`)
- Gate 5.2.1 CLOSED and tagged (`suite-platform-admin-gate-5.2.1-hygiene`)

**Working Tree**:

- Clean working tree (except untracked docs)
- No uncommitted code changes
- No pending Prisma migrations

**Governance Laws**:

- `ARCHITECTURAL_LAWS.md` unchanged and FINAL
- `SECURITY_BASELINE.md` unchanged and FINAL
- `INTEGRATION_CONTRACT_CORE.md` exists with Section 12 TODOs
- `MODULE_INTEGRATION_PLAN.md` exists

**Verification**:

- `git status --porcelain` shows only untracked docs (if any)
- `git tag --list | Select-String "suite-platform-admin-gate-5.2"` returns both 5.2 and 5.2.1 tags

---

## 6) Exit Criteria

**Authorization Approval**:

- Governance Authority has reviewed and approved this authorization
- No unresolved questions or ambiguities in this document
- All TODOs in this authorization resolved

**Contract Completeness**:

- Section 12 of `INTEGRATION_CONTRACT_CORE.md` has ZERO TODOs
- All 6 objectives (4.1 → 4.6) are fully defined
- No placeholders, "TBD", or speculative values remain
- All definitions are deterministic and testable

**Documentation Quality**:

- All contract definitions are precise, unambiguous, and binding
- All failure modes are explicitly documented
- All security invariants are preserved (server-only tokens, fail-closed, tenant isolation)

**Gate Status**:

- Gate 5.3A marked as READY FOR EXECUTION (not executed yet)
- Evidence document template prepared (to be created after execution)

---

## 7) STOP CONDITIONS (FAIL-CLOSED)

**STOP immediately if ANY occurs**:

- Any attempt to write code (src/**, tests/**)
- Any attempt to create Core API client stubs
- Any attempt to modify Prisma schema or migrations
- Any attempt to install dependencies or modify package.json
- Any attempt to modify Jest config or CI/CD
- Any unresolved ambiguity in contract definitions (e.g., "TBD", "TODO", "placeholder")
- Any assumption about Core implementation without documented confirmation
- Any scope expansion beyond the 2 allowed files
- Any violation of ARCHITECTURAL_LAWS.md (Core black box, no UI → Core, etc.)
- Any violation of SECURITY_BASELINE.md (server-only tokens, fail-closed, etc.)

---

## 8) Verification Protocol

**Pre-Execution**:

1. Verify Gate 5.2 and 5.2.1 tags exist: `git tag --list | Select-String "suite-platform-admin-gate-5.2"`
2. Verify clean working tree: `git status --porcelain`
3. Verify governance laws unchanged: `git diff ARCHITECTURAL_LAWS.md SECURITY_BASELINE.md`

**During Execution**:

1. Edit `INTEGRATION_CONTRACT_CORE.md` Section 12 to resolve all TODOs
2. Edit `MODULE_INTEGRATION_PLAN.md` to bind Core template publish endpoint
3. Verify no code files touched: `git diff --name-only` (must show only docs)
4. Verify all TODOs removed: `Select-String -Path INTEGRATION_CONTRACT_CORE.md -Pattern "TODO"` (must return 0 results in Section 12)

**Post-Execution**:

1. Create evidence document: `modules/platform-admin/governance/GATE_5_3A_CONTRACT_EVIDENCE.md`
2. Commit changes: `git commit -m "docs(5.3A): lock Core integration contract (template publish endpoint)"`
3. Create tag: `git tag suite-platform-admin-gate-5.3A-contract`
4. Verify tag created: `git tag --list | Select-String "suite-platform-admin-gate-5.3A"`

---

## 9) Dependencies

**Upstream Dependencies**:

- Core API documentation (template publish endpoint specification)
- Core authentication mechanism (service token format, headers)
- Core tenant isolation model (organizationId mapping rules)

**Downstream Dependencies**:

- Gate 5.3 (Template Publishing implementation) is BLOCKED until Gate 5.3A completes
- Gate 5.4+ (Internal Users, Audit Logging, RBAC) may reference this contract

**Risk**:

If Core API documentation is incomplete or unavailable, this gate CANNOT proceed. In that case, escalate to Governance Authority to defer Gate 5.3 or request Core API contract from Core team.

---

## 10) Signature

**Status**: DRAFT — AUTHORIZATION REQUIRED  
**Approval Required From**: Governance Authority  
**Date**: 2026-01-31  
**Next Step**: Review and approve this authorization before execution
