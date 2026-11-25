import { useState } from 'preact/hooks'
import bank from '../../../maths-bank/questions-maths-jamb-figures.json'
import { Figure } from '../components/figures/Figure'
import type { FigureData } from '../components/figures/spec'
import { QuestionCard } from '../components/question/QuestionCard'
import { registerSavedQuestions } from '../lib/data'
import { renderMathText } from '../lib/mathText'
import type { OptionId, Question } from '../lib/types'
import { Panel } from './Modes'

const examples: [string, FigureData][] = [
  ['Venn', {
    type: 'venn',
    alt: 'Three circles P, Q and R. The region outside all circles, the part in P only, and the part shared only by P and Q are shaded.',
    spec: { sets: ['P', 'Q', 'R'], shaded: [[], ['P'], ['P', 'Q']], universe: 'U' },
  }],
  ['Graph', {
    type: 'graph',
    alt: 'Velocity rises from zero to four metres per second at four seconds, then stays constant through eight seconds. The area under that horizontal segment is shaded. A separate curve rises through three plotted values.',
    spec: {
      x: { range: [0, 8], label: 'Time', unit: 's' },
      y: { range: [0, 6], label: 'Velocity', unit: 'm s^{-1}' },
      grid: true,
      lines: [[[0, 0], [4, 4]], [[4, 4], [8, 4]]],
      curves: [[[0, 0], [2, .5], [4, 1.5], [7, 3]]],
      points: [{ at: [4, 4], label: 'A' }],
      shaded: [[[4, 0], [4, 4], [8, 4], [8, 0]]],
    },
  }],
  ['Bar chart', {
    type: 'chart', alt: 'Books read on Monday, Tuesday and Wednesday: 4, 6 and 3, respectively.',
    spec: { kind: 'bar', yLabel: 'Books read', bars: [
      { label: 'Mon', value: 4 }, { label: 'Tue', value: 6 }, { label: 'Wed', value: 3 },
    ] },
  }],
  ['Pie chart', {
    type: 'chart', alt: 'A pie chart showing football 50 percent, running 25 percent and swimming 25 percent.',
    spec: { kind: 'pie', unit: '%', slices: [
      { label: 'Football', value: 50 }, { label: 'Running', value: 25 }, { label: 'Swimming', value: 25 },
    ] },
  }],
  ['Histogram', {
    type: 'chart', alt: 'Histogram of times. The bins from 0 to 10, 10 to 20 and 20 to 40 seconds have heights 2, 4 and 1.',
    spec: { kind: 'histogram', xLabel: 'Time (s)', yLabel: 'Frequency density', bins: [
      { from: 0, to: 10, height: 2 }, { from: 10, to: 20, height: 4 }, { from: 20, to: 40, height: 1 },
    ] },
  }],
  ['Table', {
    type: 'table', alt: 'Frequency table. Scores one half, one and two have frequencies 2, 5 and 3 respectively.',
    spec: { headers: ['Score', 'Frequency'], rows: [['\\frac{1}{2}', '2'], ['1', '5'], ['2', '3']] },
  }],
  ['Circuit', {
    type: 'circuit',
    alt: 'A cell, switch and ammeter feed a resistor, bulb and capacitor in series. A voltmeter is wired in parallel across the resistor.',
    spec: {
      size: [6, 3], wires: [[[0, 0], [6, 0], [6, 3], [0, 3], [0, 0]], [[1, 3], [1, 2], [3, 2], [3, 3]]],
      junctions: [[1, 3], [3, 3]],
      parts: [
        { kind: 'cell', at: [1, 0] }, { kind: 'switch', at: [3, 0], closed: true },
        { kind: 'ammeter', at: [5, 0] }, { kind: 'resistor', at: [2, 3], label: 'R_{1}' },
        { kind: 'bulb', at: [4, 3] }, { kind: 'capacitor', at: [5, 3] },
        { kind: 'voltmeter', at: [2, 2] },
      ],
    },
  }],
  ['Rays', {
    type: 'rays', alt: 'Two rays from an upright object cross on the other side of a convex lens to form an inverted image.',
    spec: {
      optic: 'lens', shape: 'convex',
      focalPoints: [{ at: [105, 90], label: 'F_{1}' }, { at: [215, 90], label: 'F_{2}' }],
      object: { from: [50, 90], to: [50, 48], label: 'Object' },
      image: { from: [270, 90], to: [270, 132], label: 'Image' },
      rays: [{ points: [[50, 48], [160, 48], [270, 132]] }, { points: [[50, 48], [270, 132]] }],
    },
  }],
  ['Geometry', {
    type: 'geometry', alt: 'Triangle ABC inscribed in a circle. An arc marks the angle at vertex A.',
    spec: {
      circles: [{ centre: [160, 92], radius: 66 }],
      polygons: [[[106, 130], [160, 26], [214, 130]]],
      angles: [{ vertex: [106, 130], from: [214, 130], to: [160, 26], label: 'θ' }],
      points: [
        { at: [106, 130], label: 'A', labelAt: [92, 140] },
        { at: [160, 26], label: 'B' },
        { at: [214, 130], label: 'C', labelAt: [228, 140] },
      ],
    },
  }],
  ['Hand-made SVG', {
    type: 'svg', src: 'figures/number-line.svg',
    alt: 'Number line with an open circle at minus one and a closed circle at one. The line between them is highlighted.',
  }],
]

const questions = bank.questions as unknown as Question[]

function PreviewQuestion({ question }: { question: Question }) {
  const [pickedId, setPickedId] = useState<OptionId | null>(null)
  return (
    <section aria-label={'JAMB 2010 question ' + (typeof question.source === 'object' && question.source.id)}>
      <h3 class="jp-revisit-title">2010 · Question {typeof question.source === 'object' && question.source.id}</h3>
      <QuestionCard question={question} review={false} options={question.options} pickedId={pickedId} onPick={setPickedId} />
    </section>
  )
}

export function FiguresDemo() {
  useState(() => registerSavedQuestions(questions, []))
  return (
    <Panel title="Figures demo">
      <div class="jp-mode-list">
        {examples.map(([title, data]) => <section key={title} class="jp-card">
          <h2 class="jp-revisit-title">{title}</h2>
          <Figure data={data} />
        </section>)}
        <section class="jp-card">
          <h2 class="jp-revisit-title">Matrix and determinant</h2>
          <p>{renderMathText('\\matrix{1,\\frac{1}{2};x_{1},4} and \\det{2,0,5;4,6,3;8,9,1}')}</p>
        </section>
        <h2 class="jp-revisit-title">Maths bank preview</h2>
        {questions.map((question) => <PreviewQuestion key={question.id} question={question} />)}
      </div>
    </Panel>
  )
}
