import { useEffect, useRef, useState } from 'preact/hooks'
import { ACCOUNTS_ENABLED } from '../../lib/config'
import { useLessonIndex } from '../../lib/lessonIndex'
import { overLabel, type HomeStats } from '../../lib/stats'
import { getSubject } from '../../lib/subjects'
import { StartButtons } from '../../screens/Home'

const WAYS = [
  { title: 'Practise', short: 'Practise', body: 'Questions by subject and topic. Get one wrong and watch the worked solution.', href: '#/subjects?mode=practice' },
  { title: 'Learn the key concepts', short: 'Key concepts', body: 'Short voiced lessons on the ideas JAMB keeps testing, with the traps and a quick check.', href: '#/subjects?mode=study' },
  { title: 'Sit a timed exam, like the real CBT', short: 'Timed exam', body: 'Four subjects, the real time limit, and the calculator always there.', href: '#/exam' },
]

const MAIN_SUBJECTS = ['english', 'mathematics', 'physics', 'chemistry', 'biology'] as const

// Runs only while the section is on screen, so it costs nothing while the student reads elsewhere.
function useOnScreen<T extends Element>() {
  const ref = useRef<T>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver !== 'function') { setVisible(true); return }
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.2 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return { ref, visible }
}

function Phone({ tab, solution, openSolution, closeSolution }: { tab: number; solution: boolean; openSolution: () => void; closeSolution: () => void }) {
  return (
    <div class="ld-phone" aria-label="Example screens from JP">
      <div class="ld-phone-screen">
        {tab === 0 && !solution && <div class="ld-screen" key="q">
          <span class="ld-muted ld-small">Physics · Question 4 of 20</span>
          <div class="ld-track"><span style={{ width: '20%' }} /></div>
          <b>A car starts from rest and accelerates at 30 m/s² for 20 s. How far does it travel?</b>
          <span class="ld-opt"><i>A</i>600 m</span>
          <span class="ld-opt" data-state="correct"><i>B</i>6 km <b>Correct</b></span>
          <span class="ld-opt"><i>C</i>12 km</span>
          <span class="ld-opt"><i>D</i>1.2 km</span>
          <button type="button" class="ld-btn ld-btn--small ld-btn--primary ld-push" onClick={openSolution}>Watch the solution</button>
        </div>}
        {tab === 0 && solution && <div class="ld-screen" key="s">
          <div class="ld-row"><button type="button" class="ld-btn ld-btn--small" aria-label="Back to the question" onClick={closeSolution}>←</button><b>Worked solution</b></div>
          <div class="ld-board">
            <span class="ld-ink">u = 0, a = 30, t = 20</span>
            <span class="ld-ink" style={{ animationDelay: '1.2s' }}>s = ½ a t²</span>
            <span class="ld-ink" style={{ animationDelay: '2.4s' }}>s = ½ × 30 × 400</span>
            <span class="ld-ink ld-ink--answer" style={{ animationDelay: '3.6s' }}>s = 6000 m = 6 km</span>
          </div>
          <span class="ld-opt ld-small">“It starts from rest, so the starting speed is zero. Square the time first.”</span>
          <span class="ld-muted ld-small">Step 3 of 4 · 0.75× · CC on</span>
          <a class="ld-btn ld-btn--small ld-btn--soft ld-push" href="#/lesson?id=phys-motion">Watch: Equations of motion</a>
        </div>}
        {tab === 1 && <div class="ld-screen" key="l">
          <span class="ld-muted ld-small">Key concept · Physics</span>
          <b>Equations of motion</b>
          <span class="ld-five"><small>LIKE YOU'RE FIVE</small>You watch a danfo pull away. It covers a little road at first, then more each second.</span>
          <span class="ld-opt"><b>Rule card</b><br /><span class="ld-muted">v = u + at · s = ut + ½at²</span></span>
          <span class="ld-dots"><i class="on" /><i class="on" /><i /><i /></span>
          <span class="ld-muted ld-small">Two examples, the traps, then a quick check.</span>
          <a class="ld-btn ld-btn--small ld-push" href="#/lesson?id=phys-motion">Open the lesson</a>
        </div>}
        {tab === 2 && <div class="ld-screen" key="e">
          <div class="ld-row ld-between"><b>Mock UTME</b><span class="ld-chip ld-chip--warm">1:58:12</span></div>
          <span class="ld-row"><span class="ld-chip ld-chip--on">English</span><span class="ld-chip">Maths</span><span class="ld-chip">Physics</span></span>
          <span class="ld-muted ld-small">Question 23 of 180</span>
          <b>Choose the option nearest in meaning to the word in italics.</b>
          <span class="ld-opt"><i>A</i>careless</span>
          <span class="ld-opt" data-state="picked"><i>B</i>thorough</span>
          <span class="ld-opt"><i>C</i>hasty</span>
          <span class="ld-opt"><i>D</i>timid</span>
          <span class="ld-row ld-push"><span class="ld-btn ld-btn--small">Calculator</span><a class="ld-btn ld-btn--small ld-btn--primary" href="#/exam">Try a mock</a></span>
        </div>}
      </div>
    </div>
  )
}

