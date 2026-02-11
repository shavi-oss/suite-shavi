export function NavigationRail() {
  return (
    <nav
      style={{
        width: '60px',
        backgroundColor: '#f8f9fa',
        borderRight: '1px solid #e0e0e0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '1rem 0',
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '4px',
          backgroundColor: '#e3f2fd',
          color: '#1976d2',
          fontSize: '0.75rem',
          fontWeight: 600,
          cursor: 'pointer',
        }}
        title="Organizations"
      >
        ORG
      </div>
    </nav>
  )
}
