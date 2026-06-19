import { useState } from 'react'
import type { AuthState } from '../api/generated/flatFlowAPI.schemas'
import { isApiHttpError } from '../api/fetcher'
import {
  apiUsersCreate,
  apiUsersCsrfRetrieve,
  apiUsersLoginCreate,
} from '../api/generated/users/users'
import {
  hasErrors,
  validateLoginForm,
  validateSignUpForm,
  type FieldErrors,
  type LoginFields,
  type SignUpFields,
} from '../auth/validation'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'

type LandingPageProps = {
  onLogin?: () => void
  onAuthenticated?: (auth: AuthState) => void
}

const featureCards = [
  {
    title: 'Chores without the awkward audit',
    body: 'Assign recurring tasks, rotate ownership, and see what is already covered before anyone has to ask.',
  },
  {
    title: 'House rules that stay findable',
    body: 'Keep the tiny agreements about guests, quiet hours, bills, and shared spaces in one calm place.',
  },
  {
    title: 'Issues reported, not just vented',
    body: 'Log anything that needs fixing, track it from open to resolved, and keep a shared record so nothing stays quietly broken.',
  },
]

type ApiSignUpErrorBody = {
  detail?: string
  email?: string[]
  password?: string[]
  display_name?: string[]
}

type ApiLoginErrorBody = {
  detail?: string
}

function getSignUpErrorMessage(data: unknown, status?: number) {
  const body =
    data && typeof data === 'object' ? (data as ApiSignUpErrorBody) : null
  if (body?.email?.[0]) return body.email[0]
  if (body?.password?.[0]) return body.password[0]
  if (body?.display_name?.[0]) return body.display_name[0]
  if (body?.detail) return body.detail
  if (status === 403)
    return 'Could not verify the session. Refresh the page and try again.'
  return 'Could not create an account. Please try again.'
}

function getLoginErrorMessage(data: unknown, status?: number) {
  const detail =
    data && typeof data === 'object'
      ? (data as ApiLoginErrorBody).detail
      : undefined
  if (typeof detail === 'string' && detail.length > 0) return detail
  if (status === 401) return 'Invalid email or password.'
  if (status === 403)
    return 'Could not verify the session. Refresh the page and try again.'
  return 'Could not log in. Please try again.'
}

