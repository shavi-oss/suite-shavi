# Suite — REPO_GOVERNANCE (Repository Execution Protocol)

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Document Title | REPO_GOVERNANCE                         |
| Repo           | Suite (Layer / Product Repo)            |
| Status         | FINAL — BINDING PROTOCOL                |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-01-26                              |

---

## 1) Purpose & Scope

### 1.1 Why Suite Exists as a Layer

Suite is a separate product/layer repository that provides vertical business functionality (CRM, Omnichannel, etc.) on top of Bassan.os Core. Suite exists to:

- isolate product-specific logic from Core
- maintain Core as a reusable, immutable platform
- enforce clean architectural boundaries via BFF pattern
- enable independent evolution of product features without Core contamination

### 1.2 Core is Black Box (Restated)

Bassan.os Core is treated as an immutable, external dependency. Suite MUST NOT:

- modify Core source code
- access Core DB directly
- rely on Core internal implementation details
- couple to undocumented Core behaviors

All Core interaction occurs via documented contracts only.

---

## 2) Definitions

| Term              | Definition                                                                                               |
| ----------------- | -------------------------------------------------------------------------------------------------------- |
| **BFF**           | Backend-for-Frontend; Suite's server-side API layer that mediates between UI and Core                    |
| **Core**          | Bassan.os Core repository; immutable platform providing foundational services (auth, workflows, tenancy) |
| **UI**            | Suite frontend applications (web/mobile) that interact ONLY with Suite BFF, never with Core directly     |
| **Tenant**        | Logical isolation boundary; one organization                                                             |
| **orgId mapping** | Suite DB stores mapping between Suite organizationId and Core organizationId; no shared tenant tables    |
| **Module**        | A discrete functional unit within Suite (e.g., CRM Contacts, Omnichannel Inbox) with its own governance  |

---

## 3) Repo Non-Goals (Explicit)

Suite repository will NOT:

- Modify or extend Bassan.os Core codebase
- Allow UI to call Core APIs directly
- Share databases between Suite and Core
- Implement CRM/Omnichannel logic inside Core
- Store Core-owned sensitive data without explicit authorization
- Forward UI tokens to Core
- Create shared authentication tokens between UI and Core
- Bypass BFF for any Core integration

---

## 4) Repository Structure (Strict)

### 4.1 Root Governance Files (Required Before Any Module)

```
/EXECUTION_AUTHORITY.md
/ARCHITECTURAL_LAWS.md
/REPO_GOVERNANCE.md
/SECURITY_BASELINE.md
/INTEGRATION_CONTRACT_CORE.md
```

### 4.2 Module Structure (Governance-First)

Each module MUST follow this structure:

```
/modules/<module-name>/
  /governance/
    MODULE_CHARTER.md
    MODULE_SCOPE_LOCK.md
    MODULE_DATA_OWNERSHIP.md
    MODULE_INTEGRATION_PLAN.md
    MODULE_SECURITY_LAWS.md
    MODULE_GATES_CHECKLIST.md
    MODULE_EXECUTION_AUTHORIZATION.md
  /src/
    (code only after governance approval)
  /tests/
    (tests only after governance approval)
```

**Rule**: No `/src/` or `/tests/` content may exist until all governance documents are complete and authorized.

---

## 5) Branching & PR Policy (Governance-Grade)

### 5.1 Branch Naming

- `master` — production-ready, protected
- `governance/<artifact-name>` — governance document work
- `module/<module-name>/<feature>` — module implementation work
- `hotfix/<issue-id>` — critical fixes

### 5.2 Required Review Rules

- All PRs require at least one approval from Governance Authority
- Governance document changes require explicit written justification
- No self-merge allowed
- All checks must pass (lint, build, security, tests)

**Governance-Only Phase Exception**:

During governance-only phase (documentation artifacts only, no code exists), execution checks (lint, build, tests) are not applicable. The only mandatory verification is:

- No runnable artifacts exist (no code, configs, schemas, migrations, CI files)
- All required governance artifacts are complete and approved

Once code exists, all execution checks become mandatory.

### 5.3 Direct Pushes to Master

