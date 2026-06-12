import { useState } from 'react'
import { ApiError, csrf, registerUser, type AuthState } from '../api'

type SignUpPageProps = {
  onSignUpSuccess: (auth: AuthState) => void
  onHaveAccount: () => void
}

export default function SignUpPage({
  onSignUpSuccess,
  onHaveAccount,
}: SignUpPageProps) {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedName = displayName.trim()
    const trimmedEmail = email.trim()

    if (!trimmedName || trimmedName.length > 50) {
      setError('Preferred name must be 1-50 characters.')
      return
    }

    if (!trimmedEmail) {
      setError('Email is required.')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      await csrf()
      const response = await registerUser(trimmedName, trimmedEmail, password)
      onSignUpSuccess(response.data)
    } catch (err) {
      setError(getSignUpError(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <h1>FlatFlow</h1>
      <form className="auth-card auth-card--signup" onSubmit={handleSubmit}>
        <h2>Create an account</h2>

        <label className="auth-field" htmlFor="signup-name">
          <span>Preferred name</span>
          <input
            id="signup-name"
            value={displayName}
            onChange={(event) => {
              setDisplayName(event.target.value)
              setError(null)
            }}
          />
        </label>

        <label className="auth-field" htmlFor="signup-email">
          <span>Email</span>
          <input
            id="signup-email"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value)
              setError(null)
            }}
          />
        </label>

        <label className="auth-field" htmlFor="signup-password">
          <span>Password</span>
          <input
            id="signup-password"
            type="password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value)
              setError(null)
            }}
          />
        </label>

        {error && <p className="auth-error">{error}</p>}

        <div className="auth-actions auth-actions--signup">
          <button
            type="submit"
            className="button button--primary"
            disabled={submitting}
          >
            Sign up
          </button>
          <button
            type="button"
            className="auth-link-button"
            onClick={onHaveAccount}
          >
            I have an account
          </button>
        </div>
      </form>
    </main>
  )
}

function getSignUpError(err: unknown) {
  if (err instanceof ApiError) {
    const body = err.body

    if (body && typeof body === 'object') {
      if (
        'email' in body &&
        Array.isArray(body.email) &&
        typeof body.email[0] === 'string'
      ) {
        return body.email[0]
      }

      if (
        'password' in body &&
        Array.isArray(body.password) &&
        typeof body.password[0] === 'string'
      ) {
        return body.password[0]
      }

      if (
        'display_name' in body &&
        Array.isArray(body.display_name) &&
        typeof body.display_name[0] === 'string'
      ) {
        return body.display_name[0]
      }
    }
  }

  return 'Could not create account.'
}
