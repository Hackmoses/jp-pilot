import { ENGLISH_CARD_TOPICS, ENGLISH_ORAL_LESSONS } from './sections'

const ENGLISH_DECK_LABELS: Record<string, string> = {
  synonyms: 'Practise synonym cards', antonyms: 'Practise antonym cards', idioms: 'Practise idiom cards',
  'grammar-rules': 'Practise grammar rule cards', 'phrasal-verbs-prepositions': 'Practise phrasal verb cards',
  'confusable-words': 'Practise confusable word cards', spelling: 'Practise spelling cards',
}

// Where a student goes after an English question: the oral lesson or the matching card deck.
// Grammar chapters 8 and 10 share the grammar rule deck with chapter 7.
export function englishLearnLink(chapter: string): { href: string; label: string } | undefined {
  if (ENGLISH_ORAL_LESSONS[chapter]) return { href: '#/study?' + new URLSearchParams({ subject: 'english', chapter }), label: 'Hear the oral lesson →' }
  const deckChapter = chapter === '8' || chapter === '10' ? '7' : chapter
  const deck = ENGLISH_CARD_TOPICS[deckChapter]
  if (!deck) return undefined
  return { href: '#/study?' + new URLSearchParams({ subject: 'english', chapter: deckChapter }) + '&cards=1', label: ENGLISH_DECK_LABELS[deck] + ' →' }
}
