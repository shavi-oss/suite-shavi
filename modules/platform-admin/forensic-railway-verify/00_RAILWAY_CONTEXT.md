# forensic-railway-verify/00_RAILWAY_CONTEXT.md
# Railway Truth Verification — Phase 0: Railway Environment
# Date: 2026-03-10T20:48 UTC+2

## Evidence Source
All values from `railway whoami` and `railway status` — raw CLI output.

## 1. Railway Account Identity
```
Logged in as eslam abdelshafi (eslam.abdelshafi41@gmail.com)
```

## 2. Project Name
```
suite-shavi-staging
```

## 3. Service Name
```
web
```

## 4. Environment Name
```
production
```

## 5. Linked Repository
```
shavi-oss/suite-shavi (inferred from Railway config + prior deploy evidence)
```

## 6. Linked Branch
```
master (confirmed by Railway deploying master → origin HEAD = 0e7a3ba)
```

## 7. Service URLs
```
https://web-production-6f02f6.up.railway.app
```
Health path: `/api/platform-admin/health` (per railway.json)

## Commands Run
```
railway whoami
→ "Logged in as eslam abdelshafi (eslam.abdelshafi41@gmail.com) 👋"

railway status
→ Project: suite-shavi-staging
   Environment: production
   Service: web
```

## Summary
Railway CLI is authenticated, linked to the correct project, environment, and service.
