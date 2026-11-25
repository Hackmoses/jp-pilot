import { useRef, useState } from 'preact/hooks'
import { renderMathText } from '../../lib/mathText'
import { Scene, Select, Travel, TryIt, Values } from './TryIt'
import type { InteractiveProps } from './TryItCard'

type Mother = 'HH' | 'Hh' | 'hh'
type Father = 'H' | 'h'
type Allele = 'H' | 'h' | 'Y'
type Gamete = { parent: 0 | 1; allele: Allele }

const gene = (allele: Allele) => allele === 'Y' ? 'Y' : 'X^{' + allele + '}'
const geneLabel = (allele: Allele) => allele === 'Y' ? 'Y' : 'X ' + allele
const maternal = (mother: Mother) => mother.split('') as Allele[]
const paternal = (father: Father): Allele[] => [father, 'Y']
function outcome(m: Allele, f: Allele) {
  if (f === 'Y') return m === 'h' ? 'Affected' : 'Unaffected'
  return m === 'h' && f === 'h' ? 'Affected' : m === f ? 'Unaffected' : 'Carrier'
}

export function inheritance(mother: Mother, father: Father) {
  const eggs = maternal(mother)
  const sons = eggs.filter((egg) => outcome(egg, 'Y') === 'Affected').length * 50
  const daughters = eggs.map((egg) => outcome(egg, father))
  return { sons, daughters: daughters.filter((child) => child === 'Affected').length * 50,
    carriers: daughters.filter((child) => child === 'Carrier').length * 50 }
}

