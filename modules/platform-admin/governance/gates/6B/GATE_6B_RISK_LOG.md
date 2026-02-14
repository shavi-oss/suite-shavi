# Gate 6B — Risk Log

## Status: ACTIVE

## Risk Level: P1 (Critical Security)

---

### Risk 1: Missing Dependencies (REALIZED BLOCKER)

**Description**: Required libraries (`passport`, `passport-jwt`) are missing from `package.json`.
**Impact**: Impossible to verify JWT signature securely without introducing new dependencies.
**Mitigation**:

- **Strict Block**: Phase 2 execution is HALTED.
- **Resolution**: Initiate a new gate to authorize dependency addition.
- **Fail-Closed**: Do not attempt manual JWT parsing (insecure).

### Risk 2: Unproven Claims (Roles)

**Description**: Core Contract v1 does not prove `roles` or `permissions` in JWT payload.
**Impact**: RBAC cannot be implemented based on JWT claims.
**Mitigation**:

- **Scope Limit**: wiring limited to `sub`, `email`, `organizationId` ONLY.
- **Deferred**: RBAC implementation deferred to Gate 6C (or later, pending proof).

### Risk 3: Implicit Auth Wiring

**Description**: Framework auto-injection risks magic behavior.
**Mitigation**:

- **Explicit Only**: Use `JwtStrategy` with explicit `SessionGuard` call.
- **Verify**: Audit code for `@CurrentUser` or similar magic decorators (Forbidden).

Risk 4: Bypass of Global DenyAllGuard
Mitigation: JwtStrategy must NOT replace APP_GUARD.
---

**Residual Risk**: High (Due to Blocker). Execution Halted.
