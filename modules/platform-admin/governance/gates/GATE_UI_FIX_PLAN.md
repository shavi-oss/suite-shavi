# GATE_UI_FIX_PLAN.md — suite-shavi Repository

## Document Control

| Field      | Value                                                                                            |
| ---------- | ------------------------------------------------------------------------------------------------ |
| Gate ID    | GATE-UI-FIX                                                                                      |
| Date       | 2026-02-23T13:33 UTC+2                                                                           |
| Author     | Sonit (AI Execution Agent)                                                                       |
| Status     | DRAFT — AWAITING HUMAN APPROVAL                                                                  |
| Branch     | `fix/ui-relocation` (to be created from current HEAD)                                            |
| Repository | suite-shavi (`D:\Basaan os\suite-shavi\`)                                                        |
| Authority  | ARCHITECTURAL_LAWS.md · SECURITY_BASELINE.md · INTEGRATION_CONTRACT_CORE.md · REPO_GOVERNANCE.md |

---

## 1. Objective

Complete the UI relocation fix by:

1. **Verifying** that the suite-shavi repository already contains equivalent or superior
   implementations of the components that were misplaced in BassanOs.
2. **Confirming** environment variable documentation (`VITE_ADMIN_JWT`, `VITE_CORE_API_URL`).
3. **Producing** governance artifacts documenting the verification and confirming the
   suite-shavi client is the canonical home for all admin UI.

> **Key finding from pre-read:** suite-shavi `modules/platform-admin/client/src/` already
> contains 15 components (`OrganizationList.tsx`, `OrganizationCreate.tsx`,
> `OrganizationDetail.tsx`, et al.) and a full `App.tsx` + `api/platformAdmin.ts`. The
> misplaced BassanOs files are simpler/earlier versions. **No new React code needs to be
> written.** This plan is primarily verification + governance documentation.

---

## 2. Scope Locks

### 2.1 Allowed Files (write/create only)

| Action | Path                                                                                               |
| ------ | -------------------------------------------------------------------------------------------------- |
| UPDATE | `modules/platform-admin/client/.env.example` _(if VITE_ADMIN_JWT / VITE_CORE_API_URL are missing)_ |
| CREATE | `modules/platform-admin/governance/gates/GATE_UI_FIX_EXECUTION_REPORT.md`                          |
| CREATE | `modules/platform-admin/governance/gates/GATE_UI_FIX_VERIFICATION_EVIDENCE.md`                     |
| CREATE | `modules/platform-admin/governance/gates/GATE_UI_FIX_PR_BODY.md`                                   |

> If `.env.example` does not exist at the client root, create it. If it exists, add
> missing lines only. Do NOT create a committed `.env` file.

### 2.2 Immutable / Forbidden Paths (must NOT be touched)

```
modules/platform-admin/src/**                  ← BFF source (absolute lock)
modules/platform-admin/controllers/**
modules/platform-admin/guards/**
modules/platform-admin/dto/**
modules/platform-admin/platform-admin.module.ts
modules/platform-admin/index.ts
prisma/**
package.json                                   ← root package.json (no new deps)
modules/platform-admin/client/package.json     ← client package.json (no new deps)
modules/platform-admin/client/src/App.tsx      ← existing working code (do not modify)
modules/platform-admin/client/src/api/platformAdmin.ts  ← existing BFF client
modules/platform-admin/client/src/components/**         ← existing 15 components
modules/platform-admin/client/src/main.tsx
```

---

## 3. Pre-Execution Verification (Read-Only, Before Any Change)

### V1 — Confirm Suite-Shavi Has Equivalent Coverage

| BassanOs Misplaced File                 | suite-shavi Equivalent                               | Status                                  |
| --------------------------------------- | ---------------------------------------------------- | --------------------------------------- |
| `api/adminApi.ts`                       | `api/platformAdmin.ts`                               | ✅ exists (uses BFF via `VITE_API_URL`) |
| `pages/AdminDashboard.tsx`              | `App.tsx` (full dashboard w/ nav, header, workspace) | ✅ exists & richer                      |
| `components/CreateOrganizationForm.tsx` | `components/OrganizationCreate.tsx`                  | ✅ exists                               |
| `components/OrganizationList.tsx`       | `components/OrganizationList.tsx`                    | ✅ exists & richer                      |

**Result:** suite-shavi already has canonical implementations. No new code required.

### V2 — Confirm No Calls to `/api/v1`

```bash
cd "D:\Basaan os\suite-shavi"
grep -r "api/v1" modules/platform-admin/client/src/
```

**Expected:** No output.

### V3 — Confirm No `localStorage` Usage

```bash
grep -r "localStorage" modules/platform-admin/client/src/
```

**Expected:** No output.

### V4 — Confirm No Hardcoded Secrets

```bash
grep -r "VITE_ADMIN_JWT\s*=" modules/platform-admin/client/src/
grep -r "Bearer " modules/platform-admin/client/src/
```

**Expected:** No hardcoded JWT values. `Bearer` may appear as a template in API code — confirm token is obtained from env only.

---

## 4. Environment Variable Documentation

The following environment variables must be documented in
`modules/platform-admin/client/.env.example`:

```env
# -------------------------------------------------------------------------
# Admin Dashboard — Environment Variables
# -------------------------------------------------------------------------

# URL of the Bassan.os core API (used by the BFF layer; do not call directly from UI)
VITE_API_URL=https://<core-api-hostname>

# URL of the admin JWKS endpoint (used by the BFF to verify RS256 JWTs)
# Set this in the BFF's server environment, NOT in the client .env.
# ADMIN_JWKS_URL=https://jwks-server-production.up.railway.app/.well-known/jwks.json

# S2S JWT for sandbox admin access ONLY (short-lived RS256, TTL 300s)
# SECURITY: Never commit a real value. Use Railway/CI secret management.
# Production: The BFF issues tokens server-side; this variable is for local dev only.
# VITE_ADMIN_JWT=<short-lived-rs256-token-from-gen-token.js>

# Core API base URL (used by legacy adminApi.ts pattern; prefer BFF via VITE_API_URL)
# VITE_CORE_API_URL=https://<core-api-hostname>
```

> **Note:** `VITE_ADMIN_JWT` and `VITE_CORE_API_URL` are documented for completeness because
> the BassanOs files referenced them. The primary suite-shavi API client (`platformAdmin.ts`)
> uses `VITE_API_URL` pointing to the BFF, which is the authorised pattern per
> `INTEGRATION_CONTRACT_CORE.md`. Direct calls to the core API from the client are not used
> in the current suite-shavi implementation.

---

## 5. Tasks (Ordered — Executor Must Follow Sequence)

### T1 — Create Branch

```bash
cd "D:\Basaan os\suite-shavi"
git checkout -b fix/ui-relocation
```

**Stop if:** branch creation fails or there are uncommitted changes.

### T2 — Run Pre-Execution Verification Checks (V1–V4 above)

Record all command outputs verbatim in `GATE_UI_FIX_VERIFICATION_EVIDENCE.md`.

**Stop if:** Any call to `/api/v1` found, any `localStorage` usage found, or any
hardcoded secret found.

### T3 — Update `.env.example` (if needed)

Check `modules/platform-admin/client/.env.example`. If `VITE_ADMIN_JWT` and
`VITE_CORE_API_URL` documentation entries are absent, add the lines from Section 4.
If the file does not exist, create it with the content from Section 4.

```bash
cat modules/platform-admin/client/.env.example
```

Only modify `.env.example` — never `.env`.

### T4 — Run Build & Lint

```bash
cd modules/platform-admin/client
npm run build
npm run lint
```

**Stop if:** either exits non-zero.

### T5 — Commit (governance artifacts + env.example only)

```bash
cd "D:\Basaan os\suite-shavi"
git add modules/platform-admin/client/.env.example
git add modules/platform-admin/governance/gates/GATE_UI_FIX_*.md
git commit -m "docs(governance): record UI relocation verification for admin dashboard

The admin dashboard React components (OrganizationList, OrganizationCreate,
App.tsx, api/platformAdmin.ts) already reside in the correct location within
suite-shavi. No new UI code was added.

This commit:
- Documents env variables VITE_ADMIN_JWT / VITE_CORE_API_URL in .env.example
- Adds GATE_UI_FIX_PLAN.md, execution report, and verification evidence
- Confirms no /api/v1 calls or localStorage usage exist in the client

Companion change: fix/ui-relocation branch in BassanOs removes the misplaced
UI files from the core-API repo.

Refs: GATE-UI-FIX"
```

### T6 — Write Governance Artifacts

Create:

- `modules/platform-admin/governance/gates/GATE_UI_FIX_EXECUTION_REPORT.md`
- `modules/platform-admin/governance/gates/GATE_UI_FIX_VERIFICATION_EVIDENCE.md`
- `modules/platform-admin/governance/gates/GATE_UI_FIX_PR_BODY.md`

---

## 6. Verification Commands

| Command                       | Path          | Expected Result                          |
| ----------------------------- | ------------- | ---------------------------------------- |
| `grep -r "api/v1" src/`       | `client/src/` | Empty (no v1 calls)                      |
| `grep -r "localStorage"`      | `client/src/` | Empty                                    |
| `npm run build`               | `client/`     | Exit 0                                   |
| `npm run lint`                | `client/`     | Exit 0                                   |
| `git diff --name-only HEAD~1` | repo root     | Only `GATE_UI_FIX_*.md` + `.env.example` |

---

## 7. Security Constraints

Per `SECURITY_BASELINE.md`:

- **No private keys** in any committed file.
- **No secrets** in `.env.example` (template values only, commented out).
- **Fail-closed guard** must remain: `AdminDashboard`/`App.tsx` must show access-denied
  if `VITE_ADMIN_JWT` is absent — this is already implemented in the existing code.
- **No `localStorage`** usage for JWT storage.
- **No `/api/v1`** calls from any client component.
- **VITE_ADMIN_JWT** is ephemeral by design (TTL 300s). Documentation must note it must
  never be persisted.

---

## 8. Stop Conditions (ABSOLUTE)

1. **ABORT** if any file in `modules/platform-admin/src/**` (the BFF) is modified.
2. **ABORT** if `package.json` (root or client) is modified.
3. **ABORT** if any new dependency is installed.
4. **ABORT** if `npm run build` or `npm run lint` exits non-zero.
5. **ABORT** if `grep -r "api/v1"` returns any results.
6. **ABORT** if `grep -r "localStorage"` returns any results.
7. **ABORT** if any private key or real JWT value is found in staged changes.
8. **ABORT** if the BFF source (`src/`) is touched in any way.

---

## 9. Post-Execution Artifacts to Create

- `GATE_UI_FIX_EXECUTION_REPORT.md` — step-by-step log with command outputs
- `GATE_UI_FIX_VERIFICATION_EVIDENCE.md` — grep outputs, build logs, lint outputs
- `GATE_UI_FIX_PR_BODY.md` — PR description template for human merge review

---

## 10. Human Approval Required

**This plan MUST NOT be executed until explicit human approval is received.**

Approver acknowledges:

- [ ] suite-shavi already has all required UI components (no new React code needed)
- [ ] Only `.env.example` and governance docs will be created/modified
- [ ] BFF source (`modules/platform-admin/src/`) is not touched
- [ ] No new dependencies will be added
- [ ] Build and lint must pass before commit is merged
- [ ] Companion plan (`PR_CORE_SUITE_FIX_PLAN.md`) governs the BassanOs deletions

---

_END OF PLAN_
