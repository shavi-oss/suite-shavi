type Section = 'organizations' | 'users' | 'roles'

interface NavigationRailProps {
  activeSection: Section
  onSectionChange: (section: Section) => void
}

export function NavigationRail({ activeSection, onSectionChange }: NavigationRailProps) {
  const navItemStyle = (isActive: boolean) => ({
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    backgroundColor: isActive ? '#e3f2fd' : 'transparent',
    color: isActive ? '#1976d2' : '#666',
    fontSize: '0.75rem',
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    transition: 'background-color 0.2s',
  })

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
        gap: '0.5rem',
      }}
    >
      <button
        style={navItemStyle(activeSection === 'organizations')}
        title="Organizations"
        onClick={() => onSectionChange('organizations')}
      >
        ORG
      </button>
      <button
        style={navItemStyle(activeSection === 'users')}
        title="Internal Users"
        onClick={() => onSectionChange('users')}
      >
        USR
      </button>
      <button
        style={navItemStyle(activeSection === 'roles')}
        title="Roles"
        onClick={() => onSectionChange('roles')}
      >
        ROL
      </button>
    </nav>
  )
}
