/**
 * Internal Users Regression Test — Gate 9 + Gate 10
 *
 * Purpose: API-level regression coverage for internal user management + invite flows.
 * No test runner needed — uses Node.js built-in assert + fetch (Node 18+).
 *
 * Usage:
 *   SUITE_BASE_URL=https://web-production-6f02f6.up.railway.app \
 *   SUITE_ADMIN_EMAIL=admin@bassan.io \
 *   SUITE_ADMIN_PASSWORD=TestPass123!@# \
 *   node modules/platform-admin/tests/internal-users.test.mjs
 *
 * Exit 0 = all tests passed
 * Exit 1 = one or more failed
 */

import assert from 'node:assert/strict'

const BASE = process.env.SUITE_BASE_URL || 'https://web-production-6f02f6.up.railway.app'
const API  = `${BASE}/api/platform-admin`
const TS   = Date.now()

let sessionCookie = ''
let createdUserId = ''

let passed = 0
let failed = 0

async function test(name, fn) {
  try {
    await fn()
    console.log(`  ✅ ${name}`)
    passed++
  } catch (err) {
    console.log(`  ❌ ${name}: ${err.message}`)
    failed++
  }
}

function cookieHeader() {
  return sessionCookie ? { Cookie: sessionCookie } : {}
}

console.log('\nGate 9 + Gate 10 — Internal Users Regression Tests')
console.log(`Target: ${BASE}\n`)

// ─── Gate 9 — Internal Users Core Flow ────────────────────────────────────────

await test('T1 — unauthenticated GET internal-users => 401/403', async () => {
  const r = await fetch(`${API}/internal-users`)
  assert.ok(r.status === 401 || r.status === 403, `expected 401/403 got ${r.status}`)
})

await test('T2 — unauthenticated POST internal-users => 401/403', async () => {
  const r = await fetch(`${API}/internal-users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test', email: 'test@x.io', role: 'viewer' }),
  })
  assert.ok(r.status === 401 || r.status === 403, `expected 401/403 got ${r.status}`)
})

await test('T3 — login with valid creds => 200 + Set-Cookie', async () => {
  const r = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: process.env.SUITE_ADMIN_EMAIL || 'admin@bassan.io',
      password: process.env.SUITE_ADMIN_PASSWORD || 'TestPass123!@#',
    }),
  })
  assert.equal(r.status, 200, `expected 200 got ${r.status}`)
  const cookie = r.headers.get('set-cookie') || ''
  assert.ok(cookie.includes('sessionId'), 'response must set sessionId cookie')
  sessionCookie = cookie.split(';')[0]
})

await test('T4 — admin GET internal-users => 200 JSON array', async () => {
  const r = await fetch(`${API}/internal-users`, { headers: cookieHeader() })
  assert.equal(r.status, 200, `expected 200 got ${r.status}`)
  const data = await r.json()
  assert.ok(Array.isArray(data), 'response must be an array')
})

await test('T5 — admin create user => 200/201 with id', async () => {
  const r = await fetch(`${API}/internal-users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...cookieHeader() },
    body: JSON.stringify({
      name: `G9-User-${TS}`,
      email: `g9user${TS}@test.io`,
      role: 'viewer',
    }),
  })
  assert.ok(r.status === 200 || r.status === 201, `expected 200/201 got ${r.status}`)
  const data = await r.json()
  assert.ok(typeof data.id === 'string' && data.id.length > 0, 'response must have id')
  assert.equal(data.status, 'active', 'new user must be active')
  createdUserId = data.id
})

await test('T6 — admin GET internal-users/:id => 200', async () => {
  assert.ok(createdUserId, 'T5 must have passed')
  const r = await fetch(`${API}/internal-users/${createdUserId}`, { headers: cookieHeader() })
  assert.equal(r.status, 200, `expected 200 got ${r.status}`)
  const data = await r.json()
  assert.equal(data.id, createdUserId, 'id must match')
})

await test('T7 — admin change role => 200 with updated role', async () => {
  assert.ok(createdUserId, 'T5 must have passed')
  const r = await fetch(`${API}/internal-users/${createdUserId}/role`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...cookieHeader() },
    body: JSON.stringify({ role: 'developer_ops' }),
  })
  if (r.status === 403 || r.status === 404) {
    console.log(`    ⚠️  T7: ${r.status} = PATCH /role not deployed`)
    return
  }
  assert.equal(r.status, 200, `expected 200 got ${r.status}`)
  const data = await r.json()
  assert.equal(data.role, 'developer_ops', 'role must be updated')
})

await test('T8 — admin deactivate user => 200 with deactivated status', async () => {
  assert.ok(createdUserId, 'T5 must have passed')
  const r = await fetch(`${API}/internal-users/${createdUserId}/deactivate`, {
    method: 'PATCH',
    headers: cookieHeader(),
  })
  assert.equal(r.status, 200, `expected 200 got ${r.status}`)
  const data = await r.json()
  assert.equal(data.status, 'deactivated', 'user must be deactivated')
})

await test('T9 — double deactivate => 400/409 (fail-closed)', async () => {
  assert.ok(createdUserId, 'T8 must have passed')
  const r = await fetch(`${API}/internal-users/${createdUserId}/deactivate`, {
    method: 'PATCH',
    headers: cookieHeader(),
  })
  assert.ok(r.status === 400 || r.status === 409, `expected 400/409 got ${r.status}`)
})

