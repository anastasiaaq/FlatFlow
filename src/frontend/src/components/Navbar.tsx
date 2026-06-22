import { useState } from 'react'
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
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const navItems = [
    { key: 'household', label: 'Household', disabled: false },
    { key: 'rules', label: 'Rules', disabled: false },
    { key: 'chores', label: 'Chores', disabled: false },
    { key: 'issues', label: 'Issues', disabled: false },
  ] as const

  return (
    <>
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
          onClick={() => setShowLogoutConfirm(true)}
        >
          Log out
        </button>
      </div>
    </header>

    {showLogoutConfirm && (
      <LogoutConfirmModal
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={() => {
          setShowLogoutConfirm(false)
          onLogout?.()
        }}
      />
    )}
    </>
  )
}

function LogoutConfirmModal({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" role="dialog" aria-modal="true">
      <div className="bg-[#f8f8ed] rounded-[11px] border border-[#d8d8bd] w-[375px] p-[28px]">
        <h3 className="text-[#0b0a0f] text-[16px] font-semibold mb-[8px]">
          Log out
        </h3>
        <p className="text-[#0b0a0f] text-[14px] mb-[20px]">
          Are you sure you want to log out?
        </p>
        <div className="flex justify-end gap-[12px]">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-[7px] border border-[#d8d8bd] px-[20px] h-[38px] text-[#0b0a0f] text-[16px] font-medium hover:bg-[#efefdf] transition-colors"
          >
            CANCEL
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="bg-[#0b0a0f] rounded-[7px] px-[20px] h-[38px] text-[#fffef7] text-[16px] font-medium hover:opacity-80 transition-opacity"
          >
            LOG OUT
          </button>
        </div>
      </div>
    </div>
  )
}
