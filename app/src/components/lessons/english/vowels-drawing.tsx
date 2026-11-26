import type { DrawingProps } from '../lesson'
import { Board, Rows, examples, reveal, sceneCode } from './Board'

const contrasts = [
  [['bird · nurse · shirt', 'bed · red'], ['ɜː', 'e']], [['seat · sheep · beat', 'sit · ship · bit'], ['iː', 'ɪ']],
  [['fool · pool · food', 'full · pull · good'], ['uː', 'ʊ']], [['cup · cut', 'cap · cat'], ['ʌ', 'æ']],
  [['cot · pot · hot', 'caught · port · heart'], ['ɒ', 'ɔː / ɑː']], [['about · ago', 'again · alone'], ['ə', 'ə']],
]
export default function Vowels(props: DrawingProps) {
  const { scene, frame } = props
  const key = sceneCode(scene.id)
  if (key === 's1') return <Rows label={scene.show} frame={frame} rows={[
    { cells: ['see', 'sea', 'field', 'receive', 'theme'], mark: [0, 1, 2, 3, 4] }, { cells: ['/iː/'], mark: [0] },
  ]} />
  const contrast = key.startsWith('oral-1-s') ? contrasts[Number(key.split('s')[1]) - 1] : undefined
  const glides = key.startsWith('oral-2')
  const amount = reveal(frame)
  const active = frame.reduced ? Number(amount > 0) : Math.floor(frame.seconds / 2) % 2
  const items = contrast?.[0] ?? examples(props).slice(0, 4)
  return <Board label={scene.show} height={122}>
    <path d="M111 48 Q180 11 249 48 Q180 85 111 48Z" fill="var(--brand-soft)" stroke="var(--brand)" />
    <path d={`M130 50 Q180 ${49 + active * 11} 229 48`} class="guide" fill="none" />
    <circle cx={glides ? 137 + 79 * amount : 161 + active * 36} cy={48 + active * 7} r={6 + active * 2} class="accent-fill" />
    {key === 'oral-1-s5' && <g class="accent" stroke-width="3"><path d={`M54 71 h${40 * amount} M217 71 h${84 * amount}`} /></g>}
    {items.map((word, i) => <g key={word} transform={`translate(${360 * (i + .5) / items.length} 91)`}>
      <text text-anchor="middle" fill="currentColor" font-weight={active === i && amount > 0 ? 700 : 400}>{word}</text>
      {contrast && <text text-anchor="middle" y="21">/{contrast[1][i]}/</text>}
    </g>)}
  </Board>
}
