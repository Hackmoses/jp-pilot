export interface SessionRecord {
  questionId: string
  topic: string
  correct: boolean
  skipped: boolean
  removedCount: number
}

export interface MissedTopic {
  topic: string
  count: number
}

export interface SessionSummary {
  subject?: string
  total: number
  answered: number
  correct: number
  skipped: number
  missedTopics: MissedTopic[]
}

let lastSessionSummary: SessionSummary | null = null

export function setLastSessionSummary(summary: SessionSummary | null): void {
  lastSessionSummary = summary
}

export function getLastSessionSummary(): SessionSummary | null {
  return lastSessionSummary
}
