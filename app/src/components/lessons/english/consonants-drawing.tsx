import type { DrawingProps } from '../lesson'
import { Board, Rows, reveal, sceneCode } from './Board'

export default function Consonants({ scene, frame }: DrawingProps) {
  const key = sceneCode(scene.id)
  if (key === 'oral-3-s4') return <Rows frame={frame} label={scene.show} rows={[
    { cells: ['k', 'nife'], hide: [0] }, { cells: ['w', 'rite'], hide: [0] },
    { cells: ['lam', 'b'], hide: [1] }, { cells: ['si', 'g', 'n'], hide: [1] },
  ]} />
  if (key === 'oral-3-s5') return <Rows frame={frame} label={scene.show} rows={[
    { cells: ['h', 'onest'], hide: [0] }, { cells: ['h', 'our'], hide: [0] },
    { cells: ['cas', 't', 'le'], hide: [1] }, { cells: ['lis', 't', 'en'], hide: [1] },
    { cells: ['whis', 't', 'le'], hide: [1] },
  ]} />
  if (key === 's1') return <Rows frame={frame} label={scene.show} rows={[
    { cells: ['cat /k/', 'city /s/'], mark: [0, 1] }, { cells: ['goat /ɡ/', 'giant /dʒ/'], mark: [0, 1] },
    { cells: ['de', 'b', 't'], hide: [1] }, { cells: ['p', 'sychology'], hide: [0] },
  ]} />
  const voiced = key === 'oral-3-s2'
  const closure = key.endsWith('s3') || key.endsWith('q2')
  const amount = reveal(frame)
  const words = voiced ? ['then', 'den'] : key.endsWith('s1') ? ['thin', 'tin']
    : key.includes('-q') ? ['mention', 'machine'] : ['shoe', 'chew']
  return <Board label={scene.show} height={114}>
    <path d="M102 40 Q165 13 223 38 L241 51 Q161 77 102 62" stroke="var(--brand)" fill="var(--brand-soft)" />
    <path d="M115 58 Q147 62 184 44 L202 38" stroke="currentColor" fill="none" />
    <path d="M221 33 v13 m8 -12 v12" stroke="currentColor" />
    <path d={closure && amount < .45 ? 'M128 48 H211' : 'M128 48 H263'} stroke="var(--brand)" stroke-width="3"
      stroke-dasharray="7 6" stroke-dashoffset={-frame.seconds * 34} />
    {voiced && <circle cx="124" cy="62" r={5 + amount * 4} class="accent-fill" />}
    {words.map((word, i) => <text key={word} x={124 + i * 112} y="96" text-anchor="middle">{word}</text>)}
  </Board>
}
