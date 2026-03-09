import { useState, FormEvent } from 'react'
import { redeemInvite } from '../api/platformAdmin'

interface SetPasswordPageProps {
  uid: string
  token: string
}

/**
 * SetPasswordPage — Gate 10
 * Public page (no session required) for invited users to set their password.
 * Receives uid + token from URL query params.
 * Redirects to login on success.
 */
export function SetPasswordPage({ uid, token }: SetPasswordPageProps) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 12) {
      setError('Password must be at least 12 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    try {
      setSubmitting(true)
      await redeemInvite(uid, token, password, confirmPassword)
      setSuccess(true)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Invalid or expired invite token'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '2.5rem',
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✅</div>
          <h2 style={{ margin: '0 0 0.75rem 0', fontSize: '1.5rem', color: '#1a1a1a' }}>
            Password set successfully
          </h2>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>
            Your password has been configured. You may now log in to the platform admin console.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '1rem',
            }}
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f5f5',
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '2.5rem',
        maxWidth: '400px',
        width: '100%',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}>
        <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '1.5rem', color: '#1a1a1a' }}>
          Set your password
        </h2>
        <p style={{ color: '#666', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          Create a secure password for your platform admin account.
        </p>

        {error && (
          <div style={{
            padding: '0.75rem 1rem',
            backgroundColor: '#fde8e8',
            border: '1px solid #f5c6c6',
            borderRadius: '6px',
            color: '#d32f2f',
            fontSize: '0.875rem',
            marginBottom: '1rem',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem', color: '#333' }}>
              Password
            </label>
            <input
              id="invite-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={12}
              placeholder="At least 12 characters"
              style={{
                width: '100%',
                padding: '0.625rem 0.75rem',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                fontSize: '1rem',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem', color: '#333' }}>
              Confirm Password
            </label>
            <input
              id="invite-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              placeholder="Repeat password"
              style={{
                width: '100%',
                padding: '0.625rem 0.75rem',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                fontSize: '1rem',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            id="invite-submit"
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: submitting ? '#ccc' : '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: '1rem',
            }}
          >
            {submitting ? 'Setting password...' : 'Set Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
