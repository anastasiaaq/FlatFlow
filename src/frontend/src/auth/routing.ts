import type { AuthState } from '../api/generated/flatFlowAPI.schemas'

export type AppRoute = 'login' | 'signup' | 'household' | 'householdSetup'

export const routePaths: Record<AppRoute, string> = {
  login: '/login',
  signup: '/signup',
  household: '/household',
  householdSetup: '/household/setup',
}

export function getRouteFromPath(pathname: string): AppRoute {
  if (pathname.startsWith(routePaths.signup)) return 'signup'
  if (pathname.startsWith(routePaths.householdSetup)) return 'householdSetup'
  if (pathname.startsWith(routePaths.household)) return 'household'
  return 'login'
}

export function isProtectedRoute(route: AppRoute) {
  return route === 'household' || route === 'householdSetup'
}

export function getPostLoginRoute(auth: AuthState): AppRoute {
  return auth.has_household ? 'household' : 'householdSetup'
}

export function getAuthRedirectRoute(
  route: AppRoute,
  auth: AuthState | null,
): AppRoute | null {
  const isAuthenticated = auth?.authenticated === true

  if (!isAuthenticated) {
    return isProtectedRoute(route) ? 'login' : null
  }

  if (route === 'login' || route === 'signup') {
    return getPostLoginRoute(auth)
  }

  if (route === 'household' && !auth.has_household) {
    return 'householdSetup'
  }

  if (route === 'householdSetup' && auth.has_household) {
    return 'household'
  }

  return null
}
