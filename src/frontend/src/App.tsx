import { useEffect, useState } from 'react'

type BackendStatus = 'checking' | 'online' | 'offline'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

function App() {
  const [backendStatus, setBackendStatus] = useState<BackendStatus>('checking')

  useEffect(() => {
    let cancelled = false

    async function checkBackend() {
      try {
        const response = await fetch(`${apiBaseUrl}/health/`, {
          credentials: 'include',
        })

        if (!cancelled) {
          setBackendStatus(response.ok ? 'online' : 'offline')
        }
      } catch {
        if (!cancelled) {
          setBackendStatus('offline')
        }
      }
    }

    checkBackend()
    const intervalId = window.setInterval(checkBackend, 5000)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
    }
  }, [])

  return (
    <main>
      <h1>Welcome to FlatFlow!</h1>
      <p>Backend status: {backendStatus}</p>
    </main>
  )
}

export default App
