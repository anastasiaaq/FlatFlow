import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { apiHouseholdsCurrentRetrieve, apiHouseholdsLeaveCreate } from '../api/generated/households/households'
import type { HouseholdDetail } from '../api/generated/flatFlowAPI.schemas'

type Props = {
  currentUserId?: number
  onLogout?: () => void
}

export default function HouseholdPage({ currentUserId, onLogout }: Props) {
  const [household, setHousehold] = useState<HouseholdDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    apiHouseholdsCurrentRetrieve()
      .then((res) => {
        if (res.status === 200) {
          setHousehold(res.data)
        } else {
          setError('Could not load household.')
        }
      })
      .catch(() => setError('Could not load household.'))
      .finally(() => setLoading(false))
  }, [])

  async function handleCopy() {
    if (!household) return
    await navigator.clipboard.writeText(household.invite_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleLeave() {
    if (!confirm('Are you sure you want to leave this household?')) return
    setLeaving(true)
    try {
      const res = await apiHouseholdsLeaveCreate()
      if (res.status === 200) {
        setHousehold(null)
      } else {
        alert('Failed to leave household.')
      }
    } catch {
      alert('Failed to leave household.')
    } finally {
      setLeaving(false)
    }
  }

  const currentMember = household?.members.find((m) => m.id === currentUserId)

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })

  return (
    <div className="min-h-screen bg-[#fffef7] flex flex-col">
      <Navbar
        householdName={household?.name}
        userName={currentMember?.display_name}
        activePage="household"
        onLogout={onLogout}
      />

      <main className="flex-1 px-[154px] pt-[47px] pb-[80px]">
        <h1 className="text-[#0b0a0f] text-[32px] font-semibold leading-tight">
          Household
        </h1>
        <p className="text-[#393939] text-[14px] mt-[12px] mb-[42px]">
          Manage your household settings, members, and invite code.
        </p>

        {loading && (
          <p className="text-[#393939] text-[14px]">Loading...</p>
        )}

        {error && (
          <p className="text-[#cb322d] text-[14px]">{error}</p>
        )}

        {household && (
          <div className="flex gap-[16px] items-start">
            {/* Left column */}
            <div className="flex flex-col gap-[16px] flex-1">

              {/* Household info card */}
              <div className="bg-[#f8f8ed] border border-[#d8d8bd] rounded-[11px] p-[28px] flex gap-[24px] items-start">
                <div className="w-[72px] h-[72px] rounded-full bg-[#d8d8bd] shrink-0 flex items-center justify-center text-[#0b0a0f] text-[28px] font-semibold select-none">
                  {household.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h2 className="text-[#0b0a0f] text-[25px] font-semibold">
                    {household.name}
                  </h2>
                  <div className="border-t border-[#d8d8bd] my-[12px]" />
                  <p className="text-[#0b0a0f] text-[16px]">
                    Created by{' '}
                    <span className="font-semibold">
                      {household.created_by.display_name}
                    </span>
                  </p>
                  <p className="text-[#0b0a0f] text-[16px] font-light mt-[4px]">
                    {formatDate(household.created_at)}
                  </p>
                </div>
              </div>

              {/* Members card */}
              <div className="bg-[#f8f8ed] border border-[#d8d8bd] rounded-[11px] p-[28px]">
                <h2 className="text-[#0b0a0f] text-[25px] font-medium">
                  Members ({household.members.length})
                </h2>
                <p className="text-[#0b0a0f] text-[14px] mt-[8px] mb-[16px]">
                  All members have equal rights and permissions.
                </p>
                <div className="bg-[#fffef7] border border-[#d8d8bd] rounded-[11px] divide-y divide-[#d8d8bd]">
                  {household.members.map((member) => {
                    const isYou = member.id === currentUserId
                    const isCreator = member.id === household.created_by.id
                    return (
                      <div
                        key={member.id}
                        className="flex items-center justify-between px-[22px] py-[14px]"
                      >
                        <span className="text-[#0b0a0f] text-[16px] font-semibold">
                          {member.display_name}
                          {isYou && (
                            <span className="font-normal"> (You)</span>
                          )}
                        </span>
                        {isCreator && (
                          <span className="text-[#0b0a0f] text-[14px]">
                            Creator
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-[16px] w-[375px] shrink-0">

              {/* Invite code card */}
              <div className="bg-[#f8f8ed] border border-[#d8d8bd] rounded-[11px] p-[28px]">
                <h2 className="text-[#0b0a0f] text-[25px] font-medium mb-[12px]">
                  Invite code
                </h2>
                <p className="text-[#0b0a0f] text-[14px] mb-[16px]">
                  This code is permanent and unique for your household. Share it
                  to invite your roommates.
                </p>
                <div className="bg-[#fffef7] border border-[#d8d8bd] rounded-[11px] px-[18px] py-[14px] flex items-center justify-between mb-[16px]">
                  <span className="text-[#0b0a0f] text-[21px] tracking-wide">
                    {household.invite_code}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="text-[#0b0a0f] hover:opacity-60 transition-opacity"
                    title="Copy"
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  </button>
                </div>
                <button
                  onClick={handleCopy}
                  className="bg-[#fdd329] rounded-[7px] px-[24px] py-[9px] text-[#0b0a0f] text-[16px] font-medium hover:opacity-80 transition-opacity"
                >
                  {copied ? 'COPIED!' : 'COPY CODE'}
                </button>
              </div>

              {/* Leave household card */}
              <div className="bg-[#fbf4f1] border border-[#d8bdbd] rounded-[11px] p-[28px]">
                <h2 className="text-[#cb322d] text-[16px] font-medium mb-[16px]">
                  Leave household
                </h2>
                <div className="bg-[#fffef7] border border-[#d8bdbd] rounded-[7px] p-[16px] mb-[20px]">
                  <div className="flex gap-[10px] items-start">
                    <svg
                      className="shrink-0 mt-[1px]"
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#cb322d"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    <p className="text-[#0b0a0f] text-[14px] leading-[19px]">
                      If you leave, you will lose access to all household data.
                      Chores assigned to you will become unassigned. If you are
                      the last member, the household and its data will be
                      permanently deleted.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLeave}
                  disabled={leaving}
                  className="bg-[#cb322d] text-[#f8eded] text-[16px] font-medium rounded-[7px] px-[28px] py-[9px] hover:opacity-80 transition-opacity disabled:opacity-50"
                >
                  {leaving ? 'LEAVING...' : 'LEAVE'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-[#b3b3b3] bg-[#fffef7] py-[12px] text-center text-[#0b0a0f] text-[14px]">
        © 2026 Bratiuk, Horalevych, Dvoilenko, Tsepkalo
      </footer>
    </div>
  )
}
