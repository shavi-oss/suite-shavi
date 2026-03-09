import { useState, useEffect, FormEvent } from 'react'
import { OrganizationList } from './components/OrganizationList'
import { OrganizationDetail } from './components/OrganizationDetail'
import { OrganizationCreate } from './components/OrganizationCreate'
import { InternalUserList } from './components/InternalUserList'
import { InternalUserDetail } from './components/InternalUserDetail'
import { InternalUserCreate } from './components/InternalUserCreate'
import { RoleList } from './components/RoleList'
import { AuditLogList } from './components/AuditLogList'
import { Header } from './components/Header'
import { NavigationRail } from './components/NavigationRail'
import { WorkspaceContainer } from './components/WorkspaceContainer'
import { SetPasswordPage } from './components/SetPasswordPage'
import { getSession, login, logout } from './api/platformAdmin'

type Section = 'organizations' | 'users' | 'roles' | 'audit'
type OrgView = 'list' | 'detail' | 'create'
type UserView = 'list' | 'detail' | 'create'

// Auth status machine
// Evidence: forensic-ui-login Phase 2 — session state machine.
type AuthStatus = 'unknown' | 'anonymous' | 'authenticated' | 'error'

function App() {
  // Gate 10: detect set-password invite redemption URL
  const urlParams = new URLSearchParams(window.location.search)
  const inviteToken = urlParams.get('token')
  const inviteUid = urlParams.get('uid')
  if (inviteToken && inviteUid) {
    return <SetPasswordPage uid={inviteUid} token={inviteToken} />
  }

  // ── Auth state ───────────────────────────────────────────────────────────
  const [authStatus, setAuthStatus] = useState<AuthStatus>('unknown')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loginLoading, setLoginLoading] = useState(false)

  // ── Navigation state ──────────────────────────────────────────────────────
  const [section, setSection] = useState<Section>('organizations')

  // Organizations state
  const [orgView, setOrgView] = useState<OrgView>('list')
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null)

  // Users state
  const [userView, setUserView] = useState<UserView>('list')
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  // ── Session check on mount ────────────────────────────────────────────────
  useEffect(() => { checkAuth() }, [])

  const checkAuth = async (): Promise<boolean> => {
    try {
      await getSession()
      setAuthStatus('authenticated')
      return true
    } catch {
      setAuthStatus('anonymous')
      return false
    }
  }

  // ── Login / logout handlers ───────────────────────────────────────────────
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)
    setLoginError(null)
    try {
      await login(loginEmail, loginPassword)
      const ok = await checkAuth()
      if (!ok) {
        // Fail-closed: session must confirm before allowing access.
        setLoginError('Login failed: session could not be established. Please try again.')
      }
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Login failed. Please try again.')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    setAuthStatus('anonymous')
    setLoginEmail('')
    setLoginPassword('')
    setLoginError(null)
  }

  // ── Organizations handlers ────────────────────────────────────────────────
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

  // ── Users handlers ────────────────────────────────────────────────────────
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

  const handleSectionChange = (newSection: Section) => {
    setSection(newSection)
    if (newSection === 'organizations') {
      setOrgView('list')
      setSelectedOrgId(null)
    } else if (newSection === 'users') {
      setUserView('list')
      setSelectedUserId(null)
    }
  }

  // ── Render: loading ───────────────────────────────────────────────────────
  if (authStatus === 'unknown') {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f0f0f0',
        fontFamily: 'system-ui, sans-serif',
        color: '#666',
        fontSize: '0.875rem',
      }}>
        Verifying session…
      </div>
    )
  }

  // ── Render: login form ────────────────────────────────────────────────────
  if (authStatus === 'anonymous') {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f0f0f0',
        fontFamily: 'system-ui, sans-serif',
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '4px',
          border: '1px solid #e0e0e0',
          width: '320px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        }}>
          <h1 style={{
            margin: '0 0 0.25rem 0',
            fontSize: '1.25rem',
            fontWeight: 600,
            color: '#212121',
          }}>
            Platform Admin
          </h1>
          <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.8rem', color: '#666' }}>
            Sign in with your operator credentials.
          </p>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1rem' }}>
              <label
                htmlFor="login-email"
                style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.25rem', color: '#424242' }}
              >
                Email
              </label>
              <input
                id="login-email"
                type="email"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                required
                autoComplete="email"
                style={{
                  width: '100%',
                  padding: '0.5rem 0.625rem',
                  border: '1px solid #bdbdbd',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label
                htmlFor="login-password"
                style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.25rem', color: '#424242' }}
              >
                Password
              </label>
              <input
                id="login-password"
                type="password"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                required
                autoComplete="current-password"
                style={{
                  width: '100%',
                  padding: '0.5rem 0.625rem',
                  border: '1px solid #bdbdbd',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
            </div>

            {loginError && (
              <div style={{
                marginBottom: '1rem',
                padding: '0.625rem 0.75rem',
                backgroundColor: '#fdecea',
                border: '1px solid #f5c6cb',
                borderRadius: '4px',
                color: '#c62828',
                fontSize: '0.8125rem',
                lineHeight: 1.4,
              }}>
                {loginError}
              </div>
            )}

            <button
              id="login-submit"
              type="submit"
              disabled={loginLoading}
              style={{
                width: '100%',
                padding: '0.5625rem',
                backgroundColor: loginLoading ? '#90caf9' : '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: loginLoading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.15s',
              }}
            >
              {loginLoading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // ── Render: authenticated shell ───────────────────────────────────────────
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

          {section === 'audit' && <AuditLogList />}
        </WorkspaceContainer>
      </div>

      {/* Logout strip — minimal, bottom-anchored */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: '0.375rem 1rem',
        backgroundColor: '#fafafa',
        borderTop: '1px solid #e0e0e0',
        fontSize: '0.75rem',
        color: '#757575',
      }}>
        <button
          id="logout-button"
          onClick={handleLogout}
          style={{
            padding: '0.25rem 0.75rem',
            backgroundColor: 'transparent',
            border: '1px solid #bdbdbd',
            borderRadius: '4px',
            fontSize: '0.75rem',
            color: '#616161',
            cursor: 'pointer',
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  )
}

export default App
