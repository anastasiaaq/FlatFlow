import PlaceholderPage from './PlaceholderPage'

type NavPage = 'household' | 'rules' | 'chores' | 'issues'

type ChoresPageProps = {
  onNavigate?: (page: NavPage) => void
  onLogout?: () => void
}

export default function ChoresPage({ onNavigate, onLogout }: ChoresPageProps) {
  return (
    <PlaceholderPage
      activePage="chores"
      title="Chores"
      onNavigate={onNavigate}
      onLogout={onLogout}
    />
  )
}
