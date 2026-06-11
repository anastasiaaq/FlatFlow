type Page = 'household' | 'rules' | 'chores' | 'issues'

type NavbarProps = {
  householdName?: string
  userName?: string
  activePage?: Page
  onNavigate?: (page: Page) => void
}

export default function Navbar({
  householdName,
  userName,
  activePage = 'household',
  onNavigate,
}: NavbarProps) {
  const navItems: { key: Page; label: string }[] = [
    { key: 'household', label: 'Household' },
    { key: 'rules', label: 'Rules' },
    { key: 'chores', label: 'Chores' },
    { key: 'issues', label: 'Issues' },
  ]

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
            style={{
              border: activePage === key ? '1px solid #0b0a0f' : '1px solid transparent',
              borderRadius: '7px',
              background: 'transparent',
              cursor: 'pointer',
              padding: '4px 10px',
            }}
            className={`text-[#0b0a0f] text-[16px] font-semibold whitespace-nowrap ${
              activePage !== key ? 'hover:opacity-70 transition-opacity' : ''
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-[12px] text-[16px] font-bold text-[#0b0a0f]">
        {householdName && <span>{householdName}</span>}
        {userName && <span>{userName}</span>}
        <svg width="16" height="7" viewBox="0 0 16 7" fill="none">
          <path d="M1 1L8 6L15 1" stroke="#0b0a0f" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    </header>
  )
}
