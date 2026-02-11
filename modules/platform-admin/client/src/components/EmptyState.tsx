
interface Props {
  message: string
  actionLabel?: string
  onAction?: () => void
}

/**
 * Reusable empty state component.
 * Evidence: UI_ERROR_LOADING_CONVENTIONS.md Section 3
 */
export function EmptyState({ message, actionLabel, onAction }: Props) {
  return (
    <div style={{
      padding: '2rem',
      textAlign: 'center',
      color: '#666',
    }}>
      <p>{message}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} style={{ marginTop: '1rem' }}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}
