import type { Animation, AnimationsFile, Question, QuestionsFile } from './types'

export interface SubjectManifestEntry {
  count: number
  completeCount?: number
  hasAnimations: boolean
}

export type SubjectManifest = Record<string, SubjectManifestEntry>

// Study shows questions with a full Teach me lesson as worked examples.
// Practice and the exam use every other question, so a question is never in both.
export type QuestionPool = 'study' | 'practice' | 'all'

export function isCompleteQuestion(question: Question, animation?: Animation): boolean {
  // Complete = has a Teach me lesson: a concept lesson, or a calculation with both Teach me and Quick.
  // A chapter tag is optional; untagged questions are grouped by topic. Must match sync-data.mjs.
  if (!question.animationId || !animation || animation.id !== question.animationId) return false
  if (animation.questionId && animation.questionId !== question.id) return false
  if (animation.kind === 'concept') return (animation.steps?.length ?? 0) > 0 || (animation.teach?.length ?? 0) > 0
  return (animation.teach?.length ?? 0) > 0 && (animation.steps?.length ?? 0) > 0
}

const questions: Question[] = []
const questionsById = new Map<string, Question>()
const sharedQuestionsById = new Map<string, Question>()
const studyIds = new Set<string>()
const animationsById = new Map<string, Animation>()
const loadedSubjects = new Set<string>()
const inflightSubjects = new Map<string, Promise<boolean>>()

let manifestCache: SubjectManifest | null = null
let inflightManifest: Promise<SubjectManifest> | null = null

export function registerSavedQuestions(items: readonly Question[], animations: readonly Animation[]) {
  for (const question of items) {
    if (!getQuestion(question.id)) sharedQuestionsById.set(question.id, question)
  }
  for (const animation of animations) {
    if (!getAnimation(animation.id)) animationsById.set(animation.id, animation)
  }
}

export function registerSubjectData(
  subject: string,
  subjectQuestions: readonly Question[],
  subjectAnimations: readonly Animation[] = [],
): void {
  const normalized = subject.trim().toLowerCase()
  for (const question of subjectQuestions) {
    if (!questionsById.has(question.id)) {
      questions.push(question)
    }
    questionsById.set(question.id, question)
  }
  for (const animation of subjectAnimations) {
    animationsById.set(animation.id, animation)
  }
  loadedSubjects.add(normalized)
}

export function isSubjectLoaded(subject: string): boolean {
  return loadedSubjects.has(subject.trim().toLowerCase())
}

export function getManifestSync(): SubjectManifest | null {
  return manifestCache
}

export async function loadManifest(): Promise<SubjectManifest> {
  if (manifestCache) return manifestCache
  if (inflightManifest) return inflightManifest

  inflightManifest = (async () => {
    try {
      const base = import.meta.env.BASE_URL || '/'
      const res = await fetch(`${base}data/manifest.json`)
      if (!res.ok) return {}
      const data = (await res.json()) as { subjects?: SubjectManifest }
      manifestCache = data.subjects ?? {}
      return manifestCache
    } catch {
      return {}
    } finally {
      inflightManifest = null
    }
  })()

  return inflightManifest
}

export async function loadSubject(subject: string): Promise<boolean> {
  const normalized = subject.trim().toLowerCase()
  if (!normalized) return false
  if (loadedSubjects.has(normalized)) return true

  const existing = inflightSubjects.get(normalized)
  if (existing) return existing

  const promise = (async () => {
    try {
      const manifest = await loadManifest()
      const entry = manifest[normalized]
      if (Object.keys(manifest).length > 0 && !entry) return false

      const base = import.meta.env.BASE_URL || '/'
      const qPromise = fetch(`${base}data/questions-${encodeURIComponent(normalized)}.json`)
      const aPromise = entry?.hasAnimations
        ? fetch(`${base}data/animations-${encodeURIComponent(normalized)}.json`).catch(() => null)
        : Promise.resolve(null)

      const [qRes, aRes] = await Promise.all([qPromise, aPromise])
      if (!qRes.ok) return false

      const qFile = (await qRes.json()) as QuestionsFile
      let anims: Animation[] = []
      if (aRes && aRes.ok) {
        const aFile = (await aRes.json()) as AnimationsFile
        anims = aFile.animations ?? []
      }

      const source = qFile.questions ?? []
      const byId = new Map(anims.map((animation) => [animation.id, animation]))
      for (const question of source) sharedQuestionsById.set(question.id, question)
      for (const question of source) {
        if (isCompleteQuestion(question, byId.get(question.animationId ?? ''))) studyIds.add(question.id)
      }
      registerSubjectData(normalized, source, anims)
      return true
    } catch {
      return false
    } finally {
      inflightSubjects.delete(normalized)
    }
  })()

  inflightSubjects.set(normalized, promise)
  return promise
}

export function getQuestions(): Question[] {
  return questions.slice()
}

export function isStudyQuestion(id: string): boolean {
  return studyIds.has(id)
}

export function getQuestionsBySubject(subject: string, pool: QuestionPool = 'all'): Question[] {
  const normalized = subject.trim().toLowerCase()
  return questions.filter((question) => question.subject === normalized &&
    (pool === 'all' || (pool === 'study') === studyIds.has(question.id)))
}

// Counts from the manifest, so subject lists need no question downloads.
export function manifestPoolCount(subject: string, pool: QuestionPool): number {
  const entry = manifestCache?.[subject.trim().toLowerCase()]
  if (!entry) return 0
  const study = entry.completeCount ?? 0
  return pool === 'study' ? study : pool === 'practice' ? Math.max(0, entry.count - study) : entry.count
}

export function getQuestion(id: string): Question | undefined {
  return questionsById.get(id) ?? sharedQuestionsById.get(id)
}

export function getAnimation(id: string): Animation | undefined {
  return animationsById.get(id)
}
