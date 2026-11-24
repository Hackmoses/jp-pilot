import { getQuestions } from './data'

export type SubjectIconName =
  | 'book'
  | 'calculator'
  | 'atom'
  | 'flask'
  | 'leaf'
  | 'chart'
  | 'landmark'
  | 'feather'
  | 'briefcase'
  | 'ledger'
  | 'globe'
  | 'cross'
  | 'crescent'
  | 'sprout'
  | 'laptop'

export interface SubjectInfo {
  id: string
  name: string
  icon: SubjectIconName
  color: string
  soft: string
  available: boolean
}

export const SUBJECTS: readonly SubjectInfo[] = [
  { id: 'english', name: 'English Language', icon: 'book', color: '#1d4ed8', soft: '#eff6ff', available: false },
  { id: 'mathematics', name: 'Mathematics', icon: 'calculator', color: '#0369a1', soft: '#f0f9ff', available: false },
  { id: 'physics', name: 'Physics', icon: 'atom', color: '#4338ca', soft: '#eef2ff', available: false },
  { id: 'chemistry', name: 'Chemistry', icon: 'flask', color: '#15803d', soft: '#f0fdf4', available: true },
  { id: 'biology', name: 'Biology', icon: 'leaf', color: '#047857', soft: '#ecfdf5', available: false },
  { id: 'economics', name: 'Economics', icon: 'chart', color: '#b45309', soft: '#fffbeb', available: false },
  { id: 'government', name: 'Government', icon: 'landmark', color: '#b91c1c', soft: '#fef2f2', available: false },
  { id: 'literature', name: 'Literature in English', icon: 'feather', color: '#6d28d9', soft: '#f5f3ff', available: false },
  { id: 'commerce', name: 'Commerce', icon: 'briefcase', color: '#0f766e', soft: '#f0fdfa', available: false },
  { id: 'accounting', name: 'Accounting', icon: 'ledger', color: '#334155', soft: '#f8fafc', available: false },
  { id: 'geography', name: 'Geography', icon: 'globe', color: '#0284c7', soft: '#f0f9ff', available: false },
  { id: 'crs', name: 'Christian Religious Studies', icon: 'cross', color: '#9a3412', soft: '#fff7ed', available: false },
  { id: 'irs', name: 'Islamic Religious Studies', icon: 'crescent', color: '#166534', soft: '#f0fdf4', available: false },
  { id: 'agriculture', name: 'Agriculture', icon: 'sprout', color: '#4d7c0f', soft: '#f7fee7', available: false },
  { id: 'computer', name: 'Computer Studies', icon: 'laptop', color: '#1e40af', soft: '#eff6ff', available: false },
]

const subjectsById = new Map(SUBJECTS.map((subject) => [subject.id, subject]))

export function getSubject(id: string | null | undefined): SubjectInfo | undefined {
  if (!id) return undefined
  return subjectsById.get(id.trim().toLowerCase())
}

export function getSubjectQuestionCount(subjectId: string): number {
  const normalized = subjectId.trim().toLowerCase()
  return getQuestions().filter((question) => question.subject === normalized).length
}
