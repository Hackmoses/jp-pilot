import { useEffect, useState } from 'preact/hooks'
import { LogPage } from './components/share/LogPage'
import { Home } from './screens/Home'
import { Session } from './screens/Session'
import { Subjects } from './screens/Subjects'
import { Summary } from './screens/Summary'

function readRoute() {
  return window.location.hash.split('?')[0]
}

export function App() {
  const [route, setRoute] = useState(readRoute)

  useEffect(() => {
    const onHashChange = () => setRoute(readRoute())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  switch (route) {
    case '#/subjects':
      return <Subjects />
    case '#/q':
      return <Session />
    case '#/done':
      return <Summary />
    case '#/log':
      return <LogPage />
    default:
      return <Home />
  }
}
