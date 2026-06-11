import { useEffect, useState } from 'react'
import type { AuthState } from './api/generated/flatFlowAPI.schemas'
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
import HouseholdPage from './pages/HouseholdPage'
import HouseholdSetupPage from './pages/HouseholdSetupPage'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'

function App() {
  const [auth, setAuth] = useState<AuthState | null>(null)
  const [route, setRoute] = useState<AppRoute>(() =>
    getRouteFromPath(window.location.pathname),
  )
  const [initializing, setInitializing] = useState(true)

  function navigate(nextRoute: AppRoute, replace = false) {
    const path = routePaths[nextRoute]

    if (window.location.pathname !== path) {
      if (replace) {
        window.history.replaceState(null, '', path)
      } else {
        window.history.pushState(null, '', path)
      }
    }

    setRoute(nextRoute)
  }

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
      window.history.replaceState(null, '', routePaths[redirectRoute])
      queueMicrotask(() => setRoute(redirectRoute))
    }
  }, [auth, initializing, route])

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
      navigate('login', true)
    }
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

  if (activeRoute === 'household') {
    return (
      <HouseholdPage
        currentUserId={auth?.user?.id}
        currentUserName={auth?.user?.display_name}
        onLogout={handleLogout}
      />
    )
  }

  if (activeRoute === 'householdSetup') {
    return (
      <HouseholdSetupPage
        onHouseholdReady={handleHouseholdReady}
        onLogout={handleLogout}
        userName={auth?.user?.display_name}
      />
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

  return (
    <LoginPage
      onAuthenticated={handleAuthenticated}
      onCreateAccount={() => navigate('signup')}
    />
  )
}

export default App
