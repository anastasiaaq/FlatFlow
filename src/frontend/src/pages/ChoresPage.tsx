import { useState, useEffect, useCallback } from 'react'
import Navbar from '../components/Navbar'
import ChoreFormModal from '../components/chores/ChoreFormModal'
import DeleteChoreModal from '../components/chores/DeleteChoreModal'
import {
  apiChoresList,
  apiChoresCreate,
  apiChoresUpdate,
  apiChoresDestroy,
} from '../api/generated/chores/chores'
import { apiHouseholdsCurrentRetrieve } from '../api/generated/households/households'
import type {
  ChoreDetail,
  ChoreCreate,
  HouseholdDetail,
} from '../api/generated/flatFlowAPI.schemas'

// ── date helpers ──────────────────────────────────────────────────────────────

function parseISODate(str: string): Date {
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function getChoreStart(chore: ChoreDetail): Date {
  const s = chore.start_date ?? chore.due_date ?? chore.created_at.slice(0, 10)
  return parseISODate(s)
}

function getChoreEnd(chore: ChoreDetail): Date {
  const e = chore.end_date ?? chore.due_date ?? chore.created_at.slice(0, 10)
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

// ── chore bar logic ───────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: '#c0e6b9',
  OVERDUE: '#e6c0b9',
  PENDING_CONFIRMATION: '#e6e0b9',
  ACTIVE: '#b9d8e6',
}

const ASSIGNEE_COLORS = [
  '#b9d8e6',
  '#c0e6b9',
  '#e6d4b9',
  '#d4b9e6',
  '#e6b9c4',
  '#b9e6d8',
  '#e6e0b9',
]

function getChoreColor(chore: ChoreDetail): string {
  if (chore.status !== 'ACTIVE') return STATUS_COLORS[chore.status] ?? '#b9d8e6'
  // Stable color per assignee or chore id
  const seed = chore.assignee?.id ?? chore.id
  return ASSIGNEE_COLORS[seed % ASSIGNEE_COLORS.length]
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
      const s = getChoreStart(c)
      const e = getChoreEnd(c)
      return s.getTime() <= weekEnd.getTime() && e.getTime() >= weekStart.getTime()
    })
    .sort((a, b) => getChoreStart(a).getTime() - getChoreStart(b).getTime())

  const laneEnds: Date[] = []

  return overlapping.map((chore) => {
    const choreStart = getChoreStart(chore)
    const choreEnd = getChoreEnd(chore)

    const startCol = Math.max(
      0,
      Math.round((choreStart.getTime() - weekStart.getTime()) / 86_400_000),
    )
    const endCol = Math.min(
      6,
      Math.round((choreEnd.getTime() - weekStart.getTime()) / 86_400_000),
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

// ── page component ────────────────────────────────────────────────────────────

type Page = 'household' | 'rules' | 'chores' | 'issues'

type Props = {
  currentUserId?: number
  onNavigate?: (page: Page) => void
}

export default function ChoresPage({ currentUserId, onNavigate }: Props) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [chores, setChores] = useState<ChoreDetail[]>([])
  const [household, setHousehold] = useState<HouseholdDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingChore, setEditingChore] = useState<ChoreDetail | null>(null)
  const [deletingChore, setDeletingChore] = useState<ChoreDetail | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [choresRes, householdRes] = await Promise.all([
        apiChoresList(),
        apiHouseholdsCurrentRetrieve(),
      ])
      if (choresRes.status === 200) setChores(choresRes.data)
      if (householdRes.status === 200) setHousehold(householdRes.data)
    } finally {
      setLoading(false)
    }
  }, [])

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

  async function handleChoreUpdated(id: number, data: ChoreCreate) {
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

  const currentMember = household?.members.find((m) => m.id === currentUserId)
  const weeks = getCalendarWeeks(year, month)
  const members = (household?.members ?? []) as Array<{ id: number; display_name: string }>

  return (
    <div className="min-h-screen bg-[#fffef7] flex flex-col">
      <Navbar
        householdName={household?.name}
        userName={currentMember?.display_name}
        activePage="chores"
        onNavigate={onNavigate}
      />

      <main className="flex-1 px-[154px] pt-[47px] pb-[80px]">
        {/* Month navigation + ADD button */}
        <div className="flex items-center justify-between mb-[24px]">
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

        {loading && (
          <p className="text-[#393939] text-[14px]">Loading...</p>
        )}

        {!loading && (
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
        )}

        {/* Status legend */}
        {!loading && (
          <div className="flex items-center gap-[20px] mt-[16px]">
            {Object.entries(STATUS_COLORS).map(([status, color]) => (
              <div key={status} className="flex items-center gap-[6px]">
                <div
                  className="w-[16px] h-[10px] rounded-[2px]"
                  style={{ backgroundColor: color }}
                />
                <span className="text-[#0b0a0f] text-[12px] capitalize">
                  {status.toLowerCase().replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
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
          onSubmit={handleChoreCreated}
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
