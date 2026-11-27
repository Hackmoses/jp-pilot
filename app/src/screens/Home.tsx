import { AskJp } from '../components/home/AskJp'
import { ContinueCard, unfinishedAttempt } from '../components/home/ContinueCard'
import { QuestionOfDay } from '../components/home/QuestionOfDay'
import { TypedAsk } from '../components/home/TypedAsk'
import { accountName } from '../lib/access'
import { ACCOUNTS_ENABLED, FREE_QUESTIONS } from '../lib/config'
import { greetingFor } from '../lib/greeting'
import { lazyView } from '../lib/lazyView'
import { overLabel, type HomeStats } from '../lib/stats'
import { useEffect, useState } from 'preact/hooks'
import '../styles/home.css'
import '../styles/home-landing.css'

// Everything below the first screen loads after it, so slow data shows the hero first.
const landingMore = lazyView(() => import('../components/home/LandingMore').then(({ LandingMore }) => LandingMore))

const NAV = [
  { href: '#/subjects?mode=study', title: 'Study' },
  { href: '#/subjects?mode=practice', title: 'Practice' },
  { href: '#/exam', title: 'Exam' },
]

// Counts come from JP's own content at build time (scripts/build-home-stats.mjs), so they grow with it.
function useHomeStats() {
  const [stats, setStats] = useState<HomeStats | null>(null)
  useEffect(() => {
    const controller = new AbortController()
    fetch(import.meta.env.BASE_URL + 'data/home-stats.json', { signal: controller.signal })
      .then((res) => res.ok ? res.json() as Promise<HomeStats> : null)
      .then((data) => { if (data) setStats(data) })
      .catch(() => { /* Offline: the page shows without counts. */ })
    return () => controller.abort()
  }, [])
  return stats
}

export function HomeFooter() {
  return (
    <footer class="home-footer">
      <div class="home-footer-inner">
        <div class="home-footer-row">
          <span><strong>JP</strong> · Free JAMB practice</span>
          <nav class="home-footer-links" aria-label="About JP">
            <a href="#/about">About</a><a href="#/references">References</a><a href="#/privacy">Privacy</a><a href="#/contact">Contact</a><a href="#/contact">Report a mistake</a>
          </nav>
          <span>© {new Date().getFullYear()} JP</span>
        </div>
        <p class="home-disclaimer">JP is an independent study tool. It is not affiliated with JAMB (Joint Admissions and Matriculation Board).</p>
      </div>
    </footer>
  )
}

export function StartButtons({ center = false }: { center?: boolean }) {
  return <>
    <div class={'ld-actions' + (center ? ' ld-actions--center' : '')}>
      {ACCOUNTS_ENABLED ? <>
        <a class="ld-btn ld-btn--primary" href="#/subjects?mode=practice">Try {FREE_QUESTIONS} questions now</a>
        <a class="ld-btn" href="#/signup">Create free account</a>
      </> : <a class="ld-btn ld-btn--primary" href="#/subjects?mode=practice">Start practising free</a>}
    </div>
    <p class="ld-note">{ACCOUNTS_ENABLED ? `No sign-up for your first ${FREE_QUESTIONS} questions.` : 'Free. Nothing to download.'}</p>
  </>
}

function Header({ name }: { name: string | null }) {
  const focusAsk = () => {
    document.getElementById('ask-jp')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    document.getElementById('home-ask-input')?.focus({ preventScroll: true })
  }
  return (
    <header class="home-header">
      <div class="home-header-inner">
        <a class="home-brand" href="#/" aria-label="JP home">
          <span class="home-logo" aria-hidden="true">JP</span>
          <span class="home-brand-name">JAMB Practice</span>
        </a>
        <nav class="home-nav" aria-label="Primary">
          {NAV.map((way) => <a key={way.href} href={way.href}>{way.title}</a>)}
        </nav>
        <div class="home-header-actions">
          <button type="button" class="home-icon-btn" aria-label="Search with Ask JP" onClick={focusAsk}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" />
            </svg>
          </button>
          {name ? <span class="home-avatar" aria-label={'Signed in as ' + name}>{name[0]}</span> : <>
            <a class="ld-btn ld-btn--ghost ld-hide-sm" href="#/signup">Sign in</a>
            <a class="ld-btn ld-btn--primary" href="#/signup">Create free account</a>
          </>}
        </div>
      </div>
    </header>
  )
}

function Landing({ stats }: { stats: HomeStats | null }) {
  const { View: More } = landingMore.useView(true)
  return <>
    <section class="ld-hero">
      <div class="ld-wrap">
        <TypedAsk />
        <div class="ld-hero-grid">
          <div class="ld-hero-copy">
            <span class="ld-badge">Works on slow data and offline</span>
            <h1 class="ld-title">Practise JAMB.<br />Understand every answer.</h1>
            <p class="ld-lead">Real past questions, a <b>worked solution you can watch</b> for every mistake, and <b>short voiced lessons</b> on the ideas JAMB keeps testing.</p>
            <StartButtons />
            <div class="ld-ask"><AskJp /></div>
            {stats && <p class="ld-stats">
              <span><b>{overLabel(stats.questions)}</b> questions</span>
              <span><b>{overLabel(stats.pastQuestions)}</b> from real JAMB papers</span>
              <span><b>{overLabel(stats.solutions)}</b> worked solutions</span>
            </p>}
          </div>
          <div class="ld-hero-qotd"><QuestionOfDay /></div>
        </div>
      </div>
    </section>
    {More ? <More stats={stats} /> : <div class="ld-more-space" aria-hidden="true" />}
  </>
}

function SignedIn({ name }: { name: string }) {
  const attempt = unfinishedAttempt()
  return (
    <div class="ld-wrap ld-home">
      <p class="ld-greeting">{greetingFor()}, {name}</p>
      <h1 class="ld-title ld-title--small">What do you want to learn today?</h1>
      <div class="ld-home-grid">
        <div class="ld-home-main">
          {attempt && <ContinueCard attempt={attempt} />}
          <AskJp />
        </div>
        <QuestionOfDay showStreak />
      </div>
    </div>
  )
}

export function Home() {
  const name = accountName()
  const stats = useHomeStats()
  // Only signed-in students get a personal page. Everyone else always sees the same landing page.
  return (
    <div class="home ld">
      <Header name={name} />
      <main class="ld-main">{name ? <SignedIn name={name} /> : <Landing stats={stats} />}</main>
      <HomeFooter />
    </div>
  )
}
