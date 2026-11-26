import type { DrawingProps } from '../lesson'
import { Rows, sceneCode } from './Board'

export default function Stress({ scene, frame }: DrawingProps) {
  const key = sceneCode(scene.id)
  const rows = key === 'oral-4-s1' ? [{ cells: ['ta', 'ble'], mark: [0] }, { cells: ['win', 'dow'], mark: [0] }]
    : key === 'oral-4-s2' ? [{ cells: ['be', 'gin'], mark: [1] }, { cells: ['ar', 'rive'], mark: [1] }]
    : key === 'oral-4-s3' ? [{ cells: ['pho', 'tog', 'ra', 'phy'], mark: [1] }, { cells: ['pho', 'to', 'graph', 'ic'], mark: [2] }]
    : key === 'oral-4-s4' ? [{ cells: ['re', 'cord'], mark: [0] }, { cells: ['re', 'cord'], mark: [1] }]
    : key === 's1' ? [{ cells: ['a', 'tom', 'ic'], mark: [1] }, { cells: ['black', 'board'], mark: [0] }]
    : key.startsWith('oral-4-q') ? [{ cells: ['ter', 'mi', 'na', 'tion'], mark: [2] }]
    : key === 'oral-5-s2' ? [{ cells: ['She', 'will', 'buy', 'a', 'book'], mark: [0] }, { cells: ['She', 'will', 'buy', 'a', 'book'], mark: [2] }]
    : key === 'oral-5-s3' ? [{ cells: ['She', 'will', 'buy', 'the', 'blue', 'bag'], mark: [4] }]
    : key === 'oral-5-s4' ? [{ cells: ['She', 'will', 'buy', 'a', 'book', 'today'], mark: [5] }]
    : key.startsWith('oral-5-q') ? [{ cells: ['The cat', 'devoured', 'the rat'], mark: [1] }]
    : [{ cells: ['She', 'will', 'buy', 'a', 'book'], mark: [4] }]
  return <Rows frame={frame} label={scene.show} rows={rows.map((row) => ({ ...row, split: true }))} />
}
