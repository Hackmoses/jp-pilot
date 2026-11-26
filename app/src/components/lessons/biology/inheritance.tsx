import type { DrawingProps } from '../lesson'
import { Diagram, Flow, timeline, type Point } from './Diagram'

const stages = [
  ['outline', 'parents', 'pair', 'yellow', 'green'],
  ['split', 'gametes', 'pair', 'top', 'side'],
  ['grid', 'fill', 'upper', 'lower', 'recessive', 'green'],
  ['ratio', 'abo', 'ab'],
]
const targets: Record<string, Point> = {
  outline: [168, 32], parents: [207, 40], pair: [223, 55], yellow: [219, 139], green: [282, 197],
  split: [176, 70], gametes: [150, 86], top: [220, 116], side: [188, 185],
  grid: [213, 125], fill: [219, 151], upper: [275, 151], lower: [219, 193], recessive: [282, 197], ratio: [179, 226], abo: [91, 184], ab: [120, 211], hetero: [274, 139],
}

function Pea({ x, y, green = false }: { x: number; y: number; green?: boolean }) {
  return <g class={green ? 'jp-biology-green-seed' : 'jp-biology-yellow-seed'}>
    <circle cx={x} cy={y} r="7" />
    <path d={'M' + (x - 3) + ' ' + (y + 1) + 'q0 -4 4 -4'} fill="none" />
  </g>
}

export default function Inheritance(props: DrawingProps) {
  const { shown, active, chapter, reduced } = timeline(props, stages)
  const early: Record<string, Point> = { yellow: [125, 170], green: [240, 170], pair: [121, 60] }
  const parentNodes = [[100, 166], [216, 282]]
  const gameteLinks = ['M132 59L100 81','M134 59L166 81','M248 59L216 81','M250 59L282 81']
  const cell = (x: number, y: number, genotype: string) => <g key={genotype + x + y}>
    <Pea x={x} y={y + 10} green={genotype === 'yy'} /><text x={x} y={y - 2}>{genotype}</text>
  </g>
  const point = !reduced && active ? (chapter === 0 && early[active] || targets[active]) : undefined

  return <Diagram label="Yellow pea parents, gamete separation and the four combinations in a Punnett square" point={point}>
    <g text-anchor="middle">
      {parentNodes.map(([left, right], i) => {
        const x = (left + right) / 2
        return <g key={x}>
          <path class="jp-biology-green-seed" d={'M' + (x - 40) + ' 35q24 -23 81 -4q-29 22 -67 14q-9 -2 -14 -10Z'} />
          {shown('parents') && <><text x={x} y="20">Parent {i + 1}</text>
            {[x - 19, x, x + 19].map((seed) => <Pea key={seed} x={seed} y={34} />)}</>}
          {shown('pair') && <text x={x} y="59">Yy</text>}
        </g>
      })}
      {chapter === 0 && !reduced && <>
        {shown('yellow') && <><Pea x={125} y={170} /><text x="125" y="195">Y · yellow</text></>}
        {shown('green') && <><Pea x={240} y={170} green /><text x="240" y="195">y · green</text></>}
      </>}
      {shown('split') && gameteLinks.map((d) => <Flow key={d} d={d} tone="jp-biology-good" seconds={props.frame.seconds}
        moving={!reduced && chapter === 1 && (active === 'split' || active === 'gametes')} />)}
      {shown('gametes') && [100, 166, 216, 282].map((x, i) => <g key={x}>
        <circle class="jp-biology-anatomy" cx={x} cy="91" r="10" /><text x={x} y="96">{i % 2 ? 'y' : 'Y'}</text>
      </g>)}
      {chapter === 1 && shown('top') && <>
        <Flow d="M206 98Q212 99 217 106" tone="jp-biology-good" seconds={props.frame.seconds} moving={!reduced && active === 'top'} />
        <Flow d="M287 98Q281 100 278 106" tone="jp-biology-good" seconds={props.frame.seconds} moving={!reduced && active === 'top'} />
      </>}
      {shown('top') && <><text x="219" y="118">Y</text><text x="275" y="118">y</text></>}
      {chapter === 1 && shown('side') && <>
        <Flow d="M100 102Q99 141 165 141" tone="jp-biology-good" seconds={props.frame.seconds} moving={!reduced && active === 'side'} />
        <Flow d="M166 102Q133 153 168 182" tone="jp-biology-good" seconds={props.frame.seconds} moving={!reduced && active === 'side'} />
      </>}
      {shown('side') && <><text x="180" y="146">Y</text><text x="180" y="188">y</text></>}
      {shown('grid') && <path class="jp-biology-anatomy" d="M191 123H303V207H191ZM247 123V207M191 165H303" />}
      {shown('grid') && <text x="100" y="145">Punnett square</text>}
      {shown('fill') && cell(219, 143, 'YY')}
      {shown('upper') && cell(275, 143, 'Yy')}
      {shown('lower') && cell(219, 185, 'Yy')}
      {shown('recessive') && cell(275, 185, 'yy')}
      {shown('abo') && <g>
        <circle class="jp-biology-anatomy" cx="62" cy="169" r="9" />
        <circle class="jp-biology-anatomy" cx="101" cy="169" r="9" />
        <circle class="jp-biology-anatomy" cx="141" cy="169" r="9" />
        <text x="62" y="174">Iᴬ</text><text x="101" y="174">Iᴮ</text><text x="141" y="174">i</text>
      </g>}
      {shown('ab') && <g>
        <Flow d="M65 181L96 198" tone="jp-biology-good" seconds={props.frame.seconds} moving={!reduced && active === 'ab'} />
        <Flow d="M101 181V197" tone="jp-biology-good" seconds={props.frame.seconds} moving={!reduced && active === 'ab'} />
        <text x="104" y="214">Group AB</text>
      </g>}
      {shown('ratio') && <>
        <Pea x={130} y={225} /><Pea x={150} y={225} /><Pea x={170} y={225} />
        <Pea x={247} y={225} green />
        <text x="150" y="246">3 yellow</text><text x="247" y="246">1 green</text>
      </>}
    </g>
  </Diagram>
}
