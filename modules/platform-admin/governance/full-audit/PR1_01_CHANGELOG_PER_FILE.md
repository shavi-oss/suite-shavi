# PR-1: Changelog Per File

## Files Changed

### 1. `modules/platform-admin/platform-admin.module.ts`

- **Before:** `imports: [PrismaModule]` — served API only, no static file hosting.
- **After:** Added `ServeStaticModule.forRoot({ rootPath: join(__dirname, '../../../../dist/platform-admin/client'), exclude: ['/api*'] })`.
- **Why:** The React SPA build artifact at `dist/platform-admin/client` was untouched by the NestJS server. Navigation to `/` returned a blank 404. ServeStaticModule bridges this gap.
- **Risk:** NONE. The `/api*` exclusion guarantees all API routing is untouched. No guards, controllers, or JWT flows modified.
- **Rollback:** Revert commit `afb2748` and uninstall `@nestjs/serve-static`.

### 2. `package.json`

- **Before:** No `@nestjs/serve-static` dependency.
- **After:** Added `"@nestjs/serve-static": "^5.0.0"` to `dependencies`.
- **Why:** Required for `ServeStaticModule`.
- **Risk:** Minimal. Version 5 is the NestJS 11-compatible release. Peer deps satisfied.

### 3. `package-lock.json`

- **Before/After:** Updated automatically by `npm install` with the single new package.
- **Why:** Deterministic lockfile update for the one added dep.

### 4. `modules/platform-admin/tests/unit/core-adapter/core.contract.assert.spec.ts`

- **Before:** Test asserted allowlist had exactly 1 entry.
- **After:** Test asserts 5 entries (1 original + 4 from Phase C1/C2 lifecycle endpoints).
- **Why:** Phase C1/C2 added 4 new Core endpoints; the spec was never updated. The stale assertion blocked `npm run test:platform-admin` exit 0.
- **Risk:** NONE. Test now accurately reflects the deployed allowlist.
