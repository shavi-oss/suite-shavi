# Stage 6 — Runtime Enablement Strategy

## Platform Admin Module

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Document Title | STAGE_6_RUNTIME_STRATEGY                |
| Stage          | 6 — Runtime Enablement                  |
| Repo           | Suite (Layer / Product Repo)            |
| Module         | platform-admin                          |
| Status         | FINAL — STRATEGY                        |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-02-12                              |
| Baseline       | Gate 54A (V2)                           |

---

## 1) System Runtime Maturity Classification

### Current State: **GOVERNANCE-COMPLETE, RUNTIME-INCOMPLETE**

**Governance Maturity**: ✅ COMPLETE

- All governance artifacts in place
- Tests passing (26/26 suites, 221/221 tests)
- Fail-closed architecture active
- Security baseline established
- Release qualification matrix complete

**Runtime Maturity**: ⚠️ INCOMPLETE

- JWT-to-user adapter not wired
- Runtime cookie parser not wired
- RBAC depends on `request.user` (not populated)
- CoreClient env-gated (not production-ready)
- UI partially connected (proxy mode only)

**Classification**: **DEV-READY, NOT PRODUCTION-READY**

---

## 2) Governance vs Runtime vs Production Separation

### 2.1 Governance Phase (COMPLETE)

**Objective**: Establish architectural laws, security baseline, fail-closed enforcement

**Artifacts**:

- Architectural laws
- Security baseline
- Module scope lock
- Core integration contract
- Evidence locks
- Release qualification matrix

**Status**: ✅ COMPLETE (Gates 1-54A)

---

### 2.2 Runtime Phase (CURRENT)

**Objective**: Enable runtime execution without weakening governance

**Requirements**:

- Wire JWT-to-user adapter (requires proven JWT claims)
- Wire runtime cookie parser (requires dependency verification)
- Populate `request.user` for RBAC (requires proven user structure)
- Enable CoreClient for production
- Sync UI with runtime

**Status**: ⚠️ IN PROGRESS (Stage 6)

**Blockers**: JWT claim structure not proven, RBAC role mapping not proven

---

### 2.3 Production Phase (FUTURE)

**Objective**: Deploy to production with full observability and fail-closed guarantees

**Requirements**:

- Production environment configuration
- Observability (logging, monitoring, alerting)
- Deployment automation
- Rollback procedures
- Incident response

**Status**: 🔒 BLOCKED (requires Runtime Phase completion)

---

## 3) Risk Matrix

### Priority 1 (P1) — Critical Security Risk

**Gates**:

- **Gate 6B**: Auth Context Wiring
- **Gate 6C**: RBAC Activation
- **Gate 6D**: Core Integration Hardening

**Risk**: Authentication/authorization bypass, token leakage, tenant isolation violation

**Mitigation**: Strict fail-closed enforcement, explicit verification tests, no implicit wiring

---

### Priority 2 (P2) — Operational Risk

**Gates**:

- **Gate 6A**: Dev Runtime Enablement
- **Gate 6E**: UI Runtime Sync

**Risk**: Runtime failures, UI/backend mismatch, dev/prod parity issues

**Mitigation**: Env gating, proxy validation, safe rollout sequencing

---

### Priority 3 (P3) — Documentation Risk

**Gates**: None in Stage 6

**Risk**: Governance drift, stale documentation

**Mitigation**: Continuous governance updates, drift resolution logs

---

## 4) Fail-Closed Preservation Doctrine

### 4.1 Immutable Principles

**MUST PRESERVE**:

- Global `DenyAllGuard` as default
- Explicit opt-in via `ExplicitAllowGuard` (4 usages only)
- No implicit authentication
- No magic injection
- No auth assumptions
- No route expansion without gate approval

**MUST FORBID**:

- Disabling `DenyAllGuard`
- Implicit route accessibility
- Test modification to hide drift
- Runtime surface expansion without governance
- Dev mode leaking into production

---

### 4.2 Verification Requirements

**Every runtime change MUST**:

- Pass all existing tests (26/26 suites)
- Add new verification tests (no modification of existing tests)
- Preserve fail-closed semantics
- Document risk classification
- Define rollback strategy

---

## 5) Dev Runtime Enablement Philosophy

### 5.1 Principle: Env-Gated Activation

**Approach**: Runtime features enabled via environment variables, not code changes

**Example**:

