import { describe, expect, it } from 'vitest'
import type { AuthState } from '../api/generated/flatFlowAPI.schemas'
import {
  applyProfileToAuth,
  getProfileViewModel,
  validateDisplayName,
} from './profile'

const auth: AuthState = {
  authenticated: true,
  has_household: true,
  user: {
    id: 7,
    email: 'katia@example.com',
    display_name: 'Katia',
  },
}

describe('profile', () => {
  it('shows the current user display name and email', () => {
    expect(getProfileViewModel(auth.user)).toEqual({
      displayName: 'Katia',
      email: 'katia@example.com',
    })
  })

  it('validates display name before editing', () => {
    expect(validateDisplayName('')).toBe('Display name is required.')
    expect(validateDisplayName('   ')).toBe('Display name is required.')
    expect(validateDisplayName('a'.repeat(51))).toBe(
      'Display name must be 50 characters or fewer.',
    )
    expect(validateDisplayName('Ada')).toBeNull()
  })

  it('applies a successful profile edit to auth state immediately', () => {
    expect(
      applyProfileToAuth(auth, {
        display_name: 'Ada',
        email: 'ada@example.com',
      }),
    ).toMatchObject({
      user: {
        display_name: 'Ada',
        email: 'ada@example.com',
      },
    })
  })
})
