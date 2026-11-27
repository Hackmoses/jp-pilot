import { AskJp } from '../components/home/AskJp'
import { ContinueCard, unfinishedAttempt } from '../components/home/ContinueCard'
import { QuestionOfDay } from '../components/home/QuestionOfDay'
import { accountName } from '../lib/access'
import { ACCOUNTS_ENABLED, FREE_QUESTIONS } from '../lib/config'
import { greetingFor } from '../lib/greeting'
import { overLabel, type HomeStats } from '../lib/stats'
import { getSubject } from '../lib/subjects'
import { useEffect, useState } from 'preact/hooks'
import '../styles/home.css'

const ways = [
  { href: '#/subjects?mode=study', title: 'Study', text: 'Learn it chapter by chapter', tone: 'brand',
    icon: <path d="M4 5h11a3 3 0 013 3v11H7a3 3 0 01-3-3z" /> },
  { href: '#/subjects?mode=practice', title: 'Practice', text: 'Drill questions your way', tone: 'good',
    icon: <><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M8.5 12l2.5 2.5 4.5-5" /></> },
  { href: '#/exam', title: 'Exam', text: 'Sit a timed JAMB-style test', tone: 'memo',
    icon: <><circle cx="12" cy="13" r="7" /><path d="M12 9v4l2 2M10 3h4" /></> },
]

const MAIN_SUBJECTS = ['physics', 'chemistry', 'biology', 'mathematics', 'english']

const HOW = [
  ['Pick a subject', 'Physics, Chemistry, Biology, Maths, English and more UTME subjects.'],
  ['Answer real JAMB questions', 'Past questions from JAMB papers, with a clear reason under every option.'],
  ['Watch the working', 'Calculations are written out step by step with a voice, and illustrated lessons explain the ideas.'],
]

// Counts come from JP's own content at build time (scripts/build-home-stats.mjs), so they grow with it.
function useHomeStats() {
  const [stats, setStats] = useState<HomeStats | null>(null)
  useEffect(() => {
    const controller = new AbortController()
    fetch(import.meta.env.BASE_URL + 'data/home-stats.json', { signal: controller.signal })
      .then((res) => res.ok ? res.json() as Promise<HomeStats> : null)
      .then((data) => { if (data) setStats(data) })
      .catch(() => { /* Offline: the tiles show without counts. */ })
    return () => controller.abort()
  }, [])
  return stats
}

function HowItWorks() {
  return (
    <section class="home-section" aria-labelledby="home-how-title">
      <h2 id="home-how-title" class="home-section-title">How JP works</h2>
      <ol class="home-how">
        {HOW.map(([title, text], i) => <li key={title} class="home-how-step">
          <span class="home-how-number" aria-hidden="true">{i + 1}</span>
          <span><strong>{title}</strong><span>{text}</span></span>
        </li>)}
      </ol>
    </section>
  )
}

function SubjectTiles({ stats }: { stats: HomeStats | null }) {
  const others = stats ? stats.subjectCount - MAIN_SUBJECTS.length : 0
  return (
    <section class="home-section" aria-labelledby="home-subjects-title">
      <div class="home-section-head">
        <h2 id="home-subjects-title" class="home-section-title">Pick a subject to start</h2>
        <a class="home-link" href="#/subjects?mode=practice">All subjects →</a>
      </div>
      <div class="home-subjects">
        {MAIN_SUBJECTS.map((id) => {
          const subject = getSubject(id)
          const count = stats?.subjects[id]
          return <a key={id} class="home-subject" href={'#/practice?subject=' + id}
            style={{ '--tone': subject?.color, '--tone-soft': subject?.soft }}>
            <span class="home-subject-name"><span class="home-subject-badge" aria-hidden="true">{(subject?.name ?? id).slice(0, 2)}</span>{subject?.name ?? id}</span>
            {count !== undefined && <span class="home-subject-count">{overLabel(count)} questions</span>}
            <span class="home-subject-start">Start →</span>
          </a>
        })}
        <a class="home-subject home-subject--more" href="#/subjects?mode=practice">
          <span class="home-subject-name">{others > 0 ? `+ ${others} more subjects` : 'More subjects'}</span>
          <span class="home-subject-count">Economics, Government, Literature…</span>
          <span class="home-subject-start">See all →</span>
        </a>
      </div>
    </section>
  )
}

function Inside({ stats }: { stats: HomeStats }) {
  const items = [
    [overLabel(stats.questions), 'practice questions'],
    [overLabel(stats.pastQuestions), 'from real JAMB past papers'],
    [overLabel(stats.solutions), 'worked solutions you can watch'],
    [overLabel(stats.lessons), 'illustrated lessons'],
  ]
  return (
    <section class="home-inside" aria-label="What's inside JP">
      <div class="home-inside-label"><span class="home-eyebrow">What’s inside</span><span class="home-note">And growing</span></div>
      {items.map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}
    </section>
  )
}

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
  const signedIn = name !== null
  const attempt = signedIn ? unfinishedAttempt() : null
  const stats = useHomeStats()
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
            {/* Only signed-in students get a personal page. Everyone else always sees the same landing page. */}
            {signedIn ? <p class="home-greeting">{greetingFor()}, {name}</p> : <p class="home-greeting">For JAMB UTME candidates</p>}
            <h1>What do you want to learn today?</h1>
            {signedIn && attempt ? <ContinueCard attempt={attempt} /> : <>
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
                <p class="home-note">No download · Works offline once opened</p>
              </>}
            </>}
          </section>
          <QuestionOfDay showStreak={signedIn} />
          <AskJp />
        </div>

        {!signedIn && <HowItWorks />}
        <SubjectTiles stats={stats} />
        {stats && <Inside stats={stats} />}

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
