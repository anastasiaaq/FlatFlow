import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  getEmptyStateMessage,
  getIssueAuthorName,
  issueMatchesFilter,
  ISSUE_DESCRIPTION_MAX_LENGTH,
  ISSUE_TITLE_MAX_LENGTH,
  replaceIssue,
  sortIssues,
  validateIssue,
} from './issues'

type TestIssue = {
  id: number
  status: 'OPEN' | 'RESOLVED'
  created_at: string
  created_by: { id: number; display_name: string }
}

function makeIssue(
  id: number,
  status: TestIssue['status'],
  createdAt: string,
): TestIssue {
  return {
    id,
    status,
    created_at: createdAt,
    created_by: { id: 1, display_name: 'Katia' },
  }
}

describe('issues helpers', () => {
  it('validates required fields and documented limits', () => {
    assert.equal(validateIssue('', 'description'), 'Title is required.')
    assert.equal(validateIssue('title', '  '), 'Description is required.')
    assert.equal(
      validateIssue('a'.repeat(ISSUE_TITLE_MAX_LENGTH + 1), 'description'),
      'Title must be 80 characters or fewer.',
    )
    assert.equal(
      validateIssue('title', 'a'.repeat(ISSUE_DESCRIPTION_MAX_LENGTH + 1)),
      'Description must be 1000 characters or fewer.',
    )
    assert.equal(validateIssue('title', 'description'), null)
  })

  it('sorts open issues first and newest first within each status', () => {
    const issues = [
      makeIssue(1, 'RESOLVED', '2026-06-19T10:00:00Z'),
      makeIssue(2, 'OPEN', '2026-06-18T10:00:00Z'),
      makeIssue(3, 'OPEN', '2026-06-19T10:00:00Z'),
    ]

    assert.deepEqual(sortIssues(issues).map((issue) => issue.id), [3, 2, 1])
  })

  it('filters, replaces, and describes empty results', () => {
    const openIssue = makeIssue(1, 'OPEN', '2026-06-19T10:00:00Z')
    const resolvedIssue = makeIssue(1, 'RESOLVED', '2026-06-19T10:00:00Z')

    assert.equal(issueMatchesFilter(openIssue, 'open'), true)
    assert.equal(issueMatchesFilter(openIssue, 'resolved'), false)
    assert.equal(replaceIssue([openIssue], resolvedIssue)[0].status, 'RESOLVED')
    assert.equal(
      getEmptyStateMessage('all'),
      'No issues reported \u2014 your household is running smoothly!',
    )
    assert.equal(
      getEmptyStateMessage('open'),
      'No issues match this filter \u2014 try a different status.',
    )
  })

  it('reflects a current user profile rename immediately', () => {
    const issue = makeIssue(1, 'OPEN', '2026-06-19T10:00:00Z')

    assert.equal(getIssueAuthorName(issue, 1, 'Ada'), 'Ada')
    assert.equal(getIssueAuthorName(issue, 2, 'Ada'), 'Katia')
  })
})
