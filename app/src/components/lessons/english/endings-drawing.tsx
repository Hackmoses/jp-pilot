import type { DrawingProps } from '../lesson'
import { Rows, sceneCode } from './Board'

export default function Endings({ scene, frame }: DrawingProps) {
  const key = sceneCode(scene.id)
  const examples = key === 's1' ? [['drink', 'able'], ['flex', 'ible']]
    : key === 's2' ? [['hesit', 'ant'], ['assist', 'ance'], ['confid', 'ent'], ['confid', 'ence']]
    : key === 's3' ? [['inven', 'tion'], ['deci', 'sion'], ['musi', 'cian']]
    : key === 's4' ? [['colour', 'centre'], ['travelled', 'programme'], ['organise', 'organize'], ['analyse', 'paralyse']]
    : [['pronounce'], ['pronun', 'ciation']]
  return <Rows frame={frame} label={scene.show} rows={examples.map((cells) => ({ cells, mark: key === 's4' ? [0, 1] : [1] }))} />
}
