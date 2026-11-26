import { EnglishActivity } from './EnglishActivity'
import type { InteractiveProps } from '../TryItCard'

export const silentLetters = [
  { word: 'knife', answer: '0', goal: 'Tap the silent letter at the start of knife.', hint: 'The first sound is /n/.' },
  { word: 'debt', answer: '2', goal: 'Tap the silent letter in debt.', hint: 'The last two sounds are /e/ and /t/.' },
  { word: 'sign', answer: '2', goal: 'Tap the silent letter inside sign.', hint: 'The vowel goes straight into /n/.' },
  { word: 'hour', answer: '0', goal: 'Tap the silent letter at the start of hour.', hint: 'The word starts with a vowel sound.' },
] as const

export default function SilentLetterHunter(props: InteractiveProps) {
  return <EnglishActivity {...props} tasks={silentLetters} aim="Find letters that have no sound in the checked UK pronunciation."
    context="Read the whole word, then compare the written letters with what you hear yourself say."
    prediction={{ question: 'Which letter starts the spelling of knife but has no sound?', choices: ['k', 'n'], correct: 0, why: 'The spoken word starts with /n/.' }}
    reason={{ question: 'What is the final consonant sound in sign?', choices: ['/ɡ/', '/n/'], correct: 1 }}
    trap="A silent letter stays in the spelling even when you cannot hear it."
    controls={({ word, answer }, value, change) => <>
      <div class="jp-try-letters" role="group" aria-label={'Letters of ' + word}>
        {[...word].map((letter, i) => <button key={i} type="button" class="jp-btn jp-try-letter"
          aria-label={letter + ', letter ' + (i + 1)} aria-pressed={String(i) === value} onClick={() => change(String(i))}>{letter}</button>)}
      </div>
      {value === answer && <p class="jp-try-text">{props.english?.words[word]?.ipa}</p>}
    </>} />
}
