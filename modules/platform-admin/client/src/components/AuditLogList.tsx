import { useState, useEffect, FormEvent } from 'react'
import { getAuditLogs, type AuditLog, type AuditLogFilters } from '../api/platformAdmin'
import { LoadingState } from './LoadingState'
import { EmptyState } from './EmptyState'
import { ErrorState } from './ErrorState'

export function AuditLogList() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [filters, setFilters] = useState<AuditLogFilters>({
    entityType: '',
    action: '',
    performedBy: '',
    from: '',
    to: '',
  })

  useEffect(() => {
    loadLogs()
  }, [])

  const loadLogs = async (appliedFilters?: AuditLogFilters) => {
    try {
      setLoading(true)
      setError(null)
      const filterParams = appliedFilters || {}
      // Remove empty string values
      const cleanFilters = Object.fromEntries(
        Object.entries(filterParams).filter(([_, v]) => v !== '')
      ) as AuditLogFilters
      const data = await getAuditLogs(Object.keys(cleanFilters).length > 0 ? cleanFilters : undefined)
      setLogs(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }

  const handleApplyFilters = (e: FormEvent) => {
    e.preventDefault()
    loadLogs(filters)
  }

  const handleClearFilters = () => {
    const emptyFilters: AuditLogFilters = {
      entityType: '',
      action: '',
      performedBy: '',
      from: '',
      to: '',
    }
    setFilters(emptyFilters)
    loadLogs(emptyFilters)
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const getResultBadgeColor = (result: AuditLog['result']) => {
    return result === 'success' ? '#388e3c' : '#d32f2f'
  }

  const isUnauthorized = (msg: string) => {
    return msg.includes('Unauthorized') || msg.includes('Forbidden') || msg.includes('403') || msg.includes('401')
  }

  if (loading) {
    return <LoadingState message="Loading audit logs..." />
  }

  if (error) {
    const canRetry = !isUnauthorized(error)
    return <ErrorState message={error} canRetry={canRetry} onRetry={canRetry ? () => loadLogs(filters) : async () => {}} />
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>Audit Logs</h2>
        <p style={{ margin: '0.5rem 0 0 0', color: '#666', fontSize: '0.875rem' }}>
          View system audit trail (read-only)
        </p>
      </div>

      {/* Filters */}
      <form onSubmit={handleApplyFilters}>
        <div
          style={{
            backgroundColor: 'white',
            border: '1px solid #e0e0e0',
            borderRadius: '4px',
            padding: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label htmlFor="entityType" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                Entity Type
              </label>
              <select
                id="entityType"
                value={filters.entityType || ''}
                onChange={(e) => setFilters({ ...filters, entityType: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                }}
              >
                <option value="">All</option>
                <option value="organization">Organization</option>
                <option value="org_mapping">Org Mapping</option>
                <option value="internal_user">Internal User</option>
              </select>
            </div>

            <div>
              <label htmlFor="action" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                Action
              </label>
              <select
                id="action"
                value={filters.action || ''}
                onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                }}
              >
                <option value="">All</option>
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="suspend">Suspend</option>
                <option value="unsuspend">Unsuspend</option>
                <option value="link">Link</option>
                <option value="deactivate">Deactivate</option>
              </select>
            </div>

            <div>
              <label htmlFor="performedBy" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                Performed By
              </label>
              <input
                type="text"
                id="performedBy"
                value={filters.performedBy || ''}
                onChange={(e) => setFilters({ ...filters, performedBy: e.target.value })}
                placeholder="User ID"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                }}
              />
            </div>

            <div>
              <label htmlFor="from" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                From Date
              </label>
              <input
                type="date"
                id="from"
                value={filters.from || ''}
                onChange={(e) => setFilters({ ...filters, from: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                }}
              />
            </div>

            <div>
              <label htmlFor="to" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                To Date
              </label>
              <input
                type="date"
                id="to"
                value={filters.to || ''}
                onChange={(e) => setFilters({ ...filters, to: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <button
              type="submit"
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              Apply Filters
            </button>
            <button
              type="button"
              onClick={handleClearFilters}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#f5f5f5',
                color: '#333',
                border: '1px solid #e0e0e0',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
            >
              Clear
            </button>
          </div>
        </div>
      </form>

      {/* Results */}
      {logs.length === 0 ? (
        <EmptyState
          message="No audit logs found"
          actionLabel="Clear Filters"
          onAction={handleClearFilters}
        />
      ) : (
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
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600, fontSize: '0.875rem' }}>Performed At</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600, fontSize: '0.875rem' }}>Action</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600, fontSize: '0.875rem' }}>Entity Type</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600, fontSize: '0.875rem' }}>Entity ID</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600, fontSize: '0.875rem' }}>Performed By</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600, fontSize: '0.875rem' }}>Result</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                  <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#666' }}>{formatDateTime(log.performedAt)}</td>
                  <td style={{ padding: '0.75rem', fontSize: '0.875rem', fontWeight: 500 }}>{log.action}</td>
                  <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{log.entityType}</td>
                  <td style={{ padding: '0.75rem', fontSize: '0.75rem', fontFamily: 'monospace', color: '#666' }}>{log.entityId}</td>
                  <td style={{ padding: '0.75rem', fontSize: '0.75rem', fontFamily: 'monospace', color: '#666' }}>{log.performedBy}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span
                      style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        backgroundColor: getResultBadgeColor(log.result) + '20',
                        color: getResultBadgeColor(log.result),
                      }}
                    >
                      {log.result}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
