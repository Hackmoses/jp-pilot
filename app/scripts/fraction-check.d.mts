export interface FractionIssue {
  id: string
  field: string
  hits: string[]
  value: string
}

export function findSlashFractions(text: unknown): string[]
export function scanQuestionForSlashFractions(question: Record<string, unknown>): FractionIssue[]
export function scanAnimationForSlashFractions(animation: Record<string, unknown>): FractionIssue[]
