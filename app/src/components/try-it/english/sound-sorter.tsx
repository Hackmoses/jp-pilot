import { DragTiles } from './DragTiles'
import { EnglishActivity } from './EnglishActivity'
import type { InteractiveProps } from '../TryItCard'

function sort(tiles: readonly string[], groups: readonly [string, string], slots: string) {
  return { tiles, groups, answer: slots, goal: 'Put each word into its vowel sound group.', hint: 'Say the words aloud and compare the vowel sounds in the two groups.' }
}

export const vowelSorts = [
  sort(['see', 'bed', 'sea'], ['/iː/', '/e/'], '1|2|1'),
  sort(['full', 'fool', 'pull'], ['/ʊ/', '/uː/'], '1|2|1'),
  sort(['cot', 'caught', 'hot'], ['/ɒ/', '/ɔː/'], '1|2|1'),
  sort(['bird', 'bed', 'shirt'], ['/ɜː/', '/e/'], '1|2|1'),
] as const

export default function SoundSorter(props: InteractiveProps) {
  return <EnglishActivity {...props} tasks={vowelSorts} aim="Group words by their vowel sounds." context="Spelling can change while the vowel sound stays the same."
    prediction={{ question: 'Which word has the same vowel as see?', choices: ['bed', 'sea'], correct: 1, why: 'See and sea both contain /iː/.' }}
    reason={{ question: 'Why do cot and caught go in different groups?', choices: ['The vowels differ', 'The final consonants differ'], correct: 0 }}
    trap="Matching spelling does not guarantee a matching vowel."
    controls={({ tiles, groups, answer }, value, change) => <>
      <DragTiles tiles={tiles} groups={groups} picked={value} onChange={change} />
      {value === answer && <p class="jp-try-text">{tiles.map((word) => props.english?.words[word]?.ipa).filter(Boolean).join(' · ')}</p>}
    </>} />
}
