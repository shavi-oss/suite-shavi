# MODULES MAP — Platform Admin

(modules/platform-admin)

## Logical Grouping Table

| Area                         | Path(s)                                      | Responsibility                                                                     | Gate Anchors  |
| :--------------------------- | :------------------------------------------- | :--------------------------------------------------------------------------------- | :------------ |
| **Governance**               | `modules/platform-admin/governance/`         | Governance documentation, gates, audit evidence, and execution reports.            | Gate 1-13     |
| **Guards (Global)**          | `modules/platform-admin/guards/`             | Global application guards (DenyAll, ExplicitAllow) for fail-closed enforcement.    | Gate 4.5      |
| **Controllers (Root)**       | `modules/platform-admin/controllers/`        | Top-level controllers (HealthController) for basic connectivity checks.            | Gate 4.9      |
| **DTO (Root)**               | `modules/platform-admin/dto/`                | Data Transfer Objects for root controllers.                                        | Gate 4.9      |
| **Prisma**                   | `modules/platform-admin/prisma/`             | Database schema definitions for the module.                                        | Gate 1.9      |
| **Feature — Audit**          | `modules/platform-admin/src/audit/`          | Audit logging service, repository, and controller (Note: Controller not exported). | NOT AVAILABLE |
| **Feature — Core Adapter**   | `modules/platform-admin/src/core-adapter/`   | **STRICT** Core API client adapter. Encapsulates all Core communication.           | Gate 2        |
| **Feature — DB**             | `modules/platform-admin/src/db/`             | Prisma module and service instantiation.                                           | Gate 1.9      |
| **Feature — Internal Users** | `modules/platform-admin/src/internal-users/` | Management of internal platform admin users.                                       | Gate 1.7      |
| **Feature — Org Mapping**    | `modules/platform-admin/src/org-mapping/`    | Mapping between Core Organizations and Suite Organizations.                        | Gate 3        |
| **Feature — Organizations**  | `modules/platform-admin/src/organizations/`  | Local organization management and repository.                                      | Gate 3        |
| **Feature — Policy**         | `modules/platform-admin/src/policy/`         | Data access policies and types.                                                    | NOT AVAILABLE |
| **Feature — Repositories**   | `modules/platform-admin/src/repositories/`   | Base repository guards/mixins.                                                     | NOT AVAILABLE |
| **Feature — Security**       | `modules/platform-admin/src/security/`       | RBAC implementation, permissions map, and roles enum.                              | Gate 8        |
| **Tests**                    | `modules/platform-admin/tests/`              | Unit, Integration, Security, and Non-Regression tests.                             | All Gates     |

## Core Claims

- **Core Integration**: Strictly limited to `src/core-adapter/core.client.ts`.
- **Status**: **EVIDENCE-ONLY**. No other path is allowed to import or call Core.
- **Verification**: Validated via `CoreClient` usage only. Any other claim is **NOT AVAILABLE**.
