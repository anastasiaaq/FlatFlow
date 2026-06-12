const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

export type RuleMember = {
  id: number
  display_name: string
}

export type RuleDetail = {
  id: number
  text: string
  created_at: string
  last_modified_at: string
  created_by: RuleMember
  last_modified_by: RuleMember | null
}

export type AuthState = {
  authenticated: boolean
  user: {
    id: number
    email: string
    display_name: string
  } | null
  has_household: boolean
}

export type UserProfile = {
  email: string
  display_name: string
}

export type UserProfileUpdate = {
  display_name: string
}

export type HouseholdDetail = {
  id: number
  name: string
  invite_code: string
  created_at: string
  created_by: RuleMember
  members: RuleMember[]
}

export type LeaveResult = {
  household_deleted: boolean
}

export class ApiError extends Error {
  readonly status: number
  readonly body: unknown

  constructor(status: number, statusText: string, body: unknown) {
    super(`HTTP ${status}: ${statusText}`)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

function getCsrfToken() {
  return (
    document.cookie
      .split('; ')
      .find((row) => row.startsWith('csrftoken='))
      ?.split('=')[1] ?? ''
  )
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method ?? 'GET').toUpperCase()
  const headers = new Headers(options.headers)

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    headers.set('X-CSRFToken', getCsrfToken())
  }

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    credentials: 'include',
    headers,
  })
  const body = response.status === 204 ? undefined : await parseBody(response)

  if (!response.ok) {
    throw new ApiError(response.status, response.statusText, body)
  }

  return {
    data: body,
    status: response.status,
    headers: response.headers,
  } as T
}

async function parseBody(response: Response) {
  const text = await response.text().catch(() => '')

  if (!text) return undefined

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export function csrf() {
  return request<void>('/api/users/csrf/')
}

export function getCurrentUser() {
  return request<{ data: AuthState; status: 200 }>('/api/users/me/')
}

export function loginUser(email: string, password: string) {
  return request<{ data: AuthState; status: 200 }>('/api/users/login/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
}

export function registerUser(
  displayName: string,
  email: string,
  password: string,
) {
  return request<{ data: AuthState; status: 201 }>('/api/users/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      display_name: displayName,
      email,
      password,
    }),
  })
}

export function getUserProfile() {
  return request<{ data: UserProfile; status: 200 }>('/api/users/profile/')
}

export function updateUserProfile(profile: UserProfileUpdate) {
  return request<{ data: UserProfile; status: 200 }>('/api/users/profile/', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  })
}

export function logoutUser() {
  return request<{ data: AuthState; status: 200 }>('/api/users/logout/', {
    method: 'POST',
  })
}

export function getCurrentHousehold() {
  return request<{ data: HouseholdDetail; status: 200 }>(
    '/api/households/current/',
  )
}

export function leaveHousehold() {
  return request<{ data: LeaveResult; status: 200 }>('/api/households/leave/', {
    method: 'POST',
  })
}

export function listRules() {
  return request<{ data: RuleDetail[]; status: 200 }>('/api/rules/')
}

export function createRule(text: string) {
  return request<{ data: RuleDetail; status: 201 }>('/api/rules/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })
}

export function updateRule(id: number, text: string) {
  return request<{ data: RuleDetail; status: 200 }>(`/api/rules/${id}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })
}

export function deleteRule(id: number) {
  return request<{ data: void; status: 204 }>(`/api/rules/${id}/`, {
    method: 'DELETE',
  })
}
