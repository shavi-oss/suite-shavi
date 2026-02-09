# Governance File Index — platform-admin

This index lists governance files that define the **current gate** and the **constraints for the next gate**.

| File Path | Gate/Stage | Purpose |
| --- | --- | --- |
| ARCHITECTURAL_LAWS.md | Repo-level (all gates) | Permanent architectural laws that bind all module work and fail-closed behavior. |
| EXECUTION_AUTHORITY.md | Repo-level (all gates) | Establishes execution authority required before any module work. |
| REPO_GOVERNANCE.md | Repo-level (all gates) | Defines repo-wide governance requirements and sequencing. |
| SECURITY_BASELINE.md | Repo-level (all gates) | Baseline security expectations that constrain all module work. |
| INTEGRATION_CONTRACT_CORE.md | Repo-level (all gates) | Canonical Core integration contract at the repo level. |
| modules/platform-admin/governance/MODULE_GATES_CHECKLIST.md | Gate 1 (current), Gate 2 (next) | Defines gate order and shows Gate 1 as pending and Gate 2 as next. |
| modules/platform-admin/governance/MODULE_EXECUTION_AUTHORIZATION.md | Gate 1 (current) | Grants implementation authorization within the locked scope. |
| modules/platform-admin/governance/MODULE_SCOPE_LOCK.md | Gate 1→2 constraint | Locked scope for allowed UI screens, endpoints, DB tables, and Core calls. |
| modules/platform-admin/governance/MODULE_CHARTER.md | Module baseline | Declares module purpose and boundaries. |
| modules/platform-admin/governance/IMPLEMENTATION_PLAN_PLATFORM_ADMIN.md | Gate 1→2 constraint | Locked implementation scope and out-of-scope list. |
| modules/platform-admin/governance/IMPLEMENTATION_STRUCTURE.md | Gate 1→2 constraint | Defines implementation structure and boundaries for the module. |
| modules/platform-admin/governance/MODULE_DATA_OWNERSHIP.md | Gate 2 constraint | Defines Suite-owned tables and data ownership rules. |
| modules/platform-admin/governance/MODULE_SECURITY_LAWS.md | Gate 2 constraint | Binding security invariants (RBAC, JWT handling, audit logging). |
| modules/platform-admin/governance/RBAC_SCOPE_MATRIX.md | Gate 2 constraint | Role-by-role permission matrix for platform-admin. |
| modules/platform-admin/governance/FAIL_CLOSED_MATRIX.md | Gate 2 constraint | Required fail-closed behaviors for error paths. |
| modules/platform-admin/governance/CORRELATION_ID_POLICY.md | Gate 2 constraint | Correlation ID requirements and propagation rules. |
| modules/platform-admin/governance/AUDIT_EVENT_SCHEMA.md | Gate 2 constraint | Required audit event fields and structure. |
| modules/platform-admin/governance/AUDIT_INVARIANTS.md | Gate 2 constraint | Immutable audit log rules and invariants. |
| modules/platform-admin/governance/AUDIT_STOP_RULES.md | Gate 2 constraint | Audit-related stop conditions that force a halt. |
| modules/platform-admin/governance/AUTHORIZATION_STOP_RULES.md | Gate 1→2 constraint | Stop rules tied to authorization and scope violations. |
| modules/platform-admin/governance/STACK_BOUNDARIES.md | Gate 1→2 constraint | Stack separation and boundary rules for the module. |
| modules/platform-admin/governance/MODULE_INTEGRATION_PLAN.md | Gate 2 constraint | Defines the Core integration flow and fail-closed rules. |
| modules/platform-admin/governance/INTEGRATION_ADAPTER_SPEC.md | Gate 2 constraint | Adapter contract for Core integration boundaries. |
| modules/platform-admin/governance/INTEGRATION_CONTRACT_CORE.md | Gate 2 constraint | Module-level Core contract summary and allowed interactions. |
| modules/platform-admin/governance/PLATFORM_ADMIN_READINESS.md | Gate readiness | Readiness checks for platform-admin before execution. |
| modules/platform-admin/governance/GATE_6_AUDIT_CORRELATION_PLAN.md | Future gate (6) | Audit/correlation plan for later compliance verification. |
| modules/platform-admin/governance/GATE_7_PLAN.md | Future gate (7) | Final lock and release planning. |
| modules/platform-admin/governance/GATE_7_AUTHORIZATION.md | Future gate (7) | Authorization framework for final lock and release. |
| modules/platform-admin/governance/GATE_4_AUTHORIZATION_PLAN.md | Future gate (4) | Integration test authorization planning. |
| modules/platform-admin/governance/GATE_3_AUTHORIZATION.md | Future gate (3) | Unit test authorization framework. |
| modules/platform-admin/governance/GATE_8_PLAN.md | Gate 8 (org mapping governance) | Docs-only gate defining org mapping governance scope. |
| modules/platform-admin/governance/GATE_8_CHECKLIST.md | Gate 8 (org mapping governance) | Checklist for completing the Gate 8 docs-only package. |
| modules/platform-admin/governance/GATE_8_AUTHORIZATION.md | Gate 8 (org mapping governance) | Authorization to complete Gate 8 docs-only scope. |
| modules/platform-admin/governance/GATE_8_1_EXECUTION_AUTHORIZATION.md | Gate 8.1 (execution) | Execution authorization for org mapping implementation. |
| modules/platform-admin/governance/GATE_8_1_EVIDENCE.md | Gate 8.1 (execution) | Evidence log for Gate 8.1 work. |
| modules/platform-admin/governance/GATE_8_1_COMPLETION_REPORT.md | Gate 8.1 (execution) | Completion report for Gate 8.1 execution. |
| modules/platform-admin/governance/GATE_8_2_PLAN.md | Gate 8.2 (docs-only) | Plan for integration tests scope and constraints. |
| modules/platform-admin/governance/GATE_8_2_CHECKLIST.md | Gate 8.2 (docs-only) | Checklist for Gate 8.2 documentation. |
| modules/platform-admin/governance/GATE_8_2_AUTHORIZATION.md | Gate 8.2 (authorization) | Authorization for docs-only now and execution later. |
| modules/platform-admin/governance/_execution/GATE_8_1_EXECUTION_REPORT.md | Gate 8.1 (execution) | Execution report for Gate 8.1 outcomes. |
| modules/platform-admin/governance/_execution/GATE_8_1_REMEDIATION_REPORT.md | Gate 8.1 (remediation) | Remediation report tied to Gate 8.1 findings. |
| modules/platform-admin/governance/_execution/GATE_8_2_EXECUTION_REPORT.md | Gate 8.2 (execution) | Execution report documenting Gate 8.2 STOP condition. |
| modules/platform-admin/governance/_execution/GATE_8_2B_EXECUTION_REPORT.md | Gate 8.2B (execution) | Alternative execution report after Gate 8.2 STOP. |
| modules/platform-admin/governance/_execution/GATE_8_3_EXECUTION_REPORT.md | Gate 8.3 (execution) | Execution report for dependency remediation. |
| modules/platform-admin/governance/_execution/GATE_8_3_1_EXECUTION_REPORT.md | Gate 8.3.1 (execution) | Follow-on execution report for dependency fixes. |
| modules/platform-admin/governance/_execution/GATE_8_3_2_EXECUTION_REPORT.md | Gate 8.3.2 (execution) | Execution report documenting STOP due to test failure. |
| modules/platform-admin/governance/_execution/GATE_8_4_EXECUTION_REPORT.md | Gate 8.4 (execution) | Execution report for HTTP integration tests. |
| modules/platform-admin/governance/_execution/GATE_8_4_REMEDIATION_EXECUTION_REPORT.md | Gate 8.4 (remediation) | Remediation execution report with PASS decision. |
| modules/platform-admin/governance/core-contract/CORE_V1_INTEGRATION_LOCK.md | Core contract lock | Binding lock for Core v1 capabilities and deferrals. |
| modules/platform-admin/governance/core-contract/CORE_CONTRACT_V1_EXTRACT.md | Core contract lock | Extracted Core v1 endpoints and contract evidence. |
| modules/platform-admin/governance/core-contract/CORE_CONTRACT_EVIDENCE_TABLE.md | Core contract lock | Evidence table linking Core contract sources. |
| modules/platform-admin/governance/core-contract/CORE_CONTRACT_GO_NO_GO_DECISION.md | Core contract lock | Go/No-Go decision for Core contract acceptance. |
| modules/platform-admin/governance/core-contract/CORE_CONTRACT_V1_LOCK_DECLARATION.md | Core contract lock | Formal lock declaration for Core contract v1. |
| modules/platform-admin/governance/core-contract/SPEC_DRIFT_NOTICE.md | Core contract lock | Drift notice for Core contract changes. |
| modules/platform-admin/governance/contracts/CORE_COMMAND_CONTRACTS.md | Core contract support | Command contract definitions used by the module. |
| modules/platform-admin/governance/contracts/CORE_DATA_CONTRACTS.md | Core contract support | Core data contract references and boundaries. |
| modules/platform-admin/governance/contracts/CORE_FAILURE_SEMANTICS.md | Core contract support | Failure handling semantics required for integration. |
| modules/platform-admin/governance/contracts/CORE_IDENTITY_SCOPE_CONTRACT.md | Core contract support | Identity scope rules for Core integration. |
| modules/platform-admin/governance/contracts/FORBIDDEN_DATA_MATRIX.md | Core contract support | Data that must never be stored or handled. |
| modules/platform-admin/governance/suite-constitution/SECURITY_STOP_CONDITIONS.md | Suite constitution | Global security stop conditions that force a halt. |
| modules/platform-admin/governance/suite-constitution/PROJECT_CONTEXT.md | Suite constitution | High-level project context for governance alignment. |
| modules/platform-admin/governance/suite-constitution/SYSTEM_MASTER_BLUEPRINT.md | Suite constitution | System blueprint defining module placement. |
| modules/platform-admin/governance/suite-constitution/SYSTEM_MASTER_BLUEPRINT_ULTRA.md | Suite constitution | Extended blueprint reference for system design. |
| modules/platform-admin/governance/suite-constitution/ALIGNMENT_REPORT.md | Suite constitution | Governance alignment report for the suite. |
| modules/platform-admin/governance/suite-constitution/01_SCHEMAS.md | Suite constitution | Canonical schema definitions. |
| modules/platform-admin/governance/suite-constitution/02_API_CONTRACTS.md | Suite constitution | API contract references for suite-level alignment. |
| modules/platform-admin/governance/suite-constitution/03_PERMISSIONS_MATRIX.md | Suite constitution | System-wide permissions matrix. |
| modules/platform-admin/governance/suite-constitution/04_DATA_ACCESS_AND_SECURITY.md | Suite constitution | Data access and security baseline. |
| modules/platform-admin/governance/suite-constitution/05_WORKERS_AND_JOBS.md | Suite constitution | Worker/job boundaries and constraints. |
| modules/platform-admin/governance/suite-constitution/06_EVENTS_AND_OBSERVABILITY.md | Suite constitution | Observability and events guidance. |
| modules/platform-admin/governance/suite-constitution/07_STORAGE_AND_FILES.md | Suite constitution | Storage boundaries and file handling rules. |
| modules/platform-admin/governance/suite-constitution/08_SEARCH_AND_INDEXING.md | Suite constitution | Search/indexing constraints. |
| modules/platform-admin/governance/suite-constitution/09_OMNICHANNEL_PROVIDER_LAYER.md | Suite constitution | Omnichannel integration boundaries. |
| modules/platform-admin/governance/suite-constitution/10_AUTOMATION_AND_WORKFLOWS.md | Suite constitution | Automation/workflow governance. |
| modules/platform-admin/governance/suite-constitution/11_AI_LAYER_AND_GOVERNANCE.md | Suite constitution | AI layer governance constraints. |
| modules/platform-admin/governance/suite-constitution/12_ANALYTICS_AND_REPORTING_ENGINE.md | Suite constitution | Analytics/reporting constraints. |
| modules/platform-admin/governance/suite-constitution/13_BILLING_QUOTAS_AND_USAGE_CONTROL.md | Suite constitution | Billing/usage boundaries. |
| modules/platform-admin/governance/suite-constitution/14_DEPLOYMENT_RUNTIME_AND_SCALING (1).md | Suite constitution | Deployment and scaling constraints. |
| modules/platform-admin/governance/suite-constitution/15_SECURITY_HARDENING_AND_COMPLIANCE.md | Suite constitution | Security hardening and compliance guidance. |
| modules/platform-admin/governance/suite-constitution/16_PLATFORM_ADMIN_AND_SYSTEM_GOVERNANCE.md | Suite constitution | Platform-admin governance alignment. |
| modules/platform-admin/governance/suite-constitution/17_PRODUCT_EXTENSION_AND_MARKETPLACE_ARCHITECTURE.md | Suite constitution | Extension/marketplace architecture constraints. |
| modules/platform-admin/governance/suite-constitution/18_FUTURE_EVOLUTION_AND_SYSTEM_ROADMAP.md | Suite constitution | Future roadmap guidance (non-executable). |
| modules/platform-admin/governance/suite-constitution/19_PART2_PACKAGE_ENGINEER_GUIDE.md | Suite constitution | Engineering guide for the suite constitution. |
| modules/platform-admin/governance/suite-constitution/PERMISSION_ENFORCEMENT_AUDIT.md | Suite constitution | Permission enforcement audit references. |
| modules/platform-admin/governance/suite-constitution/TENANT_BOUNDARY_AUDIT.md | Suite constitution | Tenant boundary audit references. |
| modules/platform-admin/governance/suite-constitution/RUNTIME_TENANT_PERMISSION_RISK_AUDIT.md | Suite constitution | Runtime tenant permission risk audit. |
| modules/platform-admin/governance/suite-constitution/ULTRA_SPEC_PART2.md | Suite constitution | Ultra spec reference for suite design. |
| modules/platform-admin/governance/suite-constitution/ULTRA_SPEC_PART2_DEEP.md | Suite constitution | Deep-dive ultra spec reference. |
| modules/platform-admin/governance/FORWARD_EXECUTION_MAP.md | Future gates | Forward execution roadmap for upcoming gates. |
| modules/platform-admin/governance/GATE_1_7_EXECUTION_AUTHORIZATION.md | Historical gate (1.7) | Execution authorization for a prior gate sequence. |
| modules/platform-admin/governance/GATE_5_2_RECOVERY_PLAN.md | Future gate (5.2) | Recovery plan for org mapping gate execution. |
| modules/platform-admin/governance/_audit/SUITE_PLATFORM_ADMIN_CORE_CALLS_MAP.md | Audit support | Map of Core calls used for audit/verification. |
| modules/platform-admin/governance/_planning/GATE_5_2_1_DRAFT_AUTHORIZATION.md | Planning (Gate 5.2.1) | Draft authorization for future gate work. |
| modules/platform-admin/governance/_planning/GATE_4_9_ENDPOINT_PLAN.md | Planning (Gate 4.9) | Planned first endpoint design for a future gate. |
| modules/platform-admin/governance/_planning/GATE_5_3A_DRAFT_AUTHORIZATION.md | Planning (Gate 5.3A) | Draft authorization for template publish gate. |
| modules/platform-admin/governance/_planning/GATE_5_0_EXECUTION_PLAN.md | Planning (Gate 5.0) | Execution plan for future feature gates. |
| modules/platform-admin/governance/_planning/TEST_STRUCTURE_MAP.md | Planning (tests) | Test structure mapping for governance-approved tests. |
| modules/platform-admin/governance/_planning/GATE_4_9_TEST_PLAN.md | Planning (Gate 4.9) | Test plan for the first opt-in endpoint. |
| modules/platform-admin/governance/_planning/GATE_4_10_EXECUTION_PLAN.md | Planning (Gate 4.10) | Execution plan for a future gate. |
| modules/platform-admin/governance/_planning/GATE_5_1_DRAFT_AUTHORIZATION.md | Planning (Gate 5.1) | Draft authorization for organization management gate. |
| modules/platform-admin/governance/_planning/GATE_5_3_DRAFT_AUTHORIZATION.md | Planning (Gate 5.3) | Draft authorization for template publish gate. |
| modules/platform-admin/governance/_planning/GATE_5_SCOPE_MAP.md | Planning (Gate 5) | Scope map for Gate 5 feature modules. |
| modules/platform-admin/governance/_planning/TEST_HARNESS_PLAN.md | Planning (tests) | Plan for test harness setup and constraints. |
