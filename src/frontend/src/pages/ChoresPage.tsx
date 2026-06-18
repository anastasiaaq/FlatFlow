import { useState, useEffect, useCallback } from 'react'
import Navbar from '../components/Navbar'
import ChoreFormModal from '../components/chores/ChoreFormModal'
import DeleteChoreModal from '../components/chores/DeleteChoreModal'
import {
  apiChoresList,
  apiChoresCreate,
  apiChoresUpdate,
  apiChoresDestroy,
  apiChoresCompleteCreate,
  apiChoresPartialUpdate,
} from '../api/generated/chores/chores'
import { apiHouseholdsCurrentRetrieve } from '../api/generated/households/households'
import type {
  ChoreDetail,
  ChoreCreate,
  ChoreUpdate,
  HouseholdDetail,
  ApiChoresListParams,
} from '../api/generated/flatFlowAPI.schemas'
import type { Page } from '../types/navigation'

// ── date helpers ──────────────────────────────────────────────────────────────

function parseISODate(str: string): Date {
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function getChoreStart(chore: ChoreDetail): Date {
  const s = chore.start_date ?? chore.due_date ?? (chore.created_at ? chore.created_at.slice(0, 10) : '1970-01-01')
  return parseISODate(s)
}

function getChoreEnd(chore: ChoreDetail): Date {
  const e = chore.end_date ?? chore.due_date ?? (chore.created_at ? chore.created_at.slice(0, 10) : '1970-01-01')
  return parseISODate(e)
}

function getCalendarWeeks(year: number, month: number): Date[][] {
  const firstDay = new Date(year, month, 1)
  // Monday-based: (getDay() + 6) % 7 gives Mon=0 … Sun=6
  const startOffset = (firstDay.getDay() + 6) % 7
  const cur = new Date(year, month, 1 - startOffset)
  const weeks: Date[][] = []
  while (true) {
    const week: Date[] = []
    for (let d = 0; d < 7; d++) {
      week.push(new Date(cur))
      cur.setDate(cur.getDate() + 1)
    }
    weeks.push(week)
    if ((cur.getMonth() > month && cur.getFullYear() >= year) || cur.getFullYear() > year) break
    if (weeks.length >= 6) break
  }
  return weeks
}

function toMidnight(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function formatDateShort(iso: string | null | undefined): string {
  if (!iso) return ''
  const parts = iso.split('T')[0].split('-')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[parseInt(parts[1]) - 1]} ${parseInt(parts[2])}, ${parts[0]}`
}

// ── chore bar logic ───────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: '#c0e6b9',
  OVERDUE: '#e6c0b9',
  PENDING_CONFIRMATION: '#e6e0b9',
  ACTIVE: '#b9d8e6',
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Open',
  COMPLETED: 'Closed',
  OVERDUE: 'Overdue',
  PENDING_CONFIRMATION: 'Pending',
}

function getChoreColor(chore: ChoreDetail): string {
  return STATUS_COLORS[chore.status] ?? '#b9d8e6'
}

type Segment = {
  chore: ChoreDetail
  startCol: number
  colSpan: number
  lane: number
  color: string
}

function getWeekSegments(week: Date[], chores: ChoreDetail[]): Segment[] {
  const weekStart = week[0]
  const weekEnd = week[6]

  const overlapping = chores
    .filter((c) => {
      // Tasks without a due date don't appear on the calendar
      if (c.type === 'TASK' && !c.due_date) return false
      const s = getChoreStart(c)
      const e = getChoreEnd(c)
      return s.getTime() <= weekEnd.getTime() && e.getTime() >= weekStart.getTime()
    })
    .sort((a, b) => getChoreStart(a).getTime() - getChoreStart(b).getTime())

  const laneEnds: Date[] = []

  return overlapping.map((chore) => {
    const choreStart = getChoreStart(chore)
    const choreEnd = getChoreEnd(chore)

    const choreStartMid = toMidnight(choreStart)
    const choreEndMid = toMidnight(choreEnd)
    const weekStartMid = toMidnight(weekStart)

    const startCol = Math.max(
      0,
      Math.round((choreStartMid.getTime() - weekStartMid.getTime()) / 86_400_000),
    )
    const endCol = Math.min(
      6,
      Math.round((choreEndMid.getTime() - weekStartMid.getTime()) / 86_400_000),
    )
    const colSpan = Math.max(1, endCol - startCol + 1)

    let lane = laneEnds.findIndex((laneEnd) => laneEnd.getTime() < choreStart.getTime())
    if (lane === -1) lane = laneEnds.length
    laneEnds[lane] = choreEnd

    return { chore, startCol, colSpan, lane, color: getChoreColor(chore) }
  })
}

// ── constants ─────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const DAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

const DAY_NUM_HEIGHT = 54   // px — area for the day number cell
const BAR_HEIGHT = 24       // px — bar height
const BAR_GAP = 4           // px — space between bars
const ROW_BOTTOM_PAD = 8    // px — padding below last bar

// ── helpers ───────────────────────────────────────────────────────────────────

function canMarkComplete(chore: ChoreDetail): boolean {
  if (chore.status === 'COMPLETED') return false
  if (chore.type === 'DUTY' && chore.start_date) {
    return toMidnight(new Date()).getTime() >= toMidnight(parseISODate(chore.start_date)).getTime()
  }
  return true
}

function choreDateInfo(chore: ChoreDetail): string {
  if (chore.type === 'TASK') {
    return chore.due_date ? `Due: ${formatDateShort(chore.due_date)}` : 'No due date'
  }
  const start = chore.start_date ? formatDateShort(chore.start_date) : '?'
  const end = chore.end_date ? formatDateShort(chore.end_date) : '?'
  return `${start} – ${end}`
}

// ── filter option types ───────────────────────────────────────────────────────

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Open' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'pending_confirmation', label: 'Pending' },
  { value: 'completed', label: 'Closed' },
] as const

// ── page component ────────────────────────────────────────────────────────────

type Props = {
  currentUserId?: number
  currentUserName?: string
  onLogout?: () => void
  onProfileOpen?: () => void
  onNavigate?: (page: Page) => void
}

export default function ChoresPage({ currentUserId, currentUserName, onLogout, onProfileOpen, onNavigate }: Props) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [chores, setChores] = useState<ChoreDetail[]>([])
  const [household, setHousehold] = useState<HouseholdDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingChore, setEditingChore] = useState<ChoreDetail | null>(null)
  const [deletingChore, setDeletingChore] = useState<ChoreDetail | null>(null)

  // filter & sort state
  const [filterAssignee, setFilterAssignee] = useState('any')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('default')

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const params: ApiChoresListParams = {}
      if (filterAssignee !== 'any') params.assignee = filterAssignee
      if (filterStatus !== 'all') params.status = filterStatus
      if (sortBy !== 'default') params.sort = sortBy

      const [choresRes, householdRes] = await Promise.all([
        apiChoresList(params),
        apiHouseholdsCurrentRetrieve(),
      ])
      if (choresRes.status === 200) setChores(choresRes.data)
      if (householdRes.status === 200) setHousehold(householdRes.data)
    } finally {
      setLoading(false)
    }
  }, [filterAssignee, filterStatus, sortBy])

  useEffect(() => {
    loadData()
  }, [loadData])

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1) }
    else setMonth((m) => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1) }
    else setMonth((m) => m + 1)
  }

  async function handleChoreCreated(data: ChoreCreate) {
    const res = await apiChoresCreate(data)
    if (res.status !== 201) throw new Error('Failed to create chore')
    setChores((prev) => [...prev, res.data])
    setShowAddModal(false)
  }

  async function handleChoreUpdated(id: number, data: ChoreUpdate) {
    const res = await apiChoresUpdate(id, data)
    if (res.status !== 200) throw new Error('Failed to update chore')
    setChores((prev) => prev.map((c) => (c.id === id ? res.data : c)))
    setEditingChore(null)
  }

  async function handleChoreDeleted(id: number) {
    const res = await apiChoresDestroy(id)
    if (res.status !== 204) throw new Error('Failed to delete chore')
    setChores((prev) => prev.filter((c) => c.id !== id))
    setDeletingChore(null)
  }

  async function handleMarkComplete(id: number) {
    const res = await apiChoresCompleteCreate(id)
    if (res.status !== 200) throw new Error('Failed to complete chore')
    setChores((prev) => prev.map((c) => (c.id === id ? res.data : c)))
    setEditingChore(null)
  }

  async function handleReopenChore(id: number) {
    const res = await apiChoresPartialUpdate(id, { status: 'ACTIVE' })
    if (res.status !== 200) throw new Error('Failed to reopen chore')
    setChores((prev) => prev.map((c) => (c.id === id ? res.data : c)))
    setEditingChore(null)
  }

  function clearFilters() {
    setFilterAssignee('any')
    setFilterStatus('all')
    setSortBy('default')
  }

  const hasActiveFilters = filterAssignee !== 'any' || filterStatus !== 'all' || sortBy !== 'default'
  const currentMember = household?.members.find((m) => m.id === currentUserId)
  const displayName = currentUserName ?? currentMember?.display_name
  const weeks = getCalendarWeeks(year, month)
  const members = (household?.members ?? []) as Array<{ id: number; display_name: string }>

  // Tasks without a due date (shown in a separate panel)
  const undatedTasks = chores.filter((c) => c.type === 'TASK' && !c.due_date)

  const filterPillClass = (active: boolean) =>
    `px-[10px] h-[28px] rounded-[5px] text-[12px] font-medium transition-colors border ${
      active
        ? 'bg-[#fdd329] border-[#0b0a0f] text-[#0b0a0f]'
        : 'bg-[#fffef7] border-[#d8d8bd] text-[#0b0a0f] hover:border-[#0b0a0f]'
    }`

  return (
    <div className="min-h-screen bg-[#fffef7] flex flex-col">
      <Navbar
        householdName={household?.name}
        userName={displayName}
        activePage="chores"
        onLogout={onLogout}
        onProfileOpen={onProfileOpen}
        onNavigate={onNavigate}
      />

      <main className="flex-1 px-[154px] pt-[47px] pb-[80px]">
        {/* Month navigation + ADD button */}
        <div className="flex items-center justify-between mb-[16px]">
          <div className="flex items-center gap-[16px]">
            <button
              onClick={prevMonth}
              className="hover:opacity-60 transition-opacity"
              aria-label="Previous month"
            >
              <svg width="16" height="14" viewBox="0 0 16 14" fill="none">
                <path
                  d="M10 2L4 7L10 12"
                  stroke="#0b0a0f"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <h1 className="text-[#0b0a0f] text-[32px] font-semibold w-[240px] text-center select-none">
              {MONTH_NAMES[month]} {year}
            </h1>
            <button
              onClick={nextMonth}
              className="hover:opacity-60 transition-opacity"
              aria-label="Next month"
            >
              <svg width="16" height="14" viewBox="0 0 16 14" fill="none">
                <path
                  d="M6 2L12 7L6 12"
                  stroke="#0b0a0f"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#fdd329] rounded-[7px] h-[38px] px-[16px] flex items-center gap-[8px] text-[#0b0a0f] text-[16px] font-medium hover:opacity-80 transition-opacity"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1V13M1 7H13" stroke="#0b0a0f" strokeWidth="2" strokeLinecap="round" />
            </svg>
            ADD CHORE
          </button>
        </div>

        {/* ── Filter bar ─────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-[20px] mb-[16px] flex-wrap">
          <div className="flex items-center gap-[8px]">
            <span className="text-[#393939] text-[13px] shrink-0">Assignee:</span>
            <div className="flex gap-[4px] flex-wrap">
              {[
                { value: 'any', label: 'Any' },
                { value: 'me', label: 'Mine' },
                { value: 'unassigned', label: 'Unassigned' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilterAssignee(opt.value === filterAssignee ? 'any' : opt.value)}
                  className={filterPillClass(filterAssignee === opt.value)}
                >
                  {opt.label}
                </button>
              ))}
              {members.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setFilterAssignee(String(m.id) === filterAssignee ? 'any' : String(m.id))}
                  className={filterPillClass(filterAssignee === String(m.id))}
                >
                  {m.display_name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-[8px]">
            <span className="text-[#393939] text-[13px] shrink-0">Status:</span>
            <div className="flex gap-[4px] flex-wrap">
              {STATUS_FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilterStatus(opt.value === filterStatus ? 'all' : opt.value)}
                  className={filterPillClass(filterStatus === opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

        </div>

        {loading && (
          <p className="text-[#393939] text-[14px]">Loading...</p>
        )}

        {!loading && (
          <>
            {/* ── Calendar grid ──────────────────────────────────────────────── */}
            <div className="bg-[#f8f8ed] rounded-[11px] border border-[#d8d8bd] px-[38px] pt-[8px] pb-[16px]">
              {/* Day header row */}
              <div className="grid grid-cols-7 border-b border-[#d8d8bd]">
                {DAY_LABELS.map((label, i) => (
                  <div
                    key={label}
                    className={`text-center py-[16px] text-[28px] font-normal ${
                      i >= 5 ? 'text-[#17a1fa]' : 'text-[#0b0a0f]'
                    }`}
                  >
                    {label}
                  </div>
                ))}
              </div>

              {/* Week rows */}
              {weeks.map((week, wi) => {
                const segments = getWeekSegments(week, chores)
                const maxLane = segments.reduce((m, s) => Math.max(m, s.lane), -1)
                const barsHeight =
                  maxLane >= 0
                    ? (maxLane + 1) * (BAR_HEIGHT + BAR_GAP) + ROW_BOTTOM_PAD
                    : ROW_BOTTOM_PAD
                const rowHeight = DAY_NUM_HEIGHT + barsHeight

                return (
                  <div
                    key={wi}
                    className={`relative ${wi < weeks.length - 1 ? 'border-b border-[#d8d8bd]' : ''}`}
                    style={{ height: rowHeight }}
                  >
                    {/* Vertical column dividers */}
                    <div className="absolute inset-0 grid grid-cols-7 pointer-events-none">
                      {Array.from({ length: 7 }).map((_, i) => (
                        <div key={i} className={i < 6 ? 'border-r border-[#d8d8bd]' : ''} />
                      ))}
                    </div>

                    {/* Day numbers */}
                    <div className="grid grid-cols-7" style={{ height: DAY_NUM_HEIGHT }}>
                      {week.map((date, di) => {
                        const isCurrentMonth = date.getMonth() === month
                        const isWeekend = di >= 5
                        return (
                          <div
                            key={di}
                            className={`text-center flex items-center justify-center text-[28px] font-normal select-none ${
                              !isCurrentMonth
                                ? 'text-black/30'
                                : isWeekend
                                ? 'text-[#17a1fa]'
                                : 'text-[#0b0a0f]'
                            }`}
                          >
                            {date.getDate()}
                          </div>
                        )
                      })}
                    </div>

                    {/* Chore bars */}
                    {segments.map(({ chore, startCol, colSpan, lane, color }) => {
                      const leftPct = (startCol / 7) * 100
                      const widthPct = (colSpan / 7) * 100
                      const top = DAY_NUM_HEIGHT + lane * (BAR_HEIGHT + BAR_GAP)
                      return (
                        <div
                          key={chore.id}
                          className="absolute flex items-center cursor-pointer hover:brightness-95 transition-[filter] rounded-[3px] overflow-hidden"
                          style={{
                            left: `calc(${leftPct}% + 3px)`,
                            width: `calc(${widthPct}% - 6px)`,
                            top,
                            height: BAR_HEIGHT,
                            backgroundColor: color,
                          }}
                          onClick={() => setEditingChore(chore)}
                          title={`${chore.title}${chore.assignee ? ` · ${chore.assignee.display_name}` : ''}`}
                        >
                          <span className="text-[12px] px-[6px] text-[#0b0a0f] truncate leading-none font-normal">
                            {chore.title}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>

            {/* ── Undated tasks panel ────────────────────────────────────────── */}
            {undatedTasks.length > 0 && (
              <div className="mt-[12px] bg-[#f8f8ed] rounded-[11px] border border-[#d8d8bd] px-[20px] py-[12px]">
                <p className="text-[#393939] text-[12px] font-semibold uppercase tracking-wide mb-[8px]">
                  No due date
                </p>
                <div className="flex flex-wrap gap-[6px]">
                  {undatedTasks.map((chore) => (
                    <button
                      key={chore.id}
                      onClick={() => setEditingChore(chore)}
                      className="flex items-center gap-[6px] px-[10px] h-[26px] rounded-[4px] text-[12px] text-[#0b0a0f] hover:brightness-95 transition-[filter]"
                      style={{ backgroundColor: getChoreColor(chore) }}
                    >
                      {chore.title}
                      {chore.assignee && (
                        <span className="text-[#393939]">· {chore.assignee.display_name}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Status legend ──────────────────────────────────────────────── */}
            <div className="flex items-center gap-[20px] mt-[12px]">
              {Object.entries(STATUS_COLORS).map(([status, color]) => (
                <div key={status} className="flex items-center gap-[6px]">
                  <div
                    className="w-[16px] h-[10px] rounded-[2px]"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-[#0b0a0f] text-[12px] capitalize">
                    {STATUS_LABELS[status] ?? status.toLowerCase().replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>

            {/* ── Chore list ─────────────────────────────────────────────────── */}
            <div className="mt-[32px]">
              <div className="flex items-center justify-between mb-[12px]">
                <h2 className="text-[#0b0a0f] text-[20px] font-semibold">Chores</h2>
                <div className="flex items-center gap-[8px]">
                  <span className="text-[#393939] text-[13px] shrink-0">Sort:</span>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-[#fffef7] border border-[#d8d8bd] rounded-[5px] h-[28px] pl-[8px] pr-[26px] text-[12px] text-[#0b0a0f] focus:outline-none focus:border-[#0b0a0f] appearance-none"
                    >
                      <option value="default">Default</option>
                      <option value="date">By date</option>
                      <option value="title">By title</option>
                      <option value="status">By status</option>
                    </select>
                    <svg className="absolute right-[7px] top-1/2 -translate-y-1/2 pointer-events-none" width="10" height="5" viewBox="0 0 10 5" fill="none">
                      <path d="M1 1L5 4L9 1" stroke="#0b0a0f" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>
              </div>

              {chores.length === 0 ? (
                <div className="bg-[#f8f8ed] rounded-[11px] border border-[#d8d8bd] px-[24px] py-[40px] text-center">
                  {hasActiveFilters ? (
                    <>
                      <p className="text-[#393939] text-[15px] mb-[12px]">No chores match these filters.</p>
                      <button
                        onClick={clearFilters}
                        className="text-[#0b0a0f] text-[14px] font-semibold underline hover:opacity-70 transition-opacity"
                      >
                        Clear filters
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-[#393939] text-[15px] mb-[12px]">No chores yet — create your first chore.</p>
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-[#fdd329] rounded-[7px] h-[36px] px-[16px] text-[#0b0a0f] text-[14px] font-medium hover:opacity-80 transition-opacity"
                      >
                        + New chore
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div className="bg-[#f8f8ed] rounded-[11px] border border-[#d8d8bd] divide-y divide-[#d8d8bd]">
                  {chores.map((chore) => {
                    const statusColor = STATUS_COLORS[chore.status] ?? '#b9d8e6'
                    const statusLabel = STATUS_LABELS[chore.status] ?? chore.status
                    const completable = canMarkComplete(chore)
                    return (
                      <div
                        key={chore.id}
                        className="flex items-start gap-[14px] px-[20px] py-[14px]"
                      >
                        {/* Status badge */}
                        <div className="mt-[1px] shrink-0">
                          <span
                            className="inline-flex items-center px-[8px] py-[2px] rounded-full text-[11px] font-semibold"
                            style={{ backgroundColor: statusColor }}
                          >
                            {statusLabel}
                          </span>
                        </div>

                        {/* Content — clickable to open edit modal */}
                        <button
                          className="flex-1 min-w-0 text-left"
                          onClick={() => setEditingChore(chore)}
                        >
                          <div className="flex items-center gap-[8px]">
                            <span className="text-[#0b0a0f] text-[15px] font-semibold truncate">
                              {chore.title}
                            </span>
                            <span className="text-[#393939] text-[11px] shrink-0 bg-[#e8e8d8] rounded-[3px] px-[5px] py-[1px]">
                              {chore.type}
                            </span>
                          </div>
                          <div className="text-[#393939] text-[13px] mt-[2px]">
                            {chore.assignee ? chore.assignee.display_name : 'Unassigned'}
                            {' · '}
                            {choreDateInfo(chore)}
                          </div>
                          {chore.status === 'COMPLETED' && chore.completed_by && (
                            <div className="text-[#393939] text-[12px] mt-[3px]">
                              Completed by{' '}
                              <span className="font-semibold">{chore.completed_by.display_name}</span>
                              {chore.completed_at && (
                                <> on {formatDateShort(chore.completed_at)}</>
                              )}
                            </div>
                          )}
                        </button>

                        {/* Action button */}
                        {completable && (
                          <button
                            onClick={() => handleMarkComplete(chore.id)}
                            className="shrink-0 text-[#0b0a0f] text-[12px] font-medium bg-[#fffef7] border border-[#d8d8bd] rounded-[6px] px-[12px] h-[28px] hover:bg-[#fdd329] hover:border-[#0b0a0f] transition-colors whitespace-nowrap mt-[1px]"
                          >
                            {chore.type === 'TASK' ? 'Done' : 'Mark complete'}
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <footer className="border-t border-[#b3b3b3] bg-[#fffef7] py-[12px] text-center text-[#0b0a0f] text-[14px]">
        © 2026 Bratiuk, Horalevych, Dvoilenko, Tsepkalo
      </footer>

      {/* Modals */}
      {showAddModal && (
        <ChoreFormModal
          mode="add"
          members={members}
          onSubmit={(data) => handleChoreCreated(data as ChoreCreate)}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {editingChore && (
        <ChoreFormModal
          mode="edit"
          chore={editingChore}
          members={members}
          onSubmit={(data) => handleChoreUpdated(editingChore.id, data)}
          onClose={() => setEditingChore(null)}
          onDelete={() => {
            setDeletingChore(editingChore)
            setEditingChore(null)
          }}
          onComplete={() => handleMarkComplete(editingChore.id)}
          onReopen={() => handleReopenChore(editingChore.id)}
        />
      )}

      {deletingChore && (
        <DeleteChoreModal
          choreTitle={deletingChore.title}
          onConfirm={() => handleChoreDeleted(deletingChore.id)}
          onCancel={() => setDeletingChore(null)}
        />
      )}
    </div>
  )
}
