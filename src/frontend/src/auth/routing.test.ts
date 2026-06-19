import { describe, expect, it } from 'vitest'
import type { AuthState } from '../api/generated/flatFlowAPI.schemas'
import {
  getAuthRedirectRoute,
  getPostLoginRoute,
  getRouteFromPath,
} from './routing'

const unauthenticated: AuthState = {
  authenticated: false,
  has_household: false,
  user: null,
}

const userWithoutHousehold: AuthState = {
  authenticated: true,
  has_household: false,
  user: { id: 1, email: 'a@example.com', display_name: 'Ada' },
}

const userWithHousehold: AuthState = {
  authenticated: true,
  has_household: true,
  user: { id: 1, email: 'a@example.com', display_name: 'Ada' },
}

describe('auth routing', () => {
  it('maps browser paths to app routes', () => {
    expect(getRouteFromPath('/signup')).toBe('signup')
    expect(getRouteFromPath('/signup/welcome')).toBe('signup')
    expect(getRouteFromPath('/household/setup')).toBe('householdSetup')
    expect(getRouteFromPath('/household')).toBe('household')
    expect(getRouteFromPath('/issues')).toBe('issues')
    expect(getRouteFromPath('/issues/12')).toBe('issues')
    expect(getRouteFromPath('/householding')).toBe('login')
    expect(getRouteFromPath('/unknown')).toBe('login')
  })

  it('redirects unauthenticated users away from protected routes', () => {
    expect(getAuthRedirectRoute('household', unauthenticated)).toBe('login')
    expect(getAuthRedirectRoute('issues', unauthenticated)).toBe('login')
    expect(getAuthRedirectRoute('householdSetup', null)).toBe('login')
  })

  it('redirects authenticated users based on household membership', () => {
    expect(getPostLoginRoute(userWithHousehold)).toBe('household')
    expect(getPostLoginRoute(userWithoutHousehold)).toBe('householdSetup')
    expect(getAuthRedirectRoute('login', userWithHousehold)).toBe('household')
    expect(getAuthRedirectRoute('login', userWithoutHousehold)).toBe(
      'householdSetup',
    )
  })

  it('keeps users on the route that matches their household status', () => {
    expect(getAuthRedirectRoute('household', userWithHousehold)).toBeNull()
    expect(getAuthRedirectRoute('issues', userWithHousehold)).toBeNull()
    expect(getAuthRedirectRoute('householdSetup', userWithoutHousehold)).toBeNull()
    expect(getAuthRedirectRoute('household', userWithoutHousehold)).toBe(
      'householdSetup',
    )
    expect(getAuthRedirectRoute('issues', userWithoutHousehold)).toBe(
      'householdSetup',
    )
    expect(getAuthRedirectRoute('householdSetup', userWithHousehold)).toBe(
      'household',
    )
  })
})
