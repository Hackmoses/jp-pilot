import type { DrawingProps } from '../lesson'
import { Rows, sceneCode } from './Board'

export default function Rules({ scene, frame }: DrawingProps) {
  const key = sceneCode(scene.id)
  const rows = key === 's1'
    ? [{ cells: ['r', 'u', 'n', '+ ing'] }, { cells: ['r', 'u', 'n', 'n', 'ing'], mark: [2, 3], appear: [3] }]
    : key === 's2' ? [{ cells: ['mak', 'e', '+ ing'], hide: [1] }, { cells: ['mak', 'ing'], mark: [1] }]
    : key === 's3' ? [{ cells: ['happ', 'y', '+ ness'], hide: [1] }, { cells: ['happ', 'i', 'ness'], mark: [1] }]
    : key === 's4' ? [{ cells: ['br', 'ie', 'f'], mark: [1] }, { cells: ['rec', 'ei', 've'], mark: [1] }, { cells: ['help', 'ful'], mark: [1] }]
    : [{ cells: ['s', 'ei', 'ze'], mark: [1] }, { cells: ['s', 'ie', 'ze'], hide: [1] }]
  return <Rows frame={frame} label={scene.show} rows={rows} />
}
