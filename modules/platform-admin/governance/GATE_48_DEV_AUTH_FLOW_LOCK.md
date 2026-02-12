# Gate 48 — Dev Auth Flow Lock

## Suite UI ↔ BFF Authentication Contract

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Gate Number    | 48                                      |
| Gate Name      | Dev Auth Flow Lock                      |
| Document Title | GATE_48_DEV_AUTH_FLOW_LOCK              |
| Repo           | Suite (Layer / Product Repo)            |
| Module         | platform-admin                          |
| Status         | FINAL — BINDING AUTH CONTRACT           |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-02-12                              |

---

## 1) Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                     Suite Dev Auth Flow                       │
└──────────────────────────────────────────────────────────────┘

┌─────────────┐          ┌─────────────┐          ┌──────────┐
│             │          │             │          │          │
│  UI Client  │  HTTP    │  Suite BFF  │  HTTP    │   Core   │
│  (port 3000)│ ────────▶│ (port 4000) │ ────────▶│ (v1 API) │
│             │          │             │          │          │
└─────────────┘          └─────────────┘          └──────────┘
      │                        │                        │
      │                        │                        │
   [Future:                [Validates            [Validates
    Suite UI              Suite UI token]        Core JWT]
    Session Token]        [Forwards Core JWT]
                          [Maps Suite→Core orgId]
```

**Key Principles**:

- UI never calls Core directly (ARCHITECTURAL_LAWS.md LAW-3)
- UI never possesses Core tokens (SECURITY_BASELINE.md 3.3)
- BFF is the single integration boundary (ARCHITECTURAL_LAWS.md LAW-4)

---

## 2) Token Types & Handling

### 2.1 Suite UI Session Token (Future)

**Status**: NOT IMPLEMENTED (deferred to future gate)

**When Implemented**:

- Issued by Suite authentication service
- Scoped to Suite resources ONLY
- MUST NOT be accepted by Core
- Storage: **httpOnly cookies** (SECURITY_BASELINE.md 4.2)

**FORBIDDEN**:

- localStorage storage (SECURITY_BASELINE.md 4.2, line 136)
- sessionStorage storage (SECURITY_BASELINE.md 4.2, line 136)
- Any client-side JavaScript access to auth token

### 2.2 Core User-Scoped JWT

**Status**: AVAILABLE (Core v1)

**Handling Policy**:

- Issued by Core for user authentication
- Contains claims: `sub` (user ID), `email`, `organizationId`
- **MUST** be stored and used ONLY on BFF server-side
- **MUST NEVER** reach UI, browser storage, or client-side code
- BFF forwards to Core as `Authorization: Bearer <jwt-token>`

**Source**: INTEGRATION_CONTRACT_CORE.md Section 5.1, 12.2

---

## 3) Cookie Strategy

### 3.1 Suite UI Session Cookies (Future Implementation)

**When Implemented, MUST use**:

```typescript
// Example configuration (NOT IMPLEMENTED)
{
  httpOnly: true,      // Prevents JavaScript access
  secure: true,        // HTTPS only (prod)
  sameSite: 'strict',  // CSRF protection
  path: '/',
  domain: undefined,   // Same-origin only (dev)
  maxAge: 900000       // 15 minutes (TODO: define in SECURITY_BASELINE)
}
```

**Dev vs Prod**:

- **Dev**: `secure: false` (HTTP localhost acceptable)
- **Prod**: `secure: true` (HTTPS required, SECURITY_BASELINE.md 4.6)

### 3.2 Core JWT Storage

**MUST**: Core JWT stored ONLY in BFF server memory/environment
**MUST NOT**: Core JWT in cookies, localStorage, sessionStorage, or any UI-accessible storage

---

## 4) CSRF Strategy

### 4.1 Current State (Gate 48)

**Status**: NOT IMPLEMENTED

**Aligned with Cookie Strategy**:

- If using `sameSite: 'strict'` cookies → CSRF risk is LOW
- If using `sameSite: 'lax'` or `sameSite: 'none'` → CSRF tokens REQUIRED

### 4.2 Future Implementation Requirements

**When implementing session cookies**:

- Use `sameSite: 'strict'` for maximum protection
- OR implement CSRF token validation (double-submit cookie or synchronizer token pattern)
- Document chosen strategy in implementation gate

---

## 5) CORS Policy

### 5.1 Current Dev Configuration

**Source**: `modules/platform-admin/host/main.ts` (lines 13-16)

```typescript
app.enableCors({
  origin: ["http://localhost:3000"],
  credentials: true,
});
```

**Analysis**:

- ✅ Allows credentials (required for httpOnly cookies)
- ✅ Restricts origin to UI dev server
- ✅ Array syntax (correct)

### 5.2 Dev vs Prod

**Dev** (current):

- Origin: `http://localhost:3000`
- Credentials: `true`

