# Gate 5.0.1 — Database Tooling Bootstrap

## Document Control

| Attribute      | Value                                   |
| -------------- | --------------------------------------- |
| Module Name    | platform-admin                          |
| Document Title | GATE_5_0_1_TASKS                        |
| Repo           | Suite (Layer / Product Repo)            |
| Status         | TEMPORARY — TASK DECOMPOSITION          |
| Execution Mode | STRICT · FAIL-CLOSED · GOVERNANCE-FIRST |
| Authority      | Governance Authority (Layer)            |
| Effective Date | 2026-01-30                              |

---

## Purpose

Decompose Gate 5.0.1 (Database Tooling Bootstrap) into concrete, executable tasks.

**Gate Objective**: Bootstrap minimal Prisma tooling for Suite layer. Infrastructure only, no features.

---

## Task 1: Install Prisma Dependencies

**Goal**: Add Prisma to package.json

**Inputs**:

- Current package.json (no DB deps)
- Gate 5.0.1 authorization approved

**Outputs**:

- `package.json` updated with:
  - `"prisma"` in devDependencies
  - `"@prisma/client"` in dependencies
- `package-lock.json` updated
- `node_modules` updated (via `npm install`)

**Commands**:

```bash
npm install --save-dev prisma
npm install @prisma/client
```

**Stop Conditions**:

- If any other dependency is added beyond prisma + @prisma/client → STOP
- If npm install fails → STOP

---

## Task 2: Create Prisma Schema Baseline

**Goal**: Create minimal Prisma schema with Organization model only

**Inputs**:

- Prisma dependencies installed
- MODULE_INTEGRATION_PLAN.md (context only, no execution)

**Outputs**:

- `prisma/schema.prisma` created with:
  - datasource db (provider: postgresql, url: env("DATABASE_URL"))
  - generator client (provider: prisma-client-js)
  - enum OrganizationStatus { active, suspended }
  - model Organization (id, name, status, createdAt, updatedAt, suspendedAt)

**Stop Conditions**:

- If any model beyond Organization is added → STOP
- If any foreign keys or relations are added → STOP
- If any Core integration references are added → STOP

---

## Task 3: Create Environment Template

**Goal**: Create .env.example with DATABASE_URL placeholder

**Inputs**:

- Prisma schema created

**Outputs**:

- `.env.example` created with:
  ```
  DATABASE_URL=
  ```
- NO real connection strings
- NO secrets

**Stop Conditions**:

- If .env (real file) is created with secrets → STOP
- If .env is committed to git → STOP

---

## Task 4: Run Initial Migration

**Goal**: Generate Prisma migration baseline

**Inputs**:

- Prisma schema created
- DATABASE_URL configured (local dev only)

**Outputs**:

- `prisma/migrations/**` directory created
- Migration file: `prisma/migrations/<timestamp>_bootstrap_database/migration.sql`
- Prisma client generated

**Commands**:

```bash
npx prisma migrate dev --name bootstrap_database
```

**Stop Conditions**:

- If migration fails → STOP
- If runtime server is started → STOP
- If any HTTP server is listening → STOP

---

## Task 5: Verify TypeScript Compilation

**Goal**: Ensure Prisma client integrates with TypeScript

**Inputs**:

- Prisma client generated
- Existing TypeScript config

**Outputs**:

- TypeScript compilation passes

**Commands**:

```bash
npx tsc -p .
```

**Stop Conditions**:

- If compilation fails → STOP

---

## Task 6: Verify Tests Still Pass

**Goal**: Ensure existing tests are not broken by Prisma addition

**Inputs**:

- All changes applied
- Existing test suite (24 tests)

**Outputs**:

- All existing tests pass

**Commands**:

```bash
npx jest --config jest.config.cjs
```

**Stop Conditions**:

- If any existing test fails → STOP
- If test count decreases → STOP

---

## Task 7: Create Evidence Pack

**Goal**: Document all commands, outputs, and allowlist compliance

**Inputs**:

- All tasks complete
- All verification passed

**Outputs**:

- `modules/platform-admin/governance/GATE_5_0_1_EVIDENCE.md` created with:
  - Commands executed
  - Pass/fail outputs (short)
  - `git diff --name-only` proof (allowlist compliance)
  - TypeScript compilation result
  - Test results

**Stop Conditions**:

- If any file outside allowlist was touched → STOP

---

## Task 8: Update Readiness Document

**Goal**: Update PLATFORM_ADMIN_READINESS.md with Gate 5.0.1 status

**Inputs**:

- All tasks complete
- Evidence pack created

**Outputs**:

- `modules/platform-admin/governance/PLATFORM_ADMIN_READINESS.md` updated with:
  - Single line: Gate 5.0.1 status + tag placeholder

**Stop Conditions**:

- If any other edits are made beyond single line → STOP

---

## Allowlist Compliance Check

**Files Modified** (expected):

- package.json
- package-lock.json
- prisma/schema.prisma (NEW)
- prisma/migrations/\*\* (NEW)
- .env.example (NEW)
- modules/platform-admin/governance/GATE_5_0_1_EVIDENCE.md (NEW)
- modules/platform-admin/governance/PLATFORM_ADMIN_READINESS.md (MODIFY)
- modules/platform-admin/governance/\_planning/GATE_5_0_1_TASKS.md (this file)

**Any other file** = STOP

---

## Signature

**Status**: TEMPORARY — TASK DECOMPOSITION
**Approval**: Awaiting "EXECUTE" command
**Next Step**: Execute tasks 1-8 after approval
