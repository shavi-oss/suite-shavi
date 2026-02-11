import { useState, useEffect } from 'react'
import { getInternalUser, deactivateInternalUser, type InternalUser } from '../api/platformAdmin'
import { LoadingState } from './LoadingState'
import { ErrorState } from './ErrorState'

interface InternalUserDetailProps {
  userId: string
  onBack: () => void
}

export function InternalUserDetail({ userId, onBack }: InternalUserDetailProps) {
  const [user, setUser] = useState<InternalUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deactivating, setDeactivating] = useState(false)

  useEffect(() => {
    loadUser()
  }, [userId])

  const loadUser = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getInternalUser(userId)
      setUser(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user')
    } finally {
      setLoading(false)
    }
  }

  const handleDeactivate = async () => {
    if (!user || user.status === 'deactivated') return

    if (!confirm(`Are you sure you want to deactivate user "${user.name}"?`)) {
      return
    }

    try {
      setDeactivating(true)
      const updated = await deactivateInternalUser(user.id)
      setUser(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deactivate user')
    } finally {
      setDeactivating(false)
    }
  }

  if (loading) {
    return <LoadingState message="Loading user details..." />
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadUser} />
  }

  if (!user) {
    return <ErrorState message="User not found" />
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getRoleBadgeColor = (role: InternalUser['role']) => {
    switch (role) {
      case 'platform_admin':
        return '#d32f2f'
      case 'developer_ops':
        return '#1976d2'
      case 'support':
        return '#388e3c'
      case 'viewer':
        return '#757575'
      default:
        return '#757575'
    }
  }

  const getStatusBadgeColor = (status: InternalUser['status']) => {
    return status === 'active' ? '#388e3c' : '#757575'
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <button
          onClick={onBack}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#f5f5f5',
            color: '#333',
            border: '1px solid #e0e0e0',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '1rem',
          }}
        >
          ← Back to List
        </button>
        <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', fontWeight: 600 }}>
          User Details
        </h2>
      </div>

      <div
        style={{
          backgroundColor: 'white',
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          padding: '1.5rem',
        }}
      >
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <span
              style={{
                padding: '0.25rem 0.75rem',
                borderRadius: '4px',
                fontSize: '0.875rem',
                fontWeight: 500,
                backgroundColor: getRoleBadgeColor(user.role) + '20',
                color: getRoleBadgeColor(user.role),
              }}
            >
              {user.role.replace('_', ' ')}
            </span>
            <span
              style={{
                padding: '0.25rem 0.75rem',
                borderRadius: '4px',
                fontSize: '0.875rem',
                fontWeight: 500,
                backgroundColor: getStatusBadgeColor(user.status) + '20',
                color: getStatusBadgeColor(user.status),
              }}
            >
              {user.status}
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>
              Name
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 500 }}>{user.name}</div>
          </div>

          <div>
            <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>
              Email
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 500 }}>{user.email}</div>
          </div>

          <div>
            <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>
              User ID
            </div>
            <div style={{ fontSize: '0.875rem', fontFamily: 'monospace', color: '#666' }}>
              {user.id}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>
              Created At
            </div>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>{formatDate(user.createdAt)}</div>
          </div>

          <div>
            <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>
              Updated At
            </div>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>{formatDate(user.updatedAt)}</div>
          </div>

          <div>
            <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>
              Created By
            </div>
            <div style={{ fontSize: '0.875rem', fontFamily: 'monospace', color: '#666' }}>
              {user.createdBy}
            </div>
          </div>
        </div>

        {user.status === 'active' && (
          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e0e0e0' }}>
            <button
              onClick={handleDeactivate}
              disabled={deactivating}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: deactivating ? '#ccc' : '#d32f2f',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: deactivating ? 'not-allowed' : 'pointer',
                fontWeight: 500,
              }}
            >
              {deactivating ? 'Deactivating...' : 'Deactivate User'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
