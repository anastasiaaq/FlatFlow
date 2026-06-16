import { useState } from 'react'
import type { ChoreDetail, ChoreCreate, ChoreUpdate, TypeEnum } from '../../api/generated/flatFlowAPI.schemas'

interface Props {
  mode: 'add' | 'edit'
  chore?: ChoreDetail
  members: Array<{ id: number; display_name: string }>
  onSubmit: (data: ChoreCreate | ChoreUpdate) => Promise<void>
  onClose: () => void
  onDelete?: () => void
}

export default function ChoreFormModal({
  mode,
  chore,
  members,
  onSubmit,
  onClose,
  onDelete,
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

  async function handleSubmit(e: React.FormEvent) {
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

  const inputClass =
    'w-full bg-[#fffef7] rounded-[7px] border border-[#d8d8bd] h-[43px] px-[12px] text-[#0b0a0f] text-[14px] placeholder-[#aaa] focus:outline-none focus:border-[#0b0a0f]'

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

          <form onSubmit={handleSubmit} className="flex flex-col gap-[20px]">
            {/* Type toggle */}
            <div className="flex gap-[8px]">
              {(['DUTY', 'TASK'] as TypeEnum[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => mode === 'add' && setType(t)}
                  disabled={mode === 'edit'}
                  className={`px-[16px] py-[7px] rounded-[7px] text-[14px] font-medium border transition-colors ${
                    type === t
                      ? 'bg-[#fdd329] border-[#0b0a0f] text-[#0b0a0f]'
                      : 'bg-[#fffef7] border-[#d8d8bd] text-[#0b0a0f]'
                  } ${mode === 'add' ? 'hover:border-[#0b0a0f] cursor-pointer' : 'cursor-default'}`}
                >
                  {t === 'TASK' ? 'Task' : 'Duty'}
                </button>
              ))}
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
                    Due date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || undefined}
                    className={inputClass}
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="text-[#0b0a0f] text-[16px] font-semibold block mb-[6px]">
                  Due date *
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className={inputClass}
                />
              </div>
            )}

            {/* Assign to */}
            <div>
              <label className="text-[#0b0a0f] text-[16px] font-semibold block mb-[6px]">
                Assign to *
              </label>
              <div className="relative">
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  required
                  className={`${inputClass} appearance-none pr-[36px]`}
                >
                  <option value="" disabled>
                    Select from the list
                  </option>
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