- `CORE_API_BASE_URL=<url>` → Enable CoreClient
- `DATABASE_URL=<url>` → Enable Prisma
- `SESSION_SECRET=<secret>` → Enable session signing

**Rationale**: Fail-closed by default, explicit opt-in for dev/staging, production requires explicit configuration

---

### 5.2 Principle: No Implicit Wiring

**Forbidden**:

- Auto-discovery of auth middleware
- Magic injection of `request.user`
- Implicit session validation

**Required**:

- Explicit guard chain ordering
- Explicit JWT extraction
- Explicit session validation

---

## 6) Production Isolation Model

### 6.1 Env Separation

**Dev**: `NODE_ENV=development`

- Cookie parser enabled (if dependency exists)
- JWT adapter enabled (if claims proven)
- CoreClient enabled
- Verbose logging

**Staging**: `NODE_ENV=staging`

- Cookie parser enabled (if dependency exists)
- JWT adapter enabled (if claims proven)
- CoreClient enabled
- Moderate logging

**Production**: `NODE_ENV=production`

- Cookie parser enabled (strict, if dependency exists)
- JWT adapter enabled (strict, if claims proven)
- CoreClient enabled (strict)
- Minimal logging (no secrets)

---

### 6.2 Feature Flags

**Not Used**: Feature flags introduce complexity and drift risk

**Alternative**: Env-gated activation with fail-closed defaults

---

## 7) Auth Context Lifecycle Strategy

### 7.1 Request Flow (Conceptual)

```
1. Request arrives
2. Cookie parser extracts session cookie (if wired)
3. SessionGuard validates session
4. JWT adapter extracts JWT from session (if wired)
5. JWT adapter populates request.user (if claims proven)
6. RbacGuard validates permissions (if wired)
7. Controller executes
```

**Note**: Steps 2, 4, 5, 6 require execution gates with proven dependencies/claims

---

### 7.2 Fail-Closed Points

**Point 1**: No session cookie → 401

**Point 2**: Invalid/expired session → 401

**Point 3**: No JWT in session → 401

**Point 4**: JWT extraction fails → 401

**Point 5**: RBAC validation fails → 403

---

## 8) RBAC Activation Sequence

### 8.1 Prerequisites

- `request.user` populated (Gate 6B) — **REQUIRES PROVEN JWT CLAIMS**
- Permission map defined — **REQUIRES PROVEN ROLE STRUCTURE**
- Role-to-permission mapping established — **REQUIRES CORE CONTRACT PROOF**

---

### 8.2 Activation Steps

1. Prove JWT claim structure from Core contract or existing evidence
2. Prove role structure from Core contract or existing evidence
3. Define permission map based on proven roles
4. Wire `RbacGuard` to protected routes
5. Add verification tests
6. Verify fail-closed on unauthorized

**Blocker**: Cannot execute until JWT claims and roles are proven

---

## 9) Core Integration Hardening Philosophy

### 9.1 Correlation ID Enforcement

**Required**: Every Core API call MUST include correlation ID

**Fail-Closed**: Missing/empty correlation ID → Error

**Verification**: Existing tests in Gate 51B

---

### 9.2 JWT Forwarding Boundaries

**Server-Side Only**: Core JWT stored in-memory, never client-side

**Bearer Token**: JWT forwarded as `Authorization: Bearer <jwt>`

**No Logging**: JWT never logged

**Verification**: Existing tests in Gates 50B, 51A, 51B

---

### 9.3 Env Gating Strictness

**Required**: `CORE_API_BASE_URL` must be set

**Fail-Closed**: Missing env var → Error on startup

**No Defaults**: No default Core API URL

---

## 10) UI ↔ Runtime Sync Constraints

### 10.1 Organizations-Only Activation First

**Scope**: Organizations module only

**Forbidden**: Users, Roles, Audit (deferred)

**Rationale**: Minimize risk, validate runtime before expansion

---

### 10.2 Proxy Validation Model

**Requirement**: Proxy config must match current Vite config in repo

**Verification**: Manual review of `modules/platform-admin/client/**` config

**No Assumptions**: Do not assume proxy targets without evidence

---

### 10.3 UI Error Semantics Alignment

**401**: Session invalid/expired → Redirect to login

**403**: Unauthorized → Show "Access Denied" message

**500**: Server error → Show "Something went wrong" message

**Verification**: UI error handling tests

