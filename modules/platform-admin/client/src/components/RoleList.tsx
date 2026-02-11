export function RoleList() {
  const roles = [
    {
      id: 'platform_admin',
      name: 'Platform Admin',
      description: 'Full access to all platform-admin features',
      color: '#d32f2f',
    },
    {
      id: 'developer_ops',
      name: 'Developer Ops',
      description: 'Read/write orgs & mappings; read-only users; read-only audit',
      color: '#1976d2',
    },
    {
      id: 'support',
      name: 'Support',
      description: 'Read-only across resources; read-only audit',
      color: '#388e3c',
    },
    {
      id: 'viewer',
      name: 'Viewer',
      description: 'Read-only across resources; read-only audit',
      color: '#757575',
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>Roles</h2>
        <p style={{ margin: '0.5rem 0 0 0', color: '#666', fontSize: '0.875rem' }}>
          Platform admin roles are locked and cannot be modified.
        </p>
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {roles.map((role) => (
          <div
            key={role.id}
            style={{
              backgroundColor: 'white',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              padding: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
              <span
                style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  backgroundColor: role.color + '20',
                  color: role.color,
                }}
              >
                {role.name}
              </span>
            </div>
            <p style={{ margin: 0, color: '#666', fontSize: '0.875rem', lineHeight: 1.5 }}>
              {role.description}
            </p>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: '1.5rem',
          padding: '1rem',
          backgroundColor: '#f5f5f5',
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
        }}
      >
        <p style={{ margin: 0, fontSize: '0.75rem', color: '#666' }}>
          <strong>Note:</strong> Role definitions are locked per MODULE_SECURITY_LAWS.md and cannot be changed
          through this interface.
        </p>
      </div>
    </div>
  )
}
