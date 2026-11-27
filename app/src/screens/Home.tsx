import { AskJp } from '../components/home/AskJp'
import { ContinueCard, unfinishedAttempt } from '../components/home/ContinueCard'
import { QuestionOfDay } from '../components/home/QuestionOfDay'
import { accountName } from '../lib/access'
import { ACCOUNTS_ENABLED, FREE_QUESTIONS } from '../lib/config'
import { greetingFor } from '../lib/greeting'
import '../styles/home.css'

const ways = [
  { href: '#/subjects?mode=study', title: 'Study', text: 'Learn it chapter by chapter', tone: 'brand',
    icon: <path d="M4 5h11a3 3 0 013 3v11H7a3 3 0 01-3-3z" /> },
  { href: '#/subjects?mode=practice', title: 'Practice', text: 'Drill questions your way', tone: 'good',
    icon: <><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M8.5 12l2.5 2.5 4.5-5" /></> },
  { href: '#/exam', title: 'Exam', text: 'Sit a timed JAMB-style test', tone: 'memo',
    icon: <><circle cx="12" cy="13" r="7" /><path d="M12 9v4l2 2M10 3h4" /></> },
]

export function HomeFooter() {
  return (
    <footer class="home-footer">
      <div class="home-footer-inner">
        <div class="home-footer-row">
          <span><strong>JP</strong> · Free JAMB practice</span>
          <nav class="home-footer-links" aria-label="About JP">
            <a href="#/about">About</a><a href="#/references">References</a><a href="#/privacy">Privacy</a><a href="#/contact">Contact</a>
          </nav>
          <span>© {new Date().getFullYear()} JP</span>
        </div>
        <p class="home-disclaimer">JP is an independent practice app and is not affiliated with JAMB (Joint Admissions and Matriculation Board).</p>
      </div>
    </footer>
  )
}

export function Home() {
  const name = accountName()
  const attempt = unfinishedAttempt()
  const focusAsk = () => {
    document.getElementById('ask-jp')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    document.getElementById('home-ask-input')?.focus({ preventScroll: true })
  }

  return (
    <div class="home">
      <header class="home-header">
        <div class="home-header-inner">
          <a class="home-brand" href="#/" aria-label="JP home">
            <span class="home-logo" aria-hidden="true">JP</span>
            <span class="home-brand-name">JAMB Practice</span>
          </a>
          <nav class="home-nav" aria-label="Primary">
            {ways.map((way) => <a key={way.href} href={way.href}>{way.title}</a>)}
          </nav>
          <div class="home-header-actions">
            <button type="button" class="home-icon-btn" aria-label="Search with Ask JP" onClick={focusAsk}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" />
              </svg>
            </button>
            {name
              ? <span class="home-avatar" aria-label={'Signed in as ' + name}>{name[0]}</span>
              : <a class="home-btn home-btn--small" href="#/signup">Sign in</a>}
          </div>
        </div>
      </header>

      <main class="home-main">
        <div class="home-top">
          <section class="home-intro">
            <p class="home-greeting">{greetingFor()}{name ? ', ' + name : ''}</p>
            <h1>What do you want to learn today?</h1>
            {attempt ? <ContinueCard attempt={attempt} /> : <>
              <p class="home-pitch">Real JAMB past questions, a clear reason under every answer, and step-by-step solutions you can watch. Works on one bar of signal.</p>
              {ACCOUNTS_ENABLED ? <>
                <div class="home-actions">
                  <a class="home-btn home-btn--primary" href="#/signup">Start free with your email →</a>
                  <a class="home-btn" href="#/subjects?mode=practice">Try {FREE_QUESTIONS} free questions first</a>
                </div>
                <p class="home-note">No download · Email-only sign-up · Create a free account to keep going after {FREE_QUESTIONS} questions</p>
              </> : <>
                <div class="home-actions">
                  <a class="home-btn home-btn--primary" href="#/subjects?mode=practice">Start practising free →</a>
                </div>
                <p class="home-note">No download · No sign-up needed · Works offline once opened</p>
              </>}
            </>}
          </section>
          <QuestionOfDay />
          <AskJp />
        </div>

        <nav class="home-ways" aria-label="Ways to learn">
          {ways.map((way) => (
            <a key={way.href} class="home-way" href={way.href}>
              <span class="home-way-icon" data-tone={way.tone}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{way.icon}</svg>
              </span>
              <span><span class="home-way-title">{way.title}</span><span class="home-way-text">{way.text}</span></span>
            </a>
          ))}
        </nav>
      </main>

      <HomeFooter />
    </div>
  )
}
