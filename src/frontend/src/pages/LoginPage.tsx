import { useState } from 'react'
import {
  apiUsersCsrfRetrieve,
  apiUsersLoginCreate,
} from '../api/generated/users/users'
import type { AuthState } from '../api/generated/flatFlowAPI.schemas'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'

type LoginPageProps = {
  onAuthenticated?: (auth: AuthState) => void
  onCreateAccount?: () => void
}

type ApiErrorBody = {
  detail?: string
}

type LoginResponse = {
  data: unknown
  status: number
}

function getLoginErrorMessage(data: unknown, status?: number) {
  const detail = data && typeof data === 'object' ? (data as ApiErrorBody).detail : undefined

  if (
    typeof detail === 'string' &&
    detail.length > 0
  ) {
    return detail
  }

  if (status === 401) {
    return 'Invalid email or password.'
  }

  if (status === 403) {
    return 'Could not verify the session. Refresh the page and try again.'
  }

  return 'Could not log in. Please try again.'
}

export default function LoginPage({
  onAuthenticated,
  onCreateAccount,
}: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await apiUsersCsrfRetrieve()
      let res: LoginResponse = await apiUsersLoginCreate({ email, password })

      if (res.status === 403) {
        await apiUsersCsrfRetrieve()
        res = await apiUsersLoginCreate({ email, password })
      }

      if (res.status === 200) {
        onAuthenticated?.(res.data as AuthState)
        return
      }

      setError(getLoginErrorMessage(res.data, res.status))
    } catch {
      setError('Could not log in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen border border-[#0b0a0f] bg-[#fffef7] text-[#0b0a0f]">
      <div className="absolute inset-x-0 top-0 h-1/2 bg-[#fdd329]" />

      <main className="relative z-10 flex min-h-screen flex-col items-center px-[24px] pt-[21vh]">
        <div className="mb-[35px] text-[30px] font-semibold leading-tight">
          FlatFlow
        </div>

        <Card className="w-full max-w-[548px] px-[51px] pb-[36px] pt-[36px] shadow-none max-sm:px-[28px]">
          <CardHeader className="mb-[28px]">
            <CardTitle>Login</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col">
              <div className="space-y-[14px]">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>

              <div className="mt-[26px] space-y-[14px]">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>

              {error && (
                <p className="mt-[16px] text-center text-[14px] font-medium text-[#cb322d]">
                  {error}
                </p>
              )}

              <div className="mt-[60px] flex justify-center">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Logging in...' : 'Log in'}
                </Button>
              </div>

              <Button
                variant="ghost"
                className="mx-auto mt-[27px]"
                onClick={onCreateAccount}
              >
                Create an Account
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
