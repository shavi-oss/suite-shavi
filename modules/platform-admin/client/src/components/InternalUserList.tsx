import { useState, useEffect } from 'react'
import { getInternalUsers, type InternalUser } from '../api/platformAdmin'
import { LoadingState } from './LoadingState'
import { EmptyState } from './EmptyState'
import { ErrorState } from './ErrorState'

interface InternalUserListProps {
  onSelectUser: (id: string) => void
  onCreateNew: () => void
}

export function InternalUserList({ onSelectUser, onCreateNew }: InternalUserListProps) {
  const [users, setUsers] = useState<InternalUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getInternalUsers()
      setUsers(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load internal users'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const isUnauthorized = (msg: string) => {
    return msg.includes('Unauthorized') || msg.includes('Forbidden') || msg.includes('403') || msg.includes('401')
  }

  if (loading) {
    return <LoadingState message="Loading internal users..." />
  }

  if (error) {
    const canRetry = !isUnauthorized(error)
    return <ErrorState message={error} canRetry={canRetry} onRetry={canRetry ? loadUsers : async () => {}} />
  }

  if (users.length === 0) {
    return (
      <EmptyState
        message="No internal users found"
        actionLabel="Create First User"
        onAction={onCreateNew}
      />
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>Internal Users</h2>
        <button
          onClick={onCreateNew}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          Create User
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            backgroundColor: 'white',
            border: '1px solid #e0e0e0',
          }}
        >
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #e0e0e0' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Name</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Email</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Role</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Created</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                <td style={{ padding: '0.75rem' }}>{user.name}</td>
                <td style={{ padding: '0.75rem', color: '#666' }}>{user.email}</td>
                <td style={{ padding: '0.75rem' }}>
                  <span
                    style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      backgroundColor: getRoleBadgeColor(user.role) + '20',
                      color: getRoleBadgeColor(user.role),
                    }}
                  >
                    {user.role.replace('_', ' ')}
                  </span>
                </td>
                <td style={{ padding: '0.75rem' }}>
                  <span
                    style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      backgroundColor: getStatusBadgeColor(user.status) + '20',
                      color: getStatusBadgeColor(user.status),
                    }}
                  >
                    {user.status}
                  </span>
                </td>
                <td style={{ padding: '0.75rem', color: '#666' }}>{formatDate(user.createdAt)}</td>
                <td style={{ padding: '0.75rem' }}>
                  <button
                    onClick={() => onSelectUser(user.id)}
                    style={{
                      padding: '0.25rem 0.75rem',
                      backgroundColor: '#f5f5f5',
                      color: '#1976d2',
                      border: '1px solid #e0e0e0',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                    }}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
