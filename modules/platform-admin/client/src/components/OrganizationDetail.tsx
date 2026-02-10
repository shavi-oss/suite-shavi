import React, { useEffect, useState } from 'react'
import { getOrganization, suspendOrganization, unsuspendOrganization, type Organization } from '../api/platformAdmin'

interface Props {
  organizationId: string
  onBack: () => void
}

export function OrganizationDetail({ organizationId, onBack }: Props) {
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const loadOrganization = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getOrganization(organizationId)
      setOrganization(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load organization')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrganization()
  }, [organizationId])

  const handleSuspend = async () => {
    if (!organization) return
    setActionLoading(true)
    setError(null)
    try {
      const updated = await suspendOrganization(organization.id)
      setOrganization(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to suspend organization')
    } finally {
      setActionLoading(false)
    }
  }

  const handleUnsuspend = async () => {
    if (!organization) return
    setActionLoading(true)
    setError(null)
    try {
      const updated = await unsuspendOrganization(organization.id)
      setOrganization(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unsuspend organization')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return <div>Loading organization...</div>
  }

  if (error && !organization) {
    return (
      <div>
        <button onClick={onBack} style={{ marginBottom: '1rem' }}>← Back to List</button>
        <div style={{ color: 'red', marginBottom: '1rem' }}>Error: {error}</div>
        <button onClick={loadOrganization}>Retry</button>
      </div>
    )
  }

  if (!organization) {
    return <div>Organization not found</div>
  }

  return (
    <div>
      <button onClick={onBack} style={{ marginBottom: '1rem' }}>← Back to List</button>
      
      <h1>Organization Details</h1>

      {error && (
        <div style={{ color: 'red', marginBottom: '1rem', padding: '0.5rem', border: '1px solid red', borderRadius: '4px' }}>
          Error: {error}
        </div>
      )}

      <div style={{ marginTop: '1rem' }}>
        <table style={{ borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ padding: '0.5rem', fontWeight: 'bold', verticalAlign: 'top' }}>ID:</td>
              <td style={{ padding: '0.5rem' }}>{organization.id}</td>
            </tr>
            <tr>
              <td style={{ padding: '0.5rem', fontWeight: 'bold', verticalAlign: 'top' }}>Name:</td>
              <td style={{ padding: '0.5rem' }}>{organization.name}</td>
            </tr>
            <tr>
              <td style={{ padding: '0.5rem', fontWeight: 'bold', verticalAlign: 'top' }}>Status:</td>
              <td style={{ padding: '0.5rem' }}>
                <span style={{
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  backgroundColor: organization.status === 'active' ? '#d4edda' : '#f8d7da',
                  color: organization.status === 'active' ? '#155724' : '#721c24',
                }}>
                  {organization.status}
                </span>
              </td>
            </tr>
            <tr>
              <td style={{ padding: '0.5rem', fontWeight: 'bold', verticalAlign: 'top' }}>Created At:</td>
              <td style={{ padding: '0.5rem' }}>{new Date(organization.createdAt).toLocaleString()}</td>
            </tr>
            <tr>
              <td style={{ padding: '0.5rem', fontWeight: 'bold', verticalAlign: 'top' }}>Updated At:</td>
              <td style={{ padding: '0.5rem' }}>{new Date(organization.updatedAt).toLocaleString()}</td>
            </tr>
            <tr>
              <td style={{ padding: '0.5rem', fontWeight: 'bold', verticalAlign: 'top' }}>Created By:</td>
              <td style={{ padding: '0.5rem' }}>{organization.createdBy}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2>Actions</h2>
        {organization.status === 'active' ? (
          <button onClick={handleSuspend} disabled={actionLoading}>
            {actionLoading ? 'Suspending...' : 'Suspend Organization'}
          </button>
        ) : (
          <button onClick={handleUnsuspend} disabled={actionLoading}>
            {actionLoading ? 'Unsuspending...' : 'Unsuspend Organization'}
          </button>
        )}
      </div>
    </div>
  )
}
