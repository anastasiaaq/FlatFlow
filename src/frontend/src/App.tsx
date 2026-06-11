import { useState } from 'react'
import HouseholdPage from './pages/HouseholdPage'
import ChoresPage from './pages/ChoresPage'

type Page = 'household' | 'rules' | 'chores' | 'issues'

function App() {
  const [activePage, setActivePage] = useState<Page>('household')

  switch (activePage) {
    case 'chores':
      return <ChoresPage onNavigate={setActivePage} />
    default:
      return <HouseholdPage onNavigate={setActivePage} />
  }
}

export default App
