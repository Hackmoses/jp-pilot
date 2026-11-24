import { useEffect, useRef, useState } from 'preact/hooks'
import { FeatureCarousel } from '../components/landing/FeatureCarousel'
import '../styles/landing.css'

export function Home() {
  const notice = useRef<HTMLDialogElement>(null)
  const [noticeOpen, setNoticeOpen] = useState(false)

  useEffect(() => {
    if (!noticeOpen) return
    const dialog = notice.current
    dialog?.showModal()
    return () => dialog?.close()
  }, [noticeOpen])

  return (
    <div class="landing">
      <header class="landing-header">
        <div class="landing-brand">
          <span class="landing-logo" aria-hidden="true">JP</span>
          <span>[APP NAME]</span>
          <span class="landing-pilot">Chemistry pilot</span>
        </div>
        <button type="button" class="landing-action landing-sign-in" onClick={() => setNoticeOpen(true)}>
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
            <button type="button" class="landing-action landing-primary" onClick={() => setNoticeOpen(true)}>
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

        <FeatureCarousel paused={noticeOpen} />
      </main>

      <dialog class="landing-notice" ref={notice} onClose={() => setNoticeOpen(false)}
        aria-labelledby="landing-notice-title" aria-describedby="landing-notice-description">
        <h2 id="landing-notice-title">Email sign-in is coming soon.</h2>
        <p id="landing-notice-description">You can practise free right now.</p>
        <div class="landing-actions">
          <a class="landing-action landing-primary" href="#/q" onClick={() => notice.current?.close()}>
            Try free without an account
          </a>
          <form method="dialog">
            <button type="submit" class="landing-action">Back</button>
          </form>
        </div>
      </dialog>
    </div>
  )
}
