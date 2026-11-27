import { ACCOUNTS_ENABLED, FREE_QUESTIONS } from './config'

const key = 'jp.visitor.v1'

function read(): string[] {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(key) ?? '[]')
    return Array.isArray(saved) ? saved.filter((id): id is string => typeof id === 'string') : []
  } catch { return [] }
}

export function visitorAnswered() {
  return read()
}

export function recordVisitorAnswer(questionId: string) {
  const ids = read()
  if (ids.includes(questionId)) return
  try { localStorage.setItem(key, JSON.stringify([...ids, questionId])) } catch { /* Storage can be off. */ }
}

// The student may answer a question when accounts are off, when signed in, when they have already
// answered it, or while they are still inside the free allowance.
export function mayAnswer(questionId: string, {
  enabled = ACCOUNTS_ENABLED, signedIn = false, answered = read(), limit = FREE_QUESTIONS,
}: { enabled?: boolean; signedIn?: boolean; answered?: readonly string[]; limit?: number } = {}) {
  return !enabled || signedIn || answered.includes(questionId) || answered.length < limit
}

// The signed-in student's first name. Accounts are not built yet, so there is none.
export function accountName(): string | null {
  return null
}
