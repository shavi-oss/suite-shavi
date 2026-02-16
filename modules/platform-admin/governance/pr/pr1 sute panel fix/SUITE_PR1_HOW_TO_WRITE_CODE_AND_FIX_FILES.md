# Suite PR-1 — How to Write the Code (Exact File Fix, Code-Sourced)
Repo: `shavi-oss/suite-shavi`  
Module: `modules/platform-admin`  
Scope: **Fix exactly the files that participate in PR-1** (no guessing).

> Source references are from current repo code:
> - `OrgMappingController` currently reads Core JWT from `authorization` header fileciteturn27file0L49-L54
> - `SessionGuard` already attaches `coreJwt` server-side on the request object fileciteturn27file1L33-L43
> - `RbacGuard` requires `request.user` and denies if missing fileciteturn27file2L58-L69

---

## 0) Objective (PR-1)
- Stop reading Core JWT from client headers (`authorization`).
- Make org-mapping routes require `SessionGuard` so Core JWT comes from server-side storage and is set as `req.coreJwt`.
- Keep RBAC enforcement unchanged.

---

## 1) Files to fix (actual paths)
### ✅ Modify (ONLY ONE FILE)
1) `modules/platform-admin/src/org-mapping/org-mapping.controller.ts` fileciteturn27file0L1-L57

### 🔁 Used as dependencies (NO CHANGES in PR-1)
- `modules/platform-admin/src/auth/session.guard.ts` (provides `req.coreJwt`) fileciteturn27file1L33-L43
- `modules/platform-admin/src/security/rbac.guard.ts` (requires `req.user`) fileciteturn27file2L58-L69

**STOP condition:** if you need to modify any other file → STOP and report why.

---

## 2) Exact changes required in the controller (3 edits)

### Change A — Import `SessionGuard`
Current imports include `RbacGuard` and `randomUUID` fileciteturn27file0L15-L17.
Add one import line for SessionGuard:
```ts
import { SessionGuard } from '../auth/session.guard';
```

### Change B — Require SessionGuard before RBAC
Current decorator is:
```ts
@UseGuards(RbacGuard)
```
Change to:
```ts
@UseGuards(SessionGuard, RbacGuard)
```

**Why order matters:** SessionGuard must run first so `req.coreJwt` is available for the controller method.

### Change C — Source `coreJwt` from `req.coreJwt`
Current code reads:
```ts
const coreJwt = req.headers['authorization']?.replace('Bearer ', '');
```
Replace with:
```ts
const coreJwt = req.coreJwt;
```

Keep the existing fail-closed check the same (do not refactor error handling):
```ts
if (!coreJwt) {
  throw new Error('Core JWT is required for org mapping validation');
}
```

---

## 3) The corrected file (full reference implementation)
This is the expected **final shape** of the file after PR-1 (only the minimal changes applied).

```ts
import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { OrgMappingService } from './org-mapping.service';
import {
  CreateOrgMappingDto,
  OrgMappingResponseDto,
} from './dto/org-mapping.dto';
import { RbacGuard, RequirePermission } from '../security/rbac.guard';
import { Resource, Action } from '../security/permissions.map';
import { SessionGuard } from '../auth/session.guard';
import { randomUUID } from 'crypto';

/**
 * Org Mapping Controller
 * 
 * Scope: LOCKED per MODULE_SCOPE_LOCK.md Section 2.2
 * Endpoints: 3 ONLY
 * Evidence: MODULE_SCOPE_LOCK.md Lines 66-70
 * 
 * MUST: Forward Core JWT for validation
 * MUST: Fail-closed if Core validation fails
 * MUST: Enforce RBAC on all endpoints
 * 
 * Gate 5: RBAC enforcement added per RBAC_SCOPE_MATRIX.md Section 2.2
 */

@Controller('api/platform-admin/org-mappings')
@UseGuards(SessionGuard, RbacGuard)
export class OrgMappingController {
  constructor(private readonly orgMappingService: OrgMappingService) {}

  /**
   * POST /api/platform-admin/org-mappings
   * Link Suite org ↔ Core org
   */
  @Post()
  @RequirePermission(Resource.ORG_MAPPINGS, Action.WRITE)
  async create(
    @Body() dto: CreateOrgMappingDto,
    @Req() req: any,
  ): Promise<OrgMappingResponseDto> {
    const correlationId = req.headers['x-correlation-id'] || randomUUID();
    const userId = req.user.id;
    const coreJwt = req.coreJwt;

    if (!coreJwt) {
      throw new Error('Core JWT is required for org mapping validation');
    }

    return this.orgMappingService.create(dto, userId, coreJwt, correlationId);
  }

  /**
   * GET /api/platform-admin/org-mappings
   * List all mappings
   */
  @Get()
  @RequirePermission(Resource.ORG_MAPPINGS, Action.READ)
  async findAll(): Promise<OrgMappingResponseDto[]> {
    return this.orgMappingService.findAll();
  }

  /**
   * GET /api/platform-admin/org-mappings/:suiteOrgId
   * Get mapping for Suite org
   */
  @Get(':suiteOrgId')
  @RequirePermission(Resource.ORG_MAPPINGS, Action.READ)
  async findBySuiteOrgId(
    @Param('suiteOrgId') suiteOrgId: string,
  ): Promise<OrgMappingResponseDto> {
    return this.orgMappingService.findBySuiteOrgId(suiteOrgId);
  }
}
```

---

## 4) Critical correctness constraints (do not violate)
### 4.1 Do NOT change how RBAC gets `user`
`RbacGuard` explicitly reads `request.user` and fails closed if missing or missing `role` fileciteturn27file2L58-L69.

This PR **does not** redesign auth. Therefore:
- Keep `const userId = req.user.id;` unchanged.
- If your runtime shows `req.user` is missing, **STOP** (that is a different issue and needs a separate PR/plan).

### 4.2 Do NOT reintroduce Authorization-based Core JWT
Core JWT must not come from:
- `req.headers.authorization`
- any client-managed storage
- any UI token forwarding

Only source allowed for PR-1 is `req.coreJwt` set by `SessionGuard` fileciteturn27file1L33-L43.

---

## 5) Verification requirements (must be recorded)
After editing, these commands must be run and their outputs recorded in your execution report:

```bash
git status --porcelain
git diff --name-only
git diff
```

Expected:
- Only `modules/platform-admin/src/org-mapping/org-mapping.controller.ts` appears in `git diff --name-only`.

Then:

```bash
cd modules/platform-admin
npx tsc --noEmit
npm run build
```

And smoke test:
- Call `POST /api/platform-admin/org-mappings` **without** Authorization header.
- Confirm it works when a valid session exists and SessionGuard can retrieve Core JWT; otherwise, SessionGuard returns 401 fail-closed fileciteturn27file1L18-L39.

---

## 6) What to document (mandatory)
Use the template:
- `SUITE_PR1_EXECUTION_DOCUMENTATION_TEMPLATE.md`

Attach:
- `git diff --cached`
- `tsc` / build / tests outputs (or brief PASS statements with command list)

---

END
