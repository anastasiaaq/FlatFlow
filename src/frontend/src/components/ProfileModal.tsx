import { useEffect, useState } from 'react'
import type { User, UserProfile } from '../api/generated/flatFlowAPI.schemas'
import {
  apiUsersCsrfRetrieve,
  apiUsersProfileRetrieve,
  apiUsersProfileUpdate,
} from '../api/generated/users/users'
import { getProfileViewModel, validateDisplayName } from '../auth/profile'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'

type ProfileModalProps = {
  user: User | null | undefined
  onClose: () => void
  onProfileUpdated: (profile: UserProfile) => void
}

export default function ProfileModal({
  user,
  onClose,
  onProfileUpdated,
}: ProfileModalProps) {
  const initialProfile = getProfileViewModel(user)
  const [profile, setProfile] = useState<UserProfile | null>(
    user
      ? {
          display_name: initialProfile.displayName,
          email: initialProfile.email,
        }
      : null,
  )
  const [preferredName, setPreferredName] = useState(
    initialProfile.displayName,
  )
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    apiUsersProfileRetrieve()
      .then((res) => {
        if (res.status === 200) {
          setProfile(res.data)
          setPreferredName(res.data.display_name)
        }
      })
      .catch(() => {
        setError('Could not load profile.')
      })
  }, [])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const email = profile?.email ?? user?.email ?? ''
  const canEdit = editing && !saving

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!editing) {
      setEditing(true)
      return
    }

    const validationError = validateDisplayName(preferredName)

    if (validationError) {
      setError(validationError)
      return
    }

    const trimmedName = preferredName.trim()
    setSaving(true)
    setError(null)

    try {
      await apiUsersCsrfRetrieve()
      const res = await apiUsersProfileUpdate({
        display_name: trimmedName,
      })

      if (res.status === 200) {
        setProfile(res.data)
        setPreferredName(res.data.display_name)
        setEditing(false)
        onProfileUpdated(res.data)
        return
      }

      setError('Could not save profile.')
    } catch {
      setError('Could not save profile.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-[24px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-title"
    >
      <div className="relative h-auto w-full max-w-[479px] rounded-[11px] border border-[#d8d8bd] bg-[#f8f8ed] px-[35px] pb-[40px] pt-[28px] text-[#0b0a0f]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-[35px] top-[40px] h-[24px] w-[24px] text-[#0b0a0f] hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b0a0f]"
          aria-label="Close profile"
        >
          <span className="absolute left-0 top-[11px] h-[2px] w-[24px] rotate-45 bg-current" />
          <span className="absolute left-0 top-[11px] h-[2px] w-[24px] -rotate-45 bg-current" />
        </button>

        <h2 id="profile-title" className="text-[32px] font-semibold leading-tight">
          Profile
        </h2>
        <p className="mt-[8px] text-[14px] text-[#393939]">
          {editing ? 'Edit your personal information' : 'Your personal information'}
        </p>

        <form onSubmit={handleSubmit} className="mt-[43px]">
          <div className="space-y-[18px]">
            <Label htmlFor="profile-name" className="font-semibold">
              Display name{editing ? ' *' : ''}
            </Label>
            <Input
              id="profile-name"
              value={preferredName}
              onChange={(event) => setPreferredName(event.target.value)}
              readOnly={!canEdit}
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? 'profile-name-error' : undefined}
              required
            />
          </div>

          {!editing && (
            <div className="mt-[31px] space-y-[18px]">
              <Label htmlFor="profile-email" className="font-semibold">
                Email
              </Label>
              <Input id="profile-email" value={email} readOnly />
            </div>
          )}

          {error && (
            <p
              id="profile-name-error"
              className="mt-[16px] text-[14px] font-medium text-[#cb322d]"
            >
              {error}
            </p>
          )}

          <div className="mt-[56px] flex justify-center">
            <Button
              type="submit"
              className="border-[#d8d8bd] bg-white"
              disabled={saving}
            >
              {saving ? 'Saving...' : editing ? 'Save' : 'Edit name'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
