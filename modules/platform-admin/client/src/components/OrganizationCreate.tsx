import React, { useState } from 'react'
import { createOrganization } from '../api/platformAdmin'

interface Props {
  onBack: () => void
  onSuccess: () => void
}

export function OrganizationCreate({ onBack, onSuccess }: Props) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      setError('Organization name is required')
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      await createOrganization({ name: name.trim() })
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create organization')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button onClick={onBack} style={{ marginBottom: '1rem' }}>← Back to List</button>
      
      <h1>Create Organization</h1>

      {error && (
        <div style={{ color: 'red', marginBottom: '1rem', padding: '0.5rem', border: '1px solid red', borderRadius: '4px' }}>
          Error: {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ marginTop: '1rem', maxWidth: '400px' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Organization Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            style={{ width: '100%', padding: '0.5rem', fontSize: '1rem', border: '1px solid #ccc', borderRadius: '4px' }}
            placeholder="Enter organization name"
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Organization'}
          </button>
          <button type="button" onClick={onBack} disabled={loading}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
