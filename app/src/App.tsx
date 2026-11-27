import { useEffect, useState } from 'preact/hooks'
import { lazyView } from './lib/lazyView'
import { submitExpiredExam } from './lib/modes'
import { examRun, results } from './screens/examModules'
import { Home } from './screens/Home'
import { ReturnBar } from './screens/ReturnBar'
import { ModeHome, Panel } from './screens/Modes'

function screenView<Props extends object>(module: ReturnType<typeof lazyView<Props>>, title: string) {
  return function Screen(props: Props) {
    const { View, failed } = module.useView()
    return View ? <View {...props} /> : <Panel title={title}>
      <p class="jp-mode-lead" role="status">{failed ? 'Could not open this screen. Reload the page to try again.' : 'Loading…'}</p>
    </Panel>
  }
}

const Study = screenView(lazyView(() => import('./screens/Study').then(({ Study }) => Study)), 'Study')
const Subjects = screenView(lazyView(() => import('./screens/Subjects').then(({ Subjects }) => Subjects)), 'Subjects')
const PracticeSetup = screenView(lazyView(() => import('./screens/PracticeSetup').then(({ PracticeSetup }) => PracticeSetup)), 'Practice')
const ReadingPassages = screenView(lazyView(() => import('./screens/ReadingPassages').then(({ ReadingPassages }) => ReadingPassages)), 'Reading passages')
const PracticeRun = screenView(lazyView(() => import('./screens/PracticeRun').then(({ PracticeRun }) => PracticeRun)), 'Practice')
const ExamSetup = screenView(lazyView(() => import('./screens/ExamSetup').then(({ ExamSetup }) => ExamSetup)), 'Exam')
const ExamRun = screenView(examRun, 'Exam')
const Results = screenView(results, 'Results')
const Session = screenView(lazyView(() => import('./screens/Session').then(({ Session }) => Session)), 'Questions')
const LogPage = screenView(lazyView(() => import('./components/share/LogPage').then(({ LogPage }) => LogPage)), 'Activity log')
const InfoPages = screenView(lazyView(() => import('./screens/InfoPages').then(({ InfoPages }) => InfoPages)), 'JP')
const Summary = screenView(lazyView(() => import('./screens/Summary').then(({ Summary }) => Summary)), 'Progress summary')

const FiguresDemo = import.meta.env.DEV
  ? screenView(lazyView(() => import('./screens/FiguresDemo').then(({ FiguresDemo }) => FiguresDemo)), 'Figures demo')
  : null

function readRoute() {
  return window.location.hash
}

export function App() {
  const [route, setRoute] = useState(readRoute)

  useEffect(() => {
    const onHashChange = () => {
      setRoute(readRoute())
      window.scrollTo({ top: 0 })
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    const check = () => { if (!document.hidden) submitExpiredExam() }
    check()
    document.addEventListener('visibilitychange', check)
    window.addEventListener('pageshow', check)
    return () => {
      document.removeEventListener('visibilitychange', check)
      window.removeEventListener('pageshow', check)
    }
  }, [route])

  const [screen, query] = route.split('?')
  const params = new URLSearchParams(query)
  if (import.meta.env.DEV && screen === '#/figures-demo' && FiguresDemo) return <FiguresDemo />
  switch (screen) {
    case '#/modes':
      return <ModeHome />
    case '#/subjects':
      return <Subjects key={route} mode={params.get('mode') === 'study' ? 'study' : 'practice'} />
    case '#/study':
      return <><ReturnBar /><Study key={route} params={params} /></>
    case '#/practice':
      return <PracticeSetup key={route} subject={params.get('subject') ?? 'chemistry'} chapter={params.get('chapter')} />
    case '#/exam':
    case '#/exam/rules':
      return <ExamSetup key={route} rules={screen === '#/exam/rules'} />
    case '#/practice/passages':
      return <ReadingPassages key={route} setId={params.get('set')} retry={params.has('retry')} />
    case '#/practice/run':
      return <PracticeRun key={route} />
    case '#/exam/run':
      return <ExamRun key={route} />
    case '#/practice/results':
    case '#/exam/results':
      return <Results key={route} mode={screen === '#/exam/results' ? 'exam' : 'practice'} params={params} />
    case '#/q':
      return <Session key={route} />
    case '#/done':
      return <Summary />
    case '#/log':
      return <LogPage />
    case '#/about':
    case '#/privacy':
    case '#/contact':
    case '#/signup':
    case '#/references':
      return <InfoPages key={route} page={screen.slice(2) as 'about' | 'privacy' | 'contact' | 'signup' | 'references'} />
    default:
      return <Home />
  }
}
