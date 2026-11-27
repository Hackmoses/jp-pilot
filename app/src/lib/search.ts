// Ask JP searches JP's own lessons, practice topics and approved glossary entries on the device.
export type SearchEntry = {
  kind: 'term' | 'clip' | 'study' | 'practice' | 'cards'
  title: string
  subject: string
  href: string
  words: string
  definition?: string
  example?: string
  count?: number
  detail?: string
}
export type SearchIndex = { version: 1; entries: SearchEntry[] }

const fillers = /^(what|whats|what's|is|are|the|a|an|of|define|definition|meaning|means|explain|tell|me|about|how|does|do|to|in|on|for|and|antonym|antonyms|synonym|synonyms|opposite|word)$/

export function normalize(text: string) {
  return text.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/['’]s\b/g, '')
    .replace(/[^a-z0-9]+/g, ' ').trim()
}

export function queryWords(query: string) {
  return normalize(query).split(' ').filter((word) => word && !fillers.test(word))
}

function withinOne(a: string, b: string) {
  if (a === b) return true
  if (Math.abs(a.length - b.length) > 1) return false
  let i = 0, j = 0, edits = 0
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue }
    if (++edits > 1) return false
    if (a.length > b.length) i++
    else if (b.length > a.length) j++
    else { i++; j++ }
  }
  return edits + (a.length - i) + (b.length - j) <= 1
}

function wordScore(word: string, tokens: string[]) {
  if (tokens.includes(word)) return 3
  if (tokens.some((token) => token.startsWith(word) && word.length >= 3)) return 2
  if (word.length >= 5 && tokens.some((token) => withinOne(word, token))) return 1.5
  return 0
}

const kindWeight: Record<SearchEntry['kind'], number> = { term: 1.3, clip: 1.2, study: 1.1, cards: 1, practice: 1 }

export function search(index: SearchIndex, query: string, limit = 4) {
  const words = queryWords(query)
  if (words.length === 0) return []
  const scored = index.entries.map((entry) => {
    const titleTokens = normalize(entry.title).split(' ')
    const tokens = normalize(entry.title + ' ' + entry.words).split(' ')
    let total = 0
    for (const word of words) {
      const score = Math.max(wordScore(word, titleTokens) * 1.5, wordScore(word, tokens))
      if (score === 0) return { entry, score: 0 }
      total += score
    }
    const exact = normalize(entry.title) === words.join(' ') ? 4 : 0
    return { entry, score: (total + exact) * kindWeight[entry.kind] }
  }).filter((row) => row.score > 0)
  scored.sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title))
  const seen = new Set<string>()
  return scored.map((row) => row.entry).filter((entry) => {
    const id = entry.kind + entry.href
    if (seen.has(id)) return false
    seen.add(id)
    return true
  }).slice(0, limit)
}
