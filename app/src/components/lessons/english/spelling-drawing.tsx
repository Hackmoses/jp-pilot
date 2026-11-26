import type { DrawingProps } from '../lesson'
import { Rows, sceneCode } from './Board'

export default function Spelling({ scene, frame }: DrawingProps) {
  const key = sceneCode(scene.id)
  const rows = key === 's1' ? [{ cells: ['a', 'cc', 'o', 'mm', 'odate'], mark: [1, 3] }]
    : key === 's2' ? [{ cells: ['de', 'b', 't'], hide: [1] }, { cells: ['s', 'ei', 'ze'], mark: [1] }]
    : key === 's3' ? [{ cells: ['sep', 'ar', 'a', 'te'], mark: [2] }, { cells: ['def', 'in', 'i', 'tely'], mark: [2] }]
    : key === 's4' ? [{ cells: ['Double', 'Silent', 'ie / ei'], mark: [0, 1, 2] }, { cells: ['Ending', 'Weak vowel'], mark: [0, 1] }]
    : [{ cells: ['e', 'c', 'l', 'e', 'c', 't', 'i', 'c'], mark: [4, 7] }, { cells: ['e', 'c', 'l', 'e', '·', 't', 'i', 'c'], hide: [4] }]
  return <Rows label={scene.show} frame={frame} rows={rows} />
}
