import type { AuthState } from '../api/generated/flatFlowAPI.schemas'

export type AppRoute =
  | 'landing'
  | 'login'
  | 'signup'
  | 'household'
  | 'householdSetup'
  | 'chores'
  | 'rules'
  | 'issues'

export const routePaths: Record<AppRoute, string> = {
  landing: '/',
  login: '/login',
  signup: '/signup',
  household: '/household',
  householdSetup: '/household/setup',
  chores: '/chores',
  rules: '/rules',
  issues: '/issues',
}

export function getRouteFromPath(pathname: string): AppRoute {
  if (pathname === '/') return 'landing'
  if (matchesRoutePath(pathname, routePaths.login)) return 'login'
  if (matchesRoutePath(pathname, routePaths.signup)) return 'signup'
  if (matchesRoutePath(pathname, routePaths.householdSetup)) return 'householdSetup'
  if (matchesRoutePath(pathname, routePaths.chores)) return 'chores'
  if (matchesRoutePath(pathname, routePaths.rules)) return 'rules'
  if (matchesRoutePath(pathname, routePaths.issues)) return 'issues'
  if (matchesRoutePath(pathname, routePaths.household)) return 'household'
  return 'landing'
}

function matchesRoutePath(pathname: string, routePath: string) {
  return pathname === routePath || pathname.startsWith(`${routePath}/`)
}

export function isProtectedRoute(route: AppRoute) {
  return route === 'household' || route === 'householdSetup' || route === 'chores' || route === 'rules' || route === 'issues'
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

  if (route === 'landing' || route === 'login' || route === 'signup') {
    return getPostLoginRoute(auth)
  }

  if (route === 'household' && !auth.has_household) {
    return 'householdSetup'
  }

  if (route === 'householdSetup' && auth.has_household) {
    return 'household'
  }

  if (route === 'chores' && !auth.has_household) {
    return 'householdSetup'
  }

  if (route === 'rules' && !auth.has_household) {
    return 'householdSetup'
  }

  if (route === 'issues' && !auth.has_household) {
    return 'householdSetup'
  }

  return null
}
