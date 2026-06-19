import { useState } from 'react'
import type { SyntheticEvent } from 'react'
import type { ChoreDetail, ChoreCreate, ChoreUpdate, TypeEnum } from '../../api/generated/flatFlowAPI.schemas'

interface Props {
  mode: 'add' | 'edit'
  chore?: ChoreDetail
  members: Array<{ id: number; display_name: string }>
  onSubmit: (data: ChoreCreate | ChoreUpdate) => Promise<void>
  onClose: () => void
  onDelete?: () => void
  onComplete?: () => Promise<void>
  onReopen?: () => Promise<void>
}

function formatDateShort(iso: string | null | undefined): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('T')[0].split('-')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[parseInt(m) - 1]} ${parseInt(d)}, ${y}`
}

export default function ChoreFormModal({
  mode,
  chore,
  members,
  onSubmit,
  onClose,
  onDelete,
  onComplete,
  onReopen,
}: Props) {
  const [type, setType] = useState<TypeEnum>(chore?.type ?? 'DUTY')
  const [title, setTitle] = useState(chore?.title ?? '')
  const [description, setDescription] = useState(chore?.description ?? '')
  const [startDate, setStartDate] = useState(chore?.start_date ?? '')
  const [endDate, setEndDate] = useState(
    chore ? (chore.type === 'TASK' ? (chore.due_date ?? '') : (chore.end_date ?? '')) : '',
  )
  const [assigneeId, setAssigneeId] = useState(
    chore?.assignee?.id?.toString() ?? '',
  )
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isCompleted = chore?.status === 'COMPLETED'
  const canComplete = mode === 'edit' && !isCompleted && onComplete != null
  const canReopen = mode === 'edit' && isCompleted && onReopen != null

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const commonFields = {
        title: title.trim(),
        description: description.trim() || undefined,
        assignee_id: assigneeId ? Number(assigneeId) : null,
      }
      const data: ChoreCreate | ChoreUpdate = mode === 'edit'
        ? type === 'TASK'
          ? { ...commonFields, due_date: endDate || null }
          : { ...commonFields, start_date: startDate || null, end_date: endDate || null }
        : type === 'TASK'
          ? { ...commonFields, type, due_date: endDate || null }
          : { ...commonFields, type, start_date: startDate || null, end_date: endDate || null }
      await onSubmit(data)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleComplete() {
    if (!onComplete) return
    setSubmitting(true)
    setError(null)
    try {
      await onComplete()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleReopen() {
    if (!onReopen) return
    setSubmitting(true)
    setError(null)
    try {
      await onReopen()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'w-full bg-[#fffef7] rounded-[7px] border border-[#d8d8bd] h-[43px] px-[12px] text-[#0b0a0f] text-[14px] placeholder-[#aaa] focus:outline-none focus:border-[#0b0a0f]'
  const choreTypeOptions: Array<{
    value: TypeEnum
    label: string
    description: string
  }> = [
    {
      value: 'DUTY',
      label: 'Duty',
      description: 'Ongoing responsibility across a date range.\nExample: dishes this week.',
    },
    {
      value: 'TASK',
      label: 'Task',
      description: 'One-time chore with an optional due date.\nExample: buying detergent.',
    },
  ]

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-[#f8f8ed] rounded-[11px] w-[479px] max-h-[90vh] overflow-y-auto relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-[28px] top-[28px] hover:opacity-60 transition-opacity"
          aria-label="Close"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#0b0a0f"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="px-[36px] pt-[32px] pb-[36px]">
          <h2 className="text-[#0b0a0f] text-[32px] font-semibold mb-[24px] pr-[32px]">
            {mode === 'add' ? 'Add a new chore' : 'Edit the chore'}
          </h2>

          {/* Completed attribution banner */}
          {isCompleted && chore?.completed_by && (
            <div className="mb-[20px] bg-[#c0e6b9] rounded-[7px] px-[14px] py-[10px] flex items-center gap-[8px]">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6.25" stroke="#2a7a2a" strokeWidth="1.5" />
                <path d="M4 7l2 2 4-4" stroke="#2a7a2a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-[#0b0a0f] text-[13px]">
                Completed by{' '}
                <span className="font-semibold">{chore.completed_by.display_name}</span>
                {chore.completed_at && (
                  <> on {formatDateShort(chore.completed_at)}</>
                )}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-[20px]">
            {/* Type toggle */}
            <div>
              <div className="flex items-baseline justify-between mb-[8px]">
                <label className="text-[#0b0a0f] text-[16px] font-semibold">
                  Type
                </label>
                {mode === 'edit' && (
                  <span className="text-[#393939] text-[12px]">
                    Cannot be changed after creation
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-[10px]">
                {choreTypeOptions.map((option) => {
                  const isSelected = type === option.value
                  return (
                    <div key={option.value} className="relative group">
                      <button
                        type="button"
                        onClick={() => mode === 'add' && setType(option.value)}
                        disabled={mode === 'edit'}
                        aria-pressed={isSelected}
                        aria-describedby={`chore-type-${option.value.toLowerCase()}-hint`}
                        className={`w-full min-h-[43px] rounded-[7px] border px-[13px] py-[9px] text-center text-[14px] font-semibold transition-colors ${
                          isSelected
                            ? 'bg-[#fdd329] border-[#0b0a0f] text-[#0b0a0f]'
                            : 'bg-[#fffef7] border-[#d8d8bd] text-[#0b0a0f]'
                        } ${mode === 'add' ? 'hover:border-[#0b0a0f] cursor-pointer' : 'cursor-default opacity-80'}`}
                      >
                        {option.label}
                      </button>
                      <span
                        id={`chore-type-${option.value.toLowerCase()}-hint`}
                        role="tooltip"
                        className="pointer-events-none absolute left-1/2 top-[calc(100%+8px)] z-10 w-[196px] -translate-x-1/2 whitespace-pre-line rounded-[7px] border border-[#d8d8bd] bg-[#fffef7] px-[10px] py-[8px] text-center text-[12px] font-normal leading-[1.35] text-[#393939] opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                      >
                        {option.description}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Title */}
            <div>
              <div className="flex justify-between items-baseline mb-[6px]">
                <label className="text-[#0b0a0f] text-[16px] font-semibold">
                  Title *
                </label>
                <span className="text-[#0b0a0f] text-[14px] font-light">
                  {title.length}/80
                </span>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, 80))}
                placeholder="Enter chore title..."
                maxLength={80}
                required
                className={inputClass}
              />
            </div>

            {/* Description */}
            <div>
              <div className="flex justify-between items-baseline mb-[6px]">
                <label className="text-[#0b0a0f] text-[16px] font-semibold">
                  Description
                </label>
                <span className="text-[#0b0a0f] text-[14px] font-light">
                  {description.length}/500
                </span>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 500))}
                placeholder="Enter description..."
                maxLength={500}
                rows={4}
                className="w-full bg-[#fffef7] rounded-[7px] border border-[#d8d8bd] px-[12px] py-[10px] text-[#0b0a0f] text-[14px] placeholder-[#aaa] focus:outline-none focus:border-[#0b0a0f] resize-none"
              />
            </div>

            {/* Dates */}
            {type === 'DUTY' ? (
              <div className="grid grid-cols-2 gap-[14px]">
                <div>
                  <label className="text-[#0b0a0f] text-[16px] font-semibold block mb-[6px]">
                    Start date *
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-[#0b0a0f] text-[16px] font-semibold block mb-[6px]">
                    End date *
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || undefined}
                    required
                    className={inputClass}
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="text-[#0b0a0f] text-[16px] font-semibold block mb-[6px]">
                  Due date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={inputClass}
                />
              </div>
            )}

            {/* Assign to */}
            <div>
              <label className="text-[#0b0a0f] text-[16px] font-semibold block mb-[6px]">
                Assign to
              </label>
              <div className="relative">
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className={`${inputClass} appearance-none pr-[36px]`}
                >
                  <option value="">Unassigned</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.display_name}
                    </option>
                  ))}
                </select>
                <svg
                  className="absolute right-[12px] top-1/2 -translate-y-1/2 pointer-events-none"
                  width="16"
                  height="7"
                  viewBox="0 0 16 7"
                  fill="none"
                >
                  <path
                    d="M1 1L8 6L15 1"
                    stroke="#0b0a0f"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {error && <p className="text-[#cb322d] text-[14px]">{error}</p>}

            {/* Mark complete / Reopen */}
            {canComplete && (
              <button
                type="button"
                onClick={handleComplete}
                disabled={submitting}
                className="w-full bg-[#c0e6b9] rounded-[7px] border border-[#0b0a0f]/20 h-[39px] text-[#0b0a0f] text-[14px] font-semibold hover:brightness-95 transition-[filter] disabled:opacity-50"
              >
                {chore?.type === 'TASK' ? 'Done' : 'Mark complete'}
              </button>
            )}

            {canReopen && (
              <button
                type="button"
                onClick={handleReopen}
                disabled={submitting}
                className="w-full bg-[#fffef7] rounded-[7px] border border-[#d8d8bd] h-[39px] text-[#393939] text-[14px] font-medium hover:bg-[#fdd329] hover:border-[#0b0a0f] hover:text-[#0b0a0f] transition-colors disabled:opacity-50"
              >
                Reopen chore
              </button>
            )}

            {/* Actions row */}
            <div className="flex items-center justify-between mt-[4px]">
              {mode === 'edit' && onDelete ? (
                <button
                  type="button"
                  onClick={onDelete}
                  className="text-[#cb322d] text-[14px] font-semibold hover:opacity-70 transition-opacity"
                >
                  Delete chore
                </button>
              ) : (
                <span />
              )}
              <button
                type="submit"
                disabled={submitting}
                className="bg-[#fffef7] rounded-[7px] border border-[#d8d8bd] px-[32px] h-[39px] text-[#0b0a0f] text-[16px] font-medium hover:bg-[#fdd329] hover:border-[#0b0a0f] transition-colors disabled:opacity-50"
              >
                {submitting ? '...' : mode === 'add' ? 'ADD' : 'SAVE'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
