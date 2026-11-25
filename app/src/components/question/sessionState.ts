import type { Animation, Question } from '../../lib/types'

export interface SessionRecord {
  questionId: string
  topic: string
  correct: boolean
  skipped: boolean
}

export interface MissedTopic {
  topic: string
  count: number
}

export interface SessionSummary {
  subject?: string
  elapsedMs?: number
  total: number
  answered: number
  correct: number
  skipped: number
  missedTopics: MissedTopic[]
  missedQuestionIds?: string[]
  missedQuestions?: Question[]
  animations?: Animation[]
}

const summaryKey = 'jp.shared-practice-summary.v1'

function readSummary(): SessionSummary | null {
  try {
    return JSON.parse(localStorage.getItem(summaryKey) ?? 'null') as SessionSummary | null
  } catch {
    return null
  }
}

let lastSessionSummary = readSummary()

export function setLastSessionSummary(summary: SessionSummary | null): void {
  lastSessionSummary = summary
  try {
    localStorage.setItem(summaryKey, JSON.stringify(summary))
  } catch {
    // The summary remains available in memory.
  }
}

export function getLastSessionSummary(): SessionSummary | null {
  return lastSessionSummary
}
