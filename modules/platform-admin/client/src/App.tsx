import { useState } from 'react'
import { OrganizationList } from './components/OrganizationList'
import { OrganizationDetail } from './components/OrganizationDetail'
import { OrganizationCreate } from './components/OrganizationCreate'

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
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
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
    </div>
  )
}

export default App
