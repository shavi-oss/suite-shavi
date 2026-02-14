# Gate 2 — Decisions and Deferred Items

## Document Control

| Attribute | Value                                   |
| --------- | --------------------------------------- |
| Status    | FINAL — GATE 2                          |
| Mode      | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Date      | 2026-02-06                              |

---

## Deferred Items

| Item                                  | Reason for Deferral                         | Governance Justification                                                                                               | Future Gate                          | Reference File                                  |
| ------------------------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ----------------------------------------------- |
| Template Publishing                   | Core v1 has no template endpoints           | CORE_CONTRACT_V1_EXTRACT.md § A (Line 33): "Template publish endpoints (no controller found)"                          | Gate 5.5 or later (requires Core v2) | CORE_V1_INTEGRATION_LOCK.md § 4.1, Line 139-154 |
| Service-to-Service Authentication     | Core v1 has no service token contract       | CORE_V1_INTEGRATION_LOCK.md § 5.1: "No service token contract, no OAuth2 client credentials flow"                      | Gate 5.6 or later (requires Core v2) | CORE_V1_INTEGRATION_LOCK.md § 5.1, Line 159-174 |
| Token Refresh                         | Core v1 has no refresh endpoint             | CORE_CONTRACT_V1_EXTRACT.md § A (Line 34): "Refresh token / Logout endpoints (not in auth.controller.ts)"              | Gate 5.6 or later (requires Core v2) | CORE_V1_INTEGRATION_LOCK.md § 5.2, Line 177-190 |
| Correlation ID Middleware (Core-side) | Core v1 has no correlation middleware       | CORE_CONTRACT_V1_EXTRACT.md § D.4 (Line 476-486): "No middleware/interceptor reading x-request-id or x-correlation-id" | Gate 5.6 or later (requires Core v2) | CORE_V1_INTEGRATION_LOCK.md § 5.3, Line 193-208 |
| Multi-Endpoint Integration            | Governance scope limited to single endpoint | Gate 2 scope: docs-only, minimal integration contract (organization validation only)                                   | Gate 3 or Gate 5.3                   | INTEGRATION_CONTRACT_CORE.md § 1                |
| RBAC Implementation                   | Deferred to execution gates                 | Gate 2 is docs-only, no code/RBAC implementation allowed                                                               | Gate 5.3                             | GATE_2_DECISIONS_AND_DEFERRED.md                |
| Audit Logging Implementation          | Deferred to execution gates                 | Gate 2 is docs-only, no code implementation allowed                                                                    | Gate 5.3                             | GATE_2_DECISIONS_AND_DEFERRED.md                |
| Database Migrations                   | Deferred to execution gates                 | Gate 2 is docs-only, no Prisma/migrations allowed                                                                      | Gate 5.3                             | GATE_2_DECISIONS_AND_DEFERRED.md                |

---

## Governance Decisions

**Decision 1**: Limit Core integration to single endpoint (`GET /api/v1/organizations/:id`)  
**Rationale**: Minimal contract lock, fail-closed governance  
**Evidence**: INTEGRATION_CONTRACT_CORE.md § 1

**Decision 2**: Mark all Core v1 unsupported capabilities as NOT AVAILABLE  
**Rationale**: Evidence-based contract, no assumptions  
**Evidence**: CORE_V1_INTEGRATION_LOCK.md § 5

**Decision 3**: Defer all code implementation to future gates  
**Rationale**: Gate 2 is docs-only  
**Evidence**: Gate 2 execution prompt

---

**END OF DECISIONS**
