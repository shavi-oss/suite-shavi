# PROJECT TREE — Platform Admin

(modules/platform-admin)

## Directory Structure

```text
modules/platform-admin/
├── controllers/
│   ├── health.controller.ts
│   └── index.ts
├── dto/
│   ├── health-response.dto.ts
│   └── index.ts
├── governance/
│   ├── contracts/
│   │   ├── CORE_COMMAND_CONTRACTS.md
│   │   ├── CORE_DATA_CONTRACTS.md
│   │   ├── CORE_FAILURE_SEMANTICS.md
│   │   ├── CORE_IDENTITY_SCOPE_CONTRACT.md
│   │   └── FORBIDDEN_DATA_MATRIX.md
│   ├── core-contract/
│   │   ├── CORE_CONTRACT_EVIDENCE_TABLE.md
│   │   ├── CORE_CONTRACT_GO_NO_GO_DECISION.md
│   │   ├── CORE_CONTRACT_V1_EXTRACT.md
│   │   ├── CORE_CONTRACT_V1_LOCK_DECLARATION.md
│   │   ├── CORE_V1_INTEGRATION_LOCK.md
│   │   └── SPEC_DRIFT_NOTICE.md
│   ├── suite-constitution/
│   │   ├── 01_SCHEMAS.md
│   │   ├── ... (Constitution Series 01-19)
│   │   ├── ALIGNMENT_REPORT.md
│   │   ├── PERMISSION_ENFORCEMENT_AUDIT.md
│   │   ├── PROJECT_CONTEXT.md
│   │   ├── RUNTIME_TENANT_PERMISSION_RISK_AUDIT.md
│   │   ├── SECURITY_STOP_CONDITIONS.md
│   │   ├── SYSTEM_MASTER_BLUEPRINT.md
│   │   ├── SYSTEM_MASTER_BLUEPRINT_ULTRA.md
│   │   ├── TENANT_BOUNDARY_AUDIT.md
│   │   ├── ULTRA_SPEC_PART2.md
│   │   └── ULTRA_SPEC_PART2_DEEP.md
│   ├── _audit/
│   │   ├── GATE_8_1_AUDIT_REPORT.md
│   │   ├── SUITE_FULL_AUDIT_REPORT.md
│   │   ├── SUITE_PLATFORM_ADMIN_COMMAND_OUTPUTS.md
│   │   ├── SUITE_PLATFORM_ADMIN_CORE_CALLS_MAP.md
│   │   ├── SUITE_PLATFORM_ADMIN_FAIL_CLOSED_PROOF.md
│   │   ├── SUITE_PLATFORM_ADMIN_LINKAGE.md
│   │   └── SUITE_PLATFORM_ADMIN_REALITY_AUDIT.md
│   ├── _execution/
│   │   ├── GATE_8_1_EXECUTION_REPORT.md
│   │   ├── GATE_8_1_REMEDIATION_REPORT.md
│   │   ├── GATE_8_2_EXECUTION_REPORT.md
│   │   ├── GATE_8_2B_EXECUTION_REPORT.md
│   │   ├── GATE_8_3_EXECUTION_REPORT.md
│   │   ├── GATE_8_3_1_EXECUTION_REPORT.md
│   │   ├── GATE_8_3_2_EXECUTION_REPORT.md
│   │   ├── GATE_8_4_EXECUTION_REPORT.md
│   │   └── GATE_8_4_REMEDIATION_EXECUTION_REPORT.md
│   ├── _planning/
│   │   ├── GATE_4_8_GOVERNANCE_ALIGNMENT.md
│   │   ├── GATE_4_9_ENDPOINT_PLAN.md
│   │   ├── GATE_4_9_EXECUTION_CHECKLIST.md
│   │   ├── GATE_4_9_SECURITY_MODEL.md
│   │   ├── GATE_4_9_TEST_PLAN.md
│   │   ├── GATE_4_10_EXECUTION_PLAN.md
│   │   ├── GATE_4_10_FINAL_Scope.md
│   │   ├── GATE_5_0_EXECUTION_PLAN.md
│   │   ├── GATE_5_0_1_TASKS.md
│   │   ├── GATE_5_1_DRAFT_AUTHORIZATION.md
│   │   ├── GATE_5_2_1_DRAFT_AUTHORIZATION.md
│   │   ├── GATE_5_3_DRAFT_AUTHORIZATION.md
│   │   ├── GATE_5_3_EXECUTION_CHECKLIST.md
│   │   ├── GATE_5_3_RISKS.md
│   │   ├── GATE_5_3A_DRAFT_AUTHORIZATION.md
│   │   ├── GATE_5_SCOPE_MAP.md
│   │   ├── GATE_5_TASK_BREAKDOWN.md
│   │   ├── TEST_EXECUTION_CHECKLIST.md
│   │   ├── TEST_HARNESS_PLAN.md
│   │   └── TEST_STRUCTURE_MAP.md
│   ├── _release/
│   │   ├── GATE_9_RELEASE_READINESS_REPORT.md
│   │   ├── GATE_10_STAGING_DEPLOYMENT_PLAN.md
│   │   ├── GATE_10_STAGING_EXECUTION_REPORT.md
│   │   ├── GATE_11_RUNTIME_ENABLEMENT_REPORT.md
│   │   └── GATE_12_BUILD_ENABLEMENT_REPORT.md
│   ├── ARCHITECTURE_MAP.md
│   ├── AUDIT_EVENT_SCHEMA.md
│   ├── AUDIT_INVARIANTS.md
│   ├── AUDIT_REPORT_GOVERNANCE_ALIGNMENT.md
│   ├── AUDIT_REPORT_GOV_5_3A.md
│   ├── AUDIT_SPEC_SUITE.md
│   ├── AUDIT_STOP_RULES.md
│   ├── AUTHORIZATION_STOP_RULES.md
│   ├── CORRELATION_ID_POLICY.md
│   ├── FAIL_CLOSED_MATRIX.md
│   ├── FINAL_ALIGNMENT_REPORT.md
│   ├── FINAL_GOVERNANCE_ALIGNMENT_REPORT.md
│   ├── FORWARD_EXECUTION_MAP.md
│   ├── FUTURE_FEATURE_BACKLOG.md
│   ├── FUTURE_RISKS_AND_DECISIONS.md
│   ├── FUTURE_ROADMAP.md
│   ├── GATE_1_6_CLOSEOUT_REPORT.md
│   ├── GATE_1_7_COMPLETION_REPORT.md
│   ├── GATE_1_7_EXECUTION_AUTHORIZATION.md
│   ├── GATE_1_7_GOVERNANCE_AMENDMENT.md
│   ├── GATE_1_7_RECOVERY_REPORT.md
│   ├── GATE_1_8_COMPLETION_REPORT.md
│   ├── GATE_1_8_EVIDENCE.md
│   ├── GATE_1_9_COMPLETION_REPORT.md
│   ├── GATE_1_9_EVIDENCE.md
│   ├── GATE_1_9_1_COMPLETION_REPORT.md
│   ├── GATE_1_9_1_EVIDENCE.md
│   ├── GATE_1_9_2_COMPLETION_REPORT.md
│   ├── GATE_1_9_2_EVIDENCE.md
│   ├── GATE_1_9_3_COMPLETION_REPORT.md
│   ├── GATE_1_9_3_EVIDENCE.md
│   ├── GATE_2_DECISIONS_AND_DEFERRED.md
│   ├── GATE_3_AUTHORIZATION.md
│   ├── GATE_3_CHECKLIST.md
│   ├── GATE_3_COMPLETION_REPORT.md
│   ├── GATE_3_EVIDENCE.md
│   ├── GATE_3_FINAL_LOCK_DECLARATION.md
│   ├── GATE_4_AUTHORIZATION_DRAFT.md
│   ├── GATE_4_AUTHORIZATION_PLAN.md
│   ├── GATE_4_7_VERIFICATION_REPORT.md
│   ├── GATE_4_10_EVIDENCE.md
│   ├── GATE_5_0_1_EVIDENCE.md
│   ├── GATE_5_2_AUDIT_REPORT.md
│   ├── GATE_5_2_EVIDENCE.md
│   ├── GATE_5_2_RECOVERY_PLAN.md
│   ├── GATE_5_2_1_HYGIENE_EVIDENCE.md
│   ├── GATE_6_AUDIT_CORRELATION_PLAN.md
│   ├── GATE_7_AUTHORIZATION.md
│   ├── GATE_7_CHECKLIST.md
│   ├── GATE_7_PLAN.md
│   ├── GATE_8_AUTHORIZATION.md
│   ├── GATE_8_CHECKLIST.md
│   ├── GATE_8_PLAN.md
│   ├── GATE_8_1_COMPLETION_REPORT.md
│   ├── GATE_8_1_EVIDENCE.md
│   ├── GATE_8_1_EXECUTION_AUTHORIZATION.md
│   ├── GATE_8_2_AUTHORIZATION.md
│   ├── GATE_8_2_CHECKLIST.md
│   ├── GATE_8_2_PLAN.md
│   ├── GATE_9_AUTHORIZATION.md
│   ├── GATE_10_AUTHORIZATION.md
│   ├── GATE_11_AUTHORIZATION.md
│   ├── GATE_12_AUTHORIZATION.md
│   ├── GATE_13_AUTHORIZATION.md
│   ├── GATE_13_EXECUTION_REPORT.md
│   ├── GATE_13_STAGING_DEPLOYMENT_PLAN.md
│   ├── GATE_13_VERIFICATION_EVIDENCE.md
│   ├── IMPLEMENTATION_PLAN_PLATFORM_ADMIN.md
│   ├── IMPLEMENTATION_STRUCTURE.md
│   ├── INTEGRATION_ADAPTER_SPEC.md
│   ├── INTEGRATION_CONTRACT_CORE.md
│   ├── MODULE_CHARTER.md
│   ├── MODULE_DATA_OWNERSHIP.md
│   ├── MODULE_EXECUTION_AUTHORIZATION.md
│   ├── MODULE_GATES_CHECKLIST.md
│   ├── MODULE_INTEGRATION_PLAN.md
│   ├── MODULE_SCOPE_LOCK.md
│   ├── MODULE_SECURITY_LAWS.md
│   ├── PHASE_8_AUDIT_LOGS_ENDPOINT_REPORT.md
│   ├── PHASE_8_AUDIT_LOGS_VERIFICATION_REPORT.md
│   ├── PLATFORM_ADMIN_READINESS.md
│   ├── RBAC_SCOPE_MATRIX.md
│   └── STACK_BOUNDARIES.md
├── guards/
│   ├── deny-all.guard.ts
│   ├── explicit-allow.guard.ts
│   └── index.ts
├── prisma/
│   └── schema.prisma
├── src/
│   ├── audit/
│   │   ├── dto/
│   │   │   └── audit-log.response.dto.ts
│   │   ├── audit.controller.ts
│   │   ├── audit.repository.ts
│   │   └── audit.service.ts
│   ├── core-adapter/
│   │   ├── core.client.ts
│   │   └── core.contract.assert.ts
│   ├── db/
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   ├── internal-users/
│   │   ├── dto/
│   │   │   └── create-internal-user.dto.ts
│   │   ├── internal-user.controller.ts
│   │   ├── internal-user.repository.ts
│   │   └── internal-user.service.ts
│   ├── org-mapping/
│   │   ├── dto/
│   │   │   └── org-mapping.dto.ts
│   │   ├── org-mapping.controller.ts
│   │   ├── org-mapping.repository.ts
│   │   └── org-mapping.service.ts
│   ├── organizations/
│   │   ├── dto/
│   │   │   └── organization.dto.ts
│   │   ├── organization.controller.ts
│   │   ├── organization.repository.ts
│   │   └── organization.service.ts
│   ├── policy/
│   │   ├── data-access.policy.ts
│   │   └── policy.types.ts
│   ├── repositories/
│   │   └── repository.guard.ts
│   ├── security/
│   │   ├── permissions.map.ts
│   │   ├── rbac.guard.ts
│   │   └── roles.enum.ts
│   └── __tests__/
│       └── prisma.wiring.spec.ts
├── tests/
│   ├── integration/
│   │   ├── org-mapping.http.integration.spec.ts
│   │   └── org-mapping.integration.spec.ts
│   ├── non-regression/
│   │   └── build.spec.ts
│   ├── security/
│   │   └── fail-closed.spec.ts
│   ├── unit/
│   │   ├── audit/
│   │   │   └── audit.service.spec.ts
│   │   ├── controllers/
│   │   │   ├── audit.controller.spec.ts
│   │   │   ├── health.controller.spec.ts
│   │   │   ├── internal-user.controller.spec.ts
│   │   │   └── org-mapping.controller.spec.ts
│   │   ├── core-adapter/
│   │   │   ├── core.client.spec.ts
│   │   │   └── core.contract.assert.spec.ts
│   │   ├── db/
│   │   │   └── prisma.wiring.spec.ts
│   │   ├── guards/
│   │   │   ├── deny-all.guard.spec.ts
│   │   │   └── explicit-allow.guard.spec.ts
│   │   ├── internal-users/
│   │   │   ├── internal-user.repository.spec.ts
│   │   │   └── internal-user.service.spec.ts
│   │   ├── module/
│   │   │   └── platform-admin.module.spec.ts
│   │   ├── policy/
│   │   │   └── data-access.policy.spec.ts
│   │   ├── repositories/
│   │   │   └── org-mapping.repository.spec.ts
│   │   ├── security/
│   │   │   └── rbac.guard.spec.ts
│   │   └── services/
│   │       └── org-mapping.service.spec.ts
│   └── jest.setup.ts
├── index.ts
└── platform-admin.module.ts
```

## Legend

- `src/`: Core logic and feature implementation.
- `governance/`: Documentation, gates, and audit reports.
- `tests/`: Unit and integration test suites.
- `prisma/`: Database schema definitions.
- `guards/`: Global guards (DenyAll, ExplicitAllow).
- `controllers/` & `dto/`: Top-level health check components.

## FORBIDDEN ZONES — DO NOT TOUCH

- **Core**: `Bassan.os Core` (External System).
- **Dependencies**: `package.json`, `package-lock.json` (Root Level).
- **Node Modules**: `node_modules/` (Managed by npm).
