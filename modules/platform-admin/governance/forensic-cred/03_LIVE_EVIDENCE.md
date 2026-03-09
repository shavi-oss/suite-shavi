# 03_LIVE_EVIDENCE.md — Gate 4

**Gate**: 4  
**Commits**: 45e1ac1 (gate impl) + bf32805 (pipe-delimited format fix)  
**Tag**: `suite-gate-cred-20260301`  
**Result**: ✅ PASS

## Curl Evidence

### HEALTH

```
HTTP/1.1 200 OK
```

### A. Wrong password — known operator email

```
HTTP/1.1 401 Unauthorized
{"message":"Unauthorized","error":"Unauthorized","statusCode":401}
```

✅ No "wrong password" vs "wrong email" discrimination — generic 401.

### A2. Unknown email

```
HTTP/1.1 401 Unauthorized
{"message":"Unauthorized","error":"Unauthorized","statusCode":401}
```

✅ Same message as wrong password — no enumeration.

### B. Valid credentials (`admin@bassan.io` / `TestPass123!@#`)

```
HTTP/1.1 200 OK
Set-Cookie: sessionId=40fa0e04-6a0e-48f7-b52a-5cf80edea992; Max-Age=900; Path=/;
            Expires=Sun, 01 Mar 2026 09:15:08 GMT; HttpOnly; Secure; SameSite=Strict
{"message":"Login successful"}
```

✅ Cookie: HttpOnly (JS cannot access), Secure, SameSite=Strict.  
✅ No JWT/token in response body or headers.

### B2. GET /auth/session (with cookie)

```
HTTP/1.1 200 OK
```

### B3. GET /organizations (with cookie)

```
HTTP/1.1 200 OK
```

### B4. GET /internal-users (with cookie)

```
HTTP/1.1 200 OK
```

### C. No JWT in login headers

```
(empty — no Authorization/x-jwt/bearer header present)
```

✅ No token of any kind exposed to client.

## STOP Conditions — All Clear

- ✅ Wrong creds always 401
- ✅ Missing/disabled operator 401
- ✅ Valid creds succeed → read-only screens work
- ✅ No new dependencies added (`crypto`, `util` = Node built-ins)
- ✅ No token exposed client-side
- ✅ No default password / insecure fallback
- ✅ DenyAllGuard still active (health endpoint bypasses at Express layer)
