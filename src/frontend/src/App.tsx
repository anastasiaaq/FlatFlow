import { useState } from 'react'
import HouseholdPage from './pages/HouseholdPage'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import type { AuthState } from './api/generated/flatFlowAPI.schemas'

function App() {
  const [auth, setAuth] = useState<AuthState | null>(null)
  const [authView, setAuthView] = useState<'login' | 'signup'>('login')
  const showHousehold = window.location.pathname.includes('household')

  if (auth?.authenticated || showHousehold) {
    return <HouseholdPage currentUserId={auth?.user?.id} />
  }

  if (authView === 'signup') {
    return (
      <SignUpPage
        onAuthenticated={setAuth}
        onHaveAccount={() => setAuthView('login')}
      />
    )
  }

  return (
    <LoginPage
      onAuthenticated={setAuth}
      onCreateAccount={() => setAuthView('signup')}
    />
  )
}

export default App
