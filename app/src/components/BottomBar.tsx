// Phones only: Home, Study, Practise and Exam stay one tap away on every browsing screen.
const ITEMS = [
  { key: 'home', label: 'Home', href: '#/', icon: <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" /> },
  { key: 'study', label: 'Study', href: '#/subjects?mode=study', icon: <path d="M4 5h11a3 3 0 0 1 3 3v11H7a3 3 0 0 1-3-3z" /> },
  { key: 'practice', label: 'Practise', href: '#/subjects?mode=practice', icon: <><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M8.5 12l2.5 2.5 4.5-5" /></> },
  { key: 'exam', label: 'Exam', href: '#/exam', icon: <><circle cx="12" cy="13" r="7" /><path d="M12 9v4l2 2M10 3h4" /></> },
] as const

export function activeTab(route: string) {
  const [screen, query = ''] = route.split('?')
  if (screen === '' || screen === '#' || screen === '#/') return 'home'
  if (screen === '#/study' || (screen === '#/subjects' && query.includes('mode=study'))) return 'study'
  if (screen === '#/practice' || screen === '#/subjects') return 'practice'
  if (screen.startsWith('#/exam')) return 'exam'
  return null
}

export function BottomBar({ route }: { route: string }) {
  const active = activeTab(route)
  return <>
    <div class="jp-bottom-space" aria-hidden="true" />
    <nav class="jp-bottom-bar" aria-label="Main">
      {ITEMS.map((item) => <a key={item.key} href={item.href} aria-current={active === item.key ? 'page' : undefined}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{item.icon}</svg>
        <span>{item.label}</span>
      </a>)}
    </nav>
  </>
}
