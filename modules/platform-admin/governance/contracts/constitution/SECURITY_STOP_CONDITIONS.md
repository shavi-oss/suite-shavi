# SECURITY STOP CONDITIONS — Core Contract v1

**Date:** 2026-02-01  
**Auditor:** Principal Security Architect  
**Scope:** Production safety gates  
**Status:** ✅ ACTIVE

---

## PURPOSE

This document defines **HARD STOP CONDITIONS** that, if triggered, require immediate containment and remediation before production deployment or continued operation.

**Enforcement:** FAIL-CLOSED — Any violation = immediate halt.

---

## 1) IDOR / CROSS-TENANT ACCESS

### 1.1 Condition Definition

**Trigger:** Any request can access another tenant's data by manipulating IDs.

**Detection Signals:**

- ✅ User in Org A can read/write records belonging to Org B
- ✅ Query logs show `organizationId` mismatch
- ✅ Integration test: cross-tenant read succeeds

**Evidence Required:**

- HTTP request/response showing cross-tenant access
- Database query log without `organizationId` filter
- Reproduction steps

---

### 1.2 Immediate Actions

**STOP:**

1. ❌ HALT all deployments
2. ❌ BLOCK affected endpoint(s) via feature flag
3. ❌ REVOKE all JWT tokens (force re-login)

**INVESTIGATE:**

1. ✅ Check Prisma extension logs for unfiltered queries
2. ✅ Review `TenantGuard` execution logs
3. ✅ Audit `_unsafeClient` usage

**CONTAIN:**

1. ✅ Add explicit `organizationId` filter to affected service method
2. ✅ Deploy hotfix with emergency approval
3. ✅ Notify all tenants of potential exposure

---

### 1.3 Resolution Criteria

**Required Evidence:**

- [x] Integration test: cross-tenant read FAILS with 404
- [x] Database logs show `organizationId` filter in all queries
- [x] Code review confirms Prisma extension active
- [x] Manual penetration test FAILS

**Sign-Off:** Security Architect + CTO

---

## 2) AUTH BYPASS

### 2.1 Condition Definition

**Trigger:** Any endpoint with write behavior is reachable without valid JWT.

**Detection Signals:**

- ✅ `POST`/`PATCH`/`DELETE` request succeeds without `Authorization` header
- ✅ Invalid/expired JWT token bypasses guard
- ✅ Environment variable toggles auth off

**Evidence Required:**

- HTTP request without `Authorization` header
- Response showing successful write operation
- Guard execution logs showing bypass

---

### 2.2 Immediate Actions

**STOP:**

1. ❌ HALT all deployments
2. ❌ BLOCK affected endpoint(s)
3. ❌ REVOKE all JWT tokens

**INVESTIGATE:**

1. ✅ Check `@UseGuards` decorator on controller
2. ✅ Verify `JwtAuthGuard` is registered globally or per-controller
3. ✅ Review environment variables for bypass flags

**CONTAIN:**

1. ✅ Add missing `@UseGuards(JwtAuthGuard, TenantGuard)` decorator
2. ✅ Deploy hotfix immediately
3. ✅ Audit all endpoints for guard coverage

---

### 2.3 Resolution Criteria

**Required Evidence:**

- [x] All write endpoints return `401` without JWT
- [x] Integration test: unauthenticated write FAILS
- [x] Code review confirms guards on all controllers
- [x] No environment-based bypass exists

**Sign-Off:** Security Architect + Lead Engineer

---

## 3) JOB/WEBHOOK UNSCOPED EXECUTION

### 3.1 Condition Definition

**Trigger:** Background job or webhook processes data without verified `organizationId`.

**Detection Signals:**

- ✅ Job handler does not set CLS context
- ✅ Job payload missing `organizationId`
- ✅ Webhook processes event without tenant resolution

**Evidence Required:**

- Job execution logs showing missing `orgId` in CLS
- Database query from job without `organizationId` filter
- Webhook event processed without tenant lookup

---

### 3.2 Immediate Actions

**STOP:**

1. ❌ HALT background job processors (Scheduler/Executor)
2. ❌ DISABLE webhook ingestion
3. ❌ QUARANTINE unprocessed jobs

**INVESTIGATE:**

