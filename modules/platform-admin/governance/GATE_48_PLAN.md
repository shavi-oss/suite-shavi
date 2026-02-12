# Gate 48 — Plan

## Dev Auth Flow Lock (Docs-Only)

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Gate Number    | 48                                      |
| Gate Name      | Dev Auth Flow Lock                      |
| Document Title | GATE_48_PLAN                            |
| Repo           | Suite (Layer / Product Repo)            |
| Module         | platform-admin                          |
| Status         | FINAL — PLAN APPROVED                   |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-02-12                              |

---

## 1) Objective

Define and LOCK the Suite Dev Auth Flow for UI ↔ BFF integration ONLY. This is a **docs-only** gate that establishes:

- JWT handling boundaries (UI never sees Core tokens)
- Storage policy (httpOnly cookies, no localStorage for auth secrets)
- CSRF/CORS posture
- Failure behavior (fail-closed)
- Explicit "NOT AVAILABLE" declarations

**No implementation authorized in this gate.**

---

## 2) Scope

**IN SCOPE** (Docs-Only):

- Create 5 governance documents defining auth flow
- Lock token storage policy
- Define CORS/CSRF strategy
- Document fail-closed invariants
- Declare what is NOT AVAILABLE in Core v1

**OUT OF SCOPE**:

- Any code implementation
- Any dependency changes
- Any modifications to src/**, tests/**, host/\*\*
- Any auth bypass or temporary dev shortcuts

---

## 3) Non-Goals

- Implementing authentication code (deferred to future gate)
- Implementing session management (deferred to future gate)
- Implementing CSRF protection (deferred to future gate)
- Modifying CORS configuration (current dev config is acceptable)

---

## 4) Source-of-Truth Documents

This gate MUST align with:

1. `ARCHITECTURAL_LAWS.md` (root) — LAW-3, LAW-5, LAW-10
2. `SECURITY_BASELINE.md` (root) — Section 3.3, 3.4, 4.2
3. `INTEGRATION_CONTRACT_CORE.md` (root) — Section 5, 12.2
4. `EXECUTION_AUTHORITY.md` (root)
5. `REPO_GOVERNANCE.md` (root)

---

## 5) Deliverables

1. `GATE_48_PLAN.md` (this file)
2. `GATE_48_AUTHORIZATION.md`
3. `GATE_48_DEV_AUTH_FLOW_LOCK.md`
4. `GATE_48_VERIFICATION_EVIDENCE.md`
5. `GATE_48_EXECUTION_REPORT.md`

**Total**: 5 files, all under `modules/platform-admin/governance/`

---

## 6) Verification Steps

**V1 — Git Status Check**:

```bash
git status --porcelain
```

**Expected**: ONLY the 5 Gate 48 files listed

**V2 — Git Diff Name Check**:

```bash
git diff --name-only
```

**Expected**: ONLY the 5 Gate 48 files

**V3 — Git Diff Content Check**:

```bash
git diff
```

**Expected**: Only governance markdown changes, no code

**V4 — No Build Required**:
Docs-only gate, no build/test execution required

---

## 7) Stop Conditions

Execution MUST STOP immediately if:

- Any file outside `modules/platform-admin/governance/` is modified
- Any code file (src/**, tests/**, host/\*\*) is touched
- Any dependency change (package.json/package-lock.json)
- Any mention of "dev bypass" or "temporary auth skip"
- Any plan to store Core tokens in UI
- Any plan for UI to call Core directly
- Any ambiguity on token storage (must be explicit: httpOnly cookies)

**Action on STOP**: Halt, document violation, escalate to Governance Authority.

---

## 8) Signature

**Approved By**: Governance Authority  
**Date**: 2026-02-12  
**Status**: FINAL — PLAN APPROVED