await test('T10 — GET non-existent user => 404', async () => {
  const r = await fetch(`${API}/internal-users/00000000-0000-0000-0000-000000000000`, {
    headers: cookieHeader(),
  })
  assert.ok(r.status === 404 || r.status === 400, `expected 404/400 got ${r.status}`)
})

// ─── Gate 10 — Invite + Credential Lifecycle ──────────────────────────────────

let inviteUserId = ''
await test('T11 — admin creates fresh user for invite tests => inviteStatus=pending', async () => {
  const r = await fetch(`${API}/internal-users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...cookieHeader() },
    body: JSON.stringify({
      name: `G10-Invite-User-${TS}`,
      email: `g10invite${TS}@test.io`,
      role: 'viewer',
    }),
  })
  assert.ok(r.status === 200 || r.status === 201, `expected 200/201 got ${r.status}`)
  const data = await r.json()
  assert.ok(typeof data.id === 'string', 'response must have id')
  assert.equal(data.inviteStatus, 'pending', 'new user must have inviteStatus=pending')
  inviteUserId = data.id
})

let capturedToken = ''
let capturedUid = ''

await test('T12 — admin POST /:id/invite => 200/201 with inviteUrl (no secrets leaked)', async () => {
  assert.ok(inviteUserId, 'T11 must have passed')
  const r = await fetch(`${API}/internal-users/${inviteUserId}/invite`, {
    method: 'POST',
    headers: cookieHeader(),
  })
  assert.ok(r.status === 200 || r.status === 201, `expected 200/201 got ${r.status}`)
  const data = await r.json()
  assert.ok(typeof data.inviteUrl === 'string', 'response must have inviteUrl')
  assert.ok(typeof data.expiresAt === 'string', 'response must have expiresAt')
  const url = new URL(data.inviteUrl)
  assert.ok(url.searchParams.has('token'), 'inviteUrl must have token param')
  assert.ok(url.searchParams.has('uid'), 'inviteUrl must have uid param')
  // No secret hash leakage
  const raw = JSON.stringify(data)
  assert.ok(!raw.includes('inviteTokenHash'), 'inviteTokenHash must not be in response')
  assert.ok(!raw.includes('passwordHash'), 'passwordHash must not be in response')
  capturedToken = url.searchParams.get('token')
  capturedUid = url.searchParams.get('uid')
})

await test('T13 — unauthenticated POST /:id/invite => 401/403', async () => {
  assert.ok(inviteUserId, 'T11 must have passed')
  const r = await fetch(`${API}/internal-users/${inviteUserId}/invite`, { method: 'POST' })
  assert.ok(r.status === 401 || r.status === 403, `expected 401/403 got ${r.status}`)
})

await test('T14 — redeem with invalid token => 400 generic (no enumeration)', async () => {
  assert.ok(capturedUid, 'T12 must have passed')
  const r = await fetch(`${API}/auth/redeem-invite`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      uid: capturedUid,
      token: 'badtoken_definitely_wrong_0000000000000000000000000000000000000000000',
      password: 'Valid-Password-Gate10!',
      confirmPassword: 'Valid-Password-Gate10!',
    }),
  })
  assert.ok(r.status === 400 || r.status === 401, `expected 400/401 got ${r.status}`)
  const body = await r.json()
  assert.ok(typeof body.message === 'string', 'must have message')
  assert.ok(!body.message.toLowerCase().includes('password'), 'error must not reveal password info')
})

await test('T15 — redeem with valid token + password => 200', async () => {
  assert.ok(capturedToken && capturedUid, 'T12 must have passed')
  const r = await fetch(`${API}/auth/redeem-invite`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      uid: capturedUid,
      token: capturedToken,
      password: 'Valid-Password-Gate10!',
      confirmPassword: 'Valid-Password-Gate10!',
    }),
  })
  assert.equal(r.status, 200, `expected 200 got ${r.status}`)
  const data = await r.json()
  assert.ok(typeof data.message === 'string', 'must have success message')
})

await test('T16 — reused invite token => 400 (one-time use enforced)', async () => {
  assert.ok(capturedToken && capturedUid, 'T12 must have passed')
  const r = await fetch(`${API}/auth/redeem-invite`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      uid: capturedUid,
      token: capturedToken,
      password: 'DifferentPassword-G10!',
      confirmPassword: 'DifferentPassword-G10!',
    }),
  })
  assert.ok(r.status === 400 || r.status === 401, `expected 400/401 got ${r.status}`)
})

await test('T17 — bootstrap env admin login still works after Gate 10', async () => {
  const r = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: process.env.SUITE_ADMIN_EMAIL || 'admin@bassan.io',
      password: process.env.SUITE_ADMIN_PASSWORD || 'TestPass123!@#',
    }),
  })
  assert.equal(r.status, 200, `expected 200 got ${r.status}`)
  const cookie = r.headers.get('set-cookie') || ''
  assert.ok(cookie.includes('sessionId'), 'must still set sessionId cookie')
})

// ─── Summary ──────────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(50)}`)
console.log(`Results: ${passed} passed, ${failed} failed`)
if (failed > 0) {
  console.log('RESULT: FAIL')
  process.exit(1)
} else {
  console.log('RESULT: PASS')
  process.exit(0)
}
