# Suite — ARCHITECTURAL LAWS (Permanent)

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Document Title | ARCHITECTURAL_LAWS                      |
| Repo           | Suite (Layer / Product Repo)            |
| Status         | FINAL — PERMANENT LAWS                  |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-01-26                              |

---

## LAW-0 — EXECUTION MODE (ALWAYS ON)

System mode is ALWAYS:
STRICT · FAIL-CLOSED · GOVERNANCE-FIRST

Anything not explicitly allowed is forbidden.

---

## LAW-1 — GOVERNANCE FIRST (NO CODE BEFORE DOCS)

Forbidden until repo-level governance exists:

- EXECUTION_AUTHORITY.md
- ARCHITECTURAL_LAWS.md
- REPO_GOVERNANCE.md
- SECURITY_BASELINE.md
- INTEGRATION_CONTRACT_CORE.md

Forbidden until module-level governance exists + authorized:

- Any module code, schema, migrations, endpoints, UI, jobs

---

## LAW-2 — CORE BLACK BOX (NON-NEGOTIABLE)

Bassan.os Core is immutable and treated as a black box.
Suite MUST NOT:

- modify Core code
- rely on Core internal modules
- couple to Core DB schema beyond documented contract

Any Core change requires Core repo stage/patch, never Suite.

---

## LAW-3 — UI NEVER TALKS TO CORE

UI (web/mobile) must never call Core directly:

- no direct HTTP calls from UI to Core
- no Core JWT stored/used by UI
- no Core service tokens in browser/mobile

Only Suite BFF may call Core.

---

## LAW-4 — BFF IS THE ONLY INTEGRATION BOUNDARY

Suite Backend (BFF) is the single boundary:

- BFF ↔ Core (service-to-service)
- UI ↔ BFF only

Any attempt to bypass BFF = STOP.

---

## LAW-5 — TOKEN & IDENTITY SEPARATION

- UI tokens are Suite-issued only (Suite Auth).
- Core JWT/service tokens are Core-issued and are server-only.
- No shared secrets between UI and Core.
- Token forwarding from UI to Core is forbidden.

---

## LAW-6 — DATABASE SEPARATION (HARD WALL)

- Core DB is owned by Core only.
- Suite DB is owned by Suite only.
- No shared database.
- No cross-writes.
- No foreign keys across databases.
- No “reporting access” from Suite to Core DB.

Integration is only via Core APIs/contracts.

---

## LAW-7 — TENANT BOUNDARY (ORG ALIGNMENT ONLY)

Tenant identity alignment uses organizationId mapping only:

- Suite stores its own org records (Suite DB)
- Core orgId is referenced as an external identifier (mapping)
- No shared tenant tables

Any ambiguity in tenant mapping must fail-closed.

---

## LAW-8 — MODULE OWNERSHIP & DATA OWNERSHIP

Each Suite module MUST declare:

- what data it owns (Suite DB tables)
- what data it reads from Core (via contract)
- what it never stores

No module may “silently” store Core-owned data unless explicitly authorized.

---

## LAW-9 — CONTRACT-FIRST INTEGRATION

Suite ↔ Core integration requires:

- INTEGRATION_CONTRACT_CORE.md (repo-level)
- module INTEGRATION_PLAN before module code

No “we’ll fix the contract later”.

---

## LAW-10 — FAIL-CLOSED BY DEFAULT

On any uncertainty:

- deny
- do not guess
- do not create fallback behaviors that broaden access
- return safe errors

---

## LAW-11 — CHANGE CONTROL

Changes to these laws require:

- written change record
- explicit approval
- version tag

No silent edits.
