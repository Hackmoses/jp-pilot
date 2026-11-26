import type { WordBank } from '../../lessons/lesson'
import { EnglishActivity } from './EnglishActivity'
import type { FourTasks, Task } from './EnglishActivity'
import type { InteractiveProps } from '../TryItCard'

const targets = [
  { id: 'record-noun', parts: ['re', 'cord'], goal: 'Tap the stronger syllable in record, a thing you keep.' },
  { id: 'record-verb', parts: ['re', 'cord'], goal: 'Tap the stronger syllable in record, the action.' },
  { id: 'termination', parts: ['ter', 'mi', 'na', 'tion'], goal: 'Tap the strongest syllable in termination.' },
  { id: 'atomic', parts: ['a', 'tom', 'ic'], goal: 'Tap the stronger syllable in atomic.' },
] as const
type StressTask = Task & (typeof targets)[number]

export function stressTrials(words: WordBank): FourTasks<StressTask> {
  const forWord = (target: (typeof targets)[number]) => ({
    ...target, answer: String(words[target.id].stress - 1), hint: 'Say the word and listen for the main beat.',
  })
  return [forWord(targets[0]), forWord(targets[1]), forWord(targets[2]), forWord(targets[3])]
}

export default function StressTapper(props: InteractiveProps) {
  if (!props.english) return null
  return <EnglishActivity {...props} tasks={stressTrials(props.english.words)} aim="Tap the syllable that gets the strongest beat."
    context="In some word pairs, the strongest beat moves when the job of the word changes."
    prediction={{ question: 'In the noun record, which syllable is strong?', choices: ['First', 'Second'], correct: 0, why: 'The noun is stressed on RE.' }}
    reason={{ question: 'Where does the stress fall in termination?', choices: ['Before -tion', 'On -tion'], correct: 0 }}
    trap="In a pair like record, use the meaning to decide which syllable carries the stress."
    controls={({ id, parts, answer }, value, change) => <>
      <div class="jp-try-letters" role="group" aria-label="Syllables">
        {parts.map((part, i) => <button key={i} type="button" class="jp-btn jp-try-letter"
          aria-label={'Syllable ' + (i + 1) + ': ' + part}
          aria-pressed={value === String(i)} onClick={() => change(String(i))}>{part}</button>)}
      </div>
      {value === answer && <p class="jp-try-text">{props.english?.words[id].ipa}</p>}
    </>} />
}
