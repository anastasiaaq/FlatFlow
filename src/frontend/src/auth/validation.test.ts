import { describe, expect, it } from 'vitest'
import { validateLoginForm, validateSignUpForm } from './validation'

describe('auth form validation', () => {
  it('validates login fields before submitting', () => {
    expect(validateLoginForm({ email: '', password: '' })).toEqual({
      email: 'Email is required.',
      password: 'Password is required.',
    })

    expect(
      validateLoginForm({ email: 'not-an-email', password: 'password123' }),
    ).toEqual({
      email: 'Enter a valid email address.',
    })

    expect(
      validateLoginForm({ email: 'user@example.com', password: 'password123' }),
    ).toEqual({})
  })

  it('validates registration fields before submitting', () => {
    expect(
      validateSignUpForm({
        displayName: '',
        email: '',
        password: 'short',
      }),
    ).toEqual({
      displayName: 'Name is required.',
      email: 'Email is required.',
      password: 'Password must be at least 8 characters.',
    })

    expect(
      validateSignUpForm({
        displayName: 'Ada',
        email: 'ada@example.com',
        password: 'password123',
      }),
    ).toEqual({})
  })
})
