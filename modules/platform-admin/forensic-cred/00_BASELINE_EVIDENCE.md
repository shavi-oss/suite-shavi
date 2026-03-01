# 00_BASELINE_EVIDENCE.md — Pre-Gate-4 State

**Captured**: 2026-03-01T08:10Z  
**Commit at baseline**: 4f75d2a (`suite-repair-g3-corejwt-real`)

## Curl Evidence

### POST /auth/login — wrong credentials

```
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
{"message":"Login successful"}
```

⚠️ **200 on wrong credentials — no validation at all.**

### Railway env — no OPERATOR_CREDENTIALS

```
(empty — no match for OPERATOR|CRED|PASS|HASH|ALLOW)
```

DB schema has no password column on `InternalUser`.
→ **Option B (env-based allowlist) is required.**
