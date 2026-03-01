# 01_CODE_TRUTH.md — Current Login Flow

## Login Handler: `auth.controller.ts`

```
POST /auth/login
  ← receives LoginDto { email, password }
  ← userId = loginDto.email       ← NO validation of email existence
  ← sessionService.createSession(userId)
  ← sets Set-Cookie: sessionId=<uuid>; HttpOnly; Secure; SameSite=Strict
  ← returns { message: 'Login successful' }
```

**Password field: completely ignored. Any email/password returns 200.**

## SessionGuard (used on protected routes — NOT on login itself)

```
  ← sessionId cookie present?       → 401 if not
  ← sessionService.validateSession  → 401 if expired
  ← internalUserRepository.findByEmail(userId)  → 401 if not found
  ← operator.status === active      → 401 if deactivated
  ← attaches request.user = { id, role, status }
```

SessionGuard does verify the operator exists and is active, but only **after** login.
A valid session with an unknown email is still correctly rejected by SessionGuard.

## InternalUser DB Schema

```prisma
model InternalUser {
  id        String     @id
  email     String     @unique
  name      String
  role      UserRole
  status    UserStatus
  createdAt DateTime
  updatedAt DateTime
  createdBy String
  @@map("internal_users")
}
```

**No password column.** Option B env-based allowlist is the only valid path.

## Required Env Var (new — must be added to Railway)

```
OPERATOR_CREDENTIALS = {"admin@bassan.io":"<16-byte-hex-salt>:<64-byte-hex-hash>"}
```

Hash format: `scrypt(password, salt, 64)` → hex. Salt is 16 random bytes → hex.

## Fix Location

- **New**: `src/auth/auth.service.ts` — `validateCredentials(email, password)`
- **Modify**: `src/auth/auth.controller.ts` — call `authService.validateCredentials` before `createSession`
- **Modify**: `platform-admin.module.ts` — add `AuthService` to providers
