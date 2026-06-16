import PlaceholderPage from './PlaceholderPage'

type NavPage = 'household' | 'rules' | 'chores' | 'issues'

type IssuesPageProps = {
  onNavigate?: (page: NavPage) => void
  onLogout?: () => void
}

export default function IssuesPage({ onNavigate, onLogout }: IssuesPageProps) {
  return (
    <PlaceholderPage
      activePage="issues"
      title="Issues"
      onNavigate={onNavigate}
      onLogout={onLogout}
    />
  )
}
