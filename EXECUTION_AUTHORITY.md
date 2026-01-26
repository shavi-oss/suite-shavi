# Suite — EXECUTION AUTHORITY (Layer Repository)

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Document Title | EXECUTION_AUTHORITY                     |
| Repo           | Suite (Layer / Product Repo)            |
| Status         | FINAL — EXECUTION MANDATE               |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Classification | Internal                                |
| Effective Date | 2026-01-26                              |

---

## 0) Non-Negotiable Context (Final)

1. Bassan.os Core is a BLACK BOX.
2. Suite is a separate repository (Layer/Product), not part of Core.
3. UI NEVER talks directly to Core.
4. Suite API (BFF) is the ONLY component allowed to call Core.
5. Databases are separated:
   - Core DB: owned by Core only
   - Suite DB: owned by Suite only
   - No shared DBs, no cross-writes, no foreign keys between DBs
6. Tenant boundary is ONE organizationId alignment (mapping only, not shared storage).

Any violation of items (1-6) = IMMEDIATE STOP.

---

## 1) Purpose

This document is the single execution authority for Suite.
It resolves conflicts, enforces governance gating, and prevents Core contamination.

---

## 2) Authority Hierarchy

1. EXECUTION_AUTHORITY.md
2. ARCHITECTURAL_LAWS.md
3. REPO_GOVERNANCE.md
4. SECURITY_BASELINE.md
5. INTEGRATION_CONTRACT_CORE.md
6. Module governance docs
7. Everything else = NON-BINDING

---

## 3) Absolute Stop Rules

Execution MUST stop if ANY occurs:

- Code before governance
- UI → Core direct calls
- Shared tokens
- Shared databases
- Business logic in Core
- Any undocumented exception

STOP means STOP.

---

## 4) Required Repo-Level Governance

Before ANY module:

- EXECUTION_AUTHORITY.md
- ARCHITECTURAL_LAWS.md
- REPO_GOVERNANCE.md
- SECURITY_BASELINE.md
- INTEGRATION_CONTRACT_CORE.md

Missing any = no execution.

---

## 5) Module Protocol

Each module REQUIRES (before code):

1. MODULE_CHARTER.md
2. MODULE_SCOPE_LOCK.md
3. MODULE_DATA_OWNERSHIP.md
4. MODULE_INTEGRATION_PLAN.md
5. MODULE_SECURITY_LAWS.md
6. MODULE_GATES_CHECKLIST.md
7. MODULE_EXECUTION_AUTHORIZATION.md

---

## 6) Authorized Now

✔ Governance documents only  
✖ Any code, DB, API, UI, auth, CRM

---

## 7) Change Control

Edits require written justification + approval.
No silent changes.

---

## 8) Signature

Approved By: Governance Authority  
Date: 2026-01-26
