# 04_CHANGELOG_PER_FILE.md

## Gate 1 — Commit 421fc19 `suite-repair-g1-db-safe`

### Dockerfile

```diff
-# Runtime: prisma migrate deploy (non-interactive) → node dist/...
+# Runtime: node dist/... only. Schema provisioned once by operator.

-CMD ["sh", "-c", "npx prisma db push --schema=... --accept-data-loss || true && node dist/..."]
+CMD ["node", "dist/modules/platform-admin/host/main.js"]
```

### docs/runbook/DB_PROVISIONING.md [NEW]

Documents one-shot operator provisioning. Prohibits `--accept-data-loss` and `|| true`.

---

## Gate 2 — Commit 394fa22 `suite-repair-g2-rbac-real`

### modules/platform-admin/src/auth/session.guard.ts

```diff
-import { JwtStorageService } from './jwt-storage.service';
+import { InternalUserRepository } from '../internal-users/internal-user.repository';
+import { UserStatus } from '@prisma/client';

 constructor(
-  private readonly jwtStorageService: JwtStorageService,
+  private readonly internalUserRepository: InternalUserRepository,
 ) {}

-canActivate(context) {
+async canActivate(context): Promise<boolean> {
   ...
-  (request as any).user = { id: userId, role: 'platform_admin', status: 'active' };
-  const coreJwt = this.jwtStorageService.get(userId);
-  if (!coreJwt) throw UnauthorizedException...
-  (request as any).coreJwt = coreJwt;
+  const operator = await this.internalUserRepository.findByEmail(userId);
+  if (!operator) throw UnauthorizedException...
+  if (operator.status === UserStatus.deactivated) throw UnauthorizedException...
+  (request as any).user = { id: operator.id, role: operator.role, status: operator.status };
```

### modules/platform-admin/platform-admin.module.ts

```diff
-import { JwtStorageService } from './src/auth/jwt-storage.service';
+import { SessionGuard } from './src/auth/session.guard';
...
-    JwtStorageService,
+    SessionGuard,
```

### docs/runbook/OPERATOR_SEED.md [NEW]

Operator seeding command (psql + Prisma ts-node). Never run at startup.

---

## Gate 3 — Commit 4f75d2a `suite-repair-g3-corejwt-real`

### modules/platform-admin/src/auth/auth.controller.ts

```diff
-import { JwtStorageService } from './jwt-storage.service';
-  private readonly jwtStorageService: JwtStorageService,
...
-  // Store sentinel coreJwt
-  this.jwtStorageService.set(userId, `platform-admin-session:${userId}`);
...
-  const userId = this.sessionService.validateSession(sessionId);
-  if (userId) this.jwtStorageService.clear(userId);
```

No `coreJwt` in this file. Session cookie only.
