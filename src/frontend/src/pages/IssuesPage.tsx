import { useEffect, useState } from 'react'
import {
  createIssue,
  csrf,
  deleteIssue,
  getCurrentHousehold,
  listIssues,
  updateIssue,
  type IssueDetail,
  type IssueStatus,
} from '../api'
import Navbar from '../components/Navbar'

const TITLE_MAX_LENGTH = 80
const DESCRIPTION_MAX_LENGTH = 1000

type ModalState =
  | { type: 'edit'; issue: IssueDetail }
  | { type: 'delete'; issue: IssueDetail }
  | null

type NavPage = 'household' | 'rules' | 'chores' | 'issues'

type IssuesPageProps = {
  currentUserName?: string
  onNavigate?: (page: NavPage) => void
  onLogout?: () => void
  onProfileOpen?: () => void
}

export default function IssuesPage({
  currentUserName,
  onNavigate,
  onLogout,
  onProfileOpen,
}: IssuesPageProps) {
  const [issues, setIssues] = useState<IssueDetail[]>([])
  const [householdName, setHouseholdName] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [modal, setModal] = useState<ModalState>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    async function loadPage() {
      try {
        const [issuesResponse, householdResponse] = await Promise.all([
          listIssues(),
          getCurrentHousehold().catch(() => null),
        ])

        setIssues(issuesResponse.data)
        setHouseholdName(householdResponse?.data.name ?? '')
      } catch {
        setError('Could not load issues.')
      } finally {
        setLoading(false)
      }
    }

    loadPage()
  }, [])

  async function handleCreateIssue(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const validationError = validateIssue(title, description)

    if (validationError) {
      setFormError(validationError)
      return
    }

    setSaving(true)
    setFormError(null)

    try {
      await csrf()
      const response = await createIssue(title.trim(), description.trim())
      setIssues((currentIssues) => [response.data, ...currentIssues])
      setTitle('')
      setDescription('')
    } catch {
      setFormError('Could not add issue.')
    } finally {
      setSaving(false)
    }
  }

  async function handleEditIssue(
    issue: IssueDetail,
    nextTitle: string,
    nextDescription: string,
    nextStatus: IssueStatus,
  ) {
    const validationError = validateIssue(nextTitle, nextDescription)

    if (validationError) return validationError

    setSaving(true)

    try {
      await csrf()
      const response = await updateIssue({
        id: issue.id,
        title: nextTitle.trim(),
        description: nextDescription.trim(),
        status: nextStatus,
      })
      setIssues((currentIssues) =>
        currentIssues.map((currentIssue) =>
          currentIssue.id === issue.id ? response.data : currentIssue,
        ),
      )
      setModal(null)
      return null
    } catch {
      return 'Could not save issue.'
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteIssue(issue: IssueDetail) {
    setSaving(true)

    try {
      await csrf()
      await deleteIssue(issue.id)
      setIssues((currentIssues) =>
        currentIssues.filter((currentIssue) => currentIssue.id !== issue.id),
      )
      setModal(null)
    } catch {
      setError('Could not delete issue.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page-shell">
      <Navbar
        activePage="issues"
        householdName={householdName}
        userName={currentUserName}
        onNavigate={onNavigate}
        onProfileOpen={onProfileOpen}
        onLogout={onLogout}
      />

      <main className="issues-page">
        <section className="page-heading">
          <h1>Issues</h1>
          <p>Shared occurred issues to solve them faster</p>
        </section>

        {loading && <p className="page-message">Loading...</p>}
        {error && <p className="page-message page-message--error">{error}</p>}

        {!loading && (
          <div className="issues-layout">
            <section className="issues-list" aria-label="Household issues">
              {issues.length === 0 && (
                <article className="issue-card issue-card--empty">
                  No issues yet. Add the first one for your household.
                </article>
              )}

              {issues.map((issue) => (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  onEdit={() => setModal({ type: 'edit', issue })}
                  onDelete={() => setModal({ type: 'delete', issue })}
                />
              ))}
            </section>

            <aside className="issues-side-panel">
              {modal?.type === 'edit' ? (
                <IssueEditPanel
                  issue={modal.issue}
                  saving={saving}
                  onCancel={() => setModal(null)}
                  onSave={handleEditIssue}
                />
              ) : (
                <IssueForm
                  title={title}
                  description={description}
                  error={formError}
                  disabled={saving}
                  onTitleChange={(value) => {
                    setTitle(value)
                    setFormError(null)
                  }}
                  onDescriptionChange={(value) => {
                    setDescription(value)
                    setFormError(null)
                  }}
                  onCancel={() => {
                    setTitle('')
                    setDescription('')
                    setFormError(null)
                  }}
                  onSubmit={handleCreateIssue}
                />
              )}

              {modal?.type === 'delete' && (
                <IssueDeletePanel
                  issue={modal.issue}
                  saving={saving}
                  onCancel={() => setModal(null)}
                  onDelete={handleDeleteIssue}
                />
              )}
            </aside>
          </div>
        )}
      </main>

    </div>
  )
}

function IssueCard({
  issue,
  onEdit,
  onDelete,
}: {
  issue: IssueDetail
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <article className="issue-card">
      <div className="issue-card__main">
        <div className="issue-card__top">
          <h2>{issue.title}</h2>
          <span>{formatStatus(issue.status)}</span>
        </div>
        <p>{issue.description}</p>
        <div className="issue-card__footer">
          <span>
            Created on {formatIssueDate(issue.created_at)} by{' '}
            <strong>{issue.created_by.display_name}</strong>
          </span>
          <div className="issue-card__actions">
            <IconButton label="Edit issue" onClick={onEdit}>
              <PencilIcon />
            </IconButton>
            <IconButton label="Delete issue" onClick={onDelete}>
              <TrashIcon />
            </IconButton>
          </div>
        </div>
      </div>
    </article>
  )
}

function IssueForm({
  title,
  description,
  error,
  disabled,
  onTitleChange,
  onDescriptionChange,
  onCancel,
  onSubmit,
}: {
  title: string
  description: string
  error: string | null
  disabled: boolean
  onTitleChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onCancel: () => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}) {
  return (
    <form className="issue-form" onSubmit={onSubmit}>
      <h2>Add a new issue</h2>
      <TextInput
        label="Title *"
        value={title}
        maxLength={TITLE_MAX_LENGTH}
        placeholder="Enter your text here..."
        onChange={onTitleChange}
      />
      <TextArea
        label="Description *"
        value={description}
        maxLength={DESCRIPTION_MAX_LENGTH}
        placeholder="Enter your text here..."
        onChange={onDescriptionChange}
      />
      {error && <p className="form-error">{error}</p>}
      <div className="issue-form__actions">
        <button type="button" className="button button--secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="button button--primary" disabled={disabled}>
          Add
        </button>
      </div>
    </form>
  )
}

function IssueEditPanel({
  issue,
  saving,
  onCancel,
  onSave,
}: {
  issue: IssueDetail
  saving: boolean
  onCancel: () => void
  onSave: (
    issue: IssueDetail,
    title: string,
    description: string,
    status: IssueStatus,
  ) => Promise<string | null>
}) {
  const [title, setTitle] = useState(issue.title)
  const [description, setDescription] = useState(issue.description)
  const [status, setStatus] = useState<IssueStatus>(issue.status)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextError = await onSave(issue, title, description, status)
    setError(nextError)
  }

  return (
    <form className="issue-form" onSubmit={handleSubmit}>
      <h2>Edit issue</h2>
      <TextInput
        label="Title *"
        value={title}
        maxLength={TITLE_MAX_LENGTH}
        placeholder="Enter your text here..."
        onChange={(value) => {
          setTitle(value)
          setError(null)
        }}
      />
      <TextArea
        label="Description *"
        value={description}
        maxLength={DESCRIPTION_MAX_LENGTH}
        placeholder="Enter your text here..."
        onChange={(value) => {
          setDescription(value)
          setError(null)
        }}
      />
      <label className="issue-field">
        <span>Status</span>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as IssueStatus)}
        >
          <option value="OPEN">Open</option>
          <option value="RESOLVED">Resolved</option>
        </select>
      </label>
      {error && <p className="form-error">{error}</p>}
      <div className="issue-form__actions">
        <button type="button" className="button button--secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="button button--primary" disabled={saving}>
          Save
        </button>
      </div>
    </form>
  )
}

