import { ChoiceButtons, EnglishActivity } from './EnglishActivity'
import type { InteractiveProps } from '../TryItCard'

export const endingTrials = [
  { stem: 'drink', options: ['able', 'ible'], answer: 'able', goal: 'Complete the word for something you can drink.', hint: 'Drink is already a whole base.' },
  { stem: 'flex', options: ['able', 'ible'], answer: 'ible', goal: 'Complete the adjective that means able to bend easily.', hint: 'Check the lesson example with -ible.' },
  { stem: 'confid', options: ['ance', 'ence'], answer: 'ence', goal: 'Finish the noun related to confident.', hint: 'Listen to confident, then keep its e in the noun ending.' },
  { stem: 'musi', options: ['tion', 'sion', 'cian'], answer: 'cian', goal: 'Complete the word for someone who plays music.', hint: 'The c at the end of music belongs in -cian.' },
] as const

export default function EndingChooser(props: InteractiveProps) {
  return <EnglishActivity {...props} tasks={endingTrials} aim="Use clues from a base to choose the right ending."
    context="Endings can sound alike. Compare the word with another member of its family."
    prediction={{ question: 'What ending belongs on drinkable?', choices: ['-able', '-ible'], correct: 0, why: 'You can hear the whole base drink before -able.' }}
    reason={{ question: 'Which spelling links confident and confidence?', choices: ['Both use e in the last syllable', 'Both use a in the last syllable'], correct: 0 }}
    trap="These clues help with guesses. Flexible uses -ible."
    controls={({ stem, options }, value, change) => <>
      <strong>{stem}{value || '___'}</strong>
      <ChoiceButtons label="Ending" options={options} picked={value} onPick={change} />
    </>} />
}
