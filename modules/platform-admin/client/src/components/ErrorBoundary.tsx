import React from 'react'
import { ErrorState } from './ErrorState'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
}

/**
 * React ErrorBoundary for fail-closed runtime crash containment.
 * Evidence: GATE_42_AUTHORIZATION.md Section 3
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(_error: Error): State {
    return { hasError: true }
  }

  componentDidCatch(_error: Error, _errorInfo: React.ErrorInfo): void {
    // Fail-closed: no logging, no telemetry, no mutation
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorState
          message="An unexpected error occurred"
          canRetry={false}
        />
      )
    }

    return this.props.children
  }
}
