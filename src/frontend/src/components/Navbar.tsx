type NavbarProps = {
  householdName?: string
  userName?: string
  activePage?: 'household' | 'rules' | 'chores' | 'issues'
  onLogout?: () => void
  onProfileOpen?: () => void
  onNavigate?: (page: 'household' | 'rules' | 'chores' | 'issues') => void
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
    { key: 'household', label: 'Household' },
    { key: 'rules', label: 'Rules' },
    { key: 'chores', label: 'Chores' },
    { key: 'issues', label: 'Issues' },
  ] as const

  return (
    <header className="w-full h-[90px] bg-[#fdd329] flex items-center px-[154px] shrink-0">
      <span className="text-[#0b0a0f] text-[30px] font-semibold mr-[80px] whitespace-nowrap">
        FlatFlow
      </span>

      <nav className="flex items-center gap-[50px] flex-1">
        {navItems.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => onNavigate?.(key)}
            className={`text-[#0b0a0f] text-[16px] font-semibold whitespace-nowrap px-[10px] py-[4px] ${
              activePage === key
                ? 'border border-[#0b0a0f] rounded-[7px]'
                : ''
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-[12px] text-[16px] font-bold text-[#0b0a0f]">
        {householdName && <span>{householdName}</span>}
        <button
          type="button"
          onClick={onProfileOpen}
          className="flex items-center gap-[12px] rounded-[7px] px-[6px] py-[4px] font-bold hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b0a0f]"
          aria-label="Open profile"
        >
          {userName && <span>{userName}</span>}
          <svg width="16" height="7" viewBox="0 0 16 7" fill="none">
            <path d="M1 1L8 6L15 1" stroke="#0b0a0f" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        {onLogout && (
          <button
            onClick={onLogout}
            className="ml-[10px] rounded-[7px] border border-[#0b0a0f] px-[10px] py-[4px] text-[16px] font-semibold hover:opacity-70"
          >
            Log out
          </button>
        )}
      </div>
    </header>
  )
}
