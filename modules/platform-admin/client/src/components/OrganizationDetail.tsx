import { useEffect, useState } from 'react'
import { getOrganization, suspendOrganization, unsuspendOrganization, deleteOrganization, type Organization } from '../api/platformAdmin'
import { normalizeError } from '../utils/errors'
import { LoadingState } from './LoadingState'
import { ErrorState } from './ErrorState'
import { OrgMappingSection } from './OrgMappingSection'

interface Props {
  organizationId: string
  onBack: () => void
}

type ActionState = 'idle' | 'confirm-suspend' | 'confirm-deactivate' | 'pending' | 'success'

const STATUS_BADGE: React.CSSProperties = {
  display: 'inline-block',
  padding: '0.25rem 0.5rem',
  borderRadius: '4px',
  fontSize: '0.85rem',
  fontWeight: 'bold',
}

function statusBadgeStyle(status: string): React.CSSProperties {
  if (status === 'active') return { ...STATUS_BADGE, background: '#d4edda', color: '#155724' }
  if (status === 'suspended') return { ...STATUS_BADGE, background: '#fff3cd', color: '#856404' }
  return { ...STATUS_BADGE, background: '#f8d7da', color: '#721c24' }
}

export function OrganizationDetail({ organizationId, onBack }: Props) {
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionState, setActionState] = useState<ActionState>('idle')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [error, setError] = useState<{ message: string; canRetry: boolean } | null>(null)

  const loadOrganization = async () => {
    setLoading(true)
    setError(null)
    setSuccessMessage(null)
    try {
      const data = await getOrganization(organizationId)
      setOrganization(data)
    } catch (err) {
      const normalized = normalizeError(err)
      setError({ message: normalized.message, canRetry: normalized.canRetry })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrganization()
  }, [organizationId])

  const handleSuspend = async () => {
    if (!organization) return
    setActionState('pending')
    setError(null)
    setSuccessMessage(null)
    try {
      const updated = await suspendOrganization(organization.id)
      setOrganization(updated)
      setSuccessMessage('Organization suspended successfully.')
      setActionState('success')
    } catch (err) {
      const normalized = normalizeError(err)
      setError({ message: normalized.message, canRetry: normalized.canRetry })
      setActionState('idle')
    }
  }

  const handleUnsuspend = async () => {
    if (!organization) return
    setActionState('pending')
    setError(null)
    setSuccessMessage(null)
    try {
      const updated = await unsuspendOrganization(organization.id)
      setOrganization(updated)
      setSuccessMessage('Organization unsuspended successfully.')
      setActionState('success')
    } catch (err) {
      const normalized = normalizeError(err)
      setError({ message: normalized.message, canRetry: normalized.canRetry })
      setActionState('idle')
    }
  }

  const handleDeactivate = async () => {
    if (!organization) return
    setActionState('pending')
    setError(null)
    setSuccessMessage(null)
    try {
      await deleteOrganization(organization.id)
      setSuccessMessage('Organization deactivated. It is no longer accessible.')
      // Update local status — org is gone, reflect as deactivated
      setOrganization(prev => prev ? { ...prev, status: 'suspended' as const } : null)
      setActionState('success')
    } catch (err) {
      const normalized = normalizeError(err)
      setError({ message: normalized.message, canRetry: normalized.canRetry })
      setActionState('idle')
    }
  }

  if (loading) return <LoadingState message="Loading organization..." />

  if (error && !organization) {
    return (
      <div>
        <button onClick={onBack} style={{ marginBottom: '1rem' }}>← Back to List</button>
        <ErrorState
          message={error.message}
          canRetry={error.canRetry}
          onRetry={error.canRetry ? loadOrganization : async () => {}}
        />
      </div>
    )
  }

  if (!organization) return <div>Organization not found</div>

  const isPending = actionState === 'pending'

  return (
    <div>
      <button onClick={onBack} style={{ marginBottom: '1rem' }}>← Back to List</button>

      <h1>Organization Details</h1>

      {/* Success message */}
      {successMessage && (
        <div
          role="status"
          aria-live="polite"
          style={{
            margin: '1rem 0',
            padding: '0.75rem 1rem',
            background: '#d4edda',
            color: '#155724',
            border: '1px solid #c3e6cb',
            borderRadius: '4px',
          }}
        >
          {successMessage}
        </div>
      )}

      {/* Action error */}
      {error && (
        <ErrorState
          message={error.message}
          canRetry={error.canRetry}
          onRetry={error.canRetry ? loadOrganization : async () => {}}
        />
      )}

      {/* Details table */}
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
                <span style={statusBadgeStyle(organization.status)}>{organization.status}</span>
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

      {/* Actions section */}
      <div style={{ marginTop: '2rem' }}>
        <h2>Actions</h2>

        {/* Suspend confirmation */}
        {actionState === 'confirm-suspend' && (
          <div style={{ padding: '1rem', background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '4px', marginBottom: '1rem' }}>
            <p style={{ margin: '0 0 0.75rem', fontWeight: 'bold' }}>Confirm: Suspend Organization</p>
            <p style={{ margin: '0 0 0.75rem', fontSize: '0.9rem' }}>
              Suspending will prevent access for all users in this organization.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={handleSuspend} aria-label="Confirm suspend">Confirm Suspend</button>
              <button onClick={() => setActionState('idle')}>Cancel</button>
            </div>
          </div>
        )}

        {/* Deactivate confirmation */}
        {actionState === 'confirm-deactivate' && (
          <div style={{ padding: '1rem', background: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: '4px', marginBottom: '1rem' }}>
            <p style={{ margin: '0 0 0.75rem', fontWeight: 'bold' }}>Confirm: Deactivate Organization</p>
            <p style={{ margin: '0 0 0.75rem', fontSize: '0.9rem' }}>
              This action is permanent. The organization will be deactivated and cannot be restored from this screen.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={handleDeactivate} aria-label="Confirm deactivate">Confirm Deactivate</button>
              <button onClick={() => setActionState('idle')}>Cancel</button>
            </div>
          </div>
        )}

        {/* Action buttons (idle or success state) */}
        {(actionState === 'idle' || actionState === 'success') && (
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {organization.status === 'active' ? (
              <button
                onClick={() => setActionState('confirm-suspend')}
                aria-label="Suspend organization"
              >
                Suspend Organization
              </button>
            ) : (
              <button
                onClick={handleUnsuspend}
                aria-label="Unsuspend organization"
              >
                Unsuspend Organization
              </button>
            )}
            <button
              onClick={() => setActionState('confirm-deactivate')}
              aria-label="Deactivate organization"
              style={{ color: '#721c24' }}
            >
              Deactivate Organization
            </button>
          </div>
        )}

        {/* Pending state */}
        {isPending && (
          <p aria-live="polite" style={{ color: '#555' }}>Processing...</p>
        )}

        {/* Core Org Mapping */}
        <OrgMappingSection suiteOrgId={organizationId} />
      </div>
    </div>
  )
}
