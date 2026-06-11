const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

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

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
    credentials: 'include',
  })

  const data = response.status === 204 ? undefined : await response.json()

  return {
    data,
    status: response.status,
    headers: response.headers,
  } as T
}
