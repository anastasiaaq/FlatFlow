import { useState } from 'react'

interface Props {
  choreTitle: string
  onConfirm: () => Promise<void>
  onCancel: () => void
}

export default function DeleteChoreModal({ choreTitle, onConfirm, onCancel }: Props) {
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    try {
      await onConfirm()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-[#fbf4f1] rounded-[11px] border border-[#d8bdbd] w-[375px] p-[28px]">
        <div className="flex items-start gap-[14px] mb-[20px]">
          <div className="w-[45px] h-[45px] shrink-0 flex items-center justify-center rounded-full bg-[#cb322d]/10">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#cb322d"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div>
            <h3 className="text-[#cb322d] text-[16px] font-semibold mb-[8px]">
              Delete chore
            </h3>
            <p className="text-[#000] text-[14px] font-normal">
              Are you sure you want to delete{' '}
              <strong>{choreTitle || 'this chore'}</strong>?
            </p>
            <p className="text-black/55 text-[14px] font-light mt-[6px] max-w-[200px]">
              This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-[12px]">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="rounded-[7px] border border-[#d8bdbd] px-[20px] h-[38px] text-[#000] text-[16px] font-medium hover:bg-[#f5eded] transition-colors disabled:opacity-50"
          >
            CANCEL
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="bg-[#cb322d] rounded-[7px] px-[20px] h-[38px] text-[#f8eded] text-[16px] font-medium hover:opacity-80 transition-opacity disabled:opacity-50"
          >
            {deleting ? '...' : 'DELETE'}
          </button>
        </div>
      </div>
    </div>
  )
}
