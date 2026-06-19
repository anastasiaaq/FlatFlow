export const ISSUE_TITLE_MAX_LENGTH = 80
export const ISSUE_DESCRIPTION_MAX_LENGTH = 1000

export type IssueFilter = 'all' | 'open' | 'resolved'
export type IssueStatus = 'OPEN' | 'RESOLVED'

type IssueLike = {
  id: number
  status: IssueStatus
  created_at: string
  created_by: {
    id: number
    display_name: string
  }
}

export function validateIssue(title: string, description: string) {
  const cleanTitle = title.trim()
  const cleanDescription = description.trim()

  if (!cleanTitle) return 'Title is required.'
  if (cleanTitle.length > ISSUE_TITLE_MAX_LENGTH) {
    return `Title must be ${ISSUE_TITLE_MAX_LENGTH} characters or fewer.`
  }
  if (!cleanDescription) return 'Description is required.'
  if (cleanDescription.length > ISSUE_DESCRIPTION_MAX_LENGTH) {
    return `Description must be ${ISSUE_DESCRIPTION_MAX_LENGTH} characters or fewer.`
  }
  return null
}

export function replaceIssue<T extends IssueLike>(issues: T[], updated: T) {
  return issues.map((issue) => (issue.id === updated.id ? updated : issue))
}

export function sortIssues<T extends IssueLike>(issues: T[]) {
  return [...issues].sort((left, right) => {
    if (left.status !== right.status) return left.status === 'OPEN' ? -1 : 1
    return new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
  })
}

export function issueMatchesFilter(issue: IssueLike, filter: IssueFilter) {
  if (filter === 'all') return true
  return issue.status === filter.toUpperCase()
}

export function getEmptyStateMessage(filter: IssueFilter) {
  if (filter !== 'all') {
    return 'No issues match this filter \u2014 try a different status.'
  }
  return 'No issues reported \u2014 your household is running smoothly!'
}

export function getIssueAuthorName(
  issue: IssueLike,
  currentUserId?: number,
  currentUserName?: string,
) {
  if (issue.created_by.id === currentUserId && currentUserName) {
    return currentUserName
  }
  return issue.created_by.display_name
}
