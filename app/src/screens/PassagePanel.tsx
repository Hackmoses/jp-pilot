import type { Ref } from 'preact'
import { splitGaps, type PassageLine } from './passageData'

export type GapAnswer = { text: string; correct: boolean }

export function PassageText({ passage, proof, gaps, firstProof }: {
  passage: PassageLine[]
  proof: readonly number[]
  gaps: ReadonlyMap<number, GapAnswer>
  firstProof?: Ref<HTMLLIElement>
}) {
  return <ol class="jp-passage-lines">
    {passage.map(({ number, text }) => {
      const highlighted = proof.includes(number)
      return <li key={number} value={number}
        ref={number === proof[0] ? firstProof : undefined}
        data-proof={highlighted ? 'true' : undefined}>
        {splitGaps(text).map(({ text, gap }, index) => {
          if (gap === null) return text
          const answer = gaps.get(gap)
          return <span key={index} class="jp-passage-gap"
            data-gap={gap} data-answer={answer ? (answer.correct ? 'correct' : 'wrong') : undefined}
            aria-label={answer ? 'Gap ' + gap + ': ' + answer.text + (answer.correct ? ', correct' : ', incorrect') : 'Gap ' + gap}>
            {answer?.text ?? `[${gap}]`}
          </span>
        })}
      </li>
    })}
  </ol>
}