function IssueDeletePanel({
  issue,
  saving,
  onCancel,
  onDelete,
}: {
  issue: IssueDetail
  saving: boolean
  onCancel: () => void
  onDelete: (issue: IssueDetail) => void
}) {
  return (
    <section className="delete-panel">
      <h2>Delete issue</h2>
      <p>Are you sure you want to delete this issue?</p>
      <span>This action cannot be undone.</span>
      <div className="issue-form__actions">
        <button type="button" className="button button--danger-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="button"
          className="button button--danger"
          disabled={saving}
          onClick={() => onDelete(issue)}
        >
          Delete
        </button>
      </div>
    </section>
  )
}

function TextInput({
  label,
  value,
  maxLength,
  placeholder,
  onChange,
}: {
  label: string
  value: string
  maxLength: number
  placeholder: string
  onChange: (value: string) => void
}) {
  return (
    <label className="issue-field">
      <span>
        {label}
        <small>
          {value.length}/{maxLength}
        </small>
      </span>
      <input
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

function TextArea({
  label,
  value,
  maxLength,
  placeholder,
  onChange,
}: {
  label: string
  value: string
  maxLength: number
  placeholder: string
  onChange: (value: string) => void
}) {
  return (
    <label className="issue-field">
      <span>
        {label}
        <small>
          {value.length}/{maxLength}
        </small>
      </span>
      <textarea
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

function validateIssue(title: string, description: string) {
  const trimmedTitle = title.trim()
  const trimmedDescription = description.trim()

  if (!trimmedTitle) return 'Title is required.'
  if (trimmedTitle.length > TITLE_MAX_LENGTH) {
    return `Title must be ${TITLE_MAX_LENGTH} characters or fewer.`
  }
  if (!trimmedDescription) return 'Description is required.'
  if (trimmedDescription.length > DESCRIPTION_MAX_LENGTH) {
    return `Description must be ${DESCRIPTION_MAX_LENGTH} characters or fewer.`
  }

  return null
}

function formatStatus(status: IssueStatus) {
  return status === 'OPEN' ? 'Open' : 'Resolved'
}

function formatIssueDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  })
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button type="button" className="icon-button" aria-label={label} onClick={onClick}>
      {children}
    </button>
  )
}

function PencilIcon() {
  return (
    <svg width="17" height="19" viewBox="0 0 24 24" fill="none">
      <path d="M4 20h4.5L19 9.5 14.5 5 4 15.5V20Z" fill="currentColor" />
      <path d="M13.5 6 18 10.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M7 8h10l-.7 12H7.7L7 8ZM9 5h6l1 2H8l1-2ZM6 7h12"
        fill="currentColor"
      />
    </svg>
  )
}
