# forensic-g10-cleanup/02_LOCAL_VERIFICATION.md

## Before fixes — client tsc exit 2 (9 errors)
```
src/components/InternalUserCreate.tsx(2,35): error TS2724: no exported member 'CreateInternalUserDto'
src/components/InternalUserDetail.tsx(2,72): error TS2724: no exported member 'InternalUser'
src/components/InternalUserList.tsx(2,33): error TS2724: no exported member 'InternalUser'
src/components/OrgMappingSection.tsx(156,25): error TS2367: state comparison has no overlap with 'creating'
src/components/OrgMappingSection.tsx(161,23): error TS2367: same
src/components/OrgMappingSection.tsx(164,27): error TS2367: same
src/components/OrgMappingSection.tsx(168,23): error TS2367: same
src/components/OrgMappingSection.tsx(172,14): error TS2367: same
src/components/SetPasswordPage.tsx(1,20): error TS6133: 'useEffect' unused
```

## Fixes Applied
1. `platformAdmin.ts`: export InternalUser (+ inviteStatus field), export CreateInternalUserDto
2. `InternalUserDetail.tsx`: remove `(user as any)` cast → `user.inviteStatus`
3. `SetPasswordPage.tsx`: remove unused `useEffect` from import
4. `OrgMappingSection.tsx`: extract `const isCreating = state === 'creating'` before JSX to fix narrowing

## After fixes — client tsc exit 0
```
CLIENT_TSC_EXIT: 0
```

## BFF TypeScript
```
npx tsc -p tsconfig.bff.json --noEmit
BFF_TSC: 0
```

## Prisma Generate
```
npx prisma generate
PRISMA_EXIT: 0
Generated Prisma Client (v6.19.2) with InviteStatus enum + all invite fields
```

## Client Build (Vite)
```
vite v7.3.1 building client environment for production...
✓ 48 modules transformed.
dist/platform-admin/client/index.html   0.35 kB │ gzip: 0.25 kB
dist/platform-admin/client/assets/index-C97YA8a4.js  244.41 kB │ gzip: 70.94 kB
✓ built in 2.64s
CLIENT_BUILD: 0
```

## All checks summary
| Check | Before | After |
|---|---|---|
| BFF tsc | exit 0 | exit 0 ✅ |
| Client tsc | exit 2 (9 errors) | exit 0 ✅ |
| Client build | exit 0 | exit 0 ✅ |
| Prisma generate | exit 0 | exit 0 ✅ |
