import { useEffect, useState } from 'react'
import { ApiError, csrf, getCurrentUser, logoutUser, type AuthState } from './api'
import ChoresPage from './pages/ChoresPage'
import HouseholdPage from './pages/HouseholdPage'
import IssuesPage from './pages/IssuesPage'
import LoginPage from './pages/LoginPage'
import RulesPage from './pages/RulesPage'
import SignUpPage from './pages/SignUpPage'

type Page = 'household' | 'rules' | 'chores' | 'issues'
type Route = Page | 'login' | 'signup'

const PUBLIC_ROUTES = new Set<Route>(['login', 'signup'])

function getRouteFromPath(pathname: string): Route {
  const route = pathname.slice(1)

  if (
    route === 'household' ||
    route === 'rules' ||
    route === 'chores' ||
    route === 'issues' ||
    route === 'login' ||
    route === 'signup'
  ) {
    return route
  }

  return 'rules'
}

function App() {
  const [route, setRoute] = useState<Route>(() =>
    getRouteFromPath(window.location.pathname),
  )
  const [authChecked, setAuthChecked] = useState(false)
  const [appError, setAppError] = useState<string | null>(null)

  useEffect(() => {
    function handlePopState() {
      setRoute(getRouteFromPath(window.location.pathname))
      setAppError(null)
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  useEffect(() => {
    let active = true

    async function checkAuth() {
      if (PUBLIC_ROUTES.has(route)) {
        if (active) setAuthChecked(true)
        return
      }

      setAuthChecked(false)

      try {
        const response = await getCurrentUser()

        if (!response.data.authenticated) {
          window.history.replaceState(null, '', '/login')
          if (active) {
            setRoute('login')
            setAuthChecked(true)
          }
          return
        }

        if (active) setAuthChecked(true)
      } catch (err) {
        if (err instanceof ApiError && [401, 403].includes(err.status)) {
          window.history.replaceState(null, '', '/login')
          if (active) {
            setRoute('login')
            setAuthChecked(true)
          }
          return
        }

        console.error(err)
        if (active) {
          setAppError('Could not verify your session. Please try again.')
        }
      }
    }

    checkAuth()

    return () => {
      active = false
    }
  }, [route])

  function navigate(nextRoute: Route, replace = false) {
    setRoute(nextRoute)
    setAppError(null)

    const nextPath = `/${nextRoute}`
    if (replace) {
      window.history.replaceState(null, '', nextPath)
    } else {
      window.history.pushState(null, '', nextPath)
    }
  }

  function handleNavigate(nextPage: Page) {
    navigate(nextPage)
  }

  async function handleLogout() {
    try {
      await csrf()
      await logoutUser()
      navigate('login', true)
    } catch (err) {
      console.error(err)
      window.alert('Could not log out. Please try again.')
    }
  }

  function handleLoginSuccess(auth: AuthState) {
    void auth
    setAuthChecked(true)
    navigate('household', true)
  }

  function handleCreateAccount() {
    navigate('signup', true)
  }

  function handleHaveAccount() {
    navigate('login', true)
  }

  if (appError) {
    return (
      <main className="placeholder-page">
        <p className="rules-message rules-message--error">{appError}</p>
      </main>
    )
  }

  if (route === 'login') {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onCreateAccount={handleCreateAccount}
      />
    )
  }

  if (route === 'signup') {
    return (
      <SignUpPage
        onSignUpSuccess={handleLoginSuccess}
        onHaveAccount={handleHaveAccount}
      />
    )
  }

  if (!authChecked) {
    return null
  }

  if (route === 'rules') {
    return <RulesPage onNavigate={handleNavigate} onLogout={handleLogout} />
  }

  if (route === 'household') {
    return <HouseholdPage onNavigate={handleNavigate} onLogout={handleLogout} />
  }

  if (route === 'chores') {
    return <ChoresPage onNavigate={handleNavigate} onLogout={handleLogout} />
  }

  return <IssuesPage onNavigate={handleNavigate} onLogout={handleLogout} />
}

export default App
