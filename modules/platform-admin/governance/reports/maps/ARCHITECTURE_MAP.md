# ARCHITECTURE MAP — Platform Admin (modules/platform-admin)

## 1) Identity

- **Purpose**: توفير واجهة إدارة مركزية للنظام كمكتبة NestJS (Library).
- **Module Type**: NestJS Module (`PlatformAdminModule`).
- **What it is NOT**: لا تملك نقطة إقلاع (`entrypoint`), لا تعمل كخادم مستقل (`no server`), ليست تطبيقاً (`not an app`).

## 2) Scope Boundary (Allow / Forbid)

- **Allowed Paths**: `modules/platform-admin/**`.
- **Forbidden**: `Basaan.os Core`, `package.json` (root), `package-lock.json`, dependencies.
- **Core Claims Rule**: evidence-only → else NOT AVAILABLE.

## 3) Logical Architecture

- **High-level Components**: Controllers, Services, Repositories, Guards, Adapters.
- **Fail-closed Guard Model**: Deny-by-default.
Tenant/Permission:
- RBAC (Suite-level): VERIFIED — Gate 8.1 Evidence
- Tenant isolation (Core-level): NOT AVAILABLE (no explicit Core Contract assertion)


## 4) Build & Packaging Flow (Authoritative)

- **Pipeline**: Source (`src/`) → `tsc` Build → `dist/`.
- **Packaging Expectation**: `npm pack` → `.tgz` tarball.
- **Consumer Usage**: `npm install` tarball → `import { PlatformAdminModule } from 'suite-shavi'`.
- **Common Failure**: `package.json` "main" mismatch (`index.js` vs `dist/index.js`) causing `MODULE_NOT_FOUND`.

## 5) Runtime Model (Staging/Prod)

- **Clarification**: Consumed by Host App (Passive Library).
- **Staging Validation**: Pack (`.tgz`) → Clean Install → Require/Import verification.
- **Constraints**: No ports opened, no service start command.

## 6) Verification Checklist (Fail-Closed)

- **Minimal Checks**: Build success, Type safety, Export validity.
- **STOP Triggers**: Touch Core, Dependency drift, Main entry mismatch, Unauthorized file creation.

## 7) Gate Anchors (References)

- Gate 12: Build/Emit enablement PASS.
- Gate 13: packaging/import failure STOP.
