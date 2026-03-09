# forensic-g10-cleanup/04_CHANGELOG_PER_FILE.md

## Client changes (Gate 10.1 only)

### client/src/api/platformAdmin.ts
- `interface InternalUser` → `export interface InternalUser`
- Added `inviteStatus: 'pending' | 'invited' | 'active' | 'expired'` field to InternalUser
- `interface CreateInternalUserDto` → `export interface CreateInternalUserDto`

### client/src/components/InternalUserDetail.tsx
- `(user as any).inviteStatus ?? 'pending'` → `user.inviteStatus ?? 'pending'`
  (cast removed because InternalUser is now properly exported with inviteStatus typed)

### client/src/components/SetPasswordPage.tsx
- `import { useState, useEffect, FormEvent }` → `import { useState, FormEvent }`
  (useEffect was imported but never used)

### client/src/components/OrgMappingSection.tsx
- Added `const isCreating = state === 'creating'` before JSX
- Replaced all 5 occurrences of `state === 'creating'` in JSX with `isCreating`
  (fixes TS2367 narrowing errors — pre-existing issue, not introduced by Gate 10)

## No BFF changes
No server-side code was modified. BFF was already clean.

## No schema changes
Schema, migration files, Dockerfile, railway.json — all unchanged.
