import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import HouseholdPage from './pages/HouseholdPage'
import LoginPage from './pages/LoginPage'
import RulesPage from './pages/RulesPage'
import SignUpPage from './pages/SignUpPage'
import { csrf, getCurrentUser, logoutUser, type AuthState } from './api'

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
      } catch {
        window.history.replaceState(null, '', '/login')
        if (active) {
          setRoute('login')
          setAuthChecked(true)
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
    } finally {
      navigate('login', true)
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

  return (
    <div className="page-shell">
      <Navbar
        activePage={route}
        householdName="Girls 039"
        userName="Katia"
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />
      <main className="placeholder-page">
        <h1>{route.charAt(0).toUpperCase() + route.slice(1)}</h1>
      </main>
      <footer className="app-footer">
        © 2026 Bratiuk, Horalevych, Dvoilenko, Tsepkalo
      </footer>
    </div>
  )
}

export default App