**TODO**: Define whether direct pushes to `master` are forbidden or allowed under specific conditions (e.g., governance-only commits). Requires approval from repository owner.

---

## 6) Tagging & Versioning Rules

### 6.1 Tag Format

All tags MUST follow this format:

```
suite-<artifact-type>-v<version>
```

Examples:

- `suite-governance-v1`
- `suite-crm-contacts-v1`
- `suite-security-baseline-v2`

### 6.2 When Tags Are Created

Tags MUST be created when:

- A governance artifact reaches FINAL status
- A module completes all gates and is locked
- A security baseline is updated
- An integration contract is versioned

### 6.3 Tag Immutability

Once created, tags MUST NOT be deleted or moved. Any correction requires a new version tag.

---

## 7) Execution Protocol (Repo-Level)

### 7.1 No Code Before Governance

**Rule**: No source code, configuration, schema, migration, or runnable artifact may be created until:

1. All repo-level governance documents exist and are FINAL
2. Module-level governance documents exist and are approved
3. Explicit execution authorization is granted

### 7.2 Module Protocol Summary

Each module follows this mandatory sequence:

1. **Governance Phase**: Create all 7 module governance documents
2. **Authorization Gate**: Obtain explicit approval to proceed
3. **Implementation Phase**: Write code, tests, migrations
4. **Verification Phase**: Pass all gates (security, integration, compliance)
5. **Lock Phase**: Mark module as complete and immutable

No phase may begin until the prior phase is complete.

---

## 8) Stop Rules (Fail-Closed)

Execution MUST STOP IMMEDIATELY if any of the following occurs:

- **UI → Core direct call**: UI attempts to call Core API without going through BFF
- **Shared tokens**: Any attempt to use Core JWT/service token in UI or forward UI token to Core
- **Database access violation**: Suite code attempts to access Core DB directly
- **Code before docs**: Source code created before governance documents are approved
- **Scope creep**: Module implements features not declared in MODULE_CHARTER.md
- **Unauthorized Core modification**: Any attempt to modify Core codebase from Suite repo
- **Tenant isolation breach**: organizationId mapping missing or ambiguous without fail-closed handling
- **Undocumented integration**: BFF calls Core endpoint not listed in INTEGRATION_CONTRACT_CORE.md

**Action on STOP**: Halt all work, document the violation, escalate to Governance Authority.

---

## 9) Change Control

### 9.1 Required Approvals

Changes to governance documents require:

- Written justification explaining why change is needed
- Explicit approval from Governance Authority
- Version increment (if applicable)
- Git tag marking the change

### 9.2 Change Log Requirement

All governance document edits MUST include a change record in the document itself or in a dedicated `CHANGELOG.md` file, including:

- Date of change
- Author
- Justification
- Approval reference

### 9.3 Forbidden Changes

The following changes are FORBIDDEN without escalation:

- Weakening fail-closed rules
- Removing stop rules
- Allowing UI → Core direct calls
- Allowing shared databases
- Bypassing module governance protocol

---

## 10) Acceptance Criteria

This governance document is considered ACTIVE and BINDING when ALL of the following are true:

- [ ] EXECUTION_AUTHORITY.md exists and is tagged as FINAL
- [ ] ARCHITECTURAL_LAWS.md exists and is tagged as FINAL
- [ ] REPO_GOVERNANCE.md (this document) exists and is tagged as FINAL
- [ ] SECURITY_BASELINE.md exists and is tagged as FINAL
- [ ] INTEGRATION_CONTRACT_CORE.md exists and is tagged as FINAL
- [ ] All documents use consistent terminology (BFF, Core, UI, Tenant, orgId mapping, Module)
- [ ] All stop rules are explicit and enforceable
- [ ] Module protocol is documented and mandatory
- [ ] Branching and tagging rules are defined
- [ ] Change control process is documented
- [ ] No contradictions exist between governance documents
- [ ] Repository owner has reviewed and approved this document

---

## 11) Signature

**Approved By**: Governance Authority  
**Date**: 2026-01-26  
**Status**: FINAL — BINDING PROTOCOL
