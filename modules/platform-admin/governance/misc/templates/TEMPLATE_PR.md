# PR — [Task ID] [Title]

> [!CAUTION]
> **GOVERNANCE CHECK**: PRs failing to follow this template will be **CLOSED WITHOUT REVIEW**.

## 1. Linkage

- **Task Contract ID**: [Reference the Binding Task Contract]
- **Issue ID**: [Link to Issue]

## 2. Scope Declaration

**I certify that this PR modifies:**

- [ ] ONLY files authorized in the Task Contract.
- [ ] NO forbidden files (`package.json`, Infra, Core).

## 3. Compliance Evidence

- [ ] **Build**: `npm run build` passed locally.
- [ ] **Tests**: `npm run test` passed locally.
- [ ] **Lint**: No new lint errors.
- [ ] **Core**: No unauthorized Core dependencies or assumptions.

## 4. Governance Verification

- [ ] I have NOT included "nice-to-have" refactors.
- [ ] I have NOT modified existing architectural patterns.
- [ ] I have NOT added "TODOs" or technical debt.

## 5. Risk Assessment

- **Breaking Changes**: [YES/NO]
- **Security Impact**: [None/Low/High]
- **Owner Review Required**: [YES - ALWAYS]

---

**Developer Sign-off**: [Username]
