import { useEffect, useState } from 'preact/hooks'
import type { LessonIndexEntry } from './conceptLessons'

let cached: LessonIndexEntry[] | null = null
let pending: Promise<LessonIndexEntry[]> | null = null

export function loadLessonIndex() {
  if (cached) return Promise.resolve(cached)
  pending ??= fetch(import.meta.env.BASE_URL + 'data/lessons-index.json')
    .then((res) => res.ok ? res.json() as Promise<LessonIndexEntry[]> : [])
    .catch(() => [] as LessonIndexEntry[])
    .then((list) => { cached = list; pending = null; return list })
  return pending
}

export function useLessonIndex() {
  const [list, setList] = useState<LessonIndexEntry[] | null>(cached)
  useEffect(() => {
    if (cached) return
    let active = true
    void loadLessonIndex().then((value) => { if (active) setList(value) })
    return () => { active = false }
  }, [])
  return list
}
