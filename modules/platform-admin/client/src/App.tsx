import React from 'react'

function App() {
  const allowedScreens = [
    'Organization List',
    'Organization Detail',
    'Create Organization',
    'Org Mapping Management',
    'Internal User List',
    'Create Internal User',
    'User Detail',
    'Audit Log Viewer'
  ]

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <nav style={{ width: '250px', borderRight: '1px solid #ddd', padding: '1rem', backgroundColor: '#f9f9f9' }}>
        <h2 style={{ marginBottom: '1rem' }}>Platform Admin</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {allowedScreens.map((screen) => (
            <li key={screen} style={{ marginBottom: '0.5rem' }}>
              <div style={{ padding: '0.5rem', cursor: 'not-allowed', color: '#666' }}>
                {screen}
              </div>
            </li>
          ))}
        </ul>
      </nav>
      <main style={{ flex: 1, padding: '2rem' }}>
        <h1>Welcome to Platform Admin</h1>
        <p style={{ color: '#666', marginTop: '1rem' }}>
          Select a section from the navigation menu.
        </p>
        <div style={{ marginTop: '2rem', padding: '1rem', border: '1px dashed #ccc', borderRadius: '4px' }}>
          <em>Module Status: Implementation Phase (Gate 20)</em>
        </div>
      </main>
    </div>
  )
}

export default App
