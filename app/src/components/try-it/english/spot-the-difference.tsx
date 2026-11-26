import { EnglishActivity } from './EnglishActivity'
import type { InteractiveProps } from '../TryItCard'

// Align each option to the same checked spelling. A blank preserves the next column
// when a letter is missing, so the unchanged suffix stays vertically aligned.
function align(reference: string, spelling: string) {
  const n = reference.length
  const m = spelling.length
  const distance = Array.from({ length: n + 1 }, () => Array<number>(m + 1).fill(0))
  for (let i = n; i >= 0; i--) {
    for (let j = m; j >= 0; j--) {
      if (i === n || j === m) distance[i][j] = n - i + m - j
      else distance[i][j] = Math.min(distance[i + 1][j + 1] + Number(reference[i] !== spelling[j]),
        1 + distance[i][j + 1], 1 + distance[i + 1][j])
    }
  }
  const letters = Array<string>(n).fill('')
  const insertions = Array<string>(n + 1).fill('')
  let i = 0
  let j = 0
  while (i < n || j < m) {
    if (i < n && j < m && distance[i][j] === distance[i + 1][j + 1] + Number(reference[i] !== spelling[j])) {
      letters[i++] = spelling[j++]
    } else if (j < m && distance[i][j] === distance[i][j + 1] + 1) {
      insertions[i] += spelling[j++]
    } else i++
  }
  return { letters, insertions }
}

export function alignSpellings(reference: string, spellings: readonly string[]) {
  const aligned = spellings.map((spelling) => align(reference, spelling))
  const widths = Array.from({ length: reference.length + 1 }, (_, i) => Math.max(...aligned.map((row) => row.insertions[i].length)))
  const rows = aligned.map(({ letters, insertions }) => widths.flatMap((width, i) => [
    ...Array.from({ length: width }, (_, j) => insertions[i][j] ?? ''),
    ...(i < reference.length ? [letters[i]] : []),
  ]))
  const different = rows[0].map((letter, i) => rows.some((row) => row[i] !== letter))
  return { rows, different }
}

export const spellingTrials = [
  { options: ['ecletic', 'eclectic', 'eclektic', 'eclectik'], answer: 'eclectic',
    goal: 'Choose the spelling for an approach drawn from several sources.', hint: 'Compare the letters immediately before t and at the very end.' },
  { options: ['pronuntiation', 'pronounciation', 'pronunciation', 'pronountiation'], answer: 'pronunciation',
    goal: 'Choose the spelling for how someone says a word.', hint: 'Look for c before iation and check whether there is an extra o.' },
  { options: ['fourtnight', 'fortnight', 'fourthnight', 'forthnight'], answer: 'fortnight',
    goal: 'Choose the spelling for a period of two weeks.', hint: 'Use fort before night.' },
  { options: ['size', 'seize', 'sieze', 'cease'], answer: 'seize',
    goal: 'Choose the word that fits: ___ a chance.', hint: 'Look for the verb meaning to take the chance. The e is before i.' },
] as const

export default function SpotTheDifference(props: InteractiveProps) {
  return <EnglishActivity {...props} tasks={spellingTrials} aim="Compare similar-looking options one letter at a time."
    context="Highlighted columns show where at least one option differs."
    prediction={{ question: 'What should you compare in eclectik and eclectic?', choices: ['Their first letter', 'Their last letter'], correct: 1, why: 'One ends in k and the other in c.' }}
    reason={{ question: 'What does a gap show in the aligned spellings?', choices: ['An option has a letter missing there', 'That letter must be silent'], correct: 0 }}
    trap="Look beyond a familiar word shape. Check the meaning and the letters that differ."
    controls={({ answer, options }, value, change) => {
      const { rows, different } = alignSpellings(answer, options)
      return <div class="jp-try-spelling-grid" role="group" aria-label="Aligned spellings">
        {rows.map((row, i) => <button key={options[i]} type="button" class="jp-btn" aria-label={options[i]}
          aria-pressed={value === options[i]} onClick={() => change(options[i])}>
          {row.map((letter, j) => different[j]
            ? <mark class="jp-try-column" key={j}>{letter || '·'}</mark>
            : <span class="jp-try-column" key={j}>{letter}</span>)}
        </button>)}
      </div>
    }} />
}
