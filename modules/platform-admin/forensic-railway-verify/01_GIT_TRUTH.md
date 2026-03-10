# forensic-railway-verify/01_GIT_TRUTH.md
# Railway Truth Verification — Phase 1: Git Truth
# Date: 2026-03-10

## All values from raw git commands. No assumptions.

## 1. Current Branch
```
master
```

## 2. Current HEAD SHA
```
0e7a3ba12a23304eb8437218ae87ac97705466da
fix(docker): exclude stale nested prisma client that shadowed runtime enums
```

## 3. Latest Pushed SHA on origin
```
git ls-remote origin HEAD
→ 0e7a3ba12a23304eb8437218ae87ac97705466da  HEAD
```
**Local HEAD = origin HEAD = 0e7a3ba. Fully pushed. No uncommitted changes.**

## 4. Working Tree Status
```
git status --short
→ ?? variables.txt   (untracked temp file, not in scope)
```
**Working tree is clean. No modified tracked files.**

## 5. Tag `suite-workspace-g10-fix-stable`
```
git rev-list -n 1 suite-workspace-g10-fix-stable
→ 0e7a3ba12a23304eb8437218ae87ac97705466da
```
**Tag points to HEAD. Tag = current commit = latest pushed.**

## 6. Recent Commit History
```
0e7a3ba  fix(docker): exclude stale nested prisma client that shadowed runtime enums
9579f35  docs(platform-admin): workspace truth reconciliation audit — APPROVE
03d867e  docs(platform-admin): Gate 10 Repair audit + governance/forensic-cred baseline
63f59a0  docs(platform-admin): Gate 10.1 forensic evidence
480ebc6  fix(platform-admin): clean up invite/auth schema and type consistency (Gate 10.1)
c083800  docs(g10): complete forensic evidence
```

## 7. Tag Inventory (most recent)
```
suite-workspace-g10-fix-stable  ← HEAD (0e7a3ba)
suite-workspace-reconcile-stable
suite-repair-g10-stable
suite-gate10.1-stable
suite-gate10-stable
gate9-internal-users
gate8-org-mapping
suite-gate7-stable
```

## Conclusion
Latest pushed commit = local HEAD = tag `suite-workspace-g10-fix-stable` = `0e7a3ba`.
This is the intended deployment target. Working tree is clean.
