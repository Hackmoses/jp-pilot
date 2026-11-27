import { AskJp } from '../components/home/AskJp'
import { ContinueCard, unfinishedAttempt } from '../components/home/ContinueCard'
import { QuestionOfDay } from '../components/home/QuestionOfDay'
import { accountName } from '../lib/access'
import { ACCOUNTS_ENABLED, FREE_QUESTIONS } from '../lib/config'
import { greetingFor } from '../lib/greeting'
import { roundDown, type HomeStats } from '../lib/stats'
import { getSubject } from '../lib/subjects'
import { useEffect, useState } from 'preact/hooks'
import '../styles/home.css'

const ways = [
  { href: '#/subjects?mode=study', title: 'Study', tag: 'Try it', text: 'Learn it chapter by chapter', tone: 'brand',
    icon: <path d="M4 5h11a3 3 0 013 3v11H7a3 3 0 01-3-3z" /> },
  { href: '#/subjects?mode=practice', title: 'Practice', tag: 'Instant reasons', text: 'Drill questions your way', tone: 'good',
    icon: <><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M8.5 12l2.5 2.5 4.5-5" /></> },
  { href: '#/exam', title: 'Exam', tag: 'Timed CBT', text: 'Sit a timed JAMB-style test', tone: 'memo',
    icon: <><circle cx="12" cy="13" r="7" /><path d="M12 9v4l2 2M10 3h4" /></> },
]

const MAIN_SUBJECTS = ['physics', 'chemistry', 'biology', 'mathematics', 'english'] as const

const SUBJECT_META: Record<(typeof MAIN_SUBJECTS)[number], { hint: string; icon: preact.JSX.Element }> = {
  physics: {
    hint: 'Worked solutions',
    icon: <><circle cx="12" cy="12" r="2.2" /><ellipse cx="12" cy="12" rx="9" ry="3.8" transform="rotate(30 12 12)" /><ellipse cx="12" cy="12" rx="9" ry="3.8" transform="rotate(-30 12 12)" /></>,
  },
  chemistry: {
    hint: 'Worked solutions',
    icon: <><path d="M9 3h6M10 3v5l-5.2 9.4A2 2 0 0 0 6.5 20h11a2 2 0 0 0 1.7-2.6L14 8V3" /><path d="M7.5 14h9" /></>,
  },
  biology: {
    hint: 'Teach me clips',
    icon: <><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" /><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" /></>,
  },
  mathematics: {
    hint: 'Worked solutions',
    icon: <><rect x="4" y="2" width="16" height="20" rx="2" /><path d="M8 6h8M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h4" /></>,
  },
  english: {
    hint: 'Oral & card decks',
    icon: <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />,
  },
}

const HOW = [
  ['Pick a subject', 'Physics, Chemistry, Biology, Maths, English & more UTME subjects.'],
  ['Answer JAMB questions', 'Real past questions and JAMB-style practice, with a clear reason under every option.'],
  ['Watch the working', 'Step-by-step voiced calculations and illustrated lessons.'],
]

function plusLabel(n: number) {
  const floor = roundDown(n)
  const text = floor.toLocaleString('en-GB')
  if (n <= 0) return '0'
  if (floor === 0) return String(n)
  return n === floor ? text : text + '+'
}

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
      <div class="home-section-head">
        <h2 id="home-how-title" class="home-section-title">How JP works</h2>
        <span class="home-section-meta">3 quick steps</span>
      </div>
      <ol class="home-how">
        {HOW.map(([title, text], i) => <li key={title} class="home-how-step">
          <span class="home-how-number" aria-hidden="true">{i + 1}</span>
          <span class="home-how-copy"><strong>{title}</strong><span>{text}</span></span>
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
        <a class="home-pill-link" href="#/subjects?mode=practice">
          {stats ? `All ${stats.subjectCount} subjects →` : 'All subjects →'}
        </a>
      </div>
      <div class="home-subjects">
        {MAIN_SUBJECTS.map((id) => {
          const subject = getSubject(id)
          const count = stats?.subjects[id]
          const { hint, icon } = SUBJECT_META[id]
          return <a key={id} class="home-subject" href={'#/practice?subject=' + id}
            style={{ '--tone': subject?.color, '--tone-soft': subject?.soft }}>
            <span class="home-subject-badge" aria-hidden="true">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">{icon}</svg>
            </span>
            <span class="home-subject-body">
              <span class="home-subject-name">{subject?.name ?? id}</span>
              <span class="home-subject-meta">{count !== undefined ? `${plusLabel(count)} questions · ${hint}` : hint}</span>
            </span>
            <span class="home-subject-arrow" aria-hidden="true">→</span>
          </a>
        })}
        <a class="home-subject home-subject--more" href="#/subjects?mode=practice">
          <span class="home-subject-more-head">
            <span class="home-subject-name">{others > 0 ? `+ ${others} more subjects` : 'More subjects'}</span>
            <span class="home-subject-more-cta">See all →</span>
          </span>
          <span class="home-subject-pills">
            <span>Economics</span>
            <span>Government</span>
            <span>Literature</span>
            {others > 3 && <span>+{others - 3}</span>}
          </span>
        </a>
      </div>
    </section>
  )
}

function Inside({ stats }: { stats: HomeStats }) {
  const items = [
    [plusLabel(stats.questions), 'Practice questions'],
    [plusLabel(stats.pastQuestions), 'From real JAMB past papers'],
    [plusLabel(stats.solutions), 'Worked solutions to watch'],
    [plusLabel(stats.lessons), 'Illustrated lessons'],
  ]
  return (
    <section class="home-inside" aria-label="What's inside JP">
      <div class="home-inside-head">
        <span class="home-inside-kicker">What’s inside · and growing</span>
        <span class="home-inside-sub">Offline-ready after first open</span>
      </div>
      <div class="home-inside-grid">
        {items.map(([value, label]) => <div key={label} class="home-inside-item"><strong>{value}</strong><span>{label}</span></div>)}
      </div>
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

        <section class="home-section" aria-labelledby="home-ways-title">
          <h2 id="home-ways-title" class="home-section-title">Three ways to prepare</h2>
          <nav class="home-ways" aria-label="Ways to learn">
            {ways.map((way) => (
              <a key={way.href} class="home-way" href={way.href}>
                <span class="home-way-icon" data-tone={way.tone}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{way.icon}</svg>
                </span>
                <span class="home-way-body">
                  <span class="home-way-head">
                    <span class="home-way-title">{way.title}</span>
                    <span class="home-way-tag" data-tone={way.tone}>{way.tag}</span>
                  </span>
                  <span class="home-way-text">{way.text}</span>
                </span>
                <span class="home-way-arrow" aria-hidden="true">→</span>
              </a>
            ))}
          </nav>
        </section>
      </main>

      <HomeFooter />
    </div>
  )
}
