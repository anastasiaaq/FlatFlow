import type {
  AuthState,
  User,
  UserProfile,
} from '../api/generated/flatFlowAPI.schemas'

export function getProfileViewModel(user: User | null | undefined) {
  return {
    displayName: user?.display_name ?? '',
    email: user?.email ?? '',
  }
}

export function validateDisplayName(displayName: string) {
  const trimmedName = displayName.trim()

  if (!trimmedName) {
    return 'Display name is required.'
  }

  if (trimmedName.length > 50) {
    return 'Display name must be 50 characters or fewer.'
  }

  return null
}

export function applyProfileToAuth(
  auth: AuthState | null,
  profile: UserProfile,
): AuthState | null {
  if (!auth?.user) return auth

  return {
    ...auth,
    user: {
      ...auth.user,
      display_name: profile.display_name,
      email: profile.email,
    },
  }
}
