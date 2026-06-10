import { useState } from 'react'
import {
  apiHouseholdsCreate,
  apiHouseholdsJoinCreate,
} from '../api/generated/households/households'
import { apiUsersCsrfRetrieve } from '../api/generated/users/users'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'

type HouseholdSetupPageProps = {
  onHouseholdReady: () => void
  onLogout: () => void
}

export default function HouseholdSetupPage({
  onHouseholdReady,
  onLogout,
}: HouseholdSetupPageProps) {
  const [householdName, setHouseholdName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [loadingAction, setLoadingAction] = useState<'create' | 'join' | null>(
    null,
  )
  const [error, setError] = useState<string | null>(null)

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const name = householdName.trim()

    if (!name) {
      setError('Household name is required.')
      return
    }

    setError(null)
    setLoadingAction('create')

    try {
      await apiUsersCsrfRetrieve()
      const res = await apiHouseholdsCreate({ name })

      if (res.status === 201) {
        onHouseholdReady()
        return
      }

      setError('Could not create household. Please try again.')
    } catch {
      setError('Could not create household. Please try again.')
    } finally {
      setLoadingAction(null)
    }
  }

  async function handleJoin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const code = inviteCode.trim()

    if (!code) {
      setError('Invite code is required.')
      return
    }

    setError(null)
    setLoadingAction('join')

    try {
      await apiUsersCsrfRetrieve()
      const res = await apiHouseholdsJoinCreate({ invite_code: code })

      if (res.status === 200) {
        onHouseholdReady()
        return
      }

      if (res.status === 404) {
        setError('Invite code was not found.')
        return
      }

      if (res.status === 409) {
        setError('You already belong to a household.')
        return
      }

      setError('Could not join household. Please try again.')
    } catch {
      setError('Could not join household. Please try again.')
    } finally {
      setLoadingAction(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#fffef7] text-[#0b0a0f]">
      <header className="flex h-[90px] items-center justify-between bg-[#fdd329] px-[154px] max-lg:px-[32px]">
        <span className="text-[30px] font-semibold">FlatFlow</span>
        <Button variant="ghost" onClick={onLogout}>
          Log out
        </Button>
      </header>

      <main className="mx-auto flex w-full max-w-[930px] flex-col px-[24px] py-[72px]">
        <h1 className="text-[32px] font-semibold leading-tight">
          Set up your household
        </h1>
        <p className="mt-[12px] text-[14px] text-[#393939]">
          Create a new household or join roommates with an invite code.
        </p>

        <div className="mt-[42px] grid grid-cols-2 gap-[16px] max-md:grid-cols-1">
          <Card className="p-[28px]">
            <CardHeader className="mb-[24px] text-left">
              <CardTitle className="text-[25px] font-medium">
                Create household
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate}>
                <div className="space-y-[14px]">
                  <Label htmlFor="household-name">Household name</Label>
                  <Input
                    id="household-name"
                    value={householdName}
                    onChange={(event) => setHouseholdName(event.target.value)}
                    maxLength={60}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="mt-[28px]"
                  disabled={loadingAction !== null}
                >
                  {loadingAction === 'create' ? 'Creating...' : 'Create'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="p-[28px]">
            <CardHeader className="mb-[24px] text-left">
              <CardTitle className="text-[25px] font-medium">
                Join household
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoin}>
                <div className="space-y-[14px]">
                  <Label htmlFor="invite-code">Invite code</Label>
                  <Input
                    id="invite-code"
                    value={inviteCode}
                    onChange={(event) => setInviteCode(event.target.value)}
                    maxLength={12}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="mt-[28px]"
                  disabled={loadingAction !== null}
                >
                  {loadingAction === 'join' ? 'Joining...' : 'Join'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {error && (
          <p className="mt-[24px] text-[14px] font-medium text-[#cb322d]">
            {error}
          </p>
        )}
      </main>
    </div>
  )
}
