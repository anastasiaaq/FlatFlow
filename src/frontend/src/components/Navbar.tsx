import type { Page } from '../types/navigation'

type NavbarProps = {
  householdName?: string
  userName?: string
  activePage?: Page
  onLogout?: () => void
  onProfileOpen?: () => void
  onNavigate?: (page: Page) => void
}

export default function Navbar({
  householdName,
  userName,
  activePage = 'household',
  onLogout,
  onProfileOpen,
  onNavigate,
}: NavbarProps) {
  const navItems = [
    { key: 'household', label: 'Household', disabled: false },
    { key: 'rules', label: 'Rules', disabled: false },
    { key: 'chores', label: 'Chores', disabled: false },
    { key: 'issues', label: 'Issues', disabled: true },
  ] as const

  return (
    <header className="w-full h-[90px] bg-[#fdd329] flex items-center px-[154px] shrink-0">
      <span className="text-[#0b0a0f] text-[30px] font-semibold mr-[80px] whitespace-nowrap">
        FlatFlow
      </span>

      <nav className="flex items-center gap-[50px] flex-1">
        {navItems.map(({ key, label, disabled }) => (
          <button
            key={key}
            type="button"
            onClick={() => !disabled && onNavigate?.(key)}
            disabled={disabled}
            className={`text-[#0b0a0f] text-[16px] font-semibold whitespace-nowrap px-[10px] py-[4px] ${
              activePage === key
                ? 'border border-[#0b0a0f] rounded-[7px]'
                : ''
            } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
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
