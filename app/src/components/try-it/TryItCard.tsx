import type { ComponentType } from 'preact'
import { useId, useState } from 'preact/hooks'
import { waitForOfflineControl } from '../../lib/offline'
import { hasCompletedInteractive, markInteractiveCompleted } from '../../lib/modes'

export type InteractiveProps = { practiceHref: string; onComplete: () => void; onRestart?: () => void }
type Interactive = {
  title: string
  id?: string
  anchor?: string
  load: () => Promise<{ default: ComponentType<InteractiveProps> }>
  chapter: string
}

const lessons: Record<string, Interactive[]> = {
  chemistry: [
    { chapter: '2', anchor: 'mole-bridge', title: 'Mole bridge', load: () => import('./try-it-moles') },
    { id: 'limiting', chapter: '2', title: 'Limiting reagent', load: () => import('./try-it-limiting') },
    { chapter: '3', anchor: 'gas-laws', title: 'Gas laws', load: () => import('./try-it-gas') },
    { id: 'diffusion', chapter: '3', title: 'Diffusion race', load: () => import('./try-it-diffusion') },
    { id: 'partial-pressure', chapter: '3', title: 'Partial pressures', load: () => import('./try-it-partial-pressure') },
    { id: 'freezing', chapter: '11', title: 'Freezing point depression', load: () => import('./try-it-freezing') },
    { chapter: '13', title: 'pH scale', load: () => import('./try-it-ph') },
    { chapter: '14', title: 'Oxidation number finder', load: () => import('./try-it-oxidation') },
    { chapter: '15', title: 'Electrolysis', load: () => import('./try-it-electrolysis') },
  ],
  physics: [
    { id: 'relative-velocity', chapter: '2', title: 'Relative velocity', load: () => import('./try-it-relative-velocity') },
    { id: 'free-fall', chapter: '2', title: 'Free fall', load: () => import('./try-it-free-fall') },
    { id: 'pulley', chapter: '5', title: 'Pulley and machine efficiency', load: () => import('./try-it-pulley') },
    { id: 'capacitors', chapter: '17', title: 'Capacitors', load: () => import('./try-it-capacitors') },
    { chapter: '14', title: 'Concave mirror', load: () => import('./try-it-mirror') },
    { chapter: '18', title: 'Circuit lab', load: () => import('./try-it-circuit') },
    { chapter: '12', anchor: 'wave-on-a-string', title: 'Wave on a string', load: () => import('./try-it-wave') },
  ],
  biology: [
    { chapter: '1', title: 'Osmosis cell', load: () => import('./try-it-osmosis') },
    { id: 'punnett', chapter: '10', title: 'Punnett square', load: () => import('./try-it-punnett') },
  ],
  mathematics: [
    { chapter: '1', title: 'Number base converter', load: () => import('./try-it-bases') },
    { id: 'indices', chapter: '3', title: 'Indices explorer', load: () => import('./try-it-indices') },
  ],
}

// Try it lessons are pinned to syllabus topics, so Study needs no question download.
export function studyInteractives(subject: string, chapter: string) {
  return (lessons[subject] ?? []).filter((lesson) => lesson.chapter === chapter)
}

export function studyChapterIds(subject: string) {
  return new Set((lessons[subject] ?? []).map((lesson) => lesson.chapter))
}

export function TryItCard({ interactive, subject, chapter }: {
  interactive: Interactive; subject: string; chapter: string
}) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const [completed, setCompleted] = useState(() => hasCompletedInteractive(subject, chapter, interactive.id))
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [Demo, setDemo] = useState<ComponentType<InteractiveProps> | null>(null)
  const [run, setRun] = useState(0)
  const restart = () => setRun(run + 1)

  async function load() {
    setStatus('loading')
    try {
      await waitForOfflineControl()
      const { default: component } = await withTimeout(interactive.load(), 10000)
      setDemo(() => component)
      setStatus('idle')
    } catch (error) {
      // A new deploy renames chunks; reload once so the page picks up the current files.
      if (isStaleChunk(error) && !sessionStorageFlag('jp-chunk-reload')) {
        location.reload()
        return
      }
      setStatus('error')
    }
  }

  return (
    <section id={interactive.anchor ?? interactive.id} class="jp-card jp-try-card" data-open={open ? 'true' : 'false'} aria-labelledby={id + '-title'}>
      <div class="jp-try-header">
        <h3 id={id + '-title'} class="jp-mode-card-title">{interactive.title}</h3>
        {completed && <span class="jp-mode-studied">✓ Completed</span>}
        <div class="jp-try-header-actions">
          {open && Demo && <button type="button" class="jp-btn" aria-label={'Restart · ' + interactive.title} onClick={restart}>Restart</button>}
          <button type="button" class="jp-btn" aria-expanded={open} aria-controls={id}
            aria-label={(open ? 'Close' : 'Try it') + ' · ' + interactive.title} onClick={() => {
              setOpen(!open)
              if (!open && !Demo && status === 'idle') void load()
            }}>{open ? 'Close' : 'Try it'}</button>
        </div>
      </div>
      <div id={id} class="jp-try-panel" hidden={!open}>
        {open && Demo && <Demo key={run} onRestart={restart} practiceHref={'#/practice?' + new URLSearchParams({ subject, chapter })}
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

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ])
}

function isStaleChunk(error: unknown) {
  return error instanceof Error && /dynamically imported module|Importing a module script failed|error loading dynamically/i.test(error.message)
}

function sessionStorageFlag(key: string) {
  try {
    if (sessionStorage.getItem(key)) return true
    sessionStorage.setItem(key, '1')
  } catch { /* storage blocked: skip reload loop guard by not reloading */ return true }
  return false
}
