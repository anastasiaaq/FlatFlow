import Navbar from '../components/Navbar'

type NavPage = 'household' | 'rules' | 'chores' | 'issues'

type PlaceholderPageProps = {
  activePage: NavPage
  title: string
  householdName?: string
  userName?: string
  onNavigate?: (page: NavPage) => void
  onLogout?: () => void
}

export default function PlaceholderPage({
  activePage,
  title,
  householdName = 'Girls 039',
  userName = 'Katia',
  onNavigate,
  onLogout,
}: PlaceholderPageProps) {
  return (
    <div className="page-shell">
      <Navbar
        activePage={activePage}
        householdName={householdName}
        userName={userName}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />
      <main className="placeholder-page">
        <h1>{title}</h1>
      </main>
      <footer className="app-footer">
        © 2026 Bratiuk, Horalevych, Dvoilenko, Tsepkalo
      </footer>
    </div>
  )
}