1. ✅ Check `clsService.run()` usage in job handlers
2. ✅ Verify `organizationId` in job payload schema
3. ✅ Review webhook signature validation + tenant lookup

**CONTAIN:**

1. ✅ Add `organizationId` validation to job handler entry point
2. ✅ Fail-closed: reject jobs without `organizationId`
3. ✅ Add CLS context setting before job execution

---

### 3.3 Resolution Criteria

**Required Evidence:**

- [x] All job handlers set CLS context before DB access
- [x] Job payload schema includes `organizationId` (required)
- [x] Webhook handler resolves tenant before processing
- [x] Integration test: job without `orgId` is rejected

**Sign-Off:** Security Architect + Backend Lead

---

## 4) AUDIT LOGGING DISABLED

### 4.1 Condition Definition

**Trigger:** Security-critical operations are not logged.

**Detection Signals:**

- ✅ No logs for failed auth attempts
- ✅ No logs for cross-tenant access attempts
- ✅ No logs for `_unsafeClient` usage

**Evidence Required:**

- Missing log entries for known security events
- Logger disabled in production config
- Log retention policy not enforced

---

### 4.2 Immediate Actions

**STOP:**

1. ❌ HALT deployments until logging verified
2. ❌ ENABLE verbose security logging

**INVESTIGATE:**

1. ✅ Check `Logger` configuration in `main.ts`
2. ✅ Verify Prisma query logging enabled
3. ✅ Review log aggregation pipeline

**CONTAIN:**

1. ✅ Enable security event logging at `WARN` level minimum
2. ✅ Add structured logging for all guard failures
3. ✅ Configure log retention (30 days minimum)

---

### 4.3 Resolution Criteria

**Required Evidence:**

- [x] Failed auth attempts logged with user ID + IP
- [x] Tenant guard sanitization logged
- [x] `_unsafeClient` usage logged with justification
- [x] Logs shipped to centralized system

**Sign-Off:** Security Architect + DevOps Lead

---

## 5) SECRETS LEAKAGE

### 5.1 Condition Definition

**Trigger:** Sensitive credentials exposed in logs, responses, or errors.

**Detection Signals:**

- ✅ JWT secret in error message
- ✅ Database password in logs
- ✅ API response includes internal tokens

**Evidence Required:**

- Log entry containing secret
- HTTP response with sensitive data
- Error stack trace with credentials

---

### 5.2 Immediate Actions

**STOP:**

1. ❌ ROTATE all exposed secrets immediately
2. ❌ REVOKE all JWT tokens
3. ❌ HALT deployments

**INVESTIGATE:**

1. ✅ Search logs for secret patterns (regex)
2. ✅ Review error handling middleware
3. ✅ Audit environment variable usage

**CONTAIN:**

1. ✅ Redact secrets from all logs
2. ✅ Add secret detection to CI/CD pipeline
3. ✅ Implement secret scanning (e.g., `trufflehog`)

---

### 5.3 Resolution Criteria

**Required Evidence:**

- [x] All secrets rotated
- [x] Log scrubbing verified
- [x] Secret scanning tool integrated
- [x] No secrets in error responses

**Sign-Off:** Security Architect + CTO

---

## 6) PRISMA EXTENSION BYPASS

### 6.1 Condition Definition

**Trigger:** Database access bypasses tenant filtering extension.

**Detection Signals:**

- ✅ Query executed without `organizationId` filter
- ✅ Service uses `_unsafeClient` without justification
- ✅ Raw SQL query bypasses extension

**Evidence Required:**

- Database query log without `organizationId`
- Code using `prisma._unsafeClient` in non-auth context
- `$queryRaw` usage detected

---

### 6.2 Immediate Actions

**STOP:**

1. ❌ HALT all deployments
2. ❌ AUDIT all `_unsafeClient` usage
3. ❌ BLOCK raw SQL methods

**INVESTIGATE:**

1. ✅ Grep for `_unsafeClient` usage
2. ✅ Check Prisma extension registration in `prisma.service.ts`
3. ✅ Review service-layer DB access patterns

**CONTAIN:**

1. ✅ Remove unjustified `_unsafeClient` usage
2. ✅ Add linter rule to block `$queryRaw`
3. ✅ Enforce `prisma.client` usage only

