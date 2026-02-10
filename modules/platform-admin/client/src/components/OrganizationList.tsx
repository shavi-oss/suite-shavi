import React, { useEffect, useState } from 'react'
import { getOrganizations, type Organization } from '../api/platformAdmin'

interface Props {
  onSelectOrganization: (id: string) => void
  onCreateNew: () => void
}

export function OrganizationList({ onSelectOrganization, onCreateNew }: Props) {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadOrganizations = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getOrganizations()
      setOrganizations(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load organizations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrganizations()
  }, [])

  if (loading) {
    return <div>Loading organizations...</div>
  }

  if (error) {
    return (
      <div>
        <div style={{ color: 'red', marginBottom: '1rem' }}>Error: {error}</div>
        <button onClick={loadOrganizations}>Retry</button>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1>Organizations</h1>
        <button onClick={onCreateNew}>Create Organization</button>
      </div>

      {organizations.length === 0 ? (
        <p>No organizations found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}>
              <th style={{ padding: '0.5rem' }}>Name</th>
              <th style={{ padding: '0.5rem' }}>Status</th>
              <th style={{ padding: '0.5rem' }}>Created At</th>
              <th style={{ padding: '0.5rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {organizations.map((org) => (
              <tr key={org.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.5rem' }}>{org.name}</td>
                <td style={{ padding: '0.5rem' }}>
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    backgroundColor: org.status === 'active' ? '#d4edda' : '#f8d7da',
                    color: org.status === 'active' ? '#155724' : '#721c24',
                  }}>
                    {org.status}
                  </span>
                </td>
                <td style={{ padding: '0.5rem' }}>{new Date(org.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: '0.5rem' }}>
                  <button onClick={() => onSelectOrganization(org.id)}>View Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
