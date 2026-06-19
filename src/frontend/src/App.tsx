import { useCallback, useEffect, useState } from 'react'
import type {
  AuthState,
  UserProfile,
} from './api/generated/flatFlowAPI.schemas'
import type { Page } from './types/navigation'
import {
  apiUsersCsrfRetrieve,
  apiUsersLogoutCreate,
  apiUsersMeRetrieve,
} from './api/generated/users/users'
import {
  getAuthRedirectRoute,
  getPostLoginRoute,
  getRouteFromPath,
  routePaths,
  type AppRoute,
} from './auth/routing'
import { applyProfileToAuth } from './auth/profile'
import ProfileModal from './components/ProfileModal'
import ChoresPage from './pages/ChoresPage'
import HouseholdPage from './pages/HouseholdPage'
import HouseholdSetupPage from './pages/HouseholdSetupPage'
import LandingPage from './pages/LandingPage'
import IssuesPage from './pages/IssuesPage'
import LoginPage from './pages/LoginPage'
import RulesPage from './pages/RulesPage'
import SignUpPage from './pages/SignUpPage'

function App() {
  const [auth, setAuth] = useState<AuthState | null>(null)
  const [route, setRoute] = useState<AppRoute>(() =>
    getRouteFromPath(window.location.pathname),
  )
  const [initializing, setInitializing] = useState(true)
  const [profileOpen, setProfileOpen] = useState(false)

  const navigate = useCallback((nextRoute: AppRoute, replace = false) => {
    const path = routePaths[nextRoute]

    if (window.location.pathname !== path) {
      if (replace) {
        window.history.replaceState(null, '', path)
      } else {
        window.history.pushState(null, '', path)
      }
    }

    setRoute(nextRoute)
  }, [])

  useEffect(() => {
    const handlePopState = () => {
      setRoute(getRouteFromPath(window.location.pathname))
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    apiUsersMeRetrieve()
      .then((res) => setAuth(res.data))
      .catch(() =>
        setAuth({
          authenticated: false,
          has_household: false,
          user: null,
        }),
      )
      .finally(() => setInitializing(false))
  }, [])

  useEffect(() => {
    if (initializing) return

    const redirectRoute = getAuthRedirectRoute(route, auth)

    if (redirectRoute) {
      navigate(redirectRoute, true)
    }
  }, [auth, initializing, navigate, route])

  function handleAuthenticated(nextAuth: AuthState) {
    setAuth(nextAuth)
    navigate(getPostLoginRoute(nextAuth), true)
  }

  function handleHouseholdReady() {
    setAuth((currentAuth) => {
      if (!currentAuth) return currentAuth
      return { ...currentAuth, has_household: true }
    })
    navigate('household', true)
  }

  function handleNavNavigate(page: Page) {
    if (page === 'chores') navigate('chores')
    else if (page === 'household') navigate('household')
    else if (page === 'rules') navigate('rules')
    else if (page === 'issues') navigate('issues')
  }

  function handleHouseholdLeft() {
    setAuth((currentAuth) => {
      if (!currentAuth) return currentAuth
      return { ...currentAuth, has_household: false }
    })
    navigate('householdSetup', true)
  }

  async function handleLogout() {
    try {
      await apiUsersCsrfRetrieve()
      const res = await apiUsersLogoutCreate()
      setAuth(res.data)
    } catch {
      setAuth({
        authenticated: false,
        has_household: false,
        user: null,
      })
    } finally {
      navigate('landing', true)
    }
  }

  function handleProfileUpdated(profile: UserProfile) {
    setAuth((currentAuth) => applyProfileToAuth(currentAuth, profile))
  }

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fffef7] text-[16px] text-[#393939]">
        Loading...
      </div>
    )
  }

  const redirectRoute = getAuthRedirectRoute(route, auth)
  const activeRoute = redirectRoute ?? route

  if (activeRoute === 'chores') {
    return (
      <>
        <ChoresPage
          currentUserId={auth?.user?.id}
          currentUserName={auth?.user?.display_name}
          onLogout={handleLogout}
          onProfileOpen={() => setProfileOpen(true)}
          onNavigate={handleNavNavigate}
        />
        {profileOpen && (
          <ProfileModal
            user={auth?.user}
            onClose={() => setProfileOpen(false)}
            onProfileUpdated={handleProfileUpdated}
          />
        )}
      </>
    )
  }

  if (activeRoute === 'rules') {
    return (
      <RulesPage
        onNavigate={handleNavNavigate}
        onLogout={handleLogout}
        onProfileUpdated={handleProfileUpdated}
      />
    )
  }

  if (activeRoute === 'issues') {
    return (
      <>
        <IssuesPage
          currentUserId={auth?.user?.id}
          currentUserName={auth?.user?.display_name}
          onLogout={handleLogout}
          onProfileOpen={() => setProfileOpen(true)}
          onNavigate={handleNavNavigate}
        />
        {profileOpen && (
          <ProfileModal
            user={auth?.user}
            onClose={() => setProfileOpen(false)}
            onProfileUpdated={handleProfileUpdated}
          />
        )}
      </>
    )
  }

  if (activeRoute === 'household') {
    return (
      <>
        <HouseholdPage
          currentUserId={auth?.user?.id}
          currentUserName={auth?.user?.display_name}
          onLogout={handleLogout}
          onProfileOpen={() => setProfileOpen(true)}
          onHouseholdLeft={handleHouseholdLeft}
          onNavigate={handleNavNavigate}
        />
        {profileOpen && (
          <ProfileModal
            user={auth?.user}
            onClose={() => setProfileOpen(false)}
            onProfileUpdated={handleProfileUpdated}
          />
        )}
      </>
    )
  }

  if (activeRoute === 'householdSetup') {
    return (
      <>
        <HouseholdSetupPage
          onHouseholdReady={handleHouseholdReady}
          onLogout={handleLogout}
          userName={auth?.user?.display_name}
          onProfileOpen={() => setProfileOpen(true)}
        />
        {profileOpen && (
          <ProfileModal
            user={auth?.user}
            onClose={() => setProfileOpen(false)}
            onProfileUpdated={handleProfileUpdated}
          />
        )}
      </>
    )
  }

  if (activeRoute === 'signup') {
    return (
      <SignUpPage
        onAuthenticated={handleAuthenticated}
        onHaveAccount={() => navigate('login')}
      />
    )
  }

  if (activeRoute === 'login') {
    return (
      <LoginPage
        onAuthenticated={handleAuthenticated}
        onCreateAccount={() => navigate('signup')}
      />
    )
  }

  return (
    <LandingPage
      onAuthenticated={handleAuthenticated}
    />
  )
}

export default App
