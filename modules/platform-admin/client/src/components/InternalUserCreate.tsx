import { useState, FormEvent } from 'react'
import { createInternalUser, type CreateInternalUserDto } from '../api/platformAdmin'
import { LoadingState } from './LoadingState'
import { ErrorState } from './ErrorState'

interface InternalUserCreateProps {
  onBack: () => void
  onSuccess: () => void
}

export function InternalUserCreate({ onBack, onSuccess }: InternalUserCreateProps) {
  const [formData, setFormData] = useState<CreateInternalUserDto>({
    name: '',
    email: '',
    role: 'viewer',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    await submit()
  }

  const submit = async () => {
    try {
      setSubmitting(true)
      setError(null)
      await createInternalUser(formData)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitting) {
    return <LoadingState message="Creating user..." />
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
        <h2 style={{ margin: '0', fontSize: '1.5rem', fontWeight: 600 }}>Create Internal User</h2>
      </div>

      {error && (
        <div style={{ marginBottom: '1rem' }}>
          <ErrorState message={error} onRetry={submit} />
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div
          style={{
            backgroundColor: 'white',
            border: '1px solid #e0e0e0',
            borderRadius: '4px',
            padding: '1.5rem',
          }}
        >
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label
                htmlFor="name"
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  marginBottom: '0.5rem',
                }}
              >
                Name *
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  fontSize: '1rem',
                }}
                placeholder="Enter user's full name"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  marginBottom: '0.5rem',
                }}
              >
                Email *
              </label>
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  fontSize: '1rem',
                }}
                placeholder="user@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="role"
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  marginBottom: '0.5rem',
                }}
              >
                Role *
              </label>
              <select
                id="role"
                required
                value={formData.role}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    role: e.target.value as CreateInternalUserDto['role'],
                  })
                }
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  fontSize: '1rem',
                }}
              >
                <option value="viewer">Viewer (Read-only access)</option>
                <option value="support">Support (Read-only access)</option>
                <option value="developer_ops">Developer Ops (Read/write orgs, mappings)</option>
                <option value="platform_admin">Platform Admin (Full access)</option>
              </select>
              <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
                Select the appropriate role based on user's responsibilities
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '1rem',
              marginTop: '1.5rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid #e0e0e0',
            }}
          >
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '0.5rem 1.5rem',
                backgroundColor: submitting ? '#ccc' : '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontWeight: 500,
              }}
            >
              {submitting ? 'Creating...' : 'Create User'}
            </button>
            <button
              type="button"
              onClick={onBack}
              disabled={submitting}
              style={{
                padding: '0.5rem 1.5rem',
                backgroundColor: '#f5f5f5',
                color: '#333',
                border: '1px solid #e0e0e0',
                borderRadius: '4px',
                cursor: submitting ? 'not-allowed' : 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
