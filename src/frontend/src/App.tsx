import { useEffect, useState } from 'react'
import HouseholdPage from './pages/HouseholdPage'
import { apiUsersMeRetrieve } from './api/generated/users/users'

function App() {
  const [currentUserId, setCurrentUserId] = useState<number | undefined>(undefined)

  useEffect(() => {
    apiUsersMeRetrieve()
      .then((res) => {
        if (res.status === 200 && res.data.user) {
          setCurrentUserId(res.data.user.id)
        }
      })
      .catch(() => {})
  }, [])

  return <HouseholdPage currentUserId={currentUserId} />
}

export default App
