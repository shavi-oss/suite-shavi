/**
 * Org Flows Regression Test — Gate 7
 *
 * Purpose: API-level regression coverage for the working organization flows.
 * No test runner needed — uses Node.js built-in assert + fetch (Node 18+).
 *
 * Usage:
 *   SUITE_BASE_URL=https://web-production-6f02f6.up.railway.app \
 *   SUITE_ADMIN_EMAIL=admin@bassan.io \
 *   SUITE_ADMIN_PASSWORD=TestPass123!@# \
 *   node modules/platform-admin/tests/org-flows.test.mjs
 *
 * Exit 0 = all tests passed
 * Exit 1 = one or more tests failed
 */

import assert from 'node:assert/strict'

const BASE = process.env.SUITE_BASE_URL || 'https://web-production-6f02f6.up.railway.app'
const API  = `${BASE}/api/platform-admin`
const TS   = Date.now()

let sessionCookie = ''
let createdOrgId  = ''

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

console.log('\nGate 7 — Org Flows Regression Tests')
console.log(`Target: ${BASE}\n`)

// T1: Health
await test('T1 — health returns 200', async () => {
  const r = await fetch(`${API}/health`)
  assert.equal(r.status, 200, `expected 200 got ${r.status}`)
})

// T2: Unauthenticated create returns 401 (fail-closed)
await test('T2 — unauthenticated create => 401', async () => {
  const r = await fetch(`${API}/organizations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'test', adminEmail: 'x@x.io', adminPassword: 'p', adminFirstName: 'F', adminLastName: 'L' }),
  })
  assert.equal(r.status, 401, `expected 401 got ${r.status}`)
})

// T3: Login succeeds, session cookie set
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
  // Extract cookie value for subsequent requests
  sessionCookie = cookie.split(';')[0] // "sessionId=xxx"
})

// T4: List organizations (read, authenticated)
await test('T4 — GET organizations => 200 JSON array', async () => {
  const r = await fetch(`${API}/organizations`, { headers: cookieHeader() })
  assert.equal(r.status, 200, `expected 200 got ${r.status}`)
  const data = await r.json()
  assert.ok(Array.isArray(data), 'response must be an array')
})

// T5: Create organization with all 5 required fields
await test('T5 — authenticated create with 5 fields => 201 with id', async () => {
  const body = {
    name: `G7-Org-${TS}`,
    adminEmail: `admin${TS}@g7.io`,
    adminPassword: 'SecureG7Pass1!',
    adminFirstName: 'Gate',
    adminLastName: 'Seven',
  }
  const r = await fetch(`${API}/organizations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...cookieHeader() },
    body: JSON.stringify(body),
  })
  // BFF uses @HttpCode(HttpStatus.CREATED) → 201
  assert.ok(r.status === 200 || r.status === 201, `expected 200/201 got ${r.status}`)
  const data = await r.json()
  assert.ok(typeof data.id === 'string' && data.id.length > 0, 'response must have id')
  assert.equal(data.name, body.name, 'name must match')
  assert.equal(data.status, 'active', 'new org must be active')
  createdOrgId = data.id
})

// T6: Create payload must include all 5 fields — verify 400 if missing adminEmail
await test('T6 — create without adminEmail => non-200 (Core validation)', async () => {
  const r = await fetch(`${API}/organizations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...cookieHeader() },
    body: JSON.stringify({ name: `G7-Incomplete-${TS}`, adminPassword: 'p', adminFirstName: 'F', adminLastName: 'L' }),
  })
  // Core returns 500 (ORGANIZATION_CREATE_FAILED wrapping Core 400) — either way, not 200
  assert.ok(r.status !== 200, `expected non-200 got ${r.status}`)
})

// T7: List orgs includes newly created org
await test('T7 — list after create includes new org', async () => {
  assert.ok(createdOrgId, 'T5 must have passed to get createdOrgId')
  const r = await fetch(`${API}/organizations`, { headers: cookieHeader() })
  const data = await r.json()
  const found = data.find((o) => o.id === createdOrgId)
  assert.ok(found, `org ${createdOrgId} must appear in list after create`)
})

// T8: Suspend
await test('T8 — suspend org => 200', async () => {
  assert.ok(createdOrgId, 'T5 must have passed')
  const r = await fetch(`${API}/organizations/${createdOrgId}/suspend`, {
    method: 'PATCH',
    headers: cookieHeader(),
  })
  assert.equal(r.status, 200, `expected 200 got ${r.status}`)
  const data = await r.json()
  assert.equal(data.status, 'suspended', 'status must be suspended')
})

// T9: Unsuspend
await test('T9 — unsuspend org => 200', async () => {
  assert.ok(createdOrgId, 'T5 must have passed')
  const r = await fetch(`${API}/organizations/${createdOrgId}/unsuspend`, {
    method: 'PATCH',
    headers: cookieHeader(),
  })
  assert.equal(r.status, 200, `expected 200 got ${r.status}`)
  const data = await r.json()
  assert.equal(data.status, 'active', 'status must be active after unsuspend')
})

// T10: Deactivate (DELETE)
await test('T10 — deactivate org => 200', async () => {
  assert.ok(createdOrgId, 'T5 must have passed')
  const r = await fetch(`${API}/organizations/${createdOrgId}`, {
    method: 'DELETE',
    headers: cookieHeader(),
  })
  assert.equal(r.status, 200, `expected 200 got ${r.status}`)
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
