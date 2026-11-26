import type { DrawingProps } from '../lesson'
import { Rows, sceneCode } from './Board'

export default function Pairs({ scene, frame }: DrawingProps) {
  const key = sceneCode(scene.id)
  const rows = key === 's1' ? [['principal', 'school head'], ['principle', 'rule'], ['stationary', 'still'], ['stationery', 'paper']]
    : key === 's2' ? [['affect', 'change'], ['effect', 'result'], ['their', 'there', 'they’re']]
    : key === 's4' ? [['advice', 'noun'], ['advise', 'verb']]
    : [['complement', 'go with'], ['compliment', 'praise']]
  return <Rows frame={frame} label={scene.show} rows={rows.map((cells) => ({ cells, mark: [1] }))} />
}
