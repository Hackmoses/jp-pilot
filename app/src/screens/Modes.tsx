import type { ComponentChildren } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import { Feedback } from '../components/share/Feedback'
import { isSubjectLoaded, loadSubject } from '../lib/data'
import { continueExam, getAttempt, getRecent } from '../lib/modes'
import '../styles/modes.css'

type ModeAccent = 'study' | 'practice' | 'exam' | 'resume'

const MODE_ICON_PATHS: Record<ModeAccent, string> = {
  study: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z',
  practice: 'M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11',
  exam: 'M12 8v4l3 2M12 22a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9 2h6',
  resume: 'M5 12h14M13 5l7 7-7 7',
}

function ModeIcon({ accent }: { accent: ModeAccent }) {
  return (
    <span class={`jp-mode-icon jp-mode-icon--${accent}`} aria-hidden="true">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d={MODE_ICON_PATHS[accent]} />
      </svg>
    </span>
  )
}

export function Panel({ title, subtitle, back = '#/modes', backLabel, menu = true, children }: {
  title: string; subtitle?: string; back?: string; backLabel?: string; menu?: boolean; children?: ComponentChildren
}) {
  return (
    <div class="jp-mode-page">
      <header class="jp-mode-header">
        <div class="jp-mode-header-inner">
          <div class="jp-mode-brand">
            <a class="jp-mode-back" href={back} aria-label="Back">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </a>
            <a class="jp-logo" href="#/modes" aria-label="JP modes">JP</a>
            <a class="jp-mode-wordmark" href="#/">JAMB Practice</a>
          </div>
          {menu && <a class="jp-btn jp-menu-btn" href="#/modes" aria-label="Main menu">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z" /></svg>
              <span>Menu</span>
            </a>}
        </div>
      </header>
      <main class="jp-mode-main">
        <div class="jp-mode-hero">
          {backLabel && <a class="jp-link-btn jp-mode-crumb" href={back}>‹ {backLabel}</a>}
          <h1 class="jp-mode-title">{title}</h1>
          {subtitle && <p class="jp-mode-lead">{subtitle}</p>}
        </div>
        {children}
      </main>
    </div>
  )
}

export function ModeCard({ href, title, pill, accent, children }: {
  href: string; title: string; pill?: string | null; accent?: ModeAccent; children?: ComponentChildren
}) {
  return (
    <a class="jp-mode-card" href={href}>
      {accent && <ModeIcon accent={accent} />}
      <div class="jp-mode-card-body">
        {pill && <span class="jp-pill jp-pill--practice jp-pill--review">{pill}</span>}
        <strong class="jp-mode-card-title">{title}</strong>
        {children && <span class="jp-mode-card-sub">{children}</span>}
      </div>
      <svg class="jp-mode-card-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="m9 18 6-6-6-6" />
      </svg>
    </a>
  )
}

export function ModeHome() {
  const recent = getRecent()
  return (
    <Panel title="How do you want to learn?" subtitle="Choose a study path built for JAMB UTME." back="#/" menu={false}>
      <div class="jp-mode-grid">
        <ModeCard href="#/subjects?mode=study" title="Study" accent="study">Learn it chapter by chapter</ModeCard>
        <ModeCard href="#/subjects?mode=practice" title="Practice" accent="practice">Drill questions your way</ModeCard>
        <ModeCard href="#/exam" title="Exam" accent="exam">Sit a timed JAMB-style test</ModeCard>
      </div>
      {getAttempt('exam') && <button class="jp-btn jp-btn--primary jp-btn--full" onClick={continueExam}>Continue your exam</button>}
      {recent && recent.href !== '#/exam/run' &&
        <ModeCard href={recent.href} title="Continue where you stopped" accent="resume">{recent.label}</ModeCard>}
      <div class="jp-mode-footer-links">
        <Feedback screen="Mode selection" />
      </div>
    </Panel>
  )
}

export function useSubjects(subjects: readonly string[]) {
  const [status, setStatus] = useState(() => subjects.every(isSubjectLoaded) ? 'ready' : 'loading')
  useEffect(() => {
    if (subjects.every(isSubjectLoaded)) return
    let active = true
    void Promise.all(subjects.map(loadSubject)).then((loaded) => {
      if (active) setStatus(loaded.every(Boolean) ? 'ready' : 'error')
    })
    return () => { active = false }
  }, [subjects.join(',')])
  return status
}