---

### 6.3 Resolution Criteria

**Required Evidence:**

- [x] All `_unsafeClient` usage justified + documented
- [x] Prisma extension active (verified in logs)
- [x] No raw SQL queries in services
- [x] Linter enforces safe client usage

**Sign-Off:** Security Architect + Backend Lead

---

## 7) MISSING CLS CONTEXT

### 7.1 Condition Definition

**Trigger:** Database query executed without CLS context (`orgId` missing).

**Detection Signals:**

- ✅ Prisma extension throws `TENANT_ISOLATION_VIOLATION`
- ✅ Service method called outside request lifecycle
- ✅ Background job missing `clsService.run()`

**Evidence Required:**

- Error log: `No tenant context for ${model}.${operation}`
- Stack trace showing service call without CLS
- Job handler without CLS setup

---

### 7.2 Immediate Actions

**STOP:**

1. ❌ HALT affected service/job
2. ❌ REVIEW all background job handlers

**INVESTIGATE:**

1. ✅ Check `TenantGuard` execution in request lifecycle
2. ✅ Verify `clsService.run()` in job handlers
3. ✅ Review service initialization (no DB calls in constructor)

**CONTAIN:**

1. ✅ Wrap job execution in `clsService.run()`
2. ✅ Add CLS context validation at service entry points
3. ✅ Fail-closed: reject operations without CLS

---

### 7.3 Resolution Criteria

**Required Evidence:**

- [x] All HTTP requests set CLS via `TenantGuard`
- [x] All background jobs set CLS before DB access
- [x] Prisma extension enforces CLS requirement
- [x] Integration test: missing CLS = error

**Sign-Off:** Security Architect + Backend Lead

---

## 8) STOP CONDITION TESTING

### 8.1 Required Tests

**Before Production Deployment:**

1. **Cross-Tenant Read Test:**

   ```bash
   # Create record in Org A
   # Attempt read with Org B token
   # MUST return 404 (not 403, to prevent enumeration)
   ```

2. **Unauthenticated Write Test:**

   ```bash
   # POST /api/v1/workflows without Authorization header
   # MUST return 401
   ```

3. **Job Scope Test:**

   ```bash
   # Enqueue job with missing organizationId
   # MUST be rejected or DLQ'd
   ```

4. **Prisma Extension Test:**
   ```bash
   # Query without CLS context
   # MUST throw TENANT_ISOLATION_VIOLATION
   ```

---

### 8.2 Continuous Monitoring

**Production Alerts:**

- ✅ Alert on `TENANT_ISOLATION_VIOLATION` errors
- ✅ Alert on `401`/`403` spike (potential attack)
- ✅ Alert on `_unsafeClient` usage outside auth module
- ✅ Alert on missing `organizationId` in query logs

**Metrics:**

- ✅ Track auth failure rate per tenant
- ✅ Track cross-tenant access attempts (should be 0)
- ✅ Track CLS context failures

---

## 9) ESCALATION MATRIX

| Condition                  | Severity | Response Time | Escalation Path                      |
| -------------------------- | -------- | ------------- | ------------------------------------ |
| IDOR / Cross-Tenant Access | CRITICAL | Immediate     | Security Architect → CTO → All Hands |
| Auth Bypass                | CRITICAL | Immediate     | Security Architect → CTO             |
| Job Unscoped Execution     | HIGH     | 1 hour        | Backend Lead → Security Architect    |
| Audit Logging Disabled     | HIGH     | 4 hours       | DevOps Lead → Security Architect     |
| Secrets Leakage            | CRITICAL | Immediate     | Security Architect → CTO             |
| Prisma Extension Bypass    | CRITICAL | Immediate     | Backend Lead → Security Architect    |
| Missing CLS Context        | HIGH     | 1 hour        | Backend Lead                         |

---

## 10) SIGN-OFF

**Current Status:** ✅ NO STOP CONDITIONS TRIGGERED

**Audit Date:** 2026-02-01  
**Next Review:** Before each production deployment

**Approved By:**

- [ ] Security Architect: ********\_********
- [ ] Backend Lead: ********\_********
- [ ] CTO: ********\_********

---

**END OF SECURITY STOP CONDITIONS**
