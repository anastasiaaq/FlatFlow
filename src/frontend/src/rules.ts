export const RULE_MAX_LENGTH = 280

type ChronologicalRule = {
  id: number
  created_at: string
}

export function validateRuleText(text: string) {
  const trimmed = text.trim()

  if (!trimmed) return 'Rule text is required.'
  if (trimmed.length > RULE_MAX_LENGTH) {
    return `Rule text must be ${RULE_MAX_LENGTH} characters or fewer.`
  }

  return null
}

export function formatRuleDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  })
}

export function wasRuleEdited(createdAt: string, modifiedAt: string) {
  return new Date(modifiedAt).getTime() !== new Date(createdAt).getTime()
}

export function sortRulesChronologically<T extends ChronologicalRule>(rules: T[]) {
  return [...rules].sort(
    (leftRule, rightRule) =>
      new Date(rightRule.created_at).getTime() -
      new Date(leftRule.created_at).getTime(),
  )
}

export function replaceRule<T extends ChronologicalRule>(
  rules: T[],
  updatedRule: T,
) {
  return sortRulesChronologically(
    rules.map((rule) => (rule.id === updatedRule.id ? updatedRule : rule)),
  )
}

export function removeRule<T extends ChronologicalRule>(rules: T[], ruleId: number) {
  return rules.filter((rule) => rule.id !== ruleId)
}
