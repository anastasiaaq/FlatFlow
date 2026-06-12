import { useEffect, useState } from 'react'
import {
  csrf,
  getCurrentHousehold,
  getCurrentUser,
  leaveHousehold,
  type HouseholdDetail,
} from '../api'
import Navbar from '../components/Navbar'
import ProfileModal from '../components/ProfileModal'

type NavPage = 'household' | 'rules' | 'chores' | 'issues'

type HouseholdPageProps = {
  onNavigate?: (page: NavPage) => void
  onLogout?: () => void
}

export default function HouseholdPage({ onNavigate, onLogout }: HouseholdPageProps) {
  const [household, setHousehold] = useState<HouseholdDetail | null>(null)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [userName, setUserName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState<string | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    async function loadHousehold() {
      try {
        const [householdResponse, userResponse] = await Promise.all([
          getCurrentHousehold(),
          getCurrentUser().catch(() => null),
        ])

        setHousehold(householdResponse.data)
        setCurrentUserId(userResponse?.data.user?.id ?? null)
        setUserName(userResponse?.data.user?.display_name ?? '')
      } catch {
        setError('Could not load household.')
      } finally {
        setLoading(false)
      }
    }

    loadHousehold()
  }, [])

  async function handleCopy() {
    if (!household) return
    setCopyError(null)

    try {
      await navigator.clipboard.writeText(household.invite_code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
      setCopyError('Could not copy code. Please copy it manually.')
    }
  }

  async function handleLeave() {
    if (!window.confirm('Are you sure you want to leave this household?')) return
    setLeaving(true)

    try {
      await csrf()
      await leaveHousehold()
      setHousehold(null)
    } catch {
      window.alert('Failed to leave household.')
    } finally {
      setLeaving(false)
    }
  }

  const currentMember = household?.members.find(
    (member) => member.id === currentUserId,
  )
  const navbarUserName = userName || currentMember?.display_name

  return (
    <div className="page-shell">
      <Navbar
        activePage="household"
        householdName={household?.name}
        userName={navbarUserName}
        onNavigate={onNavigate}
        onProfileOpen={() => setProfileOpen(true)}
        onLogout={onLogout}
      />

      <main className="household-page">
        <section className="page-heading">
          <h1>Household</h1>
          <p>Manage your household settings, members, and invite code.</p>
        </section>

        {loading && <p className="rules-message">Loading...</p>}
        {error && <p className="rules-message rules-message--error">{error}</p>}

        {!loading && !household && !error && (
          <p className="rules-message">You are not in a household.</p>
        )}

        {household && (
          <div className="household-layout">
            <section className="household-main-column">
              <article className="household-card household-info-card">
                <div className="household-avatar">
                  {household.name.charAt(0).toUpperCase()}
                </div>
                <div className="household-info-card__body">
                  <h2>{household.name}</h2>
                  <div className="household-divider" />
                  <p>
                    Created by{' '}
                    <strong>{household.created_by.display_name}</strong>
                  </p>
                  <span>{formatDate(household.created_at)}</span>
                </div>
              </article>

              <article className="household-card">
                <h2>Members ({household.members.length})</h2>
                <p className="household-card__description">
                  All members have equal rights and permissions.
                </p>
                <div className="members-list">
                  {household.members.map((member) => {
                    const isYou = member.id === currentUserId
                    const isCreator = member.id === household.created_by.id
                    return (
                      <div className="members-list__row" key={member.id}>
                        <strong>
                          {member.display_name}
                          {isYou && <span> (You)</span>}
                        </strong>
                        {isCreator && <span>Creator</span>}
                      </div>
                    )
                  })}
                </div>
              </article>
            </section>

            <aside className="household-side-column">
              <article className="household-card">
                <h2>Invite code</h2>
                <p className="household-card__description">
                  This code is permanent and unique for your household. Share it
                  to invite your roommates.
                </p>
                <div className="invite-code-box">
                  <span>{household.invite_code}</span>
                  <button
                    type="button"
                    className="icon-button"
                    title="Copy"
                    onClick={handleCopy}
                  >
                    <CopyIcon />
                  </button>
                </div>
                <button
                  type="button"
                  className="button button--primary"
                  onClick={handleCopy}
                >
                  {copied ? 'Copied!' : 'Copy code'}
                </button>
                {copyError && <p className="rule-form__error">{copyError}</p>}
              </article>

              <article className="household-card household-danger-card">
                <h2>Leave household</h2>
                <div className="leave-warning">
                  <WarningIcon />
                  <p>
                    If you leave, you will lose access to all household data.
                    Chores assigned to you will become unassigned. If you are
                    the last member, the household and its data will be
                    permanently deleted.
                  </p>
                </div>
                <button
                  type="button"
                  className="button button--danger"
                  disabled={leaving}
                  onClick={handleLeave}
                >
                  {leaving ? 'Leaving...' : 'Leave'}
                </button>
              </article>
            </aside>
          </div>
        )}
      </main>

      <footer className="app-footer">
        © 2026 Bratiuk, Horalevych, Dvoilenko, Tsepkalo
      </footer>

      {profileOpen && (
        <ProfileModal
          initialName={navbarUserName ?? ''}
          onClose={() => setProfileOpen(false)}
          onProfileUpdated={(profile) => setUserName(profile.display_name)}
        />
      )}
    </div>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function CopyIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect
        x="9"
        y="9"
        width="13"
        height="13"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  )
}

function WarningIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path
        d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"
        stroke="#cb322d"
        strokeWidth="2"
      />
      <path d="M12 9v4" stroke="#cb322d" strokeLinecap="round" strokeWidth="2" />
      <path d="M12 17h.01" stroke="#cb322d" strokeLinecap="round" strokeWidth="3" />
    </svg>
  )
}
