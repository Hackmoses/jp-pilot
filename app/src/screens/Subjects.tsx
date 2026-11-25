import { useEffect, useMemo, useRef, useState } from 'preact/hooks'
import { loadManifest } from '../lib/data'
import {
  SUBJECTS,
  type SubjectIconName,
  type SubjectInfo,
  getSubjectQuestionCount,
  isSubjectAvailable,
} from '../lib/subjects'
import '../styles/subjects.css'

const ICON_PATHS: Record<SubjectIconName, string> = {
  book: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z',
  calculator: 'M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM8 6h8M8 10h2M14 10h2M8 14h2M14 14h2M8 18h8',
  atom: 'M12 12m-1.5 0a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0M12 3c2.5 0 4.5 4 4.5 9s-2 9-4.5 9-4.5-4-4.5-9 2-9 4.5-9zM4.2 7.5c1.25-2.17 5.75-1.92 10.05.56 4.3 2.48 6.8 6.26 5.55 8.43-1.25 2.17-5.75 1.92-10.05-.56-4.3-2.48-6.8-6.26-5.55-8.43z',
  flask: 'M9 3h6M10 3v5l-5.2 9.4A2 2 0 0 0 6.5 20h11a2 2 0 0 0 1.7-2.6L14 8V3M7.5 15h9',
  leaf: 'M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10zM2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12',
  chart: 'M3 3v18h18M7 14l4-4 4 3 5-6',
  landmark: 'M3 22h18M6 18v-7M10 18v-7M14 18v-7M18 18v-7M12 2 3 7h18l-9-5z',
  feather: 'M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5zM16 8 2 22M17.5 15H9',
  briefcase: 'M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2M4 7h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2zM2 12h20',
  ledger: 'M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM9 3v18M3 9h18M3 15h18',
  globe: 'M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z',
  cross: 'M12 3v18M7 8h10',
  crescent: 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z',
  sprout: 'M12 21v-9M12 12C12 8.5 9.5 6 6 6c0 3.5 2.5 6 6 6zM12 14c0-3.5 2.5-6 6-6 0 3.5-2.5 6-6 6z',
  laptop: 'M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9H4V6zM2 17h20',
}

function SubjectIcon({ name }: { name: SubjectIconName }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d={ICON_PATHS[name]} />
    </svg>
  )
}

