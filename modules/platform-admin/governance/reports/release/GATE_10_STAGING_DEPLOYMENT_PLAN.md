# Gate 10 — Staging Deployment Plan

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Gate           | Gate 10 — Staging Deployment Plan       |
| Module         | platform-admin                          |
| Status         | DRAFT (DOCS-ONLY)                       |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (LDE Executor)     |
| Date           | 2026-02-08                              |

---

## 1) Environment Separation

**STRICT SEPARATION REQUIRED**

| Component    | Staging (Internal Only)                                  | Production (Future Gate)        |
| :----------- | :------------------------------------------------------- | :------------------------------ |
| **Domain**   | Cloudflare Free ephemeral domain (trycloudflare.com)       | Production Domain (Separate)    |
| **Runtime**  | Railway (Staging)                                        | Hetzner Cloud (Production)      |
| **Database** | Railway Postgres (Staging)                               | Hetzner Managed DB (Production) |
| **Secrets**  | `STAGING_*` Env Vars                                     | `PROD_*` Env Vars               |
| **Data**     | Test/Dummy Data Only                                     | Real Customer Data              |

**Stop Rule**: Never reuse Staging secrets or DB for Production.

---

## 2) Runtime Contract

### 2.1 Required Environment Variables

The following variables MUST be injected at runtime (no values committed):

- `NODE_ENV` (Set to `staging`)
- `PORT` (Railway dynamic port)
- `DATABASE_URL` (Railway Postgres connection string)
- `JWT_SECRET` (NOT AVAILABLE no Suite Auth implemented)
- `CORE_API_URL` (NOT AVAILABLE no Core runtime calls in staging)

**NOT AVAILABLE**:
- `JWT_SECRET` — no Suite Auth implemented yet
- `CORE_API_URL` — no Core runtime calls in staging
- `CORE_SERVICE_TOKEN` — Core v1 does not support service-to-service auth
  Ref: CORE_V1_INTEGRATION_LOCK.md

### 2.2 Commands

- **Build Command**: NOT AVAILABLE (No `build` script in `package.json`. `npx tsc --noEmit` checks types only.)
- **Start Command**: NOT AVAILABLE (No `start` script in `package.json`.)

> [!IMPORTANT]
> A valid build/start script is a prerequisite for Gate 11 (Infrastructure).

### 2.3 Health/Readiness

- **Endpoints**: NOT AVAILABLE (No health check endpoint implemented in `platform-admin`)
- **Probe**: TCP check on `PORT` only.

---

## 3) Cloudflare Free Setup (Plan)

**Purpose**: DNS management and TLS termination for Staging.

1. **Domain**: Use Cloudflare Free ephemeral domain (trycloudflare.com) for internal staging only.
   **Custom domain**: NOT AVAILABLE (future gate).
2. **DNS Records**: NOT AVAILABLE for ephemeral trycloudflare domains (custom DNS requires owned domain).
3. **TLS Mode**: Full (Strict). Encrypts between Cloudflare and Railway.
4. **Firewall Rules**:
   - Generic "Bot Fight Mode" enabled.
   - (Future) IP Restriction to VPN/Office IP.

**Security Stop**:

- Do NOT store any application secrets in Cloudflare Workers or Page Rules (this is a passthrough proxy).
- Do NOT cache API responses containing PII or tokens.

---

## 4) Railway Staging Steps (Plan)

**Purpose**: Ephemeral staging runtime.

1. **Project Creation**: Create "Suite Staging" project.
2. **Service**: "platform-admin" (Node.js).
3. **Database**: Add PostgreSQL plugin to project.
4. **Environment Variables**:
   - Inject `DATABASE_URL` from Postgres plugin.
   - Set `NODE_ENV=staging`.
5. **Deployment**:
   - Trigger via Git push (future CI/CD gate).
   - Verify build success (requires passing `tsc`).

**Observability**:

- **Logging**: Console logs captured by Railway.
- **Requirement**: Must not log PII/Tokens (Ref: `SECURITY_BASELINE.md` Section 4.7).

---

## 5) Security Controls & Stop Conditions

| Risk                | Stop Condition                      | Mitigation                                               |
| :------------------ | :---------------------------------- | :------------------------------------------------------- |
| **Secrets Leakage** | Secret in logs/UI                   | `SECURITY_BASELINE.md` Scan + Log Redaction              |
| **Core Token Leak** | Core token in UI                    | `MODULE_SECURITY_LAWS.md` Law 3.5 (No Core tokens in UI) |
| **Tenant Boundary** | Cross-tenant access                 | Fail-closed `DenyAllGuard` (Gate 4.5)                    |
| **Open Access**     | Publicly accessible write endpoints | All routes guarded with `DenyAllGuard` (Fail-Closed)     |

**Fail-Closed Expectation**:

- Any unhandled exception must crash the process or return 500, not expose stack trace.
- Any undefined route returns 404.

---

## 6) Migration Plan to Hetzner (Production Future)

**Strategy**: "Start Empty" (Preferred).

### 6.1 Cutover Plan

1. **Provision**: VM (Ubuntu), Firewall (UFW), Managed DB on Hetzner.
2. **Config**: Replicate `production.env` (separate secrets).
3. **Deploy**: Deploy tagged release artifact (matches Staging).
4. **DNS**: Point Production Domain `A` record to Hetzner IP.
5. **Verify**: Smoke test health endpoint (future).

### 6.2 Data Strategy

- **Initial**: Production starts with empty DB (Schema migration only).
- **No Data Migration**: Staging data is test data and MUST NOT be migrated to Production.

### 6.3 Rollback

- Revert DNS to maintenance page.
- Fix issues in Staging.
- Re-deploy fixed tag.

---

## 7) Verification Checklist (Gate 10)

**Must be verified before Staging Deploy**:

- [ ] **Governance**: Gate 9 Release Report says "GO".
- [ ] **Tests**: Gate 8.4 Remediation passed (22/22 tests).
- [ ] **No Secrets**: `git grep` confirms no encoded secrets in repo.
- [ ] **Environment**: Staging `DATABASE_URL` is distinct from Production.
- [ ] **Core Contract**: No dependency on non-existent Core v1 features (Template Publish).

---
