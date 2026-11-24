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
        <div class="landing-brand">
          <a class="landing-logo" href="#/" aria-label="JP home">JP</a>
          <span class="landing-pilot">Chemistry pilot</span>
        </div>
        <button type="button" class="landing-action landing-sign-in" onClick={() => setActiveNotice('email')}>
          Sign in
        </button>
      </header>

      <main class="landing-main">
        <div class="landing-intro">
          <div class="landing-eyebrow">For UTME candidates</div>
          <h1>JAMB practice without installing anything.</h1>
          <p class="landing-pitch">
            Open it from a WhatsApp link, answer one question at a time, and learn why every option is right or wrong.
          </p>
          <div class="landing-actions">
            <button type="button" class="landing-action landing-primary" onClick={() => setActiveNotice('email')}>
              Start free with your email
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M5 12h14m-6-6 6 6-6 6" />
              </svg>
            </button>
            <a class="landing-action" href="#/q">Try free without an account</a>
          </div>
          <p class="landing-note">easy sign-up, just your email</p>
          <p class="landing-details">No download · Works on one bar of signal · 10 free questions a day</p>
        </div>

        <FeatureCarousel paused={activeNotice !== null} />
      </main>

      <footer class="landing-footer">
        <button type="button" class="landing-copyright" aria-haspopup="dialog"
          onClick={() => setActiveNotice('copyright')}>
          {copyright}
        </button>
      </footer>

      <dialog class="landing-notice" ref={notice} onClose={() => setActiveNotice(null)}
        aria-labelledby="landing-notice-title" aria-describedby="landing-notice-description">
        <h2 id="landing-notice-title">{activeNotice === 'copyright' ? 'Copyright' : 'Email sign-in is coming soon.'}</h2>
        <p id="landing-notice-description">
          {activeNotice === 'copyright' ? `${copyright}. JAMB Chemistry Practice pilot.` : 'You can practise free right now.'}
        </p>
        <div class="landing-actions">
          {activeNotice === 'email' && (
            <a class="landing-action landing-primary" href="#/q" onClick={() => notice.current?.close()}>
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
