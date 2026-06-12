const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

export class ApiHttpError extends Error {
  readonly kind = 'http'
  readonly status: number
  readonly statusText: string
  readonly body: unknown

  constructor(status: number, statusText: string, body: unknown) {
    super(`HTTP ${status}: ${statusText}`)
    this.name = 'ApiHttpError'
    this.status = status
    this.statusText = statusText
    this.body = body
  }
}

export class ApiNetworkError extends Error {
  readonly kind = 'network'
  readonly originalError: unknown

  constructor(originalError: unknown) {
    super('Network request failed')
    this.name = 'ApiNetworkError'
    this.originalError = originalError
  }
}

export function isApiHttpError(error: unknown): error is ApiHttpError {
  return error instanceof ApiHttpError
}

function getCsrfToken(): string {
  return (
    document.cookie
      .split('; ')
      .find((row) => row.startsWith('csrftoken='))
      ?.split('=')[1] ?? ''
  )
}

export async function customFetch<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const method = (options.method ?? 'GET').toUpperCase()

  const headers = new Headers(options.headers)

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    headers.set('X-CSRFToken', getCsrfToken())
  }

  let response: Response

  try {
    response = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers,
      credentials: 'include',
    })
  } catch (error) {
    throw new ApiNetworkError(error)
  }

  const data =
    response.status === 204 ? undefined : await parseResponseBody(response)

  if (!response.ok) {
    throw new ApiHttpError(response.status, response.statusText, data)
  }

  return {
    data,
    status: response.status,
    headers: response.headers,
  } as T
}

async function parseResponseBody(response: Response) {
  const text = await response.text().catch(() => '')

  if (!text) return undefined

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}