**Prod** (future):

- Origin: `https://suite.example.com` (environment-specific)
- Credentials: `true`
- Secure: `true` (HTTPS only)

**Note**: Vite proxy is dev-only. Prod will NOT rely on Vite proxy.

---

## 6) Logging Policy

### 6.1 MUST Log

- Authentication events (login, logout, token refresh)
- Authorization failures (401/403)
- Correlation IDs for all requests
- Tenant context (organizationId from JWT claim)

### 6.2 MUST NOT Log

- JWT tokens (UI or Core)
- Authorization headers
- Passwords or credentials
- PII (unless explicitly required and approved)
- Sensitive business data

**Source**: SECURITY_BASELINE.md Section 4.7, INTEGRATION_CONTRACT_CORE.md Section 8.2

---

## 7) Fail-Closed Invariants

### 7.1 Authentication Failures

**MUST**: On 401/403 from Core → deny immediately, no retry
**MUST**: Return safe error to UI: "Unauthorized access. Please contact your administrator."
**MUST NOT**: Expose internal error details, stack traces, or Core responses

**Source**: `modules/platform-admin/client/src/api/platformAdmin.ts` (lines 50-53)

### 7.2 Missing/Ambiguous Tenant Mapping

**MUST**: If Suite orgId has no Core orgId mapping → deny request
**MUST**: If Core orgId is ambiguous → deny request
**MUST**: Log mapping failures with correlation ID

**Source**: INTEGRATION_CONTRACT_CORE.md Section 4.2

### 7.3 Token Validation Failures

**MUST**: On invalid/expired token → deny immediately
**MUST**: On missing token → deny immediately
**MUST NOT**: Create fallback behaviors that broaden access

**Source**: ARCHITECTURAL_LAWS.md LAW-10, SECURITY_BASELINE.md 5.1

---

## 8) NOT AVAILABLE (Core v1 Limitations)

The following are **NOT AVAILABLE** in Core v1 and MUST NOT be implemented:

- ❌ Service-to-service authentication (INTEGRATION_CONTRACT_CORE.md 5.1)
- ❌ Core service tokens (INTEGRATION_CONTRACT_CORE.md 5.1)
- ❌ OAuth2 client credentials flow (INTEGRATION_CONTRACT_CORE.md 5.1)
- ❌ Token refresh mechanism (INTEGRATION_CONTRACT_CORE.md 5.1)
- ❌ Core-issued refresh tokens (INTEGRATION_CONTRACT_CORE.md 12.2)

**Implication**: Any 401 from Core is fail-closed. No automatic token refresh exists.

---

## 9) Fail-Closed Checklist

Before implementing authentication (future gate), verify:

- [ ] UI session tokens use httpOnly cookies (no localStorage/sessionStorage)
- [ ] Core JWT never reaches UI or client-side code
- [ ] CORS origin is restricted (not `*`)
- [ ] CORS credentials enabled for cookie support
- [ ] CSRF protection aligned with cookie `sameSite` policy
- [ ] All auth failures return safe, generic errors to UI
- [ ] No tokens logged in application logs
- [ ] No PII logged without explicit approval
- [ ] Correlation IDs used for debugging (not sensitive context)
- [ ] Tenant mapping failures are fail-closed (deny access)
- [ ] No "dev bypass" or "temporary skip" auth shortcuts

---

## 10) Acceptance Criteria

This auth flow lock is considered ACTIVE and BINDING when:

- [x] Token types are explicitly defined (UI session, Core JWT)
- [x] Storage policy is explicit (httpOnly cookies, no localStorage)
- [x] Cookie strategy is defined (httpOnly, secure, sameSite)
- [x] CSRF strategy is aligned with cookie policy
- [x] CORS policy is documented (dev vs prod)
- [x] Logging policy is explicit (what to log, what NOT to log)
- [x] Fail-closed invariants are documented
- [x] NOT AVAILABLE items are explicitly listed
- [x] No contradictions with ARCHITECTURAL_LAWS, SECURITY_BASELINE, INTEGRATION_CONTRACT_CORE

---

## 11) Signature

**Approved By**: Governance Authority  
**Date**: 2026-02-12  
**Status**: FINAL — BINDING AUTH CONTRACT
