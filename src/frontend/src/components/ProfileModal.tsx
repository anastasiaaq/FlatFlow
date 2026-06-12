import { useEffect, useState } from 'react'
import {
  csrf,
  getUserProfile,
  updateUserProfile,
  type UserProfile,
} from '../api'

type ProfileModalProps = {
  initialName: string
  initialEmail?: string
  onClose: () => void
  onProfileUpdated?: (profile: UserProfile) => void
}

export default function ProfileModal({
  initialName,
  initialEmail = '',
  onClose,
  onProfileUpdated,
}: ProfileModalProps) {
  const [profile, setProfile] = useState<UserProfile>({
    display_name: initialName,
    email: initialEmail,
  })
  const [preferredName, setPreferredName] = useState(initialName)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await getUserProfile()
        setProfile(response.data)
        setPreferredName(response.data.display_name)
      } catch {
        setError('Could not load profile.')
      }
    }

    loadProfile()
  }, [])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!editing) {
      setEditing(true)
      setError(null)
      return
    }

    const trimmedName = preferredName.trim()

    if (!trimmedName || trimmedName.length > 50) {
      setError('Preferred name must be 1-50 characters.')
      return
    }

    setSaving(true)
    setError(null)

    try {
      await csrf()
      const response = await updateUserProfile({ display_name: trimmedName })
      setProfile(response.data)
      setPreferredName(response.data.display_name)
      setEditing(false)
      onProfileUpdated?.(response.data)
    } catch {
      setError('Could not save profile.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="profile-modal-backdrop" role="dialog" aria-modal="true">
      <form className="profile-modal" onSubmit={handleSubmit}>
        <button
          type="button"
          className="profile-modal__close"
          aria-label="Close profile"
          onClick={onClose}
        >
          x
        </button>
        <h2>Profile</h2>
        <p className="profile-modal__subtitle">
          {editing ? 'Edit your personal information' : 'Your personal information'}
        </p>

        <label className="profile-modal__field" htmlFor="profile-name">
          <span>Preferred name{editing ? ' *' : ''}</span>
          <input
            id="profile-name"
            value={preferredName}
            readOnly={!editing || saving}
            onChange={(event) => {
              setPreferredName(event.target.value)
              setError(null)
            }}
          />
        </label>

        {!editing && (
          <label className="profile-modal__field" htmlFor="profile-email">
            <span>Email</span>
            <input id="profile-email" value={profile.email} readOnly />
          </label>
        )}

        {error && <p className="profile-modal__error">{error}</p>}

        <div className="profile-modal__actions">
          <button
            type="submit"
            className="button button--secondary"
            disabled={saving}
          >
            {saving ? 'Saving...' : editing ? 'Save' : 'Edit'}
          </button>
        </div>
      </form>
    </div>
  )
}
