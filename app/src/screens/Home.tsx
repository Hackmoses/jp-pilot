import { useEffect, useRef, useState } from 'preact/hooks'
import { FeatureCarousel } from '../components/landing/FeatureCarousel'
import '../styles/landing.css'

export function Home() {
  const notice = useRef<HTMLDialogElement>(null)
  const [activeNotice, setActiveNotice] = useState<'email' | 'copyright' | null>(null)
  const copyright = `© ${new Date().getFullYear()} JP`

  useEffect(() => {
    if (!activeNotice) return
    const dialog = notice.current
    dialog?.showModal()
    return () => dialog?.close()
  }, [activeNotice])

  return (
    <div class="landing">
      <header class="landing-header">
        <div class="landing-header-inner">
          <div class="landing-brand">
            <a class="landing-logo" href="#/" aria-label="JP home">JP</a>
            <a class="landing-brand-name" href="#/">JAMB Practice</a>
            <span class="landing-pilot">15 UTME subjects</span>
          </div>
          <nav class="landing-nav" aria-label="Primary">
            <a class="landing-nav-link" href="#/subjects">Practice</a>
            <a class="landing-nav-link" href="#/done">Progress</a>
            <button type="button" class="landing-nav-link" onClick={() => setActiveNotice('copyright')}>
              About
            </button>
          </nav>
          <div class="landing-header-actions">
            <button type="button" class="landing-action landing-sign-in" onClick={() => setActiveNotice('email')}>
              Sign in
            </button>
            <a class="landing-action landing-primary landing-header-cta" href="#/subjects">Try free</a>
          </div>
        </div>
      </header>

      <main class="landing-main">
        <div class="landing-intro">
          <div class="landing-eyebrow">For UTME candidates</div>
          <h1>Don’t just cram JAMB — understand every step.</h1>
          <p class="landing-pitch">
            Every JAMB past question explained step by step — open it from a WhatsApp link and learn why every option is right or wrong.
          </p>
          <div class="landing-actions">
            <button type="button" class="landing-action landing-primary" onClick={() => setActiveNotice('email')}>
              Start free with your email
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M5 12h14m-6-6 6 6-6 6" />
              </svg>
            </button>
            <a class="landing-action" href="#/subjects">Try free without an account</a>
          </div>
          <p class="landing-details">No download · Email-only sign-up · Works on one bar of signal · 10 free questions a day</p>
        </div>

        <FeatureCarousel paused={activeNotice !== null} />
      </main>

      <footer class="landing-footer">
        <div class="landing-footer-inner">
          <span class="landing-footer-brand">
            <strong>JP</strong> <span aria-hidden="true">·</span> 15 UTME subjects
          </span>
          <span class="landing-footer-meta">
            Works offline · Zero install · Free daily practice
          </span>
          <div class="landing-footer-links">
            <a class="landing-footer-link" href="#/subjects">Practice</a>
            <a class="landing-footer-link" href="#/done">Progress</a>
            <button type="button" class="landing-copyright" aria-haspopup="dialog"
              onClick={() => setActiveNotice('copyright')}>
              {copyright}
            </button>
          </div>
        </div>
      </footer>

      <dialog class="landing-notice" ref={notice} onClose={() => setActiveNotice(null)}
        aria-labelledby="landing-notice-title" aria-describedby="landing-notice-description">
        <h2 id="landing-notice-title">{activeNotice === 'copyright' ? 'Copyright' : 'Email sign-in is coming soon.'}</h2>
        <p id="landing-notice-description">
          {activeNotice === 'copyright' ? `${copyright}. JAMB UTME Practice — 15 UTME subjects.` : 'You can practise free right now.'}
        </p>
        <div class="landing-actions">
          {activeNotice === 'email' && (
            <a class="landing-action landing-primary" href="#/subjects" onClick={() => notice.current?.close()}>
              Try free without an account
            </a>
          )}
          <form method="dialog">
            <button type="submit" class="landing-action">{activeNotice === 'copyright' ? 'Close' : 'Back'}</button>
          </form>
        </div>
      </dialog>
    </div>
  )
}
