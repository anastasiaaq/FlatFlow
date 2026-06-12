import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  removeRule,
  replaceRule,
  RULE_MAX_LENGTH,
  sortRulesChronologically,
  validateRuleText,
  wasRuleEdited,
} from './rules'

type RuleDetail = {
  id: number
  text: string
  created_at: string
  last_modified_at: string
  created_by: { id: number; display_name: string }
  last_modified_by: { id: number; display_name: string } | null
}

function makeRule(
  id: number,
  text: string,
  createdAt: string,
  modifiedAt = createdAt,
): RuleDetail {
  return {
    id,
    text,
    created_at: createdAt,
    last_modified_at: modifiedAt,
    created_by: { id: 1, display_name: 'Milana' },
    last_modified_by:
      modifiedAt === createdAt ? null : { id: 2, display_name: 'Katia' },
  }
}

describe('house rules helpers', () => {
  it('validates rule text as required and 1-280 characters', () => {
    assert.equal(validateRuleText(''), 'Rule text is required.')
    assert.equal(validateRuleText('   '), 'Rule text is required.')
    assert.equal(
      validateRuleText('a'.repeat(RULE_MAX_LENGTH + 1)),
      'Rule text must be 280 characters or fewer.',
    )
    assert.equal(validateRuleText('a'.repeat(RULE_MAX_LENGTH)), null)
  })

  it('sorts newest rules first', () => {
    const newest = makeRule(1, 'Newest', '2026-03-16T10:00:00Z')
    const oldest = makeRule(2, 'Oldest', '2026-03-01T10:00:00Z')
    const middle = makeRule(3, 'Middle', '2026-03-09T10:00:00Z')

    assert.deepEqual(
      sortRulesChronologically([newest, oldest, middle]).map((rule) => rule.id),
      [1, 3, 2],
    )
  })

  it('tracks edited metadata only when modified timestamp changes', () => {
    assert.equal(
      wasRuleEdited('2026-03-01T10:00:00Z', '2026-03-01T10:00:00Z'),
      false,
    )
    assert.equal(
      wasRuleEdited('2026-03-01T10:00:00Z', '2026-03-02T10:00:00Z'),
      true,
    )
  })

  it('updates and deletes rules for edit/delete flows', () => {
    const first = makeRule(1, 'First', '2026-03-01T10:00:00Z')
    const second = makeRule(2, 'Second', '2026-03-02T10:00:00Z')
    const updatedSecond = makeRule(
      2,
      'Updated',
      '2026-03-02T10:00:00Z',
      '2026-03-03T10:00:00Z',
    )

    const afterEdit = replaceRule([first, second], updatedSecond)
    assert.equal(afterEdit[0].text, 'Updated')
    assert.equal(afterEdit[0].last_modified_by?.display_name, 'Katia')

    assert.deepEqual(
      removeRule(afterEdit, 1).map((rule) => rule.id),
      [2],
    )
  })
})
