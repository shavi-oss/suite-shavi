
interface Props {
  message: string
  canRetry: boolean
  onRetry?: () => void
}

/**
 * Reusable error state component with optional retry.
 * Implements fail-closed behavior (no retry for auth errors).
 * Evidence: UI_ERROR_LOADING_CONVENTIONS.md Section 4, 5
 */
export function ErrorState({ message, canRetry, onRetry }: Props) {
  return (
    <div style={{
      padding: '1rem',
      marginBottom: '1rem',
      border: '1px solid #f5c6cb',
      borderRadius: '4px',
      backgroundColor: '#f8d7da',
      color: '#721c24',
    }}>
      <div style={{ marginBottom: canRetry && onRetry ? '0.5rem' : 0 }}>
        Error: {message}
      </div>
      {canRetry && onRetry && (
        <button onClick={onRetry}>Retry</button>
      )}
    </div>
  )
}
