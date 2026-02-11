import { useState } from 'react'
import { OrganizationList } from './components/OrganizationList'
import { OrganizationDetail } from './components/OrganizationDetail'
import { OrganizationCreate } from './components/OrganizationCreate'
import { Header } from './components/Header'
import { NavigationRail } from './components/NavigationRail'
import { WorkspaceContainer } from './components/WorkspaceContainer'

type View = 'list' | 'detail' | 'create'

function App() {
  const [view, setView] = useState<View>('list')
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null)

  const handleSelectOrganization = (id: string) => {
    setSelectedOrgId(id)
    setView('detail')
  }

  const handleCreateNew = () => {
    setView('create')
  }

  const handleBackToList = () => {
    setView('list')
    setSelectedOrgId(null)
  }

  const handleCreateSuccess = () => {
    setView('list')
    setSelectedOrgId(null)
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: '#f0f0f0',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <Header />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <NavigationRail />
        <WorkspaceContainer>
          {view === 'list' && (
            <OrganizationList
              onSelectOrganization={handleSelectOrganization}
              onCreateNew={handleCreateNew}
            />
          )}

          {view === 'detail' && selectedOrgId && (
            <OrganizationDetail
              organizationId={selectedOrgId}
              onBack={handleBackToList}
            />
          )}

          {view === 'create' && (
            <OrganizationCreate
              onBack={handleBackToList}
              onSuccess={handleCreateSuccess}
            />
          )}
        </WorkspaceContainer>
      </div>
    </div>
  )
}

export default App

