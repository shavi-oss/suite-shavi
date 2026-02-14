# Gate ID Naming & Folder Standard

> **Status**: ACTIVE  
> **Authority**: Platform Admin Governance  
> **Enforcement**: Git Hooks / CI (Future), Manual Review (Current)

## 1. Purpose

To prevent governance drift, ensuring all Gate artifacts are predictably named and located. This allows automated tooling and human auditors to instantly locate governance evidence.

## 2. Gate Folder Rules

All gate artifacts MUST live under `modules/platform-admin/governance/gates/`.

### 2.1 Standard Numeric Gates

**Format**: `gates/<GateNumber>/`

- `gates/1/`
- `gates/10/`

### 2.2 Lettered Gates

**Format**: `gates/<GateNumber><Letter>/`

- `gates/6A/`
- `gates/6B/`

### 2.3 Sub-Gates

**Format**: `gates/<GateNumber>/<SubID>/` OR `gates/<GateNumber><Letter>/<SubID>/`

- `gates/6B/2A/` (Subgate 2A of Gate 6B)
- `gates/13/1/` (Subgate 1 of Gate 13)

### 2.4 Special Gates (IP)

**Format**: `gates/IP-<Number>/`

- `gates/IP-1/` (CORRECT)
- `gates/IP1/` (FORBIDDEN)

## 3. File Placement Rules

### 3.1 Gate Artifacts

MUST be inside the specific Gate folder:

- Authorization (`GATE_X_AUTHORIZATION.md`)
- Plans (`GATE_X_PLAN.md`)
- Checklists (`GATE_X_CHECKLIST.md`)
- Evidence (`GATE_X_VERIFICATION_EVIDENCE.md`)
- Reports (`GATE_X_EXECUTION_REPORT.md`)
- Risk Logs (`GATE_X_RISK_LOG.md`)

### 3.2 Non-Gate Artifacts

MUST be categorized in root subdirectories:

- `audits/`: Audit reports, schemas, rules.
- `baselines/`: Snapshots, readiness matrices.
- `contracts/`: Immutable agreements, constitution.
- `decisions/`: Decision logs, risks.
- `design/`: UI/UX, tokens.
- `evidence/`: Raw evidence not tied to a specific gate.
- `policy/`: Operational policies (like this one).
- `reports/`: General plans, maps, status reports.
- `misc/`: Legacy or unclassified items.

**Root Restriction**: The `governance/` root directory MUST contain ONLY `GOVERNANCE_INDEX.md`.

## 4. Naming Conventions

**Prefix**: `GATE_<ID>_<TYPE>.md`

- Example: `GATE_6B_2A_AUTHORIZATION.md`

**Preservation**: Do not rename existing files unless completely wrongly named. Prefer moving over renaming.

## 5. Enforcement

- **Moves**: MUST use `git mv`.
- **Content**: MUST NOT modify content during moves, except to fix broken relative links.
- **New Files**: All new governance files MUST follow this standard immediately.