export default function Punnett(props: InteractiveProps) {
  const [mother, setMother] = useState<Mother>('Hh')
  const [father, setFather] = useState<Father>('H')
  const [cells, setCells] = useState([0, 0, 0, 0])
  const [selected, select] = useState<Gamete | null>(null)
  const [message, setMessage] = useState('')
  const drag = useRef<{ id: number; x: number; y: number } | null>(null)
  const dragged = useRef(false)
  const eggs = maternal(mother)
  const sperm = paternal(father)
  const { sons, daughters, carriers } = inheritance(mother, father)
  const carrierPlaced = cells.some((placed, cell) => placed === 3 && outcome(eggs[cell >> 1], sperm[cell % 2]) === 'Carrier')

  function clearSquare() {
    setCells([0, 0, 0, 0])
    setMessage('')
    select(null)
  }

  function place(cell: number, gamete: Gamete | null) {
    if (!gamete) {
      setMessage('Choose a parent’s allele first.')
      return
    }
    const expected = gamete.parent === 0 ? eggs[cell >> 1] : sperm[cell % 2]
    if (gamete.allele !== expected) {
      setMessage(gamete.parent === 0 ? 'Match the mother’s allele to its row.' : 'Match the father’s chromosome to its column.')
      return
    }
    setCells((old) => old.map((bits, i) => i === cell ? bits | (1 << gamete.parent) : bits))
    setMessage('')
    select(null)
  }

  return <TryIt {...props} aim="Use a Punnett square to predict which children can inherit a sex-linked trait." context="Family health history can help frame questions about inheritance when couples seek genetic counselling in Nigeria."
    prediction={{ question: 'A carrier mother and unaffected father have children. Who can inherit haemophilia in this model?',
      choices: ['Sons', 'Daughters', 'Both'], correct: 0,
      action: 'Drag or tap the mother’s Xʰ and the father’s Y into the bottom-right box.',
      observed: mother === 'Hh' && father === 'H' && cells[3] === 3, why: 'A son gets his Y from his father. The X from his mother can carry the variant.' }}
    missions={[
      { goal: 'Build one carrier daughter in the square.', reached: carrierPlaced, hint: 'A carrier daughter needs one H and one h on her two X chromosomes.' },
      { goal: 'Keep the mother a carrier. Compare an unaffected father with an affected father.',
        baseline: mother === 'Hh' && father === 'H', reached: mother === 'Hh' && father === 'h',
        hint: 'Follow the father’s Y down the sons’ column.',
        reason: { question: 'Why does the chance per son stay at 50%?', choices: ['The son gets Y from his father and X from his mother', 'The son gets both chromosomes from his father'], correct: 0 } },
      { goal: 'A carrier woman and an unaffected man have a child. Set the parents and find the chance the child has haemophilia.',
        reached: mother === 'Hh' && father === 'H', hint: 'For a child of either sex, use all four boxes in the denominator.',
        answer: { question: 'What is the chance per child, assuming either sex is equally likely?', choices: ['25%', '50%'], correct: 0 },
        trap: 'An affected father passes his X to daughters and his Y to sons. Keep “per son” separate from “per child”.' },
    ]}
    explain={{ question: 'Why can a daughter with XᴴXʰ be a carrier in this model?',
      choices: ['She has one usual allele and one recessive variant', 'She inherits a Y that masks the variant'], correct: 0,
      feedback: ['A heterozygous daughter carries the recessive variant. This simplified square models the typical inheritance pattern.',
        'The daughter inherits two X chromosomes. The Xᴴ is the usual allele in this model.'] }}
    formulas={['P = \\frac{matching outcomes}{possible outcomes}', 'X^{H}: usual allele · X^{h}: recessive variant']}>
    {() => <>
      <div class="jp-try-sliders">
        <Select info="The mother's genotype, her two alleles for this trait." label="Mother" value={mother} options={ [['HH', 'XᴴXᴴ'], ['Hh', 'XᴴXʰ (carrier)'], ['hh', 'XʰXʰ']] }
          onChange={(value) => { setMother(value as Mother); clearSquare() }} />
        <Select info="The father's genotype, his two alleles for this trait." label="Father" value={father} options={ [['H', 'XᴴY'], ['h', 'XʰY']] }
          onChange={(value) => { setFather(value as Father); clearSquare() }} />
      </div>
      <div class="jp-try-sliders">
        {[eggs, sperm].map((alleles, group) => {
          const parent = group as Gamete['parent']
          return <div class="jp-pills" role="group" aria-label={parent ? 'Father gametes' : 'Mother gametes'} key={parent}>
            <span class="jp-mode-lead">{parent ? 'Father' : 'Mother'}</span>
            {alleles.map((allele, i) => <button key={i} type="button" class="jp-btn jp-try-allele"
              aria-label={(parent ? 'Father ' : 'Mother ') + geneLabel(allele)}
              aria-pressed={selected?.parent === parent && selected.allele === allele}
              onPointerDown={(event) => {
                if (event.button !== 0 || !event.isPrimary) return
                drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY }
                dragged.current = false
                event.currentTarget.setPointerCapture(event.pointerId)
              }}
              onPointerUp={(event) => {
                const start = drag.current
                drag.current = null
                if (!start || start.id !== event.pointerId || Math.hypot(start.x - event.clientX, start.y - event.clientY) < 8) return
                dragged.current = true
                const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-punnett-cell]')
                if (target) place(Number(target.getAttribute('data-punnett-cell')), { parent, allele })
              }}
              onPointerCancel={() => { drag.current = null }}
              onClick={(event) => {
                if (!dragged.current || !event.detail) select({ parent, allele })
                dragged.current = false
              }}>{renderMathText(gene(allele))}</button>)}
          </div>
        })}
      </div>
      <Scene label="Two gametes meet to give an example offspring" height={42}>
        <path d="M62 27H158M258 27H162" stroke="var(--option-line)" />
        <Travel points={[62, 27, 151, 27]} seconds={2.3}><circle r="4" fill="var(--brand)" /></Travel>
        <Travel points={[258, 27, 169, 27]} seconds={2.3}><circle r="4" fill="var(--memo)" /></Travel>
        <text x="60" y="15" text-anchor="middle">Egg</text>
        <text x="160" y="15" text-anchor="middle">Offspring</text>
        <text x="260" y="15" text-anchor="middle">Sperm</text>
      </Scene>
      <table class="jp-try-square" aria-label="Punnett square. Mother in rows, father in columns.">
        <thead><tr><td />{sperm.map((allele) => <th key={allele} scope="col">{renderMathText(gene(allele))}</th>)}</tr></thead>
        <tbody>{eggs.map((egg, row) => <tr key={row}>
          <th scope="row">{renderMathText(gene(egg))}</th>
          {sperm.map((allele, column) => {
            const i = row * 2 + column
            const filled = cells[i]
            const result = filled === 3 ? outcome(egg, allele) : ''
            return <td key={allele}><button class={'jp-btn' + (result === 'Carrier' ? ' jp-try-balanced' : '')} type="button"
              aria-label={`Row ${row + 1} column ${column + 1}${result ? ' ' + result : ''}`} data-punnett-cell={i} onClick={() => place(i, selected)}>
              {filled ? renderMathText((filled & 1 ? gene(egg) : '□') + (filled & 2 ? gene(allele) : '□')) : 'Add alleles'}
              {result && <small class="jp-try-tick">{result}</small>}
            </button></td>
          })}
        </tr>)}</tbody>
      </table>
      {message && <p class="jp-mode-lead" role="status">{message}</p>}
      <Values items={{ 'Outcomes built': cells.filter((bits) => bits === 3).length + ' / 4', 'Affected · per son': sons + '%', 'Affected · per daughter': daughters + '%', 'Carrier · per daughter': carriers + '%' }} />
    </>}
  </TryIt>
}
