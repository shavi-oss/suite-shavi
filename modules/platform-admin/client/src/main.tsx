import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary'

// Global error handlers for fail-closed runtime safety
window.onerror = (_message, _source, _lineno, _colno, _error) => {
  // Fail-closed: no logging, no exposure, no mutation
  return true
}

window.onunhandledrejection = (_event) => {
  // Fail-closed: no logging, no exposure, no mutation
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
