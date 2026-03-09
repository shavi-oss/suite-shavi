# 04_CHANGELOG_PER_FILE.md — Gate 4

## Commit 45e1ac1 `suite-gate-cred-20260301`

### modules/platform-admin/src/auth/auth.service.ts [NEW]

```diff
+ Injectable AuthService with validateCredentials(email, password): Promise<string>
+ - Loads OPERATOR_CREDENTIALS env var (pipe-delimited: email|salt:hash)
+ - fail-closed: missing env → 401
+ - InternalUserRepository.findByEmail(email) → 401 if missing/deactivated
+ - crypto.scrypt + timingSafeEqual (constant-time password verify)
+ - dummyVerify() on fast-reject paths (timing parity)
+ - Returns operator.id (UUID) on success
```

### modules/platform-admin/src/auth/auth.controller.ts [MODIFIED]

```diff
-import { ... } from '@nestjs/common';
+import { AuthService } from './auth.service';

-  constructor(private readonly sessionService: SessionService) {}
+  constructor(
+    private readonly sessionService: SessionService,
+    private readonly authService: AuthService,
+  ) {}

-  login(@Body() loginDto: LoginDto, ...) {
+  async login(@Body() loginDto: LoginDto, ...) {
-    const userId = loginDto.email;
+    const operatorId = await this.authService.validateCredentials(
+      loginDto.email, loginDto.password,
+    );
-    const sessionId = this.sessionService.createSession(userId);
+    const sessionId = this.sessionService.createSession(operatorId);
```

### modules/platform-admin/src/auth/session.guard.ts [MODIFIED]

```diff
-    const operator = await this.internalUserRepository.findByEmail(userId);
+    const operator = await this.internalUserRepository.findById(userId);
```

Session now stores operator UUID — guard looks up by ID not email.

### modules/platform-admin/platform-admin.module.ts [MODIFIED]

```diff
+import { AuthService } from './src/auth/auth.service';
+    AuthService,
```

### scripts/hash-password.js [NEW]

Operator utility: `node scripts/hash-password.js <password>` → `salt:hash` entry for OPERATOR_CREDENTIALS.

---

## Commit bf32805 (follow-up format fix)

### modules/platform-admin/src/auth/auth.service.ts [MODIFIED]

```diff
- JSON.parse(credsRaw)  // Railway CLI strips JSON quotes → parse failure
+ pipe-delimited parser: email|salt:hash (comma-separated for multiple)
```

Same security model; no JSON quoting dependency.
