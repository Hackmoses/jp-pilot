import { useRef, useState } from 'preact/hooks'
import { search, type SearchEntry, type SearchIndex } from '../../lib/search'
import { getSubject } from '../../lib/subjects'

export const ASK_EXAMPLES = ['what is a mole', 'antonym of laudable', 'photosynthesis']
let indexPromise: Promise<SearchIndex | null> | null = null

function loadIndex() {
  indexPromise ??= fetch(`${import.meta.env.BASE_URL}data/search-index.json`)
    .then((res) => res.ok ? res.json() as Promise<SearchIndex> : null)
    .catch(() => { indexPromise = null; return null })
  return indexPromise
}

function linkLabel(entry: SearchEntry) {
  if (entry.kind === 'clip') return { title: 'Teach me · ' + entry.title, detail: entry.detail }
  if (entry.kind === 'study') return { title: 'Study · ' + entry.title, detail: entry.detail }
  if (entry.kind === 'cards') return { title: entry.title + ' cards', detail: entry.detail }
  if (entry.kind === 'term') return { title: entry.title, detail: entry.detail ?? 'Definition' }
  return { title: `Practise ${entry.count ?? ''} ${entry.count === 1 ? 'question' : 'questions'} on ${entry.title}`.replace('  ', ' '),
    detail: (getSubject(entry.subject)?.name ?? entry.subject) + (entry.detail && entry.detail !== getSubject(entry.subject)?.name ? ' · ' + entry.detail : '') }
}

export function AskJp() {
  const input = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'offline' | 'done'>('idle')
  const [results, setResults] = useState<SearchEntry[]>([])

  const run = async (text: string) => {
    setQuery(text)
    if (!text.trim()) { setState('idle'); setResults([]); return }
    setState((s) => s === 'done' ? s : 'loading')
    const index = await loadIndex()
    if (!index) { setState('offline'); return }
    setResults(search(index, text, 4))
    setState('done')
  }

  const term = results.find((entry) => entry.kind === 'term' && entry.definition)
  const links = results.filter((entry) => entry !== term).slice(0, 3)

  return (
    <section id="ask-jp" class="home-card home-ask" aria-labelledby="home-ask-label">
      <label id="home-ask-label" for="home-ask-input" class="home-eyebrow">Ask JP</label>
      <form class="home-ask-field" role="search" onSubmit={(event) => { event.preventDefault(); void run(query) }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" />
        </svg>
        <input id="home-ask-input" ref={input} type="search" value={query} autoComplete="off"
          placeholder="Ask about any word, topic or formula" onFocus={() => void loadIndex()}
          onInput={(event) => void run(event.currentTarget.value)} />
        {query && <button type="button" class="home-ask-clear" aria-label="Clear" onClick={() => { void run(''); input.current?.focus() }}>×</button>}
      </form>
      <div aria-live="polite">
        {state === 'offline' && <p class="home-note">Ask JP could not load. Check your connection and try again.</p>}
        {state === 'done' && results.length === 0 && <p class="home-note">Nothing in JP yet for that. Try a shorter word.</p>}
        {state === 'done' && results.length > 0 && <div class="home-ask-results">
          {term && <article class="home-ask-term">
            <div class="home-ask-term-head">
              <h3>{term.title}</h3>
              <span class="home-tag">{getSubject(term.subject)?.name ?? term.subject}</span>
            </div>
            <p>{term.definition}</p>
            {term.example && <p class="home-ask-example">Example · {term.example}</p>}
            {term.detail && <p class="home-ask-example">{term.detail}</p>}
          </article>}
          {links.length > 0 && <div class="home-ask-links">
            {links.map((entry) => {
              const label = linkLabel(entry)
              return <a key={entry.kind + entry.href + entry.title} class="home-ask-link" href={entry.href || undefined}>
                <span>{label.title}</span>{label.detail && <small>{label.detail}</small>}
              </a>
            })}
          </div>}
        </div>}
      </div>
      {(state === 'idle' || (state === 'done' && results.length === 0)) && <div class="home-ask-examples">
        {ASK_EXAMPLES.map((example) => <button key={example} type="button" class="home-chip" onClick={() => void run(example)}>{example}</button>)}
      </div>}
      <p class="home-note">Searches JP’s own lessons, questions and clips · works offline once loaded</p>
    </section>
  )
}
