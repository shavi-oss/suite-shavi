import { useEffect, useState } from 'react'
import { getOrgMapping, createOrgMapping, type OrgMapping } from '../api/platformAdmin'
import { normalizeError } from '../utils/errors'

interface Props {
  suiteOrgId: string
}

type MappingState = 'loading' | 'exists' | 'none' | 'creating' | 'error'

export function OrgMappingSection({ suiteOrgId }: Props) {
  const [state, setState] = useState<MappingState>('loading')
  const [mapping, setMapping] = useState<OrgMapping | null>(null)
  const [coreOrgId, setCoreOrgId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    let cancelled = false
    setState('loading')
    setError(null)
    getOrgMapping(suiteOrgId)
      .then((m) => {
        if (cancelled) return
        if (m) {
          setMapping(m)
          setState('exists')
        } else {
          setState('none')
        }
      })
      .catch((err) => {
        if (cancelled) return
        const n = normalizeError(err)
        if (n.isAuthError) {
          // Not permitted to view — hide section silently (fail-closed read)
          setState('none')
        } else {
          setError(n.message)
          setState('error')
        }
      })
    return () => { cancelled = true }
  }, [suiteOrgId])

  const handleCreate = async () => {
    const trimmed = coreOrgId.trim()
    if (!trimmed) {
      setError('Core Organization ID is required')
      return
    }
    setError(null)
    setState('creating')
    try {
      const newMapping = await createOrgMapping({ suiteOrgId, coreOrgId: trimmed })
      setMapping(newMapping)
      setSuccess(true)
      setState('exists')
    } catch (err) {
      const n = normalizeError(err)
      setError(n.message)
      setState('none')
    }
  }

  // Extract isCreating so TS does not narrow it away inside JSX branches
  const isCreating = state === 'creating'

  const sectionStyle: React.CSSProperties = {
    marginTop: '2rem',
    padding: '1rem',
    border: '1px solid #dee2e6',
    borderRadius: '6px',
    background: '#f8f9fa',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#495057',
    marginBottom: '0.25rem',
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.5rem',
    border: '1px solid #ced4da',
    borderRadius: '4px',
    fontSize: '0.95rem',
    boxSizing: 'border-box',
  }

  const successStyle: React.CSSProperties = {
    padding: '0.5rem 0.75rem',
    background: '#d4edda',
    color: '#155724',
    borderRadius: '4px',
    marginBottom: '0.75rem',
    fontSize: '0.9rem',
  }

  const errorStyle: React.CSSProperties = {
    padding: '0.5rem 0.75rem',
    background: '#f8d7da',
    color: '#721c24',
    borderRadius: '4px',
    marginBottom: '0.75rem',
    fontSize: '0.9rem',
  }

  return (
    <div style={sectionStyle}>
      <h3 style={{ margin: '0 0 0.75rem', fontSize: '1rem' }}>Core Org Mapping</h3>

      {state === 'loading' && (
        <p style={{ color: '#6c757d', fontSize: '0.9rem' }}>Loading mapping…</p>
      )}

      {state === 'error' && error && (
        <div style={errorStyle}>{error}</div>
      )}

      {state === 'exists' && mapping && (
        <div>
          {success && (
            <div style={successStyle}>Mapping created successfully.</div>
          )}
          <div style={{ fontSize: '0.9rem', color: '#495057' }}>
            <div style={{ marginBottom: '0.35rem' }}>
              <strong>Core Org ID:</strong>{' '}
              <code style={{ background: '#e9ecef', padding: '0.15rem 0.35rem', borderRadius: '3px' }}>
                {mapping.coreOrgId}
              </code>
            </div>
            <div style={{ color: '#868e96', fontSize: '0.8rem' }}>
              Mapped {new Date(mapping.createdAt).toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {(state === 'none' || (state === 'error' && !error)) && (
        <div>
          {error && <div style={errorStyle}>{error}</div>}
          <p style={{ fontSize: '0.9rem', color: '#6c757d', marginTop: 0 }}>
            No mapping exists for this organization. Enter the Core Organization ID to create one.
          </p>
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={labelStyle} htmlFor="coreOrgId">Core Organization ID</label>
            <input
              id="coreOrgId"
              style={inputStyle}
              type="text"
              value={coreOrgId}
              onChange={(e) => setCoreOrgId(e.target.value)}
              placeholder="e.g. 3fa85f64-5717-4562-b3fc-2c963f66afa6"
              autoComplete="off"
              disabled={isCreating}
            />
          </div>
          <button
            onClick={handleCreate}
            disabled={isCreating || !coreOrgId.trim()}
            style={{
              padding: '0.5rem 1rem',
              background: isCreating ? '#6c757d' : '#0d6efd',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isCreating ? 'not-allowed' : 'pointer',
              fontSize: '0.9rem',
            }}
          >
            {isCreating ? 'Linking…' : 'Link to Core Org'}
          </button>
        </div>
      )}
    </div>
  )
}
