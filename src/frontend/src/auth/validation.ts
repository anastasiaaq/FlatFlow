export type FieldErrors<T extends string> = Partial<Record<T, string>>

export type LoginFields = 'email' | 'password'
export type SignUpFields = 'displayName' | 'email' | 'password'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateLoginForm(values: {
  email: string
  password: string
}): FieldErrors<LoginFields> {
  const errors: FieldErrors<LoginFields> = {}
  const email = values.email.trim()

  if (!email) {
    errors.email = 'Email is required.'
  } else if (!emailPattern.test(email)) {
    errors.email = 'Enter a valid email address.'
  }

  if (!values.password) {
    errors.password = 'Password is required.'
  }

  return errors
}

export function validateSignUpForm(values: {
  displayName: string
  email: string
  password: string
}): FieldErrors<SignUpFields> {
  const errors: FieldErrors<SignUpFields> = {}
  const displayName = values.displayName.trim()
  const email = values.email.trim()

  if (!displayName) {
    errors.displayName = 'Name is required.'
  } else if (displayName.length > 50) {
    errors.displayName = 'Name must be 50 characters or fewer.'
  }

  if (!email) {
    errors.email = 'Email is required.'
  } else if (!emailPattern.test(email)) {
    errors.email = 'Enter a valid email address.'
  }

  if (!values.password) {
    errors.password = 'Password is required.'
  } else if (values.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.'
  }

  return errors
}

export function hasErrors<T extends string>(errors: FieldErrors<T>) {
  return Object.values(errors).some(Boolean)
}
