import { useEffect, useState } from 'react'
import { apiUsersCsrfRetrieve } from '../api/generated/users/users'
import {
  createIssue,
  deleteIssue,
  listIssues,
  toggleIssueStatus,
  updateIssue,
  type IssueDetail,
} from '../api/issues'
import { getCurrentHousehold } from '../api'
import Navbar from '../components/Navbar'
import type { Page } from '../types/navigation'

const TITLE_MAX_LENGTH = 80
const DESCRIPTION_MAX_LENGTH = 1000

type PanelState =
  | { type: 'edit'; issue: IssueDetail }
  | { type: 'delete'; issue: IssueDetail }
  | null

type IssuesPageProps = {
  currentUserId?: number
  currentUserName?: string
  onNavigate?: (page: Page) => void
  onLogout?: () => void
  onProfileOpen?: () => void
}

export default function IssuesPage({
  currentUserId,
  currentUserName,
  onNavigate,
  onLogout,
  onProfileOpen,
}: IssuesPageProps) {
  const [issues, setIssues] = useState<IssueDetail[]>([])
  const [householdName, setHouseholdName] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [panel, setPanel] = useState<PanelState>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([listIssues(), getCurrentHousehold().catch(() => null)])
      .then(([issuesResponse, householdResponse]) => {
        setIssues(issuesResponse.data)
        setHouseholdName(householdResponse?.data.name ?? '')
      })
      .catch(() => setError('Could not load issues.'))
      .finally(() => setLoading(false))
  }, [])

  async function prepareMutation() {
    await apiUsersCsrfRetrieve()
  }

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const validationError = validateIssue(title, description)

    if (validationError) {
      setFormError(validationError)
      return
    }

    setSaving(true)
    setFormError(null)

    try {
      await prepareMutation()
      const response = await createIssue(title.trim(), description.trim())
      setIssues((current) => [response.data, ...current])
      setTitle('')
      setDescription('')
    } catch {
      setFormError('Could not add issue.')
    } finally {
      setSaving(false)
    }
  }

  async function handleEdit(
    issue: IssueDetail,
    nextTitle: string,
    nextDescription: string,
  ) {
    const validationError = validateIssue(nextTitle, nextDescription)
    if (validationError) return validationError

    setSaving(true)

    try {
      await prepareMutation()
      const response = await updateIssue(issue.id, {
        title: nextTitle.trim(),
        description: nextDescription.trim(),
      })
      setIssues((current) => replaceIssue(current, response.data))
      setPanel(null)
      return null
    } catch {
      return 'Could not save issue.'
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(issue: IssueDetail) {
    setSaving(true)

    try {
      await prepareMutation()
      await deleteIssue(issue.id)
      setIssues((current) => current.filter((item) => item.id !== issue.id))
      setPanel(null)
    } catch {
      setError('Could not delete issue.')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggle(issue: IssueDetail) {
    try {
      await prepareMutation()
      const response = await toggleIssueStatus(issue.id)
      setIssues((current) => sortIssues(replaceIssue(current, response.data)))
    } catch {
      setError('Could not update issue status.')
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
          <p>Shared occurred issues to solve them faster.</p>
        </section>

        {loading && <p className="issues-message">Loading...</p>}
        {error && <p className="issues-message issues-message--error">{error}</p>}

        {!loading && (
          <div className="issues-layout">
            <section className="issues-list" aria-label="Household issues">
              {issues.length === 0 && (
                <div className="issue-card issue-card--empty">
                  No issues yet. Add the first one for your household.
                </div>
              )}

              {issues.map((issue) => (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  canManage={issue.created_by.id === currentUserId}
                  onEdit={() => setPanel({ type: 'edit', issue })}
                  onDelete={() => setPanel({ type: 'delete', issue })}
                  onToggle={() => handleToggle(issue)}
                />
              ))}
            </section>

            <aside className="issues-side-panel">
              {panel?.type === 'edit' ? (
                <EditIssuePanel
                  issue={panel.issue}
                  saving={saving}
                  onCancel={() => setPanel(null)}
                  onSave={handleEdit}
                />
              ) : (
                <IssueForm
                  title={title}
                  description={description}
                  error={formError}
                  saving={saving}
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
                  onSubmit={handleCreate}
                />
              )}

              {panel?.type === 'delete' && (
                <DeleteIssuePanel
                  issue={panel.issue}
                  saving={saving}
                  onCancel={() => setPanel(null)}
                  onDelete={handleDelete}
                />
              )}
            </aside>
          </div>
        )}
      </main>

      <footer className="app-footer">
        © 2026 Bratiuk, Horalevych, Dvoilenko, Tsepkalo
      </footer>
    </div>
  )
}

function IssueCard({
  issue,
  canManage,
  onEdit,
  onDelete,
  onToggle,
}: {
  issue: IssueDetail
  canManage: boolean
  onEdit: () => void
  onDelete: () => void
  onToggle: () => void
}) {
  return (
    <article className="issue-card">
      <div className="issue-card__top">
        <h2>{issue.title}</h2>
        <button type="button" className="issue-status" onClick={onToggle}>
          {issue.status === 'OPEN' ? 'Open' : 'Resolved'}
        </button>
      </div>
      <p>{issue.description}</p>
      <div className="issue-card__footer">
        <span>
          Created on {formatIssueDate(issue.created_at)} by{' '}
          <strong>{issue.created_by.display_name}</strong>
        </span>
        {canManage && (
          <div className="issue-card__actions">
            <IconButton label="Edit issue" onClick={onEdit}>
              <PencilIcon />
            </IconButton>
            <IconButton label="Delete issue" onClick={onDelete}>
              <TrashIcon />
            </IconButton>
          </div>
        )}
      </div>
    </article>
  )
}

function IssueForm({
  title,
  description,
  error,
  saving,
  onTitleChange,
  onDescriptionChange,
  onCancel,
  onSubmit,
}: {
  title: string
  description: string
  error: string | null
  saving: boolean
  onTitleChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onCancel: () => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}) {
  return (
    <form className="issue-form" onSubmit={onSubmit}>
      <h2>Add a new issue</h2>
      <IssueField
        label="Title *"
        value={title}
        maxLength={TITLE_MAX_LENGTH}
        onChange={onTitleChange}
      />
      <IssueField
        multiline
        label="Description *"
        value={description}
        maxLength={DESCRIPTION_MAX_LENGTH}
        onChange={onDescriptionChange}
      />
      {error && <p className="issue-form__error">{error}</p>}
      <div className="issue-form__actions">
        <button type="button" className="button button--secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="button button--primary" disabled={saving}>
          Add
        </button>
      </div>
    </form>
  )
}

function EditIssuePanel({
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
  ) => Promise<string | null>
}) {
  const [title, setTitle] = useState(issue.title)
  const [description, setDescription] = useState(issue.description)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(await onSave(issue, title, description))
  }

  return (
    <form className="issue-form" onSubmit={handleSubmit}>
      <h2>Edit issue</h2>
      <IssueField
        label="Title *"
        value={title}
        maxLength={TITLE_MAX_LENGTH}
        onChange={(value) => {
          setTitle(value)
          setError(null)
        }}
      />
      <IssueField
        multiline
        label="Description *"
        value={description}
        maxLength={DESCRIPTION_MAX_LENGTH}
        onChange={(value) => {
          setDescription(value)
          setError(null)
        }}
      />
      {error && <p className="issue-form__error">{error}</p>}
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

function DeleteIssuePanel({
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
    <section className="issue-delete-panel" role="dialog" aria-modal="true">
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

function IssueField({
  label,
  value,
  maxLength,
  multiline = false,
  onChange,
}: {
  label: string
  value: string
  maxLength: number
  multiline?: boolean
  onChange: (value: string) => void
}) {
  return (
    <label className="issue-field">
      <span>
        {label}
        <small>{value.length}/{maxLength}</small>
      </span>
      {multiline ? (
        <textarea
          value={value}
          maxLength={maxLength}
          placeholder="Enter your text here..."
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          value={value}
          maxLength={maxLength}
          placeholder="Enter your text here..."
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </label>
  )
}

function validateIssue(title: string, description: string) {
  const cleanTitle = title.trim()
  const cleanDescription = description.trim()

  if (!cleanTitle) return 'Title is required.'
  if (cleanTitle.length > TITLE_MAX_LENGTH) return 'Title must be 80 characters or fewer.'
  if (!cleanDescription) return 'Description is required.'
  if (cleanDescription.length > DESCRIPTION_MAX_LENGTH) {
    return 'Description must be 1000 characters or fewer.'
  }
  return null
}

function replaceIssue(issues: IssueDetail[], updated: IssueDetail) {
  return issues.map((issue) => (issue.id === updated.id ? updated : issue))
}

function sortIssues(issues: IssueDetail[]) {
  return [...issues].sort((left, right) => {
    if (left.status !== right.status) return left.status === 'OPEN' ? -1 : 1
    return new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
  })
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
    <svg width="17" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 20h4.5L19 9.5 14.5 5 4 15.5V20Z" fill="currentColor" />
      <path d="M13.5 6 18 10.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 8h10l-.7 12H7.7L7 8ZM9 5h6l1 2H8l1-2ZM6 7h12"
        fill="currentColor"
      />
    </svg>
  )
}
