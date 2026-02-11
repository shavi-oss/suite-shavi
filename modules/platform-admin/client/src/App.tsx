import { useState } from 'react'
import { OrganizationList } from './components/OrganizationList'
import { OrganizationDetail } from './components/OrganizationDetail'
import { OrganizationCreate } from './components/OrganizationCreate'
import { InternalUserList } from './components/InternalUserList'
import { InternalUserDetail } from './components/InternalUserDetail'
import { InternalUserCreate } from './components/InternalUserCreate'
import { RoleList } from './components/RoleList'
import { Header } from './components/Header'
import { NavigationRail } from './components/NavigationRail'
import { WorkspaceContainer } from './components/WorkspaceContainer'

type Section = 'organizations' | 'users' | 'roles'
type OrgView = 'list' | 'detail' | 'create'
type UserView = 'list' | 'detail' | 'create'

function App() {
  const [section, setSection] = useState<Section>('organizations')
  
  // Organizations state
  const [orgView, setOrgView] = useState<OrgView>('list')
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null)

  // Users state
  const [userView, setUserView] = useState<UserView>('list')
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  // Organizations handlers
  const handleSelectOrganization = (id: string) => {
    setSelectedOrgId(id)
    setOrgView('detail')
  }

  const handleCreateNewOrg = () => {
    setOrgView('create')
  }

  const handleBackToOrgList = () => {
    setOrgView('list')
    setSelectedOrgId(null)
  }

  const handleOrgCreateSuccess = () => {
    setOrgView('list')
    setSelectedOrgId(null)
  }

  // Users handlers
  const handleSelectUser = (id: string) => {
    setSelectedUserId(id)
    setUserView('detail')
  }

  const handleCreateNewUser = () => {
    setUserView('create')
  }

  const handleBackToUserList = () => {
    setUserView('list')
    setSelectedUserId(null)
  }

  const handleUserCreateSuccess = () => {
    setUserView('list')
    setSelectedUserId(null)
  }

  // Section navigation handler
  const handleSectionChange = (newSection: Section) => {
    setSection(newSection)
    // Reset views when switching sections
    if (newSection === 'organizations') {
      setOrgView('list')
      setSelectedOrgId(null)
    } else if (newSection === 'users') {
      setUserView('list')
      setSelectedUserId(null)
    }
    // roles section has no view state to reset
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
        <NavigationRail activeSection={section} onSectionChange={handleSectionChange} />
        <WorkspaceContainer>
          {section === 'organizations' && (
            <>
              {orgView === 'list' && (
                <OrganizationList
                  onSelectOrganization={handleSelectOrganization}
                  onCreateNew={handleCreateNewOrg}
                />
              )}

              {orgView === 'detail' && selectedOrgId && (
                <OrganizationDetail
                  organizationId={selectedOrgId}
                  onBack={handleBackToOrgList}
                />
              )}

              {orgView === 'create' && (
                <OrganizationCreate
                  onBack={handleBackToOrgList}
                  onSuccess={handleOrgCreateSuccess}
                />
              )}
            </>
          )}

          {section === 'users' && (
            <>
              {userView === 'list' && (
                <InternalUserList
                  onSelectUser={handleSelectUser}
                  onCreateNew={handleCreateNewUser}
                />
              )}

              {userView === 'detail' && selectedUserId && (
                <InternalUserDetail
                  userId={selectedUserId}
                  onBack={handleBackToUserList}
                />
              )}

              {userView === 'create' && (
                <InternalUserCreate
                  onBack={handleBackToUserList}
                  onSuccess={handleUserCreateSuccess}
                />
              )}
            </>
          )}

          {section === 'roles' && <RoleList />}
        </WorkspaceContainer>
      </div>
    </div>
  )
}

export default App

