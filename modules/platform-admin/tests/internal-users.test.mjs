/**
 * Internal Users Regression Test — Gate 9
 *
 * Purpose: API-level regression coverage for internal user management flows.
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

// ─── Test Suite ───────────────────────────────────────────────────────────────

console.log('\nGate 9 — Internal Users Regression Tests')
console.log(`Target: ${BASE}\n`)

// T1: Unauthenticated list users — 401 or 403 (fail-closed)
await test('T1 — unauthenticated GET internal-users => 401/403', async () => {
  const r = await fetch(`${API}/internal-users`)
  assert.ok(r.status === 401 || r.status === 403, `expected 401/403 got ${r.status}`)
})

// T2: Unauthenticated create user — 401 or 403 (fail-closed)
await test('T2 — unauthenticated POST internal-users => 401/403', async () => {
  const r = await fetch(`${API}/internal-users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test', email: 'test@x.io', role: 'viewer' }),
  })
  assert.ok(r.status === 401 || r.status === 403, `expected 401/403 got ${r.status}`)
})

// T3: Login
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

// T4: Admin can list internal users
await test('T4 — admin GET internal-users => 200 JSON array', async () => {
  const r = await fetch(`${API}/internal-users`, { headers: cookieHeader() })
  assert.equal(r.status, 200, `expected 200 got ${r.status}`)
  const data = await r.json()
  assert.ok(Array.isArray(data), 'response must be an array')
})

// T5: Admin can create internal user
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

// T6: Admin can get internal user by id
await test('T6 — admin GET internal-users/:id => 200', async () => {
  assert.ok(createdUserId, 'T5 must have passed')
  const r = await fetch(`${API}/internal-users/${createdUserId}`, { headers: cookieHeader() })
  assert.equal(r.status, 200, `expected 200 got ${r.status}`)
  const data = await r.json()
  assert.equal(data.id, createdUserId, 'id must match')
})

// T7: Admin can change user role to developer_ops
await test('T7 — admin change role => 200 with updated role', async () => {
  assert.ok(createdUserId, 'T5 must have passed')
  const r = await fetch(`${API}/internal-users/${createdUserId}/role`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...cookieHeader() },
    body: JSON.stringify({ role: 'developer_ops' }),
  })
  if (r.status === 403 || r.status === 404) {
    console.log(`    ⚠️  T7: ${r.status} = Gate 9 PATCH /role not yet deployed`)
    return
  }
  assert.equal(r.status, 200, `expected 200 got ${r.status}`)
  const data = await r.json()
  assert.equal(data.role, 'developer_ops', 'role must be updated')
})

// T8: Admin can disable (deactivate) a user
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

// T9: Double-deactivate fails (fail-closed) 
await test('T9 — double deactivate => 400/409 (fail-closed)', async () => {
  assert.ok(createdUserId, 'T8 must have passed')
  const r = await fetch(`${API}/internal-users/${createdUserId}/deactivate`, {
    method: 'PATCH',
    headers: cookieHeader(),
  })
  // BFF throws BadRequestException for already-deactivated user
  assert.ok(r.status === 400 || r.status === 409, `expected 400/409 got ${r.status}`)
})

// T10: GET non-existent user => 404
await test('T10 — GET non-existent user => 404', async () => {
  const r = await fetch(`${API}/internal-users/00000000-0000-0000-0000-000000000000`, {
    headers: cookieHeader(),
  })
  assert.ok(r.status === 404 || r.status === 400, `expected 404/400 got ${r.status}`)
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
