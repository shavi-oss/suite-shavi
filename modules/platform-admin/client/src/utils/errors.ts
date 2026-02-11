// Normalized error model and safe message mapping

export interface NormalizedError {
  message: string
  isAuthError: boolean
  canRetry: boolean
}

/**
 * Normalize HTTP errors to safe, user-friendly messages.
 * Implements fail-closed behavior for 401/403.
 * 
 * Evidence: UI_ERROR_LOADING_CONVENTIONS.md Section 4.3
 */
export function normalizeError(error: unknown): NormalizedError {
  // Network or timeout errors
  if (error instanceof TypeError) {
    return {
      message: 'Network error. Please check your connection.',
      isAuthError: false,
      canRetry: true,
    }
  }

  // Error with message (from fetch wrapper)
  if (error instanceof Error) {
    const message = error.message

    // Authorization failures (fail-closed)
    if (message.includes('Unauthorized')) {
      return {
        message: 'Unauthorized access. Please contact your administrator.',
        isAuthError: true,
        canRetry: false, // Cannot retry auth failures
      }
    }

    // Timeout
    if (message.includes('timed out') || message.includes('timeout')) {
      return {
        message: 'Request timed out. Please try again.',
        isAuthError: false,
        canRetry: true,
      }
    }

    // Not found
    if (message.includes('not found')) {
      return {
        message: 'Resource not found.',
        isAuthError: false,
        canRetry: false,
      }
    }

    // Invalid request
    if (message.includes('Invalid') || message.includes('Bad Request')) {
      return {
        message: 'Invalid request. Please check your input.',
        isAuthError: false,
        canRetry: false,
      }
    }

    // Generic error with existing message
    return {
      message: message || 'An error occurred. Please try again.',
      isAuthError: false,
      canRetry: true,
    }
  }

  // Unknown error type
  return {
    message: 'An error occurred. Please try again.',
    isAuthError: false,
    canRetry: true,
  }
}
