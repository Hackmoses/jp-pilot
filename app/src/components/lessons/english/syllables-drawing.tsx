import type { DrawingProps } from '../lesson'
import { Rows, sceneCode } from './Board'

export default function Syllables({ scene, frame }: DrawingProps) {
  const key = sceneCode(scene.id)
  const rows = key === 's1' ? [{ cells: ['cake'], mark: [0] }, { cells: ['sys', 'tem'], mark: [0, 1], split: true }]
    : key === 's2' ? [{ cells: ['sɪs', 'təm'], mark: [0], split: true }, { cells: ['dɪ', 'skraɪb'], mark: [1], split: true }]
    : key === 's3' ? ['ac/tion', 'vi/sion', 'pic/ture'].map((word) => ({ cells: word.split('/'), mark: [1], split: true }))
    : key === 's4' ? [{ cells: ['c', 'a', 'k', 'e'], hide: [3] }, { cells: ['rec', 'i', 'pe'], mark: [2], split: true }]
    : [{ cells: ['mad', 'am'], mark: [0], split: true }, { cells: ['eigh', 'teen'], mark: [1], split: true }]
  return <Rows frame={frame} label={scene.show} rows={rows} />
}
