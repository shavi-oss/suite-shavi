
interface Props {
  message?: string
}

/**
 * Reusable loading state component.
 * Evidence: UI_ERROR_LOADING_CONVENTIONS.md Section 2
 */
export function LoadingState({ message = 'Loading...' }: Props) {
  return (
    <div style={{
      padding: '2rem',
      textAlign: 'center',
      color: '#666',
    }}>
      {message}
    </div>
  )
}
