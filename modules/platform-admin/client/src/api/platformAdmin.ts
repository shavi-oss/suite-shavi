import { generateCorrelationId } from '../utils/correlation'

const API_BASE = '/api/platform-admin'

// ── Shared fetch wrapper ─────────────────────────────────────────────────────

async function fetchWithCorrelation(url: string, options: RequestInit = {}): Promise<Response> {
  const correlationId = generateCorrelationId()
  const headers = {
    'Content-Type': 'application/json',
    'X-Correlation-Id': correlationId,
    ...options.headers,
  }

  // credentials: 'include' ensures session cookie is sent on same-origin requests.
  const response = await fetch(url, { ...options, headers, credentials: 'include' })

  // Fail-closed: 401/403 deny immediately
  if (response.status === 401 || response.status === 403) {
    throw new Error('Unauthorized access. Please contact your administrator.')
  }

  return response
}

// ── Auth ─────────────────────────────────────────────────────────────────────

/**
 * Check active session. Returns userId + expiresAt if authenticated.
 * Throws if no valid session (401).
 * Evidence: forensic-ui-login Phase 2 — session state machine.
 */
export async function getSession(): Promise<{ userId: string; expiresAt: number }> {
  const response = await fetch(`${API_BASE}/auth/session`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-Correlation-Id': generateCorrelationId(),
    },
  })
  if (!response.ok) {
    throw new Error('No active session')
  }
  return response.json()
}

/**
 * Login with email + password. Sets sessionId httpOnly cookie on success.
 * Throws on failure with server message if available.
 * Evidence: forensic-ui-login Phase 2 — login form handler.
 */
export async function login(email: string, password: string): Promise<void> {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-Correlation-Id': generateCorrelationId(),
    },
    body: JSON.stringify({ email, password }),
  })
  if (!response.ok) {
    const data = await response.json().catch(() => ({})) as { message?: string }
    throw new Error(data.message || 'Login failed. Check credentials and try again.')
  }
}

/**
 * Logout — clears sessionId cookie server-side.
 * Evidence: forensic-ui-login Phase 2 — logout handler.
 */
export async function logout(): Promise<void> {
  await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-Correlation-Id': generateCorrelationId(),
    },
  })
}

// ── Organizations ─────────────────────────────────────────────────────────────

interface Organization {
  id: string
  name: string
  status: 'active' | 'suspended'
  createdAt: string
  updatedAt: string
  createdBy: string
}

interface CreateOrganizationDto {
  name: string
}

interface InternalUser {
  id: string
  email: string
  name: string
  role: 'platform_admin' | 'developer_ops' | 'support' | 'viewer'
  status: 'active' | 'deactivated'
  createdAt: string
  updatedAt: string
  createdBy: string
}

interface CreateInternalUserDto {
  name: string
  email: string
  role: 'platform_admin' | 'developer_ops' | 'support' | 'viewer'
}

interface ApiError {
  message: string
  statusCode: number
}

export async function getOrganizations(): Promise<Organization[]> {
  const response = await fetchWithCorrelation(`${API_BASE}/organizations`)

  if (!response.ok) {
    throw new Error('Failed to fetch organizations')
  }

  return response.json()
}

export async function getOrganization(id: string): Promise<Organization> {
  const response = await fetchWithCorrelation(`${API_BASE}/organizations/${id}`)

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Organization not found')
    }
    throw new Error('Failed to fetch organization')
  }

  return response.json()
}

export async function createOrganization(dto: CreateOrganizationDto): Promise<Organization> {
  const response = await fetchWithCorrelation(`${API_BASE}/organizations`, {
    method: 'POST',
    body: JSON.stringify(dto),
  })

  if (!response.ok) {
    throw new Error('Failed to create organization')
  }

  return response.json()
}

export async function suspendOrganization(id: string): Promise<Organization> {
  const response = await fetchWithCorrelation(`${API_BASE}/organizations/${id}/suspend`, {
    method: 'PATCH',
  })

  if (!response.ok) {
    throw new Error('Failed to suspend organization')
  }

  return response.json()
}

export async function unsuspendOrganization(id: string): Promise<Organization> {
  const response = await fetchWithCorrelation(`${API_BASE}/organizations/${id}/unsuspend`, {
    method: 'PATCH',
  })

  if (!response.ok) {
    throw new Error('Failed to unsuspend organization')
  }

  return response.json()
}

export async function getInternalUsers(): Promise<InternalUser[]> {
  const response = await fetchWithCorrelation(`${API_BASE}/internal-users`)

  if (!response.ok) {
    throw new Error('Failed to fetch internal users')
  }

  return response.json()
}

export async function getInternalUser(id: string): Promise<InternalUser> {
  const response = await fetchWithCorrelation(`${API_BASE}/internal-users/${id}`)

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Internal user not found')
    }
    throw new Error('Failed to fetch internal user')
  }

  return response.json()
}

export async function createInternalUser(dto: CreateInternalUserDto): Promise<InternalUser> {
  const response = await fetchWithCorrelation(`${API_BASE}/internal-users`, {
    method: 'POST',
    body: JSON.stringify(dto),
  })

  if (!response.ok) {
    throw new Error('Failed to create internal user')
  }

  return response.json()
}

export async function deactivateInternalUser(id: string): Promise<InternalUser> {
  const response = await fetchWithCorrelation(`${API_BASE}/internal-users/${id}/deactivate`, {
    method: 'PATCH',
  })

  if (!response.ok) {
    throw new Error('Failed to deactivate internal user')
  }

  return response.json()
}

interface AuditLog {
  id: string
  performedAt: string
  action: string
  entityType: string
  entityId: string
  performedBy: string
  result: 'success' | 'failure'
  correlationId?: string
}

interface AuditLogFilters {
  entityType?: string
  action?: string
  performedBy?: string
  from?: string
  to?: string
}

export async function getAuditLogs(filters?: AuditLogFilters): Promise<AuditLog[]> {
  const params = new URLSearchParams()

  if (filters?.entityType) params.append('entityType', filters.entityType)
  if (filters?.action) params.append('action', filters.action)
  if (filters?.performedBy) params.append('performedBy', filters.performedBy)
  if (filters?.from) params.append('from', filters.from)
  if (filters?.to) params.append('to', filters.to)

  const queryString = params.toString()
  const url = queryString ? `${API_BASE}/audit-logs?${queryString}` : `${API_BASE}/audit-logs`

  const response = await fetchWithCorrelation(url)

  if (!response.ok) {
    throw new Error('Failed to fetch audit logs')
  }

  return response.json()
}

export type { Organization, CreateOrganizationDto, InternalUser, CreateInternalUserDto, AuditLog, AuditLogFilters, ApiError }
