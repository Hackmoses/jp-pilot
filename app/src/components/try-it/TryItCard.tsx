import type { ComponentType } from 'preact'
import { useId, useState } from 'preact/hooks'
import { getQuestion } from '../../lib/data'
import { waitForOfflineControl } from '../../lib/offline'
import { getQuestionChapter, hasCompletedInteractive, markInteractiveCompleted } from '../../lib/modes'

export type InteractiveProps = { practiceHref: string; onComplete: () => void }
type Interactive = {
  title: string
  id?: string
  load: () => Promise<{ default: ComponentType<InteractiveProps> }>
} & ({ chapter: string } | { question: string })

const lessons: Record<string, Interactive[]> = {
  chemistry: [
    { chapter: '2', title: 'Mole bridge', load: () => import('./try-it-moles') },
    { id: 'limiting', chapter: '2', title: 'Limiting reagent', load: () => import('./try-it-limiting') },
    { chapter: '3', title: 'Gas laws', load: () => import('./try-it-gas') },
    { id: 'diffusion', chapter: '3', title: 'Diffusion race', load: () => import('./try-it-diffusion') },
    { id: 'partial-pressure', chapter: '3', title: 'Partial pressures', load: () => import('./try-it-partial-pressure') },
    { id: 'freezing', chapter: '11', title: 'Freezing point depression', load: () => import('./try-it-freezing') },
    { chapter: '13', title: 'pH scale', load: () => import('./try-it-ph') },
    { chapter: '14', title: 'Oxidation number finder', load: () => import('./try-it-oxidation') },
    { chapter: '15', title: 'Electrolysis', load: () => import('./try-it-electrolysis') },
  ],
  physics: [
    { id: 'relative-velocity', question: 'phys-jamb-0001', title: 'Relative velocity', load: () => import('./try-it-relative-velocity') },
    { id: 'free-fall', question: 'phys-jamb-0002', title: 'Free fall', load: () => import('./try-it-free-fall') },
    { id: 'pulley', question: 'phys-jamb-0007', title: 'Pulley and machine efficiency', load: () => import('./try-it-pulley') },
    { id: 'capacitors', question: 'phys-jamb-0023', title: 'Capacitors', load: () => import('./try-it-capacitors') },
    { question: 'phys-jamb-0019', title: 'Concave mirror', load: () => import('./try-it-mirror') },
    { question: 'phys-jamb-0025', title: 'Circuit lab', load: () => import('./try-it-circuit') },
    { question: 'phys-jamb-0016', title: 'Wave on a string', load: () => import('./try-it-wave') },
  ],
  biology: [
    { question: 'biol-api-0167', title: 'Osmosis cell', load: () => import('./try-it-osmosis') },
    { id: 'punnett', question: 'biol-api-0127', title: 'Punnett square', load: () => import('./try-it-punnett') },
  ],
  mathematics: [
    { question: 'math-jamb-0001', title: 'Number base converter', load: () => import('./try-it-bases') },
    { id: 'indices', question: 'math-jamb-0005', title: 'Indices explorer', load: () => import('./try-it-indices') },
  ],
}

export function studyInteractives(subject: string, chapter: string) {
  return (lessons[subject] ?? []).filter((lesson) => {
    if ('chapter' in lesson) return chapter === lesson.chapter
    const question = getQuestion(lesson.question)
    return question && chapter === getQuestionChapter(question)
  })
}

export function TryItCard({ interactive, subject, chapter }: {
  interactive: Interactive; subject: string; chapter: string
}) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const [completed, setCompleted] = useState(() => hasCompletedInteractive(subject, chapter, interactive.id))
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [Demo, setDemo] = useState<ComponentType<InteractiveProps> | null>(null)

  async function load() {
    setStatus('loading')
    try {
      await waitForOfflineControl()
      const { default: component } = await interactive.load()
      setDemo(() => component)
      setStatus('idle')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section class="jp-card jp-try-card" aria-labelledby={id + '-title'}>
      <div class="jp-try-header">
        <h3 id={id + '-title'} class="jp-mode-card-title">{interactive.title}</h3>
        {completed && <span class="jp-mode-studied">✓ Completed</span>}
        <button type="button" class="jp-btn" aria-expanded={open} aria-controls={id}
          aria-label={(open ? 'Close' : 'Try it') + ' · ' + interactive.title} onClick={() => {
            setOpen(!open)
            if (!open && !Demo && status === 'idle') void load()
          }}>{open ? 'Close' : 'Try it'}</button>
      </div>
      <div id={id} hidden={!open}>
        {open && Demo && <Demo practiceHref={'#/practice?' + new URLSearchParams({ subject, chapter })}
          onComplete={() => {
            markInteractiveCompleted(subject, chapter, interactive.id)
            setCompleted(true)
          }} />}
        {open && status === 'loading' && <p class="jp-mode-lead" role="status">Loading interactive…</p>}
        {open && status === 'error' && <button type="button" class="jp-btn" onClick={load}>Retry loading interactive</button>}
      </div>
    </section>
  )
}