---

## 11) Security Invariants Reinforcement Plan

### 11.1 Tenant Isolation

**Enforced**: `organizationId` in all requests

**Validation**: Core validates tenant context

**Fail-Closed**: Missing/invalid tenant → 403

---

### 11.2 Least Privilege

**Enforced**: RBAC via `RbacGuard` (when wired)

**Roles**: Defined in Core (requires proof)

**Fail-Closed**: Unauthorized role → 403

---

### 11.3 Server-Only Core Tokens

**Enforced**: Core JWT stored server-side only

**Forbidden**: JWT in client-side storage

---

### 11.4 No Secrets in Logs

**Enforced**: JWT, session ID never logged

**Validation**: Code review + test coverage

---

## 12) No-Regression Guarantee Model

### 12.1 Test Preservation

**Forbidden**: Modify existing tests to hide drift

**Required**: Add new tests for new functionality

**Verification**: Test count must increase or stay same, never decrease

---

### 12.2 Controller Count Lock

**Frozen**: EXACTLY 6 controllers

**Verification**: `build.spec.ts` enforces strict allowlist

---

### 12.3 ExplicitAllowGuard Lock

**Frozen**: EXACTLY 4 usages (Health + Auth only)

**Verification**: `fail-closed.spec.ts` enforces strict allowlist

---

## 13) Stage 6 Gate Sequence

### Gate 6A: Dev Runtime Enablement

**Risk**: P2 (Operational)

**Objective**: Enable cookie parser (if dependency exists), CoreClient env validation

**Scope**: Minimal runtime wiring, env-gated

**Blocker**: Cookie parser dependency must be verified before execution

---

### Gate 6B: Auth Context Wiring

**Risk**: P1 (Critical Security)

**Objective**: Populate `request.user` from JWT

**Scope**: JWT extraction, user object construction

**Blocker**: JWT claim structure must be proven before execution

---

### Gate 6C: RBAC Activation

**Risk**: P1 (Critical Security)

**Objective**: Enable permission-based access control

**Scope**: `RbacGuard` wiring, permission map enforcement

**Blocker**: Role structure must be proven before execution

---

### Gate 6D: Core Integration Hardening

**Risk**: P1 (Critical Security)

**Objective**: Enforce correlation ID, JWT forwarding, env gating

**Scope**: CoreClient hardening, audit invariants

---

### Gate 6E: UI Runtime Sync

**Risk**: P2 (Operational)

**Objective**: Sync UI with runtime (Organizations only)

**Scope**: Proxy validation, error semantics alignment

**Blocker**: Proxy config must be verified before execution

---

## 14) Detected Conflicts (Must Resolve Before Execution Gates)

### Conflict 1: JWT Claim Structure Unknown

**Issue**: Gates 6B and 6C assume JWT contains `organizationId`, `roles`, but this is not proven by Core contract or existing evidence

**Resolution Required**: Prove JWT claim structure from Core contract extract or existing implementation evidence before executing Gates 6B/6C

---

### Conflict 2: RBAC Role Names Unknown

**Issue**: Gate 6C assumes roles like `admin`, `manager`, `viewer`, but these are not proven

**Resolution Required**: Prove role names from Core contract or existing evidence before executing Gate 6C

---

### Conflict 3: Cookie Parser Dependency Unknown

**Issue**: Gate 6A assumes `cookie-parser` can be wired, but dependency existence not verified

**Resolution Required**: Verify `cookie-parser` exists in `package.json` before executing Gate 6A

---

## 15) Governance Authorities Referenced

This strategy is derived from:

- `ARCHITECTURAL_LAWS.md`
- `SECURITY_BASELINE.md`
- `modules/platform-admin/governance/PRODUCTION_READINESS_BASELINE_V2.md`
- `modules/platform-admin/governance/ARCHITECTURAL_BASELINE_SNAPSHOT_V2.md`
- `modules/platform-admin/governance/RELEASE_QUALIFICATION_MATRIX_V2.md`
- `modules/platform-admin/governance/MODULE_SCOPE_LOCK.md`
- `modules/platform-admin/governance/suite-constitution/SECURITY_STOP_CONDITIONS.md`

---

## 16) Signature

**Approved By**: Governance Authority  
**Date**: 2026-02-12  
**Status**: FINAL — STRATEGY  
**Stage**: 6 — Runtime Enablement
