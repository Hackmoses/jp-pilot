import type { DrawingProps } from '../lesson'
import { Rows, sceneCode } from './Board'

export default function Letters(props: DrawingProps) {
  const { scene, frame } = props
  const key = sceneCode(scene.id)
  const rows = key === 's1' ? [
    { cells: ['b', 'o', 'x'] }, { cells: ['/b/', '/ɒ/', '/k/', '/s/'], mark: [2, 3], split: true },
  ] : key === 's2' ? [{ cells: ['system', 'UK', '/ˈsɪs.təm/'], mark: [1, 2] }]
    : key === 's3' ? [{ cells: ['ˈsɪs', '.', 'təm'], mark: [0, 1], split: true },
      { cells: ['sə', 'ˈpraɪz'], mark: [1], split: true }, { cells: ['ˌriː', 'ˈtel'], mark: [1], split: true }]
    : key === 's4' ? [{ cells: ['Headword', 'UK pronunciation'], mark: [1] }]
    : [{ cells: ['indict', '/ɪnˈdaɪt/'], mark: [1] }, { cells: ['bright', 'fish', 'pick', 'brick'], mark: key.endsWith('q2') ? [0] : [] }]
  return <Rows frame={frame} label={scene.show} rows={rows} />
}
