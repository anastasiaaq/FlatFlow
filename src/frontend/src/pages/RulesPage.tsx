import { useEffect, useState } from 'react'
import {
  createRule,
  csrf,
  deleteRule,
  getCurrentHousehold,
  getCurrentUser,
  listRules,
  updateRule,
  type AuthState,
  type RuleDetail,
  type UserProfile,
} from '../api'
import Navbar from '../components/Navbar'
import ProfileModal from '../components/ProfileModal'
import {
  formatRuleDate,
  removeRule,
  replaceRule,
  RULE_MAX_LENGTH,
  sortRulesChronologically,
  validateRuleText,
  wasRuleEdited,
} from '../rules'

type ModalState =
  | { type: 'edit'; rule: RuleDetail }
  | { type: 'delete'; rule: RuleDetail }
  | null

type NavPage = 'household' | 'rules' | 'chores' | 'issues'

type RulesPageProps = {
  onNavigate?: (page: NavPage) => void
  onLogout?: () => void
  onProfileUpdated?: (profile: UserProfile) => void
}

export default function RulesPage({ onNavigate, onLogout, onProfileUpdated }: RulesPageProps) {
  const [rules, setRules] = useState<RuleDetail[]>([])
  const [householdName, setHouseholdName] = useState('')
  const [user, setUser] = useState<AuthState['user']>(null)
  const [userName, setUserName] = useState('')
  const [newRuleText, setNewRuleText] = useState('')
  const [modal, setModal] = useState<ModalState>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    async function loadPage() {
      try {
        const [rulesResponse, householdResponse, userResponse] =
          await Promise.all([
            listRules(),
            getCurrentHousehold().catch(() => null),
            getCurrentUser().catch(() => null),
          ])

        setRules(sortRulesChronologically(rulesResponse.data))
        setHouseholdName(householdResponse?.data.name ?? '')
        setUser(userResponse?.data.user ?? null)
        setUserName(userResponse?.data.user?.display_name ?? '')
      } catch {
        setError('Could not load rules.')
      } finally {
        setLoading(false)
      }
    }

    loadPage()
  }, [])

  async function handleCreateRule(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const validationError = validateRuleText(newRuleText)

    if (validationError) {
      setFormError(validationError)
      return
    }

    setSaving(true)
    setFormError(null)

    try {
      await csrf()
      const response = await createRule(newRuleText.trim())
      setRules((currentRules) =>
        sortRulesChronologically([...currentRules, response.data]),
      )
      setNewRuleText('')
    } catch {
      setFormError('Could not add rule.')
    } finally {
      setSaving(false)
    }
  }

  async function handleEditRule(rule: RuleDetail, text: string) {
    const validationError = validateRuleText(text)

    if (validationError) return validationError

    setSaving(true)

    try {
      await csrf()
      const response = await updateRule(rule.id, text.trim())
      setRules((currentRules) => replaceRule(currentRules, response.data))
      setModal(null)
      return null
    } catch {
      return 'Could not save rule.'
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteRule(rule: RuleDetail) {
    setSaving(true)

    try {
      await csrf()
      await deleteRule(rule.id)
      setRules((currentRules) => removeRule(currentRules, rule.id))
      setModal(null)
    } catch {
      setError('Could not delete rule.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page-shell">
      <Navbar
        activePage="rules"
        householdName={householdName}
        userName={userName}
        onNavigate={onNavigate}
        onProfileOpen={() => setProfileOpen(true)}
        onLogout={onLogout}
      />

      <main className="rules-page">
        <section className="rules-page__heading">
          <h1>Rules</h1>
          <p>Shared agreements for your household.</p>
        </section>

        {loading && <p className="rules-message">Loading...</p>}
        {error && <p className="rules-message rules-message--error">{error}</p>}

        {!loading && (
          <div className="rules-layout">
            <section className="rules-list" aria-label="House rules">
              {rules.length === 0 && (
                <div className="rule-card rule-card--empty">
                  No rules yet. Add the first one for your household.
                </div>
              )}

              {rules.map((rule, index) => (
                <RuleCard
                  key={rule.id}
                  index={index + 1}
                  rule={rule}
                  onEdit={() => setModal({ type: 'edit', rule })}
                  onDelete={() => setModal({ type: 'delete', rule })}
                />
              ))}
            </section>

            <aside className="rules-side-panel">
              {modal?.type === 'edit' ? (
                <EditRulePanel
                  rule={modal.rule}
                  saving={saving}
                  onClose={() => setModal(null)}
                  onSave={handleEditRule}
                />
              ) : (
                <RuleForm
                  title="Add a new rule"
                  text={newRuleText}
                  submitLabel="Add"
                  error={formError}
                  disabled={saving}
                  onChange={(text) => {
                    setNewRuleText(text)
                    setFormError(null)
                  }}
                  onCancel={() => {
                    setNewRuleText('')
                    setFormError(null)
                  }}
                  onSubmit={handleCreateRule}
                />
              )}

            </aside>
          </div>
        )}
      </main>

      <footer className="app-footer">
        © 2026 Bratiuk, Horalevych, Dvoilenko, Tsepkalo
      </footer>

      {modal?.type === 'delete' && (
        <DeleteRulePanel
          rule={modal.rule}
          saving={saving}
          onClose={() => setModal(null)}
          onDelete={handleDeleteRule}
        />
      )}

      {profileOpen && (
        <ProfileModal
          user={user}
          onClose={() => setProfileOpen(false)}
          onProfileUpdated={(profile) => {
            setUserName(profile.display_name)
            setUser((u) => u ? { ...u, display_name: profile.display_name } : u)
            onProfileUpdated?.(profile)
          }}
        />
      )}
    </div>
  )
}

function RuleCard({
  index,
  rule,
  onEdit,
  onDelete,
}: {
  index: number
  rule: RuleDetail
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <article className="rule-card">
      <div className="rule-card__number">{index}</div>
      <div className="rule-card__content">
        <h2>{rule.text}</h2>
        <p>
          Added by <strong>{rule.created_by.display_name}</strong> on{' '}
          {formatRuleDate(rule.created_at)}
        </p>
      </div>
      <div className="rule-card__meta">
        <div className="rule-card__actions">
          <IconButton label="Edit rule" onClick={onEdit}>
            <PencilIcon />
          </IconButton>
          <IconButton label="Delete rule" onClick={onDelete}>
            <TrashIcon />
          </IconButton>
        </div>
        {wasRuleEdited(rule.created_at, rule.last_modified_at) &&
          rule.last_modified_by && (
            <p>
              Last edited on {formatRuleDate(rule.last_modified_at)} by{' '}
              <strong>{rule.last_modified_by.display_name}</strong>
            </p>
          )}
      </div>
    </article>
  )
}

function RuleForm({
  title,
  text,
  submitLabel,
  error,
  disabled,
  onChange,
  onCancel,
  onSubmit,
}: {
  title: string
  text: string
  submitLabel: string
  error: string | null
  disabled: boolean
  onChange: (text: string) => void
  onCancel: () => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}) {
  return (
    <form className="rule-form" onSubmit={onSubmit}>
      <div className="rule-form__header">
        <h2>{title}</h2>
        <span>
          {text.length}/{RULE_MAX_LENGTH}
        </span>
      </div>
      <textarea
        maxLength={RULE_MAX_LENGTH}
        placeholder="Enter your text here...."
        value={text}
        onChange={(event) => onChange(event.target.value)}
      />
      {error && <p className="rule-form__error">{error}</p>}
      <div className="rule-form__actions">
        <button type="button" className="button button--secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="button button--primary" disabled={disabled}>
          {submitLabel}
        </button>
      </div>
    </form>
  )
}

function EditRulePanel({
  rule,
  saving,
  onClose,
  onSave,
}: {
  rule: RuleDetail
  saving: boolean
  onClose: () => void
  onSave: (rule: RuleDetail, text: string) => Promise<string | null>
}) {
  const [text, setText] = useState(rule.text)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextError = await onSave(rule, text)
    setError(nextError)
  }

  return (
    <form className="rule-form" onSubmit={handleSubmit}>
      <div className="rule-form__header">
        <h2>Edit the rule</h2>
        <span>
          {text.length}/{RULE_MAX_LENGTH}
        </span>
      </div>
      <textarea
        maxLength={RULE_MAX_LENGTH}
        placeholder="Enter your text here...."
        value={text}
        onChange={(event) => {
          setText(event.target.value)
          setError(null)
        }}
      />
      {error && <p className="rule-form__error">{error}</p>}
      <div className="rule-form__actions">
        <button type="button" className="button button--secondary" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="button button--primary" disabled={saving}>
          Save
        </button>
      </div>
    </form>
  )
}

function DeleteRulePanel({
  rule,
  saving,
  onClose,
  onDelete,
}: {
  rule: RuleDetail
  saving: boolean
  onClose: () => void
  onDelete: (rule: RuleDetail) => void
}) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-[#fbf4f1] rounded-[11px] border border-[#d8bdbd] w-[375px] p-[28px]">
        <div className="flex items-start gap-[14px] mb-[20px]">
          <WarningIcon />
          <div>
            <h3 className="text-[#cb322d] text-[16px] font-semibold mb-[8px]">
              Delete rule
            </h3>
            <p className="text-[#0b0a0f] text-[14px]">
              Are you sure you want to delete this rule?
            </p>
            <p className="text-[#949494] text-[14px] font-light mt-[6px]">
              This action cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-[12px]">
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="rounded-[7px] border border-[#d8bdbd] px-[20px] h-[38px] text-[#0b0a0f] text-[16px] font-medium hover:bg-[#f5eded] transition-colors disabled:opacity-50"
          >
            CANCEL
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => onDelete(rule)}
            className="bg-[#cb322d] rounded-[7px] px-[20px] h-[38px] text-[#f8eded] text-[16px] font-medium hover:opacity-80 transition-opacity disabled:opacity-50"
          >
            {saving ? '...' : 'DELETE'}
          </button>
        </div>
      </div>
    </div>
  )
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
    <svg width="19" height="21" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 20h4.5L19 9.5 14.5 5 4 15.5V20Z"
        fill="currentColor"
      />
      <path d="M13.5 6 18 10.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none">
      <path
        d="M7 8h10l-.7 12H7.7L7 8ZM9 5h6l1 2H8l1-2ZM6 7h12"
        fill="currentColor"
      />
    </svg>
  )
}

function WarningIcon() {
  return (
    <div className="w-[45px] h-[45px] shrink-0 flex items-center justify-center rounded-full bg-[#cb322d]/10">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#cb322d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    </div>
  )
}
