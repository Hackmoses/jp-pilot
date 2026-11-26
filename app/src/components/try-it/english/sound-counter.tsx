import { ChoiceButtons, EnglishActivity } from './EnglishActivity'
import type { InteractiveProps } from '../TryItCard'

function count(word: string, sounds: readonly string[]) {
  return { word, sounds, answer: String(sounds.length), goal: 'Count the sounds in ' + word + '.', hint: 'Count one sound for a letter group or a vowel glide.' }
}
export const soundCounts = [
  count('box', ['b', 'ɒ', 'k', 's']), count('ship', ['ʃ', 'ɪ', 'p']),
  count('cake', ['k', 'eɪ', 'k']), count('thin', ['θ', 'ɪ', 'n']),
] as const

export default function SoundCounter(props: InteractiveProps) {
  return <EnglishActivity {...props} tasks={soundCounts} aim="Count sounds in a word." context="One letter can stand for two sounds. Two letters can stand for one."
    prediction={{ question: 'How many sounds are in box?', choices: ['2', '3', '4'], correct: 2, why: 'The x stands for /k/ followed by /s/.' }}
    reason={{ question: 'Why does the vowel in cake count as one sound?', choices: ['It is one vowel glide', 'There is only one written vowel'], correct: 0 }}
    trap="Counting letters gives a different result when two letters share one sound."
    controls={({ word, sounds, answer }, value, change) => <>
      <strong>{word}</strong>
      <ChoiceButtons label="Sound count" options={['2', '3', '4', '5']} picked={value} onPick={change} />
      {value === answer && <div class="jp-pills" aria-label="The sounds">{sounds.map((sound, i) => <span key={i} class="jp-pill">/{sound}/</span>)}</div>}
    </>} />
}
