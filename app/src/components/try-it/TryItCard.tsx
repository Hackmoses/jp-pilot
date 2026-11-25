import type { ComponentType } from 'preact'
import { useId, useState } from 'preact/hooks'

export type InteractiveProps = { practiceHref: string }
type Interactive = { title: string; load: () => Promise<{ default: ComponentType<InteractiveProps> }> }

const gas: Interactive = { title: 'Gas laws', load: () => import('./try-it-gas') }
const electrolysis: Interactive = { title: 'Electrolysis', load: () => import('./try-it-electrolysis') }
const mirror: Interactive = { title: 'Concave mirror', load: () => import('./try-it-mirror') }

export function studyInteractive(subject: string, chapter: string, mirrorChapter?: string) {
  if (subject === 'chemistry' && chapter === '3') return gas
  if (subject === 'chemistry' && chapter === '15') return electrolysis
  if (subject === 'physics' && chapter === mirrorChapter) return mirror
}

export function TryItCard({ interactive, practiceHref }: { interactive: Interactive; practiceHref: string }) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [Demo, setDemo] = useState<ComponentType<InteractiveProps> | null>(null)

  async function load() {
    setStatus('loading')
    try {
      const { default: component } = await interactive.load()
      setDemo(() => component)
      setStatus('idle')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section class="jp-card jp-try-card" aria-labelledby={`${id}-title`}>
      <div class="jp-try-header">
        <h3 id={`${id}-title`} class="jp-mode-card-title">{interactive.title}</h3>
        <button type="button" class="jp-btn" aria-expanded={open} aria-controls={id}
          aria-label={(open ? 'Close' : 'Try it') + ' · ' + interactive.title} onClick={() => {
          setOpen(!open)
          if (!open && !Demo && status === 'idle') void load()
        }}>{open ? 'Close' : 'Try it'}</button>
      </div>
      <div id={id} hidden={!open}>
        {open && Demo && <Demo practiceHref={practiceHref} />}
        {open && status === 'loading' && <p class="jp-mode-lead" role="status">Loading interactive…</p>}
        {open && status === 'error' && <p class="jp-mode-lead" role="status">Could not load the interactive. Reload the page to try again.</p>}
      </div>
    </section>
  )
}
