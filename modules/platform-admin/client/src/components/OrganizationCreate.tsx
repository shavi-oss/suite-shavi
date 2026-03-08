import React, { useState } from 'react'
import { createOrganization } from '../api/platformAdmin'
import { normalizeError } from '../utils/errors'
import { ErrorState } from './ErrorState'

interface Props {
  onBack: () => void
  onSuccess: () => void
}

interface FormState {
  name: string
  adminEmail: string
  adminPassword: string
  adminFirstName: string
  adminLastName: string
}

const EMPTY_FORM: FormState = {
  name: '',
  adminEmail: '',
  adminPassword: '',
  adminFirstName: '',
  adminLastName: '',
}

export function OrganizationCreate({ onBack, onSuccess }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<{ message: string; canRetry: boolean } | null>(null)

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  const validate = (): string | null => {
    if (!form.name.trim()) return 'Organization name is required.'
    if (!form.adminFirstName.trim()) return 'Admin first name is required.'
    if (!form.adminLastName.trim()) return 'Admin last name is required.'
    if (!form.adminEmail.trim()) return 'Admin email is required.'
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.adminEmail.trim())
    if (!emailOk) return 'Admin email must be a valid email address.'
    if (!form.adminPassword) return 'Admin password is required.'
    return null
  }

  const submit = async () => {
    const validationErr = validate()
    if (validationErr) {
      setError({ message: validationErr, canRetry: false })
      return
    }

    setLoading(true)
    setError(null)

    try {
      await createOrganization({
        name: form.name.trim(),
        adminEmail: form.adminEmail.trim(),
        adminPassword: form.adminPassword,
        adminFirstName: form.adminFirstName.trim(),
        adminLastName: form.adminLastName.trim(),
      })
      setForm(EMPTY_FORM)
      onSuccess()
    } catch (err) {
      const normalized = normalizeError(err)
      setError({ message: normalized.message, canRetry: normalized.canRetry })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await submit()
  }

  const fieldStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '0.25rem',
    fontWeight: 'bold',
    fontSize: '0.875rem',
  }

  const fieldWrap: React.CSSProperties = { marginBottom: '1rem' }

  return (
    <div>
      <button onClick={onBack} style={{ marginBottom: '1rem' }}>← Back to List</button>

      <h1>Create Organization</h1>
      <p style={{ color: '#555', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        Creates a new organization and bootstraps its first admin user.
      </p>

      {error && (
        <ErrorState
          message={error.message}
          canRetry={error.canRetry}
          onRetry={error.canRetry ? submit : async () => {}}
        />
      )}

      <form onSubmit={handleSubmit} style={{ marginTop: '1rem', maxWidth: '480px' }}>
        {/* Organization section */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={fieldWrap}>
            <label htmlFor="org-name" style={labelStyle}>Organization Name</label>
            <input
              type="text"
              id="org-name"
              value={form.name}
              onChange={set('name')}
              disabled={loading}
              style={fieldStyle}
              placeholder="Acme Inc"
              autoComplete="off"
            />
          </div>
        </div>

        {/* Admin user section */}
        <p style={{ fontWeight: 'bold', marginBottom: '0.75rem', color: '#333' }}>
          Initial Admin User
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
          <div style={fieldWrap}>
            <label htmlFor="admin-first" style={labelStyle}>First Name</label>
            <input
              type="text"
              id="admin-first"
              value={form.adminFirstName}
              onChange={set('adminFirstName')}
              disabled={loading}
              style={fieldStyle}
              placeholder="Ahmed"
              autoComplete="given-name"
            />
          </div>

          <div style={fieldWrap}>
            <label htmlFor="admin-last" style={labelStyle}>Last Name</label>
            <input
              type="text"
              id="admin-last"
              value={form.adminLastName}
              onChange={set('adminLastName')}
              disabled={loading}
              style={fieldStyle}
              placeholder="Ali"
              autoComplete="family-name"
            />
          </div>
        </div>

        <div style={fieldWrap}>
          <label htmlFor="admin-email" style={labelStyle}>Admin Email</label>
          <input
            type="email"
            id="admin-email"
            value={form.adminEmail}
            onChange={set('adminEmail')}
            disabled={loading}
            style={fieldStyle}
            placeholder="admin@example.com"
            autoComplete="email"
          />
        </div>

        <div style={fieldWrap}>
          <label htmlFor="admin-password" style={labelStyle}>Admin Password</label>
          <input
            type="password"
            id="admin-password"
            value={form.adminPassword}
            onChange={set('adminPassword')}
            disabled={loading}
            style={fieldStyle}
            placeholder="Strong password"
            autoComplete="new-password"
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
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
