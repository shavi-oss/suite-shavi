# forensic-g10/02_LOCAL_VERIFICATION.md

## BFF TypeScript compile
```
npx tsc -p modules/platform-admin/tsconfig.bff.json
Exit: 0
```
After prisma generate (v6.19.2) regenerated client with new fields.

## Client Vite Build
```
> vite build
✓ 48 modules transformed.
dist/platform-admin/client/index.html   0.35 kB │ gzip: 0.25 kB
dist/platform-admin/client/assets/index-CUAQ_pCv.js  244.45 kB │ gzip: 70.93 kB
✓ built in 2.50s
Exit: 0
```

## Prisma Generate
```
✔ Generated Prisma Client (v6.19.2) to .\..\..\node_modules\.prisma\client in 325ms
Exit: 0
```
New fields (passwordHash, inviteTokenHash, inviteExpiresAt, inviteStatus) in generated types.
New enum values (invite, redeem in ActionType; InviteStatus enum) in generated types.
