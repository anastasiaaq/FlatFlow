type NavPage = 'household' | 'rules' | 'chores' | 'issues'

type NavbarProps = {
  activePage?: NavPage
  householdName?: string
  userName?: string
  onNavigate?: (page: NavPage) => void
  onProfileOpen?: () => void
  onLogout?: () => void
}

const navItems: Array<{ key: NavPage; label: string }> = [
  { key: 'household', label: 'Household' },
  { key: 'rules', label: 'Rules' },
  { key: 'chores', label: 'Chores' },
  { key: 'issues', label: 'Issues' },
]

export default function Navbar({
  activePage = 'rules',
  householdName,
  userName,
  onNavigate,
  onProfileOpen,
  onLogout,
}: NavbarProps) {
  return (
    <header className="navbar">
      <span className="navbar__brand">FlatFlow</span>

      <nav className="navbar__links">
        {navItems.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            className={`navbar__link ${activePage === key ? 'navbar__link--active' : ''}`}
            onClick={() => onNavigate?.(key)}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="navbar__account">
        {householdName && <span>{householdName}</span>}
        <button
          type="button"
          className="navbar__profile"
          onClick={onProfileOpen}
        >
          {userName && <span>{userName}</span>}
          <svg width="16" height="7" viewBox="0 0 16 7" fill="none">
            <path
              d="M1 1L8 6L15 1"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.5"
            />
          </svg>
        </button>
        <button
          type="button"
          className="navbar__logout"
          onClick={onLogout}
        >
          Log out
        </button>
      </div>
    </header>
  )
}
