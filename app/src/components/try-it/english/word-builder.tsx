import { DragTiles } from './DragTiles'
import { EnglishActivity } from './EnglishActivity'
import type { InteractiveProps } from '../TryItCard'

const slots = ['Prefix', 'Base', 'Suffix']
const blank = 'No suffix'
function build(parts: readonly [string, string, string], distractor: string) {
  const [prefix, base, suffix] = parts
  const word = prefix + base + suffix
  return { word, parts, tiles: [base, suffix || blank, distractor, prefix], answer: '2|3||1',
    goal: 'Put the pieces in order to build ' + word + '.', hint: 'Put the beginning in Prefix and the main word in Base.' }
}
export const wordBuilds = [
  build(['un', 'success', 'ful'], 'mis'),
  build(['dis', 'appoint', ''], 'ful'),
  build(['mis', 'spell', ''], 'un'),
  build(['un', 'necessary', ''], 'dis'),
] as const

export function assembledWord(tiles: readonly string[], value: string) {
  const groups = value.split('|')
  return slots.map((_, i) => tiles[groups.indexOf(String(i + 1))] ?? '').filter((word) => word !== blank).join('')
}

export default function WordBuilder(props: InteractiveProps) {
  return <EnglishActivity {...props} tasks={wordBuilds} aim="Put a prefix, base, and suffix in order."
    context="A base can take an ending, but some words in this activity only need a prefix and a base."
    prediction={{ question: 'Which part of unsuccessful gives the idea of doing well?', choices: ['un', 'success', 'ful'], correct: 1, why: 'Success is the base.' }}
    reason={{ question: 'Why does misspell keep both s letters?', choices: ['Both parts supply one s', 'The suffix doubles the s'], correct: 0 }}
    trap="Keep both letters when two adjoining pieces each supply one."
    controls={({ tiles }, value, change) => <>
      <DragTiles tiles={tiles} groups={slots} picked={value} onChange={change} single />
      {value && <p class="jp-try-text">Built word: <strong>{assembledWord(tiles, value)}</strong></p>}
    </>} />
}
