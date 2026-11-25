import { getManifestSync, getQuestionsBySubject, isSubjectLoaded, manifestPoolCount, type QuestionPool } from './data'

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
  idPrefix: string
  name: string
  icon: SubjectIconName
  color: string
  soft: string
  available: boolean
}

export const SUBJECTS: readonly SubjectInfo[] = [
  { id: 'english', idPrefix: 'engl', name: 'English Language', icon: 'book', color: '#1d4ed8', soft: '#eff6ff', available: false },
  { id: 'mathematics', idPrefix: 'math', name: 'Mathematics', icon: 'calculator', color: '#0369a1', soft: '#f0f9ff', available: false },
  { id: 'physics', idPrefix: 'phys', name: 'Physics', icon: 'atom', color: '#4338ca', soft: '#eef2ff', available: false },
  { id: 'chemistry', idPrefix: 'chem', name: 'Chemistry', icon: 'flask', color: '#15803d', soft: '#f0fdf4', available: true },
  { id: 'biology', idPrefix: 'biol', name: 'Biology', icon: 'leaf', color: '#047857', soft: '#ecfdf5', available: false },
  { id: 'economics', idPrefix: 'econ', name: 'Economics', icon: 'chart', color: '#b45309', soft: '#fffbeb', available: false },
  { id: 'government', idPrefix: 'govt', name: 'Government', icon: 'landmark', color: '#b91c1c', soft: '#fef2f2', available: false },
  { id: 'literature', idPrefix: 'lit', name: 'Literature in English', icon: 'feather', color: '#6d28d9', soft: '#f5f3ff', available: false },
  { id: 'commerce', idPrefix: 'comm', name: 'Commerce', icon: 'briefcase', color: '#0f766e', soft: '#f0fdfa', available: false },
  { id: 'accounting', idPrefix: 'acct', name: 'Accounting', icon: 'ledger', color: '#334155', soft: '#f8fafc', available: false },
  { id: 'geography', idPrefix: 'geog', name: 'Geography', icon: 'globe', color: '#0284c7', soft: '#f0f9ff', available: false },
  { id: 'crs', idPrefix: 'crs', name: 'Christian Religious Studies', icon: 'cross', color: '#9a3412', soft: '#fff7ed', available: false },
  { id: 'irs', idPrefix: 'irs', name: 'Islamic Religious Studies', icon: 'crescent', color: '#166534', soft: '#f0fdf4', available: false },
  { id: 'agriculture', idPrefix: 'agri', name: 'Agriculture', icon: 'sprout', color: '#4d7c0f', soft: '#f7fee7', available: false },
  { id: 'computer', idPrefix: 'comp', name: 'Computer Studies', icon: 'laptop', color: '#1e40af', soft: '#eff6ff', available: false },
]

const subjectsById = new Map(SUBJECTS.map((subject) => [subject.id, subject]))
const subjectsByPrefix = new Map(SUBJECTS.map((subject) => [subject.idPrefix, subject]))

export function getSubject(id: string | null | undefined): SubjectInfo | undefined {
  if (!id) return undefined
  return subjectsById.get(id.trim().toLowerCase())
}

export function getSubjectByQuestionId(questionId: string | null | undefined): SubjectInfo | undefined {
  if (!questionId) return undefined
  const prefix = questionId.trim().toLowerCase().split('-')[0]
  return subjectsByPrefix.get(prefix)
}

export function isSubjectAvailable(subjectId: string, pool: QuestionPool = 'all'): boolean {
  const normalized = subjectId.trim().toLowerCase()
  if (isSubjectLoaded(normalized)) return getQuestionsBySubject(normalized, pool).length > 0
  if (getManifestSync()) return manifestPoolCount(normalized, pool) > 0
  return getSubject(normalized)?.available ?? false
}

export function getSubjectQuestionCount(subjectId: string, pool: QuestionPool = 'all'): number {
  const normalized = subjectId.trim().toLowerCase()
  if (isSubjectLoaded(normalized)) return getQuestionsBySubject(normalized, pool).length
  if (getManifestSync()?.[normalized]) return manifestPoolCount(normalized, pool)
  return getQuestionsBySubject(normalized, pool).length
}