export default function LandingPage({
  onLogin,
  onAuthenticated,
}: LandingPageProps) {
  const [formMode, setFormMode] = useState<'signup' | 'login'>('signup')
  const [ctaHighlight, setCtaHighlight] = useState<'signup' | 'login'>('signup')
  const [displayName, setDisplayName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupLoading, setSignupLoading] = useState(false)
  const [signupError, setSignupError] = useState<string | null>(null)
  const [signupFieldErrors, setSignupFieldErrors] = useState<
    FieldErrors<SignUpFields>
  >({})

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loginFieldErrors, setLoginFieldErrors] = useState<
    FieldErrors<LoginFields>
  >({})

  function switchToLogin() {
    setLoginEmail(signupEmail)
    setLoginPassword('')
    setLoginError(null)
    setLoginFieldErrors({})
    setFormMode('login')
  }

  function switchToSignup() {
    setSignupEmail(loginEmail)
    setSignupError(null)
    setSignupFieldErrors({})
    setFormMode('signup')
  }

  async function handleSignupSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSignupError(null)

    const validationErrors = validateSignUpForm({
      displayName,
      email: signupEmail,
      password: signupPassword,
    })
    setSignupFieldErrors(validationErrors)
    if (hasErrors(validationErrors)) return

    setSignupLoading(true)
    const payload = {
      email: signupEmail.trim(),
      display_name: displayName.trim(),
      password: signupPassword,
    }

    try {
      let res
      try {
        res = await apiUsersCreate(payload)
      } catch (err) {
        if (isApiHttpError(err) && err.status === 403) {
          await apiUsersCsrfRetrieve()
          res = await apiUsersCreate(payload)
        } else {
          throw err
        }
      }
      if (res.status === 201) {
        onAuthenticated?.(res.data as AuthState)
        return
      }
      setSignupError(getSignUpErrorMessage(res.data, res.status))
    } catch (err) {
      if (isApiHttpError(err)) {
        setSignupError(getSignUpErrorMessage(err.body, err.status))
      } else {
        setSignupError('Could not create an account. Please try again.')
      }
    } finally {
      setSignupLoading(false)
    }
  }

  async function handleLoginSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoginError(null)

    const validationErrors = validateLoginForm({
      email: loginEmail,
      password: loginPassword,
    })
    setLoginFieldErrors(validationErrors)
    if (hasErrors(validationErrors)) return

    setLoginLoading(true)

    try {
      let res
      try {
        res = await apiUsersLoginCreate({
          email: loginEmail.trim(),
          password: loginPassword,
        })
      } catch (err) {
        if (isApiHttpError(err) && err.status === 403) {
          await apiUsersCsrfRetrieve()
          res = await apiUsersLoginCreate({
            email: loginEmail.trim(),
            password: loginPassword,
          })
        } else {
          throw err
        }
      }
      if (res.status === 200) {
        onAuthenticated?.(res.data as AuthState)
        return
      }
      setLoginError(getLoginErrorMessage(res.data, res.status))
    } catch (err) {
      if (isApiHttpError(err)) {
        setLoginError(getLoginErrorMessage(err.body, err.status))
      } else {
        setLoginError('Could not log in. Please try again.')
      }
    } finally {
      setLoginLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fffef7] text-[#0b0a0f]">
      <header className="sticky top-0 z-20 border-b border-[#0b0a0f] bg-[#fdd329]">
        <div className="mx-auto flex min-h-[78px] w-full max-w-[1180px] items-center justify-between gap-[18px] px-[24px]">
          <div className="text-[30px] font-semibold leading-tight">FlatFlow</div>
        </div>
      </header>

      <main>
        <section className="border-b border-[#0b0a0f] bg-[#fdd329]">
          <div className="mx-auto grid min-h-[calc(100vh-78px)] w-full max-w-[1180px] grid-cols-[minmax(0,1fr)_minmax(320px,470px)] items-center gap-[58px] px-[24px] py-[56px] max-md:grid-cols-1 max-md:items-start max-md:gap-[36px] max-md:py-[38px]">
            <div className="max-w-[610px]">
              <p className="mb-[18px] text-[15px] font-semibold uppercase tracking-normal">
                Shared living, less friction
              </p>
              <h1 className="m-0 text-[86px] font-semibold leading-[0.95] tracking-normal max-lg:text-[68px] max-sm:text-[44px]">
                Make the flat run like people actually live there.
              </h1>
              <p className="mt-[28px] max-w-[540px] text-[19px] leading-[1.55] text-[#26251f]">
                FlatFlow gives roommates one place for chores, house rules, and
                household decisions, so the work is visible before it turns into
                a group chat spiral.
              </p>
            </div>

            <Card className="w-full px-[32px] pb-[32px] pt-[28px] shadow-none">
              {formMode === 'signup' ? (
                <>
                  <CardHeader className="mb-[24px]">
                    <CardTitle>Sign up</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSignupSubmit} className="flex flex-col">
                      <div className="space-y-[14px]">
                        <Label htmlFor="hero-name">Name</Label>
                        <Input
                          id="hero-name"
                          type="text"
                          autoComplete="name"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          aria-invalid={
                            signupFieldErrors.displayName ? 'true' : 'false'
                          }
                          aria-describedby={
                            signupFieldErrors.displayName
                              ? 'hero-name-error'
                              : undefined
                          }
                          required
                        />
                        {signupFieldErrors.displayName && (
                          <p
                            id="hero-name-error"
                            className="text-[14px] text-[#cb322d]"
                          >
                            {signupFieldErrors.displayName}
                          </p>
                        )}
                      </div>

                      <div className="mt-[20px] space-y-[14px]">
                        <Label htmlFor="hero-email">Email</Label>
                        <Input
                          id="hero-email"
                          type="email"
                          autoComplete="email"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          aria-invalid={
                            signupFieldErrors.email ? 'true' : 'false'
                          }
                          aria-describedby={
                            signupFieldErrors.email
                              ? 'hero-email-error'
                              : undefined
                          }
                          required
                        />
                        {signupFieldErrors.email && (
                          <p
                            id="hero-email-error"
                            className="text-[14px] text-[#cb322d]"
                          >
                            {signupFieldErrors.email}
                          </p>
                        )}
                      </div>

                      <div className="mt-[20px] space-y-[14px]">
                        <Label htmlFor="hero-password">Password</Label>
                        <Input
                          id="hero-password"
                          type="password"
                          autoComplete="new-password"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          aria-invalid={
                            signupFieldErrors.password ? 'true' : 'false'
                          }
                          aria-describedby={
                            signupFieldErrors.password
                              ? 'hero-password-error'
                              : undefined
                          }
                          required
                        />
                        {signupFieldErrors.password && (
                          <p
                            id="hero-password-error"
                            className="text-[14px] text-[#cb322d]"
                          >
                            {signupFieldErrors.password}
                          </p>
                        )}
                      </div>

                      {signupError && (
                        <p className="mt-[16px] text-center text-[14px] font-medium text-[#cb322d]">
                          {signupError}
                        </p>
                      )}

                      <div className="mt-[32px] flex justify-center">
                        <Button type="submit" disabled={signupLoading}>
                          {signupLoading ? 'Creating...' : 'Create account'}
                        </Button>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        className="mx-auto mt-[20px]"
                        onClick={switchToLogin}
                      >
                        I have an account
                      </Button>
                    </form>
                  </CardContent>
                </>
              ) : (
                <>
                  <CardHeader className="mb-[24px]">
                    <CardTitle>Log in</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleLoginSubmit} className="flex flex-col">
                      <div className="space-y-[14px]">
                        <Label htmlFor="hero-login-email">Email</Label>
                        <Input
                          id="hero-login-email"
                          type="email"
                          autoComplete="email"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          aria-invalid={
                            loginFieldErrors.email ? 'true' : 'false'
                          }
                          aria-describedby={
                            loginFieldErrors.email
                              ? 'hero-login-email-error'
                              : undefined
                          }
                          required
                        />
                        {loginFieldErrors.email && (
                          <p
                            id="hero-login-email-error"
                            className="text-[14px] text-[#cb322d]"
                          >
                            {loginFieldErrors.email}
                          </p>
                        )}
                      </div>

                      <div className="mt-[20px] space-y-[14px]">
                        <Label htmlFor="hero-login-password">Password</Label>
                        <Input
                          id="hero-login-password"
                          type="password"
                          autoComplete="current-password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          aria-invalid={
                            loginFieldErrors.password ? 'true' : 'false'
                          }
                          aria-describedby={
                            loginFieldErrors.password
                              ? 'hero-login-password-error'
                              : undefined
                          }
                          required
                        />
                        {loginFieldErrors.password && (
                          <p
                            id="hero-login-password-error"
                            className="text-[14px] text-[#cb322d]"
                          >
                            {loginFieldErrors.password}
                          </p>
                        )}
                      </div>

                      {loginError && (
                        <p className="mt-[16px] text-center text-[14px] font-medium text-[#cb322d]">
                          {loginError}
                        </p>
                      )}

                      <div className="mt-[32px] flex justify-center">
                        <Button type="submit" disabled={loginLoading}>
                          {loginLoading ? 'Logging in...' : 'Log in'}
                        </Button>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        className="mx-auto mt-[20px]"
                        onClick={switchToSignup}
                      >
                        Create an account
                      </Button>
                    </form>
                  </CardContent>
                </>
              )}
            </Card>
          </div>
        </section>

        <section className="border-b border-[#d8d8bd] px-[24px] py-[68px]">
          <div className="mx-auto grid w-full max-w-[1180px] grid-cols-3 gap-[18px] max-md:grid-cols-1">
            {featureCards.map((feature) => (
              <article
                key={feature.title}
                className="min-h-[210px] border border-[#d8d8bd] bg-[#f8f8ed] p-[26px]"
              >
                <h2 className="m-0 text-[24px] leading-[1.12]">
                  {feature.title}
                </h2>
                <p className="m-0 mt-[18px] text-[16px] leading-[1.55] text-[#393939]">
                  {feature.body}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="px-[24px] py-[72px]">
          <div className="mx-auto grid w-full max-w-[1180px] grid-cols-[0.95fr_1.05fr] items-center gap-[54px] max-md:grid-cols-1">
            <div>
              <p className="m-0 text-[15px] font-semibold uppercase">
                Everything the lease leaves out
              </p>
              <h2 className="m-0 mt-[14px] text-[42px] font-semibold leading-[1.05] max-sm:text-[34px]">
                The app for everything too small for a lease and too important
                to remember perfectly.
              </h2>
            </div>
            <div className="grid gap-[14px] text-[17px] leading-[1.55] text-[#393939]">
              <p className="m-0 border-l-[6px] border-[#fdd329] pl-[18px]">
                Give every recurring chore an owner, not a detective story.
              </p>
              <p className="m-0 border-l-[6px] border-[#c9efe4] pl-[18px]">
                Turn house norms into shared reference points instead of private
                assumptions.
              </p>
              <p className="m-0 border-l-[6px] border-[#f5b7a7] pl-[18px]">
                Keep household setup clear when someone joins, leaves, or just
                forgets whose week it is.
              </p>
            </div>
          </div>
        </section>

        <section className="border-y border-[#0b0a0f] bg-[#0b0a0f] px-[24px] py-[62px] text-[#fffef7]">
          <div className="mx-auto flex w-full max-w-[1180px] items-center justify-between gap-[28px] max-md:flex-col max-md:items-start">
            <div>
              <h2 className="m-0 text-[38px] font-semibold leading-tight max-sm:text-[31px]">
                Ready to make the flat feel lighter?
              </h2>
              <p className="m-0 mt-[12px] max-w-[620px] text-[17px] leading-[1.5] text-[#f8f8ed]">
                Create a household, invite your people, and give the shared work
                somewhere honest to live.
              </p>
            </div>
            <div
              className="relative flex h-[38px] overflow-hidden rounded-[7px] border border-[#fffef7]"
              onMouseLeave={() => setCtaHighlight('signup')}
            >
              {/* Sliding yellow pill */}
              <div
                className="absolute inset-y-0 left-0 w-1/2 bg-[#fdd329]"
                style={{
                  transform: ctaHighlight === 'login' ? 'translateX(100%)' : 'translateX(0)',
                  transition: 'transform 220ms ease',
                }}
              />
              {/* White text — visible on dark bg */}
              <div className="pointer-events-none absolute inset-0 z-10 flex select-none text-[#fffef7]">
                <span className="flex w-1/2 items-center justify-center text-[16px] font-medium uppercase">Sign up</span>
                <span className="flex w-1/2 items-center justify-center text-[16px] font-medium uppercase">Log in</span>
              </div>
              {/* Dark text — clipped to yellow pill */}
              <div
                className="pointer-events-none absolute inset-0 z-20 flex select-none text-[#0b0a0f]"
                style={{
                  clipPath: ctaHighlight === 'login' ? 'inset(0 0 0 50%)' : 'inset(0 50% 0 0)',
                  transition: 'clip-path 220ms ease',
                }}
              >
                <span className="flex w-1/2 items-center justify-center text-[16px] font-medium uppercase">Sign up</span>
                <span className="flex w-1/2 items-center justify-center text-[16px] font-medium uppercase">Log in</span>
              </div>
              {/* Clickable areas */}
              <button
                type="button"
                aria-label="Sign up"
                className="relative z-30 h-full w-[120px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0b0a0f]"
                onMouseEnter={() => setCtaHighlight('signup')}
                onClick={() => {
                  setFormMode('signup')
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              />
              <button
                type="button"
                aria-label="Log in"
                className="relative z-30 h-full w-[120px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0b0a0f]"
                onMouseEnter={() => setCtaHighlight('login')}
                onClick={() => {
                  switchToLogin()
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#0b0a0f] bg-[#fdd329] px-[24px] py-[36px]">
        <div className="mx-auto flex w-full max-w-[1180px] items-end justify-between gap-[18px] max-sm:flex-col max-sm:items-start">
          <div>
            <p className="m-0 text-[28px] font-semibold leading-tight">
              FlatFlow
            </p>
            <p className="m-0 mt-[6px] text-[14px] text-[#26251f]">
              Less friction, more flat.
            </p>
          </div>
          <p className="m-0 pb-[2px] text-[13px] text-[#595742]">© 2026 Bratiuk, Horalevych, Dvoilenko, Tsepkalo</p>
        </div>
      </footer>
    </div>
  )
}
