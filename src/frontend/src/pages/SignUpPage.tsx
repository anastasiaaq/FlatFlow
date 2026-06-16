import { useState } from 'react'
import type { AuthState } from '../api/generated/flatFlowAPI.schemas'
import { isApiHttpError } from '../api/fetcher'
import {
  apiUsersCreate,
  apiUsersCsrfRetrieve,
} from '../api/generated/users/users'
import {
  hasErrors,
  validateSignUpForm,
  type FieldErrors,
  type SignUpFields,
} from '../auth/validation'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'

type SignUpPageProps = {
  onAuthenticated?: (auth: AuthState) => void
  onHaveAccount?: () => void
}

type ApiErrorBody = {
  detail?: string
  email?: string[]
  password?: string[]
  display_name?: string[]
}

type SignUpResponse = {
  data: unknown
  status: number
}

function getSignUpErrorMessage(data: unknown, status?: number) {
  const body = data && typeof data === 'object' ? (data as ApiErrorBody) : null

  if (body?.email?.[0]) {
    return body.email[0]
  }

  if (body?.password?.[0]) {
    return body.password[0]
  }

  if (body?.display_name?.[0]) {
    return body.display_name[0]
  }

  if (body?.detail) {
    return body.detail
  }

  if (status === 403) {
    return 'Could not verify the session. Refresh the page and try again.'
  }

  return 'Could not create an account. Please try again.'
}

export default function SignUpPage({
  onAuthenticated,
  onHaveAccount,
}: SignUpPageProps) {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<SignUpFields>>({})

  async function submitSignUp(): Promise<SignUpResponse> {
    const payload = {
      email: email.trim(),
      display_name: displayName,
      password,
    }

    try {
      return await apiUsersCreate(payload)
    } catch (error) {
      if (isApiHttpError(error) && error.status === 403) {
        await apiUsersCsrfRetrieve()
        return apiUsersCreate(payload)
      }

      throw error
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    const validationErrors = validateSignUpForm({
      displayName,
      email,
      password,
    })
    setFieldErrors(validationErrors)

    if (hasErrors(validationErrors)) {
      return
    }

    setLoading(true)

    try {
      await apiUsersCsrfRetrieve()
      const res = await submitSignUp()

      if (res.status === 201) {
        onAuthenticated?.(res.data as AuthState)
        return
      }

      setError(getSignUpErrorMessage(res.data, res.status))
    } catch (error) {
      if (isApiHttpError(error)) {
        setError(getSignUpErrorMessage(error.body, error.status))
      } else {
        setError('Could not create an account. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen border border-[#0b0a0f] bg-[#fffef7] text-[#0b0a0f]">
      <div className="absolute inset-x-0 top-0 h-1/2 bg-[#fdd329]" />

      <main className="relative z-10 flex min-h-screen flex-col items-center px-[24px] pt-[18.5vh]">
        <div className="mb-[35px] text-[30px] font-semibold leading-tight">
          FlatFlow
        </div>

        <Card className="w-full max-w-[548px] px-[51px] pb-[36px] pt-[36px] shadow-none max-sm:px-[28px]">
          <CardHeader className="mb-[28px]">
            <CardTitle>Sign up</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col">
              <div className="space-y-[14px]">
                <Label htmlFor="signup-name">Name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  autoComplete="name"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  aria-invalid={fieldErrors.displayName ? 'true' : 'false'}
                  aria-describedby={
                    fieldErrors.displayName ? 'signup-name-error' : undefined
                  }
                  required
                />
                {fieldErrors.displayName && (
                  <p
                    id="signup-name-error"
                    className="text-[14px] text-[#cb322d]"
                  >
                    {fieldErrors.displayName}
                  </p>
                )}
              </div>

              <div className="mt-[26px] space-y-[14px]">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  aria-invalid={fieldErrors.email ? 'true' : 'false'}
                  aria-describedby={
                    fieldErrors.email ? 'signup-email-error' : undefined
                  }
                  required
                />
                {fieldErrors.email && (
                  <p
                    id="signup-email-error"
                    className="text-[14px] text-[#cb322d]"
                  >
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              <div className="mt-[26px] space-y-[14px]">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  aria-invalid={fieldErrors.password ? 'true' : 'false'}
                  aria-describedby={
                    fieldErrors.password ? 'signup-password-error' : undefined
                  }
                  required
                />
                {fieldErrors.password && (
                  <p
                    id="signup-password-error"
                    className="text-[14px] text-[#cb322d]"
                  >
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              {error && (
                <p className="mt-[16px] text-center text-[14px] font-medium text-[#cb322d]">
                  {error}
                </p>
              )}

              <div className="mt-[60px] flex justify-center">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create'}
                </Button>
              </div>

              <Button
                type="button"
                variant="ghost"
                className="mx-auto mt-[27px]"
                onClick={onHaveAccount}
              >
                I have an account
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
