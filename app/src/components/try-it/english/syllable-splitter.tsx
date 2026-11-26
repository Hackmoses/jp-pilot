import { Fragment } from 'preact'
import { EnglishActivity } from './EnglishActivity'
import type { InteractiveProps } from '../TryItCard'

function split(parts: readonly string[], phones: readonly string[]) {
  const word = parts.join('')
  return { word, parts, phones, answer: parts.slice(0, -1).map((_, i) => parts.slice(0, i + 1).join('').length).join(','),
    goal: 'Tap the gaps to split ' + word + '.', hint: 'Say it slowly and put one vowel beat in each piece.' }
}

export const syllableSplits = [
  split(['sys', 'tem'], ['sɪs', 'təm']), split(['pic', 'ture'], ['pɪk', 'tʃə']),
  split(['ac', 'tion'], ['æk', 'ʃən']), split(['rec', 'i', 'pe'], ['res', 'ɪ', 'pi']),
] as const

export function toggleCut(value: string, gap: number) {
  const cuts = value ? value.split(',').map(Number) : []
  return (cuts.includes(gap) ? cuts.filter((cut) => cut !== gap) : [...cuts, gap].sort((a, b) => a - b)).join(',')
}

export default function SyllableSplitter(props: InteractiveProps) {
  return <EnglishActivity {...props} tasks={syllableSplits} aim="Put cuts between the spoken syllables."
    context="Say the word and clap once on each vowel beat."
    prediction={{ question: 'How many beats do you hear in system?', choices: ['One', 'Two', 'Three'], correct: 1, why: 'The two spoken pieces are /sɪs/ and /təm/.' }}
    reason={{ question: 'How many beats does the ending -tion add in action?', choices: ['One', 'Two'], correct: 0 }}
    trap="A spoken final e can add a beat, as it does in recipe."
    controls={({ word, answer, phones }, value, change) => <>
      <div class="jp-try-letters" role="group" aria-label={'Cut ' + word + ' between letters'}>
        {[...word].map((letter, index) => <Fragment key={index}>
          <strong>{letter}</strong>
          {index < word.length - 1 && <button type="button" class="jp-btn jp-try-cut" aria-label={'Cut after letter ' + (index + 1) + ', ' + letter}
            aria-pressed={value.split(',').includes(String(index + 1))} onClick={() => change(toggleCut(value, index + 1))}>│</button>}
        </Fragment>)}
      </div>
      {value === answer && <p class="jp-try-text">/{phones.join('.')}/</p>}
    </>} />
}