function ThreeWays() {
  const { ref, visible } = useOnScreen<HTMLElement>()
  const [tab, setTab] = useState(0)
  const [held, setHeld] = useState(false)
  const [solution, setSolution] = useState(false)
  useEffect(() => {
    if (!visible || held) return
    const timer = setInterval(() => { if (!document.hidden) { setTab((t) => (t + 1) % 3); setSolution(false) } }, 5000)
    return () => clearInterval(timer)
  }, [visible, held])
  return (
    <section ref={ref} class="ld-band ld-defer" aria-labelledby="ld-ways-title">
      <div class="ld-wrap ld-split">
        <div class="ld-split-copy">
          <h2 id="ld-ways-title" class="ld-h2">Three ways to prepare, all in one place.</h2>
          <p class="ld-lead">Start anywhere. JP remembers where you stopped. Tap a step to see it.</p>
          <ol class="ld-tabs">
            {WAYS.map((way, i) => <li key={way.title}>
              <button type="button" class="ld-tab" aria-pressed={tab === i} onClick={() => { setTab(i); setSolution(false); setHeld(true) }}>
                <span class="ld-tab-head"><span class="ld-tab-n">{i + 1}</span><span class="ld-tab-long">{way.title}</span><span class="ld-tab-short">{way.short}</span></span>
                {tab === i && <span class="ld-tab-body">{way.body}</span>}
              </button>
            </li>)}
          </ol>
          <p class="ld-tab-desc" aria-live="polite">{WAYS[tab].body}</p>
        </div>
        <Phone tab={tab} solution={solution} openSolution={() => { setSolution(true); setHeld(true) }} closeSolution={() => setSolution(false)} />
      </div>
    </section>
  )
}

function Story() {
  const steps: [string, string, preact.JSX.Element | null][] = [
    [ACCOUNTS_ENABLED ? 'Ada makes a free account in a minute.' : 'Ada opens JP on her phone.', 'Nothing to download.', null],
    ['She tries a real JAMB question', 'and gets it wrong.', <div class="ld-card">
      <span class="ld-chip ld-chip--brand">PHYSICS · JAMB 2006</span>
      <p>A drop of petrol makes a finger colder than a drop of water would because</p>
      <span class="ld-opt" data-state="wrong">it takes latent heat of fusion <b>Yours</b></span>
      <span class="ld-opt" data-state="correct">it takes latent heat of vaporization <b>Correct</b></span>
    </div>],
    ['JP shows her why,', 'one written step at a time, out loud.', <div class="ld-board">
      <span class="ld-ink">Petrol evaporates faster than water</span>
      <span class="ld-ink" style={{ animationDelay: '1.3s' }}>Evaporating needs latent heat</span>
      <span class="ld-ink ld-ink--answer" style={{ animationDelay: '2.6s' }}>It takes that heat from the finger</span>
    </div>],
    ['Then it points her to the idea behind it.', '', <a class="ld-card ld-lesson" href="#/lesson?id=phys-heat">
      <span class="ld-play" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg></span>
      <span><b>Heat · key concept lesson</b><br /><span class="ld-muted ld-small">The idea, two examples, the traps.</span></span>
    </a>],
    ['Next time, she gets it right.', 'That is the whole point.', null],
  ]
  return (
    <section id="how" class="ld-section ld-defer" aria-labelledby="ld-story-title">
      <div class="ld-wrap">
        <div class="ld-center">
          <h2 id="ld-story-title" class="ld-h2">How it works for one student, Ada.</h2>
          <p class="ld-muted ld-small">A demonstration. Ada and her answers are made up.</p>
        </div>
        <div class="ld-story">
          <div class="ld-ada">
            <div class="ld-ada-card"><span class="ld-ada-face" aria-hidden="true">A</span><b>Ada</b><span>SS3, Enugu. Aiming for Medicine.</span></div>
            <div class="ld-ada-rows">
              <span class="ld-card ld-row ld-between"><b>Chemistry</b><span class="ld-muted">needs work</span></span>
              <span class="ld-card ld-row ld-between" data-on="true"><b>Physics</b><span>practising today</span></span>
              <span class="ld-card ld-row ld-between"><b>English</b><span class="ld-muted">strong</span></span>
            </div>
          </div>
          <ol class="ld-steps">
            {steps.map(([lead, rest, extra], i) => <li key={lead} class="ld-step">
              <span class="ld-step-n" data-last={i === steps.length - 1}>{i + 1}</span>
              <div><p class="ld-step-text">{lead} {rest && <span>{rest}</span>}</p>{extra}</div>
            </li>)}
          </ol>
        </div>
      </div>
    </section>
  )
}

