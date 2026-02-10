import { generateCorrelationId } from '../utils/correlation'

const API_BASE = '/api/platform-admin'

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

interface ApiError {
  message: string
  statusCode: number
}

async function fetchWithCorrelation(url: string, options: RequestInit = {}): Promise<Response> {
  const correlationId = generateCorrelationId()
  const headers = {
    'Content-Type': 'application/json',
    'X-Correlation-Id': correlationId,
    ...options.headers,
  }

  const response = await fetch(url, { ...options, headers })

  // Fail-closed: 401/403 deny immediately
  if (response.status === 401 || response.status === 403) {
    throw new Error('Unauthorized access. Please contact your administrator.')
  }

  return response
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

export type { Organization, CreateOrganizationDto, ApiError }
