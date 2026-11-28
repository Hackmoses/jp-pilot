import type { ComponentType } from 'preact'
import { useEffect, useMemo, useState } from 'preact/hooks'
import type { DrawingProps } from '../lessons/lesson'
import type { AnimationStep } from '../../lib/types'
import '../lessons/lessons.css'

// Hand-drawn diagrams for concept lesson steps. They reuse the Biology Teach me drawings
// (components/lessons/biology/drawings) and load only when a lesson step has a figure.
type Figure = NonNullable<AnimationStep['figure']>
type Drawing = ComponentType<DrawingProps>
type Listen = (progress: number, step: number) => void

const files = import.meta.glob<{ default: Drawing }>('../lessons/biology/drawings/*.tsx')
const loaded = new Map<string, Drawing>()

const plain = (word: string) => word.toLowerCase().replace(/[^a-z0-9]/g, '')

// Where in the spoken line each cue word falls, as a share of the line (0 to 1). The player's
// progress follows the voice clip, so a part is drawn as its word is said.
export function cueShares(narration: string, beats: Figure['beats']) {
  const tokens = narration.trim().split(/\s+/).map(plain)
  let previous = -1
  return beats.map(({ word }) => {
    const at = tokens.findIndex((token, i) => i > previous && token === plain(word))
    if (at < 0) return 1
    previous = at
    return at / Math.max(1, tokens.length)
  })
}

export function reachedAt(shares: readonly number[], progress: number) {
  return shares.filter((share) => share <= progress + 0.01).length
}

const reduce = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

export default function StepFigure({ step, index, listen }: {
  step: AnimationStep
  index: number
  listen: (fn: Listen) => () => void
}) {
  const figure = step.figure as Figure
  const [View, setView] = useState<Drawing | undefined>(() => loaded.get(figure.drawing))
  const shares = useMemo(() => cueShares(step.narration, figure.beats), [step.narration, figure])
  const [reached, setReached] = useState(0)

  useEffect(() => {
    if (View) return
    const load = files[`../lessons/biology/drawings/${figure.drawing}.tsx`]
    if (!load) return
    let active = true
    void load().then(({ default: drawing }) => {
      loaded.set(figure.drawing, drawing)
      if (active) setView(() => drawing)
    })
    return () => { active = false }
  }, [figure.drawing, View])

  useEffect(() => listen((progress, current) => {
    if (current !== index) return
    const next = reachedAt(shares, progress)
    setReached((previous) => previous === next ? previous : next)
  }), [listen, index, shares])

  if (!View) return <span class="jp-step__figure" aria-hidden="true" />
  const scene = {
    id: `${step.n}`, show: '', say: step.narration, visual: String(figure.chapter),
    beats: figure.beats.map(({ word, cue }) => ({ word, action: cue, label: '' })),
  }
  return <span class="jp-step__figure">
    <View scene={scene} frame={{ progress: 0, seconds: 0, reached, sinceBeat: 0, reduced: reduce() }} />
  </span>
}
