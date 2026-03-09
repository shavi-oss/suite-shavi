import { useState, useEffect } from 'react'
import { getInternalUser, deactivateInternalUser, generateInvite, type InternalUser, type InviteResult } from '../api/platformAdmin'
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

  // Gate 10: Invite state
  const [generatingInvite, setGeneratingInvite] = useState(false)
  const [inviteResult, setInviteResult] = useState<InviteResult | null>(null)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

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
      const message = err instanceof Error ? err.message : 'Failed to load user'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeactivate = async () => {
    if (!user || user.status === 'deactivated') return
    if (!confirm(`Are you sure you want to deactivate user "${user.name}"?`)) return
    try {
      setDeactivating(true)
      const updated = await deactivateInternalUser(user.id)
      setUser(updated)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to deactivate user'
      setError(message)
    } finally {
      setDeactivating(false)
    }
  }

  // Gate 10: Generate / regenerate invite
  const handleGenerateInvite = async () => {
    if (!user) return
    try {
      setGeneratingInvite(true)
      setInviteError(null)
      setInviteResult(null)
      setCopied(false)
      const result = await generateInvite(user.id)
      setInviteResult(result)
      // Reload user to update inviteStatus badge
      const updated = await getInternalUser(user.id)
      setUser(updated)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate invite'
      setInviteError(message)
    } finally {
      setGeneratingInvite(false)
    }
  }

  const handleCopyLink = async () => {
    if (!inviteResult) return
    try {
      await navigator.clipboard.writeText(inviteResult.inviteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Fallback: select text
    }
  }

  const isUnauthorized = (msg: string) =>
    msg.includes('Unauthorized') || msg.includes('Forbidden') || msg.includes('403') || msg.includes('401')

  const isNotFound = (msg: string) =>
    msg.includes('not found') || msg.includes('Not Found') || msg.includes('404')

  if (loading) return <LoadingState message="Loading user details..." />
  if (error) {
    const canRetry = !isUnauthorized(error) && !isNotFound(error)
    return <ErrorState message={error} canRetry={canRetry} onRetry={canRetry ? loadUser : async () => {}} />
  }
  if (!user) return <ErrorState message="User not found" canRetry={false} onRetry={async () => {}} />

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    })

  const getRoleBadgeColor = (role: InternalUser['role']) => {
    switch (role) {
      case 'platform_admin': return '#d32f2f'
      case 'developer_ops': return '#1976d2'
      case 'support': return '#388e3c'
      case 'viewer': return '#757575'
      default: return '#757575'
    }
  }

  const getStatusBadgeColor = (status: InternalUser['status']) =>
    status === 'active' ? '#388e3c' : '#757575'

  const getInviteStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#388e3c'
      case 'invited': return '#f57c00'
      case 'expired': return '#757575'
      case 'pending': return '#9e9e9e'
      default: return '#9e9e9e'
    }
  }

  const inviteStatus = user.inviteStatus ?? 'pending'

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

      <div style={{ backgroundColor: 'white', border: '1px solid #e0e0e0', borderRadius: '4px', padding: '1.5rem' }}>
        {/* Badges */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
            <span style={{
              padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.875rem', fontWeight: 500,
              backgroundColor: getRoleBadgeColor(user.role) + '20', color: getRoleBadgeColor(user.role),
            }}>
              {user.role.replace(/_/g, ' ')}
            </span>
            <span style={{
              padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.875rem', fontWeight: 500,
              backgroundColor: getStatusBadgeColor(user.status) + '20', color: getStatusBadgeColor(user.status),
            }}>
              {user.status}
            </span>
            {/* Gate 10: invite status badge */}
            <span style={{
              padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.875rem', fontWeight: 500,
              backgroundColor: getInviteStatusColor(inviteStatus) + '20', color: getInviteStatusColor(inviteStatus),
              border: `1px solid ${getInviteStatusColor(inviteStatus)}40`,
            }}>
              invite: {inviteStatus}
            </span>
          </div>
        </div>

        {/* User fields */}
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>Name</div>
            <div style={{ fontSize: '1rem', fontWeight: 500 }}>{user.name}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>Email</div>
            <div style={{ fontSize: '1rem', fontWeight: 500 }}>{user.email}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>User ID</div>
            <div style={{ fontSize: '0.875rem', fontFamily: 'monospace', color: '#666' }}>{user.id}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>Created At</div>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>{formatDate(user.createdAt)}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>Updated At</div>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>{formatDate(user.updatedAt)}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>Created By</div>
            <div style={{ fontSize: '0.875rem', fontFamily: 'monospace', color: '#666' }}>{user.createdBy}</div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Gate 10: Invite action */}
          {user.status === 'active' && inviteStatus !== 'active' && (
            <div>
              <button
                id="generate-invite-btn"
                onClick={handleGenerateInvite}
                disabled={generatingInvite}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: generatingInvite ? '#ccc' : '#1976d2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: generatingInvite ? 'not-allowed' : 'pointer',
                  fontWeight: 500,
                }}
              >
                {generatingInvite
                  ? 'Generating...'
                  : inviteStatus === 'invited' || inviteStatus === 'expired'
                    ? 'Regenerate Invite'
                    : 'Generate Invite'}
              </button>

              {inviteError && (
                <div style={{
                  marginTop: '0.75rem',
                  padding: '0.625rem',
                  backgroundColor: '#fde8e8',
                  border: '1px solid #f5c6c6',
                  borderRadius: '4px',
                  color: '#d32f2f',
                  fontSize: '0.875rem',
                }}>
                  {inviteError}
                </div>
              )}

              {inviteResult && (
                <div style={{
                  marginTop: '0.75rem',
                  padding: '0.75rem 1rem',
                  backgroundColor: '#e8f5e9',
                  border: '1px solid #c8e6c9',
                  borderRadius: '4px',
                }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#2e7d32', marginBottom: '0.5rem' }}>
                    ✅ Invite generated — copy link to send
                  </div>
                  <div style={{
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    color: '#333',
                    wordBreak: 'break-all',
                    backgroundColor: 'white',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    border: '1px solid #e0e0e0',
                    marginBottom: '0.5rem',
                  }}>
                    {inviteResult.inviteUrl}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      id="copy-invite-link-btn"
                      onClick={handleCopyLink}
                      style={{
                        padding: '0.375rem 0.75rem',
                        backgroundColor: copied ? '#388e3c' : '#f5f5f5',
                        color: copied ? 'white' : '#333',
                        border: '1px solid #e0e0e0',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                      }}
                    >
                      {copied ? '✓ Copied!' : 'Copy Link'}
                    </button>
                    <span style={{ fontSize: '0.75rem', color: '#666' }}>
                      Expires: {new Date(inviteResult.expiresAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Deactivate action */}
          {user.status === 'active' && (
            <div>
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
    </div>
  )
}
