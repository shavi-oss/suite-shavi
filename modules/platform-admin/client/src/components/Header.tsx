export function Header() {
  return (
    <header
      style={{
        height: '48px',
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        alignItems: 'center',
        padding: '0 1.5rem',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <h1
        style={{
          margin: 0,
          fontSize: '1.125rem',
          fontWeight: 600,
          color: '#1a1a1a',
        }}
      >
        Bassan Platform
      </h1>
    </header>
  )
}
