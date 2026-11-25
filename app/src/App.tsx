import { useEffect, useState } from 'preact/hooks'
import { LogPage } from './components/share/LogPage'
import { submitExpiredExam } from './lib/modes'
import { ExamSetup, Results, Run } from './screens/Exam'
import { Home } from './screens/Home'
import { ModeHome, PracticeSetup, Study } from './screens/Modes'
import { Session } from './screens/Session'
import { Subjects } from './screens/Subjects'
import { Summary } from './screens/Summary'

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
  switch (screen) {
    case '#/modes':
      return <ModeHome />
    case '#/subjects':
      return <Subjects key={route} mode={params.get('mode') === 'study' ? 'study' : 'practice'} />
    case '#/study':
      return <Study key={route} params={params} />
    case '#/practice':
      return <PracticeSetup key={route} subject={params.get('subject') ?? 'chemistry'} />
    case '#/exam':
    case '#/exam/rules':
      return <ExamSetup key={route} rules={screen === '#/exam/rules'} />
    case '#/practice/run':
    case '#/exam/run':
      return <Run key={route} mode={screen === '#/exam/run' ? 'exam' : 'practice'} />
    case '#/practice/results':
    case '#/exam/results':
      return <Results key={route} mode={screen === '#/exam/results' ? 'exam' : 'practice'} params={params} />
    case '#/q':
      return <Session key={route} />
    case '#/done':
      return <Summary />
    case '#/log':
      return <LogPage />
    default:
      return <Home />
  }
}
