import { ChoiceButtons, EnglishActivity } from './EnglishActivity'
import type { InteractiveProps } from '../TryItCard'

export const sentences = [
  { before: 'Pens and envelopes are ', after: '.', options: ['stationary', 'stationery'], answer: 'stationery',
    goal: 'Choose the word for writing supplies.', hint: 'Think of envelope for the e in stationery.' },
  { before: 'Fairness is a ', after: ' of our school.', options: ['principal', 'principle'], answer: 'principle',
    goal: 'Choose the word for a rule or belief.', hint: 'The principal can be a person. A principle can guide a decision.' },
  { before: 'I think ', after: ' coming with us.', options: ['their', 'there', "they're"], answer: "they're",
    goal: 'Use the word that can expand to they are.', hint: 'An apostrophe shows where letters were left out.' },
  { before: 'What would you ', after: ' me to do?', options: ['advice', 'advise'], answer: 'advise',
    goal: 'Choose the verb that means give guidance.', hint: 'The verb ends in /z/.' },
] as const

export default function SentenceFixer(props: InteractiveProps) {
  return <EnglishActivity {...props} tasks={sentences} aim="Choose the word that fits the meaning and job of the gap."
    context="Read the whole sentence before picking a spelling."
    prediction={{ question: 'Which word names pens and envelopes?', choices: ['stationary', 'stationery'], correct: 1, why: 'Stationery names the supplies.' }}
    reason={{ question: 'Why does they’re fit the gap?', choices: ['It means they are', 'It shows who owns something'], correct: 0 }}
    trap="Advice names the guidance. Advise is what a person does."
    controls={({ before, after, options }, value, change) => <>
      <p class="jp-try-question">{before}<strong>{value || '___'}</strong>{after}</p>
      <ChoiceButtons label="Words for the gap" options={options} picked={value} onPick={change} />
    </>} />
}
