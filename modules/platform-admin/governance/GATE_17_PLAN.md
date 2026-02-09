# Gate 17 — UI Structure Spec (Docs-Only) — Plan

## 1. Purpose

To define the **UI Structure Specification** for the Platform Admin module, strictly aligning with `MODULE_SCOPE_LOCK`. This gate is **DOCS-ONLY** and establishes the blueprint for the App Shell, Navigation, and authorized Pages.
**NO CODE IMPLEMENTATION** is authorized in this gate.

## 2. Scope Alignment (MODULE_SCOPE_LOCK)

### In Scope (Docs Spec Only)

- **App Shell Structure**: Sidebar + Topbar definition.
- **Authorized Pages**:
  - **Organization Management**: List, Detail, Create, Mappings.
  - **User Management**: List (Internal), Detail, Create.
  - **Audit Logs**: Viewer.
- **Navigation Groups**:
  - **Management**: Organizations, Users.
  - **Governance**: Audit Logs.

### Out of Scope (Explicitly Removed)

- ❌ **Dashboard**: Removed (Not in `MODULE_SCOPE_LOCK`; "Real-time dashboards" forbidden).
- ❌ **Settings**: Removed (Not in `MODULE_SCOPE_LOCK`; "Any screen not listed" forbidden).
- ❌ **Code Implementation**: No `.tsx`, `.ts`, or `.css` files.
- ❌ **Dependencies**: No `package.json` changes.

## 3. Allowlist (Docs Only)

The ONLY authorized files for modification/creation in this gate are:

1.  `modules/platform-admin/governance/GATE_17_PLAN.md`
2.  `modules/platform-admin/governance/GATE_17_AUTHORIZATION.md`
3.  `modules/platform-admin/governance/GATE_17_EXECUTION_REPORT.md`
4.  `modules/platform-admin/governance/GATE_17_VERIFICATION_EVIDENCE.md`

## 4. Execution Strategy

1.  **Define**: Update governance to reflect the reduced, compliant scope.
2.  **Authorize**: Strictly limit execution to these documentation updates.
3.  **Verify**: Ensure NO code artifacts are created.

## 5. Acceptance Criteria

- [ ] Plan re-scoped to match `MODULE_SCOPE_LOCK`.
- [ ] Dashboard and Settings explicitly removed from specification.
- [ ] Authorization restricts file creation to Governance docs only.
- [ ] `git diff` confirms NO code changes.
