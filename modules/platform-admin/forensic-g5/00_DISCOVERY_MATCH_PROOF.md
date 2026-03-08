# 00_DISCOVERY_MATCH_PROOF.md — Gate 5

**Date**: 2026-03-02  
**Result**: ⛔ STOP — Cryptographic Mismatch

## Evidence

### Live JWKS (kid=admin-key-2)

```
GET https://jwks-server-production.up.railway.app/.well-known/jwks.json
n = 2dJl85fIqWpuHeitAOuvalzdFlo8QXOf5Z2Nu_kdFEoSxZFwUKt4YiZpkXq-oPeodrlNROZcyJ9q4v9n2H9I1...
e = AQAB
```

### Derived from JWKS_ADMIN_PRIVATE (jwks-server Railway env)

```
railway run node -e "... createPublicKey(JWKS_ADMIN_PRIVATE).export({format:'jwk'}) ..."
DERIVED_N = yojyjuvGcMzuqFf5xVLxzwKNc3e5MeTt3GiVhfiYl5pgNMPIJhZQSxU3_dhCIY4WRM_gfYq3tghrvPvcG...
DERIVED_E = AQAB
```

### Comparison

`LIVE_N == DERIVED_N`: **FALSE** ❌

The first characters differ: `2dJl…` vs `yojy…`.

## Conclusion

`JWKS_ADMIN_PRIVATE` in the jwks-server Railway service does **NOT** correspond to the public key published at `kid=admin-key-2`. The keypair is mismatched — either:

- The private key was regenerated but the JWKS was not updated, OR
- The JWKS was updated and the private key env var was not

## Rotation Plan (New Kid)

### Step 1 — Generate new RSA-2048 keypair locally

```powershell
node -e "
const {generateKeyPairSync} = require('crypto');
const {privateKey, publicKey} = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {type:'spki', format:'pem'},
  privateKeyEncoding: {type:'pkcs8', format:'pem'},
});
require('fs').writeFileSync('new-admin-private.pem', privateKey);
require('fs').writeFileSync('new-admin-public.pem', publicKey);
console.log('Keys written.');
"
```

### Step 2 — Derive JWK with new kid `admin-key-3`

```powershell
node -e "
const {createPublicKey} = require('crypto');
const pem = require('fs').readFileSync('new-admin-public.pem','utf8');
const jwk = createPublicKey(pem).export({format:'jwk'});
const entry = {...jwk, use:'sig', kid:'admin-key-3', alg:'RS256'};
console.log(JSON.stringify({keys:[entry]}, null, 2));
"
```

### Step 3 — Update JWKS server

Replace `jwks.json` in the jwks-server repo with the new key (kid=admin-key-3).
Deploy the jwks-server.

### Step 4 — Set Railway vars on Suite `web` service

```powershell
# In BassanOs/backend dir (has jwks-server Railway link):
$b64 = [Convert]::ToBase64String([System.IO.File]::ReadAllBytes('new-admin-private.pem'))
# In suite-shavi dir (has web Railway link):
railway variables --service web set "PLATFORM_ADMIN_JWT_PRIVATE_KEY_PEM_B64=$b64"
railway variables --service web set "PLATFORM_ADMIN_JWT_KID=admin-key-3"
```

### Step 5 — Set JWKS_ADMIN_PRIVATE on jwks-server service (update stale key)

```powershell
# From BassanOs/backend (jwks-server Railway link):
$newPem = (Get-Content new-admin-private.pem -Raw)
railway variables set "JWKS_ADMIN_PRIVATE=$newPem"
```

### Step 6 — Delete local `.pem` files

```powershell
Remove-Item new-admin-private.pem, new-admin-public.pem
```

### Step 7 — Gate 5 implementation resumes with kid=admin-key-3
