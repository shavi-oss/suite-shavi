# Governance Index

This document serves as the central table of contents and summary for all governance artifacts within `modules/platform-admin/governance`.

## Directory Structure

| Directory    | Purpose                                                                                     |
| :----------- | :------------------------------------------------------------------------------------------ |
| `gates/`     | Contains all Gate-specific documents, organized by Gate ID (e.g., `gates/1/`, `gates/6B/`). |
| `audits/`    | Stores audit reports, schemas, rules, and specifications.                                   |
| `evidence/`  | Holds proof documents, execution logs, and raw outputs.                                     |
| `reports/`   | Contains general reports, linkage documents, and inventory summaries.                       |
| `decisions/` | Logs architectural decisions, risks, and deferred items.                                    |
| `contracts/` | Stores core contracts, legacy contracts, and constitution documents.                        |
| `design/`    | Contains design guidelines, assets, and UI/UX standards.                                    |
| `policy/`    | Stores high-level company policies and strategy documents.                                  |
| `rfcs/`      | specific Request for Comments (RFC) documents.                                              |
| `templates/` | Standard templates for tasks, PRs, and reviews.                                             |
| `misc/`      | Miscellaneous and superseded documents (e.g., old file index).                              |

## Gate Catalog

| Gate ID   | Description                | Path                       |
| :-------- | :------------------------- | :------------------------- |
| **1-9**   | Initial Setup & Foundation | `gates/1/` to `gates/9/`   |
| **10-19** | Core Infrastructure        | `gates/10/` to `gates/19/` |
| **20-29** | Feature Implementation     | `gates/20/` to `gates/29/` |
| **30-39** | Compliance & Audits        | `gates/30/` to `gates/39/` |
| **40-49** | Hardening & Security       | `gates/40/` to `gates/49/` |
| **50-54** | Final Release              | `gates/50/` to `gates/54/` |

## Non-Gate Document Catalog

### Decisions

- `decisions/GATE_2_DECISIONS_AND_DEFERRED.md`
- `decisions/GATE_29_5_DECISION_LOG.md`
- `decisions/FUTURE_RISKS_AND_DECISIONS.md`
- `decisions/CORE_DECISION_LOG.md`

### Evidence

- `evidence/SUITE_PLATFORM_ADMIN_FAIL_CLOSED_PROOF.md`
- `evidence/SUITE_PLATFORM_ADMIN_COMMAND_OUTPUTS.md`
- `evidence/CORE_CONTRACT_EVIDENCE_TABLE.md`
- `evidence/gate_28_evidence.md`

### Audits

- `audits/SUITE_FULL_AUDIT_REPORT.md`
- `audits/SUITE_PLATFORM_ADMIN_REALITY_AUDIT.md`
- `audits/schemas/AUDIT_EVENT_SCHEMA.md`
- `audits/rules/AUDIT_INVARIANTS.md`
- `audits/rules/AUDIT_STOP_RULES.md`
- `audits/rules/AUTHORIZATION_STOP_RULES.md`
- `audits/specs/AUDIT_SPEC_SUITE.md`
- `audits/compliance/GATE_30_DNA_COMPLIANCE_AUDIT.md`
- `audits/visual/GATE_40_VISUAL_GOVERNANCE_AUDIT.md`
- `audits/readiness/GATE_41_PRODUCTION_READINESS_AUDIT.md`
- `audits/security/GATE_43_BFF_HARDENING_AUDIT.md`
- `audits/security/PERMISSION_ENFORCEMENT_AUDIT.md`
- `audits/security/RUNTIME_TENANT_PERMISSION_RISK_AUDIT.md`
- `audits/security/TENANT_BOUNDARY_AUDIT.md`

### Reports

- `reports/FINAL_ALIGNMENT_REPORT.md`
- `reports/FINAL_GOVERNANCE_ALIGNMENT_REPORT.md`
- `reports/PHASE_8_AUDIT_LOGS_ENDPOINT_REPORT.md`
- `reports/PHASE_8_AUDIT_LOGS_VERIFICATION_REPORT.md`
- `reports/linkage/SUITE_PLATFORM_ADMIN_LINKAGE.md`
- `reports/inventory/DOCUMENTATION_INVENTORY_REPORT.md`

## Verification

To verify the integrity of the governance structure:

1.  **Check Git Status**: Ensure the working directory is clean.

    ```bash
    git status
    ```

2.  **Verify File Locations**: Use `ls -R` or `dir /s` to confirm files are in their expected directories.

3.  **Check for Untracked Files**: Ensure no new files are left untracked.

## Move Log

Executed a comprehensive reorganization of `modules/platform-admin/governance` on 2026-02-14.

- Moved ** ~50** Gate folders.
- Organized **~30** Non-Gate documents into logical categories.
- Created `GOVERNANCE_INDEX.md` (this file).
