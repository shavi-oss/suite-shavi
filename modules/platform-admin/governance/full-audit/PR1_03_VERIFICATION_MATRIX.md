# PR-1: Verification Matrix

| Check                                                    | Command                                                  | Expected                       | Actual                                                                                                  | Status     |
| -------------------------------------------------------- | -------------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------- | ---------- |
| **git status**                                           | `git status --porcelain`                                 | Only expected files changed    | `M platform-admin.module.ts`, `M package.json`, `M package-lock.json`, `M core.contract.assert.spec.ts` | ✅ PASS    |
| **Client Typecheck**                                     | `npx tsc --noEmit -p tsconfig.json` (in `client/`)       | Exit 0                         | Exit 0                                                                                                  | ✅ PASS    |
| **Test Suite**                                           | `npm run test:platform-admin`                            | All green                      | 26 suites, 221 tests, exit 0                                                                            | ✅ PASS    |
| **ExplicitAllowGuard count**                             | `grep -r ExplicitAllowGuard src/`                        | Unchanged                      | 2 usages in auth.controller.ts only (login, logout, me)                                                 | ✅ PASS    |
| **DenyAllGuard unchanged**                               | `git diff platform-admin.module.ts \| grep DenyAllGuard` | Not removed                    | Still wired as `APP_GUARD`                                                                              | ✅ PASS    |
| **API path exclude**                                     | ServeStaticModule config                                 | `exclude: ['/api*']`           | `exclude: ['/api*']`                                                                                    | ✅ PASS    |
| **`GET /`**                                              | Deploy: navigate to deployment URL                       | Returns `index.html` React app | PENDING deploy _(local pre-build confirmed)_                                                            | ⏳ PENDING |
| **`GET /api/platform-admin/health`**                     | `curl` post-deploy                                       | 200                            | PENDING deploy                                                                                          | ⏳ PENDING |
| **`GET /api/platform-admin/organizations`** (no session) | `curl` without cookie                                    | 401 (fail-closed)              | PENDING deploy                                                                                          | ⏳ PENDING |

**All locally-verifiable checks PASS.**
Runtime behavior checks require the Railway deployment to complete (triggered by `git push`).