export function Subjects({ mode }: { mode: 'study' | 'practice' }) {
  const [query, setQuery] = useState('')
  const [, setManifestReady] = useState(false)
  const [dialogState, setDialogState] = useState<{ kind: 'email' } | { kind: 'subject'; subject: SubjectInfo } | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    let active = true
    void loadManifest().then(() => { if (active) setManifestReady(true) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialogState || !dialog) return
    triggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    dialog.showModal()
    return () => {
      if (dialog.open) dialog.close()
      requestAnimationFrame(() => triggerRef.current?.focus())
    }
  }, [dialogState])

  const filteredSubjects = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return SUBJECTS
    return SUBJECTS.filter((subject) => subject.name.toLowerCase().includes(term))
  }, [query])

  const chemistryCount = getSubjectQuestionCount('chemistry')
  const destination = (id: string) => `#/${mode}?subject=${encodeURIComponent(id)}`

  return (
    <div class="jp-subjects-page">
      <header class="jp-subjects-header">
        <div class="jp-subjects-header-inner">
          <div class="jp-subjects-brand">
            <a class="jp-subjects-back" href="#/modes" aria-label="Back to modes">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </a>
            <a class="jp-logo" href="#/" aria-label="JP home">JP</a>
            <a class="jp-subjects-wordmark" href="#/">JAMB Practice</a>
            <span class="jp-subjects-pill">15 UTME subjects</span>
          </div>
          <button
            type="button"
            class="jp-subjects-signin"
            onClick={() => setDialogState({ kind: 'email' })}
          >
            Sign in
          </button>
        </div>
      </header>

      <main class="jp-subjects-main">
        <div class="jp-subjects-head">
          <div class="jp-subjects-title-wrap">
            <h1>Choose a subject</h1>
            <p>{mode === 'study' ? 'Choose a subject to study.' : 'Choose a subject to set up your practice.'}</p>
          </div>
          <label class="jp-subjects-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="search"
              aria-label="Search subjects"
              placeholder="Search subjects..."
              value={query}
              onInput={(event) => setQuery((event.target as HTMLInputElement).value)}
            />
          </label>
        </div>

        <a class="jp-subjects-mobile-strip" href={destination('chemistry')}>
          <span class="jp-subjects-strip-icon" aria-hidden="true">
            <SubjectIcon name="flask" />
          </span>
          <span class="jp-subjects-strip-copy">
            <strong>Ready now · Chemistry</strong>
            <span>{chemistryCount > 0 ? `${chemistryCount} questions` : 'Tap to start'}</span>
          </span>
          <span class="jp-subjects-strip-go" aria-hidden="true">Start →</span>
        </a>

        {filteredSubjects.length === 0 ? (
          <div class="jp-subjects-empty">
            <p>No subjects match “{query.trim()}”.</p>
            <button type="button" class="jp-btn" onClick={() => setQuery('')}>
              Show all 15 subjects
            </button>
          </div>
        ) : (
          <div class="jp-subjects-grid" role="list">
            {filteredSubjects.map((subject) => {
              if (isSubjectAvailable(subject.id)) {
                const count = getSubjectQuestionCount(subject.id)
                return (
                  <a
                    key={subject.id}
                    role="listitem"
                    class="jp-subject-card jp-subject-card--open"
                    href={destination(subject.id)}
                    style={{ '--subj-color': subject.color, '--subj-soft': subject.soft } as Record<string, string>}
                  >
                    <span class="jp-subject-icon" aria-hidden="true">
                      <SubjectIcon name={subject.icon} />
                    </span>
                    <span class="jp-subject-body">
                      <strong class="jp-subject-name">{subject.name}</strong>
                      <span class="jp-subject-meta jp-subject-meta--open">
                        <span>{count} questions</span>
                        <span aria-hidden="true">·</span>
                        <span class="jp-subject-start">Start →</span>
                      </span>
                    </span>
                  </a>
                )
              }

              return (
                <button
                  key={subject.id}
                  type="button"
                  role="listitem"
                  class="jp-subject-card jp-subject-card--closed"
                  style={{ '--subj-color': subject.color, '--subj-soft': subject.soft } as Record<string, string>}
                  onClick={() => setDialogState({ kind: 'subject', subject })}
                >
                  <span class="jp-subject-icon" aria-hidden="true">
                    <SubjectIcon name={subject.icon} />
                  </span>
                  <span class="jp-subject-body">
                    <strong class="jp-subject-name">{subject.name}</strong>
                    <span class="jp-subject-meta">Coming soon</span>
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </main>

      <dialog
        class="jp-subjects-dialog"
        ref={dialogRef}
        onClose={() => setDialogState(null)}
        onCancel={(event) => {
          event.preventDefault()
          setDialogState(null)
        }}
        aria-labelledby="jp-subjects-dialog-title"
        aria-describedby="jp-subjects-dialog-desc"
      >
        <h2 id="jp-subjects-dialog-title">
          {dialogState?.kind === 'email'
            ? 'Email sign-in is coming soon.'
            : dialogState?.subject.name}
        </h2>
        <p id="jp-subjects-dialog-desc">
          {dialogState?.kind === 'email'
            ? 'You can practise free right now.'
            : 'This subject is coming soon. Chemistry is ready now.'}
        </p>
        <div class="jp-subjects-dialog-actions">
          <a
            class="jp-btn jp-btn--primary"
            href={destination('chemistry')}
            onClick={() => setDialogState(null)}
          >
            Start Chemistry
          </a>
          <button type="button" class="jp-btn" onClick={() => setDialogState(null)}>
            Close
          </button>
        </div>
      </dialog>
    </div>
  )
}
