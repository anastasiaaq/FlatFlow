import { useEffect, useState } from 'react'
import { apiUsersCsrfRetrieve } from '../api/generated/users/users'
import {
  createIssue,
  deleteIssue,
  listIssues,
  toggleIssueStatus,
  updateIssue,
  type IssueDetail,
  type IssueFilter,
} from '../api/issues'
import { getCurrentHousehold } from '../api'
import Navbar from '../components/Navbar'
import {
  getEmptyStateMessage,
  getIssueAuthorName,
  issueMatchesFilter,
  ISSUE_DESCRIPTION_MAX_LENGTH,
  ISSUE_TITLE_MAX_LENGTH,
  replaceIssue,
  sortIssues,
  validateIssue,
} from '../issues'
import type { Page } from '../types/navigation'

const NEW_ISSUE_TITLE_ID = 'new-issue-title'

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
  const [filter, setFilter] = useState<IssueFilter>('all')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    Promise.all([listIssues(filter), getCurrentHousehold().catch(() => null)])
      .then(([issuesResponse, householdResponse]) => {
        if (!active) return
        setIssues(issuesResponse.data)
        setHouseholdName(householdResponse?.data.name ?? '')
      })
      .catch(() => {
        if (active) setError('Could not load issues.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [filter])

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
      if (issueMatchesFilter(response.data, filter)) {
        setIssues((current) => [response.data, ...current])
      }
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
    if (toggling) return

    setToggling(true)

    try {
      await prepareMutation()
      const response = await toggleIssueStatus(issue.id)
      setIssues((current) => {
        const updated = replaceIssue(current, response.data)
        return sortIssues(updated.filter((item) => issueMatchesFilter(item, filter)))
      })
    } catch {
      setError('Could not update issue status.')
    } finally {
      setToggling(false)
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
          <div className="issues-filter" aria-label="Filter issues">
            {(['all', 'open', 'resolved'] as const).map((option) => (
              <button
                key={option}
                type="button"
                className={filter === option ? 'issues-filter__button--active' : ''}
                aria-pressed={filter === option}
                onClick={() => {
                  if (option === filter) return
                  setLoading(true)
                  setError(null)
                  setFilter(option)
                }}
              >
                {option[0].toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>
        </section>

        {loading && <p className="issues-message">Loading...</p>}
        {error && <p className="issues-message issues-message--error">{error}</p>}

        {!loading && (
          <div className="issues-layout">
            <section className="issues-list" aria-label="Household issues">
              {issues.length === 0 && (
                <div className="issue-card issue-card--empty">
                  <p>{getEmptyStateMessage(filter)}</p>
                  {filter === 'all' && (
                    <button
                      type="button"
                      className="button button--primary"
                      onClick={() => document.getElementById(NEW_ISSUE_TITLE_ID)?.focus()}
                    >
                      + Report issue
                    </button>
                  )}
                </div>
              )}

              {issues.map((issue) => (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  canManage={issue.created_by.id === currentUserId}
                  authorName={getIssueAuthorName(
                    issue,
                    currentUserId,
                    currentUserName,
                  )}
                  onEdit={() => setPanel({ type: 'edit', issue })}
                  onDelete={() => setPanel({ type: 'delete', issue })}
                  onToggle={() => handleToggle(issue)}
                  toggleDisabled={toggling}
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
  authorName,
  onEdit,
  onDelete,
  onToggle,
  toggleDisabled,
}: {
  issue: IssueDetail
  canManage: boolean
  authorName: string
  onEdit: () => void
  onDelete: () => void
  onToggle: () => void
  toggleDisabled: boolean
}) {
  return (
    <article className="issue-card">
      <div className="issue-card__top">
        <h2>{issue.title}</h2>
        <button
          type="button"
          className="issue-status"
          disabled={toggleDisabled}
          onClick={onToggle}
        >
          {issue.status === 'OPEN' ? 'Open' : 'Resolved'}
        </button>
      </div>
      <p>{issue.description}</p>
      <div className="issue-card__footer">
        <span>
          Created on {formatIssueDate(issue.created_at)} by{' '}
          <strong>{authorName}</strong>
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
        id={NEW_ISSUE_TITLE_ID}
        label="Title *"
        value={title}
        maxLength={ISSUE_TITLE_MAX_LENGTH}
        onChange={onTitleChange}
      />
      <IssueField
        multiline
        label="Description *"
        value={description}
        maxLength={ISSUE_DESCRIPTION_MAX_LENGTH}
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

  useEffect(() => {
    let active = true

    queueMicrotask(() => {
      if (!active) return
      setTitle(issue.title)
      setDescription(issue.description)
      setError(null)
    })

    return () => {
      active = false
    }
  }, [issue])

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
        maxLength={ISSUE_TITLE_MAX_LENGTH}
        onChange={(value) => {
          setTitle(value)
          setError(null)
        }}
      />
      <IssueField
        multiline
        label="Description *"
        value={description}
        maxLength={ISSUE_DESCRIPTION_MAX_LENGTH}
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
  id,
  label,
  value,
  maxLength,
  multiline = false,
  onChange,
}: {
  id?: string
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
          id={id}
          value={value}
          maxLength={maxLength}
          placeholder="Enter your text here..."
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          id={id}
          value={value}
          maxLength={maxLength}
          placeholder="Enter your text here..."
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </label>
  )
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