const TRUST: [string, string, preact.JSX.Element][] = [
  ['Real JAMB papers', 'Every past question shows the year it came from. Practice questions are clearly labelled as practice.',
    <><path d="M7 3h7l5 5v13H7z" /><path d="M14 3v5h5M10 13h6M10 17h6" /></>],
  ['Checked against textbooks', 'Worked answers and lessons are checked against the standard textbooks listed in References.',
    <><path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2z" /><path d="M4 19V5M9 8l2 2 4-4" /></>],
  ['Independent expert reviewers', 'Subject experts outside JP review questions and answers before they go live.',
    <><path d="M12 3l7 3v6c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6z" /><path d="M9 12l2 2 4-4" /></>],
]

export function LandingMore({ stats }: { stats: HomeStats | null }) {
  const lessons = useLessonIndex() ?? []
  const picks = ['chem-mole', 'maths-logarithms', 'phys-motion'].map((id) => lessons.find((lesson) => lesson.id === id)).filter(Boolean)
  return <>
    <ThreeWays />
    <Story />

    <section class="ld-trust ld-defer" aria-labelledby="ld-trust-title">
      <div class="ld-wrap">
        <div class="ld-center">
          <h2 id="ld-trust-title" class="ld-h2">Every answer is checked before you see it.</h2>
          <p class="ld-lead">Three checks stand between a question and your screen.</p>
        </div>
        <ol class="ld-trust-grid">
          {TRUST.map(([title, text, icon]) => <li key={title} class="ld-trust-card">
            <span class="ld-trust-icon" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">{icon}</svg></span>
            <b>{title}</b>
            <p>{text}</p>
          </li>)}
        </ol>
        <p class="ld-center ld-small ld-muted ld-trust-foot">Spotted a mistake? <a href="#/contact">Report it</a> and we fix it.</p>
      </div>
    </section>

    {lessons.length > 0 && <section id="lessons" class="ld-dark ld-defer" aria-labelledby="ld-lessons-title">
      <div class="ld-wrap">
        <h2 id="ld-lessons-title" class="ld-h2">Key concepts, explained like a teacher would.</h2>
        <p class="ld-lead">{lessons.length} voiced lessons in Maths, Physics and Chemistry. More subjects coming.</p>
        <div class="ld-grid3">
          {picks.map((lesson) => lesson && <a key={lesson.id} class="ld-dark-card" href={'#/lesson?id=' + encodeURIComponent(lesson.id)}>
            <b>{lesson.title}</b><span>{getSubject(lesson.subject)?.name ?? lesson.subject} · about {lesson.minutes} min</span>
          </a>)}
        </div>
      </div>
    </section>}

    <section id="subjects" class="ld-section ld-defer" aria-labelledby="ld-subjects-title">
      <div class="ld-wrap">
        <h2 id="ld-subjects-title" class="ld-h2">Pick a subject.</h2>
        <div class="ld-grid-subjects">
          {MAIN_SUBJECTS.map((id) => {
            const count = stats?.subjects[id]
            return <a key={id} class="ld-card ld-subject" href={'#/practice?subject=' + id}>
              <b>{getSubject(id)?.name ?? id}</b>{count ? <span class="ld-muted ld-small">{overLabel(count)} questions</span> : null}
            </a>
          })}
        </div>
        <a class="ld-link" href="#/subjects?mode=practice">See all subjects</a>
      </div>
    </section>

    <section class="ld-cta ld-defer">
      <div class="ld-wrap ld-center">
        <h2 class="ld-h2">Your next question is waiting.</h2>
        <p class="ld-lead">{ACCOUNTS_ENABLED ? 'Your progress, streak and weak topics follow you on any phone or laptop.' : 'Free, light, and it keeps working when the network drops.'}</p>
        <StartButtons center />
      </div>
    </section>
  </>
}
