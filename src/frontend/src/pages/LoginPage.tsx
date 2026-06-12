import { useEffect, useRef, useState } from 'react'
import { ApiError, csrf, loginUser, type AuthState } from '../api'

type LoginPageProps = {
  onLoginSuccess: (auth: AuthState) => void
  onCreateAccount: () => void
}

export default function LoginPage({
  onLoginSuccess,
  onCreateAccount,
}: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const abandonedRef = useRef(false)

  useEffect(() => {
    abandonedRef.current = false

    return () => {
      abandonedRef.current = true
    }
  }, [])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!email.trim()) {
      setError('Email is required.')
      return
    }

    if (!password) {
      setError('Password is required.')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      await csrf()
      const response = await loginUser(email.trim(), password)
      if (!abandonedRef.current) onLoginSuccess(response.data)
    } catch (err) {
      if (!abandonedRef.current) setError(getLoginError(err))
    } finally {
      if (!abandonedRef.current) setSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <h1>FlatFlow</h1>
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Login</h2>

        <label className="auth-field" htmlFor="login-email">
          <span>Email</span>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value)
              setError(null)
            }}
          />
        </label>

        <label className="auth-field" htmlFor="login-password">
          <span>Password</span>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value)
              setError(null)
            }}
          />
        </label>

        {error && <p className="auth-error">{error}</p>}

        <div className="auth-actions">
          <button
            type="submit"
            className="button button--primary"
            disabled={submitting}
          >
            Log in
          </button>
          <button
            type="button"
            className="auth-link-button"
            disabled={submitting}
            onClick={onCreateAccount}
          >
            Create an account
          </button>
        </div>
      </form>
    </main>
  )
}

function getLoginError(err: unknown) {
  if (err instanceof ApiError) {
    const body = err.body

    if (
      body &&
      typeof body === 'object' &&
      'detail' in body &&
      typeof body.detail === 'string'
    ) {
      return body.detail
    }
  }

  return 'Could not log in.'
}
